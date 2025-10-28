import React from 'react'
import { LiquidityData } from '../types'
import { TrendingUp, DollarSign, Factory, Activity } from 'lucide-react'

interface MetricsGridProps {
  data: LiquidityData
}

const MetricsGrid: React.FC<MetricsGridProps> = ({ data }) => {
  const metrics = [
    {
      icon: TrendingUp,
      label: 'FEDERAL RESERVE BALANCE SHEET',
      value: `${data.fed_yoy.toFixed(1)}%`,
      unit: 'YOY CHANGE',
      color: 'border-l-tactical-green'
    },
    {
      icon: DollarSign,
      label: 'M2 MONEY SUPPLY',
      value: `${data.m2_yoy.toFixed(1)}%`,
      unit: 'YOY CHANGE',
      color: 'border-l-tactical-blue'
    },
    {
      icon: Factory,
      label: 'MANUFACTURING ACTIVITY',
      value: `${data.manufacturing_yoy.toFixed(1)}%`,
      unit: 'PRODUCTION YOY',
      color: 'border-l-tactical-orange'
    },
    {
      icon: Activity,
      label: 'TREASURY + RRP',
      value: `$${data.tga_rrp_4wk_change.toFixed(0)}B`,
      unit: '4WK CHANGE',
      color: 'border-l-tactical-purple'
    }
  ]

  return (
    <div className="tactical-panel">
      <div className="tactical-title mb-5">OPERATIONAL METRICS</div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => (
          <div key={index} className={`metric-card ${metric.color}`}>
            <div className="flex items-center gap-2 mb-2">
              <metric.icon className="w-4 h-4 text-tactical-orange" />
              <div className="metric-label">{metric.label}</div>
            </div>
            <div className="metric-value">{metric.value}</div>
            <div className="font-jetbrains text-xs text-gray-500 mt-1">{metric.unit}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default MetricsGrid
