# Numbers for Agents — landing site

Demand-validation landing page and waitlist for [numberforagents.com](https://numberforagents.com). Static HTML on Cloudflare Pages, waitlist API as a Pages Function, D1 storage.

## Deploy

**Push to `main` → GitHub Actions deploys to Cloudflare Pages.**

Repo secret `CLOUDFLARE_API_TOKEN` is configured. To rotate: `cf user tokens create` (Pages + Workers Scripts + D1 write) and `gh secret set`.

Local deploy (uses your `cf login` session): `npx wrangler pages deploy public --project-name=numbers-for-agents`

## Local development

```bash
wrangler pages dev public --d1=DB=waitlist
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

## First-party analytics (D1)

Our own page-view log in the `analytics_hits` table (same D1 as the waitlist). Cloudflare Web Analytics stays on; this does not replace or duplicate its beacon.

**One row per page view.** Who writes the row depends on who is visiting:

| Visitor | Written by | Why |
|---------|-----------|-----|
| Human | `public/analytics.js` → `POST /api/collect` | Only real browsers run the script. Bots faking a browser name do not. |
| Bot (every other bucket) | `functions/_middleware.js`, on HTML pages + `/robots.txt` + `/sitemap.xml` | Bots do not run JavaScript, so the server records them. |

The middleware skips human visits and `/api/collect` skips non-human visits, so no page view is stored twice. Like DataFast and PostHog, people with JavaScript off or with Do Not Track on are not counted.

`public/_routes.json` sends only `/`, `/guides/*`, `/api/*`, `/robots.txt`, `/sitemap.xml` to Functions, so CSS/JS/images stay free static requests. Requests the WAF blocks (scanners, AI training bots) never reach Pages and are not in this table. See **Security → Events** for those.

**Buckets** (`bucket` column, from user agent + network, `functions/_lib/classify.js`):

| Bucket | Meaning |
|--------|---------|
| `human` | Normal browser UA from a normal network |
| `ai` | AI crawlers and assistants (GPTBot, ClaudeBot, PerplexityBot, ChatGPT-User, …). `agent` holds the name |
| `search` | Search engines (Googlebot, bingbot, Applebot, …) |
| `preview` | Link previews (Slack, X, LinkedIn, Discord, …) |
| `tool` | Scripts and monitors (curl, python-requests, headless Chrome, uptime checks) |
| `datacenter` | Browser UA from a cloud network (AWS, GCP, Azure, Hetzner, …). Almost always automation |
| `scanner` | Known scanner UAs or empty UA |
| `other_bot` | Anything else that says bot/crawler or is not a browser |

Classification is by user agent only (free plan has no bot score), so a bot can fake a browser UA. Vendor IP-range checks are not implemented yet.

**Privacy choices**

- **No cookies.** Visitor = SHA-256 of a random daily salt + IP + user agent. The IP is never stored. Salts are deleted after a day, so old hashes cannot be linked back to anyone. Trade-off: one person counts once per day; returning visitors across days cannot be measured.
- Bots get no visitor hash. Only `human` rows do.
- `analytics.js` sends nothing when the browser has Do Not Track or Global Privacy Control on.
- Referrers are stored as hostname only. Page query strings are dropped except `utm_source`, `utm_medium`, `utm_campaign`.
- Rows older than 90 days are deleted daily by `.github/workflows/analytics-prune.yml`.

**Abuse limits on `/api/collect`:** same-origin only, body ≤ 2 KB, probe paths (`.env`, `wp-`, `.php`, …) ignored, 30 beacons/min per IP (in memory), 500 beacons/day per visitor. It always answers `204`.

### Reading the numbers

Run any query with:

```bash
wrangler d1 execute waitlist --remote --command "<SQL>"
```

Human visitors and page views per day:

```sql
SELECT day, COUNT(DISTINCT visitor) AS visitors, COUNT(*) AS views
FROM analytics_hits WHERE bucket = 'human'
GROUP BY day ORDER BY day DESC LIMIT 30;
```

All traffic by bucket, last 7 days:

```sql
SELECT bucket, COUNT(*) AS hits
FROM analytics_hits WHERE day >= date('now', '-7 days')
GROUP BY bucket ORDER BY hits DESC;
```

AI crawlers and search engines by name and page:

```sql
SELECT bucket, agent, path, COUNT(*) AS hits, MAX(ts) AS last_seen
FROM analytics_hits WHERE bucket IN ('ai', 'search')
  AND day >= date('now', '-30 days')
GROUP BY bucket, agent, path ORDER BY hits DESC LIMIT 50;
```

Top pages, referrers, UTM campaigns, countries (humans):

```sql
SELECT path, COUNT(*) AS views FROM analytics_hits
WHERE bucket = 'human' AND day >= date('now', '-30 days')
GROUP BY path ORDER BY views DESC;

SELECT COALESCE(ref_host, '(direct)') AS referrer, COUNT(*) AS views FROM analytics_hits
WHERE bucket = 'human' AND day >= date('now', '-30 days')
GROUP BY referrer ORDER BY views DESC LIMIT 20;

SELECT utm_source, utm_medium, utm_campaign, COUNT(DISTINCT visitor) AS visitors FROM analytics_hits
WHERE bucket = 'human' AND utm_source IS NOT NULL
GROUP BY 1, 2, 3 ORDER BY visitors DESC;

SELECT country, COUNT(DISTINCT visitor) AS visitors FROM analytics_hits
WHERE bucket = 'human' AND day >= date('now', '-30 days')
GROUP BY country ORDER BY visitors DESC;
```

Unknown bots to add to the classifier:

```sql
SELECT ua, COUNT(*) AS hits FROM analytics_hits
WHERE bucket = 'other_bot' AND day >= date('now', '-7 days')
GROUP BY ua ORDER BY hits DESC LIMIT 30;
```

### Testing

`bash scripts/e2e-analytics.sh` starts `wrangler pages dev` on a throwaway local database, sends requests as a browser, GPTBot, Googlebot, and curl, posts beacons (valid, malformed, cross-origin, and a 40-request burst), then checks the stored rows. Needs Node, `jq`, and permission to bind a local port.

## Waitlist API

- `POST /api/waitlist` — JSON `{ "email", "source" }`, honeypot field `company`

## Layout

```
public/            Everything in here is published: index.html, guides/, styles.css,
                   main.js, analytics.js, _headers, _routes.json, robots.txt, sitemap.xml
functions/         Pages Functions (server code, never served as files)
  _middleware.js   logs bot page views
  _lib/            shared code: bot classifier, analytics writes
  api/             /api/waitlist, /api/collect
schema.sql, wrangler.toml, scripts/, .github/   repo-only, not published
```
