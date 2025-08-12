@echo off
echo Installing dependencies...
npm install
cd client
npm install
cd ..
echo All dependencies installed!
echo.
echo To start the application, run: npm run dev