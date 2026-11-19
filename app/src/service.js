'use strict';
const { nowIso, domainOf, normalizeUrl, isOwnDomain, parseJson, httpError, norm } = require('./util');
const { normalizePhone, waLink } = require('./phone');
const { researchSite, buildEvidence, pickPublishedPhone, parsePage } = require('./research');
const { qualify } = require('./qualify');
const { generateDraft, checkMessage } = require('./message');
const { searchPlaces } = require('./discovery/places');
const { parseCsv } = require('./discovery/csv');
const { DEMO_CAMPAIGN, demoCandidates } = require('./discovery/demo');

const STATUSES = ['novo', 'em revisão', 'aprovado', 'enviado', 'respondeu', 'descartado', 'não contatar'];
const CLASSES = ['bom encaixe', 'precisa de revisão', 'fora do perfil'];
const CAMPAIGN_FIELDS = ['name', 'seller_name', 'company', 'offer', 'problem', 'segment', 'region', 'profile', 'differentials', 'cases_text', 'voice', 'voice_examples', 'discard_criteria'];
const HARD_RULE = /urgência artificial|Afirma conhecer/;

class Service {
  constructor(db) {
    this.db = db;
    this.running = new Set();
    // rodadas que ficaram "executando" por causa de um reinício do servidor
    db.prepare("UPDATE runs SET status='interrompida', finished_at=?, error=CASE WHEN error='' THEN 'O servidor foi reiniciado durante a rodada. O que já foi salvo foi preservado.' ELSE error END WHERE status='executando'").run(nowIso());
    this.seedDemo();
  }

