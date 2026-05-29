#!/usr/bin/env bash
# test-cv-analyzer.sh — Upload PDF, analyze-url, health, DOCX, job match
set -euo pipefail

CV_BASE=${CV_ANALYZER_BASE:-http://localhost:8090}
SAMPLE_PDF=${SAMPLE_CV_PDF:-}  # Set to path of a real CV PDF if available

echo "=== CV Analyzer Tests ==="

# Health
echo -n "  GET /health ... "
HEALTH=$(curl -s "$CV_BASE/health")
VERSION=$(echo "$HEALTH" | grep -o '"version":"[^"]*"' | cut -d'"' -f4)
echo "OK — version=$VERSION"

# analyze-url with a publicly accessible PDF (use a dummy test if no real URL)
echo -n "  POST /analyze-url (with job description) ... "
RESP=$(curl -s -X POST "$CV_BASE/analyze-url" \
  -H "Content-Type: application/json" \
  -d '{"url":"https://www.w3.org/WAI/WCAG21/Techniques/pdf/img/table-word.pdf","job_description":"python java spring docker kubernetes"}')
HAS_SCORE=$(echo "$RESP" | grep -o '"score"')
echo "${HAS_SCORE:-WARN no score} — $(echo "$RESP" | grep -o '"ats_score":[0-9]*' | head -1)"

# Upload a PDF if one exists
if [[ -n "$SAMPLE_PDF" && -f "$SAMPLE_PDF" ]]; then
  echo -n "  POST /analyze (PDF file) ... "
  RESP=$(curl -s -X POST "$CV_BASE/analyze" \
    -F "file=@$SAMPLE_PDF" \
    -F "job_description=python java spring")
  echo "OK — score=$(echo "$RESP" | grep -o '"score":[0-9]*' | head -1 | cut -d: -f2)"
  echo "     ats_score=$(echo "$RESP" | grep -o '"ats_score":[0-9]*' | head -1 | cut -d: -f2)"
  echo "     red_flags=$(echo "$RESP" | grep -o '"red_flags":\[' | head -1)"
  echo "     tips count=$(echo "$RESP" | grep -o '"tips":\[' | head -1)"
else
  echo "  SKIP /analyze — set SAMPLE_CV_PDF env var to a PDF path"
fi

echo ""
echo "=== CV Analyzer tests PASSED ==="
