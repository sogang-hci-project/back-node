#!/bin/bash
cd /home/ubuntu/src/back-node
npm i
sudo npm run build
sudo pm2 kill
sudo npm run start:pm2
