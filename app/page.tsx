'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

interface Incident {
  id: string
  title: string
  slug: string
  protocol_name: string
  protocol_logo_url?: string
  chain: string
  loss_usd: number
  attack_vector: string
  date_of_hack: string
  impact_level: string
  created_at: string
}

export default function HomePage() {
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchIncidents()
  }, [])

  async function fetchIncidents() {
    setLoading(true)
    const { data, error } = await supabase
      .from('incidents')
      .select('*')
      .order('date_of_hack', { ascending: false })

    if (!error && data) {
      setIncidents(data)
    }
    setLoading(false)
  }

  // Calculate Overall Metrics
  const totalLoss = useMemo(() => {
    return incidents.reduce((sum, item) => sum + (Number(item.loss_usd) || 0), 0)
  }, [incidents])

  // Calculate 7-Day Weekly Metrics
  const weeklyMetrics = useMemo(() => {
    const now = new Date()
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    const recent = incidents.filter(item => {
      if (!item.date_of_hack) return false
      const incidentDate = new Date(item.date_of_hack)
      return incidentDate >= sevenDaysAgo
    })

    const weeklyLoss = recent.reduce((sum, item) => sum + (Number(item.loss_usd) || 0), 0)
    return {
      count: recent.length,
      loss: weeklyLoss
    }
  }, [incidents])

  // Filtered List for Deep-Dive Grid
  const filteredIncidents = useMemo(() => {
    return incidents.filter(item => {
      return (
        item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.protocol_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.attack_vector?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.chain?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    })
  }, [incidents, searchQuery])

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(val)
  }

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-amber-500 selection:text-black">
      
      {/* Top Navigation */}
      <header className="border-b border-neutral-900 bg-neutral-950/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-amber-500 animate-pulse" />
            <span className="font-black tracking-wider text-sm text-white uppercase">
              DeFi Threat Intelligence <span className="text-amber-500">Feed</span>
            </span>
          </div>

          <div className="flex items-center gap-6 text-xs font-semibold text-neutral-400">
            <a href="#ledger" className="hover:text-amber-400 transition-colors">Daily Ledger</a>
            <a href="#reports" className="hover:text-amber-400 transition-colors">Deep-Dives</a>
            <a href="#about" className="hover:text-amber-400 transition-colors">Methodology</a>
            <span className="px-2.5 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-full font-mono text-[10px]">
              LIVE TELEMETRY
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10 space-y-16">

        {/* Hero & Platform Context Section */}
        <section id="about" className="space-y-6">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-full text-amber-400 text-xs font-mono font-bold">
              <span>SECURITY RESEARCH & INCIDENT RESPONSE</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white leading-tight">
              Real-time Decentralized Finance Threat Intelligence & Post-Mortem Hub
            </h1>
            <p className="text-neutral-400 text-base leading-relaxed">
              We monitor, deconstruct, and analyze active exploits, Smart Contract vulnerabilities, and cross-chain bridge compromises across web3 ecosystems. Our objective is to standardise exploit root-cause analysis, provide immediate actionable telemetry to security teams, and publish actionable defensive controls.
            </p>
          </div>

          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4">
            <div className="p-5 bg-neutral-950 border border-neutral-900 rounded-xl space-y-1">
              <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Total Value Tracked (Lost)</span>
              <p className="text-2xl font-black text-amber-400 font-mono">{formatCurrency(totalLoss)}</p>
            </div>
            <div className="p-5 bg-neutral-950 border border-neutral-900 rounded-xl space-y-1">
              <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Published Technical Breakdown</span>
              <p className="text-2xl font-black text-white font-mono">{incidents.length}</p>
            </div>
            <div className="p-5 bg-neutral-950 border border-neutral-900 rounded-xl space-y-1">
              <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">7-Day Exploit Volume</span>
              <p className="text-2xl font-black text-red-400 font-mono">{formatCurrency(weeklyMetrics.loss)}</p>
            </div>
            <div className="p-5 bg-neutral-950 border border-neutral-900 rounded-xl space-y-1">
              <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Network Telemetry</span>
              <div className="flex items-center gap-2 pt-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-sm font-bold text-emerald-400">Monitoring Active</span>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Grid: What We Do */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-neutral-950/60 border border-neutral-900 rounded-xl space-y-2">
            <div className="text-amber-500 text-lg">⚡</div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Daily Exploit Telemetry</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Instant logging of confirmed hacks and loss estimations within 24 hours of occurrence.
            </p>
          </div>
          <div className="p-6 bg-neutral-950/60 border border-neutral-900 rounded-xl space-y-2">
            <div className="text-amber-500 text-lg">🔬</div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Root-Cause Analysis</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Deep opcode and logic verification covering oracle manipulation, access control flaws, reentrancy, and private key compromises.
            </p>
          </div>
          <div className="p-6 bg-neutral-950/60 border border-neutral-900 rounded-xl space-y-2">
            <div className="text-amber-500 text-lg">🛡️</div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Defensive Recommendations</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Actionable remediation protocols for developers, security researchers, and liquidity providers to mitigate cascading collateral risk.
            </p>
          </div>
        </section>

        {/* Tabular Section: Daily & Weekly Exploit Ledger */}
        <section id="ledger" className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-900 pb-4">
            <div>
              <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                <span>📋</span> Daily Incident Ledger & Weekly Aggregates
              </h2>
              <p className="text-xs text-neutral-400 mt-1">
                Fast 24-hour telemetry feed of confirmed incidents. Technical analysis reports follow post-verification.
              </p>
            </div>

            {/* Weekly Summary Banner */}
            <div className="flex items-center gap-4 bg-amber-500/10 border border-amber-500/20 px-4 py-2 rounded-lg text-xs font-mono">
              <div>
                <span className="text-neutral-400">7-Day Incidents: </span>
                <span className="text-amber-400 font-bold">{weeklyMetrics.count}</span>
              </div>
              <div className="w-px h-4 bg-amber-500/30" />
              <div>
                <span className="text-neutral-400">7-Day Stolen: </span>
                <span className="text-red-400 font-bold">{formatCurrency(weeklyMetrics.loss)}</span>
              </div>
            </div>
          </div>

          {/* Table Container */}
          <div className="border border-neutral-900 rounded-xl bg-neutral-950/80 overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-neutral-900/60 border-b border-neutral-900 font-mono text-[11px] text-amber-500 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Protocol</th>
                  <th className="py-3 px-4 text-right">Confirmed Loss</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-900 text-neutral-300">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-neutral-500 font-mono">
                      Loading incident ledger...
                    </td>
                  </tr>
                ) : incidents.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-neutral-500">
                      No security incidents logged yet.
                    </td>
                  </tr>
                ) : (
                  incidents.map((item) => (
                    <tr key={item.id} className="hover:bg-neutral-900/40 transition-colors">
                      <td className="py-3.5 px-4 font-mono text-neutral-400">
                        {item.date_of_hack || 'Recent'}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-white flex items-center gap-2">
                        {item.protocol_logo_url && (
                          <img src={item.protocol_logo_url} alt="" className="w-4 h-4 rounded-full object-cover" />
                        )}
                        <span>{item.protocol_name || item.title}</span>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-amber-400 text-right">
                        {formatCurrency(Number(item.loss_usd) || 0)}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <Link 
                          href={`/incidents/${item.slug}`}
                          className="inline-block px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded text-[11px] font-bold transition-all"
                        >
                          View Report
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Search & Comprehensive Intelligence Reports Section */}
        <section id="reports" className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-900 pb-4">
            <div>
              <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                <span>🔍</span> Detailed Technical Threat Reports
              </h2>
              <p className="text-xs text-neutral-400 mt-1">
                Full root-cause breakdowns, attack diagrams, dynamic steps, and defensive controls.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="text"
                placeholder="Search protocol or report..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 px-3 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-white placeholder:text-neutral-600 focus:border-amber-500 outline-none w-64"
              />
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredIncidents.map((incident) => (
              <div 
                key={incident.id} 
                className="bg-neutral-950 border border-neutral-900 hover:border-amber-500/40 rounded-xl p-6 transition-all space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[10px] font-bold rounded uppercase">
                      {incident.protocol_name || 'Protocol Alert'}
                    </span>
                    <span className="px-2.5 py-1 bg-neutral-900 text-neutral-400 border border-neutral-800 text-[10px] font-mono rounded uppercase">
                      {incident.chain || 'Cross-Chain'}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white leading-snug">
                    {incident.title}
                  </h3>

                  <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-neutral-900">
                    <div>
                      <span className="text-neutral-500 block text-[10px] uppercase font-bold">Attack Vector</span>
                      <span className="text-neutral-300 font-medium">{incident.attack_vector || 'Pending Full Report'}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-neutral-500 block text-[10px] uppercase font-bold">Confirmed Loss</span>
                      <span className="text-amber-400 font-mono font-bold text-sm">
                        {formatCurrency(Number(incident.loss_usd) || 0)}
                      </span>
                    </div>
                  </div>
                </div>

                <Link
                  href={`/incidents/${incident.slug}`}
                  className="w-full text-center py-2.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-amber-400 text-xs font-bold rounded-lg transition-all block tracking-wide"
                >
                  VIEW FULL ANALYSIS & DIAGRAM →
                </Link>
              </div>
            ))}
          </div>
        </section>

      </main>

      {/* Standardized Platform Footer */}
      <footer className="border-t border-neutral-900 bg-neutral-950 mt-20 text-xs text-neutral-500">
        <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
          
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span className="font-extrabold text-white text-sm tracking-wider uppercase">
                DeFi Threat Intelligence Feed
              </span>
            </div>
            <p className="text-neutral-400 text-xs leading-relaxed max-w-md">
              An open security initiative providing real-time exploit telemetry, post-mortems, and standardized vulnerability taxonomies for decentralized protocols.
            </p>
            <p className="text-[11px] text-neutral-600">
              © 2026 DeFi Threat Intelligence Feed. All rights reserved.
            </p>
          </div>

          <div className="space-y-2">
            <span className="text-white font-bold text-xs uppercase tracking-wider block mb-1">Navigation</span>
            <ul className="space-y-1.5 font-medium">
              <li><a href="#ledger" className="hover:text-amber-400 transition-colors">Daily Exploit Ledger</a></li>
              <li><a href="#reports" className="hover:text-amber-400 transition-colors">Technical Reports</a></li>
              <li><a href="#about" className="hover:text-amber-400 transition-colors">Methodology & Taxonomy</a></li>
            </ul>
          </div>

          <div className="space-y-2">
            <span className="text-white font-bold text-xs uppercase tracking-wider block mb-1">Disclaimers</span>
            <p className="text-[11px] text-neutral-500 leading-relaxed">
              Information provided is based on public on-chain telemetry and security research. Loss estimations are subject to post-incident verification.
            </p>
          </div>

        </div>
      </footer>

    </div>
  )
}