#!/bin/bash

echo "Enabling PM2 startup"

pm2 startup systemd
pm2 save
