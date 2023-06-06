#!/bin/bash
exit
cd /home/ubuntu/src/back-node
sudo git config --global --add safe.directory /home/ubuntu/src/back-node
sudo npm i
sudo npm run build
