'use strict';
/* Interface do Prospector. Todo texto vindo da web ou do banco entra via textContent (nunca innerHTML). */

const $ = (s, el = document) => el.querySelector(s);
function h(tag, attrs, ...kids) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v === false || v == null) continue;
    if (k === 'class') el.className = v;
    else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
    else if (k === 'value') el.value = v;
    else el.setAttribute(k, v === true ? '' : v);
  }
  for (const kid of kids.flat()) if (kid != null && kid !== false) el.append(kid.nodeType ? kid : document.createTextNode(String(kid)));
  return el;
}

const state = { config: null, campaigns: [], view: 'campaigns', campaignId: null, filters: { q: '', campaign_id: '', status: '', classification: '' }, pollTimer: null };

async function api(path, opts = {}) {
  const init = { method: opts.method || 'GET', headers: {} };
  if (opts.body !== undefined) { init.headers['content-type'] = 'application/json'; init.body = JSON.stringify(opts.body); }
  let res;
  try { res = await fetch(`/api${path}`, init); } catch { throw new Error('Não consegui falar com o servidor local. Ele está rodando?'); }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Erro HTTP ${res.status}`);
  return data;
}

function toast(msg, err = false) {
  const t = h('div', { class: err ? 'err' : '' }, msg);
  $('#toast').append(t);
  setTimeout(() => t.remove(), err ? 9000 : 3500);
}
const guard = (fn) => async (...a) => { try { await fn(...a); } catch (e) { toast(e.message, true); } };
const fmt = (iso) => (iso ? new Date(iso).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }) : '');

function classPill(c) {
  if (!c) return h('span', { class: 'pill' }, 'sem classificação');
  return h('span', { class: `pill ${c === 'bom encaixe' ? 'ok' : c === 'fora do perfil' ? 'bad' : 'warn'}` }, c);
}
const statusPill = (s) => h('span', { class: `pill ${['aprovado', 'respondeu'].includes(s) ? 'ok' : ['descartado', 'não contatar'].includes(s) ? 'bad' : ''}` }, s);

// ---------- navegação ----------
function go(view) {
  state.view = view;
  clearInterval(state.pollTimer);
  document.querySelectorAll('#nav button').forEach((b) => b.classList.toggle('on', b.dataset.view === view));
  guard(render)();
}
async function render() {
  state.campaigns = await api('/campaigns');
  if (!state.campaignId || !state.campaigns.some((c) => c.id === state.campaignId)) state.campaignId = (state.campaigns[0] || {}).id || null;
  const v = $('#view');
  v.replaceChildren();
  if (state.view === 'campaigns') await renderCampaigns(v);
  else if (state.view === 'pipeline') await renderPipeline(v);
  else await renderDnc(v);
}

// ---------- campanhas ----------
const FIELDS = [
  ['name', 'Nome da campanha', 'text', ''],
  ['seller_name', 'Seu nome', 'text', ''],
  ['company', 'Sua empresa', 'text', ''],
  ['offer', 'O que você vende', 'textarea', 'Uma frase. Ex.: sistema de agendamento online para clínicas'],
  ['problem', 'Problema que você resolve', 'textarea', 'Comece com verbo no infinitivo. Ex.: reduzir faltas e o tempo gasto confirmando consultas'],
  ['segment', 'Segmento que quer alcançar', 'text', 'Ex.: clínica odontológica'],
  ['region', 'Região', 'text', 'Ex.: Campinas e região'],
  ['profile', 'Perfil da empresa', 'textarea', 'Ex.: clínicas pequenas e médias, atendimento com hora marcada'],
  ['differentials', 'Diferenciais que pode mencionar', 'textarea', 'Um por linha. Só o que for verdade.'],
  ['cases_text', 'Cases reais que pode mencionar', 'textarea', 'Um por linha, escritos como você diria. A mensagem usa o 1º, sem alterar números.'],
  ['voice', 'Seu jeito de escrever', 'textarea', 'Ex.: informal, direto, trata por você, sem emojis'],
  ['voice_examples', 'Exemplos de mensagens suas (opcional)', 'textarea', 'Cole 1 a 3 mensagens, uma por linha'],
  ['leads_per_run', 'Leads novos por rodada', 'number', ''],
  ['discard_criteria', 'Critérios para descartar uma empresa', 'textarea', 'Um por linha. Palavras ou expressões. Ex.: franquia'],
];

async function renderCampaigns(v) {
  const cur = state.campaigns.find((c) => c.id === state.campaignId);
  const list = h('div', {},
    h('button', { class: 'btn primary', style: 'width:100%;margin-bottom:10px', onclick: () => { state.campaignId = 0; guard(render)(); } }, '+ Nova campanha'),
    state.campaigns.map((c) => h('button', { class: `camp ${c.id === state.campaignId ? 'on' : ''}`, onclick: () => { state.campaignId = c.id; guard(render)(); } },
      h('strong', {}, c.name), h('div', { class: 'small mute' }, `${c.lead_count} leads`, c.is_demo ? ' · ' : '', c.is_demo ? h('span', { class: 'pill ex' }, 'DEMONSTRAÇÃO') : ''))));
  const right = h('div', {});
  v.append(h('div', { class: 'grid two' }, list, right));
  right.append(campaignForm(state.campaignId === 0 ? null : cur));
  if (cur && state.campaignId !== 0) right.append(await prospectPanel(cur));
}

function campaignForm(c) {
  const f = h('form', { class: 'card' });
  f.append(h('h2', {}, c ? 'Campanha' : 'Nova campanha'));
  if (c && c.is_demo) f.append(h('div', { class: 'note info' }, 'Campanha de demonstração: todas as empresas são fictícias e identificadas como EXEMPLO. Funciona sem credenciais.'));
  const inputs = {};
  for (const [key, label, type, hint] of FIELDS) {
    const val = c ? c[key] : (key === 'leads_per_run' ? 10 : '');
    inputs[key] = type === 'textarea' ? h('textarea', { name: key }, val) : h('input', { name: key, type, value: val, min: type === 'number' ? 1 : false, max: type === 'number' ? 100 : false });
    f.append(h('label', {}, label, hint ? h('small', {}, ` — ${hint}`) : ''), inputs[key]);
  }
  f.append(h('div', { class: 'row', style: 'margin-top:14px' }, h('button', { class: 'btn primary', type: 'submit' }, 'Salvar campanha')));
  f.addEventListener('submit', guard(async (e) => {
    e.preventDefault();
    const body = Object.fromEntries(Object.entries(inputs).map(([k, el]) => [k, el.value]));
    const saved = await api(c ? `/campaigns/${c.id}` : '/campaigns', { method: c ? 'PUT' : 'POST', body });
    state.campaignId = saved.id;
    toast('Campanha salva.');
    await render();
  }));
  return f;
}

async function prospectPanel(c) {
  const box = h('div', { class: 'card' }, h('h2', {}, 'Prospectar'));
  const cfg = state.config;
  if (c.is_demo) {
    box.append(h('div', { class: 'row' },
      h('button', { class: 'btn primary', onclick: guard(() => startRun(c, 'demo')) }, 'Prospectar (demonstração)'),
      h('button', { class: 'btn', onclick: guard(async () => { if (confirm('Apagar os leads e o histórico da demonstração e começar de novo?')) { await api('/demo/reset', { method: 'POST' }); toast('Demonstração reiniciada.'); await render(); } }) }, 'Reiniciar demonstração')));
    box.append(h('p', { class: 'small mute' }, 'Cada rodada traz até o número de leads novos configurado. Rode de novo para ver a deduplicação e o histórico preservado.'));
  } else {
    box.append(h('div', { class: 'row' },
      h('button', { class: 'btn primary', onclick: guard(() => startRun(c, 'places')) }, 'Prospectar (Google Places)'),
      h('label', { class: 'btn', style: 'margin:0;font-weight:400' }, 'Importar CSV',
        h('input', { type: 'file', accept: '.csv,text/csv,.txt', hidden: true, onchange: guard(async (e) => { const file = e.target.files[0]; if (file) { const csv = await file.text(); await startRun(c, 'csv', csv); } e.target.value = ''; }) })),
      h('a', { class: 'btn', href: '/api/csv-template.csv' }, 'Baixar modelo de CSV')));
    box.append(cfg.places.configured
      ? h('div', { class: 'note ok' }, 'Google Places configurado no servidor.')
      : h('div', { class: 'note warn' }, 'Google Places ainda não está configurado (GOOGLE_PLACES_API_KEY no .env). Você pode importar CSV, ou veja o README para configurar.'));
  }
  box.append(h('div', { class: 'row', style: 'margin-top:8px' }, h('button', { class: 'btn', onclick: () => { state.filters = { q: '', campaign_id: String(c.id), status: '', classification: '' }; go('pipeline'); } }, 'Ver leads desta campanha')));
  const runs = h('div', { id: 'runs' });
  box.append(h('h3', {}, 'Rodadas'), runs);
  await drawRuns(c.id, runs);
  return box;
}

async function startRun(c, source, csv) {
  const run = await api(source === 'csv' ? `/campaigns/${c.id}/import` : `/campaigns/${c.id}/prospect`, { method: 'POST', body: source === 'csv' ? { csv } : { source } });
  if (run.status === 'erro') toast(run.error, true);
  await render();
}

async function drawRuns(campaignId, box) {
  const runs = await api(`/campaigns/${campaignId}/runs`);
  box.replaceChildren();
  if (!runs.length) box.append(h('p', { class: 'mute small' }, 'Nenhuma rodada ainda.'));
  runs.slice(0, 5).forEach((r, i) => {
    const cls = r.status === 'concluída' ? 'ok' : r.status === 'executando' ? '' : r.status === 'parcial' ? 'warn' : 'bad';
    box.append(h('div', { style: 'margin-bottom:10px' },
      h('div', { class: 'row' }, h('strong', {}, `Rodada #${r.id}`), h('span', { class: `pill ${cls}` }, r.status), h('span', { class: 'small mute' }, `${r.kind} · ${fmt(r.started_at)} · ${r.found} encontrados, ${r.added} novos, ${r.duplicates} repetidos`)),
      r.error ? h('div', { class: 'note bad' }, r.error) : null,
      i === 0 && r.log.length ? h('pre', { class: 'log' }, r.log.join('\n')) : null));
  });
  if (runs.some((r) => r.status === 'executando')) {
    clearInterval(state.pollTimer);
    state.pollTimer = setInterval(() => { if (!document.body.contains(box)) return clearInterval(state.pollTimer); guard(() => drawRuns(campaignId, box))(); }, 1200);
  } else clearInterval(state.pollTimer);
}

