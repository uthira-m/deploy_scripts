#!/bin/bash

# Prompt for PostgreSQL username
read -p "Enter PostgreSQL username to create: " DBUSER

# Check if user already exists
USER_EXISTS=$(sudo -u postgres psql -tAc "SELECT 1 FROM pg_roles WHERE rolname='$DBUSER'")

if [ "$USER_EXISTS" = "1" ]; then
    echo "PostgreSQL user '$DBUSER' already exists."
    exit 1
fi

# Prompt password securely
read -p "Enter password: " DBPASS
echo
read -p "Confirm password: " DBPASS_CONFIRM
echo

# Verify password match
if [ "$DBPASS" != "$DBPASS_CONFIRM" ]; then
    echo "Error: Passwords do not match."
    exit 1
fi

# Create PostgreSQL superuser
sudo -u postgres bash -c "cd /tmp && psql -c \"CREATE USER $DBUSER WITH PASSWORD '$DBPASS' SUPERUSER;\""

# Verify creation
CHECK_USER=$(sudo -u postgres psql -tAc "SELECT 1 FROM pg_roles WHERE rolname='$DBUSER'")

if [ "$CHECK_USER" = "1" ]; then
    echo "PostgreSQL SUPERUSER '$DBUSER' created successfully."
else
    echo "Failed to create PostgreSQL user."
fi
