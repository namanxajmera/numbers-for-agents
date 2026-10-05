interface Env {
  DB: D1Database;
}

type WaitlistBody = {
  email?: string;
  source?: string;
  note?: string;
  company?: string;
};

const EMAIL_RE =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

function json(status: number, body: Record<string, unknown>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
  });
}

let schemaReady: Promise<void> | null = null;

/** Matches schema.sql — keeps local Pages dev working before remote migrate. */
function ensureWaitlistSchema(db: D1Database): Promise<void> {
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

export const onRequestPost: PagesFunction<Env> = async (context) => {
  let payload: WaitlistBody;
  try {
    payload = await context.request.json();
  } catch {
    return json(400, { ok: false, error: "Invalid JSON body." });
  }

  if (payload.company && String(payload.company).trim() !== "") {
    return json(200, { ok: true });
  }

  const email = String(payload.email ?? "").trim().toLowerCase();
  if (!email || email.length > 254 || !EMAIL_RE.test(email)) {
    return json(400, { ok: false, error: "Enter a valid email address." });
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
    return json(500, { ok: false, error: "Could not save your email. Try again." });
  }

  return json(200, { ok: true });
};
