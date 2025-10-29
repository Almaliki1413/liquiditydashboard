import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { 
  Activity, 
  BarChart3, 
  Settings, 
  FileText, 
  Zap,
  TrendingUp,
  AlertTriangle
} from 'lucide-react'

const Sidebar: React.FC = () => {
  const location = useLocation()
  
  const menuItems = [
    { icon: Activity, label: 'COMMAND CENTER', path: '/', active: location.pathname === '/' },
    { icon: BarChart3, label: 'ANALYTICS', path: '/', active: false },
    { icon: TrendingUp, label: 'TRENDS', path: '/', active: false },
    { icon: AlertTriangle, label: 'ALERTS', path: '/', active: false },
    { icon: FileText, label: 'REPORTS', path: '/reports', active: location.pathname === '/reports' },
    { icon: Settings, label: 'SYSTEMS', path: '/', active: false },
  ]

  return (
    <aside className="w-64 bg-gradient-to-b from-tactical-darker to-tactical-darkest border-r-2 border-tactical-orange min-h-screen">
      {/* Logo Section */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center justify-center mb-4">
          <div className="w-12 h-12 bg-gradient-to-r from-tactical-orange to-orange-500 rounded-lg flex items-center justify-center">
            <Zap className="w-6 h-6 text-white" />
          </div>
        </div>
        <h2 className="font-orbitron text-tactical-orange text-lg font-bold text-center uppercase tracking-wider">
          COMMAND CENTER
        </h2>
        <p className="font-jetbrains text-xs text-gray-400 text-center mt-1">
          LIQUIDITY OPS
        </p>
      </div>

      {/* Navigation Menu */}
      <nav className="p-4">
        <ul className="space-y-2">
          {menuItems.map((item, index) => (
            <li key={index}>
              <Link
                to={item.path}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  item.active
                    ? 'bg-tactical-orange text-black font-semibold'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-jetbrains text-sm uppercase tracking-wider">
                  {item.label}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* System Status */}
      <div className="absolute bottom-6 left-6 right-6">
        <div className="tactical-panel p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="status-dot"></div>
            <span className="font-jetbrains text-xs text-tactical-green">SYSTEM ONLINE</span>
          </div>
          
          <div className="space-y-2 font-jetbrains text-xs text-gray-400">
            <div className="flex justify-between">
              <span>UPTIME:</span>
              <span className="text-white">72:14:33</span>
            </div>
            <div className="flex justify-between">
              <span>AGENTS:</span>
              <span className="text-white">847 ACTIVE</span>
            </div>
            <div className="flex justify-between">
              <span>MISSIONS:</span>
              <span className="text-white">23 ONGOING</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
