import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import Dashboard from './components/Dashboard'
import Reports from './components/Reports'
import { useWebSocket } from './hooks/useWebSocket'
import { useLiquidityData } from './hooks/useLiquidityData'

function App() {
  const { data, loading, error } = useLiquidityData()
  const { isConnected } = useWebSocket()

  return (
    <Router>
      <div className="min-h-screen bg-tactical-dark">
        <Toaster 
          position="top-right"
          toastOptions={{
            style: {
              background: '#1a1a1a',
              color: '#fff',
              border: '1px solid #ff6b35',
            },
          }}
        />
        
        {/* Header */}
        <Header isConnected={isConnected} />
        
        <div className="flex">
          {/* Sidebar */}
          <Sidebar />
          
          {/* Main Content */}
          <main className="flex-1 p-6">
            <Routes>
              <Route path="/" element={<Dashboard data={data} loading={loading} error={error} />} />
              <Route path="/reports" element={data ? <Reports data={data} /> : <div>Loading...</div>} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  )
}

export default App
