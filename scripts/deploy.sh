#!/bin/bash

npm run build
pm2 kill
npm run start:pm2
touch siwon.txt