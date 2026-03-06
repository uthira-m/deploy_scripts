#!/bin/bash

# Detect current script directory
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

SCRIPT_PATH="$SCRIPT_DIR/db_dump.sh"

chmod +x "$SCRIPT_PATH"

# Example DB name (change if needed)
DBNAME="watch"

# Add cron job
(crontab -l 2>/dev/null; echo "0 2 * * * $SCRIPT_PATH $DBNAME") | crontab -

echo "Cron job added (daily 2AM backup)"
echo "Using script: $SCRIPT_PATH"
