'use strict';
const dns = require('node:dns').promises;
const net = require('node:net');

function isPrivateIp(ip) {
  if (net.isIPv4(ip)) {
    const [a, b] = ip.split('.').map(Number);
    return a === 10 || a === 127 || a === 0 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) || (a === 100 && b >= 64 && b <= 127) || a >= 224;
  }
  if (net.isIPv6(ip)) {
    const l = ip.toLowerCase();
    if (l === '::1' || l === '::') return true;
    if (l.startsWith('::ffff:')) return isPrivateIp(l.slice(7));
    return /^f[cd]/.test(l) || /^fe[89ab]/.test(l);
  }
  return true;
}

// Bloqueia endereços internos (evita que um CSV faça o servidor local acessar a rede interna).
async function assertPublicUrl(url) {
  const u = new URL(url);
  if (!/^https?:$/.test(u.protocol)) throw new Error('Protocolo não permitido');
  if (process.env.ALLOW_PRIVATE_FETCH === '1') return u;
  const host = u.hostname.replace(/^\[|\]$/g, '');
  if (host === 'localhost' || host.endsWith('.localhost') || host.endsWith('.local') || host.endsWith('.internal')) {
    throw new Error('Endereço interno bloqueado');
  }
  const addrs = net.isIP(host) ? [{ address: host }] : await dns.lookup(host, { all: true });
  if (!addrs.length || addrs.some((a) => isPrivateIp(a.address))) throw new Error('Endereço interno bloqueado');
  return u;
}

function decode(buf, contentType) {
  const m = /charset=([\w-]+)/i.exec(contentType || '') || /<meta[^>]+charset=["']?([\w-]+)/i.exec(buf.subarray(0, 2048).toString('latin1'));
  const cs = (m ? m[1] : 'utf-8').toLowerCase();
  try { return new TextDecoder(cs).decode(buf); } catch { return new TextDecoder('utf-8').decode(buf); }
}

async function safeFetch(url, { timeout = 8000, maxBytes = 1_500_000, accept = 'text/html,*/*;q=0.5', headers = {} } = {}) {
  const contact = process.env.USER_AGENT_CONTACT ? ` (+${process.env.USER_AGENT_CONTACT})` : '';
  let current = url;
  for (let hop = 0; hop < 5; hop++) {
    await assertPublicUrl(current);
    const res = await fetch(current, {
      redirect: 'manual',
      signal: AbortSignal.timeout(timeout),
      headers: { 'user-agent': `ProspectorLocal/1.0${contact}`, accept, 'accept-language': 'pt-BR,pt;q=0.9', ...headers },
    });
    if (res.status >= 300 && res.status < 400 && res.headers.get('location')) {
      current = new URL(res.headers.get('location'), current).toString();
      continue;
    }
    const chunks = [];
    let size = 0;
    if (res.body) {
      for await (const c of res.body) {
        size += c.length;
        if (size > maxBytes) break;
        chunks.push(c);
      }
    }
    const buf = Buffer.concat(chunks);
    return { status: res.status, url: current, contentType: res.headers.get('content-type') || '', body: decode(buf, res.headers.get('content-type')) };
  }
  throw new Error('Redirecionamentos demais');
}

module.exports = { safeFetch, assertPublicUrl, isPrivateIp };
