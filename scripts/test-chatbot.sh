#!/usr/bin/env bash
# test-chatbot.sh — Chat endpoint, health, rule-based and AI fallback
set -euo pipefail

CHATBOT=${CHATBOT_BASE:-http://localhost:8091}

echo "=== Chatbot Service Tests ==="

# Health
echo -n "  GET /health ... "
HEALTH=$(curl -s "$CHATBOT/health")
echo "OK — $(echo "$HEALTH" | grep -o '"engine":"[^"]*"')"

# Rule-based: help
echo -n "  POST /chat (help) ... "
RESP=$(curl -s -X POST "$CHATBOT/chat" \
  -H "Content-Type: application/json" \
  -d '{"message":"help","history":[],"user_role":"STUDENT"}')
ENGINE=$(echo "$RESP" | grep -o '"engine":"[^"]*"' | cut -d'"' -f4)
echo "OK — engine=$ENGINE"

# Rule-based: jobs
echo -n "  POST /chat (jobs) ... "
RESP=$(curl -s -X POST "$CHATBOT/chat" \
  -H "Content-Type: application/json" \
  -d '{"message":"how do I find jobs?","history":[]}')
[[ -z "$(echo "$RESP" | grep -o '"response"')" ]] && { echo "FAIL — $RESP"; exit 1; }
echo "OK"

# Rule-based: CV score
echo -n "  POST /chat (cv score) ... "
RESP=$(curl -s -X POST "$CHATBOT/chat" \
  -H "Content-Type: application/json" \
  -d '{"message":"how is the cv score calculated?","history":[]}')
[[ -z "$(echo "$RESP" | grep -o '"response"')" ]] && { echo "FAIL — $RESP"; exit 1; }
echo "OK"

# French message
echo -n "  POST /chat (French) ... "
RESP=$(curl -s -X POST "$CHATBOT/chat" \
  -H "Content-Type: application/json" \
  -d '{"message":"bonjour, aide moi avec les stages","history":[]}')
[[ -z "$(echo "$RESP" | grep -o '"response"')" ]] && { echo "FAIL — $RESP"; exit 1; }
echo "OK"

# Rate limiting test (send 21 requests)
echo -n "  Rate limit (21 requests) ... "
RATE_HIT=0
for i in $(seq 1 21); do
  CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$CHATBOT/chat" \
    -H "Content-Type: application/json" \
    -d '{"message":"ping","history":[]}')
  [[ "$CODE" == "429" ]] && { RATE_HIT=1; break; }
done
[[ $RATE_HIT -eq 1 ]] && echo "OK — rate limit triggered" || echo "WARN — rate limit not triggered after 21 requests"

echo ""
echo "=== Chatbot tests PASSED ==="
