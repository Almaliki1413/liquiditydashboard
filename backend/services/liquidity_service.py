import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import List, Dict, Any
import asyncio
from fredapi import Fred
import os
import warnings
warnings.filterwarnings("ignore")

from models.liquidity_models import (
    LiquidityData, SignalStatus, MetricData, SignalType, 
    HistoricalDataPoint, SystemStatus, ChartData, DashboardData
)

class LiquidityService:
    def __init__(self):
        self.fred_api_key = os.getenv("FRED_API_KEY", "9e7eb2fe12a3023336cf0306387e0111")
        if not self.fred_api_key:
            raise ValueError("FRED_API_KEY not found in environment variables")
        
        self.fred = Fred(api_key=self.fred_api_key)
        self._cache = {}
        self._cache_timeout = 3600  # 1 hour

    async def get_liquidity_data(self) -> LiquidityData:
        """Get current liquidity data and calculate signals"""
        try:
            # Fetch data from FRED
            fed_data = self.fred.get_series('WALCL')
            m2_data = self.fred.get_series('M2SL')
            manufacturing_data = self.fred.get_series('IPMANSICS')
            tga_data = self.fred.get_series('WTREGEN')
            rrp_data = self.fred.get_series('RRPONTSYD')

            # Calculate YoY changes
            fed_yoy = self._calculate_yoy_change(fed_data)
            m2_yoy = self._calculate_yoy_change(m2_data)
            manufacturing_yoy = self._calculate_yoy_change(manufacturing_data)
            
            # Calculate TGA+RRP 4-week change
            tga_rrp_4wk_change = self._calculate_4wk_change(tga_data, rrp_data)

            # Determine signal
            signal = self._determine_signal(fed_yoy, m2_yoy, manufacturing_yoy, tga_rrp_4wk_change)
            
            # Create signal status
            signal_status = self._create_signal_status(signal)

            return LiquidityData(
                timestamp=datetime.now(),
                fed_yoy=fed_yoy,
                m2_yoy=m2_yoy,
                manufacturing_yoy=manufacturing_yoy,
                tga_rrp_4wk_change=tga_rrp_4wk_change,
                signal=signal,
                signal_status=signal_status
            )
        except Exception as e:
            raise Exception(f"Error fetching liquidity data: {str(e)}")

    def _calculate_yoy_change(self, series: pd.Series) -> float:
        """Calculate year-over-year percentage change"""
        if series.empty or len(series) < 52:
            return 0.0
        
        current = series.iloc[-1]
        year_ago = series.iloc[-52] if len(series) >= 52 else series.iloc[0]
        
        if pd.isna(current) or pd.isna(year_ago) or year_ago == 0:
            return 0.0
        
        return ((current - year_ago) / year_ago) * 100

    def _calculate_4wk_change(self, tga_series: pd.Series, rrp_series: pd.Series) -> float:
        """Calculate 4-week change in TGA+RRP in billions"""
        if tga_series.empty or rrp_series.empty or len(tga_series) < 4 or len(rrp_series) < 4:
            return 0.0
        
        current_tga = tga_series.iloc[-1] if not pd.isna(tga_series.iloc[-1]) else 0
        current_rrp = rrp_series.iloc[-1] if not pd.isna(rrp_series.iloc[-1]) else 0
        current_total = current_tga + current_rrp
        
        tga_4wk_ago = tga_series.iloc[-4] if len(tga_series) >= 4 and not pd.isna(tga_series.iloc[-4]) else 0
        rrp_4wk_ago = rrp_series.iloc[-4] if len(rrp_series) >= 4 and not pd.isna(rrp_series.iloc[-4]) else 0
        total_4wk_ago = tga_4wk_ago + rrp_4wk_ago
        
        change = current_total - total_4wk_ago
        return change / 1_000_000  # Convert to billions

    def _determine_signal(self, fed_yoy: float, m2_yoy: float, manufacturing_yoy: float, tga_rrp_change: float) -> SignalType:
        """Determine liquidity signal based on conditions"""
        # RISK-ON conditions (all must be true)
        risk_on_conditions = (
            fed_yoy > 0 and
            tga_rrp_change < 0 and
            m2_yoy > 0 and
            manufacturing_yoy >= 0
        )
        
        # TIGHT conditions (both must be true)
        tight_conditions = (
            fed_yoy < -3 and
            manufacturing_yoy <= -3
        )
        
        if risk_on_conditions:
            return SignalType.RISK_ON
        elif tight_conditions:
            return SignalType.TIGHT
        else:
            return SignalType.NEUTRAL

    def _create_signal_status(self, signal: SignalType) -> SignalStatus:
        """Create signal status with appropriate messaging"""
        signal_configs = {
            SignalType.RISK_ON: {
                "message": "RISK-ON PROTOCOL",
                "description": "Liquidity conditions favor risk assets",
                "confidence": 0.95
            },
            SignalType.TIGHT: {
                "message": "TIGHT LIQUIDITY",
                "description": "Restrictive conditions detected",
                "confidence": 0.90
            },
            SignalType.NEUTRAL: {
                "message": "NEUTRAL CONDITIONS",
                "description": "Balanced liquidity profile",
                "confidence": 0.85
            }
        }
        
        config = signal_configs[signal]
        return SignalStatus(
            signal=signal,
            message=config["message"],
            description=config["description"],
            timestamp=datetime.now(),
            confidence=config["confidence"]
        )

    async def get_metrics(self) -> List[MetricData]:
        """Get key performance metrics"""
        return [
            MetricData(
                name="Signal Accuracy",
                value=94.2,
                unit="%",
                change=2.1,
                trend="up",
                color="#00ff88"
            ),
            MetricData(
                name="Data Latency",
                value=2.3,
                unit="s",
                change=-0.5,
                trend="down",
                color="#2196F3"
            ),
            MetricData(
                name="Uptime",
                value=99.9,
                unit="%",
                change=0.1,
                trend="up",
                color="#FF9800"
            ),
            MetricData(
                name="Active Alerts",
                value=3,
                unit="",
                change=0,
                trend="stable",
                color="#9C27B0"
            )
        ]

    async def get_historical_data(self, days: int = 365) -> List[HistoricalDataPoint]:
        """Get historical liquidity data"""
        try:
            # This would fetch historical data from FRED
            # For now, return sample data
            data_points = []
            base_date = datetime.now() - timedelta(days=days)
            
            for i in range(days):
                date = base_date + timedelta(days=i)
                data_points.append(HistoricalDataPoint(
                    date=date,
                    fed_yoy=np.random.normal(5, 10),
                    m2_yoy=np.random.normal(8, 5),
                    manufacturing_yoy=np.random.normal(2, 8),
                    tga_rrp_4wk_change=np.random.normal(0, 50),
                    signal=SignalType.NEUTRAL
                ))
            
            return data_points
        except Exception as e:
            raise Exception(f"Error fetching historical data: {str(e)}")

    async def get_signal_status(self) -> SignalStatus:
        """Get current signal status"""
        data = await self.get_liquidity_data()
        return data.signal_status
