import { recordHit } from "./_lib/analytics.js";
import { isProbePath } from "./_lib/classify.js";

// Non-HTML files that crawlers fetch and we want to count.
const ALWAYS_LOG = new Set(["/robots.txt", "/sitemap.xml"]);

function isPrefetch(request) {
  const purpose =
    request.headers.get("Sec-Purpose") || request.headers.get("Purpose") || "";
  return purpose.toLowerCase().includes("prefetch");
}

// Logs every page GET server-side, so bots that never run JavaScript are counted.
// _routes.json limits which paths reach Functions; static assets never get here.
export async function onRequest(context) {
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
  if (!type.includes("text/html") && !ALWAYS_LOG.has(url.pathname)) {
    return response;
  }

  context.waitUntil(
    recordHit(env.DB, request, {
      kind: "edge",
      path: url.pathname,
      search: url.search,
      referrer: request.headers.get("Referer"),
      status: response.status,
    }).catch((err) => console.error("analytics edge hit failed", err))
  );

  return response;
}
