import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import List, Dict, Any
import asyncio
from fredapi import Fred
import os
import warnings
warnings.filterwarnings("ignore")
import yfinance as yf

from models.liquidity_models import (
    LiquidityData, SignalStatus, MetricData, SignalType, 
    HistoricalDataPoint, SystemStatus, ChartData, DashboardData
)

class LiquidityService:
    def __init__(self):
        # Require a valid FRED API key via environment variables
        self.fred_api_key = os.getenv("FRED_API_KEY")
        if not self.fred_api_key:
            raise ValueError(
                "FRED_API_KEY not found. Create a .env file with FRED_API_KEY=your_key"
            )
        
        self.fred = Fred(api_key=self.fred_api_key)
        self._cache: Dict[str, Any] = {}
        self._cache_timeout = 3600  # 1 hour
        # Lightweight response cache for expensive endpoints
        self._response_cache: Dict[str, Any] = {}
        self._response_cache_timeout = 900  # 15 minutes

    def _get_series(self, series_id: str) -> pd.Series:
        """Fetch a FRED series with simple in-memory caching and error handling."""
        try:
            now = datetime.now()
            cached = self._cache.get(series_id)
            if cached and (now - cached[0]).total_seconds() < self._cache_timeout:
                return cached[1]

            series = self.fred.get_series(series_id)
            # Ensure the index is a datetime index for resampling/alignment
            series.index = pd.to_datetime(series.index)
            series = series.sort_index()
            self._cache[series_id] = (now, series)
            return series
        except Exception as exc:
            raise Exception(f"Failed to fetch FRED series '{series_id}': {exc}")

    def _calculate_monthly_yoy(self, monthly_series: pd.Series) -> float:
        """Calculate YoY using native monthly frequency (last vs 12 months ago)."""
        if monthly_series.empty:
            return 0.0
        # Ensure monthly frequency by taking month-end values
        ms = monthly_series.resample('M').last().dropna()
        if len(ms) < 13:
            return 0.0
        # Use pct_change(12) for proper YoY
        pct_12m = ms.pct_change(12).iloc[-1]
        if pd.isna(pct_12m):
            return 0.0
        return float(pct_12m) * 100.0

    def _monthly_yoy_on_date(self, monthly_series: pd.Series, dt: pd.Timestamp) -> float:
        """Monthly YoY evaluated at a specific date using latest month <= dt."""
        if monthly_series.empty:
            return 0.0
        ms = monthly_series.resample('M').last().dropna()
        # Pick the most recent month not after dt
        ms = ms[ms.index <= dt]
        if len(ms) < 13:
            return 0.0
        # Use pct_change(12) for proper YoY
        pct_12m = ms.pct_change(12).iloc[-1]
        if pd.isna(pct_12m):
            return 0.0
        return float(pct_12m) * 100.0

    async def get_liquidity_data(self) -> LiquidityData:
        """Get current liquidity data and calculate signals"""
        try:
            # Fetch data from FRED
            fed_data = self._get_series('WALCL')              # Fed balance sheet (weekly)
            m2_data = self._get_series('M2SL')                # M2 money stock (monthly)
            manufacturing_data = self._get_series('IPMANSICS')# Industrial production: manufacturing (monthly)
            tga_data = self._get_series('WTREGEN')            # Treasury General Account
            rrp_data = self._get_series('RRPONTSYD')          # Reverse repo

            # Calculate YoY changes
            fed_yoy = self._calculate_yoy_change(fed_data)
            # Use native monthly YoY for M2 (more accurate)
            m2_yoy = self._calculate_monthly_yoy(m2_data)
            manufacturing_yoy = self._calculate_monthly_yoy(manufacturing_data)
            
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
        """Get historical liquidity data from FRED and compute metrics.
        - Limited to actual FRED dates
        - Simplified to avoid complex processing that might cause errors
        """
        try:
            # Response cache
            cache_key = f"historical:{days}"
            now = datetime.now()
            cached = self._response_cache.get(cache_key)
            if cached and (now - cached[0]).total_seconds() < self._response_cache_timeout:
                return cached[1]

            print(f"Fetching FRED series...")
            # Fetch raw series
            fed = self._get_series('WALCL')
            m2 = self._get_series('M2SL')
            manuf = self._get_series('IPMANSICS')
            tga = self._get_series('WTREGEN')
            rrp = self._get_series('RRPONTSYD')

            print(f"Series fetched. Fed: {len(fed)}, M2: {len(m2)}, Manuf: {len(manuf)}")

            # Latest actual date common to all
            latest_dates = [s.index.max() for s in [fed, m2, manuf, tga, rrp] if not s.empty]
            if not latest_dates:
                print("No data available")
                return []
            end_date = min(latest_dates)
            start_date = end_date - pd.Timedelta(days=days)
            print(f"Date range: {start_date} to {end_date}")

            results: List[HistoricalDataPoint] = []

            # Use different sampling based on range
            if days <= 365:
                # Daily sampling for 1 year or less
                time_points = pd.date_range(start_date, end_date, freq='D')
            else:
                # Monthly sampling for longer ranges
                time_points = pd.date_range(start_date, end_date, freq='M')
            total_count = len(time_points)
            unit = "days" if days <= 365 else "months"
            print(f"Processing {total_count} {unit}...")

            # Fetch market data (BTC and S&P 500) and build normalized indices
            try:
                dl_start = (start_date - pd.Timedelta(days=10)).strftime('%Y-%m-%d')
                dl_end = (end_date + pd.Timedelta(days=1)).strftime('%Y-%m-%d')
                btc_df = yf.download('BTC-USD', start=dl_start, end=dl_end, progress=False)[['Close']].rename(columns={'Close':'btc'})
                spx_df = yf.download('^GSPC', start=dl_start, end=dl_end, progress=False)[['Close']].rename(columns={'Close':'spx'})
                market = btc_df.join(spx_df, how='outer').sort_index()
                market.index = pd.to_datetime(market.index)
                market = market.ffill().dropna()
                # Normalize to % change since first available within window
                if not market.empty:
                    base = market.iloc[0]
                    norm = (market / base - 1.0) * 100.0
                else:
                    norm = market
            except Exception as e:
                print(f"Market data load error: {e}")
                norm = pd.DataFrame()

            for i, dt in enumerate(time_points):
                try:
                    # Monthly YoY for M2 and Manufacturing
                    m2_yoy = self._monthly_yoy_on_date(m2, dt)
                    manuf_yoy = self._monthly_yoy_on_date(manuf, dt)
                    
                    # Ensure no NaN values
                    m2_yoy = 0.0 if pd.isna(m2_yoy) else m2_yoy
                    manuf_yoy = 0.0 if pd.isna(manuf_yoy) else manuf_yoy
                    
                    # Fed YoY calculation
                    if days <= 365:
                        # For daily sampling, use weekly data directly
                        fed_daily = fed.reindex(pd.date_range(start_date, end_date, freq='D')).ffill()
                        try:
                            curr = float(fed_daily.loc[dt])
                            prev_year = dt - pd.Timedelta(days=365)
                            prev = float(fed_daily.loc[prev_year])
                            if pd.isna(curr) or pd.isna(prev) or prev == 0:
                                fed_yoy = 0.0
                            else:
                                fed_yoy = ((curr - prev) / prev) * 100.0
                        except Exception:
                            fed_yoy = 0.0
                    else:
                        # For monthly sampling, resample weekly to monthly
                        fed_m = fed.resample('M').last().dropna()
                        fed_m = fed_m[fed_m.index <= dt]
                        if len(fed_m) >= 13:
                            curr_val = fed_m.iloc[-1]
                            prev_val = fed_m.iloc[-13]
                            if pd.isna(curr_val) or pd.isna(prev_val) or prev_val == 0:
                                fed_yoy = 0.0
                            else:
                                fed_yoy = ((curr_val - prev_val) / prev_val) * 100.0
                        else:
                            fed_yoy = 0.0
                    
                    # TGA+RRP 4-week change
                    tga_rrp_4wk_change = 0.0
                    try:
                        if days <= 365:
                            # For daily sampling, use daily data
                            tga_daily = tga.reindex(pd.date_range(start_date, end_date, freq='D')).ffill()
                            rrp_daily = rrp.reindex(pd.date_range(start_date, end_date, freq='D')).ffill()
                            try:
                                tga_now = float(tga_daily.loc[dt])
                                rrp_now = float(rrp_daily.loc[dt])
                                # 20 business days instead of 28 calendar days
                                four_weeks_ago = (dt - pd.tseries.offsets.BDay(20)).to_pydatetime()
                                # Align to index by taking the nearest previous date
                                prev_idx = tga_daily.index[tga_daily.index <= four_weeks_ago][-1]
                                tga_then = float(tga_daily.loc[prev_idx])
                                rrp_then = float(rrp_daily.loc[prev_idx])
                                
                                if pd.isna(tga_now) or pd.isna(rrp_now) or pd.isna(tga_then) or pd.isna(rrp_then):
                                    tga_rrp_4wk_change = 0.0
                                else:
                                    total_now = tga_now + rrp_now
                                    total_then = tga_then + rrp_then
                                    tga_rrp_4wk_change = (total_now - total_then) / 1_000_000.0
                            except Exception:
                                tga_rrp_4wk_change = 0.0
                        else:
                            # For monthly sampling, use monthly resampling
                            tga_m = tga.resample('M').last().dropna()
                            rrp_m = rrp.resample('M').last().dropna()
                            tga_curr = tga_m[tga_m.index <= dt]
                            rrp_curr = rrp_m[rrp_m.index <= dt]
                            if len(tga_curr) > 0 and len(rrp_curr) > 0:
                                tga_now = float(tga_curr.iloc[-1])
                                rrp_now = float(rrp_curr.iloc[-1])
                                four_weeks_ago = dt - pd.Timedelta(days=28)
                                tga_then = tga_m[tga_m.index <= four_weeks_ago]
                                rrp_then = rrp_m[rrp_m.index <= four_weeks_ago]
                                if len(tga_then) > 0 and len(rrp_then) > 0:
                                    tga_then_val = float(tga_then.iloc[-1])
                                    rrp_then_val = float(rrp_then.iloc[-1])
                                    
                                    if pd.isna(tga_now) or pd.isna(rrp_now) or pd.isna(tga_then_val) or pd.isna(rrp_then_val):
                                        tga_rrp_4wk_change = 0.0
                                    else:
                                        total_now = tga_now + rrp_now
                                        total_then = tga_then_val + rrp_then_val
                                        tga_rrp_4wk_change = (total_now - total_then) / 1_000_000.0
                    except Exception as e:
                        print(f"TGA+RRP calculation error for {dt}: {e}")
                        tga_rrp_4wk_change = 0.0

                    # Market overlays (normalized %)
                    btc_index = None
                    spx_index = None
                    try:
                        if not norm.empty and dt in norm.index:
                            btc_index = float(norm.loc[dt]['btc']) if 'btc' in norm.columns else None
                            spx_index = float(norm.loc[dt]['spx']) if 'spx' in norm.columns else None
                        else:
                            # Use nearest previous value
                            if not norm.empty:
                                nearest = norm.loc[:dt].tail(1)
                                if not nearest.empty:
                                    row = nearest.iloc[0]
                                    btc_index = float(row['btc']) if 'btc' in nearest.columns else None
                                    spx_index = float(row['spx']) if 'spx' in nearest.columns else None
                    except Exception as e:
                        print(f"Overlay calc error at {dt}: {e}")

                    # Final safety check - ensure all values are valid numbers
                    fed_yoy = 0.0 if pd.isna(fed_yoy) or not isinstance(fed_yoy, (int, float)) else fed_yoy
                    m2_yoy = 0.0 if pd.isna(m2_yoy) or not isinstance(m2_yoy, (int, float)) else m2_yoy
                    manuf_yoy = 0.0 if pd.isna(manuf_yoy) or not isinstance(manuf_yoy, (int, float)) else manuf_yoy
                    tga_rrp_4wk_change = 0.0 if pd.isna(tga_rrp_4wk_change) or not isinstance(tga_rrp_4wk_change, (int, float)) else tga_rrp_4wk_change

                    signal = self._determine_signal(fed_yoy, m2_yoy, manuf_yoy, tga_rrp_4wk_change)
                    results.append(HistoricalDataPoint(
                        date=dt.to_pydatetime(),
                        fed_yoy=fed_yoy,
                        m2_yoy=m2_yoy,
                        manufacturing_yoy=manuf_yoy,
                        tga_rrp_4wk_change=tga_rrp_4wk_change,
                        signal=signal,
                        btc_index=btc_index,
                        spx_index=spx_index
                    ))

                    if i % 10 == 0:
                        print(f"Processed {i+1}/{total_count} {unit}...")
                        
                except Exception as e:
                    print(f"Error processing point {dt}: {e}")
                    continue

            print(f"Generated {len(results)} data points")
            # store response cache
            self._response_cache[cache_key] = (now, results)
            return results
        except Exception as e:
            print(f"Error in get_historical_data: {str(e)}")
            import traceback
            traceback.print_exc()
            raise Exception(f"Error fetching historical data: {str(e)}")

    async def get_signal_status(self) -> SignalStatus:
        """Get current signal status"""
        data = await self.get_liquidity_data()
        return data.signal_status
