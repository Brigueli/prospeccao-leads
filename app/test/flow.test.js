'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const ExcelJS = require('exceljs');
const { boot, waitRun, fixtureServer } = require('./helpers');

test('fluxo completo com a demonstração (dados fictícios, nenhuma mensagem real)', async (t) => {
  const app = await boot();
  t.after(app.close);
  const { call } = app;

  // campanha de demonstração existe e é marcada como tal
  const camps = (await call('/api/campaigns')).data;
  const demo = camps.find((c) => c.is_demo);
  assert.ok(demo);

  // 1ª rodada: 5 novos, 2 duplicados (domínio e telefone normalizado)
  let run = (await call(`/api/campaigns/${demo.id}/prospect`, { method: 'POST', body: { source: 'demo' } })).data;
  run = await waitRun(call, run.id);
  assert.equal(run.status, 'concluída');
  assert.equal(run.added, 5);
  assert.equal(run.duplicates, 2);
  let leads = (await call(`/api/leads?campaign_id=${demo.id}`)).data;
  assert.equal(leads.length, 5);
  assert.ok(leads.every((l) => l.is_example));
  assert.ok(leads.some((l) => l.classification === 'fora do perfil'));
  const good = leads.find((l) => l.name.startsWith('Clínica Sorriso Vivo'));
  assert.equal(good.classification, 'bom encaixe');
  assert.equal(good.status, 'em revisão');

  // WhatsApp bloqueado antes de aprovar
  let r = await call(`/api/leads/${good.id}/whatsapp`, { method: 'POST' });
  assert.equal(r.status, 409);
  assert.match(r.data.error, /Aprove/);

  // ficha: fatos com fonte, hipóteses separadas, detalhe justificando a mensagem
  const detail = (await call(`/api/leads/${good.id}`)).data;
  assert.ok(detail.facts.length && detail.facts.every((f) => /^https?:/.test(f.source_url)));
  assert.ok(detail.hypotheses.length);
  const d1 = detail.drafts[0];
  assert.match(d1.text, /\?$/);
  assert.ok(d1.detail_source.startsWith('https://'));
  assert.equal(d1.needs_research, false);

  // lead sem site => precisa de pesquisa
  const nosite = leads.find((l) => l.name.startsWith('Dra. Paula'));
  const nsDetail = (await call(`/api/leads/${nosite.id}`)).data;
  assert.equal(nsDetail.drafts[0].needs_research, true);
  r = await call(`/api/leads/${nosite.id}/approve`, { method: 'POST', body: {} });
  assert.equal(r.status, 409); // exige confirmação explícita

  // editar + gerar outra versão preserva as anteriores
  r = await call(`/api/leads/${good.id}/drafts`, { method: 'POST', body: { text: 'Oi! Vi o site de vocês e queria entender como confirmam consultas hoje. Posso te contar o que fazemos?' } });
  assert.equal(r.status, 201);
  r = await call(`/api/leads/${good.id}/drafts`, { method: 'POST', body: {} });
  const afterGen = r.data.lead;
  assert.equal(afterGen.drafts.length, 3);
  assert.equal(afterGen.drafts[2].text, d1.text);
  assert.notEqual(afterGen.drafts[0].text, afterGen.drafts[1].text);

  // texto com urgência artificial não pode ser aprovado
  await call(`/api/leads/${good.id}/drafts`, { method: 'POST', body: { text: 'Última chance, só hoje! Posso falar?' } });
  r = await call(`/api/leads/${good.id}/approve`, { method: 'POST', body: {} });
  assert.equal(r.status, 400);

  // aprovar texto limpo e gerar link wa.me
  await call(`/api/leads/${good.id}/drafts`, { method: 'POST', body: { text: 'Oi, tudo bem? Vi no site que vocês atendem em Campinas. Posso te mostrar como reduzir faltas?' } });
  r = await call(`/api/leads/${good.id}/approve`, { method: 'POST', body: {} });
  assert.equal(r.status, 200);
  assert.equal(r.data.status, 'aprovado');
  r = await call(`/api/leads/${good.id}/whatsapp`, { method: 'POST' });
  assert.equal(r.status, 200);
  assert.equal(r.data.url, `https://wa.me/5519900000101?text=${encodeURIComponent('Oi, tudo bem? Vi no site que vocês atendem em Campinas. Posso te mostrar como reduzir faltas?')}`);
  let after = (await call(`/api/leads/${good.id}`)).data;
  assert.equal(after.status, 'aprovado'); // abrir o link NÃO conta como envio
  assert.ok(after.events.some((e) => e.type === 'conversa_aberta'));

  // editar depois de aprovar revoga a aprovação
  await call(`/api/leads/${good.id}/drafts`, { method: 'POST', body: { text: 'Oi! Posso te contar uma ideia rápida sobre confirmação de consultas?' } });
  after = (await call(`/api/leads/${good.id}`)).data;
  assert.equal(after.status, 'em revisão');
  assert.equal(after.whatsapp.can_open, false);
  await call(`/api/leads/${good.id}/approve`, { method: 'POST', body: {} });

  // marcar enviado e respondeu manualmente
  r = await call(`/api/leads/${good.id}/sent`, { method: 'POST' });
  assert.equal(r.data.status, 'enviado');

  // 2ª rodada: novos leads, os antigos preservados (status/histórico), repetidos contabilizados
  run = (await call(`/api/campaigns/${demo.id}/prospect`, { method: 'POST', body: { source: 'demo' } })).data;
  run = await waitRun(call, run.id);
  assert.equal(run.added, 3);
  assert.equal(run.duplicates, 7);
  leads = (await call(`/api/leads?campaign_id=${demo.id}`)).data;
  assert.equal(leads.length, 8);
  const kept = (await call(`/api/leads/${good.id}`)).data;
  assert.equal(kept.status, 'enviado');
  assert.equal(kept.seen_count, 4); // 1 descoberta + duplicado "Dente Feliz" (rodada 1) + os dois de novo (rodada 2)
  assert.ok(kept.events.some((e) => e.type === 'reencontrado'));
  assert.ok(kept.drafts.length >= 5);

  // "não contatar" bloqueia o número em todos os leads e impede novas abordagens
  const oc = leads.find((l) => l.name.startsWith('OdontoCentro'));
  await call(`/api/leads/${oc.id}/drafts`, { method: 'POST', body: { text: 'Oi, tudo bem? Posso te contar uma ideia?' } });
  await call(`/api/leads/${oc.id}/approve`, { method: 'POST', body: {} });
  r = await call(`/api/leads/${oc.id}/dnc`, { method: 'POST', body: { reason: 'pediu para parar' } });
  assert.equal(r.data.status, 'não contatar');
  assert.equal((await call(`/api/leads/${oc.id}/whatsapp`, { method: 'POST' })).status, 409);
  assert.equal((await call(`/api/leads/${oc.id}/approve`, { method: 'POST', body: {} })).status, 409);
  assert.equal((await call(`/api/leads/${oc.id}/drafts`, { method: 'POST', body: {} })).status, 409);
  const dnc = (await call('/api/dnc')).data;
  assert.equal(dnc[0].phone_norm, '5519900000102');

  // filtros do pipeline
  assert.equal((await call('/api/leads?status=n%C3%A3o%20contatar')).data.length, 1);
  assert.ok((await call('/api/leads?q=Kids')).data.every((l) => /Kids/.test(l.name)));

  // exportações (todas e filtradas)
  const x = await call(`/api/export.xlsx?campaign_id=${demo.id}`, { raw: true });
  assert.equal(x.status, 200);
  assert.match(x.headers.get('content-type'), /spreadsheetml/);
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(Buffer.from(await x.arrayBuffer()));
  const ws = wb.getWorksheet('Leads');
  assert.equal(ws.rowCount, 9);
  const head = ws.getRow(1).values.slice(1);
  for (const col of ['Telefone comercial', 'Fontes', 'Justificativa', 'Mensagem', 'Status', 'Fatos confirmados', 'Hipóteses (não confirmadas)', 'Exemplo fictício']) assert.ok(head.includes(col), col);
  const csv = await (await call('/api/export.csv?status=enviado', { raw: true })).text();
  assert.equal(csv.trim().split('\r\n').length, 2);
  assert.match(csv, /enviado/);
});

