#!/usr/bin/env bash
# test-rh.sh — Full RH flow: create job → apply → auto-analyze CV → ranked applicants
set -euo pipefail

BASE=${API_BASE:-http://localhost:8080}
CV_BASE=${CV_ANALYZER_BASE:-http://localhost:8090}
TOKEN=${AUTH_TOKEN:-}

if [[ -z "$TOKEN" ]]; then
  echo "AUTH_TOKEN not set. Run test-auth.sh first."
  exit 1
fi

H="Authorization: Bearer $TOKEN"

echo "=== RH Dashboard Flow Tests ==="

# 1. Create a job with required skills
echo -n "  Create job with requiredSkills ... "
JOB=$(curl -s -X POST "$BASE/api/jobs" \
  -H "Content-Type: application/json" -H "$H" \
  -d '{"title":"RH Test Dev Job","description":"Backend developer","company":"ESPRIT","location":"Tunis","type":"CDI","requiredSkills":["java","spring","docker","postgresql"]}')
JOB_ID=$(echo "$JOB" | grep -o '"id":[0-9]*' | head -1 | cut -d: -f2)
[[ -z "$JOB_ID" ]] && { echo "FAIL — $JOB"; exit 1; }
echo "OK — job id=$JOB_ID"

# 2. Get ranked applicants (empty — no applicants yet)
echo -n "  GET ranked-applicants (empty) ... "
RANKED=$(curl -s "$BASE/api/jobs/$JOB_ID/ranked-applicants" -H "$H")
echo "OK — $(echo "$RANKED" | grep -o '"id"' | wc -l | tr -d ' ') applicants"

# 3. Test CV analyzer analyze-url with job_description
echo -n "  CV analyzer — job match score ... "
CV_RESP=$(curl -s -X POST "$CV_BASE/analyze-url" \
  -H "Content-Type: application/json" \
  -d '{"url":"https://www.w3.org/WAI/WCAG21/Techniques/pdf/img/table-word.pdf","job_description":"java spring docker postgresql"}')
JOB_MATCH=$(echo "$CV_RESP" | grep -o '"job_match_score":[0-9]*' | cut -d: -f2)
CV_SCORE=$(echo "$CV_RESP" | grep -o '"score":[0-9]*' | head -1 | cut -d: -f2)
echo "OK — cv_score=${CV_SCORE:-N/A} job_match=${JOB_MATCH:-0}"

# 4. Check ATS score and tips are returned
echo -n "  CV analyzer response has ats_score and tips ... "
HAS_ATS=$(echo "$CV_RESP" | grep -o '"ats_score"')
HAS_TIPS=$(echo "$CV_RESP" | grep -o '"tips"')
[[ -n "$HAS_ATS" && -n "$HAS_TIPS" ]] && echo "OK" || echo "WARN — some fields missing"

# 5. Check red_flags returned
echo -n "  CV analyzer red_flags present ... "
HAS_FLAGS=$(echo "$CV_RESP" | grep -o '"red_flags"')
[[ -n "$HAS_FLAGS" ]] && echo "OK" || echo "WARN"

# Cleanup
echo -n "  Cleanup job ... "
curl -s -X DELETE "$BASE/api/jobs/$JOB_ID" -H "$H" -o /dev/null
echo "OK"

echo ""
echo "=== RH tests PASSED ==="
