// Shared JSON responses for /api/*. Every error has the same shape:
// { ok: false, error, code, hint } so agents can branch on `code`.

export function json(status, body, headers = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      ...headers,
    },
  });
}

export function jsonError(status, code, error, hint, headers = {}) {
  return json(status, { ok: false, error, code, hint }, headers);
}

export function methodNotAllowed(allow) {
  return jsonError(
    405,
    "method_not_allowed",
    `This endpoint accepts ${allow} only.`,
    "See https://numberforagents.com/openapi.json for the supported methods.",
    { Allow: allow }
  );
}
