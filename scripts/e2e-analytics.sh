#!/usr/bin/env bash
# End-to-end test for first-party analytics.
# Starts `wrangler pages dev` on a throwaway local D1, sends real HTTP requests
# as a browser, AI crawler, search engine, and script, then checks the rows.
# Expected: each human view is one beacon row, each bot view is one server row.
# Usage: bash scripts/e2e-analytics.sh
set -euo pipefail

cd "$(dirname "$0")/.."

PORT="${PORT:-8799}"
BASE="http://127.0.0.1:$PORT"
STATE="$(mktemp -d "${TMPDIR:-/tmp}/nfa-e2e.XXXXXX")"
LOG="$STATE/pages-dev.log"
WRANGLER=(npx --yes wrangler@4)

CHROME="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36"
GPTBOT="Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; GPTBot/1.2; +https://openai.com/gptbot)"
GOOGLEBOT="Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)"
GUIDE="/guides/how-to-give-your-ai-agent-a-phone-number"

cleanup() {
  # pages dev spawns child processes. Kill everything listening on the port.
  if [[ -n "${SERVER_PID:-}" ]]; then
    pkill -P "$SERVER_PID" 2>/dev/null || true
    kill "$SERVER_PID" 2>/dev/null || true
  fi
  lsof -ti "tcp:$PORT" 2>/dev/null | xargs kill 2>/dev/null || true
  rm -rf "$STATE"
}
trap cleanup EXIT

FAILED=0
check() { # check <label> <expected> <actual>
  if [[ "$2" == "$3" ]]; then
    echo "  ok   $1"
  else
    echo "  FAIL $1: expected $2, got $3"
    FAILED=1
  fi
}

get() { # get <user-agent> <path> [extra curl args]
  local ua="$1" path="$2"
  shift 2
  curl -s -m 15 -o /dev/null -w '%{http_code}' -A "$ua" "$@" "$BASE$path"
}

beacon() { # beacon <json> [extra curl args]
  local body="$1"
  shift
  curl -s -m 15 -o /dev/null -w '%{http_code}' -A "$CHROME" -X POST \
    -H 'Content-Type: text/plain;charset=UTF-8' --data "$body" "$@" "$BASE/api/collect"
}

if curl -s -m 2 -o /dev/null "$BASE/"; then
  echo "Port $PORT is already in use. Stop that server or set PORT."
  exit 1
fi

echo "Starting pages dev on :$PORT"
"${WRANGLER[@]}" pages dev public --port "$PORT" --persist-to "$STATE" >"$LOG" 2>&1 &
SERVER_PID=$!
# HEAD requests are not logged, so the readiness probe leaves no row.
for _ in $(seq 1 90); do
  curl -s -m 2 -I -o /dev/null "$BASE/" && break
  sleep 1
done
curl -s -m 2 -I -o /dev/null "$BASE/" || { echo "pages dev did not start"; cat "$LOG"; exit 1; }

echo "Sending requests"
check "browser GET /" 200 "$(get "$CHROME" "/")"
check "browser GET / with UTM + referrer" 200 \
  "$(get "$CHROME" "/?utm_source=hn&utm_medium=social&utm_campaign=launch" -e "https://news.ycombinator.com/item?id=1")"
check "GPTBot GET guide" 200 "$(get "$GPTBOT" "$GUIDE")"
check "Googlebot GET robots.txt" 200 "$(get "$GOOGLEBOT" "/robots.txt")"
check "curl GET /" 200 "$(get "curl/8.7.1" "/")"
get "$CHROME" "/styles.css" >/dev/null
get "$CHROME" "/guides/.env" >/dev/null
check "beacon accepted" 204 "$(beacon '{"p":"/","q":"?utm_source=newsletter&utm_medium=email&utm_campaign=launch","r":"https://www.google.com/"}')"
check "headless-browser beacon still 204" 204 "$(beacon '{"p":"/headless"}' -A 'Mozilla/5.0 HeadlessChrome/140.0.0.0')"
check "bad beacon still 204" 204 "$(beacon 'not json')"
check "cross-origin beacon still 204" 204 "$(beacon '{"p":"/x"}' -H 'Origin: https://evil.example')"
check "probe-path beacon still 204" 204 "$(beacon '{"p":"/.env"}')"
check "waitlist still works" 200 "$(curl -s -m 15 -o /dev/null -w '%{http_code}' -X POST \
  -H 'Content-Type: application/json' --data '{"email":"e2e@example.com","source":"e2e"}' "$BASE/api/waitlist")"

