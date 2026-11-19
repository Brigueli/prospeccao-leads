'use strict';

const FIELDS = [
  'places.id', 'places.displayName', 'places.formattedAddress', 'places.addressComponents',
  'places.nationalPhoneNumber', 'places.internationalPhoneNumber', 'places.websiteUri',
  'places.googleMapsUri', 'places.primaryTypeDisplayName', 'places.businessStatus', 'nextPageToken',
].join(',');

function friendly(status, apiMsg) {
  const m = apiMsg ? ` Detalhe do Google: ${apiMsg}` : '';
  if (status === 400) return `O Google Places recusou a busca (requisição inválida).${m}`;
  if (status === 401 || status === 403) return `O Google Places recusou a chave (HTTP ${status}). Confira se a GOOGLE_PLACES_API_KEY está correta, se "Places API (New)" está ativada no projeto e se o faturamento está habilitado.${m}`;
  if (status === 429) return `Limite de uso do Google Places atingido (HTTP 429). Tente de novo mais tarde.${m}`;
  return `O Google Places respondeu HTTP ${status}.${m}`;
}

function cityOf(components) {
  const c = (components || []);
  const pick = (type) => (c.find((x) => (x.types || []).includes(type)) || {}).longText;
  return pick('locality') || pick('administrative_area_level_2') || pick('sublocality') || '';
}

/** Gera candidatos, página a página. Erros viram exceções com mensagem clara (o executor preserva o que já foi salvo). */
async function* searchPlaces({ query, maxPages = 3, apiKey = process.env.GOOGLE_PLACES_API_KEY, baseUrl = process.env.GOOGLE_PLACES_BASE_URL || 'https://places.googleapis.com' }) {
  if (!apiKey) throw new Error('GOOGLE_PLACES_API_KEY não está configurada. Edite o arquivo .env (veja o README) ou use a importação de CSV.');
  let pageToken;
  for (let page = 0; page < maxPages; page++) {
    let res;
    try {
      res = await fetch(`${baseUrl}/v1/places:searchText`, {
        method: 'POST',
        signal: AbortSignal.timeout(20000),
        headers: { 'content-type': 'application/json', 'X-Goog-Api-Key': apiKey, 'X-Goog-FieldMask': FIELDS },
        body: JSON.stringify({ textQuery: query, languageCode: 'pt-BR', regionCode: 'BR', pageSize: 20, ...(pageToken ? { pageToken } : {}) }),
      });
    } catch (e) {
      throw new Error(`Não consegui falar com o Google Places (${e.name === 'TimeoutError' ? 'tempo esgotado' : e.message}). Verifique a conexão.`);
    }
    const body = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(friendly(res.status, body.error && body.error.message));
    for (const p of body.places || []) {
      yield {
        name: (p.displayName && p.displayName.text) || '',
        segment: (p.primaryTypeDisplayName && p.primaryTypeDisplayName.text) || '',
        primaryType: (p.primaryTypeDisplayName && p.primaryTypeDisplayName.text) || '',
        city: cityOf(p.addressComponents),
        address: p.formattedAddress || '',
        website: p.websiteUri || '',
        phone: p.nationalPhoneNumber || p.internationalPhoneNumber || '',
        sourceUrl: p.googleMapsUri || '',
        sourceLabel: 'Google Maps (Places API)',
        closed: !!p.businessStatus && p.businessStatus !== 'OPERATIONAL',
        origin: 'google_places',
      };
    }
    pageToken = body.nextPageToken;
    if (!pageToken) return;
  }
}

module.exports = { searchPlaces };
