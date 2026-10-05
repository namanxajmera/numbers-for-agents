-- D1 schema for Numbers for Agents waitlist
-- Apply: wrangler d1 execute waitlist --remote --file=./schema.sql

CREATE TABLE IF NOT EXISTS waitlist (
  email TEXT PRIMARY KEY NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  source TEXT,
  note TEXT
);

CREATE INDEX IF NOT EXISTS idx_waitlist_created_at ON waitlist (created_at);
