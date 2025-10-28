import React from 'react'
import { Zap, AlertTriangle, RotateCcw } from 'lucide-react'

interface SignalStatusProps {
  signal: 'RISK-ON' | 'TIGHT' | 'NEUTRAL'
  message: string
  description: string
}

const SignalStatus: React.FC<SignalStatusProps> = ({ signal, message, description }) => {
  const getSignalConfig = () => {
    switch (signal) {
      case 'RISK-ON':
        return {
          icon: Zap,
          className: 'signal-status signal-risk-on',
          iconColor: 'text-black'
        }
      case 'TIGHT':
        return {
          icon: AlertTriangle,
          className: 'signal-status signal-tight',
          iconColor: 'text-white'
        }
      default:
        return {
          icon: RotateCcw,
          className: 'signal-status signal-neutral',
          iconColor: 'text-white'
        }
    }
  }

  const config = getSignalConfig()
  const Icon = config.icon

  return (
    <div className="tactical-panel">
      <div className="tactical-title mb-5">MISSION STATUS</div>
      <div className="text-center">
        <div className={config.className}>
          <div className="flex items-center justify-center gap-3 mb-3">
            <Icon className={`w-8 h-8 ${config.iconColor}`} />
            <div className="text-2xl font-bold">{message}</div>
          </div>
          <div className="text-base opacity-90">{description}</div>
        </div>
      </div>
    </div>
  )
}

export default SignalStatus
