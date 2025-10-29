from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum

class SignalType(str, Enum):
    RISK_ON = "RISK-ON"
    TIGHT = "TIGHT"
    NEUTRAL = "NEUTRAL"

class MetricData(BaseModel):
    name: str
    value: float
    unit: str
    change: Optional[float] = None
    trend: Optional[str] = None
    color: str = "#ff6b35"

class SignalStatus(BaseModel):
    signal: SignalType
    message: str
    description: str
    timestamp: datetime
    confidence: float = Field(ge=0, le=1)

class LiquidityData(BaseModel):
    timestamp: datetime
    fed_yoy: float
    m2_yoy: float
    manufacturing_yoy: float
    tga_rrp_4wk_change: float
    signal: SignalType
    signal_status: SignalStatus
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class HistoricalDataPoint(BaseModel):
    date: datetime
    fed_yoy: float
    m2_yoy: float
    manufacturing_yoy: float
    tga_rrp_4wk_change: float
    signal: SignalType

class SystemStatus(BaseModel):
    status: str
    uptime: str
    data_points: int
    signals: int
    last_update: datetime
    api_status: str = "online"

class ChartData(BaseModel):
    labels: List[str]
    datasets: List[Dict[str, Any]]

class DashboardData(BaseModel):
    current_data: LiquidityData
    historical_data: List[HistoricalDataPoint]
    metrics: List[MetricData]
    system_status: SystemStatus
    chart_data: ChartData
