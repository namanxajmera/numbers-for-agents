import { classify } from "./classify.js";

let schemaReady = null;

export function ensureAnalyticsSchema(db) {
  if (!schemaReady) {
    schemaReady = db
      .batch([
        db.prepare(
          `CREATE TABLE IF NOT EXISTS analytics_hits (
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
          )`
        ),
        db.prepare(
          `CREATE INDEX IF NOT EXISTS idx_analytics_hits_day_visitor
           ON analytics_hits (day, visitor)`
        ),
        db.prepare(
          `CREATE TABLE IF NOT EXISTS analytics_salts (
            day TEXT PRIMARY KEY NOT NULL,
            salt TEXT NOT NULL
          )`
        ),
      ])
      .catch((err) => {
        schemaReady = null;
        throw err;
      });
  }
  return schemaReady;
}

function toHex(buffer) {
  return [...new Uint8Array(buffer)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

let saltCache = { day: null, salt: null };

// One random salt per UTC day, stored in D1 so all isolates agree.
// The prune job deletes old salts, so old hashes cannot be linked to an IP.
async function dailySalt(db, day) {
  if (saltCache.day === day) return saltCache.salt;
  const fresh = toHex(crypto.getRandomValues(new Uint8Array(16)));
  await db
    .prepare(`INSERT OR IGNORE INTO analytics_salts (day, salt) VALUES (?, ?)`)
    .bind(day, fresh)
    .run();
  const row = await db
    .prepare(`SELECT salt FROM analytics_salts WHERE day = ?`)
    .bind(day)
    .first();
  saltCache = { day, salt: row.salt };
  return row.salt;
}

export async function visitorHash(db, day, request) {
  const ip = request.headers.get("CF-Connecting-IP") || "";
  const ua = request.headers.get("User-Agent") || "";
  const salt = await dailySalt(db, day);
  const data = new TextEncoder().encode(`${salt}|${ip}|${ua}`);
  return toHex(await crypto.subtle.digest("SHA-256", data)).slice(0, 32);
}

function clip(value, max) {
  if (value === null || value === undefined || value === "") return null;
  return String(value).slice(0, max);
}

/** Hostname of an external referrer, or null for none or same-site. */
export function referrerHost(referrer, ownHost) {
  if (!referrer) return null;
  try {
    const host = new URL(referrer).hostname.toLowerCase();
    if (!host || host === ownHost || host === `www.${ownHost}`) return null;
    return clip(host, 128);
  } catch {
    return null;
  }
}

function utmParams(search) {
  const params = new URLSearchParams(search || "");
  return {
    source: clip(params.get("utm_source"), 100),
    medium: clip(params.get("utm_medium"), 100),
    campaign: clip(params.get("utm_campaign"), 100),
  };
}

export function utcDay(now = new Date()) {
  return now.toISOString().slice(0, 10);
}

/** Returns { bucket, agent } for this request. See classify.js. */
export function classifyRequest(request) {
  const cf = request.cf || {};
  return classify(request.headers.get("User-Agent"), cf.asn);
}

/**
 * Writes one row for one page view.
 * Humans are written by /api/collect (they run JavaScript).
 * Everything else is written by _middleware.js. So each view is stored once.
 * hit: { bucket, agent, path, search, referrer, status }
 */
export async function recordHit(db, request, hit) {
  await ensureAnalyticsSchema(db);

  const now = new Date();
  const day = utcDay(now);
  const cf = request.cf || {};
  const ua = request.headers.get("User-Agent") || "";
  const ownHost = new URL(request.url).hostname.toLowerCase();
  const utm = utmParams(hit.search);
  const visitor =
    hit.bucket === "human" ? await visitorHash(db, day, request) : null;

  await db
    .prepare(
      `INSERT INTO analytics_hits (
        ts, day, path, status, bucket, agent, visitor, ref_host,
        utm_source, utm_medium, utm_campaign, country, asn, as_org, ua
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(
      now.toISOString().slice(0, 19).replace("T", " "),
      day,
      clip(hit.path, 256),
      hit.status ?? null,
      hit.bucket,
      hit.agent,
      visitor,
      referrerHost(hit.referrer, ownHost),
      utm.source,
      utm.medium,
      utm.campaign,
      clip(cf.country, 8),
      Number.isFinite(cf.asn) ? cf.asn : null,
      clip(cf.asOrganization, 64),
      clip(ua, 256)
    )
    .run();
}
