// Markdown content negotiation for agents.
// A request that prefers text/markdown gets public/<page>.md when it exists.
// Everyone else gets the HTML page. HTML and 404 responses carry Vary: Accept.

const NOT_FOUND_MD = `# Page not found

No page exists at this URL on numberforagents.com.

- Home page: https://numberforagents.com/
- Site index for agents: https://numberforagents.com/llms.txt
- API docs: https://numberforagents.com/docs
- OpenAPI spec: https://numberforagents.com/openapi.json
- Sitemap: https://numberforagents.com/sitemap.xml
`;

// q-value for an exact media type in an Accept header. 0 when absent.
function quality(accept, type) {
  for (const part of accept.split(",")) {
    const [name, ...params] = part.trim().split(";");
    if (name.trim().toLowerCase() !== type) continue;
    const q = params.map((p) => p.trim()).find((p) => p.startsWith("q="));
    return q ? Number.parseFloat(q.slice(2)) || 0 : 1;
  }
  return 0;
}

export function prefersMarkdown(request) {
  const accept = request.headers.get("Accept") || "";
  const markdown = quality(accept, "text/markdown");
  return markdown > 0 && markdown >= quality(accept, "text/html");
}

/** "/" -> "/index.md", "/docs" -> "/docs.md", "/a/b.html" -> "/a/b.md" */
export function markdownPath(pathname) {
  const base = pathname.replace(/\.html$/, "").replace(/\/$/, "/index");
  return `${base}.md`;
}

function markdownResponse(status, body) {
  return new Response(body, {
    status,
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=300",
      Vary: "Accept",
    },
  });
}

function withVary(response) {
  const copy = new Response(response.body, response);
  copy.headers.append("Vary", "Accept");
  return copy;
}

export async function negotiate(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const response = await context.next();
  const type = response.headers.get("Content-Type") || "";
  if (url.pathname.startsWith("/api/") || !type.includes("text/html")) {
    return response;
  }
  if (!prefersMarkdown(request)) return withVary(response);
  if (response.status === 404) return markdownResponse(404, NOT_FOUND_MD);

  const asset = await env.ASSETS.fetch(new URL(markdownPath(url.pathname), url));
  if (!asset.ok) return withVary(response);
  return markdownResponse(response.status, await asset.text());
}
