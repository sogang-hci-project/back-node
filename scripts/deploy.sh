#!/bin/bash
cd /home/ubuntu/src/back-node
npm i
npm run build
pm2 kill
npm run start:pm2