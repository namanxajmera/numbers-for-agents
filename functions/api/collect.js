import {
  ensureAnalyticsSchema,
  recordHit,
  utcDay,
  visitorHash,
} from "../_lib/analytics.js";
import { isProbePath } from "../_lib/classify.js";

const MAX_BODY_BYTES = 2048;
const PER_MINUTE_LIMIT = 30;
const PER_DAY_LIMIT = 500;

// Per-isolate counter keyed by IP. Kept in memory only, never written to D1.
const recentByIp = new Map();

function noContent() {
  return new Response(null, {
    status: 204,
    headers: { "Cache-Control": "no-store" },
  });
}

function overMinuteLimit(ip) {
  const minute = Math.floor(Date.now() / 60000);
  if (recentByIp.size > 5000) recentByIp.clear();
  const entry = recentByIp.get(ip);
  if (!entry || entry.minute !== minute) {
    recentByIp.set(ip, { minute, count: 1 });
    return false;
  }
  entry.count += 1;
  return entry.count > PER_MINUTE_LIMIT;
}

async function overDailyLimit(db, request) {
  const day = utcDay();
  const visitor = await visitorHash(db, day, request);
  const row = await db
    .prepare(
      `SELECT COUNT(*) AS n FROM analytics_hits
       WHERE day = ? AND visitor = ? AND kind = 'js'`
    )
    .bind(day, visitor)
    .first();
  return row.n >= PER_DAY_LIMIT;
}

function isCrossOrigin(request) {
  const origin = request.headers.get("Origin");
  if (!origin) return false;
  try {
    return new URL(origin).host !== new URL(request.url).host;
  } catch {
    return true;
  }
}

function parseBeacon(text) {
  let body;
  try {
    body = JSON.parse(text);
  } catch {
    return null;
  }
  const path = typeof body.p === "string" ? body.p : "";
  if (!path.startsWith("/") || path.length > 256 || isProbePath(path)) {
    return null;
  }
  return {
    path,
    search: typeof body.q === "string" ? body.q.slice(0, 512) : "",
    referrer: typeof body.r === "string" ? body.r.slice(0, 512) : "",
  };
}

async function store(db, request, beacon) {
  await ensureAnalyticsSchema(db);
  if (await overDailyLimit(db, request)) return;
  await recordHit(db, request, { kind: "js", ...beacon });
}

// POST /api/collect — page-view beacon from /analytics.js.
// Always answers 204 so callers cannot probe the limits.
export async function onRequestPost(context) {
  const { request, env } = context;
  const ip = request.headers.get("CF-Connecting-IP") || "";
  const size = Number(request.headers.get("Content-Length") || 0);

  if (!env.DB || size > MAX_BODY_BYTES || isCrossOrigin(request)) {
    return noContent();
  }
  if (overMinuteLimit(ip)) return noContent();

  const text = await request.text();
  if (text.length > MAX_BODY_BYTES) return noContent();
  const beacon = parseBeacon(text);
  if (!beacon) return noContent();

  context.waitUntil(
    store(env.DB, request, beacon).catch((err) =>
      console.error("analytics beacon failed", err)
    )
  );
  return noContent();
}
