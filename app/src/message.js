'use strict';
const { truncateWords, norm } = require('./util');

const URGENCY = /(última chance|ultima chance|só hoje|so hoje|corra|oferta limitada|imperd[ií]vel|garanta j[aá]|vagas? limitadas?|por tempo limitado|[uú]ltimas? (vagas|unidades)|aproveite agora|s[oó] at[eé] (amanh|sexta|hoje))/i;
const FAKE_FAMILIARITY = /(j[aá] (usei|usamos|fui cliente|conheço|conhecemos)|conheço (a |o |muito|vocês)|conhecemos (a |o |vocês)|sou (seu )?cliente|usei (o |os )?(servi[cç]os?|produtos?)|identifiquei (um |o )?problema|notei (um |o )?problema|percebi que vocês (têm|tem|estão|estao|perdem|não|nao)|vi que vocês (perdem|têm problemas|tem problemas))/i;
const GENERIC_PRAISE = /(empresa (incr[ií]vel|maravilhosa|refer[eê]ncia)|parab[eé]ns pel[oa]|admiro (muito )?|trabalho (incr[ií]vel|maravilhoso)|excelente trabalho)/i;

/** Avisos (não bloqueiam) sobre trechos que o usuário pediu para evitar. */
function checkMessage(text) {
  const w = [];
  const t = String(text || '').trim();
  if (!t) w.push('A mensagem está vazia.');
  if (t.length > 520) w.push(`Mensagem longa (${t.length} caracteres); primeira mensagem deve ser curta.`);
  if (t && !/\?\s*$/.test(t)) w.push('A mensagem não termina com uma pergunta simples.');
  if (URGENCY.test(t)) w.push('Contém urgência artificial.');
  if (FAKE_FAMILIARITY.test(t)) w.push('Afirma conhecer a empresa, ter usado seus serviços ou ter identificado um problema interno.');
  if (GENERIC_PRAISE.test(t)) w.push('Contém elogio genérico.');
  return w;
}

function firstLines(s, n) { return String(s || '').split(/\n+/).map((x) => x.trim()).filter(Boolean).slice(0, n); }

// Sinais simples de voz a partir da descrição e dos exemplos do usuário.
function voiceProfile(campaign) {
  const sample = `${campaign.voice}\n${campaign.voice_examples}`;
  const n = norm(sample);
  const emoji = /\p{Extended_Pictographic}/u.test(sample) && !/sem emoji/.test(n);
  let greet = 'Oi';
  const ex = norm(firstLines(campaign.voice_examples, 1)[0] || '');
  if (/^(ola)\b/.test(ex) || /\bola\b/.test(n) && !/^oi\b/.test(ex)) greet = 'Olá';
  if (/^bom dia/.test(ex)) greet = 'Bom dia';
  if (/^boa tarde/.test(ex)) greet = 'Boa tarde';
  const formal = /formal|senhor|prezad/.test(n) && !/informal/.test(n);
  return { emoji, greet, formal, you: formal ? 'o senhor/a senhora' : 'você' };
}

function pickDetail(facts) {
  const order = ['servico', 'sinal', 'contato', 'cadastro'];
  const usable = (facts || []).filter((f) => f.short && /^https?:/.test(f.source_url));
  usable.sort((a, b) => order.indexOf(a.kind) - order.indexOf(b.kind));
  return usable[0] || null;
}

function where(fact) {
  if (!fact) return '';
  if (/maps|google/i.test(fact.source_label)) return 'no perfil do Google Maps';
  if (/site/i.test(fact.source_label)) return 'no site';
  return `em ${fact.source_label}`;
}

function contactGreeting(lead, v) {
  const confirmed = lead.contact_name && lead.contact_role && /^https?:/.test(lead.contact_source || '');
  const first = confirmed ? lead.contact_name.trim().split(/\s+/)[0] : '';
  return `${v.greet}${first ? `, ${first}` : ''}${v.formal ? '' : ', tudo bem?'}`.replace(/\?,/, '?');
}

function lowerFirst(s) { return s ? s.charAt(0).toLowerCase() + s.slice(1) : s; }

function templateDraft({ campaign, lead, facts, variant = 0 }) {
  const v = voiceProfile(campaign);
  const detail = pickDetail(facts);
  const me = [campaign.seller_name && `aqui é ${campaign.seller_name}`, campaign.company && `da ${campaign.company}`].filter(Boolean).join(', ');
  const intro = me ? `${me.charAt(0).toUpperCase()}${me.slice(1)}.` : '';
  const offer = lowerFirst(campaign.offer.trim().replace(/[.!?]+$/, ''));
  const problem = lowerFirst(campaign.problem.trim().replace(/[.!?]+$/, ''));
  const bridge = problem ? `${offer}, para ${problem}` : offer;
  const cases = firstLines(campaign.cases_text, 1)[0];
  const diff = firstLines(campaign.differentials, 1)[0];
  const v3 = variant % 3;

  let hook = '';
  if (detail) {
    const at = `${where(detail)} da ${lead.name}`;
    const clause = detail.short.startsWith('vocês') ? detail.short : `vocês ${detail.short}`;
    hook = v3 === 0 ? `Vi ${at} que ${clause}.`
      : v3 === 1 ? `Dei uma olhada ${at} e vi que ${clause}.`
        : `Reparei ${at} que ${clause}.`;
  }

  const questions = [
    `Faz sentido eu te explicar em duas linhas como funciona?`,
    `Posso te mandar um resumo rápido de como isso funcionaria aí?`,
    `Vale uma conversa rápida por aqui para ver se isso se aplica?`,
  ];
  const question = v.formal ? questions[variant % 3].replace('te explicar', 'lhe explicar').replace('te mandar', 'lhe enviar') : questions[variant % 3];

  const parts = [contactGreeting(lead, v), intro];
  if (hook) parts.push(hook);
  parts.push(v3 === 1 && hook ? `Como isso conversa com o que eu faço: trabalho com ${bridge}.` : `Eu trabalho com ${bridge}.`);
  if (v3 === 2 && cases) parts.push(`Um exemplo: ${lowerFirst(truncateWords(cases, 160)).replace(/[.!?]+$/, '')}.`);
  else if (v3 === 2 && diff) parts.push(`${truncateWords(diff, 140).replace(/[.!?]+$/, '')}.`);
  parts.push(question);

  let text = parts.filter(Boolean).join(' ');
  if (v.emoji) text = text.replace(/^(\S+)/, '$1 👋');

  return {
    text,
    origin: 'modelo',
    detailText: detail ? detail.text : '',
    detailSource: detail ? detail.source_url : '',
    needsResearch: !detail,
    missing: detail ? '' : 'Nenhum detalhe comercial confirmado em fonte pública. Cadastre o site da empresa (ou uma fonte com link) e rode a pesquisa de novo; a mensagem abaixo é genérica e não afirma nada sobre a empresa.',
  };
}

