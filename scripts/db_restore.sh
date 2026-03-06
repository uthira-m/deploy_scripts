#!/bin/bash

read -p "Enter database name: " DBNAME
read -p "Enter dump file path: " DUMPFILE

# Check if dump file exists
if [ ! -f "$DUMPFILE" ]; then
    echo "Dump file not found!"
    exit 1
fi

# Restore database as postgres user
sudo -u postgres psql -d $DBNAME -f $DUMPFILE

# Check restore result
if [ $? -eq 0 ]; then
    echo "Database restored successfully."
else
    echo "Database restore failed!"
fi
