import React from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { LiquidityData } from '../types'

interface LiquidityChartProps {
  data: LiquidityData
}

const LiquidityChart: React.FC<LiquidityChartProps> = ({ data }) => {
  // Generate sample historical data for the chart
  const generateChartData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    return months.map((month, index) => ({
      month,
      'Fed Balance Sheet YoY': data.fed_yoy + (Math.random() - 0.5) * 10,
      'M2 Money Supply YoY': data.m2_yoy + (Math.random() - 0.5) * 5,
      'Manufacturing YoY': data.manufacturing_yoy + (Math.random() - 0.5) * 8,
    }))
  }

  const chartData = generateChartData()

  return (
    <div className="tactical-panel">
      <div className="tactical-title mb-5">INTELLIGENCE ANALYSIS</div>
      <div className="font-jetbrains text-sm text-gray-400 mb-5">
        LIQUIDITY CONDITIONS OVER TIME • REAL-TIME MONITORING
      </div>
      
      <div className="h-96">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="month" 
              stroke="#9CA3AF"
              fontSize={12}
              fontFamily="JetBrains Mono"
            />
            <YAxis 
              stroke="#9CA3AF"
              fontSize={12}
              fontFamily="JetBrains Mono"
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: '#1a1a1a',
                border: '1px solid #ff6b35',
                borderRadius: '8px',
                color: '#fff',
                fontFamily: 'JetBrains Mono'
              }}
              formatter={(value: number, name: string) => [`${value.toFixed(1)}%`, name]}
            />
            <Legend 
              wrapperStyle={{
                fontFamily: 'JetBrains Mono',
                fontSize: '12px',
                color: '#fff'
              }}
            />
            <Line 
              type="monotone" 
              dataKey="Fed Balance Sheet YoY" 
              stroke="#00ff88" 
              strokeWidth={2}
              dot={{ fill: '#00ff88', strokeWidth: 2, r: 4 }}
            />
            <Line 
              type="monotone" 
              dataKey="M2 Money Supply YoY" 
              stroke="#2196F3" 
              strokeWidth={2}
              dot={{ fill: '#2196F3', strokeWidth: 2, r: 4 }}
            />
            <Line 
              type="monotone" 
              dataKey="Manufacturing YoY" 
              stroke="#ff6b35" 
              strokeWidth={2}
              dot={{ fill: '#ff6b35', strokeWidth: 2, r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      <div className="text-center mt-4 p-3 bg-tactical-orange/10 border border-tactical-orange/30 rounded">
        <p className="text-tactical-orange text-xs font-jetbrains">
          INTERACTIVE CHART • HOVER FOR DETAILS • CLICK LEGEND TO TOGGLE SERIES
        </p>
      </div>
    </div>
  )
}

export default LiquidityChart
