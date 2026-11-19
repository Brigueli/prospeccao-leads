'use strict';

const STOP = new Set(['para', 'com', 'sem', 'dos', 'das', 'uma', 'uns', 'umas', 'por', 'que', 'nos', 'nas',
  'de', 'da', 'do', 'em', 'e', 'a', 'o', 'as', 'os', 'ou', 'um', 'na', 'no', 'ao', 'aos', 'empresa', 'empresas',
  'pequenas', 'pequena', 'medias', 'media', 'grande', 'regiao', 'estado', 'cidade', 'perfil']);

function nowIso() { return new Date().toISOString(); }

// minúsculas, sem acentos, espaços colapsados
function norm(s) {
  return String(s == null ? '' : s).normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase().replace(/\s+/g, ' ').trim();
}

function tokens(s) {
  return norm(s).split(/[^a-z0-9]+/).filter((t) => t.length >= 4 && !STOP.has(t));
}

// "odontologia" e "odontologica" casam pelo prefixo de 5 letras
function prefix(t) { return t.slice(0, 5); }

function domainOf(url) {
  if (!url) return '';
  try {
    const u = new URL(/^https?:\/\//i.test(url) ? url : `https://${url}`);
    return u.hostname.toLowerCase().replace(/^www\./, '');
  } catch { return ''; }
}

function normalizeUrl(url) {
  if (!url) return '';
  const s = String(url).trim();
  if (!s) return '';
  const full = /^https?:\/\//i.test(s) ? s : `https://${s}`;
  try { return new URL(full).toString(); } catch { return ''; }
}

const SOCIAL = /(^|\.)(instagram|facebook|fb|linktr|linktree|wa|whatsapp|tiktok|youtube|linkedin|twitter|x|ifood|beacons|bio\.link|google|goo\.gl|maps\.app\.goo\.gl)\.(com|me|ee|gl|link)?$/i;
// redes sociais e agregadores não contam como "site próprio" para deduplicar por domínio
function isOwnDomain(domain) {
  return !!domain && !SOCIAL.test(domain) && !/(instagram|facebook|linktr\.ee|wa\.me|whatsapp)/i.test(domain);
}

function truncateWords(s, max) {
  const t = String(s || '').replace(/\s+/g, ' ').trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max);
  return cut.slice(0, Math.max(cut.lastIndexOf(' '), 20)).replace(/[,;:.\-–—\s]+$/, '');
}

function parseJson(s, fallback) {
  if (s == null || s === '') return fallback;
  try { return JSON.parse(s); } catch { return fallback; }
}

function httpError(status, message) {
  const e = new Error(message);
  e.status = status;
  return e;
}

module.exports = { nowIso, norm, tokens, prefix, domainOf, normalizeUrl, isOwnDomain, truncateWords, parseJson, httpError };
