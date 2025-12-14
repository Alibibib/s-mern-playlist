@echo off
echo Starting simple HTTP server for upload-music.html...
echo.
echo Open your browser and go to: http://localhost:8080/upload-music.html
echo.
echo Press Ctrl+C to stop the server
echo.

cd /d "%~dp0"
npx -y http-server -p 8080 -c-1 --cors
