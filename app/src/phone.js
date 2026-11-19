'use strict';

/**
 * Normaliza telefones brasileiros (e internacionais com "+") para formato E.164 sem "+".
 * Retorna null quando não dá para interpretar o número.
 * waOk = true somente para celulares (BR) e números internacionais explícitos.
 */
function normalizePhone(raw) {
  if (raw == null) return null;
  const s = String(raw).trim();
  if (!s) return null;
  const plus = s.startsWith('+');
  let d = s.replace(/\D/g, '');
  if (!d) return null;

  if (plus && !d.startsWith('55')) {
    if (d.length < 8 || d.length > 15) return null;
    return { e164: d, display: `+${d}`, type: 'internacional', waOk: true, note: '' };
  }

  d = d.replace(/^0+/, '');
  if (d.startsWith('55') && (d.length === 12 || d.length === 13)) d = d.slice(2);

  let note = '';
  if (d.length === 10 && /^[6-9]/.test(d[2])) { // celular antigo, sem o 9
    d = d.slice(0, 2) + '9' + d.slice(2);
    note = 'Adicionado o 9º dígito (formato antigo de celular).';
  }
  if (d.length !== 10 && d.length !== 11) return null;
  const ddd = Number(d.slice(0, 2));
  if (ddd < 11 || ddd > 99 || ddd % 10 === 0) return null;

  const local = d.slice(2);
  let type;
  if (d.length === 11) {
    if (local[0] !== '9') return null;
    type = 'celular';
  } else {
    if (!/^[2-5]/.test(local)) return null;
    type = 'fixo';
    note = 'Telefone fixo: o WhatsApp não é garantido.';
  }
  const display = type === 'celular'
    ? `(${d.slice(0, 2)}) ${local.slice(0, 5)}-${local.slice(5)}`
    : `(${d.slice(0, 2)}) ${local.slice(0, 4)}-${local.slice(4)}`;
  return { e164: `55${d}`, display, type, waOk: type === 'celular', note };
}

function waLink(e164, text) {
  return `https://wa.me/${e164}?text=${encodeURIComponent(text)}`;
}

module.exports = { normalizePhone, waLink };