// ---------- pipeline ----------
function filterQuery() {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(state.filters)) if (v) p.set(k, v);
  return p.toString();
}

async function renderPipeline(v) {
  const f = state.filters;
  const sel = (key, opts, label) => h('select', { onchange: (e) => { f[key] = e.target.value; guard(render)(); } },
    h('option', { value: '' }, label), opts.map(([val, txt]) => h('option', { value: val, selected: String(f[key]) === String(val) }, txt)));
  const bar = h('div', { class: 'card' }, h('div', { class: 'row' },
    h('input', { type: 'search', placeholder: 'Buscar por nome, cidade, telefone, domínio…', value: f.q, style: 'max-width:340px', onkeydown: (e) => { if (e.key === 'Enter') { f.q = e.target.value; guard(render)(); } } }),
    sel('campaign_id', state.campaigns.map((c) => [c.id, c.name]), 'Todas as campanhas'),
    sel('status', state.config.statuses.map((s) => [s, s]), 'Todos os status'),
    sel('classification', state.config.classifications.map((s) => [s, s]), 'Todas as classificações'),
    h('div', { class: 'grow' }),
    h('a', { class: 'btn', href: `/api/export.xlsx?${filterQuery()}` }, 'Exportar Excel (.xlsx)'),
    h('a', { class: 'btn', href: `/api/export.csv?${filterQuery()}` }, 'Exportar CSV')));
  const leads = await api(`/leads?${filterQuery()}`);
  const table = h('table', {}, h('thead', {}, h('tr', {}, ['Empresa', 'Cidade', 'Classificação', 'Motivo', 'Telefone', 'Status'].map((t) => h('th', {}, t)))),
    h('tbody', {}, leads.map((l) => h('tr', { class: 'click', onclick: () => openLead(l.id) },
      h('td', {}, h('strong', {}, l.name), l.is_example ? h('span', { class: 'pill ex', style: 'margin-left:6px' }, 'EXEMPLO') : '', h('div', { class: 'small mute' }, l.campaign_name)),
      h('td', {}, l.city), h('td', {}, classPill(l.classification)), h('td', { class: 'small' }, l.class_reason),
      h('td', {}, l.phone, l.phone_info && !l.phone_info.waOk ? h('div', { class: 'small mute' }, 'fixo') : ''), h('td', {}, statusPill(l.status))))));
  v.append(bar, h('div', { class: 'card' }, h('div', { class: 'small mute', style: 'margin-bottom:8px' }, `${leads.length} lead(s)`), leads.length ? table : h('p', { class: 'mute' }, 'Nenhum lead com esses filtros. Rode uma prospecção na aba Campanhas.')));
}

