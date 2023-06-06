#!/bin/bash
cd /home/ubuntu/src/back-node
npm i
sudo npm run build
sudo npm run kill:pm2
sudo npm run start:pm2
