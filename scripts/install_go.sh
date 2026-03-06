#!/bin/bash

GO_VERSION="${GO_VERSION:-1.22.4}"

echo "Installing Go ${GO_VERSION}"

# Detect architecture
ARCH=$(uname -m)
case "$ARCH" in
  x86_64)
    GO_ARCH="amd64"
    ;;
  aarch64|arm64)
    GO_ARCH="arm64"
    ;;
  *)
    echo "Unsupported architecture: $ARCH"
    exit 1
    ;;
esac

# Detect OS
OS=$(uname -s | tr '[:upper:]' '[:lower:]')
case "$OS" in
  linux)
    GO_OS="linux"
    ;;
  darwin)
    GO_OS="darwin"
    ;;
  *)
    echo "Unsupported OS: $OS"
    exit 1
    ;;
esac

TARBALL="go${GO_VERSION}.${GO_OS}-${GO_ARCH}.tar.gz"
DOWNLOAD_URL="https://go.dev/dl/${TARBALL}"

# Remove existing installation if present
if [ -d /usr/local/go ]; then
  echo "Removing existing Go installation..."
  sudo rm -rf /usr/local/go
fi

# Download and extract
echo "Downloading Go from ${DOWNLOAD_URL}..."
curl -fsSL "$DOWNLOAD_URL" -o /tmp/"$TARBALL"
sudo tar -C /usr/local -xzf /tmp/"$TARBALL"
rm /tmp/"$TARBALL"

# Add to PATH for future sessions
echo 'export PATH=$PATH:/usr/local/go/bin' | sudo tee /etc/profile.d/go.sh > /dev/null

# Add to PATH for current session
export PATH=$PATH:/usr/local/go/bin

echo "Go installation completed"
go version
