'use strict';
process.env.ALLOW_PRIVATE_FETCH = '1'; // só nos testes: permite ler o servidor de fixture em 127.0.0.1
process.env.AI_PROVIDER = 'none';
const http = require('node:http');
const { start } = require('../server');

async function boot() {
  const { server, svc, port } = await start({ port: 0, dbFile: ':memory:' });
  const base = `http://127.0.0.1:${port}`;
  const call = async (path, { method = 'GET', body, raw } = {}) => {
    const res = await fetch(base + path, { method, headers: body ? { 'content-type': 'application/json' } : {}, body: body ? JSON.stringify(body) : undefined });
    if (raw) return res;
    const data = await res.json();
    return { status: res.status, data };
  };
  return { server, svc, base, call, close: () => new Promise((r) => server.close(r)) };
}

async function waitRun(call, id) {
  for (let i = 0; i < 100; i++) {
    const { data } = await call(`/api/runs/${id}`);
    if (data.status !== 'executando') return data;
    await new Promise((r) => setTimeout(r, 50));
  }
  throw new Error('rodada não terminou');
}

function fixtureServer(routes) {
  return new Promise((resolve) => {
    const s = http.createServer((req, res) => {
      const r = routes[req.url.split('?')[0]];
      if (!r) { res.writeHead(404); return res.end('nf'); }
      res.writeHead(200, { 'content-type': r.type || 'text/html; charset=utf-8' });
      res.end(typeof r === 'string' ? r : r.body);
    });
    s.listen(0, '127.0.0.1', () => resolve({ s, url: `http://127.0.0.1:${s.address().port}`, close: () => new Promise((x) => s.close(x)) }));
  });
}

module.exports = { boot, waitRun, fixtureServer };
