import React from 'react'
import { LiquidityData } from '../types'

interface DataTableProps {
  data: LiquidityData
}

const DataTable: React.FC<DataTableProps> = ({ data }) => {
  // Generate sample historical data for the table
  const generateTableData = () => {
    const dates = []
    const today = new Date()
    for (let i = 9; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      dates.push(date.toLocaleDateString('en-GB'))
    }

    return dates.map((date, index) => ({
      date,
      fed_yoy: (data.fed_yoy + (Math.random() - 0.5) * 10).toFixed(1),
      m2_yoy: (data.m2_yoy + (Math.random() - 0.5) * 5).toFixed(1),
      manufacturing_yoy: (data.manufacturing_yoy + (Math.random() - 0.5) * 8).toFixed(1),
      tga_rrp_change: (data.tga_rrp_4wk_change + (Math.random() - 0.5) * 50).toFixed(0),
      status: index === 0 ? data.signal : ['RISK-ON', 'TIGHT', 'NEUTRAL'][Math.floor(Math.random() * 3)]
    }))
  }

  const tableData = generateTableData()

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'RISK-ON':
        return 'bg-tactical-green text-black font-bold font-jetbrains'
      case 'TIGHT':
        return 'bg-tactical-red text-white font-bold font-jetbrains'
      default:
        return 'bg-tactical-orange text-white font-bold font-jetbrains'
    }
  }

  return (
    <div className="tactical-panel">
      <div className="tactical-title mb-5">MISSION LOG</div>
      <div className="font-jetbrains text-sm text-gray-400 mb-5">
        RECENT DATA POINTS • CLASSIFIED INFORMATION
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="text-left py-3 px-4 font-jetbrains text-xs text-gray-400 uppercase tracking-wider">
                DATE
              </th>
              <th className="text-left py-3 px-4 font-jetbrains text-xs text-gray-400 uppercase tracking-wider">
                FED BALANCE SHEET YOY %
              </th>
              <th className="text-left py-3 px-4 font-jetbrains text-xs text-gray-400 uppercase tracking-wider">
                M2 MONEY SUPPLY YOY %
              </th>
              <th className="text-left py-3 px-4 font-jetbrains text-xs text-gray-400 uppercase tracking-wider">
                MANUFACTURING YOY %
              </th>
              <th className="text-left py-3 px-4 font-jetbrains text-xs text-gray-400 uppercase tracking-wider">
                TGA+RRP 4WK CHANGE ($B)
              </th>
              <th className="text-left py-3 px-4 font-jetbrains text-xs text-gray-400 uppercase tracking-wider">
                STATUS
              </th>
            </tr>
          </thead>
          <tbody>
            {tableData.map((row, index) => (
              <tr key={index} className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors">
                <td className="py-3 px-4 font-jetbrains text-sm text-gray-300">
                  {row.date}
                </td>
                <td className="py-3 px-4 font-jetbrains text-sm text-white">
                  {row.fed_yoy}%
                </td>
                <td className="py-3 px-4 font-jetbrains text-sm text-white">
                  {row.m2_yoy}%
                </td>
                <td className="py-3 px-4 font-jetbrains text-sm text-white">
                  {row.manufacturing_yoy}%
                </td>
                <td className="py-3 px-4 font-jetbrains text-sm text-white">
                  ${row.tga_rrp_change}B
                </td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 rounded text-xs ${getStatusStyle(row.status)}`}>
                    {row.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default DataTable
