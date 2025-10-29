import React from 'react'
import { LiquidityData } from '../types'
import { TrendingUp, DollarSign, Factory, Activity, ArrowUp, ArrowDown, Target } from 'lucide-react'

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

  // Calculate leadership indicators
  const m2LeadingFed = data.m2_yoy > data.fed_yoy
  const m2LeadStrength = Math.abs(data.m2_yoy - data.fed_yoy)
  const m2Direction = data.m2_yoy > 0 ? '↑' : '↓'
  const fedDirection = data.fed_yoy > 0 ? '↑' : '↓'

  // Determine signal phase based on Raoul Pal's methodology
  const getSignalPhase = () => {
    if (data.m2_yoy > 6 && data.fed_yoy > 0 && data.manufacturing_yoy >= 0 && data.tga_rrp_4wk_change < 0) {
      return { phase: 'PHASE 3', description: 'FULL RISK-ON' }
    } else if (data.m2_yoy > 0 && data.fed_yoy > 0 && data.manufacturing_yoy >= 0 && data.tga_rrp_4wk_change < 0) {
      return { phase: 'EARLY RISK-ON', description: 'M2 > 6% → PHASE 3' }
    } else if (data.fed_yoy < -3 && data.manufacturing_yoy <= -3) {
      return { phase: 'TIGHT LIQUIDITY', description: 'RESTRICTIVE CONDITIONS' }
    } else {
      return { phase: 'NEUTRAL', description: 'MIXED SIGNALS' }
    }
  }

  const signalPhase = getSignalPhase()

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

      {/* Leadership Analysis */}
      <div className="mt-6 p-4 bg-gray-900/50 border border-gray-700 rounded-lg">
        <div className="tactical-title mb-4 text-lg">LEADERSHIP ANALYSIS</div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* M2 vs Fed Leadership */}
          <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded border border-gray-600">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-tactical-blue" />
              <span className="font-jetbrains text-sm text-gray-300">M2 vs FED</span>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1">
                <span className="font-jetbrains text-sm text-white">
                  {m2LeadingFed ? 'M2 LEADING' : 'FED LEADING'}
                </span>
                {m2LeadingFed ? (
                  <ArrowUp className="w-4 h-4 text-tactical-green" />
                ) : (
                  <ArrowDown className="w-4 h-4 text-tactical-red" />
                )}
              </div>
              <div className="font-jetbrains text-xs text-gray-400">
                {m2Direction}{m2LeadStrength.toFixed(1)}% vs {fedDirection}{Math.abs(data.fed_yoy).toFixed(1)}%
              </div>
            </div>
          </div>

          {/* BTC vs SPX Leadership (placeholder - would need historical data) */}
          <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded border border-gray-600">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-tactical-orange" />
              <span className="font-jetbrains text-sm text-gray-300">BTC vs SPX</span>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1">
                <span className="font-jetbrains text-sm text-white">BTC LEADING</span>
                <ArrowUp className="w-4 h-4 text-tactical-green" />
              </div>
              <div className="font-jetbrains text-xs text-gray-400">+1.4z</div>
            </div>
          </div>
        </div>

        {/* Signal and Next Phase */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-3 bg-tactical-orange/10 border border-tactical-orange/30 rounded">
            <div className="font-jetbrains text-sm text-tactical-orange mb-1">SIGNAL</div>
            <div className="font-jetbrains text-lg font-bold text-white">{signalPhase.phase}</div>
          </div>
          <div className="p-3 bg-tactical-green/10 border border-tactical-green/30 rounded">
            <div className="font-jetbrains text-sm text-tactical-green mb-1">NEXT</div>
            <div className="font-jetbrains text-sm text-white">{signalPhase.description}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MetricsGrid
