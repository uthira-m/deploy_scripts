#!/bin/bash

read -p "Enter database name: " DBNAME

BACKUP_DIR="/var/lib/postgresql/db-backups"
DATE=$(date +"%Y-%m-%d_%H-%M")

# Ensure backup directory exists
sudo mkdir -p $BACKUP_DIR
sudo chown postgres:postgres $BACKUP_DIR

# Run backup fully as postgres
sudo -u postgres bash -c "pg_dump $DBNAME > $BACKUP_DIR/$DBNAME-$DATE.sql"

# Check result
if [ $? -eq 0 ]; then
    echo "Backup completed: $BACKUP_DIR/$DBNAME-$DATE.sql"
else
    echo "Backup failed!"
fi
