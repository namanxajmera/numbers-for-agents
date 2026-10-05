# Numbers for Agents — landing site

Demand-validation landing page and waitlist for [numberforagents.com](https://numberforagents.com). Static HTML on Cloudflare Pages, waitlist API as a Pages Function, D1 storage.

## Stack

| Piece | Role |
| --- | --- |
| Cloudflare Pages | Host static files (`index.html`, guides, assets) |
| Pages Functions | `POST /api/waitlist` |
| Cloudflare D1 | Waitlist table (`email`, `created_at`, `source`, `note`) |
| Cloudflare Web Analytics | Beacon script in HTML (set token in dashboard) |

## Local development

1. Install [Wrangler](https://developers.cloudflare.com/workers/wrangler/install-and-update/) (v4+). No Node project or `package.json` — static site plus one plain JS Pages Function.

2. Create D1 and apply schema:

```bash
wrangler d1 create waitlist
# Copy database_id into wrangler.toml (replace REPLACE_WITH_D1_DATABASE_ID)

wrangler d1 execute waitlist --local --file=./schema.sql
```

Remote/production: `wrangler d1 execute waitlist --remote --file=./schema.sql` once after you create D1. Local Pages dev also auto-creates the table on first signup if you skip the local execute.

3. Run Pages locally with Functions + D1:

```bash
wrangler pages dev . --d1=DB=waitlist
```

Open the URL Wrangler prints (usually `http://localhost:8788`). Submit the waitlist form to hit `/api/waitlist`.

4. Optional: apply schema to remote D1 before production deploy:

```bash
wrangler d1 execute waitlist --remote --file=./schema.sql
```

## Deploy to Cloudflare Pages

Production project: **numbers-for-agents** on `numberforagents.com`. The `*.pages.dev` hostname is Cloudflare’s default (preview URLs and CLI deploys). You do not need to share it; the custom domain is what users and SEO should use.

### GitHub Actions (recommended)

On every push to `master`, `.github/workflows/deploy.yml` runs `wrangler pages deploy`.

Add these [repository secrets](https://github.com/namanxajmera/numbers-for-agents/settings/secrets/actions):

| Secret | Purpose |
| --- | --- |
| `CLOUDFLARE_API_TOKEN` | API token with **Account → Cloudflare Pages → Edit** (and **Account → D1 → Edit** if you migrate via CLI). |
| `CF_WEB_ANALYTICS_TOKEN` | Beacon token from **Web Analytics** (injected into all HTML at deploy time). |
| `GSC_VERIFICATION_TOKEN` | HTML-tag value from Google Search Console (injected at deploy time). |

Create the API token: Cloudflare dashboard → **My Profile** → **API Tokens** → **Create Token** → template **Edit Cloudflare Workers** (includes Pages), or custom with Pages + D1 edit.

### Option B: Wrangler CLI (manual)

```bash
wrangler pages deploy . --project-name=numbers-for-agents
```

D1 is bound via `wrangler.toml` (`DB` → `waitlist`). Remote schema: `wrangler d1 execute waitlist --remote --file=./schema.sql`.

### Option C: Cloudflare dashboard Git (optional)

Instead of Actions, you can connect the repo under **Workers & Pages** → **numbers-for-agents** → **Settings** → **Builds** → **Connect to Git**. Use **Framework preset: None**, empty build command, output directory `/`. You still need Web Analytics and GSC tokens in HTML (or use the GitHub secrets + Actions workflow above).

## Custom domain

1. Pages project → **Custom domains** → **Set up a custom domain**.
2. Enter `numberforagents.com` (and `www` if desired).
3. Cloudflare will prompt DNS records if the zone is on Cloudflare; otherwise add the CNAME shown in the UI.

## Google Search Console

1. Open [Search Console](https://search.google.com/search-console) → **Add property** → URL prefix `https://numberforagents.com`.
2. Choose **HTML tag** verification. Copy only the `content="..."` value (not the whole tag).
3. Add GitHub secret `GSC_VERIFICATION_TOKEN` with that value, push to `master` (or replace `YOUR_VERIFICATION_TOKEN` in `index.html` and redeploy).
4. Click **Verify** in Search Console.
5. **Sitemaps** → submit `https://numberforagents.com/sitemap.xml`.

**Alternative:** DNS verification — add the TXT record Google gives you in the `numberforagents.com` zone (often faster if you skip the meta tag).

## Cloudflare Web Analytics

1. Dashboard → **Web Analytics** → **Add a site** → host `numberforagents.com` (cookieless beacon).
2. Copy the **token** from the install snippet.
3. Add GitHub secret `CF_WEB_ANALYTICS_TOKEN`, push to `master`. The workflow replaces `YOUR_BEACON_TOKEN` in every HTML file before deploy.

View traffic: **Web Analytics** in the dashboard (not the zone’s older “Analytics” tab).

## Waitlist API

- **URL:** `POST /api/waitlist`
- **Body (JSON):** `{ "email": "user@example.com", "source": "hero" }`
- **Honeypot:** field `company` — if non-empty, returns success without writing (bots).
- **Storage:** `source` comes from `data-source` on each form (`hero`, `footer`, etc.).

## Project layout

```
.
├── index.html
├── styles.css
├── main.js
├── robots.txt
├── sitemap.xml
├── schema.sql
├── wrangler.toml
├── functions/api/waitlist.js
└── guides/
    ├── how-to-give-your-ai-agent-a-phone-number.html
    ├── ai-agent-sms-api-explained.html
    └── how-ai-voice-agents-receive-phone-calls.html
```

## Notes

- This repo is the marketing/waitlist probe only — not the telecom product.
- Do not commit real `database_id` or analytics tokens if they are environment-specific; use dashboard bindings for production.
