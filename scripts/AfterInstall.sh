#!/bin/bash
cd /home/ubuntu/deploy/back-node
sudo npm i
sudo npx ts-node -r tsconfig-paths/register src/lib/langchain/save-local-db.ts
sudo npm run build
sudo cp -r src/datas/markdown dist/datas
sudo cp -r src/data_store dist
