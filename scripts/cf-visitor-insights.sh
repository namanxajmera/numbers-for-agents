#!/usr/bin/env bash
# Cloudflare setup for cleaner traffic + visitor analytics (numberforagents.com).
# Requires: cf login (or CLOUDFLARE_API_TOKEN + CLOUDFLARE_ACCOUNT_ID).
set -euo pipefail

ZONE_NAME="numberforagents.com"
PROJECT="numbers-for-agents"
ACCOUNT_ID="${CLOUDFLARE_ACCOUNT_ID:-1059848906e1914e349ac9f704bd60c6}"

ZONE_ID="$(cf zone list --name "$ZONE_NAME" --json | jq -r '.[0].id')"
TOKEN="$(cf rum site-info list --json | jq -r --arg z "$ZONE_NAME" '.[] | select(.ruleset.zone_name==$z) | .site_token')"

echo "Zone: $ZONE_ID"
echo "Web Analytics token: ${TOKEN:0:8}…"

# Visitor-friendly HTTPS
cf zone settings always_use_https "$ZONE_ID" on

# Pages project beacon (pages.dev + custom domains)
cf pages project update "$PROJECT" --web-analytics-token="$TOKEN"

# List WAF custom rules (created via API as ruleset phase http_request_firewall_custom)
cf ruleset list --zone-id="$ZONE_ID" 2>/dev/null || true

echo ""
echo "Dashboards:"
echo "  Web Analytics (visitors): https://dash.cloudflare.com/?to=/:account/web-analytics"
echo "  Security events (bots):   https://dash.cloudflare.com/$ZONE_ID/security/events"
echo "  Pages metrics:            https://dash.cloudflare.com/?to=/:account/workers-and-pages"
