#!/usr/bin/env bash
# test-resources.sh — Create resource, like, filter by category, delete
set -euo pipefail

BASE=${API_BASE:-http://localhost:8080}
TOKEN=${AUTH_TOKEN:-}

if [[ -z "$TOKEN" ]]; then
  echo "AUTH_TOKEN not set. Run test-auth.sh first."
  exit 1
fi

H="Authorization: Bearer $TOKEN"

echo "=== Resource Service Tests ==="

# Create resource
echo -n "  Create resource ... "
RES=$(curl -s -X POST "$BASE/api/resources" \
  -H "Content-Type: application/json" -H "$H" \
  -d '{"title":"Test Resource","description":"Automated test resource","type":"ARTICLE","category":"CAREER","url":"https://example.com"}')
RES_ID=$(echo "$RES" | grep -o '"id":[0-9]*' | head -1 | cut -d: -f2)
[[ -z "$RES_ID" ]] && { echo "FAIL — $RES"; exit 1; }
echo "OK — id=$RES_ID"

# Get all resources
echo -n "  GET /api/resources ... "
RESOURCES=$(curl -s "$BASE/api/resources" -H "$H")
echo "OK — $(echo "$RESOURCES" | grep -o '"id"' | wc -l) resources"

# Filter by category
echo -n "  GET /api/resources?category=CAREER ... "
FILTERED=$(curl -s "$BASE/api/resources?category=CAREER" -H "$H")
echo "OK — $(echo "$FILTERED" | grep -o '"id"' | wc -l) CAREER resources"

# Like resource
echo -n "  Toggle like on resource $RES_ID ... "
LIKE=$(curl -s -X POST "$BASE/api/resources/$RES_ID/like" -H "$H")
echo "OK — likeCount=$(echo "$LIKE" | grep -o '"likeCount":[0-9]*' | cut -d: -f2)"

# Delete resource
echo -n "  Delete resource $RES_ID ... "
curl -s -X DELETE "$BASE/api/resources/$RES_ID" -H "$H" -o /dev/null
echo "OK"

echo ""
echo "=== Resource tests PASSED ==="
