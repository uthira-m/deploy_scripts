#!/bin/bash
#
# IPMAS - Backend (Go) deploy script for Ubuntu
# Set BACKEND_DIR below to your backend-go folder (where the binary is built/run).
# Or pass it as first argument: ./deploy-backend.sh /path/to/backend-go
#

set -e

# Manually set base backend folder location (edit this for your environment)
BACKEND_DIR="/path/to/ipmas/backend-go"

# Override with first argument if provided
[[ -n "${1:-}" ]] && BACKEND_DIR="$1"

# Resolve to absolute path
BACKEND_DIR="$(cd "$BACKEND_DIR" && pwd)"

if [[ ! -f "${BACKEND_DIR}/go.mod" ]]; then
  echo "Error: go.mod not found in ${BACKEND_DIR}"
  echo "Usage: $0 [BACKEND_DIR]"
  exit 1
fi

echo "=== IPMAS Backend deploy ==="
echo "Backend directory: ${BACKEND_DIR}"
echo ""

cd "$BACKEND_DIR"

if [[ ! -f "${BACKEND_DIR}/ipmas-backend-go" ]]; then
  echo "Error: Binary ipmas-backend-go not found in ${BACKEND_DIR}"
  echo "Build it first: go build -o ipmas-backend-go ."
  exit 1
fi
echo "  OK: binary found"

echo ">>> pm2 delete ipmas-backend-go (if exists)"
pm2 delete ipma-backend-go 2>/dev/null || true

echo ">>> pm2 start ipmas-backend-go"
pm2 start ./ipmas-backend-go --name ipmas-backend-go

echo ">>> Validating pm2 process..."
sleep 2
if ! pm2 describe ipmas-backend-go 2>/dev/null | grep -q "status.*online"; then
  echo "Error: ipmas-backend-go is not running (status not online)"
  pm2 list
  exit 1
fi
echo "  OK: ipmas-backend-go is running"

echo ""
echo "=== Done ==="
pm2 list
