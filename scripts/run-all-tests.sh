#!/usr/bin/env bash
# run-all-tests.sh — Orchestrates all test suites for ESPRIT Connect
# Usage: ./run-all-tests.sh [--skip-health] [--email <email>] [--password <pass>]
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
export API_BASE=${API_BASE:-http://localhost:8080}
export CV_ANALYZER_BASE=${CV_ANALYZER_BASE:-http://localhost:8090}
export CHATBOT_BASE=${CHATBOT_BASE:-http://localhost:8091}
export TEST_RECIPIENT_ID=${TEST_RECIPIENT_ID:-2}

SKIP_HEALTH=0
TEST_EMAIL=${TEST_EMAIL:-}
TEST_PASS=${TEST_PASS:-}

# Parse args
while [[ $# -gt 0 ]]; do
  case "$1" in
    --skip-health) SKIP_HEALTH=1; shift ;;
    --email) TEST_EMAIL="$2"; shift 2 ;;
    --password) TEST_PASS="$2"; shift 2 ;;
    *) echo "Unknown arg: $1"; exit 1 ;;
  esac
done

PASS_SUITES=0
FAIL_SUITES=0

run_suite() {
  local name="$1"
  local script="$2"
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "  Running: $name"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  if bash "$script"; then
    ((PASS_SUITES++))
  else
    echo "  !! SUITE FAILED: $name"
    ((FAIL_SUITES++))
  fi
}

echo "====================================================="
echo "  ESPRIT Connect — Full Test Suite"
echo "  API_BASE=$API_BASE"
echo "====================================================="

# Health check
[[ $SKIP_HEALTH -eq 0 ]] && run_suite "Health Check" "$SCRIPT_DIR/health-check.sh"

# Auth (must run first — sets AUTH_TOKEN)
run_suite "Auth Service" "$SCRIPT_DIR/test-auth.sh"

# Post, Events, Jobs, Messages, Resources run in parallel potential
run_suite "Post Service" "$SCRIPT_DIR/test-posts.sh"
run_suite "Event Service" "$SCRIPT_DIR/test-events.sh"
run_suite "Job Service" "$SCRIPT_DIR/test-jobs.sh"
run_suite "Message Service" "$SCRIPT_DIR/test-messages.sh"
run_suite "Resource Service" "$SCRIPT_DIR/test-resources.sh"

# Python services
run_suite "CV Analyzer" "$SCRIPT_DIR/test-cv-analyzer.sh"
run_suite "Chatbot" "$SCRIPT_DIR/test-chatbot.sh"

# RH end-to-end
run_suite "RH Dashboard Flow" "$SCRIPT_DIR/test-rh.sh"

echo ""
echo "====================================================="
echo "  FINAL RESULTS"
echo "  Passed suites : $PASS_SUITES"
echo "  Failed suites : $FAIL_SUITES"
echo "====================================================="

[[ $FAIL_SUITES -eq 0 ]]
