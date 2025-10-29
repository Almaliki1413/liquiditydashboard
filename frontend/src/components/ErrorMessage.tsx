import React from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface ErrorMessageProps {
  message: string
  onRetry?: () => void
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, onRetry }) => {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <AlertTriangle className="w-16 h-16 text-tactical-red mx-auto mb-4" />
        <div className="font-orbitron text-tactical-red text-xl font-bold mb-2">
          SYSTEM ERROR
        </div>
        <div className="font-jetbrains text-gray-400 text-sm mb-4 max-w-md">
          {message}
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            className="tactical-button flex items-center gap-2 mx-auto"
          >
            <RefreshCw className="w-4 h-4" />
            RETRY CONNECTION
          </button>
        )}
      </div>
    </div>
  )
}

export default ErrorMessage
