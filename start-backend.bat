@echo off
echo 🚀 Starting Liquidity Command Backend...
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
