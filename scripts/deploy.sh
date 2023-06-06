#!/bin/bash
cd /home/ubuntu/src/back-node
npm i
sudo npm run build
cd /usr/bin/pm2
sudo pm2 kill
cd /home/ubuntu/src/back-node
sudo npm run start:pm2
