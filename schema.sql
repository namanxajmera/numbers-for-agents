-- D1 schema for Numbers for Agents (waitlist + analytics)
-- Apply: wrangler d1 execute waitlist --remote --file=./schema.sql

CREATE TABLE IF NOT EXISTS waitlist (
  email TEXT PRIMARY KEY NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  source TEXT,
  note TEXT
);

CREATE INDEX IF NOT EXISTS idx_waitlist_created_at ON waitlist (created_at);

-- First-party analytics. One row per page view.
-- Humans (bucket 'human') come from the /analytics.js beacon via /api/collect.
-- All other buckets come from functions/_middleware.js (bots do not run JavaScript).
CREATE TABLE IF NOT EXISTS analytics_hits (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ts TEXT NOT NULL,
  day TEXT NOT NULL,
  path TEXT NOT NULL,
  status INTEGER,
  bucket TEXT NOT NULL,
  agent TEXT,
  visitor TEXT,
  ref_host TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  country TEXT,
  asn INTEGER,
  as_org TEXT,
  ua TEXT
);

CREATE INDEX IF NOT EXISTS idx_analytics_hits_day_visitor ON analytics_hits (day, visitor);

-- One random salt per UTC day for visitor hashes. Pruned with old rows.
CREATE TABLE IF NOT EXISTS analytics_salts (
  day TEXT PRIMARY KEY NOT NULL,
  salt TEXT NOT NULL
);
