#!/usr/bin/env bash
# test-auth.sh — Register, login, profile, logout
set -euo pipefail

BASE=${API_BASE:-http://localhost:8080}
EMAIL="testuser_$$@esprit.tn"
PASS="TestPass123!"

echo "=== Auth Service Tests ==="

# Register
echo -n "  Register ... "
REGISTER=$(curl -s -X POST "$BASE/api/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"firstName\":\"Test\",\"lastName\":\"User\",\"email\":\"$EMAIL\",\"password\":\"$PASS\",\"role\":\"STUDENT\"}")
echo "OK — $(echo "$REGISTER" | grep -o '"userId":[0-9]*' | head -1)"

# Login
echo -n "  Login ... "
LOGIN=$(curl -s -X POST "$BASE/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASS\"}")
TOKEN=$(echo "$LOGIN" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
if [[ -z "$TOKEN" ]]; then
  echo "FAIL — no token in response: $LOGIN"
  exit 1
fi
echo "OK — token obtained (${#TOKEN} chars)"

# Get profile
echo -n "  GET /api/auth/me ... "
PROFILE=$(curl -s "$BASE/api/auth/me" -H "Authorization: Bearer $TOKEN")
echo "OK — $(echo "$PROFILE" | grep -o '"email":"[^"]*"' | head -1)"

# Update profile
echo -n "  PUT /api/auth/me ... "
UPDATE=$(curl -s -X PUT "$BASE/api/auth/me" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Updated","lastName":"User"}')
echo "OK"

# Logout
echo -n "  Logout ... "
curl -s -X POST "$BASE/api/auth/logout" -H "Authorization: Bearer $TOKEN" -o /dev/null
echo "OK"

echo ""
echo "=== Auth tests PASSED ==="
export AUTH_TOKEN="$TOKEN"
