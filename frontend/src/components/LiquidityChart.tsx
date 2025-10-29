import React, { useEffect, useMemo, useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts'
import { LiquidityData, HistoricalDataPoint } from '../types'
import { apiService } from '../services/api'

interface LiquidityChartProps {
  data: LiquidityData
}

// Helper to compute days since a fixed date
function daysSince(dateString: string): number {
  const start = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - start.getTime()
  return Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)))
}

const TABS = [
  { id: 'full', label: '2018–Present (Full Cycle)', days: daysSince('2018-01-01') },
  { id: 'yoy2025', label: 'Current Year YoY', days: 365 },
  { id: 'injections', label: '4‑Week Liquidity Injections', days: 365 },
] as const

const LiquidityChart: React.FC<LiquidityChartProps> = () => {
  const [activeTab, setActiveTab] = useState<typeof TABS[number]['id']>('yoy2025')
  const [history, setHistory] = useState<HistoricalDataPoint[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const activeDays = useMemo(() => TABS.find(t => t.id === activeTab)!.days, [activeTab])

  useEffect(() => {
    let mounted = true
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const points = await apiService.getHistoricalData(activeDays)
        if (mounted) setHistory(points)
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to load historical data'
        if (mounted) setError(msg)
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [activeDays])

  // Build chart rows and compute normalized liquidity for full-cycle view
  const chartData = useMemo(() => {
    if (!history.length) return []

    const arr = (sel: (p: HistoricalDataPoint) => number) => history.map(sel).filter(v => Number.isFinite(v))
    const mean = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0)
    const std = (xs: number[], m: number) => {
      if (!xs.length) return 1
      const v = xs.reduce((a, b) => a + (b - m) * (b - m), 0) / xs.length
      return Math.sqrt(v) || 1
    }

    const fedArr = arr(p => p.fed_yoy)
    const m2Arr = arr(p => p.m2_yoy)
    const manArr = arr(p => p.manufacturing_yoy)
    const btcArr = arr(p => p.btc_index || 0)
    const spxArr = arr(p => p.spx_index || 0)

    const fedM = mean(fedArr), fedS = std(fedArr, fedM)
    const m2M = mean(m2Arr), m2S = std(m2Arr, m2M)
    const manM = mean(manArr), manS = std(manArr, manM)
    const btcM = mean(btcArr), btcS = std(btcArr, btcM)
    const spxM = mean(spxArr), spxS = std(spxArr, spxM)

    const z = (v: number, m: number, s: number) => (Number.isFinite(v) ? (v - m) / s : 0)

    return history.map(p => ({
      date: new Date(p.date).toISOString().slice(0, 10),
      // raw YoY for CY tab
      fed: p.fed_yoy,
      m2: p.m2_yoy,
      manuf: p.manufacturing_yoy,
      // z-scores for Full Cycle
      fed_z: z(p.fed_yoy, fedM, fedS),
      m2_z: z(p.m2_yoy, m2M, m2S),
      manuf_z: z(p.manufacturing_yoy, manM, manS),
      btc_z: z(p.btc_index || 0, btcM, btcS),
      spx_z: z(p.spx_index || 0, spxM, spxS),
      // injections
      injections: p.tga_rrp_4wk_change,
      // overlays (raw for other tabs)
      btc: p.btc_index,
      spx: p.spx_index,
    }))
  }, [history])

  const renderLines = () => {
    if (activeTab === 'injections') {
      // Calculate data range for better reference lines
      const values = chartData.map(d => d.injections).filter(v => !isNaN(v as number)) as number[]
      const minVal = values.length ? Math.min(...values) : 0
      const maxVal = values.length ? Math.max(...values) : 0
      const range = maxVal - minVal
      const padding = Math.max(range * 0.1, 10) // 10% padding or at least $10B
      
      return (
        <>
          {/* Baseline and reference bands based on data range */}
          <ReferenceLine y={0} stroke="#6B7280" strokeDasharray="3 3" />
          <ReferenceLine y={Math.max(maxVal + padding, 50)} stroke="#22C55E" strokeDasharray="6 6" />
          <ReferenceLine y={Math.min(minVal - padding, -50)} stroke="#22C55E" strokeDasharray="6 6" />
          <Line type="monotone" dataKey="injections" name="TGA+RRP 4‑Week Change ($B)" stroke="#ff6b35" strokeWidth={2} dot={false} />
          {/* Overlays on right axis (percent from start) */}
          <Line yAxisId="right" type="monotone" dataKey="btc" name="BTC (% from start)" stroke="#ffffff" strokeWidth={1.5} dot={false} />
          <Line yAxisId="right" type="monotone" dataKey="spx" name="S&P 500 (% from start)" stroke="#a855f7" strokeWidth={1.5} dot={false} />
        </>
      )
    }

    if (activeTab === 'full') {
      // Single axis: All series as z-scores for Full Cycle
      return (
        <>
          {/* All series as z-scores on single axis */}
          <Line type="monotone" dataKey="fed_z" name="Fed YoY (z)" stroke="#00ff88" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="m2_z" name="M2 YoY (z)" stroke="#2196F3" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="manuf_z" name="Manufacturing YoY (z)" stroke="#ff6b35" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="btc_z" name="BTC (z)" stroke="#ffffff" strokeWidth={1.5} dot={false} />
          <Line type="monotone" dataKey="spx_z" name="S&P 500 (z)" stroke="#a855f7" strokeWidth={1.5} dot={false} />
        </>
      )
    }

    // Current Year: single axis (all %)
    return (
      <>
        <Line type="monotone" dataKey="fed" name="Fed Balance Sheet YoY" stroke="#00ff88" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="m2" name="M2 Money Supply YoY" stroke="#2196F3" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="manuf" name="Manufacturing YoY" stroke="#ff6b35" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="btc" name="BTC (% from start)" stroke="#ffffff" strokeWidth={1.5} dot={false} />
        <Line type="monotone" dataKey="spx" name="S&P 500 (% from start)" stroke="#a855f7" strokeWidth={1.5} dot={false} />
      </>
    )
  }

  const renderYAxes = () => {
    if (activeTab === 'injections') {
      return (
        <>
          <YAxis 
            stroke="#9CA3AF" 
            fontSize={12} 
            fontFamily="JetBrains Mono" 
            tickFormatter={(v) => `${(v as number).toFixed(1)}B`}
            domain={['dataMin - 10', 'dataMax + 10']}
          />
          <YAxis 
            yAxisId="right" orientation="right"
            stroke="#9CA3AF" fontSize={12} fontFamily="JetBrains Mono"
            tickFormatter={(v) => `${(v as number).toFixed(0)}%`}
          />
        </>
      )
    }

    if (activeTab === 'full') {
      return (
        <>
          {/* Single axis: All series as z-scores */}
          <YAxis 
            stroke="#9CA3AF" 
            fontSize={12} 
            fontFamily="JetBrains Mono" 
            domain={[-3, 3]}
            tickFormatter={(v) => `${(v as number).toFixed(1)}z`}
          />
        </>
      )
    }

    // Current year: single axis, auto domain in %
    return (
      <YAxis 
        stroke="#9CA3AF" 
        fontSize={12} 
        fontFamily="JetBrains Mono" 
        domain={['auto', 'auto']}
        tickFormatter={(v) => `${(v as number).toFixed(0)}%`}
      />
    )
  }

  return (
    <div className="tactical-panel">
      <div className="tactical-title mb-5">INTELLIGENCE ANALYSIS</div>
      <div className="font-jetbrains text-sm text-gray-400 mb-4">LIQUIDITY CONDITIONS OVER TIME • REAL DATA</div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-1 rounded border text-xs font-jetbrains ${activeTab === tab.id ? 'border-tactical-orange text-tactical-orange' : 'border-gray-700 text-gray-300 hover:text-white'}`}
            title={`${tab.days} days`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      
      <div className="h-96">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} fontFamily="JetBrains Mono" />
            {renderYAxes()}
            <Tooltip 
              contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #ff6b35', borderRadius: '8px', color: '#fff', fontFamily: 'JetBrains Mono' }}
              formatter={(value: number, name: string, props) => {
                const key = props?.dataKey as string
                if (activeTab === 'injections') {
                  if (key === 'btc' || key === 'spx') return [`${value.toFixed(1)}%`, name]
                  if (key === 'injections') return [`${value.toFixed(1)}B`, name]
                  return [`${value.toFixed(1)}`, name]
                }
                if (activeTab === 'full') {
                  if (key === 'fed_z' || key === 'm2_z' || key === 'manuf_z' || key === 'btc_z' || key === 'spx_z') return [`${value.toFixed(2)}z`, name]
                  return [`${value.toFixed(1)}%`, name]
                }
                return [`${value.toFixed(1)}%`, name]
              }}
              labelFormatter={(label: string) => label}
            />
            <Legend wrapperStyle={{ fontFamily: 'JetBrains Mono', fontSize: '12px', color: '#fff' }} />
            {renderLines()}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {loading && <div className="text-xs text-gray-400 mt-2 font-jetbrains">Loading historical data…</div>}
      {error && <div className="text-xs text-red-400 mt-2 font-jetbrains">{error}</div>}
      
      <div className="text-center mt-4 p-3 bg-tactical-orange/10 border border-tactical-orange/30 rounded">
        <p className="text-tactical-orange text-xs font-jetbrains">
          INTERACTIVE CHART • HOVER FOR DETAILS • CLICK LEGEND TO TOGGLE SERIES
        </p>
      </div>
    </div>
  )
}

export default LiquidityChart
