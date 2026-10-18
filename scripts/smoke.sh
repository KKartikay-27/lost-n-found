#!/usr/bin/env bash
# End-to-end user journey through the ingress, as a real client would hit it.
set -euo pipefail
BASE=${BASE:-http://lostnfound.localtest.me:8080}
EMAIL="demo-$(date +%s)@example.com"

echo "GET  /version";        curl -fsS "$BASE/version"; echo
echo "GET  /healthz";        curl -fsS "$BASE/healthz"; echo
echo "POST /api/auth/register"
TOKEN=$(curl -fsS -X POST "$BASE/api/auth/register" -H 'Content-Type: application/json' \
  -d "{\"name\":\"Demo User\",\"email\":\"$EMAIL\",\"password\":\"demo-pass-1\"}" | sed -n 's/.*"token":"\([^"]*\)".*/\1/p')
[[ -n "$TOKEN" ]] && echo "  token issued"
echo "POST /api/items"
curl -fsS -X POST "$BASE/api/items" -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
  -d '{"title":"Black wallet","description":"Found near cafeteria","type":"found","location":"Block C"}'; echo
echo "GET  /api/items?type=found"
curl -fsS "$BASE/api/items?type=found" | head -c 300; echo
echo "GET  /metrics through ingress (expect 404 — not exposed)"
curl -s -o /dev/null -w "  status %{http_code}\n" "$BASE/metrics"
echo "smoke OK"
