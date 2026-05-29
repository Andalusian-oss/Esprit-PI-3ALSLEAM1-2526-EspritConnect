#!/usr/bin/env bash
# health-check.sh — Check all ESPRIT Connect services are alive
set -euo pipefail

BASE=${API_BASE:-http://localhost:8080}
SERVICES=(
  "eureka:http://localhost:8761/actuator/health"
  "api-gateway:${BASE}/actuator/health"
  "auth:${BASE}/api/auth/actuator/health"
  "post:${BASE}/api/posts/actuator/health"
  "event:${BASE}/api/events/actuator/health"
  "job:${BASE}/api/jobs/actuator/health"
  "message:${BASE}/api/messages/actuator/health"
  "resource:${BASE}/api/resources/actuator/health"
  "cv-analyzer:http://localhost:8090/health"
  "chatbot:http://localhost:8091/health"
)

PASS=0; FAIL=0
for entry in "${SERVICES[@]}"; do
  name="${entry%%:*}"
  url="${entry#*:}"
  # status code
  code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 "$url" || true)
  if [[ "$code" == "200" ]]; then
    echo "  [OK]  $name"
    ((PASS++))
  else
    echo "  [FAIL] $name — HTTP $code  ($url)"
    ((FAIL++))
  fi
done

echo ""
echo "Results: $PASS passed, $FAIL failed"
[[ $FAIL -eq 0 ]]
