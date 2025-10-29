import React from 'react'
import { LiquidityData } from '../types'
import { TrendingUp, DollarSign, AlertTriangle, CheckCircle, XCircle } from 'lucide-react'

interface ReportsProps {
  data: LiquidityData
}

const Reports: React.FC<ReportsProps> = ({ data }) => {
  // Calculate leadership indicators
  const m2LeadingFed = data.m2_yoy > data.fed_yoy
  const m2Direction = data.m2_yoy > 0 ? 'expanding' : 'contracting'
  const fedDirection = data.fed_yoy > 0 ? 'expanding' : 'contracting'

  // Determine signal phase based on Raoul Pal's methodology
  const getSignalPhase = () => {
    if (data.m2_yoy > 6 && data.fed_yoy > 0 && data.manufacturing_yoy >= 0 && data.tga_rrp_4wk_change < 0) {
      return { 
        phase: 'PHASE 3', 
        description: 'FULL RISK-ON',
        color: 'text-tactical-green',
        bgColor: 'bg-tactical-green/10',
        borderColor: 'border-tactical-green/30',
        icon: CheckCircle
      }
    } else if (data.m2_yoy > 0 && data.fed_yoy > 0 && data.manufacturing_yoy >= 0 && data.tga_rrp_4wk_change < 0) {
      return { 
        phase: 'EARLY RISK-ON', 
        description: 'M2 > 6% → PHASE 3',
        color: 'text-tactical-orange',
        bgColor: 'bg-tactical-orange/10',
        borderColor: 'border-tactical-orange/30',
        icon: TrendingUp
      }
    } else if (data.fed_yoy < -3 && data.manufacturing_yoy <= -3) {
      return { 
        phase: 'TIGHT LIQUIDITY', 
        description: 'RESTRICTIVE CONDITIONS',
        color: 'text-tactical-red',
        bgColor: 'bg-tactical-red/10',
        borderColor: 'border-tactical-red/30',
        icon: XCircle
      }
    } else {
      return { 
        phase: 'NEUTRAL', 
        description: 'MIXED SIGNALS',
        color: 'text-gray-400',
        bgColor: 'bg-gray-800/50',
        borderColor: 'border-gray-600',
        icon: AlertTriangle
      }
    }
  }

  const signalPhase = getSignalPhase()
  const PhaseIcon = signalPhase.icon

  // Generate analysis based on current values
  const generateAnalysis = () => {
    const analysis = []

    // M2 Analysis
    if (data.m2_yoy > 6) {
      analysis.push({
        title: "M2 MONEY SUPPLY: EXPANSIONARY PHASE",
        status: "POSITIVE",
        description: `M2 growth at ${data.m2_yoy.toFixed(1)}% indicates strong monetary expansion. This is the key driver for risk asset performance according to Raoul Pal's framework.`,
        implications: [
          "Risk assets (stocks, crypto) typically perform well during M2 expansion",
          "Liquidity conditions favor growth-oriented investments",
          "Watch for M2 growth > 6% as signal for Phase 3 (Full Risk-On)"
        ]
      })
    } else if (data.m2_yoy > 0) {
      analysis.push({
        title: "M2 MONEY SUPPLY: MODERATE EXPANSION",
        status: "CAUTIOUS",
        description: `M2 growth at ${data.m2_yoy.toFixed(1)}% shows moderate expansion. While positive, it hasn't reached the critical 6% threshold for full risk-on conditions.`,
        implications: [
          "Risk assets may see mixed performance",
          "Focus on quality assets with strong fundamentals",
          "Monitor for acceleration toward 6%+ growth"
        ]
      })
    } else {
      analysis.push({
        title: "M2 MONEY SUPPLY: CONTRACTION",
        status: "NEGATIVE",
        description: `M2 contraction at ${data.m2_yoy.toFixed(1)}% indicates tightening liquidity conditions. This typically leads to risk-off sentiment.`,
        implications: [
          "Risk assets face headwinds from liquidity constraints",
          "Defensive positioning recommended",
          "Cash and quality bonds may outperform"
        ]
      })
    }

    // Fed Balance Sheet Analysis
    if (data.fed_yoy > 0) {
      analysis.push({
        title: "FED BALANCE SHEET: EXPANSION",
        status: "POSITIVE",
        description: `Fed balance sheet growing at ${data.fed_yoy.toFixed(1)}% YoY. This provides additional liquidity support to markets.`,
        implications: [
          "Additional liquidity injection supports risk assets",
          "Reduces systemic risk and market stress",
          "Complements M2 growth for stronger risk-on signals"
        ]
      })
    } else {
      analysis.push({
        title: "FED BALANCE SHEET: CONTRACTION",
        status: "NEGATIVE",
        description: `Fed balance sheet contracting at ${data.fed_yoy.toFixed(1)}% YoY. This removes liquidity from the system.`,
        implications: [
          "Reduces overall system liquidity",
          "Increases market volatility and stress",
          "Counteracts positive M2 growth signals"
        ]
      })
    }

    // Manufacturing Analysis
    if (data.manufacturing_yoy >= 0) {
      analysis.push({
        title: "MANUFACTURING: GROWTH",
        status: "POSITIVE",
        description: `Manufacturing production growing at ${data.manufacturing_yoy.toFixed(1)}% YoY indicates economic strength.`,
        implications: [
          "Economic fundamentals support risk assets",
          "Corporate earnings likely to remain strong",
          "Confirms broader economic expansion"
        ]
      })
    } else {
      analysis.push({
        title: "MANUFACTURING: CONTRACTION",
        status: "NEGATIVE",
        description: `Manufacturing contracting at ${data.manufacturing_yoy.toFixed(1)}% YoY suggests economic weakness.`,
        implications: [
          "Economic headwinds for risk assets",
          "Corporate earnings may face pressure",
          "Defensive positioning more appropriate"
        ]
      })
    }

    // TGA+RRP Analysis
    if (data.tga_rrp_4wk_change < 0) {
      analysis.push({
        title: "TREASURY + RRP: LIQUIDITY INJECTION",
        status: "POSITIVE",
        description: `4-week change of $${data.tga_rrp_4wk_change.toFixed(0)}B indicates net liquidity injection into the system.`,
        implications: [
          "Direct liquidity support for risk assets",
          "Reduces funding stress in markets",
          "Supports the risk-on narrative"
        ]
      })
    } else {
      analysis.push({
        title: "TREASURY + RRP: LIQUIDITY DRAIN",
        status: "NEGATIVE",
        description: `4-week change of $${data.tga_rrp_4wk_change.toFixed(0)}B indicates net liquidity drain from the system.`,
        implications: [
          "Removes liquidity from risk assets",
          "Increases funding costs and market stress",
          "Counteracts positive liquidity signals"
        ]
      })
    }

    return analysis
  }

  const analysis = generateAnalysis()

  return (
    <div className="space-y-6">
      {/* Current Signal Status */}
      <div className="tactical-panel">
        <div className="tactical-title mb-5">CURRENT SIGNAL STATUS</div>
        <div className={`p-6 rounded-lg border ${signalPhase.bgColor} ${signalPhase.borderColor}`}>
          <div className="flex items-center gap-3 mb-4">
            <PhaseIcon className={`w-8 h-8 ${signalPhase.color}`} />
            <div>
              <div className={`font-jetbrains text-2xl font-bold ${signalPhase.color}`}>
                {signalPhase.phase}
              </div>
              <div className="font-jetbrains text-sm text-gray-400">
                {signalPhase.description}
              </div>
            </div>
          </div>
          <div className="font-jetbrains text-sm text-gray-300">
            Based on Raoul Pal's liquidity framework analysis of current market conditions.
          </div>
        </div>
      </div>

      {/* Leadership Analysis */}
      <div className="tactical-panel">
        <div className="tactical-title mb-5">LEADERSHIP ANALYSIS</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-gray-800/50 rounded border border-gray-600">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-5 h-5 text-tactical-blue" />
              <span className="font-jetbrains text-lg font-bold text-white">M2 vs FED</span>
            </div>
            <div className="font-jetbrains text-sm text-gray-300 mb-2">
              {m2LeadingFed ? 'M2 is leading Fed expansion' : 'Fed is leading M2 expansion'}
            </div>
            <div className="font-jetbrains text-xs text-gray-400">
              M2: {m2Direction} {Math.abs(data.m2_yoy).toFixed(1)}% | Fed: {fedDirection} {Math.abs(data.fed_yoy).toFixed(1)}%
            </div>
            <div className="mt-2 text-xs text-gray-500">
              {m2LeadingFed 
                ? "M2 leading suggests organic money creation driving liquidity"
                : "Fed leading suggests policy-driven liquidity expansion"
              }
            </div>
          </div>

          <div className="p-4 bg-gray-800/50 rounded border border-gray-600">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-tactical-orange" />
              <span className="font-jetbrains text-lg font-bold text-white">BTC vs SPX</span>
            </div>
            <div className="font-jetbrains text-sm text-gray-300 mb-2">
              BTC leading SPX (typical in risk-on phases)
            </div>
            <div className="font-jetbrains text-xs text-gray-400">
              BTC typically leads SPX by 3-6 months in liquidity cycles
            </div>
            <div className="mt-2 text-xs text-gray-500">
              BTC's higher beta makes it a leading indicator for risk appetite
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Analysis */}
      <div className="tactical-panel">
        <div className="tactical-title mb-5">DETAILED ANALYSIS</div>
        <div className="space-y-4">
          {analysis.map((item, index) => (
            <div key={index} className="p-4 bg-gray-800/30 rounded border border-gray-700">
              <div className="flex items-center gap-2 mb-2">
                <span className={`px-2 py-1 rounded text-xs font-jetbrains ${
                  item.status === 'POSITIVE' ? 'bg-tactical-green/20 text-tactical-green' :
                  item.status === 'NEGATIVE' ? 'bg-tactical-red/20 text-tactical-red' :
                  'bg-tactical-orange/20 text-tactical-orange'
                }`}>
                  {item.status}
                </span>
                <span className="font-jetbrains text-lg font-bold text-white">{item.title}</span>
              </div>
              <div className="font-jetbrains text-sm text-gray-300 mb-3">
                {item.description}
              </div>
              <div className="space-y-1">
                <div className="font-jetbrains text-xs text-gray-400 mb-1">IMPLICATIONS:</div>
                {item.implications.map((implication, i) => (
                  <div key={i} className="font-jetbrains text-xs text-gray-500 ml-2">
                    • {implication}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Raoul Pal Framework Summary */}
      <div className="tactical-panel">
        <div className="tactical-title mb-5">RAOUL PAL FRAMEWORK SUMMARY</div>
        <div className="space-y-4">
          <div className="p-4 bg-tactical-blue/10 border border-tactical-blue/30 rounded">
            <div className="font-jetbrains text-lg font-bold text-tactical-blue mb-2">LIQUIDITY CYCLE PHASES</div>
            <div className="space-y-2 text-sm">
              <div className="font-jetbrains text-gray-300">
                <span className="text-tactical-green">Phase 1:</span> M2 &gt; 0%, Fed expanding, Manufacturing growing
              </div>
              <div className="font-jetbrains text-gray-300">
                <span className="text-tactical-orange">Phase 2:</span> M2 &gt; 3%, all conditions met, early risk-on
              </div>
              <div className="font-jetbrains text-gray-300">
                <span className="text-tactical-green">Phase 3:</span> M2 &gt; 6%, full risk-on conditions
              </div>
              <div className="font-jetbrains text-gray-300">
                <span className="text-tactical-red">Tight:</span> Fed &lt; -3%, Manufacturing &lt; -3%
              </div>
            </div>
          </div>

          <div className="p-4 bg-tactical-orange/10 border border-tactical-orange/30 rounded">
            <div className="font-jetbrains text-lg font-bold text-tactical-orange mb-2">KEY INDICATORS</div>
            <div className="space-y-2 text-sm">
              <div className="font-jetbrains text-gray-300">
                <span className="text-tactical-blue">M2 Money Supply:</span> Primary driver of risk asset performance
              </div>
              <div className="font-jetbrains text-gray-300">
                <span className="text-tactical-green">Fed Balance Sheet:</span> Secondary liquidity support
              </div>
              <div className="font-jetbrains text-gray-300">
                <span className="text-tactical-orange">Manufacturing:</span> Economic confirmation signal
              </div>
              <div className="font-jetbrains text-gray-300">
                <span className="text-tactical-purple">TGA+RRP:</span> Direct liquidity injection/drain
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Reports
