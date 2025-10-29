import axios from 'axios'
import { LiquidityData, MetricData, SignalStatus, SystemStatus, HistoricalDataPoint } from '../types'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`)
    return config
  },
  (error) => {
    console.error('❌ API Request Error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`)
    return response
  },
  (error) => {
    console.error('❌ API Response Error:', error.response?.data || error.message)
    return Promise.reject(error)
  }
)

export const apiService = {
  // Health check
  async getHealth(): Promise<SystemStatus> {
    const response = await api.get('/api/health')
    return response.data
  },

  // Get current liquidity data
  async getLiquidityData(): Promise<LiquidityData> {
    const response = await api.get('/api/liquidity-data')
    return response.data
  },

  // Get metrics
  async getMetrics(): Promise<MetricData[]> {
    const response = await api.get('/api/metrics')
    return response.data
  },

  // Get signal status
  async getSignalStatus(): Promise<SignalStatus> {
    const response = await api.get('/api/signal-status')
    return response.data
  },

  // Get historical data
  async getHistoricalData(days: number = 365): Promise<HistoricalDataPoint[]> {
    const response = await api.get(`/api/historical-data?days=${days}`)
    return response.data
  },
}

export default api
