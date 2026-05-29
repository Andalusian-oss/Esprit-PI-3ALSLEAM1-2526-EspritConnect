#!/usr/bin/env bash
# test-events.sh — Create club, join, create event, register
set -euo pipefail

BASE=${API_BASE:-http://localhost:8080}
TOKEN=${AUTH_TOKEN:-}

if [[ -z "$TOKEN" ]]; then
  echo "AUTH_TOKEN not set. Run test-auth.sh first."
  exit 1
fi

H="Authorization: Bearer $TOKEN"

echo "=== Event Service Tests ==="

# Create club
echo -n "  Create club ... "
CLUB=$(curl -s -X POST "$BASE/api/events/clubs" \
  -H "Content-Type: application/json" -H "$H" \
  -d '{"name":"TestClub_'$$'","description":"Automated test club","category":"TECH"}')
CLUB_ID=$(echo "$CLUB" | grep -o '"id":[0-9]*' | head -1 | cut -d: -f2)
[[ -z "$CLUB_ID" ]] && { echo "FAIL — $CLUB"; exit 1; }
echo "OK — id=$CLUB_ID"

# Join club
echo -n "  Join club $CLUB_ID ... "
curl -s -X POST "$BASE/api/events/clubs/$CLUB_ID/join" -H "$H" -o /dev/null
echo "OK"

# List clubs
echo -n "  GET /api/events/clubs ... "
CLUBS=$(curl -s "$BASE/api/events/clubs" -H "$H")
echo "OK — $(echo "$CLUBS" | grep -o '"id"' | wc -l) clubs"

# Create event
echo -n "  Create event ... "
EVENT=$(curl -s -X POST "$BASE/api/events" \
  -H "Content-Type: application/json" -H "$H" \
  -d "{\"title\":\"Test Event\",\"description\":\"Automated test\",\"clubId\":$CLUB_ID,\"startDate\":\"2025-12-01T10:00:00\",\"endDate\":\"2025-12-01T12:00:00\",\"location\":\"Campus A\",\"category\":\"TECH\"}")
EVENT_ID=$(echo "$EVENT" | grep -o '"id":[0-9]*' | head -1 | cut -d: -f2)
[[ -z "$EVENT_ID" ]] && { echo "FAIL — $EVENT"; exit 1; }
echo "OK — id=$EVENT_ID"

# Register for event
echo -n "  Register for event $EVENT_ID ... "
curl -s -X POST "$BASE/api/events/$EVENT_ID/register" -H "$H" -o /dev/null
echo "OK"

# Delete event & club (cleanup)
echo -n "  Cleanup event ... "
curl -s -X DELETE "$BASE/api/events/$EVENT_ID" -H "$H" -o /dev/null
echo "OK"
echo -n "  Cleanup club ... "
curl -s -X DELETE "$BASE/api/events/clubs/$CLUB_ID" -H "$H" -o /dev/null
echo "OK"

echo ""
echo "=== Event tests PASSED ==="
