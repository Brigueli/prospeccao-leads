'use strict';
const path = require('node:path');
try { process.loadEnvFile(path.join(__dirname, '.env')); } catch { /* .env é opcional */ }

const express = require('express');
const { openDb } = require('./src/db');
const { Service, STATUSES, CLASSES } = require('./src/service');
const { toCsv, toXlsx } = require('./src/export');
const { TEMPLATE } = require('./src/discovery/csv');
const { aiConfig } = require('./src/message');
const { normalizePhone } = require('./src/phone');

function createApp(svc) {
  const app = express();
  app.disable('x-powered-by');

  // O servidor é local e sem login: só aceita Host/Origin locais (protege contra páginas de terceiros e DNS rebinding).
  app.use((req, res, next) => {
    const host = String(req.headers.host || '').replace(/:\d+$/, '');
    if (!['localhost', '127.0.0.1', '[::1]'].includes(host)) return res.status(403).json({ error: 'Host não permitido.' });
    const origin = req.headers.origin;
    if (origin && req.method !== 'GET' && req.method !== 'HEAD') {
      try { if (new URL(origin).host !== req.headers.host) return res.status(403).json({ error: 'Origem não permitida.' }); } catch { return res.status(403).json({ error: 'Origem inválida.' }); }
    }
    next();
  });
  app.use(express.json({ limit: '8mb' }));
  app.use(express.static(path.join(__dirname, 'public')));

  const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res)).catch(next);
  const id = (req) => Number(req.params.id);

  app.get('/api/config', (req, res) => {
    const ai = aiConfig();
    res.json({
      statuses: STATUSES, classifications: CLASSES,
      places: { configured: !!process.env.GOOGLE_PLACES_API_KEY },
      ai: { provider: ai.provider, configured: ai.configured, model: ai.model },
    });
  });

  // campanhas
  app.get('/api/campaigns', (req, res) => res.json(svc.listCampaigns()));
  app.post('/api/campaigns', (req, res) => res.status(201).json(svc.saveCampaign(req.body || {})));
  app.get('/api/campaigns/:id', (req, res) => res.json(svc.getCampaign(id(req))));
  app.put('/api/campaigns/:id', (req, res) => res.json(svc.saveCampaign(req.body || {}, id(req))));
  app.post('/api/demo/reset', (req, res) => { svc.resetDemo(); res.json({ ok: true }); });
  app.get('/api/campaigns/:id/runs', (req, res) => res.json(svc.listRuns(id(req))));
  app.post('/api/campaigns/:id/prospect', (req, res) => res.status(202).json(svc.startRun(id(req), { source: (req.body || {}).source })));
  app.post('/api/campaigns/:id/import', (req, res) => res.status(202).json(svc.startRun(id(req), { source: 'csv', csv: (req.body || {}).csv })));
  app.get('/api/runs/:id', (req, res) => res.json(svc.getRun(id(req))));
  app.get('/api/csv-template.csv', (req, res) => {
    res.set({ 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': 'attachment; filename="modelo-leads.csv"' });
    res.send(`﻿${TEMPLATE}`);
  });

  // leads
  app.get('/api/leads', (req, res) => res.json(svc.queryLeads(req.query)));
  app.get('/api/leads/:id', (req, res) => res.json(svc.getLead(id(req))));
  app.patch('/api/leads/:id', (req, res) => res.json(svc.updateLead(id(req), req.body || {})));
  app.post('/api/leads/:id/research', wrap(async (req, res) => res.json(await svc.rerunResearch(id(req)))));
  app.post('/api/leads/:id/drafts', wrap(async (req, res) => {
    const b = req.body || {};
    res.status(201).json(await svc.createDraft(id(req), b.text !== undefined ? { text: b.text } : {}));
  }));
  app.post('/api/leads/:id/approve', (req, res) => res.json(svc.approveDraft(id(req), { force: !!(req.body || {}).force })));
  app.post('/api/leads/:id/whatsapp', (req, res) => res.json(svc.openWhatsapp(id(req))));
  app.post('/api/leads/:id/sent', (req, res) => res.json(svc.markSent(id(req))));
  app.post('/api/leads/:id/replied', (req, res) => res.json(svc.markReplied(id(req))));
  app.post('/api/leads/:id/discard', (req, res) => res.json(svc.discard(id(req), (req.body || {}).reason)));
  app.post('/api/leads/:id/reopen', (req, res) => res.json(svc.reopen(id(req))));
  app.post('/api/leads/:id/dnc', (req, res) => res.json(svc.doNotContact(id(req), (req.body || {}).reason)));

  // bloqueios
  app.get('/api/dnc', (req, res) => res.json(svc.listDnc()));
  app.post('/api/dnc', (req, res) => res.status(201).json(svc.addDnc((req.body || {}).phone, (req.body || {}).reason)));
  app.delete('/api/dnc/:phone', (req, res) => res.json(svc.removeDnc(req.params.phone)));

  // exportação (mesmos filtros do pipeline)
  const stamp = () => new Date().toISOString().slice(0, 10);
  app.get('/api/export.csv', (req, res) => {
    res.set({ 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': `attachment; filename="leads-${stamp()}.csv"` });
    res.send(toCsv(svc.queryLeads({ ...req.query, limit: 5000 })));
  });
  app.get('/api/export.xlsx', wrap(async (req, res) => {
    const buf = await toXlsx(svc.queryLeads({ ...req.query, limit: 5000 }));
    res.set({ 'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'Content-Disposition': `attachment; filename="leads-${stamp()}.xlsx"` });
    res.send(buf);
  }));

  app.use('/api', (req, res) => res.status(404).json({ error: 'Rota não encontrada.' }));
  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    if (err.type === 'entity.too.large') return res.status(413).json({ error: 'Arquivo grande demais (limite de 8 MB).' });
    if (err.type === 'entity.parse.failed') return res.status(400).json({ error: 'JSON inválido.' });
    const status = err.status || 500;
    if (status >= 500) console.error(err);
    res.status(status).json({ error: status >= 500 ? `Erro interno: ${err.message}` : err.message });
  });
  return app;
}

function start({ port = Number(process.env.PORT) || 3000, dbFile } = {}) {
  const svc = new Service(openDb(dbFile));
  const app = createApp(svc);
  return new Promise((resolve) => {
    const server = app.listen(port, '127.0.0.1', () => resolve({ server, svc, port: server.address().port }));
  });
}

if (require.main === module) {
  start().then(({ port }) => {
    const ai = aiConfig();
    console.log(`\nProspector rodando em http://localhost:${port}`);
    console.log(`  Google Places: ${process.env.GOOGLE_PLACES_API_KEY ? 'configurado' : 'NÃO configurado (use CSV ou a demonstração)'}`);
    console.log(`  IA de redação: ${ai.configured ? `${ai.provider} (${ai.model})` : 'desligada (gerador por modelos)'}\n`);
  });
}

module.exports = { createApp, start, normalizePhone };
