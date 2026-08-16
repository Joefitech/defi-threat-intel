'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Card, CardContent } from '@/components/ui/card'

interface Incident {
  id: string
  title: string
  slug: string
  protocol_name: string
  chain: string
  loss_usd: number
  attack_vector: string
  content: string
  created_at: string
}

export default function IncidentDetailPage() {
  const params = useParams()
  const slug = typeof params?.slug === 'string' ? params.slug : ''

  const [incident, setIncident] = useState<Incident | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (slug) fetchIncident()
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
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-amber-400 flex items-center justify-center font-semibold animate-pulse">
        Fetching Threat Analysis Report...
      </div>
    )
  }

  if (!incident) {
    return (
      <div className="min-h-screen bg-black text-white p-10 flex flex-col items-center justify-center space-y-4">
        <h2 className="text-2xl font-bold text-amber-500">Report Not Found</h2>
        <p className="text-neutral-400">The threat report you are looking for does not exist or has been removed.</p>
        <Link href="/" className="px-4 py-2 bg-amber-500 text-black font-bold rounded-md">
          ← Return to Threat Feed
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-12 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Navigation Bar */}
        <div className="flex justify-between items-center border-b border-amber-500/20 pb-4">
          <Link href="/" className="text-xs font-bold uppercase tracking-wider text-amber-500 hover:text-amber-400 flex items-center gap-1">
            ← Back to All Incidents
          </Link>
          <button
            onClick={handleShare}
            className="px-3 py-1.5 bg-neutral-900 border border-amber-500/30 text-amber-400 hover:text-amber-300 text-xs font-bold uppercase tracking-wider rounded-md transition-all cursor-pointer"
          >
            {copied ? '✓ Link Copied!' : '🔗 Share Report Link'}
          </button>
        </div>

        {/* Article Header */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 bg-amber-500/10 text-amber-400 text-xs font-bold rounded-md border border-amber-500/30 uppercase tracking-wider">
              {incident.protocol_name}
            </span>
            <span className="px-3 py-1 bg-neutral-900 text-neutral-300 text-xs font-semibold rounded-md border border-neutral-800 uppercase">
              {incident.chain}
            </span>
            <span className="text-xs text-neutral-500">
              Published on {new Date(incident.created_at).toLocaleDateString()}
            </span>
          </div>

          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight">
            {incident.title}
          </h1>
        </div>

        {/* Threat Summary Metadata Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="bg-neutral-950 border-amber-500/20 text-white">
            <CardContent className="p-4">
              <span className="text-xs text-amber-500/80 uppercase font-semibold">Attack Vector</span>
              <p className="text-base font-bold text-neutral-200 mt-1">{incident.attack_vector}</p>
            </CardContent>
          </Card>
          
          <Card className="bg-neutral-950 border-amber-500/20 text-white">
            <CardContent className="p-4">
              <span className="text-xs text-amber-500/80 uppercase font-semibold">Confirmed Losses</span>
              <p className="text-xl font-extrabold text-amber-400 mt-1">${Number(incident.loss_usd).toLocaleString()}</p>
            </CardContent>
          </Card>
        </div>

        {/* Content Body & Diagram */}
        <div className="bg-neutral-950 border border-amber-500/20 rounded-xl p-6 md:p-8 space-y-6 shadow-2xl">
          <h3 className="text-xs font-semibold tracking-wider text-amber-500 uppercase border-b border-neutral-900 pb-2">
            Technical Analysis & Exploitation Flow
          </h3>
          
          <div 
            className="prose prose-invert max-w-none text-neutral-300 space-y-4 text-sm leading-relaxed
              [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-white [&_h2]:pt-4
              [&_code]:bg-neutral-900 [&_code]:px-2 [&_code]:py-1 [&_code]:rounded [&_code]:text-amber-400 [&_code]:font-mono
              [&_img]:rounded-lg [&_img]:border [&_img]:border-neutral-800 [&_img]:my-6 [&_img]:w-full [&_img]:object-cover"
            dangerouslySetInnerHTML={{ __html: incident.content }}
          />
        </div>

      </div>
    </div>
  )
}