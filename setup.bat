@echo off
echo 🚀 Setting up Liquidity Command Dashboard...

echo.
echo 📦 Installing backend dependencies...
cd backend
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo ❌ Backend setup failed
    exit /b 1
)

echo.
echo 📦 Installing frontend dependencies...
cd ..\frontend
npm install
if %errorlevel% neq 0 (
    echo ❌ Frontend setup failed
    exit /b 1
)

echo.
echo 🔧 Creating environment files...
cd ..\backend
if not exist .env (
    echo FRED_API_KEY=your_fred_api_key_here > .env
    echo TRADING_ECONOMICS_API_KEY=your_te_api_key_here >> .env
    echo ✅ Created .env file - please add your API keys
)

cd ..\frontend
if not exist .env.local (
    echo VITE_API_URL=http://localhost:8000 > .env.local
    echo VITE_WS_URL=ws://localhost:8000/ws >> .env.local
    echo ✅ Created .env.local file
)

echo.
echo ✅ Setup complete!
echo.
echo 🚀 To start the application:
echo    1. Add your FRED_API_KEY to backend/.env
echo    2. Run: start-backend.bat
echo    3. Run: start-frontend.bat
echo.
echo Or use Docker: docker-compose up --build
echo.
pause
