@echo off
echo Starting PortMySim backend server...
echo Using JWT_SECRET: %JWT_SECRET%
echo NODE_ENV: %NODE_ENV%
cd backend
node --trace-warnings server.js 