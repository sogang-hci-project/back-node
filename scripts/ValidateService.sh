#!/bin/bash

cd /home/ubuntu/deploy/back-node
sudo pm2 kill
sudo npm run start:pm2
