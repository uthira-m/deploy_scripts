#!/bin/bash

echo "Checking Node and npm versions"

node_version=$(node -v)
npm_version=$(npm -v)

echo "Node Version: $node_version"
echo "npm Version: $npm_version"
