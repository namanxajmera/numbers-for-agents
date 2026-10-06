import { jsonError } from "../_lib/http.js";
import { rateLimit } from "../_lib/ratelimit.js";

// One per-IP budget for every /api/* route, advertised on every response.
// /api/collect is skipped: it keeps its own silent limits so callers cannot probe them.
export async function onRequest(context) {
  const { request } = context;
  if (new URL(request.url).pathname === "/api/collect") return context.next();

  const limit = rateLimit(request.headers.get("CF-Connecting-IP") || "");
  if (limit.isLimited) {
    return jsonError(
      429,
      "rate_limit_exceeded",
      "Too many requests.",
      "Wait for the Retry-After seconds, then retry.",
      limit.headers
    );
  }

  const response = await context.next();
  const copy = new Response(response.body, response);
  for (const [name, value] of Object.entries(limit.headers)) {
    copy.headers.set(name, value);
  }
  return copy;
}