# Rate limit: 40 beacons in one burst. Avoid a minute boundary splitting the burst.
if (( 10#$(date +%S) > 50 )); then sleep 12; fi
for _ in $(seq 1 40); do beacon '{"p":"/rate-test"}' >/dev/null; done

sleep 3 # let waitUntil writes finish

echo "Checking rows"
ROW="$("${WRANGLER[@]}" d1 execute waitlist --local --persist-to "$STATE" --json --command "
SELECT
  (SELECT COUNT(*) FROM analytics_hits WHERE path='/' AND bucket='human') AS home_views,
  (SELECT COUNT(*) FROM analytics_hits WHERE bucket='human' AND status IS NOT NULL) AS human_from_server,
  (SELECT group_concat(agent || ' ' || path) FROM analytics_hits WHERE bucket='ai') AS ai,
  (SELECT group_concat(agent || ' ' || path) FROM analytics_hits WHERE bucket='search') AS search,
  (SELECT group_concat(agent) FROM analytics_hits WHERE bucket='tool') AS tool,
  (SELECT COUNT(*) FROM analytics_hits WHERE path LIKE '%.css' OR path LIKE '%.env' OR path LIKE '/api/%') AS unwanted,
  (SELECT utm_source || '|' || utm_medium || '|' || utm_campaign || '|' || ref_host
     FROM analytics_hits WHERE bucket='human' AND path='/') AS human_row,
  (SELECT COUNT(*) FROM analytics_hits WHERE path NOT IN ('/', '/rate-test', '/robots.txt', '$GUIDE')) AS bad_beacons,
  (SELECT COUNT(*) FROM analytics_hits WHERE bucket='human' AND visitor IS NULL) AS human_no_hash,
  (SELECT COUNT(*) FROM analytics_hits WHERE bucket!='human' AND visitor IS NOT NULL) AS bot_hash,
  (SELECT COUNT(DISTINCT visitor) FROM analytics_hits WHERE bucket='human') AS human_visitors,
  (SELECT COUNT(*) FROM pragma_table_info('analytics_hits') WHERE name LIKE '%ip%') AS ip_columns,
  (SELECT COUNT(*) FROM analytics_hits WHERE path='/rate-test') AS rate_rows
" 2>/dev/null | jq -c '.[0].results[0]')"

field() { jq -r --arg k "$1" '.[$k] // "" | tostring' <<<"$ROW"; }

check "home page: 1 human view (beacon only, not double)" 1 "$(field home_views)"
check "server never writes human rows" 0 "$(field human_from_server)"
check "GPTBot logged as ai" "GPTBot $GUIDE" "$(field ai)"
check "Googlebot logged as search" "Googlebot /robots.txt" "$(field search)"
check "curl logged as tool" "curl" "$(field tool)"
check "CSS, probe paths, API calls not logged" 0 "$(field unwanted)"
check "UTM + referrer host stored" "newsletter|email|launch|www.google.com" "$(field human_row)"
check "invalid and headless beacons not stored" 0 "$(field bad_beacons)"
check "humans get a visitor hash" 0 "$(field human_no_hash)"
check "bots get no visitor hash" 0 "$(field bot_hash)"
check "one human visitor" 1 "$(field human_visitors)"
check "no IP column" 0 "$(field ip_columns)"
RATE="$(field rate_rows)"
check "rate limit caps burst (stored $RATE of 40)" yes "$( (( RATE > 0 && RATE <= 30 )) && echo yes || echo no)"

if (( FAILED )); then
  echo "E2E FAILED. Server log:"
  tail -40 "$LOG"
  exit 1
fi
echo "E2E passed"
