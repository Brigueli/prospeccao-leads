'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { normalizePhone, waLink } = require('../src/phone');
const { checkMessage, templateDraft } = require('../src/message');
const { assertPublicUrl } = require('../src/net');
const { parseCsv } = require('../src/discovery/csv');
const { qualify } = require('../src/qualify');
const { toCsv } = require('../src/export');

test('telefone: normaliza formatos brasileiros e valida', () => {
  assert.equal(normalizePhone('(19) 99999-0000').e164, '5519999990000');
  assert.equal(normalizePhone('+55 19 9 9999-0000').e164, '5519999990000');
  assert.equal(normalizePhone('019 99999 0000').e164, '5519999990000');
  assert.equal(normalizePhone('(19) 3000-0110').waOk, false);
  assert.equal(normalizePhone('1999990000').e164, '5519999990000'); // celular antigo sem o 9
  assert.equal(normalizePhone('123'), null);
  assert.equal(normalizePhone('(00) 99999-0000'), null);
  assert.equal(normalizePhone('+1 202 555 0101').e164, '12025550101');
});

test('wa.me: número internacional e texto codificado', () => {
  const u = waLink('5519999990000', 'Oi, tudo bem? & "teste"\nlinha 2');
  assert.match(u, /^https:\/\/wa\.me\/5519999990000\?text=/);
  assert.equal(decodeURIComponent(u.split('text=')[1]), 'Oi, tudo bem? & "teste"\nlinha 2');
});

test('mensagem: avisa urgência, falsa familiaridade e falta de pergunta', () => {
  assert.ok(checkMessage('Oferta limitada, só hoje! Compre.').length >= 2);
  assert.ok(checkMessage('Já usei os serviços de vocês, ótimo. Vamos falar?').some((w) => /conhecer|usado/.test(w)));
  assert.ok(checkMessage('Identifiquei um problema no seu atendimento. Posso ajudar?').length === 1);
  assert.deepEqual(checkMessage('Oi, tudo bem? Faz sentido conversarmos?'), []);
});

test('mensagem: sem fato confirmado => precisa de pesquisa e não afirma nada sobre a empresa', () => {
  const camp = { seller_name: 'Ana', company: 'X', offer: 'sistema Y', problem: 'reduzir faltas', voice: '', voice_examples: '', differentials: '', cases_text: '' };
  const d = templateDraft({ campaign: camp, lead: { name: 'Acme', contact_name: 'Maria', contact_role: '', contact_source: '' }, facts: [] });
  assert.equal(d.needsResearch, true);
  assert.ok(d.missing.length > 10);
  assert.ok(!/Vi no|vi que|Maria/.test(d.text), d.text);
});

test('mensagem: nome da pessoa só com cargo e fonte confirmados', () => {
  const camp = { seller_name: 'Ana', company: '', offer: 'sistema Y', problem: '', voice: '', voice_examples: '', differentials: '', cases_text: '' };
  const facts = [{ kind: 'servico', short: 'vocês destacam “algo”', text: 't', source_url: 'https://a.com', source_label: 'Site da empresa (a.com)' }];
  const ok = templateDraft({ campaign: camp, lead: { name: 'Acme', contact_name: 'Maria Lima', contact_role: 'Gerente', contact_source: 'https://a.com/equipe' }, facts });
  assert.match(ok.text, /Oi, Maria/);
  const no = templateDraft({ campaign: camp, lead: { name: 'Acme', contact_name: 'Maria Lima', contact_role: 'Gerente', contact_source: '' }, facts });
  assert.ok(!/Maria/.test(no.text));
});

test('SSRF: bloqueia hosts internos', async () => {
  const prev = process.env.ALLOW_PRIVATE_FETCH;
  delete process.env.ALLOW_PRIVATE_FETCH;
  try {
    for (const u of ['http://127.0.0.1/', 'http://localhost:3000/', 'http://169.254.169.254/latest', 'http://[::1]/', 'http://10.0.0.5/', 'file:///etc/passwd']) {
      await assert.rejects(assertPublicUrl(u), undefined, u);
    }
  } finally { process.env.ALLOW_PRIVATE_FETCH = prev; }
});

test('CSV: detecta separador e cabeçalhos em português; reporta coluna ausente', () => {
  const r = parseCsv('Empresa;Cidade;Telefone;Site\nAcme;Campinas;(19) 99999-0000;acme.com.br\n;x;y;z\n');
  assert.equal(r.candidates.length, 1);
  assert.equal(r.candidates[0].website, 'acme.com.br');
  assert.equal(r.skipped.length, 1);
  assert.throws(() => parseCsv('a,b\n1,2\n'), /coluna/);
  assert.throws(() => parseCsv(''), /vazio/);
});

test('qualificação: critério de descarte e segmento', () => {
  const camp = { segment: 'clínica odontológica', region: 'Campinas', profile: '', discard_criteria: 'franquia' };
  const ev = { facts: [{ kind: 'servico', source_url: 'https://a.com' }], siteText: 'clinica odontologica implantes' };
  assert.equal(qualify(camp, { name: 'A', segment: '', city: 'Campinas', note: '', address: '' }, ev).classification, 'bom encaixe');
  assert.equal(qualify(camp, { name: 'A franquia', segment: '', city: 'Campinas', note: '', address: '' }, ev).classification, 'fora do perfil');
  assert.equal(qualify(camp, { name: 'A', segment: '', city: 'Manaus', note: '', address: '' }, ev).classification, 'precisa de revisão');
  assert.equal(qualify(camp, { name: 'Vet', segment: 'Pet shop', city: 'Campinas', note: '', address: '' }, { facts: [], siteText: '' }).classification, 'fora do perfil');
});

test('exportação CSV: neutraliza fórmulas e escapa aspas', () => {
  const lead = { campaign_name: 'C', name: '=HYPERLINK("x")', facts: [], hypotheses: [], sources: [], phone_info: null, status: 'novo' };
  const csv = toCsv([lead]);
  assert.ok(csv.includes('\'=HYPERLINK(""x"")'));
  assert.ok(csv.startsWith('﻿Campanha;Empresa'));
});
