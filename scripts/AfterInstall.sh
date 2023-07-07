#!/bin/bash
cd /home/ubuntu/back-node
sudo npm i
sudo npm run build
sudo cp -r src/datas/markdown dist/datas
sudo cp -r src/data_store dist
