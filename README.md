# Numbers for Agents — landing site

Demand-validation landing page and waitlist for [numberforagents.com](https://numberforagents.com). Static HTML on Cloudflare Pages, waitlist API as a Pages Function, D1 storage.

## Deploy

**Push to `main` → GitHub Actions deploys to Cloudflare Pages.**

Repo secrets `CLOUDFLARE_API_TOKEN` and `CF_WEB_ANALYTICS_TOKEN` are already configured. To rotate: `cf user tokens create` (Pages + Workers Scripts + D1 write) and `gh secret set`; Web Analytics: `cf rum site-info create --host numberforagents.com --zone-tag <zone_id> --auto-install true`.

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

## Waitlist API

- `POST /api/waitlist` — JSON `{ "email", "source" }`, honeypot field `company`

## Layout

```
index.html, styles.css, main.js, guides/, functions/api/waitlist.js, wrangler.toml, schema.sql
```
