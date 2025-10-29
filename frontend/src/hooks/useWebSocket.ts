import { useState, useEffect, useRef } from 'react'
import { LiquidityData } from '../types'
import toast from 'react-hot-toast'

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws'

export const useWebSocket = () => {
  const [isConnected, setIsConnected] = useState(false)
  const [data, setData] = useState<LiquidityData | null>(null)
  const ws = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<number | null>(null)

  const connect = () => {
    try {
      ws.current = new WebSocket(WS_URL)
      
      ws.current.onopen = () => {
        console.log('🔌 WebSocket connected')
        setIsConnected(true)
        toast.success('Real-time connection established')
        
        // Clear any existing reconnect timeout
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current)
          reconnectTimeoutRef.current = null
        }
      }
      
      ws.current.onmessage = (event) => {
        try {
          const newData = JSON.parse(event.data) as LiquidityData
          setData(newData)
          console.log('📊 Real-time data received:', newData)
        } catch (error) {
          console.error('❌ Error parsing WebSocket message:', error)
        }
      }
      
      ws.current.onclose = () => {
        console.log('🔌 WebSocket disconnected')
        setIsConnected(false)
        
        // Attempt to reconnect after 5 seconds
        if (!reconnectTimeoutRef.current) {
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log('🔄 Attempting to reconnect...')
            connect()
          }, 5000)
        }
      }
      
      ws.current.onerror = (error) => {
        console.error('❌ WebSocket error:', error)
        toast.error('Connection error - attempting to reconnect')
      }
    } catch (error) {
      console.error('❌ Failed to create WebSocket connection:', error)
    }
  }

  useEffect(() => {
    connect()
    
    return () => {
      if (ws.current) {
        ws.current.close()
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
    }
  }, [])

  return { isConnected, data }
}
