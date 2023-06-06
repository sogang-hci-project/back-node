#!/bin/bash
npm i
npm run build
pm2 kill
npm run start:pm2