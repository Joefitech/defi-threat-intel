'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface Incident {
  id: string
  title: string
  slug: string
  protocol_name: string
  chain: string
  loss_usd: number
  attack_vector: string
  created_at: string
}

export default function HomePage() {
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchIncidents()
  }, [])

  const fetchIncidents = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('incidents')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false })

    if (!error && data) {
      setIncidents(data)
    }
    setLoading(false)
  }

  const filteredIncidents = incidents.filter((incident) => {
    const query = searchQuery.toLowerCase()
    return (
      incident.title.toLowerCase().includes(query) ||
      incident.protocol_name.toLowerCase().includes(query) ||
      incident.attack_vector.toLowerCase().includes(query) ||
      incident.chain.toLowerCase().includes(query)
    )
  })

  const totalLoss = incidents.reduce((acc, curr) => acc + (curr.loss_usd || 0), 0)
  const totalIncidents = incidents.length

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-10 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header / Navigation */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-amber-500/20 pb-6">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
              <span className="w-3 h-3 bg-amber-500 rounded-full animate-pulse shadow-[0_0_10px_#f59e0b]"></span>
              DeFi Threat Intelligence Feed
            </h1>
            <p className="text-sm text-neutral-400 mt-1">
              Real-time repository of decentralized finance security exploits, post-mortems, and attack vectors.
            </p>
          </div>
          <Link 
            href="/admin/dashboard" 
            className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-black text-xs font-black uppercase tracking-wider rounded-md transition-all shadow-[0_0_15px_rgba(245,158,11,0.2)]"
          >
            + Publish Incident
          </Link>
        </div>

        {/* Macro Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <Card className="bg-neutral-950 border-amber-500/30 text-white shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold text-amber-500/80 uppercase tracking-wider">
                Total Value Tracked (Lost)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-black text-amber-400">
                ${totalLoss.toLocaleString()}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-neutral-950 border-amber-500/30 text-white shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold text-amber-500/80 uppercase tracking-wider">
                Published Reports
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-black text-white">
                {totalIncidents}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-neutral-950 border-amber-500/30 text-white shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold text-amber-500/80 uppercase tracking-wider">
                Network Status
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-2">
              <span className="inline-block w-2.5 h-2.5 bg-amber-400 rounded-full shadow-[0_0_8px_#f59e0b]"></span>
              <p className="text-lg font-bold text-amber-400">Active Live Feed</p>
            </CardContent>
          </Card>
        </div>

        {/* Search Bar */}
        <div className="space-y-2">
          <input 
            type="text"
            placeholder="Search by protocol, title, vector, or network..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ color: '#ffffff', backgroundColor: '#050505', borderColor: 'rgba(245, 158, 11, 0.3)' }}
            className="w-full h-12 px-4 text-sm rounded-lg border focus:outline-none focus:ring-2 focus:ring-amber-500 placeholder:text-neutral-500 font-medium"
          />
        </div>

        {/* Incident Grid Feed */}
        {loading ? (
          <div className="text-center py-20 text-amber-400/80 font-semibold tracking-wide animate-pulse">
            Syncing threat intelligence feed...
          </div>
        ) : filteredIncidents.length === 0 ? (
          <div className="text-center py-16 text-neutral-500 border border-dashed border-amber-500/20 rounded-xl bg-neutral-950/50">
            No published threat breakdowns match your search query.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredIncidents.map((incident) => (
              <Card key={incident.id} className="bg-neutral-950 border-amber-500/20 text-white hover:border-amber-500/50 transition-all flex flex-col justify-between shadow-xl">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <span className="px-2.5 py-1 bg-amber-500/10 text-amber-400 text-xs font-bold rounded-md border border-amber-500/30 uppercase tracking-wider">
                      {incident.protocol_name}
                    </span>
                    <span className="px-2.5 py-1 bg-neutral-900 text-neutral-300 text-xs font-semibold rounded-md border border-neutral-800 uppercase">
                      {incident.chain}
                    </span>
                  </div>
                  <CardTitle className="text-lg font-bold text-white">
                    {incident.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2 border-t border-b border-neutral-900 py-3 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-neutral-400 font-medium">Attack Vector:</span>
                      <span className="font-semibold text-neutral-200">{incident.attack_vector}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-neutral-400 font-medium">Confirmed Loss:</span>
                      <span className="font-extrabold text-amber-400">${Number(incident.loss_usd).toLocaleString()}</span>
                    </div>
                  </div>
                  <Link 
                    href={`/incidents/${incident.slug}`}
                    className="block w-full text-center py-2.5 bg-black hover:bg-neutral-900 text-amber-400 hover:text-amber-300 text-xs font-bold uppercase tracking-wider rounded-md transition-all border border-amber-500/30 hover:border-amber-500"
                  >
                    View Full Analysis & Diagram →
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}