'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { DatabaseSync } = require('node:sqlite');

const SCHEMA = `
CREATE TABLE IF NOT EXISTS campaigns (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  is_demo INTEGER NOT NULL DEFAULT 0,
  seller_name TEXT NOT NULL DEFAULT '',
  company TEXT NOT NULL DEFAULT '',
  offer TEXT NOT NULL DEFAULT '',
  problem TEXT NOT NULL DEFAULT '',
  segment TEXT NOT NULL DEFAULT '',
  region TEXT NOT NULL DEFAULT '',
  profile TEXT NOT NULL DEFAULT '',
  differentials TEXT NOT NULL DEFAULT '',
  cases_text TEXT NOT NULL DEFAULT '',
  voice TEXT NOT NULL DEFAULT '',
  voice_examples TEXT NOT NULL DEFAULT '',
  leads_per_run INTEGER NOT NULL DEFAULT 10,
  discard_criteria TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS leads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  campaign_id INTEGER NOT NULL REFERENCES campaigns(id),
  name TEXT NOT NULL,
  segment TEXT NOT NULL DEFAULT '',
  city TEXT NOT NULL DEFAULT '',
  address TEXT NOT NULL DEFAULT '',
  website TEXT NOT NULL DEFAULT '',
  domain TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  phone_norm TEXT NOT NULL DEFAULT '',
  phone_note TEXT NOT NULL DEFAULT '',
  note TEXT NOT NULL DEFAULT '',
  contact_name TEXT NOT NULL DEFAULT '',
  contact_role TEXT NOT NULL DEFAULT '',
  contact_source TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'novo',
  classification TEXT NOT NULL DEFAULT '',
  class_reason TEXT NOT NULL DEFAULT '',
  facts TEXT NOT NULL DEFAULT '[]',
  hypotheses TEXT NOT NULL DEFAULT '[]',
  sources TEXT NOT NULL DEFAULT '[]',
  research_error TEXT NOT NULL DEFAULT '',
  researched_at TEXT NOT NULL DEFAULT '',
  origin TEXT NOT NULL DEFAULT '',
  is_example INTEGER NOT NULL DEFAULT 0,
  seen_count INTEGER NOT NULL DEFAULT 1,
  last_seen_at TEXT NOT NULL,
  current_draft_id INTEGER,
  approved_draft_id INTEGER,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_leads_campaign ON leads(campaign_id);
CREATE INDEX IF NOT EXISTS idx_leads_domain ON leads(campaign_id, domain);
CREATE INDEX IF NOT EXISTS idx_leads_phone ON leads(campaign_id, phone_norm);
CREATE TABLE IF NOT EXISTS drafts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  lead_id INTEGER NOT NULL REFERENCES leads(id),
  version INTEGER NOT NULL,
  text TEXT NOT NULL,
  origin TEXT NOT NULL,
  detail_text TEXT NOT NULL DEFAULT '',
  detail_source TEXT NOT NULL DEFAULT '',
  needs_research INTEGER NOT NULL DEFAULT 0,
  missing TEXT NOT NULL DEFAULT '',
  warnings TEXT NOT NULL DEFAULT '[]',
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS lead_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  lead_id INTEGER NOT NULL REFERENCES leads(id),
  type TEXT NOT NULL,
  detail TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS runs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  campaign_id INTEGER NOT NULL REFERENCES campaigns(id),
  kind TEXT NOT NULL,
  status TEXT NOT NULL,
  found INTEGER NOT NULL DEFAULT 0,
  added INTEGER NOT NULL DEFAULT 0,
  duplicates INTEGER NOT NULL DEFAULT 0,
  error TEXT NOT NULL DEFAULT '',
  log TEXT NOT NULL DEFAULT '[]',
  started_at TEXT NOT NULL,
  finished_at TEXT NOT NULL DEFAULT ''
);
CREATE TABLE IF NOT EXISTS dnc (
  phone_norm TEXT PRIMARY KEY,
  reason TEXT NOT NULL DEFAULT '',
  lead_id INTEGER,
  created_at TEXT NOT NULL
);
`;

function openDb(file) {
  const target = file || process.env.DB_PATH || path.join(__dirname, '..', 'data', 'prospector.db');
  if (target !== ':memory:') fs.mkdirSync(path.dirname(target), { recursive: true });
  const db = new DatabaseSync(target);
  db.exec('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');
  db.exec(SCHEMA);
  return db;
}

module.exports = { openDb };
