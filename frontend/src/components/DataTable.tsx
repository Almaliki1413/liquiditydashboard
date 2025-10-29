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

    return dates.map((date, index) => {
      const fed_yoy = parseFloat((data.fed_yoy + (Math.random() - 0.5) * 10).toFixed(1))
      const m2_yoy = parseFloat((data.m2_yoy + (Math.random() - 0.5) * 5).toFixed(1))
      const manufacturing_yoy = parseFloat((data.manufacturing_yoy + (Math.random() - 0.5) * 8).toFixed(1))
      const tga_rrp_change = parseFloat((data.tga_rrp_4wk_change + (Math.random() - 0.5) * 50).toFixed(0))

      const riskOn = fed_yoy > 0 && m2_yoy > 0 && manufacturing_yoy >= 0 && tga_rrp_change < 0
      const tight = fed_yoy < -3 && manufacturing_yoy <= -3
      const status = index === 0 ? data.signal : (riskOn ? 'RISK-ON' : (tight ? 'TIGHT' : 'NEUTRAL'))

      let rationale = ''
      if (status === 'RISK-ON') {
        rationale = 'Fed expanding, M2 growing, manufacturing stable, and net drain negative (injections)'
      } else if (status === 'TIGHT') {
        rationale = 'Fed contracting and manufacturing weak; conditions restrictive'
      } else {
        rationale = 'Mixed signals: neither sustained injections nor broad contraction'
      }

      return { date, fed_yoy, m2_yoy, manufacturing_yoy, tga_rrp_change, status, rationale }
    })
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
              <th className="text-left py-3 px-4 font-jetbrains text-xs text-gray-400 uppercase tracking-wider">
                RATIONALE
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
                <td className="py-3 px-4 font-jetbrains text-xs text-gray-300 max-w-[420px]">
                  {row.rationale}
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