test('importação de CSV: lê o site, usa só contato publicado e evita duplicados', async (t) => {
  const site = await fixtureServer({
    '/': `<html><head><title>Casa Verde</title><meta name="description" content="Móveis planejados sob medida para cozinhas e closets em Campinas"></head>
      <body><h1>Casa Verde Móveis</h1><a href="/contato">Contato</a><p>Solicite orçamento sem compromisso.</p></body></html>`,
    '/contato': `<html><body><a href="https://wa.me/5519988887777">Fale no WhatsApp</a><a href="tel:+551933334444">Ligue</a></body></html>`,
    '/robots.txt': { type: 'text/plain', body: 'User-agent: *\nDisallow: /privado\n' },
  });
  const blocked = await fixtureServer({ '/robots.txt': { type: 'text/plain', body: 'User-agent: *\nDisallow: /\n' }, '/': '<html><title>x</title></html>' });
  const app = await boot();
  t.after(async () => { await app.close(); await site.close(); await blocked.close(); });
  const { call } = app;

  const camp = (await call('/api/campaigns', { method: 'POST', body: { name: 'Móveis', seller_name: 'Beto', company: 'Studio B', offer: 'catálogo digital para lojas de móveis', problem: 'mostrar projetos sem depender de PDF', segment: 'móveis planejados', region: 'Campinas', discard_criteria: 'usados', leads_per_run: 10 } })).data;

  const csv = [
    'nome;cidade;site;telefone;observacao',
    `Casa Verde;Campinas;${site.url};;`,
    `Sem Dados Ltda;Campinas;;;sem contato`,
    `Bloqueada Site;Campinas;${blocked.url.replace("127.0.0.1", "localhost")};(19) 98888-1111;`,
    `Insta Casa;Campinas;https://instagram.com/instacasa;(19) 97777-2222;perfil no instagram`,
    `;Campinas;;;linha sem nome`,
  ].join('\n');
  let run = (await call(`/api/campaigns/${camp.id}/import`, { method: 'POST', body: { csv } })).data;
  run = await waitRun(call, run.id);
  assert.equal(run.status, 'concluída');
  assert.equal(run.added, 4);
  assert.ok(run.log.some((l) => /sem nome/.test(l)));

  const leads = (await call(`/api/leads?campaign_id=${camp.id}`)).data;
  const cv = leads.find((l) => l.name === 'Casa Verde');
  assert.equal(cv.phone_norm, '5519988887777'); // telefone publicado pela empresa no site (WhatsApp)
  assert.ok(cv.facts.some((f) => /Móveis planejados/.test(f.text)));
  assert.ok(cv.facts.some((f) => /orçamento/.test(f.text)));
  assert.ok(cv.sources.length >= 2);
  assert.equal(cv.classification, 'bom encaixe');
  assert.ok(cv.researched_at);
  const bl = leads.find((l) => l.name === 'Bloqueada Site');
  assert.match(bl.research_error, /robots/);
  assert.equal(bl.facts.length, 0);
  assert.equal(bl.classification, 'precisa de revisão');
  const sd = leads.find((l) => l.name === 'Sem Dados Ltda');
  assert.equal(sd.phone, ''); // dado ausente fica vazio
  assert.equal(sd.website, '');
  const ig = leads.find((l) => l.name === 'Insta Casa');
  assert.equal(ig.domain, ''); // rede social não é "site próprio"
  assert.match(ig.note, /instagram/);

  // rascunho de Casa Verde cita detalhe do site com fonte
  const d = (await call(`/api/leads/${cv.id}`)).data.drafts[0];
  assert.match(d.text, /Casa Verde/);
  assert.ok(d.detail_source.startsWith(site.url));

  // reimportar o mesmo CSV: tudo duplicado; histórico preservado
  run = (await call(`/api/campaigns/${camp.id}/import`, { method: 'POST', body: { csv } })).data;
  run = await waitRun(call, run.id);
  assert.equal(run.added, 0);
  assert.equal(run.duplicates, 4);
  assert.equal((await call(`/api/leads?campaign_id=${camp.id}`)).data.length, 4);

  // CSV inválido => erro claro e nada perdido
  const bad = (await call(`/api/campaigns/${camp.id}/import`, { method: 'POST', body: { csv: 'a,b\n1,2' } })).data;
  assert.equal(bad.status, 'erro');
  assert.match(bad.error, /coluna/);
  assert.equal((await call(`/api/leads?campaign_id=${camp.id}`)).data.length, 4);

  // número bloqueado antes: novo lead com o mesmo telefone nasce "não contatar"
  await call('/api/dnc', { method: 'POST', body: { phone: '(19) 96666-3333', reason: 'pedido' } });
  run = (await call(`/api/campaigns/${camp.id}/import`, { method: 'POST', body: { csv: 'nome;telefone\nOutra Empresa;(19) 96666-3333' } })).data;
  await waitRun(call, run.id);
  const out = (await call(`/api/leads?campaign_id=${camp.id}&q=Outra`)).data[0];
  assert.equal(out.status, 'não contatar');
  assert.equal(out.whatsapp.can_open, false);

  // editar telefone para um já existente é recusado
  const r = await call(`/api/leads/${sd.id}`, { method: 'PATCH', body: { phone: '(19) 98888-1111' } });
  assert.equal(r.status, 409);
});

