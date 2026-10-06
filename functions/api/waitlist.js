import { json, jsonError, methodNotAllowed } from "../_lib/http.js";

const EMAIL_RE =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

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
  let payload;
  try {
    payload = await context.request.json();
  } catch {
    return jsonError(
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
    return jsonError(
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
    return jsonError(
      500,
      "storage_failed",
      "Could not save your email. Try again.",
      "Retry in a few seconds. If it keeps failing, email hello@numberforagents.com."
    );
  }

  return json(200, { ok: true });
}
