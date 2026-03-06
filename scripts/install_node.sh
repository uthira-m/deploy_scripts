#!/bin/bash

echo "Installing Node.js 20.19.6"

curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

echo "Node installation completed"
node -v
npm -v
