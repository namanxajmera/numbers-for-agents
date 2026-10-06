import { json as baseJson, jsonError, methodNotAllowed } from "../_lib/http.js";

const EMAIL_RE =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

const LIMIT = 10;
const WINDOW_SECONDS = 60;

// Per-isolate counter keyed by IP. Kept in memory only, never written to D1.
const recentByIp = new Map();

// Returns IETF RateLimit headers and whether this request is over the limit.
function rateLimit(ip) {
  const now = Math.floor(Date.now() / 1000);
  const window = Math.floor(now / WINDOW_SECONDS);
  if (recentByIp.size > 5000) recentByIp.clear();
  let entry = recentByIp.get(ip);
  if (!entry || entry.window !== window) {
    entry = { window, count: 0 };
    recentByIp.set(ip, entry);
  }
  entry.count += 1;
  const remaining = Math.max(0, LIMIT - entry.count);
  const reset = (window + 1) * WINDOW_SECONDS - now;
  const headers = {
    "RateLimit-Policy": `"waitlist";q=${LIMIT};w=${WINDOW_SECONDS}`,
    RateLimit: `"waitlist";r=${remaining};t=${reset}`,
  };
  const isLimited = entry.count > LIMIT;
  if (isLimited) headers["Retry-After"] = String(reset);
  return { headers, isLimited };
}

let schemaReady = null;

function ensureWaitlistSchema(db) {
  if (!schemaReady) {
    schemaReady = (async () => {
      await db
        .prepare(
          `CREATE TABLE IF NOT EXISTS waitlist (
            email TEXT PRIMARY KEY NOT NULL,
            created_at TEXT NOT NULL DEFAULT (datetime('now')),
            source TEXT,
            note TEXT
          )`
        )
        .run();
      await db
        .prepare(
          `CREATE INDEX IF NOT EXISTS idx_waitlist_created_at ON waitlist (created_at)`
        )
        .run();
    })();
  }
  return schemaReady;
}

export function onRequest() {
  return methodNotAllowed("POST");
}

export async function onRequestPost(context) {
  const ip = context.request.headers.get("CF-Connecting-IP") || "";
  const limit = rateLimit(ip);
  const json = (status, body) => baseJson(status, body, limit.headers);
  const fail = (status, code, error, hint) =>
    jsonError(status, code, error, hint, limit.headers);

  if (limit.isLimited) {
    return fail(
      429,
      "rate_limit_exceeded",
      "Too many requests.",
      "Wait for the Retry-After seconds, then retry."
    );
  }

  let payload;
  try {
    payload = await context.request.json();
  } catch {
    return fail(
      400,
      "invalid_json",
      "Invalid JSON body.",
      'Send a JSON object such as {"email": "you@company.com"}.'
    );
  }

  if (payload.company && String(payload.company).trim() !== "") {
    return json(200, { ok: true });
  }

  const email = String(payload.email ?? "").trim().toLowerCase();
  if (!email || email.length > 254 || !EMAIL_RE.test(email)) {
    return fail(
      400,
      "invalid_email",
      "Enter a valid email address.",
      "Pass a single address of at most 254 characters in the email field."
    );
  }

  const source = String(payload.source ?? "landing").slice(0, 128);
  const note = payload.note ? String(payload.note).slice(0, 512) : null;

  try {
    await ensureWaitlistSchema(context.env.DB);
    await context.env.DB.prepare(
      `INSERT INTO waitlist (email, created_at, source, note)
       VALUES (?, datetime('now'), ?, ?)
       ON CONFLICT(email) DO UPDATE SET
         source = excluded.source,
         note = COALESCE(excluded.note, waitlist.note)`
    )
      .bind(email, source, note)
      .run();
  } catch (err) {
    console.error("waitlist insert failed", err);
    return fail(
      500,
      "storage_failed",
      "Could not save your email. Try again.",
      "Retry in a few seconds. If it keeps failing, email hello@numberforagents.com."
    );
  }

  return json(200, { ok: true });
}
