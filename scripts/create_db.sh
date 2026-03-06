#!/bin/bash

# Prompt for database name
read -p "Enter database name to create: " DBNAME

# Prompt for database owner
read -p "Enter database owner username: " DBUSER

# Check if database already exists
DB_EXISTS=$(sudo -u postgres psql -tAc "SELECT 1 FROM pg_database WHERE datname='$DBNAME'")

if [ "$DB_EXISTS" = "1" ]; then
    echo "Database '$DBNAME' already exists."
    exit 1
fi

# Create database
sudo -u postgres bash -c "cd /tmp && createdb -O $DBUSER $DBNAME"

# Verify database creation
CHECK_DB=$(sudo -u postgres psql -tAc "SELECT 1 FROM pg_database WHERE datname='$DBNAME'")

if [ "$CHECK_DB" = "1" ]; then
    echo "Database '$DBNAME' created successfully with owner '$DBUSER'."
else
    echo "Failed to create database."
fi
