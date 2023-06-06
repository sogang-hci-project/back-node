#!/bin/bash
exit
cd /home/ubuntu/src/back-node
pm2 kill
npm run start:pm2
