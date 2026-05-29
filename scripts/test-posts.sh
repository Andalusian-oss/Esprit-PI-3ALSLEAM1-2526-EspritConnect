#!/usr/bin/env bash
# test-posts.sh — Create, like, comment, delete post
set -euo pipefail

BASE=${API_BASE:-http://localhost:8080}
TOKEN=${AUTH_TOKEN:-}

if [[ -z "$TOKEN" ]]; then
  echo "AUTH_TOKEN not set. Run test-auth.sh first or set AUTH_TOKEN env var."
  exit 1
fi

H="Authorization: Bearer $TOKEN"

echo "=== Post Service Tests ==="

# Create post
echo -n "  Create post ... "
POST=$(curl -s -X POST "$BASE/api/posts" \
  -H "Content-Type: application/json" -H "$H" \
  -d '{"content":"Test post from script","visibility":"PUBLIC"}')
POST_ID=$(echo "$POST" | grep -o '"id":[0-9]*' | head -1 | cut -d: -f2)
[[ -z "$POST_ID" ]] && { echo "FAIL — $POST"; exit 1; }
echo "OK — id=$POST_ID"

# Get feed
echo -n "  GET /api/posts ... "
FEED=$(curl -s "$BASE/api/posts" -H "$H")
echo "OK — $(echo "$FEED" | grep -o '"id"' | wc -l) posts"

# Like post
echo -n "  Like post $POST_ID ... "
curl -s -X POST "$BASE/api/posts/$POST_ID/like" -H "$H" -o /dev/null
echo "OK"

# Add comment
echo -n "  Comment on post $POST_ID ... "
COMMENT=$(curl -s -X POST "$BASE/api/posts/$POST_ID/comments" \
  -H "Content-Type: application/json" -H "$H" \
  -d '{"content":"Test comment"}')
COMMENT_ID=$(echo "$COMMENT" | grep -o '"id":[0-9]*' | head -1 | cut -d: -f2)
echo "OK — comment id=$COMMENT_ID"

# Delete post
echo -n "  Delete post $POST_ID ... "
curl -s -X DELETE "$BASE/api/posts/$POST_ID" -H "$H" -o /dev/null
echo "OK"

echo ""
echo "=== Post tests PASSED ==="