test('Google Places: sem chave, chave recusada, sucesso paginado e falha parcial preservam os dados', async (t) => {
  const pages = [];
  const places = http.createServer((req, res) => {
    let b = '';
    req.on('data', (c) => { b += c; });
    req.on('end', () => {
      const body = JSON.parse(b || '{}');
      pages.push({ key: req.headers['x-goog-api-key'], q: body.textQuery, token: body.pageToken });
      res.setHeader('content-type', 'application/json');
      if (req.headers['x-goog-api-key'] === 'chave-ruim') { res.statusCode = 403; return res.end(JSON.stringify({ error: { message: 'API key not valid' } })); }
      if (body.pageToken === 'p2') { res.statusCode = 500; return res.end(JSON.stringify({ error: { message: 'boom' } })); }
      const mk = (n, extra = {}) => ({ id: `id${n}`, displayName: { text: `Loja ${n}` }, formattedAddress: `Rua ${n}, Campinas`, addressComponents: [{ longText: 'Campinas', types: ['locality'] }], nationalPhoneNumber: `(19) 9${String(n).padStart(4, '0')}-0000`, googleMapsUri: `https://maps.google.com/?cid=${n}`, primaryTypeDisplayName: { text: 'Loja de móveis' }, businessStatus: 'OPERATIONAL', ...extra });
      res.end(JSON.stringify({ places: [mk(1), mk(2), mk(3, { businessStatus: 'CLOSED_PERMANENTLY' })], nextPageToken: 'p2' }));
    });
  });
  await new Promise((r) => places.listen(0, '127.0.0.1', r));
  process.env.GOOGLE_PLACES_BASE_URL = `http://127.0.0.1:${places.address().port}`;
  const app = await boot();
  t.after(async () => { delete process.env.GOOGLE_PLACES_API_KEY; delete process.env.GOOGLE_PLACES_BASE_URL; await app.close(); places.close(); });
  const { call } = app;
  const camp = (await call('/api/campaigns', { method: 'POST', body: { name: 'Lojas', seller_name: 'Beto', offer: 'catálogo', segment: 'loja de móveis', region: 'Campinas', leads_per_run: 50 } })).data;

  delete process.env.GOOGLE_PLACES_API_KEY;
  let run = (await call(`/api/campaigns/${camp.id}/prospect`, { method: 'POST', body: { source: 'places' } })).data;
  assert.equal(run.status, 'erro');
  assert.match(run.error, /GOOGLE_PLACES_API_KEY/);

  process.env.GOOGLE_PLACES_API_KEY = 'chave-ruim';
  run = (await call(`/api/campaigns/${camp.id}/prospect`, { method: 'POST', body: { source: 'places' } })).data;
  run = await waitRun(call, run.id);
  assert.equal(run.status, 'erro');
  assert.match(run.error, /recusou a chave.*API key not valid/);

  process.env.GOOGLE_PLACES_API_KEY = 'chave-boa';
  run = (await call(`/api/campaigns/${camp.id}/prospect`, { method: 'POST', body: { source: 'places' } })).data;
  run = await waitRun(call, run.id);
  assert.equal(run.status, 'parcial'); // 2ª página falhou, 1ª foi salva
  assert.match(run.error, /HTTP 500/);
  assert.equal(run.added, 2); // o negócio fechado foi ignorado
  const leads = (await call(`/api/leads?campaign_id=${camp.id}`)).data;
  assert.equal(leads.length, 2);
  assert.equal(leads[0].city, 'Campinas');
  assert.ok(leads[0].sources.some((s) => s.url.startsWith('https://maps.google.com')));
  assert.equal(pages[pages.length - 1].q, 'loja de móveis em Campinas');
});

test('validação da campanha e proteção do servidor local', async (t) => {
  const app = await boot();
  t.after(app.close);
  const bad = await app.call('/api/campaigns', { method: 'POST', body: { name: 'x' } });
  assert.equal(bad.status, 400);
  assert.match(bad.data.error, /seu nome/);
  // demo não aceita busca real e vice-versa
  const demo = (await app.call('/api/campaigns')).data.find((c) => c.is_demo);
  const r = (await app.call(`/api/campaigns/${demo.id}/prospect`, { method: 'POST', body: { source: 'places' } })).data;
  assert.equal(r.status, 'erro');
  // Host/Origin externos são recusados
  const res = await fetch(`${app.base}/api/campaigns`, { method: 'POST', headers: { 'content-type': 'application/json', origin: 'https://evil.example' }, body: '{}' });
  assert.equal(res.status, 403);
});
