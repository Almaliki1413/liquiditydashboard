from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import uvicorn
import asyncio
from datetime import datetime
import json
from typing import List, Dict, Any
import os
from dotenv import load_dotenv

from services.liquidity_service import LiquidityService
from services.websocket_manager import WebSocketManager
from models.liquidity_models import LiquidityData, SignalStatus, MetricData

# Load environment variables
try:
    load_dotenv()
except:
    pass  # Continue without .env file

# Initialize FastAPI app
app = FastAPI(
    title="Liquidity Command API",
    description="Professional liquidity analytics API",
    version="2.1.7"
)

# CORS middleware for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],  # React dev servers
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
liquidity_service = LiquidityService()
websocket_manager = WebSocketManager()

@app.get("/")
async def root():
    return {"message": "Liquidity Command API", "version": "2.1.7", "status": "operational"}

@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "uptime": "72:14:33",
        "data_points": 1247,
        "signals": 3
    }

@app.get("/api/liquidity-data", response_model=LiquidityData)
async def get_liquidity_data():
    """Get current liquidity data and signals"""
    try:
        data = await liquidity_service.get_liquidity_data()
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/metrics", response_model=List[MetricData])
async def get_metrics():
    """Get key performance metrics"""
    try:
        metrics = await liquidity_service.get_metrics()
        return metrics
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/signal-status", response_model=SignalStatus)
async def get_signal_status():
    """Get current signal status"""
    try:
        signal = await liquidity_service.get_signal_status()
        return signal
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/historical-data")
async def get_historical_data(days: int = 365):
    """Get historical liquidity data"""
    try:
        data = await liquidity_service.get_historical_data(days)
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket endpoint for real-time updates"""
    await websocket_manager.connect(websocket)
    try:
        while True:
            # Send real-time updates every 30 seconds
            await asyncio.sleep(30)
            data = await liquidity_service.get_liquidity_data()
            await websocket_manager.broadcast(data.dict())
    except WebSocketDisconnect:
        websocket_manager.disconnect(websocket)

# Background task for periodic updates
@app.on_event("startup")
async def startup_event():
    """Start background tasks on startup"""
    asyncio.create_task(periodic_update())

async def periodic_update():
    """Periodic update task"""
    while True:
        try:
            # Update data every 5 minutes
            await asyncio.sleep(300)
            data = await liquidity_service.get_liquidity_data()
            await websocket_manager.broadcast(data.dict())
        except Exception as e:
            print(f"Error in periodic update: {e}")

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
