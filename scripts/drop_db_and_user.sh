#!/bin/bash

# Prompt for database name
read -p "Enter database name to drop: " DBNAME

# Prompt for user name
read -p "Enter database user to drop: " DBUSER

echo
echo "WARNING: This will permanently delete:"
echo "Database: $DBNAME"
echo "User: $DBUSER"
echo

read -p "Type YES to continue: " CONFIRM

if [ "$CONFIRM" != "YES" ]; then
    echo "Operation cancelled."
    exit 1
fi

echo "Dropping database connections..."

sudo -u postgres psql -c "
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE datname = '$DBNAME' AND pid <> pg_backend_pid();
"

echo "Dropping database..."

sudo -u postgres psql -c "DROP DATABASE IF EXISTS $DBNAME;"

echo "Dropping user..."

sudo -u postgres psql -c "DROP USER IF EXISTS $DBUSER;"

echo "Database and user removed successfully."