  // ---------- campanhas ----------
  seedDemo() {
    const has = this.db.prepare('SELECT id FROM campaigns WHERE is_demo=1').get();
    if (has) return has.id;
    const t = nowIso();
    const c = DEMO_CAMPAIGN;
    const r = this.db.prepare(`INSERT INTO campaigns (name,is_demo,seller_name,company,offer,problem,segment,region,profile,differentials,cases_text,voice,voice_examples,leads_per_run,discard_criteria,created_at,updated_at)
      VALUES (?,1,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).run(c.name, c.seller_name, c.company, c.offer, c.problem, c.segment, c.region, c.profile, c.differentials, c.cases_text, c.voice, c.voice_examples, c.leads_per_run, c.discard_criteria, t, t);
    return Number(r.lastInsertRowid);
  }

  resetDemo() {
    const c = this.db.prepare('SELECT id FROM campaigns WHERE is_demo=1').get();
    if (!c) return this.seedDemo();
    if (this.running.has(c.id)) throw httpError(409, 'Há uma rodada da demonstração em andamento.');
    const ids = this.db.prepare('SELECT id FROM leads WHERE campaign_id=?').all(c.id).map((r) => r.id);
    this.db.exec('BEGIN');
    try {
      for (const id of ids) {
        this.db.prepare('DELETE FROM lead_events WHERE lead_id=?').run(id);
        this.db.prepare('DELETE FROM drafts WHERE lead_id=?').run(id);
        this.db.prepare('DELETE FROM dnc WHERE lead_id=?').run(id);
        this.db.prepare('DELETE FROM leads WHERE id=?').run(id);
      }
      this.db.prepare('DELETE FROM runs WHERE campaign_id=?').run(c.id);
      this.db.exec('COMMIT');
    } catch (e) { this.db.exec('ROLLBACK'); throw e; }
    return c.id;
  }

  listCampaigns() {
    return this.db.prepare(`SELECT c.*, (SELECT COUNT(*) FROM leads l WHERE l.campaign_id=c.id) AS lead_count FROM campaigns c ORDER BY is_demo DESC, id DESC`).all();
  }

  getCampaign(id) {
    const c = this.db.prepare('SELECT * FROM campaigns WHERE id=?').get(id);
    if (!c) throw httpError(404, 'Campanha não encontrada.');
    return c;
  }

  saveCampaign(data, id) {
    const v = {};
    for (const f of CAMPAIGN_FIELDS) v[f] = String(data[f] == null ? '' : data[f]).trim();
    const per = Number(data.leads_per_run);
    v.leads_per_run = Number.isFinite(per) ? Math.min(100, Math.max(1, Math.round(per))) : 10;
    const missing = [['name', 'nome da campanha'], ['seller_name', 'seu nome'], ['offer', 'o que você vende'], ['segment', 'segmento']].filter(([k]) => !v[k]).map(([, l]) => l);
    if (missing.length) throw httpError(400, `Preencha: ${missing.join(', ')}.`);
    const t = nowIso();
    if (id) {
      this.getCampaign(id);
      this.db.prepare(`UPDATE campaigns SET ${[...CAMPAIGN_FIELDS, 'leads_per_run'].map((f) => `${f}=?`).join(',')}, updated_at=? WHERE id=?`)
        .run(...CAMPAIGN_FIELDS.map((f) => v[f]), v.leads_per_run, t, id);
      return this.getCampaign(id);
    }
    const r = this.db.prepare(`INSERT INTO campaigns (${[...CAMPAIGN_FIELDS, 'leads_per_run'].join(',')},created_at,updated_at) VALUES (${[...CAMPAIGN_FIELDS, 'leads_per_run'].map(() => '?').join(',')},?,?)`)
      .run(...CAMPAIGN_FIELDS.map((f) => v[f]), v.leads_per_run, t, t);
    return this.getCampaign(Number(r.lastInsertRowid));
  }

  // ---------- eventos ----------
  event(leadId, type, detail = '') {
    this.db.prepare('INSERT INTO lead_events (lead_id,type,detail,created_at) VALUES (?,?,?,?)').run(leadId, type, detail, nowIso());
  }

  // ---------- leads ----------
  isBlocked(phoneNorm) {
    return !!phoneNorm && !!this.db.prepare('SELECT 1 FROM dnc WHERE phone_norm=?').get(phoneNorm);
  }

  findDuplicate(campaignId, { domain, phoneNorm, name, city }, exceptId = 0) {
    const q = this.db;
    if (domain) {
      const r = q.prepare('SELECT * FROM leads WHERE campaign_id=? AND domain=? AND id<>?').get(campaignId, domain, exceptId);
      if (r) return { lead: r, by: 'domínio' };
    }
    if (phoneNorm) {
      const r = q.prepare('SELECT * FROM leads WHERE campaign_id=? AND phone_norm=? AND id<>?').get(campaignId, phoneNorm, exceptId);
      if (r) return { lead: r, by: 'telefone' };
    }
    if (!domain && !phoneNorm) {
      const r = q.prepare('SELECT * FROM leads WHERE campaign_id=? AND lower(name)=? AND lower(city)=? AND id<>?').get(campaignId, String(name).toLowerCase(), String(city || '').toLowerCase(), exceptId);
      if (r) return { lead: r, by: 'nome e cidade' };
    }
    return null;
  }

  rowToLead(r) {
    if (!r) return null;
    const ph = normalizePhone(r.phone) || null;
    const lead = {
      ...r,
      is_example: !!r.is_example,
      facts: parseJson(r.facts, []),
      hypotheses: parseJson(r.hypotheses, []),
      sources: parseJson(r.sources, []),
      phone_info: ph,
      blocked: r.status === 'não contatar' || this.isBlocked(r.phone_norm),
    };
    lead.whatsapp = this.whatsappState(lead);
    return lead;
  }

  whatsappState(lead) {
    if (lead.blocked) return { can_open: false, reason: 'Número marcado como "não contatar".' };
    if (!lead.phone_norm) return { can_open: false, reason: 'Sem telefone comercial válido.' };
    const ph = normalizePhone(lead.phone_norm.startsWith('55') ? lead.phone_norm : `+${lead.phone_norm}`);
    if (!ph || !ph.waOk) return { can_open: false, reason: ph ? 'Telefone fixo: o WhatsApp não é garantido.' : 'Telefone inválido.' };
    if (!lead.approved_draft_id) return { can_open: false, reason: 'Aprove o rascunho para liberar a conversa.' };
    if (!['aprovado', 'enviado'].includes(lead.status)) return { can_open: false, reason: `Status atual: ${lead.status}.` };
    return { can_open: true, reason: '' };
  }

  queryLeads({ campaign_id, status, classification, q, limit = 1000 } = {}) {
    const where = [];
    const args = [];
    if (campaign_id) { where.push('l.campaign_id=?'); args.push(Number(campaign_id)); }
    if (status && STATUSES.includes(status)) { where.push('l.status=?'); args.push(status); }
    if (classification && CLASSES.includes(classification)) { where.push('l.classification=?'); args.push(classification); }
    if (q && String(q).trim()) {
      const like = `%${String(q).trim().toLowerCase()}%`;
      where.push("(lower(l.name) LIKE ? OR lower(l.city) LIKE ? OR l.phone_norm LIKE ? OR lower(l.domain) LIKE ? OR lower(l.note) LIKE ? OR lower(l.class_reason) LIKE ? OR lower(l.segment) LIKE ?)");
      args.push(like, like, like, like, like, like, like);
    }
    const rows = this.db.prepare(`SELECT l.*, c.name AS campaign_name, d.text AS draft_text, d.needs_research AS draft_needs_research, d.detail_text AS draft_detail, d.detail_source AS draft_detail_source,
        a.text AS approved_text
      FROM leads l JOIN campaigns c ON c.id=l.campaign_id
      LEFT JOIN drafts d ON d.id=l.current_draft_id LEFT JOIN drafts a ON a.id=l.approved_draft_id
      ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
      ORDER BY CASE l.classification WHEN 'bom encaixe' THEN 0 WHEN 'precisa de revisão' THEN 1 ELSE 2 END, l.updated_at DESC LIMIT ?`).all(...args, Math.min(Number(limit) || 1000, 5000));
    return rows.map((r) => ({ ...this.rowToLead(r), campaign_name: r.campaign_name, draft_text: r.draft_text, draft_needs_research: !!r.draft_needs_research, draft_detail: r.draft_detail, draft_detail_source: r.draft_detail_source, approved_text: r.approved_text }));
  }

  getLead(id) {
    const r = this.db.prepare('SELECT l.*, c.name AS campaign_name FROM leads l JOIN campaigns c ON c.id=l.campaign_id WHERE l.id=?').get(id);
    if (!r) throw httpError(404, 'Lead não encontrado.');
    const lead = this.rowToLead(r);
    lead.campaign_name = r.campaign_name;
    lead.drafts = this.db.prepare('SELECT * FROM drafts WHERE lead_id=? ORDER BY version DESC').all(id).map((d) => ({ ...d, needs_research: !!d.needs_research, warnings: parseJson(d.warnings, []) }));
    lead.events = this.db.prepare('SELECT * FROM lead_events WHERE lead_id=? ORDER BY id DESC').all(id);
    return lead;
  }

  rawLead(id) {
    const r = this.db.prepare('SELECT * FROM leads WHERE id=?').get(id);
    if (!r) throw httpError(404, 'Lead não encontrado.');
    return r;
  }

  touch(id, fields) {
    const keys = Object.keys(fields);
    this.db.prepare(`UPDATE leads SET ${keys.map((k) => `${k}=?`).join(',')}, updated_at=? WHERE id=?`).run(...keys.map((k) => fields[k]), nowIso(), id);
  }

  updateLead(id, patch) {
    const lead = this.rawLead(id);
    const allowed = ['name', 'segment', 'city', 'address', 'website', 'phone', 'note', 'contact_name', 'contact_role', 'contact_source'];
    const f = {};
    for (const k of allowed) if (patch[k] !== undefined) f[k] = String(patch[k]).trim();
    if (f.name !== undefined && !f.name) throw httpError(400, 'O nome da empresa não pode ficar vazio.');
    if (f.contact_source && !/^https?:\/\//i.test(f.contact_source)) throw httpError(400, 'A fonte do contato precisa ser um link (http/https) que confirme o vínculo e o cargo da pessoa.');
    if (f.website !== undefined) { f.website = normalizeUrl(f.website); f.domain = isOwnDomain(domainOf(f.website)) ? domainOf(f.website) : ''; }
    if (f.phone !== undefined) {
      const n = normalizePhone(f.phone);
      if (f.phone && !n) throw httpError(400, 'Telefone inválido. Use DDD + número, ex.: (19) 99999-0000.');
      f.phone_norm = n ? n.e164 : '';
      f.phone_note = n ? n.note : '';
      if (n) f.phone = n.display;
    }
    const dom = f.domain !== undefined ? f.domain : lead.domain;
    const ph = f.phone_norm !== undefined ? f.phone_norm : lead.phone_norm;
    const dup = this.findDuplicate(lead.campaign_id, { domain: dom, phoneNorm: ph, name: lead.name, city: lead.city }, id);
    if (dup && ((f.domain !== undefined && dup.by === 'domínio') || (f.phone_norm !== undefined && dup.by === 'telefone'))) {
      throw httpError(409, `Já existe outro lead nesta campanha com o mesmo ${dup.by}: "${dup.lead.name}".`);
    }
    if (!Object.keys(f).length) return this.getLead(id);
    this.touch(id, f);
    this.event(id, 'editado', `Campos alterados: ${Object.keys(f).filter((k) => !['domain', 'phone_norm', 'phone_note'].includes(k)).join(', ')}`);
    if (f.phone_norm && this.isBlocked(f.phone_norm)) this.applyDnc(id, 'Número já estava na lista de bloqueio.');
    return this.getLead(id);
  }

  // ---------- pesquisa e qualificação ----------
  async researchAndQualify(leadId, { campaign, discovery, demoHtml } = {}) {
    const lead = this.rawLead(leadId);
    const camp = campaign || this.getCampaign(lead.campaign_id);
    let research = { pages: [], error: '' };
    if (demoHtml) research = { pages: [parsePage(demoHtml, lead.website)], error: '' };
    else if (lead.website && lead.domain) research = await researchSite(lead.website);
    else research.error = lead.website ? 'O link informado é de rede social/agregador e não foi lido.' : 'Sem site informado.';

    const fields = {};
    if (!lead.phone_norm && research.pages.length) {
      const pub = pickPublishedPhone(research);
      if (pub && !this.findDuplicate(lead.campaign_id, { phoneNorm: pub.norm.e164 }, leadId)) {
        fields.phone = pub.norm.display; fields.phone_norm = pub.norm.e164; fields.phone_note = pub.norm.note;
        this.event(leadId, 'telefone_do_site', `Telefone ${pub.norm.display} publicado pela empresa (${pub.where}).`);
      }
    }
    const current = { ...lead, ...fields };
    const evidence = buildEvidence({ campaign: camp, lead: current, research, discovery });
    const q = qualify(camp, current, evidence);
    Object.assign(fields, {
      facts: JSON.stringify(evidence.facts), hypotheses: JSON.stringify(evidence.hypotheses), sources: JSON.stringify(evidence.sources),
      classification: q.classification, class_reason: q.reason, research_error: research.error, researched_at: nowIso(),
    });
    this.touch(leadId, fields);
    this.event(leadId, 'pesquisa', `${q.classification}: ${q.reason}${research.error ? ` (${research.error})` : ''}`);
    return { classification: q.classification, error: research.error };
  }

  async rerunResearch(leadId) {
    const lead = this.rawLead(leadId);
    if (lead.status === 'não contatar') throw httpError(409, 'Lead marcado como "não contatar".');
    const isDemo = lead.is_example;
    let demoHtml = '';
    if (isDemo) {
      const { DEMO_CANDIDATES } = require('./discovery/demo');
      const m = DEMO_CANDIDATES.find((c) => c.name === lead.name);
      demoHtml = m ? m.html : '';
    }
    await this.researchAndQualify(leadId, { demoHtml });
    return this.getLead(leadId);
  }

  // ---------- rascunhos ----------
  async createDraft(leadId, { useAi, text } = {}) {
    const lead = this.rawLead(leadId);
    if (['não contatar', 'enviado', 'respondeu'].includes(lead.status) || this.isBlocked(lead.phone_norm)) {
      throw httpError(409, `Não é possível criar rascunho com o status "${lead.status}".`);
    }
    const camp = this.getCampaign(lead.campaign_id);
    const prev = lead.current_draft_id ? this.db.prepare('SELECT * FROM drafts WHERE id=?').get(lead.current_draft_id) : null;
    const version = (this.db.prepare('SELECT COALESCE(MAX(version),0) AS v FROM drafts WHERE lead_id=?').get(leadId).v) + 1;
    let d;
    let aiError = '';
    if (text !== undefined) {
      const t = String(text).trim();
      if (!t) throw httpError(400, 'O texto da mensagem está vazio.');
      d = { text: t, origin: 'manual', detailText: prev ? prev.detail_text : '', detailSource: prev ? prev.detail_source : '', needsResearch: false, missing: '', warnings: checkMessage(t) };
    } else {
      d = await generateDraft({ campaign: camp, lead, facts: parseJson(lead.facts, []), variant: version - 1 }, { useAi });
      aiError = d.aiError || '';
    }
    const r = this.db.prepare('INSERT INTO drafts (lead_id,version,text,origin,detail_text,detail_source,needs_research,missing,warnings,created_at) VALUES (?,?,?,?,?,?,?,?,?,?)')
      .run(leadId, version, d.text, d.origin, d.detailText, d.detailSource, d.needsResearch ? 1 : 0, d.missing, JSON.stringify(d.warnings || []), nowIso());
    const f = { current_draft_id: Number(r.lastInsertRowid), approved_draft_id: null };
    if (['novo', 'aprovado'].includes(lead.status)) f.status = 'em revisão';
    this.touch(leadId, f);
    if (aiError) this.event(leadId, 'ia_indisponivel', aiError);
    this.event(leadId, text !== undefined ? 'rascunho_editado' : 'rascunho_gerado', `Versão ${version} (${d.origin})${lead.approved_draft_id ? '; aprovação anterior revogada' : ''}`);
    return { lead: this.getLead(leadId), aiError };
  }

  approveDraft(leadId, { force } = {}) {
    const lead = this.rawLead(leadId);
    if (lead.status === 'não contatar' || this.isBlocked(lead.phone_norm)) throw httpError(409, 'Número marcado como "não contatar".');
    if (!['novo', 'em revisão', 'aprovado'].includes(lead.status)) throw httpError(409, `Não dá para aprovar com o status "${lead.status}".`);
    if (!lead.current_draft_id) throw httpError(400, 'Gere ou escreva um rascunho primeiro.');
    const d = this.db.prepare('SELECT * FROM drafts WHERE id=?').get(lead.current_draft_id);
    const hard = checkMessage(d.text).filter((w) => HARD_RULE.test(w));
    if (hard.length) throw httpError(400, `Não posso aprovar: ${hard.join(' ')} Edite o texto.`);
    if (d.needs_research && !force) throw httpError(409, 'Este rascunho está marcado como "precisa de pesquisa". Confirme para aprovar mesmo assim.');
    this.touch(leadId, { approved_draft_id: d.id, status: 'aprovado' });
    this.event(leadId, 'aprovado', `Versão ${d.version} aprovada${d.needs_research ? ' (precisava de pesquisa; aprovada manualmente)' : ''}.`);
    return this.getLead(leadId);
  }

  openWhatsapp(leadId) {
    const lead = this.rowToLead(this.rawLead(leadId));
    if (!lead.whatsapp.can_open) throw httpError(409, lead.whatsapp.reason);
    const d = this.db.prepare('SELECT text FROM drafts WHERE id=?').get(lead.approved_draft_id);
    const url = waLink(lead.phone_norm, d.text);
    this.event(leadId, 'conversa_aberta', 'Link wa.me aberto. Isso NÃO conta como envio: confira e envie no WhatsApp.');
    return { url, example: lead.is_example };
  }

  // ---------- status ----------
  markSent(id) {
    const l = this.rawLead(id);
    if (l.status === 'enviado') return this.getLead(id);
    if (l.status !== 'aprovado') throw httpError(409, 'Só é possível marcar como enviado depois de aprovar o rascunho.');
    this.touch(id, { status: 'enviado' });
    this.event(id, 'enviado', 'Marcado manualmente como enviado.');
    return this.getLead(id);
  }

  markReplied(id) {
    const l = this.rawLead(id);
    if (!['aprovado', 'enviado', 'respondeu'].includes(l.status)) throw httpError(409, 'Só dá para registrar resposta de quem foi aprovado/enviado.');
    if (l.status !== 'respondeu') { this.touch(id, { status: 'respondeu' }); this.event(id, 'respondeu', 'Resposta registrada manualmente.'); }
    return this.getLead(id);
  }

  discard(id, reason = '') {
    const l = this.rawLead(id);
    if (l.status === 'não contatar') throw httpError(409, 'Lead marcado como "não contatar".');
    this.touch(id, { status: 'descartado', approved_draft_id: null });
    this.event(id, 'descartado', reason || 'Descartado manualmente.');
    return this.getLead(id);
  }

  reopen(id) {
    const l = this.rawLead(id);
    if (l.status !== 'descartado') throw httpError(409, 'Só leads descartados podem ser reabertos.');
    this.touch(id, { status: l.current_draft_id ? 'em revisão' : 'novo' });
    this.event(id, 'reaberto', 'Lead reaberto.');
    return this.getLead(id);
  }

  applyDnc(id, reason) {
    const l = this.rawLead(id);
    const t = nowIso();
    if (l.phone_norm) {
      this.db.prepare('INSERT OR REPLACE INTO dnc (phone_norm,reason,lead_id,created_at) VALUES (?,?,?,?)').run(l.phone_norm, reason || '', id, t);
      for (const o of this.db.prepare("SELECT id FROM leads WHERE phone_norm=? AND status<>'não contatar'").all(l.phone_norm)) {
        this.touch(o.id, { status: 'não contatar', approved_draft_id: null });
        this.event(o.id, 'nao_contatar', `Número bloqueado${o.id === id ? '' : ` (pedido registrado no lead #${id})`}${reason ? `: ${reason}` : '.'}`);
      }
    } else {
      this.touch(id, { status: 'não contatar', approved_draft_id: null });
      this.event(id, 'nao_contatar', reason || 'Marcado como não contatar.');
    }
  }

  doNotContact(id, reason = '') { this.applyDnc(id, reason); return this.getLead(id); }

  addDnc(phone, reason = '') {
    const n = normalizePhone(phone);
    if (!n) throw httpError(400, 'Telefone inválido.');
    this.db.prepare('INSERT OR REPLACE INTO dnc (phone_norm,reason,lead_id,created_at) VALUES (?,?,NULL,?)').run(n.e164, reason, nowIso());
    for (const o of this.db.prepare("SELECT id FROM leads WHERE phone_norm=? AND status<>'não contatar'").all(n.e164)) {
      this.touch(o.id, { status: 'não contatar', approved_draft_id: null });
      this.event(o.id, 'nao_contatar', `Número adicionado à lista de bloqueio${reason ? `: ${reason}` : '.'}`);
    }
    return this.listDnc();
  }

  removeDnc(phoneNorm) {
    this.db.prepare('DELETE FROM dnc WHERE phone_norm=?').run(phoneNorm);
    for (const o of this.db.prepare("SELECT id FROM leads WHERE phone_norm=? AND status='não contatar'").all(phoneNorm)) {
      this.touch(o.id, { status: 'em revisão' });
      this.event(o.id, 'bloqueio_removido', 'Número removido manualmente da lista de bloqueio.');
    }
    return this.listDnc();
  }

  listDnc() {
    return this.db.prepare('SELECT d.*, l.name AS lead_name FROM dnc d LEFT JOIN leads l ON l.id=d.lead_id ORDER BY d.created_at DESC').all();
  }

  // ---------- rodadas ----------
  getRun(id) {
    const r = this.db.prepare('SELECT * FROM runs WHERE id=?').get(id);
    if (!r) throw httpError(404, 'Rodada não encontrada.');
    return { ...r, log: parseJson(r.log, []) };
  }

  listRuns(campaignId) {
    return this.db.prepare('SELECT * FROM runs WHERE campaign_id=? ORDER BY id DESC LIMIT 20').all(campaignId).map((r) => ({ ...r, log: parseJson(r.log, []) }));
  }

  logRun(runId, line) {
    const r = this.db.prepare('SELECT log FROM runs WHERE id=?').get(runId);
    const log = parseJson(r.log, []);
    log.push(line);
    this.db.prepare('UPDATE runs SET log=? WHERE id=?').run(JSON.stringify(log.slice(-200)), runId);
  }

  /**
   * Inicia uma rodada em segundo plano e devolve o registro dela.
   * source: 'places' | 'demo' | 'csv'
   */
  startRun(campaignId, { source, csv } = {}) {
    const campaign = this.getCampaign(campaignId);
    if (this.running.has(campaignId)) throw httpError(409, 'Já há uma rodada em andamento nesta campanha.');
    const t = nowIso();
    const runId = Number(this.db.prepare("INSERT INTO runs (campaign_id,kind,status,started_at) VALUES (?,?, 'executando', ?)").run(campaignId, source, t).lastInsertRowid);
    const fail = (msg) => {
      this.db.prepare("UPDATE runs SET status='erro', error=?, finished_at=? WHERE id=?").run(msg, nowIso(), runId);
      return this.getRun(runId);
    };

    let gen;
    let limit = Infinity;
    try {
      if (source === 'demo') {
        if (!campaign.is_demo) return fail('A demonstração só roda na campanha de demonstração (as empresas são fictícias).');
        gen = demoCandidates();
        limit = campaign.leads_per_run;
      } else if (source === 'places') {
        if (campaign.is_demo) return fail('A campanha de demonstração usa empresas fictícias. Crie uma campanha própria para buscar no Google Places.');
        if (!process.env.GOOGLE_PLACES_API_KEY) return fail('GOOGLE_PLACES_API_KEY não está configurada. Edite o arquivo .env (veja o README) e reinicie o servidor, ou importe um CSV.');
        gen = searchPlaces({ query: `${campaign.segment} em ${campaign.region || ''}`.trim() });
        limit = campaign.leads_per_run;
      } else if (source === 'csv') {
        const parsed = parseCsv(csv);
        parsed.skipped.forEach((s) => this.logRun(runId, s));
        gen = (async function* g() { for (const c of parsed.candidates) yield c; })();
      } else {
        return fail('Fonte desconhecida.');
      }
    } catch (e) {
      return fail(e.message);
    }

    this.running.add(campaignId);
    this.executeRun(runId, campaign, gen, limit).finally(() => this.running.delete(campaignId));
    return this.getRun(runId);
  }

  async executeRun(runId, campaign, gen, limit) {
    const stats = { found: 0, added: 0, duplicates: 0 };
    let error = '';
    const flush = () => this.db.prepare('UPDATE runs SET found=?, added=?, duplicates=? WHERE id=?').run(stats.found, stats.added, stats.duplicates, runId);
    try {
      for await (const cand of gen) {
        stats.found++;
        try {
          const r = await this.processCandidate(campaign, cand, runId);
          if (r === 'added') stats.added++;
          else if (r === 'duplicate') stats.duplicates++;
        } catch (e) {
          this.logRun(runId, `Erro ao processar "${cand.name}": ${e.message} (o restante continuou).`);
        }
        flush();
        if (stats.added >= limit) break;
      }
    } catch (e) {
      error = e.message;
      this.logRun(runId, `A busca parou: ${e.message} O que já foi salvo foi preservado.`);
    }
    flush();
    const status = error ? (stats.added || stats.duplicates ? 'parcial' : 'erro') : 'concluída';
    this.db.prepare('UPDATE runs SET status=?, error=?, finished_at=? WHERE id=?').run(status, error, nowIso(), runId);
    this.logRun(runId, `Fim: ${stats.found} encontrados, ${stats.added} novos, ${stats.duplicates} repetidos.`);
  }

  async processCandidate(campaign, cand, runId) {
    const name = String(cand.name || '').trim();
    if (!name) return 'skipped';
    let website = normalizeUrl(cand.website);
    let domain = domainOf(website);
    let note = String(cand.note || '').trim();
    if (website && !isOwnDomain(domain)) {
      note = [note, `Link informado (rede social/agregador, não lido): ${website}`].filter(Boolean).join(' | ');
      website = ''; domain = '';
    }
    const phone = normalizePhone(cand.phone);
    const phoneNorm = phone ? phone.e164 : '';
    const dup = this.findDuplicate(campaign.id, { domain, phoneNorm, name, city: cand.city });
    const t = nowIso();

    if (dup) {
      const l = dup.lead;
      const fill = {};
      if (!l.website && website) { fill.website = website; fill.domain = domain; }
      if (!l.phone_norm && phone) { fill.phone = phone.display; fill.phone_norm = phone.e164; fill.phone_note = phone.note; }
      this.touch(l.id, { ...fill, seen_count: l.seen_count + 1, last_seen_at: t });
      this.event(l.id, 'reencontrado', `Encontrado de novo na rodada #${runId} (mesmo ${dup.by}): "${name}". Nada foi sobrescrito.${Object.keys(fill).length ? ' Campos vazios foram completados.' : ''}`);
      this.logRun(runId, `Repetido (${dup.by}): ${name} → já existe como "${l.name}".`);
      return 'duplicate';
    }
    if (cand.closed) { this.logRun(runId, `Ignorado (negócio fechado segundo a fonte): ${name}`); return 'skipped'; }

    const r = this.db.prepare(`INSERT INTO leads (campaign_id,name,segment,city,address,website,domain,phone,phone_norm,phone_note,note,contact_name,contact_role,contact_source,status,origin,is_example,last_seen_at,created_at,updated_at)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?, 'novo', ?,?,?,?,?)`)
      .run(campaign.id, name, cand.segment || '', cand.city || '', cand.address || '', website, domain, phone ? phone.display : String(cand.phone || '').trim(), phoneNorm, phone ? phone.note : '', note,
        cand.contact_name || '', cand.contact_role || '', /^https?:\/\//i.test(cand.contact_source || '') ? cand.contact_source : '', cand.origin || '', cand.isExample ? 1 : 0, t, t, t);
    const id = Number(r.lastInsertRowid);
    this.event(id, 'descoberto', `Rodada #${runId} (${cand.origin || 'manual'})${cand.sourceUrl ? ` — fonte: ${cand.sourceUrl}` : ''}`);
    this.logRun(runId, `Novo: ${name}`);

    try {
      await this.researchAndQualify(id, {
        campaign, demoHtml: cand.html || '',
        discovery: cand.sourceUrl ? { sourceUrl: cand.sourceUrl, sourceLabel: cand.sourceLabel, primaryType: cand.primaryType, withFact: cand.origin === 'google_places' } : null,
      });
    } catch (e) {
      this.touch(id, { classification: 'precisa de revisão', class_reason: 'A pesquisa falhou; revise manualmente.', research_error: e.message });
      this.event(id, 'erro_pesquisa', e.message);
    }
    if (this.isBlocked(phoneNorm)) {
      this.applyDnc(id, 'Número já estava na lista de bloqueio.');
      this.logRun(runId, `Bloqueado (não contatar): ${name}`);
      return 'added';
    }
    const fresh = this.rawLead(id);
    if (fresh.classification && fresh.classification !== 'fora do perfil') {
      try { await this.createDraft(id); } catch (e) { this.event(id, 'erro_rascunho', e.message); }
    }
    return 'added';
  }
}

module.exports = { Service, STATUSES, CLASSES };
