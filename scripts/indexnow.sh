#!/usr/bin/env bash
# Tells Bing, Yandex, Seznam, and Naver (IndexNow) that every URL in the live sitemap changed.
# Run after a deploy that adds or edits pages:  bash scripts/indexnow.sh
# The key file public/<key>.txt must be live first. Google does not use IndexNow; it reads sitemap.xml.
set -euo pipefail

HOST="numberforagents.com"
KEY_FILE=$(ls "$(dirname "$0")/../public" | grep -E '^[0-9a-f]{32}\.txt$' | head -1)
KEY="${KEY_FILE%.txt}"

URLS=$(curl -fsS "https://$HOST/sitemap.xml" | grep -o '<loc>[^<]*</loc>' | sed -e 's#<loc>##' -e 's#</loc>##' | jq -R . | jq -s .)

jq -n --arg host "$HOST" --arg key "$KEY" --argjson urls "$URLS" \
  '{host: $host, key: $key, keyLocation: "https://\($host)/\($key).txt", urlList: $urls}' |
  curl -sS -o /dev/null -w "IndexNow: HTTP %{http_code} for $(echo "$URLS" | jq length) URLs\n" \
    -H "Content-Type: application/json; charset=utf-8" -X POST --data-binary @- https://api.indexnow.org/indexnow
