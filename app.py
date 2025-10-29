import streamlit as st
import pandas as pd
import numpy as np
import plotly.graph_objects as go
from fredapi import Fred
import os
from datetime import datetime
import warnings
warnings.filterwarnings("ignore")

st.set_page_config(
    page_title="Raoul Pal Liquidity Dashboard",
    page_icon="💰",
    layout="wide"
)

st.title("💰 RAOUL PAL LIQUIDITY DASHBOARD")
st.markdown("*Real-time liquidity signals from Federal Reserve data*")

st.info("ℹ️ **Note:** ISM PMI data was discontinued in FRED (2016). This dashboard uses Industrial Production: Manufacturing as a proxy for manufacturing activity.")

@st.cache_data(ttl=3600)
def fetch_liquidity_data(api_key):
    fred = Fred(api_key=api_key)
    
    def get(series, name):
        try:
            data = fred.get_series(series)
            if data is not None and not data.empty:
                return data.rename(name)
            else:
                st.warning(f"No data available for {series}")
                return pd.Series(dtype=float, name=name)
        except Exception as e:
            st.warning(f"Could not fetch {series}: {str(e)}")
            return pd.Series(dtype=float, name=name)
    
    fed = get('WALCL', 'Fed_Assets')
    m2 = get('M2SL', 'M2')
    mfg = get('IPMANSICS', 'Manufacturing_IP')
    tga = get('WTREGEN', 'TGA')
    rrp = get('RRPONTSYD', 'ON_RRP')
    
    df = pd.concat([fed, m2, mfg, tga, rrp], axis=1)
    df.index = pd.to_datetime(df.index)
    df = df.resample('W-THU').last()
    df = df.ffill().dropna(how='all')
    
    if df.empty:
        return None
    
    df['Fed_T'] = df['Fed_Assets'] / 1_000_000
    df['M2_T'] = df['M2'] / 1_000
    df['TGA_RRP'] = df['TGA'] + df['ON_RRP']
    df['TGA_RRP_4wk_B'] = (df['TGA_RRP'] - df['TGA_RRP'].shift(4)) / 1_000_000
    
    df['Fed_YoY'] = df['Fed_T'].pct_change(52) * 100
    df['M2_YoY'] = df['M2_T'].pct_change(52) * 100
    df['Manufacturing_YoY'] = df['Manufacturing_IP'].pct_change(52) * 100
    
    df['Signal'] = 'NEUTRAL'
    
    risk_on_mask = (
        (df['Fed_YoY'] > 0) & 
        (df['TGA_RRP_4wk_B'] < 0) & 
        (df['M2_YoY'] > 0) & 
        (df['Manufacturing_YoY'].notna()) &
        (df['Manufacturing_YoY'] >= 0)
    )
    df.loc[risk_on_mask, 'Signal'] = 'RISK-ON'
    
    tight_mask = (
        (df['Fed_YoY'] < -3) & 
        ((df['Manufacturing_YoY'].notna()) & (df['Manufacturing_YoY'] <= -3))
    )
    df.loc[tight_mask, 'Signal'] = 'TIGHT'
    
    return df

api_key = os.environ.get('FRED_API_KEY')

if not api_key:
    st.error("⚠️ FRED_API_KEY not found!")
    st.markdown("""
    ### Setup Instructions:
    1. Get a free API key from [FRED](https://fred.stlouisfed.org/docs/api/api_key.html)
    2. In Replit, click the **Secrets** tab (🔐)
    3. Add a new secret:
       - **Key**: `FRED_API_KEY`
       - **Value**: Your API key
    4. Refresh this page
    """)
    st.stop()

with st.spinner("Fetching liquidity data from FRED..."):
    df = fetch_liquidity_data(api_key)

if df is None or df.empty:
    st.error("❌ No data fetched. Please check your FRED API key.")
    st.stop()

latest = df.iloc[-1]
signal = latest['Signal']

col1, col2, col3 = st.columns([1, 2, 1])

with col2:
    if signal == "RISK-ON":
        st.success("🟢 LIQUIDITY SIGNAL: RISK-ON 🟢", icon="✅")
    elif signal == "TIGHT":
        st.error("🔴 LIQUIDITY SIGNAL: TIGHT 🔴", icon="⚠️")
    else:
        st.warning("🟡 LIQUIDITY SIGNAL: NEUTRAL 🟡", icon="ℹ️")

