'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface Incident {
  id: string
  title: string
  slug: string
  protocol_name: string
  chain: string
  loss_usd: number
  attack_vector: string
  date_of_hack?: string
  impact_level?: string
  downstream_protocols?: string
  sources?: string
  content: string
  created_at: string
}

export default function IncidentDetailPage() {
  const params = useParams()
  const slug = params?.slug as string

  const [incident, setIncident] = useState<Incident | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (slug) {
      fetchIncident()
    }
  }, [slug])

  const fetchIncident = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('incidents')
      .select('*')
      .eq('slug', slug)
      .single()

    if (!error && data) {
      setIncident(data)
    }
    setLoading(false)
  }

  const handleShare = () => {
    if (typeof window !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href)
      alert('Report link copied to clipboard!')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-amber-400 p-10 text-center font-bold animate-pulse">
        Syncing threat analysis report...
      </div>
    )
  }

  if (!incident) {
    return (
      <div className="min-h-screen bg-black text-white p-10 text-center space-y-4">
        <h2 className="text-xl font-bold">Threat Report Not Found</h2>
        <Link href="/" className="text-amber-500 underline text-sm">
          ← Back to All Incidents
        </Link>
      </div>
    )
  }

  // Parse multi-line sources or comma-separated links
  const sourcesList = incident.sources
    ? incident.sources.split('\n').filter((s) => s.trim().length > 0)
    : []

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-10 font-sans">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Navigation & Header Actions */}
        <div className="flex justify-between items-center border-b border-amber-500/20 pb-4">
          <Link 
            href="/" 
            className="text-xs font-bold text-amber-500 hover:text-amber-400 uppercase tracking-wider transition-colors"
          >
            ← Back to All Incidents
          </Link>
          <Button 
            onClick={handleShare}
            className="bg-neutral-900 hover:bg-neutral-800 text-amber-500 border border-amber-500/30 text-xs font-bold uppercase tracking-wider px-4 py-2 cursor-pointer"
          >
            🔗 Share Report Link
          </Button>
        </div>

        {/* Report Title & Metadata Badges */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <span className="px-3 py-1 bg-amber-500/10 text-amber-400 text-xs font-bold rounded-md border border-amber-500/30 uppercase tracking-wider">
              {incident.protocol_name}
            </span>
            <span className="px-3 py-1 bg-neutral-900 text-neutral-300 text-xs font-semibold rounded-md border border-neutral-800 uppercase">
              {incident.chain}
            </span>
            {incident.impact_level && (
              <span className={`px-3 py-1 text-xs font-bold rounded-md uppercase tracking-wider border ${
                incident.impact_level === 'Critical' 
                  ? 'bg-red-950/60 text-red-400 border-red-800/50' 
                  : 'bg-amber-950/60 text-amber-400 border-amber-800/50'
              }`}>
                {incident.impact_level} Severity
              </span>
            )}
            <span className="text-xs text-neutral-500">
              Published: {new Date(incident.created_at).toLocaleDateString()}
            </span>
          </div>

          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
            {incident.title}
          </h1>
        </div>

        {/* Primary Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-neutral-950 border-amber-500/20 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold text-amber-500/80 uppercase tracking-wider">
                Attack Vector
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm font-bold text-white">{incident.attack_vector}</p>
            </CardContent>
          </Card>

          <Card className="bg-neutral-950 border-amber-500/20 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold text-amber-500/80 uppercase tracking-wider">
                Confirmed Losses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xl font-extrabold text-amber-400">
                ${Number(incident.loss_usd).toLocaleString()}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-neutral-950 border-amber-500/20 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold text-amber-500/80 uppercase tracking-wider">
                Date of Hack
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm font-bold text-white">
                {incident.date_of_hack || 'N/A'}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-neutral-950 border-amber-500/20 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold text-amber-500/80 uppercase tracking-wider">
                Impact Severity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className={`text-sm font-bold ${
                incident.impact_level === 'Critical' ? 'text-red-400' : 'text-amber-400'
              }`}>
                {incident.impact_level || 'Critical'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Downstream Impacted Protocols */}
        {incident.downstream_protocols && (
          <Card className="bg-neutral-950 border-amber-500/20 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold text-amber-500/80 uppercase tracking-wider">
                Downstream Impacted Protocols
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-neutral-300 font-medium">
                {incident.downstream_protocols}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Aggregated Sources & References */}
        {sourcesList.length > 0 && (
          <Card className="bg-neutral-950 border-amber-500/20 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold text-amber-500/80 uppercase tracking-wider">
                Aggregated Sources & References
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {sourcesList.map((src, i) => {
                const isUrl = src.trim().startsWith('http://') || src.trim().startsWith('https://')
                return (
                  <div key={i} className="text-xs text-neutral-300 font-mono">
                    {isUrl ? (
                      <a 
                        href={src.trim()} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-amber-400 hover:underline break-all flex items-center gap-1"
                      >
                        🔗 {src.trim()}
                      </a>
                    ) : (
                      <span className="break-all">• {src.trim()}</span>
                    )}
                  </div>
                )
              })}
            </CardContent>
          </Card>
        )}

        {/* Technical Analysis Body */}
        <Card className="bg-neutral-950 border-amber-500/20 text-white">
          <CardHeader className="border-b border-neutral-900 pb-3">
            <CardTitle className="text-xs font-semibold text-amber-500 uppercase tracking-wider">
              Technical Analysis & Exploitation Flow
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div 
              className="prose prose-invert max-w-none text-neutral-300 text-sm leading-relaxed"
              dangerouslySetInnerHTML={{ __html: incident.content }}
            />
          </CardContent>
        </Card>

      </div>
    </div>
  )
}