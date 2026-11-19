'use strict';
const ExcelJS = require('exceljs');

const COLUMNS = [
  ['Campanha', (l) => l.campaign_name, 24],
  ['Empresa', (l) => l.name, 30],
  ['Exemplo fictício', (l) => (l.is_example ? 'SIM — empresa fictícia de demonstração' : ''), 18],
  ['Segmento', (l) => l.segment, 22],
  ['Cidade', (l) => l.city, 16],
  ['Site', (l) => l.website, 30],
  ['Telefone comercial', (l) => l.phone, 18],
  ['Telefone (internacional)', (l) => l.phone_norm, 18],
  ['Tipo do telefone', (l) => (l.phone_info ? l.phone_info.type : ''), 14],
  ['Contato (pessoa/cargo)', (l) => (l.contact_name && l.contact_role && l.contact_source ? `${l.contact_name} — ${l.contact_role}` : ''), 26],
  ['Fonte do contato', (l) => (l.contact_name && l.contact_role ? l.contact_source : ''), 28],
  ['Observação', (l) => l.note, 36],
  ['Classificação', (l) => l.classification, 18],
  ['Justificativa', (l) => l.class_reason, 50],
  ['Fatos confirmados', (l) => l.facts.map((f) => `• ${f.text} [${f.source_url}]`).join('\n'), 60],
  ['Hipóteses (não confirmadas)', (l) => l.hypotheses.map((h) => `• ${h.text}`).join('\n'), 50],
  ['Fontes', (l) => l.sources.map((s) => s.url).join('\n'), 40],
  ['Data da pesquisa', (l) => (l.researched_at || '').slice(0, 10), 14],
  ['Mensagem', (l) => l.approved_text || l.draft_text || '', 60],
  ['Situação da mensagem', (l) => (l.approved_text ? 'aprovada' : l.draft_text ? (l.draft_needs_research ? 'precisa de pesquisa' : 'rascunho') : 'sem mensagem'), 18],
  ['Detalhe usado na mensagem', (l) => l.draft_detail || '', 44],
  ['Fonte do detalhe', (l) => l.draft_detail_source || '', 36],
  ['Status', (l) => l.status, 14],
  ['Vezes encontrado', (l) => l.seen_count, 10],
  ['Criado em', (l) => (l.created_at || '').slice(0, 10), 12],
];

// Evita que textos coletados da web virem fórmulas no Excel/LibreOffice.
function safe(v) {
  if (typeof v !== 'string') return v == null ? '' : v;
  return /^[=+\-@\t\r]/.test(v) ? `'${v}` : v;
}

function rows(leads) { return leads.map((l) => COLUMNS.map(([, fn]) => safe(fn(l)))); }

function toCsv(leads) {
  const esc = (v) => { const s = String(v); return /[";\n\r,]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
  const lines = [COLUMNS.map(([h]) => esc(h)).join(';'), ...rows(leads).map((r) => r.map(esc).join(';'))];
  return `﻿${lines.join('\r\n')}\r\n`; // BOM + ";" para abrir direto no Excel em pt-BR
}

async function toXlsx(leads) {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'Prospector local';
  wb.created = new Date();
  const ws = wb.addWorksheet('Leads', { views: [{ state: 'frozen', ySplit: 1 }] });
  ws.columns = COLUMNS.map(([header, , width]) => ({ header, width }));
  rows(leads).forEach((r) => ws.addRow(r));
  const head = ws.getRow(1);
  head.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  head.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F3A5F' } };
  head.alignment = { vertical: 'middle', wrapText: true };
  ws.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: COLUMNS.length } };
  ws.eachRow((row, n) => { if (n > 1) row.alignment = { vertical: 'top', wrapText: true }; });
  return Buffer.from(await wb.xlsx.writeBuffer());
}

module.exports = { toCsv, toXlsx, COLUMNS };
