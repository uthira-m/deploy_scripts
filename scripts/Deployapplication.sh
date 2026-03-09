#!/usr/bin/env bash

# Combined deployment script for IPMAS (Ubuntu)
# Steps:
#  1) Stop all pm2 processes
#  2) Swap LAN -> Internet (cable + netplan)
#  3) Pull latest code
#  4) Run backend + frontend deploy scripts
#  5) Swap Internet -> LAN (cable + netplan)
#  6) Verify LAN IP

set -Eeuo pipefail

trap 'echo "ERROR: Deployment failed at line $LINENO"; exit 1' ERR

NETPLAN_DIR="/etc/netplan"
LAN_FILE="${NETPLAN_DIR}/50-cloud-LAN-init.yaml"
LAN_FILE_DISABLED="${NETPLAN_DIR}/50-cloud-LAN-init.yaml-deactive"
INTERNET_FILE="${NETPLAN_DIR}/50-cloud-internet-init.yaml"
INTERNET_FILE_DISABLED="${NETPLAN_DIR}/50-cloud-internet-init.yaml-deactive"

APP_DIR="/home/badri/home/software/ipmas"
BACKEND_DEPLOY_SCRIPT="${APP_DIR}/scripts/deploy-backend.sh"
FRONTEND_DEPLOY_SCRIPT="${APP_DIR}/scripts/deploy-frontend.sh"

LAN_INTERFACE="en01"
LAN_EXPECTED_IP="169.254.124.200"

require_root() {
  if [[ "${EUID:-$(id -u)}" -ne 0 ]]; then
    echo "This script must be run as root (or with sudo)."
    exit 1
  fi
}

confirm() {
  local prompt="$1"
  local answer
  read -r -p "${prompt} (type 'yes' to continue): " answer
  if [[ "${answer}" != "yes" ]]; then
    echo "Aborted by user."
    exit 1
  fi
}

echo "======================================="
echo "   IPMAS Combined Deployment Script"
echo "======================================="

require_root

confirm "Do you want to start the deployment process now?"

echo ""
echo "Step 1) Stopping all pm2 processes..."
pm2 stop all || echo "Warning: pm2 stop all failed (maybe nothing was running)."
echo "Step 1 complete."

echo ""
echo "Step 2) LAN cable swapping (LAN -> Internet)."
echo "Please REMOVE the LAN cable and CONNECT the Internet cable to the server."
confirm "When the Internet cable is connected, confirm"

echo ""
echo "Step 3) Enabling Internet adapter (netplan swap: LAN -> Internet)..."

if [[ -f "${LAN_FILE}" ]]; then
  mv "${LAN_FILE}" "${LAN_FILE_DISABLED}"
  echo "  LAN config disabled: ${LAN_FILE} -> ${LAN_FILE_DISABLED}"
else
  echo "  Note: ${LAN_FILE} not found (may already be disabled)."
fi

if [[ -f "${INTERNET_FILE_DISABLED}" ]]; then
  mv "${INTERNET_FILE_DISABLED}" "${INTERNET_FILE}"
  echo "  Internet config enabled: ${INTERNET_FILE_DISABLED} -> ${INTERNET_FILE}"
else
  echo "  Note: ${INTERNET_FILE_DISABLED} not found (Internet may already be enabled)."
fi

echo "Applying netplan..."
netplan apply

echo ""
echo "Showing IP addresses (expect something like 192.168.x.x for Internet):"
ip a
confirm "Is the Internet IP (e.g., 192.168.x.x) visible and OK"

echo ""
echo "Step 4) Deploying the application (git pull)..."

if [[ ! -d "${APP_DIR}" ]]; then
  echo "Error: Application directory not found: ${APP_DIR}"
  exit 1
fi

cd "${APP_DIR}"
echo "Current directory: $(pwd)"
git pull
echo "Git pull complete."

echo ""
echo "Step 5) Running backend and frontend deploy scripts..."

if [[ ! -f "${BACKEND_DEPLOY_SCRIPT}" ]]; then
  echo "Error: Backend deploy script not found: ${BACKEND_DEPLOY_SCRIPT}"
  exit 1
fi

if [[ ! -f "${FRONTEND_DEPLOY_SCRIPT}" ]]; then
  echo "Error: Frontend deploy script not found: ${FRONTEND_DEPLOY_SCRIPT}"
  exit 1
fi

echo ""
echo ">>> Deploying backend..."
sh "${BACKEND_DEPLOY_SCRIPT}"

echo ""
echo ">>> Deploying frontend..."
sh "${FRONTEND_DEPLOY_SCRIPT}"

echo ""
echo "Checking pm2 processes..."
pm2 list
echo "Make sure both backend and frontend services are listed as 'online' above."
confirm "Are both backend and frontend pm2 processes running and online"

echo ""
echo "Step 6) Swapping Internet -> LAN (netplan & cable)."
echo "Enabling LAN configuration and disabling Internet configuration..."

if [[ -f "${LAN_FILE_DISABLED}" ]]; then
  mv "${LAN_FILE_DISABLED}" "${LAN_FILE}"
  echo "  LAN config enabled: ${LAN_FILE_DISABLED} -> ${LAN_FILE}"
else
  echo "  Note: ${LAN_FILE_DISABLED} not found (LAN may already be enabled)."
fi

if [[ -f "${INTERNET_FILE}" ]]; then
  mv "${INTERNET_FILE}" "${INTERNET_FILE_DISABLED}"
  echo "  Internet config disabled: ${INTERNET_FILE} -> ${INTERNET_FILE_DISABLED}"
else
  echo "  Note: ${INTERNET_FILE} not found (may already be disabled)."
fi

echo "Applying netplan..."
netplan apply

echo ""
echo "Now CHANGE the cable from Internet back to LAN."
confirm "After LAN cable is connected, confirm"

echo ""
echo "Checking IP for LAN..."
ip a

if ip a show "${LAN_INTERFACE}" 2>/dev/null | grep -q "${LAN_EXPECTED_IP}"; then
  echo "LAN IP ${LAN_EXPECTED_IP} is visible on interface ${LAN_INTERFACE}."
  echo "Software deployed successfully."
else
  echo "WARNING: Expected LAN IP ${LAN_EXPECTED_IP} is NOT visible on interface ${LAN_INTERFACE}."
  echo "Please verify network configuration manually."
fi

echo ""
echo "Deployment sequence completed."

