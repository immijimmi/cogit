@echo off
cd ..

start cmd /c "@echo off && cd server && npm start"
start cmd /c "@echo off && cd client && npm start"

ngrok http 3000