// ---------- ficha do lead ----------
async function openLead(id) {
  const lead = await api(`/leads/${id}`);
  const modal = $('#modal');
  modal.hidden = false;
  modal.replaceChildren(h('div', { class: 'panel' }, leadView(lead)));
  modal.onclick = (e) => { if (e.target === modal) closeLead(); };
}
function closeLead() { $('#modal').hidden = true; $('#modal').replaceChildren(); if (state.view === 'pipeline') guard(render)(); }
const reload = (lead) => openLead(lead.id);

function leadView(lead) {
  const act = (fn) => guard(async () => { await fn(); await reload(lead); });
  const cur = lead.drafts.find((d) => d.id === lead.current_draft_id);
  const wrap = h('div', {});
  wrap.append(h('div', { class: 'row' },
    h('h2', { style: 'margin:0' }, lead.name), lead.is_example ? h('span', { class: 'pill ex' }, 'EXEMPLO FICTÍCIO') : '', classPill(lead.classification), statusPill(lead.status),
    h('div', { class: 'grow' }), h('button', { class: 'btn', onclick: closeLead }, 'Fechar')));
  wrap.append(h('div', { class: 'small mute' }, `${lead.campaign_name} · pesquisado em ${fmt(lead.researched_at) || '—'} · encontrado ${lead.seen_count}×`));
  if (lead.is_example) wrap.append(h('div', { class: 'note info' }, 'Empresa fictícia de demonstração. O telefone não é de uma pessoa real: não envie mensagem.'));
  if (lead.blocked) wrap.append(h('div', { class: 'note bad' }, 'Este número está em "não contatar". Novas abordagens estão bloqueadas.'));
  if (lead.research_error) wrap.append(h('div', { class: 'note warn' }, `Pesquisa: ${lead.research_error}`));
  wrap.append(h('div', { class: 'note info' }, h('strong', {}, 'Por que esta classificação: '), lead.class_reason || '—'));

  const left = h('div', {});
  const form = h('form', { class: 'card' }, h('h3', { style: 'margin-top:0' }, 'Dados da empresa'));
  const fields = {};
  [['name', 'Nome'], ['segment', 'Segmento'], ['city', 'Cidade'], ['website', 'Site'], ['phone', 'Telefone comercial'], ['note', 'Observação'],
    ['contact_name', 'Pessoa de contato (só se confirmada)'], ['contact_role', 'Cargo/papel comercial'], ['contact_source', 'Link da fonte que confirma o vínculo']].forEach(([k, label]) => {
    fields[k] = h('input', { value: lead[k] || '' });
    form.append(h('label', {}, label), fields[k]);
  });
  if (lead.phone_note) form.append(h('div', { class: 'small mute' }, lead.phone_note));
  form.append(h('div', { class: 'small mute' }, 'O nome da pessoa só entra na mensagem se nome, cargo e link da fonte estiverem preenchidos.'));
  form.append(h('div', { class: 'row', style: 'margin-top:10px' }, h('button', { class: 'btn', type: 'submit' }, 'Salvar dados'),
    h('button', { class: 'btn', type: 'button', onclick: act(async () => { await api(`/leads/${lead.id}/research`, { method: 'POST' }); toast('Pesquisa refeita; rascunhos anteriores foram mantidos.'); }) }, 'Pesquisar de novo')));
  form.addEventListener('submit', act(async (e) => { e.preventDefault(); await api(`/leads/${lead.id}`, { method: 'PATCH', body: Object.fromEntries(Object.entries(fields).map(([k, el]) => [k, el.value])) }); toast('Dados salvos.'); }));
  left.append(form);

  const ev = h('div', { class: 'card' }, h('h3', { style: 'margin-top:0' }, 'Fatos confirmados'));
  ev.append(lead.facts.length ? h('ul', { class: 'clean' }, lead.facts.map((f) => h('li', { class: 'fact' }, f.text, ' ', h('a', { href: f.source_url, target: '_blank', rel: 'noopener noreferrer' }, 'fonte ↗')))) : h('p', { class: 'mute small' }, 'Nenhum fato confirmado em fonte pública.'));
  ev.append(h('h3', {}, 'Hipóteses (não confirmadas)'));
  ev.append(lead.hypotheses.length ? h('ul', { class: 'clean' }, lead.hypotheses.map((x) => h('li', { class: 'hyp' }, x.text))) : h('p', { class: 'mute small' }, '—'));
  ev.append(h('h3', {}, 'Fontes consultadas'));
  ev.append(lead.sources.length ? h('ul', { class: 'clean' }, lead.sources.map((s) => h('li', {}, h('a', { href: s.url, target: '_blank', rel: 'noopener noreferrer' }, s.label || s.url)))) : h('p', { class: 'mute small' }, '—'));
  left.append(ev);

  const hist = h('div', { class: 'card' }, h('h3', { style: 'margin-top:0' }, 'Histórico'),
    h('ul', { class: 'clean' }, lead.events.map((e) => h('li', { class: 'small' }, h('span', { class: 'mute' }, `${fmt(e.created_at)} · `), h('strong', {}, e.type.replace(/_/g, ' ')), ' — ', e.detail))));
  left.append(hist);

  const right = h('div', {});
  right.append(draftPanel(lead, cur, act));
  wrap.append(h('div', { class: 'grid cols', style: 'margin-top:12px' }, left, right));
  return wrap;
}