// ---------- Provedor de IA (opcional) ----------

function aiConfig() {
  const provider = (process.env.AI_PROVIDER || 'none').toLowerCase();
  return { provider, configured: provider === 'anthropic' && !!process.env.ANTHROPIC_API_KEY, model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-5-5' };
}

async function aiDraft({ campaign, lead, facts, variant = 0 }) {
  const cfg = aiConfig();
  if (!cfg.configured) throw new Error(cfg.provider === 'anthropic' ? 'ANTHROPIC_API_KEY não está definida no .env.' : 'AI_PROVIDER não está configurado como "anthropic".');
  const detail = pickDetail(facts);
  const confirmedContact = lead.contact_name && lead.contact_role && /^https?:/.test(lead.contact_source || '');
  const system = [
    'Você escreve a PRIMEIRA mensagem de WhatsApp de um vendedor para uma empresa, em português do Brasil.',
    'Regras obrigatórias: mensagem curta (até 450 caracteres), na voz do vendedor, terminando com UMA pergunta simples.',
    'Use somente fatos fornecidos. Nunca invente que conhece a empresa, usou seus serviços ou identificou um problema interno.',
    'Sem elogios genéricos, sem urgência artificial, sem promessas ou números que o vendedor não informou.',
    'Se houver detalhe confirmado, mencione-o de forma natural e conecte à oferta. Não cite hipóteses como fatos.',
    'Responda APENAS com JSON: {"message": "..."}',
  ].join('\n');
  const user = JSON.stringify({
    vendedor: campaign.seller_name, empresa_do_vendedor: campaign.company, oferta: campaign.offer, problema_que_resolve: campaign.problem,
    diferenciais_permitidos: campaign.differentials, cases_reais_permitidos: campaign.cases_text,
    voz: campaign.voice, exemplos_de_mensagens_do_vendedor: campaign.voice_examples,
    empresa_alvo: lead.name, cidade: lead.city,
    detalhe_confirmado: detail ? { texto: detail.text, fonte: detail.source_url } : null,
    nome_da_pessoa_confirmado: confirmedContact ? lead.contact_name : null,
    versao: variant + 1,
  });
  const res = await fetch(process.env.ANTHROPIC_BASE_URL || 'https://api.anthropic.com/v1/messages', {
    method: 'POST',
    signal: AbortSignal.timeout(45000),
    headers: { 'content-type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model: cfg.model, max_tokens: 600, system, messages: [{ role: 'user', content: user }] }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`Provedor de IA respondeu ${res.status}: ${(body.error && body.error.message) || 'erro desconhecido'}`);
  const raw = (body.content || []).map((c) => c.text || '').join('');
  const m = /\{[\s\S]*\}/.exec(raw);
  let message = '';
  try { message = JSON.parse(m ? m[0] : raw).message; } catch { message = raw; }
  message = String(message || '').trim();
  if (!message) throw new Error('O provedor de IA devolveu uma resposta vazia.');
  return {
    text: message, origin: 'ia',
    detailText: detail ? detail.text : '', detailSource: detail ? detail.source_url : '',
    needsResearch: !detail,
    missing: detail ? '' : 'Nenhum detalhe comercial confirmado em fonte pública; a mensagem não deve afirmar nada sobre a empresa.',
  };
}

/**
 * Gera um rascunho. Se a IA falhar, usa o modelo e devolve `aiError` para a interface mostrar.
 * Mensagens da IA que violam as regras também caem para o modelo.
 */
async function generateDraft(args, { useAi } = {}) {
  const wantAi = useAi !== undefined ? useAi : aiConfig().configured;
  let aiError = '';
  if (wantAi) {
    try {
      const d = await aiDraft(args);
      const w = checkMessage(d.text).filter((x) => !/longa/.test(x));
      if (!w.length) return { ...d, warnings: checkMessage(d.text), aiError };
      aiError = `A IA gerou um texto fora das regras (${w.join(' ')}). Usei o gerador por modelos.`;
    } catch (e) { aiError = `IA indisponível: ${e.message} Usei o gerador por modelos.`; }
  }
  const d = templateDraft(args);
  return { ...d, warnings: checkMessage(d.text), aiError };
}

module.exports = { generateDraft, templateDraft, checkMessage, aiConfig, pickDetail };