st.markdown("---")

col1, col2, col3, col4 = st.columns(4)

with col1:
    st.metric(
        label="Fed Balance Sheet YoY",
        value=f"{latest['Fed_YoY']:.1f}%" if pd.notna(latest['Fed_YoY']) else "N/A",
        delta=None
    )

with col2:
    st.metric(
        label="M2 Money Supply YoY",
        value=f"{latest['M2_YoY']:.1f}%" if pd.notna(latest['M2_YoY']) else "N/A",
        delta=None
    )

with col3:
    st.metric(
        label="TGA+RRP 4-Week Change",
        value=f"${latest['TGA_RRP_4wk_B']:,.0f}B" if pd.notna(latest['TGA_RRP_4wk_B']) else "N/A",
        delta=None
    )

with col4:
    st.metric(
        label="Manufacturing Production YoY",
        value=f"{latest['Manufacturing_YoY']:.1f}%" if pd.notna(latest['Manufacturing_YoY']) else "N/A",
        delta=None
    )

st.markdown("---")

fig = go.Figure()

fig.add_trace(go.Scatter(
    x=df.index, 
    y=df['Fed_YoY'], 
    name='Fed YoY %', 
    line=dict(color='lime', width=2)
))

fig.add_trace(go.Scatter(
    x=df.index, 
    y=df['M2_YoY'], 
    name='M2 YoY %', 
    line=dict(color='cyan', width=2)
))

fig.add_trace(go.Scatter(
    x=df.index, 
    y=df['Manufacturing_YoY'], 
    name='Manufacturing YoY %', 
    yaxis='y2', 
    line=dict(color='orange', width=2, dash='dot')
))

risk_on = df['Signal'] == 'RISK-ON'
if risk_on.any():
    start = None
    for i, val in enumerate(risk_on):
        if val and start is None:
            start = df.index[i]
        elif not val and start is not None:
            fig.add_vrect(
                x0=start, 
                x1=df.index[i-1], 
                fillcolor="lightgreen", 
                opacity=0.2, 
                line_width=0,
                annotation_text="RISK-ON",
                annotation_position="top left"
            )
            start = None
    if start is not None:
        fig.add_vrect(
            x0=start, 
            x1=df.index[-1], 
            fillcolor="lightgreen", 
            opacity=0.2, 
            line_width=0,
            annotation_text="RISK-ON",
            annotation_position="top left"
        )

fig.update_layout(
    title="Liquidity Conditions Over Time",
    yaxis=dict(title="YoY % Change", side="left"),
    yaxis2=dict(title="Manufacturing YoY %", overlaying="y", side="right"),
    template="plotly_dark",
    height=600,
    hovermode="x unified",
    legend=dict(
        orientation="h",
        yanchor="bottom",
        y=1.02,
        xanchor="right",
        x=1
    )
)

st.plotly_chart(fig, use_container_width=True)

st.markdown("---")

with st.expander("📊 Signal Methodology"):
    st.markdown("""
    ### RISK-ON Conditions (All must be true):
    - Fed Balance Sheet YoY > 0%
    - TGA + RRP 4-week change < 0 (liquidity being released)
    - M2 Money Supply YoY > 0%
    - Manufacturing Production YoY ≥ 0%
    
    ### TIGHT Conditions (Both must be true):
    - Fed Balance Sheet YoY < -3%
    - Manufacturing Production YoY ≤ -3%
    
    ### NEUTRAL:
    - All other conditions
    
    *Based on Raoul Pal's liquidity framework*
    
    **Note:** ISM PMI thresholds (47/45) have been replaced with Manufacturing Production YoY thresholds (0%/-3%) 
    since ISM data was removed from FRED in 2016.
    """)

with st.expander("📈 Data Sources"):
    st.markdown("""
    - **WALCL**: Federal Reserve Balance Sheet (Weekly)
    - **M2SL**: M2 Money Supply
    - **IPMANSICS**: Industrial Production: Manufacturing (replaces ISM PMI)
    - **WTREGEN**: Treasury General Account
    - **RRPONTSYD**: Overnight Reverse Repo
    
    *All data from Federal Reserve Economic Data (FRED)*
    """)

st.markdown(f"*Last updated: {datetime.now().strftime('%Y-%m-%d %H:%M UTC')}*")