function draftPanel(lead, cur, act) {
  const box = h('div', { class: 'card' }, h('h3', { style: 'margin-top:0' }, 'Primeira mensagem'));
  const closed = ['enviado', 'respondeu', 'não contatar'].includes(lead.status);
  if (!cur) box.append(h('div', { class: 'note info' }, lead.classification === 'fora do perfil' ? 'Lead fora do perfil: nenhum rascunho foi gerado automaticamente.' : 'Ainda sem rascunho.'));
  if (cur && cur.needs_research) box.append(h('div', { class: 'note warn' }, h('strong', {}, 'Precisa de pesquisa. '), cur.missing));
  (cur ? cur.warnings : []).forEach((w) => box.append(h('div', { class: 'note warn' }, `Atenção: ${w}`)));
  const ta = h('textarea', { style: 'min-height:230px', disabled: closed }, cur ? cur.text : '');
  box.append(ta);
  box.append(h('div', { class: 'small mute' }, 'Editar e salvar cria uma nova versão; as anteriores ficam guardadas.'));
  if (cur && cur.detail_text) {
    box.append(h('div', { class: 'note info' }, h('strong', {}, 'Detalhe que justifica a abordagem: '), cur.detail_text, ' ',
      cur.detail_source ? h('a', { href: cur.detail_source, target: '_blank', rel: 'noopener noreferrer' }, 'ver fonte ↗') : ''));
  }
  const approved = lead.approved_draft_id && cur && lead.approved_draft_id === cur.id;
  box.append(h('div', { class: 'row', style: 'margin-top:8px' },
    h('button', { class: 'btn', disabled: closed, onclick: act(async () => { await api(`/leads/${lead.id}/drafts`, { method: 'POST', body: { text: ta.value } }); toast('Nova versão salva. Aprove novamente se quiser usar.'); }) }, 'Salvar edição'),
    h('button', { class: 'btn', disabled: closed || lead.blocked, onclick: act(async () => { const r = await api(`/leads/${lead.id}/drafts`, { method: 'POST', body: {} }); if (r.aiError) toast(r.aiError, true); else toast('Outra versão gerada; a anterior foi mantida.'); }) }, 'Gerar outra versão'),
    h('button', { class: 'btn primary', disabled: !cur || closed || lead.blocked || approved, onclick: act(async () => {
      try { await api(`/leads/${lead.id}/approve`, { method: 'POST', body: {} }); }
      catch (e) { if (/precisa de pesquisa/.test(e.message) && confirm(`${e.message}\n\nA mensagem é genérica. Aprovar mesmo assim?`)) await api(`/leads/${lead.id}/approve`, { method: 'POST', body: { force: true } }); else throw e; }
      toast('Rascunho aprovado.');
    }) }, approved ? 'Aprovado ✓' : 'Aprovar rascunho')));

  const wa = lead.whatsapp;
  box.append(h('h3', {}, 'WhatsApp'));
  box.append(h('div', { class: 'row' },
    h('button', { class: 'btn wa', disabled: !wa.can_open, title: wa.reason, onclick: guard(() => openChat(lead)) }, 'Abrir conversa'),
    h('button', { class: 'btn', disabled: lead.status !== 'aprovado', onclick: act(() => api(`/leads/${lead.id}/sent`, { method: 'POST' })) }, 'Marcar como enviado'),
    h('button', { class: 'btn', disabled: !['aprovado', 'enviado'].includes(lead.status), onclick: act(() => api(`/leads/${lead.id}/replied`, { method: 'POST' })) }, 'Marcar como respondeu')));
  box.append(h('div', { class: 'small mute', style: 'margin-top:6px' }, wa.can_open ? 'O WhatsApp abre com o texto preenchido. Confira e clique em enviar lá. Abrir o link não conta como envio: depois use "Marcar como enviado".' : `Indisponível: ${wa.reason}`));
  box.append(h('div', { class: 'row', style: 'margin-top:12px' },
    h('button', { class: 'btn danger', disabled: lead.status === 'não contatar', onclick: act(async () => { const reason = prompt('Pediu para não receber contato? Anote o motivo (opcional). O número ficará bloqueado para novas abordagens.'); if (reason === null) throw new Error('Cancelado.'); await api(`/leads/${lead.id}/dnc`, { method: 'POST', body: { reason } }); }) }, 'Pediu para não receber contato'),
    lead.status === 'descartado'
      ? h('button', { class: 'btn', onclick: act(() => api(`/leads/${lead.id}/reopen`, { method: 'POST' })) }, 'Reabrir')
      : h('button', { class: 'btn', disabled: lead.status === 'não contatar', onclick: act(async () => { const reason = prompt('Motivo do descarte (opcional):'); if (reason === null) throw new Error('Cancelado.'); await api(`/leads/${lead.id}/discard`, { method: 'POST', body: { reason } }); }) }, 'Descartar')));

  box.append(h('h3', {}, 'Versões'));
  box.append(h('ul', { class: 'clean' }, lead.drafts.map((d) => h('li', { class: 'small' },
    h('strong', {}, `v${d.version}`), ` · ${d.origin} · ${fmt(d.created_at)} `,
    d.id === lead.current_draft_id ? h('span', { class: 'pill' }, 'atual') : '', ' ', d.id === lead.approved_draft_id ? h('span', { class: 'pill ok' }, 'aprovada') : '', ' ', d.needs_research ? h('span', { class: 'pill warn' }, 'precisa de pesquisa') : '',
    h('div', { class: 'mute' }, d.text), closed ? '' : h('button', { class: 'btn', style: 'padding:2px 8px;margin-top:4px', onclick: () => { ta.value = d.text; toast('Texto carregado no editor. Salve para criar uma nova versão.'); } }, 'Carregar no editor')))));
  return box;
}

