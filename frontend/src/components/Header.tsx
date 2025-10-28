import React from 'react'
import { Activity, Wifi, WifiOff } from 'lucide-react'

interface HeaderProps {
  isConnected: boolean
}

const Header: React.FC<HeaderProps> = ({ isConnected }) => {
  const currentTime = new Date().toLocaleString('en-GB', {
    timeZone: 'UTC',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  })

  return (
    <header className="bg-gradient-to-r from-tactical-darker to-tactical-darkest border-b-2 border-tactical-orange px-8 py-4 shadow-lg">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="tactical-title text-3xl">
            LIQUIDITY COMMAND
          </h1>
          <p className="font-jetbrains text-sm text-gray-400 mt-1">
            v2.1.7 CLASSIFIED
          </p>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            {isConnected ? (
              <>
                <Wifi className="w-4 h-4 text-tactical-green" />
                <span className="font-jetbrains text-sm text-tactical-green">SYSTEM ONLINE</span>
              </>
            ) : (
              <>
                <WifiOff className="w-4 h-4 text-tactical-red" />
                <span className="font-jetbrains text-sm text-tactical-red">CONNECTION LOST</span>
              </>
            )}
          </div>
          
          <div className="font-jetbrains text-sm text-gray-400">
            LAST UPDATE: {currentTime} UTC
          </div>
        </div>
      </div>
      
      <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-700">
        <div className="font-orbitron text-tactical-orange text-sm">
          COMMAND CENTER / <span className="text-white">OVERVIEW</span>
        </div>
        
        <div className="flex items-center gap-6 font-jetbrains text-xs text-gray-400">
          <div>UPTIME: 72:14:33</div>
          <div>DATA POINTS: 1,247</div>
          <div>SIGNALS: 3 ACTIVE</div>
        </div>
      </div>
    </header>
  )
}

export default Header
