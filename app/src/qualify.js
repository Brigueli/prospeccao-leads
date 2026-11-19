'use strict';
const { norm, tokens, prefix } = require('./util');

function splitCriteria(s) {
  return String(s || '').split(/[\n;]+/).map((x) => norm(x)).filter((x) => x.length >= 3);
}

function hit(textPrefixes, toks) { return toks.filter((t) => textPrefixes.has(prefix(t))); }

// Palavras originais (com acento) do campo, para citar na justificativa.
function original(text, tok) {
  const w = String(text || '').split(/[^\p{L}\p{N}]+/u).find((x) => norm(x) === tok);
  return w || tok;
}

// O segmento só conta como confirmado se o termo mais específico (o mais longo) aparecer
// e ao menos metade dos termos casar. Evita que "clínica" sozinha confirme "clínica odontológica".
function segmentMatch(segToks, prefixes) {
  const hits = hit(prefixes, segToks);
  if (!segToks.length || !hits.length) return [];
  const longest = [...segToks].sort((a, b) => b.length - a.length)[0];
  if (!hits.includes(longest) || hits.length < Math.ceil(segToks.length / 2)) return [];
  return hits;
}

/**
 * Regras explícitas e explicáveis (sem "nota" opaca):
 *  - fora do perfil: bate em critério de descarte, ou o segmento do lead não tem nada a ver com o da campanha.
 *  - bom encaixe: segmento confirmado em fonte + região compatível + ao menos um fato com fonte pública.
 *  - precisa de revisão: todo o resto, com a lacuna principal descrita.
 */
function qualify(campaign, lead, evidence) {
  const own = norm(`${lead.name} ${lead.segment} ${lead.note}`);
  const site = norm(evidence.siteText || '');
  const all = `${own} ${site}`;

  for (const c of splitCriteria(campaign.discard_criteria)) {
    if (all.includes(c)) {
      return { classification: 'fora do perfil', reason: `Bate com o critério de descarte "${c}" nas informações coletadas.` };
    }
  }

  const prefixes = new Set(all.split(/[^a-z0-9]+/).filter((t) => t.length >= 4).map(prefix));
  const segToks = tokens(campaign.segment);
  const profToks = tokens(campaign.profile);
  const segHit = segmentMatch(segToks, prefixes);
  const sitePrefixes = new Set(site.split(/[^a-z0-9]+/).filter((t) => t.length >= 4).map(prefix));
  const segInSite = segHit.some((t) => sitePrefixes.has(prefix(t)));
  const segWords = segHit.map((t) => original(campaign.segment, t));
  const profHit = hit(prefixes, profToks);

  if (lead.segment && segToks.length) {
    const leadSegPrefixes = new Set(tokens(lead.segment).map(prefix));
    const overlap = segToks.some((t) => leadSegPrefixes.has(prefix(t)));
    if (!overlap && segHit.length === 0 && !hit(prefixes, segToks).length) {
      return { classification: 'fora do perfil', reason: `O segmento informado ("${lead.segment}") não tem relação com "${campaign.segment}" e nada nas fontes indica o contrário.` };
    }
  }

  const regionToks = tokens(campaign.region);
  const cityN = norm(lead.city);
  let region = 'desconhecida';
  if (cityN && regionToks.length) region = regionToks.some((t) => cityN.includes(t) || norm(`${lead.address}`).includes(t)) ? 'ok' : 'fora';

  const publicFacts = (evidence.facts || []).filter((f) => /^https?:/.test(f.source_url));
  const hasPublicRead = publicFacts.some((f) => f.kind !== 'cadastro');

  if (!segToks.length || segHit.length === 0) {
    return { classification: 'precisa de revisão', reason: `Não encontrei sinais claros do segmento "${campaign.segment}" nas fontes lidas; confira antes de abordar.` };
  }
  if (region === 'fora') {
    return { classification: 'precisa de revisão', reason: `O segmento combina (${segWords.join(', ')}), mas a cidade "${lead.city}" parece estar fora da região "${campaign.region}".` };
  }
  if (!publicFacts.length) {
    return { classification: 'precisa de revisão', reason: 'O segmento combina, mas não há fonte pública lida para confirmar detalhes da empresa.' };
  }
  const where = region === 'ok' ? ` em ${lead.city}` : '';
  const extra = profHit.length ? ` e há sinais do perfil buscado (${profHit.slice(0, 2).map((t) => original(campaign.profile, t)).join(', ')})` : '';
  const base = segInSite && hasPublicRead ? `o site menciona "${segWords.join('", "')}"` : `o nome/segmento informado indica "${segWords.join('", "')}"`;
  return { classification: 'bom encaixe', reason: `Atua no segmento "${campaign.segment}"${where} (${base})${extra}, sem bater em critérios de descarte.` };
}

module.exports = { qualify, splitCriteria };
