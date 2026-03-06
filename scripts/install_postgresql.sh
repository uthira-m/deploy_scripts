#!/bin/bash

echo "Installing PostgreSQL 14"

# Install required packages
sudo apt update
sudo apt install -y curl ca-certificates gnupg

# Add PostgreSQL official repository key
curl -fsSL https://www.postgresql.org/media/keys/ACCC4CF8.asc | \
sudo gpg --dearmor -o /usr/share/keyrings/postgresql.gpg

# Add PostgreSQL repository
echo "deb [signed-by=/usr/share/keyrings/postgresql.gpg] http://apt.postgresql.org/pub/repos/apt noble-pgdg main" | \
sudo tee /etc/apt/sources.list.d/pgdg.list

# Update repository
sudo apt update

# Install PostgreSQL 14
sudo apt install -y postgresql-14 postgresql-client-14

echo "PostgreSQL 14 installation completed"

# Verify version
psql --version
