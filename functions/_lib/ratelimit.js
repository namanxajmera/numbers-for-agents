const LIMIT = 10;
const WINDOW_SECONDS = 60;

// Per-isolate counter keyed by IP. Kept in memory only, never written to D1.
const recentByIp = new Map();

// Counts one request for this IP. Returns the IETF RateLimit headers (plus the
// older X-RateLimit-* names) and whether the request is over the limit.
export function rateLimit(ip) {
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
    "RateLimit-Policy": `"api";q=${LIMIT};w=${WINDOW_SECONDS}`,
    RateLimit: `"api";r=${remaining};t=${reset}`,
    "X-RateLimit-Limit": String(LIMIT),
    "X-RateLimit-Remaining": String(remaining),
    "X-RateLimit-Reset": String((window + 1) * WINDOW_SECONDS),
  };
  const isLimited = entry.count > LIMIT;
  if (isLimited) headers["Retry-After"] = String(reset);
  return { headers, isLimited };
}
