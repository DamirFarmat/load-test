#!/bin/sh

npm install
npx sequelize-cli db:migrate
node scripts/create-admin.js
node index.js 