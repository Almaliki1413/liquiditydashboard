#  Liquidity Dashboard

A modern, enterprise-grade liquidity analytics dashboard built with React, TypeScript, FastAPI, and real-time WebSocket connections.

## Features

- ** Tactical Command Center UI** - Professional dark theme with orange accents
- **Real-time Data** - Live liquidity metrics and signals
- **WebSocket Integration** - Real-time updates without page refresh
- **Interactive Charts** - Professional data visualization with Recharts
- **Enterprise Security** - Professional authentication and data handling
- **Responsive Design** - Works on all devices
- **High Performance** - Optimized for speed and reliability

## Architecture

### Frontend (React + TypeScript)
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **Recharts** for data visualization
- **Zustand** for state management
- **Axios** for API calls

### Backend (FastAPI + Python)
- **FastAPI** for high-performance API
- **Pydantic** for data validation
- **WebSockets** for real-time communication
- **FRED API** for economic data
- **Pandas** for data processing
- **Plotly** for chart generation

## Quick Start

### Prerequisites
- Node.js 18+
- Python 3.11+
- Docker (optional)

### 1. Clone and Setup
```bash
git clone <your-repo>
cd liquidity-dashboard-pro
```

### 2. Backend Setup
```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
# Add your FRED_API_KEY to .env
uvicorn main:app --reload
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### 4. Docker Setup (Alternative)
```bash
docker-compose up --build
```

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```env
FRED_API_KEY=your_fred_api_key
TRADING_ECONOMICS_API_KEY=your_te_api_key
```

#### Frontend (.env.local)
```env
VITE_API_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:8000/ws
```

## API Endpoints

- `GET /api/health` - System health check
- `GET /api/liquidity-data` - Current liquidity data
- `GET /api/metrics` - Key performance metrics
- `GET /api/signal-status` - Current signal status
- `GET /api/historical-data` - Historical data
- `WS /ws` - WebSocket for real-time updates

## UI Components

- **Header** - Command center branding and status
- **Sidebar** - Navigation and system status
- **SignalStatus** - Mission status display
- **MetricsGrid** - Key operational metrics
- **LiquidityChart** - Interactive data visualization
- **DataTable** - Mission log with recent data

## Deployment

### Production Build
```bash
# Frontend
cd frontend
npm run build

# Backend
cd backend
uvicorn main:app --host 0.0.0.0 --port 8000
```

### Docker Production
```bash
docker-compose -f docker-compose.prod.yml up --build
```

## Security Features

- CORS protection
- Input validation with Pydantic
- Environment variable security
- Professional error handling
- Rate limiting (configurable)

## Performance

- **Frontend**: Vite for fast builds and HMR
- **Backend**: FastAPI for high-performance API
- **Real-time**: WebSocket for instant updates
- **Caching**: Intelligent data caching
- **Optimization**: Code splitting and lazy loading

##  Development

### Code Structure
```
liquidity-dashboard-pro/
├── backend/
│   ├── main.py
│   ├── models/
│   ├── services/
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── types/
│   └── package.json
└── docker-compose.yml
```

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `uvicorn main:app --reload` - Start backend with hot reload

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions:
- Create an issue on GitHub
- Check the documentation
- Review the API endpoints

---


