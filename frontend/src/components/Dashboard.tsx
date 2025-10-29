import React from 'react'
import { LiquidityData } from '../types'
import SignalStatus from './SignalStatus'
import MetricsGrid from './MetricsGrid'
import LiquidityChart from './LiquidityChart'
import DataTable from './DataTable'
import LoadingSpinner from './LoadingSpinner'
import ErrorMessage from './ErrorMessage'

interface DashboardProps {
  data: LiquidityData | null
  loading: boolean
  error: string | null
}

const Dashboard: React.FC<DashboardProps> = ({ data, loading, error }) => {
  if (loading) {
    return <LoadingSpinner />
  }

  if (error) {
    return <ErrorMessage message={error} />
  }

  if (!data) {
    return <ErrorMessage message="No data available" />
  }

  return (
    <div className="space-y-6">
      {/* Mission Status */}
      <SignalStatus signal={data.signal} message={data.signal_status.message} description={data.signal_status.description} />
      
      {/* Operational Metrics */}
      <MetricsGrid data={data} />
      
      {/* Intelligence Analysis Chart */}
      <LiquidityChart data={data} />
      
      {/* Mission Log */}
      <DataTable data={data} />
    </div>
  )
}

export default Dashboard