async function openChat(lead) {
  if (lead.is_example && !confirm('Este é um lead FICTÍCIO de demonstração. O número não é de uma pessoa real. Gerar o link mesmo assim, só para teste?')) return;
  const win = window.open('about:blank', '_blank');
  try {
    const r = await api(`/leads/${lead.id}/whatsapp`, { method: 'POST' });
    if (win) { win.opener = null; win.location.href = r.url; } else toast(`O navegador bloqueou a nova aba. Link: ${r.url}`, true);
    toast('Conversa aberta com o texto preenchido. Confira e envie no WhatsApp; depois marque como enviado aqui.');
    await reload(lead);
  } catch (e) { if (win) win.close(); throw e; }
}

// ---------- não contatar ----------
async function renderDnc(v) {
  const list = await api('/dnc');
  const phone = h('input', { placeholder: '(19) 99999-0000', style: 'max-width:220px' });
  const reason = h('input', { placeholder: 'Motivo (opcional)', style: 'max-width:300px' });
  v.append(h('div', { class: 'card' }, h('h2', {}, 'Números bloqueados (não contatar)'),
    h('p', { class: 'small mute' }, 'Qualquer lead com estes números fica bloqueado para novas abordagens, inclusive em rodadas futuras.'),
    h('div', { class: 'row' }, phone, reason, h('button', { class: 'btn', onclick: guard(async () => { await api('/dnc', { method: 'POST', body: { phone: phone.value, reason: reason.value } }); toast('Número bloqueado.'); await render(); }) }, 'Bloquear número')),
    list.length ? h('table', { style: 'margin-top:12px' }, h('thead', {}, h('tr', {}, ['Número', 'Lead', 'Motivo', 'Desde', ''].map((t) => h('th', {}, t)))),
      h('tbody', {}, list.map((d) => h('tr', {}, h('td', {}, d.phone_norm), h('td', {}, d.lead_name || ''), h('td', {}, d.reason), h('td', {}, fmt(d.created_at)),
        h('td', {}, h('button', { class: 'btn', onclick: guard(async () => { if (confirm('Remover este número do bloqueio? Só faça isso se o bloqueio foi um engano.')) { await api(`/dnc/${d.phone_norm}`, { method: 'DELETE' }); await render(); } }) }, 'Remover bloqueio')))))) : h('p', { class: 'mute' }, 'Nenhum número bloqueado.')));
}

// ---------- início ----------
document.querySelectorAll('#nav button').forEach((b) => b.addEventListener('click', () => go(b.dataset.view)));
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !$('#modal').hidden) closeLead(); });
guard(async () => { state.config = await api('/config'); go('campaigns'); })();
