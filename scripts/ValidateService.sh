#!/bin/bash

cd /home/ubuntu/back-node
sudo pm2 kill
sudo npm run start:pm2
