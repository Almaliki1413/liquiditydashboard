export interface LiquidityData {
  timestamp: string
  fed_yoy: number
  m2_yoy: number
  manufacturing_yoy: number
  tga_rrp_4wk_change: number
  signal: 'RISK-ON' | 'TIGHT' | 'NEUTRAL'
  signal_status: SignalStatus
}

export interface SignalStatus {
  signal: 'RISK-ON' | 'TIGHT' | 'NEUTRAL'
  message: string
  description: string
  timestamp: string
  confidence: number
}

export interface MetricData {
  name: string
  value: number
  unit: string
  change?: number
  trend?: 'up' | 'down' | 'stable'
  color: string
}

export interface SystemStatus {
  status: string
  uptime: string
  data_points: number
  signals: number
  last_update: string
  api_status: string
}

export interface HistoricalDataPoint {
  date: string
  fed_yoy: number
  m2_yoy: number
  manufacturing_yoy: number
  tga_rrp_4wk_change: number
  signal: 'RISK-ON' | 'TIGHT' | 'NEUTRAL'
  btc_index?: number
  spx_index?: number
}

export interface ChartData {
  labels: string[]
  datasets: Array<{
    label: string
    data: number[]
    borderColor: string
    backgroundColor: string
    tension?: number
  }>
}

export interface DashboardData {
  current_data: LiquidityData
  historical_data: HistoricalDataPoint[]
  metrics: MetricData[]
  system_status: SystemStatus
  chart_data: ChartData
}
