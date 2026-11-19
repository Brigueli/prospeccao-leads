'use strict';
const cheerio = require('cheerio');
const { safeFetch } = require('./net');
const { normalizePhone } = require('./phone');
const { norm, truncateWords } = require('./util');

const SUBPAGE = /(contato|contact|fale-conosco|sobre|quem-somos|institucional|servicos|servi%C3%A7os|serviços|tratamentos|especialidades|produtos|solucoes)/i;
const GENERIC_HEADING = /^(home|inicio|início|menu|contato|fale conosco|sobre|blog|entrar|login|buscar|pesquisar|siga-nos|redes sociais|newsletter|whatsapp|©.*|todos os direitos.*)$/i;
const PHONE_TEXT = /(?:\+?55\s?)?\(?\b\d{2}\)?[\s.-]?9?\d{4}[\s.-]?\d{4}\b/g;

// robots.txt simples: respeita "Disallow" do user-agent * para os caminhos que vamos abrir.
async function allowedByRobots(url) {
  try {
    const u = new URL(url);
    const r = await safeFetch(`${u.origin}/robots.txt`, { timeout: 4000, maxBytes: 100_000, accept: 'text/plain' });
    if (r.status !== 200 || !/text\/plain|text\/html|application\/octet/i.test(r.contentType + 'text/plain')) return true;
    let applies = false;
    const rules = [];
    for (const raw of r.body.split(/\r?\n/)) {
      const line = raw.replace(/#.*/, '').trim();
      const m = /^([a-z-]+)\s*:\s*(.*)$/i.exec(line);
      if (!m) continue;
      const k = m[1].toLowerCase();
      if (k === 'user-agent') applies = m[2].trim() === '*';
      else if (applies && k === 'disallow' && m[2].trim()) rules.push(m[2].trim());
    }
    return !rules.some((p) => p === '/' || u.pathname.startsWith(p.replace(/\*.*$/, '')));
  } catch { return true; }
}

function parsePage(html, url) {
  const $ = cheerio.load(html);
  const title = $('title').first().text().replace(/\s+/g, ' ').trim();
  const description = ($('meta[name="description"]').attr('content') || $('meta[property="og:description"]').attr('content') || '').replace(/\s+/g, ' ').trim();
  const siteName = ($('meta[property="og:site_name"]').attr('content') || '').trim();

  const waPhones = new Set();
  const telPhones = new Set();
  const links = [];
  $('a[href]').each((_, a) => {
    const href = String($(a).attr('href') || '');
    if (/^tel:/i.test(href)) telPhones.add(decodeURIComponent(href.slice(4)));
    else if (/(wa\.me\/|api\.whatsapp\.com\/send|web\.whatsapp\.com\/send|whatsapp:\/\/send)/i.test(href)) {
      const m = /(?:wa\.me\/|phone=)(\+?\d{8,15})/i.exec(href);
      if (m) waPhones.add(m[1]);
    } else links.push(href);
  });

  const ld = [];
  $('script[type="application/ld+json"]').each((_, s) => {
    try {
      const j = JSON.parse($(s).text());
      for (const o of Array.isArray(j) ? j : (j['@graph'] || [j])) ld.push(o);
    } catch { /* json-ld inválido: ignora */ }
  });
  const business = ld.find((o) => /LocalBusiness|Organization|Dentist|Store|Restaurant|MedicalBusiness|ProfessionalService/i.test(JSON.stringify(o['@type'] || '')));
  if (business && business.telephone) telPhones.add(String(business.telephone));

  const headings = [];
  $('h1,h2,h3').each((_, h) => {
    const t = $(h).text().replace(/\s+/g, ' ').trim();
    if (t.length >= 4 && t.length <= 90 && !GENERIC_HEADING.test(t) && !headings.includes(t)) headings.push(t);
  });

  $('script,style,noscript,svg,iframe').remove();
  const text = $('body').text().replace(/\s+/g, ' ').trim().slice(0, 12000);
  const textPhones = [...text.matchAll(PHONE_TEXT)].map((m) => m[0]).slice(0, 6);

  return { url, title, description: description || (business && business.description) || '', siteName, headings: headings.slice(0, 12), text, waPhones: [...waPhones], telPhones: [...telPhones], textPhones, links, business };
}

/**
 * Lê a página inicial e até 2 páginas internas relevantes (contato/sobre/serviços).
 * Nunca lança: devolve { error } e preserva o que foi lido.
 */
async function researchSite(website, { fetchImpl } = {}) {
  const out = { pages: [], error: '' };
  if (!website) { out.error = 'Sem site informado.'; return out; }
  try {
    if (!(await allowedByRobots(website))) { out.error = 'O robots.txt do site pede para não ser lido automaticamente.'; return out; }
    const first = await (fetchImpl || safeFetch)(website);
    if (first.status >= 400) { out.error = `O site respondeu HTTP ${first.status}.`; return out; }
    if (!/html|xml/i.test(first.contentType || 'text/html')) { out.error = 'O endereço não devolveu uma página HTML.'; return out; }
    const home = parsePage(first.body, first.url);
    out.pages.push(home);

    const origin = new URL(first.url).origin;
    const seen = new Set([first.url]);
    const subs = [];
    for (const href of home.links) {
      try {
        const u = new URL(href, first.url);
        if (u.origin !== origin || seen.has(u.href) || !SUBPAGE.test(u.pathname)) continue;
        seen.add(u.href); subs.push(u.href);
      } catch { /* href inválido */ }
      if (subs.length >= 2) break;
    }
    for (const s of subs) {
      try {
        if (!(await allowedByRobots(s))) continue;
        const r = await (fetchImpl || safeFetch)(s);
        if (r.status < 400 && /html/i.test(r.contentType || 'text/html')) out.pages.push(parsePage(r.body, r.url));
      } catch { /* página interna opcional */ }
    }
  } catch (e) {
    out.error = `Não consegui ler o site (${e.name === 'TimeoutError' ? 'tempo esgotado' : e.message}).`;
  }
  return out;
}

const SIGNALS = [
  { re: /agende (sua|uma)|agendamento online|marque (sua|uma) (consulta|hora|avalia)|agendar online/, text: 'O site oferece agendamento/marcação de horário.', short: 'vocês já oferecem agendamento pelo site' },
  { re: /solicite (um |seu )?or[cç]amento|pe[cç]a (um |seu )?or[cç]amento|or[cç]amento gr[aá]tis|or[cç]amento sem compromisso/, text: 'O site convida a pedir orçamento.', short: 'vocês convidam o cliente a pedir orçamento pelo site' },
  { re: /adicionar ao carrinho|comprar agora|loja online|nossa loja virtual/, text: 'O site tem loja/venda online.', short: 'vocês vendem online pelo site' },
];

function pageLabel(url) { try { return new URL(url).hostname.replace(/^www\./, ''); } catch { return url; } }

/**
 * Converte o que foi lido em FATOS (com fonte pública) e HIPÓTESES (não confirmadas).
 * `discovery` traz dados vindos do provedor (ex.: Google Places) com sua própria fonte.
 */
function buildEvidence({ campaign, lead, research, discovery }) {
  const facts = [];
  const hypotheses = [];
  const sources = [];
  const addSource = (url, label) => { if (url && !sources.some((s) => s.url === url)) sources.push({ url, label }); };

  if (discovery && discovery.sourceUrl) {
    addSource(discovery.sourceUrl, discovery.sourceLabel || 'Fonte de descoberta');
    if (discovery.withFact && (discovery.primaryType || lead.address)) {
      const where = lead.address || lead.city;
      facts.push({
        kind: 'cadastro', text: `Listada em ${discovery.sourceLabel || 'fonte de descoberta'}${discovery.primaryType ? ` como "${discovery.primaryType}"` : ''}${where ? `, ${where}` : ''}.`,
        short: lead.city ? `vocês atuam em ${lead.city}${discovery.primaryType ? ` como ${discovery.primaryType.toLowerCase()}` : ''}` : '',
        source_url: discovery.sourceUrl, source_label: discovery.sourceLabel || 'Fonte de descoberta',
      });
    }
  }

  const pages = (research && research.pages) || [];
  const home = pages[0];
  let siteWa = false;
  let sitePhones = [];
  for (const p of pages) {
    addSource(p.url, `Site da empresa (${pageLabel(p.url)})`);
    if (p.waPhones.length) siteWa = true;
    sitePhones = sitePhones.concat(p.waPhones, p.telPhones);
  }
  if (home) {
    const label = `Site da empresa (${pageLabel(home.url)})`;
    const desc = home.description || (home.business && home.business.description) || '';
    if (desc && desc.length >= 20) {
      const snip = truncateWords(desc, 110).replace(/[.!?]+$/, '');
      facts.push({ kind: 'servico', text: `O site descreve a empresa: "${truncateWords(desc, 220)}"`, short: `vocês destacam “${snip}”`, source_url: home.url, source_label: label });
    } else if (home.headings.length) {
      const h = home.headings[0];
      facts.push({ kind: 'servico', text: `O site se apresenta com o título "${h}".`, short: `vocês se apresentam como “${h.replace(/[.!?]+$/, '')}”`, source_url: home.url, source_label: label });
    }
    const allText = norm(pages.map((p) => p.text).join(' '));
    for (const s of SIGNALS) {
      if (s.re.test(allText)) facts.push({ kind: 'sinal', text: s.text, short: s.short, source_url: home.url, source_label: label });
    }
    if (siteWa) facts.push({ kind: 'contato', text: 'O site publica um botão/link de WhatsApp.', short: 'vocês já divulgam o WhatsApp no site', source_url: home.url, source_label: label });

    if (!siteWa) hypotheses.push({ text: 'Não encontrei link de WhatsApp no site; o atendimento por mensagem pode estar em outro canal (hipótese, a confirmar na conversa).', basis: 'Ausência de dado no site lido' });
    if (!facts.some((f) => f.kind === 'sinal' && /agend/.test(f.text))) {
      if (/agend|marca|reserv/i.test(`${campaign.offer} ${campaign.problem}`)) {
        hypotheses.push({ text: 'Não encontrei agendamento online no site; pode haver espaço para a oferta (hipótese, a confirmar).', basis: 'Ausência de dado no site lido' });
      }
    }
  } else if (research && research.error) {
    hypotheses.push({ text: `Sem leitura do site: ${research.error} Nada foi presumido a partir dele.`, basis: 'Falha ou ausência de fonte' });
  }

  if (campaign.problem) {
    hypotheses.push({ text: `Empresas desse segmento podem ter o problema "${campaign.problem}" (hipótese de mercado: não é um fato sobre esta empresa).`, basis: 'Perfil da campanha' });
  }

  return { facts, hypotheses, sources, sitePhones, siteText: pages.map((p) => `${p.title} ${p.description} ${p.headings.join(' ')} ${p.text.slice(0, 3000)}`).join(' ') };
}

// Escolhe o melhor telefone comercial publicado no site (prioriza WhatsApp > tel: > texto).
function pickPublishedPhone(research) {
  for (const key of ['waPhones', 'telPhones', 'textPhones']) {
    for (const p of (research.pages || []).flatMap((pg) => pg[key])) {
      const n = normalizePhone(p);
      if (n) return { raw: p, norm: n, where: key === 'waPhones' ? 'link de WhatsApp do site' : key === 'telPhones' ? 'link de telefone do site' : 'texto do site' };
    }
  }
  return null;
}

module.exports = { researchSite, buildEvidence, pickPublishedPhone, parsePage };
