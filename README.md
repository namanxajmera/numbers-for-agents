# Number for Agents — landing site

Demand-validation landing page and waitlist for [numberforagents.com](https://numberforagents.com). Static HTML on Cloudflare Pages, waitlist API as a Pages Function, D1 storage.

## Stack

| Piece | Role |
| --- | --- |
| Cloudflare Pages | Host static files (`index.html`, guides, assets) |
| Pages Functions | `POST /api/waitlist` |
| Cloudflare D1 | Waitlist table (`email`, `created_at`, `source`, `note`) |
| Cloudflare Web Analytics | Beacon script in HTML (set token in dashboard) |

## Local development

1. Install dependencies (pins Wrangler so local D1 and Pages dev share the same database file):

```bash
npm install
```

2. Create D1 and apply schema:

```bash
npx wrangler d1 create waitlist
# Copy database_id into wrangler.toml (replace REPLACE_WITH_D1_DATABASE_ID)

npm run db:local
```

Remote/production still needs `npm run db:remote` once after you create the D1 database. Local Pages dev also auto-creates the table on first signup if you skip `db:local`.

3. Run Pages locally with Functions + D1:

```bash
npm run dev
```

Open the URL Wrangler prints (usually `http://localhost:8788`). Submit the waitlist form to hit `/api/waitlist`.

4. Optional: apply schema to remote D1 before production deploy:

```bash
wrangler d1 execute waitlist --remote --file=./schema.sql
```

## Deploy to Cloudflare Pages

### Option A: Dashboard + Git

1. Push this repo to GitHub/GitLab.
2. In Cloudflare dashboard → **Workers & Pages** → **Create** → **Pages** → connect the repo.
3. Build settings:
   - **Framework preset:** None
   - **Build command:** (leave empty)
   - **Build output directory:** `/` (repository root)
4. Deploy.

### Option B: Wrangler CLI

```bash
wrangler pages project create number-for-agents --production-branch main
wrangler pages deploy .
```

Bind D1 on the Pages project:

1. Dashboard → your Pages project → **Settings** → **Functions** → **D1 database bindings**.
2. Variable name: `DB`, database: `waitlist` (same as `wrangler.toml`).

Or add binding in `wrangler.toml` (already present) and ensure `database_id` matches the created database.

## Custom domain

1. Pages project → **Custom domains** → **Set up a custom domain**.
2. Enter `numberforagents.com` (and `www` if desired).
3. Cloudflare will prompt DNS records if the zone is on Cloudflare; otherwise add the CNAME shown in the UI.

## Google Search Console

1. Add property for `https://numberforagents.com`.
2. Choose **HTML tag** verification.
3. In `index.html`, uncomment and set:

```html
<meta name="google-site-verification" content="YOUR_VERIFICATION_TOKEN" />
```

4. Redeploy, then click **Verify** in Search Console.
5. Submit sitemap: `https://numberforagents.com/sitemap.xml`.

## Cloudflare Web Analytics

1. Dashboard → **Web Analytics** → add site `numberforagents.com`.
2. Copy the beacon token.
3. Replace `YOUR_BEACON_TOKEN` in `index.html` and guide pages (or use a single shared include pattern later).

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
├── functions/api/waitlist.ts
└── guides/
    ├── how-to-give-your-ai-agent-a-phone-number.html
    ├── ai-agent-sms-api-explained.html
    └── how-ai-voice-agents-receive-phone-calls.html
```

## Notes

- This repo is the marketing/waitlist probe only — not the telecom product.
- Do not commit real `database_id` or analytics tokens if they are environment-specific; use dashboard bindings for production.
