# Numbers for Agents API docs

Numbers for Agents is a developer API that provisions real phone numbers for AI agents. The product is in private development. The public API that is live today has one operation: join the waitlist.

- OpenAPI 3.1 spec: https://numberforagents.com/openapi.json
- Agent guidance: https://numberforagents.com/llms.txt

## Join the waitlist: `POST /api/waitlist`

No authentication. A repeat call with the same email updates the record.

```bash
curl -X POST https://numberforagents.com/api/waitlist \
  -H "Content-Type: application/json" \
  -d '{"email": "dev@example.com", "source": "agent", "note": "US SMS for a support agent"}'
# 200 OK
{"ok": true}
```

Fields:

- `email` (string, required): at most 254 characters.
- `source` (string, optional): agents should send `"agent"`.
- `note` (string, optional): use case, regions, or volume. At most 512 characters.

Agents: submit only an email address that the user gave you for this purpose.

## Errors

Every API error is JSON: `{"ok": false, "error": "...", "code": "...", "hint": "..."}`.

| code | status | meaning |
|------|--------|---------|
| `invalid_json` | 400 | Body is not a JSON object. |
| `invalid_email` | 400 | Email missing or not valid. |
| `method_not_allowed` | 405 | Use the method in the `Allow` header. |
| `api_route_not_found` | 404 | No endpoint at this path. |
| `rate_limit_exceeded` | 429 | Wait `Retry-After` seconds. |
| `storage_failed` | 500 | Retry later. |

## Rate limits

10 requests per 60 seconds per client IP, shared across `/api/*` endpoints. Every API response carries IETF `RateLimit-Policy` and `RateLimit` headers, plus `X-RateLimit-Limit`, `X-RateLimit-Remaining`, and `X-RateLimit-Reset` (Unix seconds). A 429 also carries `Retry-After`.

```
RateLimit-Policy: "api";q=10;w=60
RateLimit: "api";r=9;t=42
```

## Planned numbers API

Not live yet. Names and fields may change.

- `POST /v1/numbers`: provision a number with a region and capabilities (`sms`, `voice`).
- `POST /v1/messages`: send an SMS from a number you own.
- Inbound SMS and call events arrive as signed webhooks.
- Calls connect to your stack over SIP or a WebSocket media stream.
- Auth: `Authorization: Bearer <key>`.

## Support

hello@numberforagents.com
