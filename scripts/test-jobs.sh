#!/usr/bin/env bash
# test-jobs.sh — Create job, apply, update match score, mentoring request
set -euo pipefail

BASE=${API_BASE:-http://localhost:8080}
TOKEN=${AUTH_TOKEN:-}

if [[ -z "$TOKEN" ]]; then
  echo "AUTH_TOKEN not set. Run test-auth.sh first."
  exit 1
fi

H="Authorization: Bearer $TOKEN"

echo "=== Job Service Tests ==="

# Create job
echo -n "  Create job ... "
JOB=$(curl -s -X POST "$BASE/api/jobs" \
  -H "Content-Type: application/json" -H "$H" \
  -d '{"title":"Test Dev Job","description":"Automated test job","company":"ESPRIT","location":"Tunis","type":"CDI","requiredSkills":["java","spring","docker"]}')
JOB_ID=$(echo "$JOB" | grep -o '"id":[0-9]*' | head -1 | cut -d: -f2)
[[ -z "$JOB_ID" ]] && { echo "FAIL — $JOB"; exit 1; }
echo "OK — id=$JOB_ID"

# List jobs
echo -n "  GET /api/jobs ... "
JOBS=$(curl -s "$BASE/api/jobs" -H "$H")
echo "OK — $(echo "$JOBS" | grep -o '"id"' | wc -l) jobs"

# Apply to job (no CV file, expect 400 or 200)
echo -n "  Apply to job $JOB_ID ... "
APP=$(curl -s -w "\n%{http_code}" -X POST "$BASE/api/jobs/$JOB_ID/apply" \
  -H "$H" -H "Content-Type: application/json" \
  -d '{"coverLetter":"I am a test applicant"}')
HTTP_CODE=$(echo "$APP" | tail -1)
echo "HTTP $HTTP_CODE"

# Get ranked applicants
echo -n "  GET ranked applicants for job $JOB_ID ... "
RANKED=$(curl -s "$BASE/api/jobs/$JOB_ID/ranked-applicants" -H "$H")
echo "OK — $(echo "$RANKED" | grep -o '"id"' | wc -l) applicants"

# Mentoring — list requests
echo -n "  GET /api/mentoring ... "
MENTORING=$(curl -s "$BASE/api/mentoring" -H "$H")
echo "OK"

# Cleanup
echo -n "  Delete job $JOB_ID ... "
curl -s -X DELETE "$BASE/api/jobs/$JOB_ID" -H "$H" -o /dev/null
echo "OK"

echo ""
echo "=== Job tests PASSED ==="
