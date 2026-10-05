# Numbers for Agents — landing site

Demand-validation landing page and waitlist for [numberforagents.com](https://numberforagents.com). Static HTML on Cloudflare Pages, waitlist API as a Pages Function, D1 storage.

## Deploy

**Push to `main` → GitHub Actions deploys to Cloudflare Pages.**

Repo secret `CLOUDFLARE_API_TOKEN` is configured. To rotate: `cf user tokens create` (Pages + Workers Scripts + D1 write) and `gh secret set`.

Local deploy (uses your `cf login` session): `npx wrangler pages deploy . --project-name=numbers-for-agents`

## Local development

```bash
wrangler pages dev . --d1=DB=waitlist
```

Remote D1 schema (once): `wrangler d1 execute waitlist --remote --file=./schema.sql`

## Google Search Console (DNS)

1. Add domain property `numberforagents.com` in Search Console.
2. Copy the **TXT** value Google gives you (`google-site-verification=...`).
3. Add the record:

```bash
cf dns records create --zone numberforagents.com --body '{
  "type": "TXT",
  "name": "numberforagents.com",
  "content": "PASTE_GOOGLE_TXT_VALUE_HERE",
  "ttl": 3600
}'
```

4. Verify in Search Console, then submit sitemap: `https://numberforagents.com/sitemap.xml`

## Analytics (visitors vs bots)

**Use Web Analytics for humans** (not zone **Traffic → Visitors**, which counts scanners).

| Dashboard | What it is |
|-----------|------------|
| **Analytics & logs → Web Analytics → numberforagents.com** | Page views, visits, referrers, countries (best visitor view). |
| **Security → Events** | Blocked probes, bot scores. |
| **Workers & Pages → numbers-for-agents → Metrics** | `/api/waitlist` requests. |
| **D1 `waitlist` table** | Real signups. |

Beacon is injected by Cloudflare (**zone auto-install** + **Pages Web Analytics token**). No HTML snippet in the repo.

WAF custom ruleset **numberforagents security** blocks `.env` probes, known scanner user agents, and bad `host:port` traffic. **Always Use HTTPS** is on.

**Bots / AI (SEO vs noise):** AI **training** bots blocked; **search** + **user** assistants allowed; **content** bots blocked at edge; **Bot Fight Mode** off (keeps Google/Bing safe). Managed `robots.txt` prepends CF policy to your sitemap line.

Re-apply or inspect via API: see `scripts/cf-visitor-insights.sh`.

## Waitlist API

- `POST /api/waitlist` — JSON `{ "email", "source" }`, honeypot field `company`

## Layout

```
index.html, styles.css, main.js, guides/, functions/api/waitlist.js, wrangler.toml, schema.sql
```
