# Raoul Pal Liquidity Dashboard

## Overview

This is a financial analytics dashboard that visualizes Federal Reserve liquidity signals in real-time. The application fetches economic data from the Federal Reserve Economic Data (FRED) API and presents liquidity metrics that are relevant to macro investing strategies popularized by Raoul Pal. The dashboard provides insights into the Federal Reserve's balance sheet, money supply (M2), Manufacturing Production Index, Treasury General Account (TGA), and Overnight Reverse Repurchase Agreements (ON RRP).

**Note:** ISM Manufacturing PMI data was discontinued from FRED in 2016. This dashboard uses Industrial Production: Manufacturing (IPMANSICS) as a proxy for manufacturing activity.

## Recent Changes (October 28, 2025)

### Data Accuracy Fixes
1. **Unit Normalization**: Fixed YoY chart scaling by normalizing Fed Assets and M2 to trillions before calculating percent changes
   - Fed_Assets: Divided by 1,000,000 (millions → trillions)
   - M2: Divided by 1,000 (billions → trillions)
   - Result: Realistic YoY values (-20% to +20% range) instead of inflated values (140%+)

2. **TGA+RRP Display Units**: Corrected 4-week change display from millions to billions
   - Divided by 1,000,000 to convert from millions to billions
   - Display now shows "$XXB" instead of "$XXM"

3. **Manufacturing Indicator Replacement**: Switched from ISM PMI to Industrial Production Manufacturing
   - Old series: NAPM/NAPMNOI (discontinued in 2016)
   - New series: IPMANSICS (Industrial Production: Manufacturing)
   - Thresholds adjusted: RISK-ON ≥ 0%, TIGHT ≤ -3% (YoY percent change basis)

4. **Signal Logic Correction**: Changed TIGHT condition from OR to AND
   - Old: Fed YoY < -3% OR Manufacturing < threshold
   - New: Fed YoY < -3% AND Manufacturing YoY ≤ -3%
   - Rationale: Both conditions needed for true liquidity tightening (Raoul Pal framework)

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: Streamlit web application framework
- **Rationale**: Streamlit was chosen for its simplicity in creating data-driven dashboards with minimal frontend code. It's ideal for rapid prototyping and deployment of analytical applications.
- **Visualization**: Plotly for interactive charts
  - **Rationale**: Plotly provides rich, interactive visualizations that allow users to zoom, pan, and hover over data points for detailed insights
- **Layout**: Wide layout configuration for better chart visibility

### Backend Architecture
- **Language**: Python
- **Data Processing**: 
  - Pandas for data manipulation and time-series operations
  - NumPy for numerical computations
- **Rationale**: Python's data science ecosystem provides robust tools for financial data analysis with minimal complexity

### Data Architecture
- **Data Resampling Strategy**: Weekly resampling (Thursday close)
  - **Rationale**: Aligns with standard financial reporting cycles and reduces noise from daily fluctuations
- **Data Processing Pipeline**:
  1. Fetch multiple time series from FRED API
  2. Combine series into unified DataFrame
  3. Resample to weekly frequency
  4. Forward-fill missing values
  5. Calculate year-over-year changes
- **Caching**: Streamlit's `@st.cache_data` decorator with 1-hour TTL
  - **Rationale**: Reduces API calls to FRED and improves dashboard performance while ensuring data freshness

### Error Handling
- Warning-based approach for missing or unavailable data series
- **Rationale**: Allows the dashboard to continue functioning even if individual data series are temporarily unavailable, providing graceful degradation

## External Dependencies

### Third-Party APIs
- **FRED API (Federal Reserve Economic Data)**
  - **Purpose**: Primary data source for all economic indicators
  - **Authentication**: API key stored in environment variables/Replit Secrets
  - **Data Series Used**:
    - `WALCL`: Federal Reserve Assets (Balance Sheet) - in millions
    - `M2SL`: M2 Money Supply - in billions
    - `IPMANSICS`: Industrial Production: Manufacturing (Index 2017=100) - replaces discontinued ISM PMI
    - `WTREGEN`: Treasury General Account - in millions
    - `RRPONTSYD`: Overnight Reverse Repurchase Agreements - in millions
  - **Integration Method**: `fredapi` Python library

### Python Libraries
- **streamlit**: Web application framework
- **pandas**: Data manipulation and analysis
- **numpy**: Numerical computing
- **plotly**: Interactive visualization
- **fredapi**: FRED API client library

### Configuration
- **Secrets Management**: API keys stored as environment variables
  - For Replit deployment: Uses Replit Secrets feature (accessed via `os.environ`)
  - **Security Rationale**: Prevents API key exposure in version control

### Deployment Platform
- **Target Platform**: Replit
  - **Rationale**: Provides easy deployment with built-in secrets management and Python runtime support