import { classifyRequest, recordHit } from "./_lib/analytics.js";
import { isProbePath } from "./_lib/classify.js";
import { negotiate } from "./_lib/markdown.js";

// Non-HTML files that crawlers fetch and we want to count.
const ALWAYS_LOG = new Set(["/robots.txt", "/sitemap.xml"]);

function isPrefetch(request) {
  const purpose =
    request.headers.get("Sec-Purpose") || request.headers.get("Purpose") || "";
  return purpose.toLowerCase().includes("prefetch");
}

// Logs bot page views server-side, because bots do not run JavaScript.
// Humans are skipped here. /analytics.js counts them, so no view is stored twice.
// _routes.json keeps static assets away from Functions.
async function logBots(context) {
  const { request, env } = context;
  const response = await context.next();

  const url = new URL(request.url);
  if (
    !env.DB ||
    request.method !== "GET" ||
    url.pathname.startsWith("/api/") ||
    isProbePath(url.pathname) ||
    isPrefetch(request)
  ) {
    return response;
  }

  const type = response.headers.get("Content-Type") || "";
  const isPage = type.includes("text/html") || type.includes("text/markdown");
  if (!isPage && !ALWAYS_LOG.has(url.pathname)) {
    return response;
  }

  const { bucket, agent } = classifyRequest(request);
  if (bucket === "human") return response;

  context.waitUntil(
    recordHit(env.DB, request, {
      bucket,
      agent,
      path: url.pathname,
      search: url.search,
      referrer: request.headers.get("Referer"),
      status: response.status,
    }).catch((err) => console.error("analytics edge hit failed", err))
  );

  return response;
}

// logBots runs first so it sees the final, negotiated response.
export const onRequest = [logBots, negotiate];
