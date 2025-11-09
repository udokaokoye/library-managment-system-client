#!/usr/bin/env bash
set -euo pipefail

# Simple end-to-end smoke test for the client+auth flow.
# Usage: ./scripts/e2e-smoke.sh [BASE_URL]
# BASE_URL defaults to http://localhost:3001

BASE_URL=${1:-http://localhost:3001}
COOKIE_JAR="/tmp/e2e-auth-cookies"

echo "Running e2e smoke tests against $BASE_URL"

echo "1) Ping proxy -> /api/auth/ping"
ping_out=$(curl -sS "$BASE_URL/api/auth/ping" || true)
echo "  -> response: $ping_out"

if echo "$ping_out" | grep -q '"reachable":true'; then
  echo "  OK: auth server reachable via proxy"
else
  echo "  FAIL: auth server not reachable via proxy"
  echo "$ping_out"
  exit 2
fi

echo "2) Login via /api/auth/login"
# save headers and body for debugging
rm -f "$COOKIE_JAR"
login_resp_headers=/tmp/e2e-login-headers
login_resp_body=/tmp/e2e-login-body
curl -s -D "$login_resp_headers" -o "$login_resp_body" -c "$COOKIE_JAR" \
  -X POST "$BASE_URL/api/auth/login" \
  -H 'Content-Type: application/json' \
  -d '{"email":"user@example.com","password":"password"}' || true

echo "  -> login headers:"
sed -n '1,120p' "$login_resp_headers" || true
echo "  -> login body:"
sed -n '1,200p' "$login_resp_body" || true

if grep -qi "set-cookie" "$login_resp_headers"; then
  echo "  OK: Set-Cookie received"
else
  echo "  FAIL: no Set-Cookie in login response"
  exit 3
fi

echo "3) GET /api/auth/userdetails using saved cookie"
user_resp_headers=/tmp/e2e-user-headers
user_resp_body=/tmp/e2e-user-body
curl -s -D "$user_resp_headers" -o "$user_resp_body" -b "$COOKIE_JAR" "$BASE_URL/api/auth/userdetails" || true
echo "  -> userdetails headers:"
sed -n '1,120p' "$user_resp_headers" || true
echo "  -> userdetails body:"
sed -n '1,400p' "$user_resp_body" || true

if grep -q '"user"' "$user_resp_body"; then
  echo "  OK: userdetails returned"
else
  echo "  FAIL: userdetails not returned"
  exit 4
fi

echo "4) (Optional) Attempt reserve POST /api/books/reserve"
reserve_resp_headers=/tmp/e2e-reserve-headers
reserve_resp_body=/tmp/e2e-reserve-body
curl -s -D "$reserve_resp_headers" -o "$reserve_resp_body" -b "$COOKIE_JAR" -X POST "$BASE_URL/api/books/reserve" -H 'Content-Type: application/json' -d '{"bookId":1}' || true
echo "  -> reserve headers:"
sed -n '1,120p' "$reserve_resp_headers" || true
echo "  -> reserve body (first 400 chars):"
head -c 400 "$reserve_resp_body" | sed -n '1,400p' || true

if grep -q '^HTTP/1.1 20' "$reserve_resp_headers"; then
  echo "  OK: reserve accepted"
else
  echo "  NOTE: reserve endpoint returned non-2xx (may be unimplemented in this branch)."
fi

echo "E2E smoke tests completed successfully (login + userdetails passed)."
exit 0
