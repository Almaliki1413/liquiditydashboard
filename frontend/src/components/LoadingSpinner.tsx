import React from 'react'
import { Loader2 } from 'lucide-react'

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <Loader2 className="w-12 h-12 text-tactical-orange animate-spin mx-auto mb-4" />
        <div className="font-orbitron text-tactical-orange text-xl font-bold mb-2">
          INITIALIZING SYSTEM
        </div>
        <div className="font-jetbrains text-gray-400 text-sm">
          Loading liquidity data...
        </div>
      </div>
    </div>
  )
}

export default LoadingSpinner
