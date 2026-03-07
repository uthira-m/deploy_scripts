#!/bin/bash
#
# IPMAS UI - Frontend deploy script for Ubuntu
# Set FRONTEND_DIR below to your frontend folder path.
# Or pass it as first argument: ./deploy-frontend.sh /path/to/frontend
#

set -e

# Manually set base frontend folder location (edit this for your environment)
FRONTEND_DIR="/path/to/ipmas/frontend"

# Override with first argument if provided
[[ -n "${1:-}" ]] && FRONTEND_DIR="$1"

# Resolve to absolute path
FRONTEND_DIR="$(cd "$FRONTEND_DIR" && pwd)"

if [[ ! -f "${FRONTEND_DIR}/package.json" ]]; then
  echo "Error: package.json not found in ${FRONTEND_DIR}"
  echo "Usage: $0 [FRONTEND_DIR]"
  exit 1
fi

echo "=== IPMAS UI deploy ==="
echo "Frontend directory: ${FRONTEND_DIR}"
echo ""

cd "$FRONTEND_DIR"

echo ">>> npm install"
npm install
echo "  OK: npm install completed"

echo ">>> npm run build:production"
npm run build:production
if [[ ! -d "${FRONTEND_DIR}/.next" ]]; then
  echo "Error: Build failed - .next directory not found"
  exit 1
fi
echo "  OK: build completed (.next exists)"

echo ">>> pm2 delete ipmas_ui (if exists)"
pm2 delete ipmas_ui 2>/dev/null || true

echo ">>> pm2 start ipmas_ui"
pm2 start npm --name ipmas_ui -- start

echo ">>> Validating pm2 process..."
sleep 2
if ! pm2 describe ipmas_ui 2>/dev/null | grep -q "status.*online"; then
  echo "Error: ipmas_ui is not running (status not online)"
  pm2 list
  exit 1
fi
echo "  OK: ipmas_ui is running"

echo ""
echo "=== Done ==="
pm2 list
