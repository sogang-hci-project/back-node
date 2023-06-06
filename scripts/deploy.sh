#!/bin/bash
cd /home/ubuntu/src/back-node
npm i
sudo npm run build
pm2 kill
npm run start:pm2
