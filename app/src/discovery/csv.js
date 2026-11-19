'use strict';
const { parse } = require('csv-parse/sync');
const { norm } = require('../util');

const ALIASES = {
  name: ['nome', 'empresa', 'nome da empresa', 'razao social', 'name', 'company'],
  segment: ['segmento', 'nicho', 'categoria', 'segment'],
  city: ['cidade', 'city', 'municipio'],
  address: ['endereco', 'address'],
  website: ['site', 'website', 'url', 'dominio', 'pagina'],
  phone: ['telefone', 'celular', 'whatsapp', 'phone', 'telefone comercial', 'fone'],
  note: ['observacao', 'observacoes', 'nota', 'obs', 'note', 'notes'],
  sourceUrl: ['fonte', 'link da fonte', 'fonte url', 'source', 'source url'],
  contact_name: ['contato nome', 'contato', 'pessoa', 'contact name', 'contato_nome'],
  contact_role: ['contato cargo', 'cargo', 'contact role', 'contato_cargo'],
  contact_source: ['contato fonte', 'fonte do contato', 'contact source', 'contato_fonte'],
};

const TEMPLATE = 'nome;segmento;cidade;site;telefone;observacao;fonte;contato_nome;contato_cargo;contato_fonte\n' +
  'Clínica Exemplo Ltda;Clínica odontológica;Campinas;https://exemplo.com.br;(19) 99999-0000;Atende convênios;https://exemplo.com.br/sobre;;;\n';

function detectDelimiter(text) {
  const head = text.split(/\r?\n/, 1)[0] || '';
  const counts = { ';': (head.match(/;/g) || []).length, ',': (head.match(/,/g) || []).length, '\t': (head.match(/\t/g) || []).length };
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
}

/** Lê CSV (separador , ; ou tab) e devolve { candidates, skipped }. */
function parseCsv(text, { maxRows = 2000 } = {}) {
  const clean = String(text || '').replace(/^﻿/, '');
  if (!clean.trim()) throw new Error('O arquivo CSV está vazio.');
  let rows;
  try {
    rows = parse(clean, { delimiter: detectDelimiter(clean), columns: (h) => h.map((x) => norm(x).replace(/_/g, ' ')), skip_empty_lines: true, relax_column_count: true, trim: true });
  } catch (e) { throw new Error(`Não consegui ler o CSV: ${e.message}`); }
  if (!rows.length) throw new Error('O CSV não tem linhas de dados.');
  const header = Object.keys(rows[0]);
  const col = {};
  for (const [field, names] of Object.entries(ALIASES)) col[field] = header.find((h) => names.includes(h));
  if (!col.name) throw new Error(`Não encontrei a coluna com o nome da empresa. Use um cabeçalho como "nome" ou "empresa". Colunas lidas: ${header.join(', ')}`);

  const candidates = [];
  const skipped = [];
  rows.slice(0, maxRows).forEach((r, i) => {
    const get = (f) => (col[f] ? String(r[col[f]] || '').trim() : '');
    const name = get('name');
    if (!name) { skipped.push(`Linha ${i + 2}: sem nome, ignorada.`); return; }
    candidates.push({
      name, segment: get('segment'), city: get('city'), address: get('address'), website: get('website'), phone: get('phone'),
      note: get('note'), sourceUrl: /^https?:\/\//i.test(get('sourceUrl')) ? get('sourceUrl') : '', sourceLabel: 'Fonte informada no CSV',
      contact_name: get('contact_name'), contact_role: get('contact_role'), contact_source: get('contact_source'),
      origin: 'csv',
    });
  });
  if (rows.length > maxRows) skipped.push(`Foram lidas só as primeiras ${maxRows} linhas.`);
  return { candidates, skipped };
}

module.exports = { parseCsv, TEMPLATE };
