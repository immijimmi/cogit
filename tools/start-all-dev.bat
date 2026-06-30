@echo off
:: Necessary to ensure loop variables are expanded during loop execution rather than during parsing
setlocal enabledelayedexpansion

:: Stop any previous nginx processes before spawning new ones
taskkill /F /IM nginx.exe

:: Read variables from the .env file (should include NGINX_PATH)
for /f "tokens=1,* delims==" %%A in (.env) do (
    set "linestart=%%A"
    :: Ignore blank lines and lines starting with '#' (comments)
    if not "!linestart!"=="" if not "!linestart!:~0,1!"=="#" (
        set "%%A=%%B"
    )
)

cd nginx/dev
mkdir logs
mkdir temp
start cmd /k "%NGINX_PATH%" -c nginx.conf

cd ../../..

start cmd /c "@echo off && cd server && npm start"
start cmd /c "@echo off && cd client && npm start"

ngrok http 8080
