#!/bin/bash

echo "Checking PostgreSQL service"

sudo systemctl enable postgresql
sudo systemctl start postgresql
sudo systemctl status postgresql
