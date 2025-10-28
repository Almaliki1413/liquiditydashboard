import { useState, useEffect } from 'react'
import { LiquidityData } from '../types'
import { apiService } from '../services/api'
import toast from 'react-hot-toast'

export const useLiquidityData = () => {
  const [data, setData] = useState<LiquidityData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await apiService.getLiquidityData()
      setData(result)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch liquidity data'
      setError(errorMessage)
      toast.error(`Failed to load data: ${errorMessage}`)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    
    // Refresh data every 5 minutes
    const interval = setInterval(fetchData, 5 * 60 * 1000)
    
    return () => clearInterval(interval)
  }, [])

  return { data, loading, error, refetch: fetchData }
}
