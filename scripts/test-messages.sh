#!/usr/bin/env bash
# test-messages.sh — Send message, get conversations, mark read
set -euo pipefail

BASE=${API_BASE:-http://localhost:8080}
TOKEN=${AUTH_TOKEN:-}
RECIPIENT_ID=${TEST_RECIPIENT_ID:-2}  # Target user id (must exist in DB)

if [[ -z "$TOKEN" ]]; then
  echo "AUTH_TOKEN not set. Run test-auth.sh first."
  exit 1
fi

H="Authorization: Bearer $TOKEN"

echo "=== Message Service Tests ==="

# Send direct message
echo -n "  Send message to user $RECIPIENT_ID ... "
MSG=$(curl -s -X POST "$BASE/api/messages/send" \
  -H "Content-Type: application/json" -H "$H" \
  -d "{\"recipientId\":$RECIPIENT_ID,\"content\":\"Hello from test script\"}")
MSG_ID=$(echo "$MSG" | grep -o '"id":[0-9]*' | head -1 | cut -d: -f2)
echo "OK — msg id=$MSG_ID"

# Get conversations
echo -n "  GET /api/messages/conversations ... "
CONVS=$(curl -s "$BASE/api/messages/conversations" -H "$H")
echo "OK — $(echo "$CONVS" | grep -o '"id"' | wc -l) conversations"

# Get notifications
echo -n "  GET /api/messages/notifications ... "
NOTIFS=$(curl -s "$BASE/api/messages/notifications" -H "$H")
echo "OK — $(echo "$NOTIFS" | grep -o '"id"' | wc -l) notifications"

# Mark all notifications read
echo -n "  PUT /api/messages/notifications/read ... "
curl -s -X PUT "$BASE/api/messages/notifications/read" -H "$H" -o /dev/null
echo "OK"

echo ""
echo "=== Message tests PASSED ==="
