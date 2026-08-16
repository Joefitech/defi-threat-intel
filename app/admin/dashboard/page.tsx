'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import RichEditor from '@/components/rich-editor'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface Incident {
  id: string
  title: string
  protocol_name: string
  chain: string
  loss_usd: number
}

export default function AdminDashboard() {
  const [title, setTitle] = useState('')
  const [protocol, setProtocol] = useState('')
  const [chain, setChain] = useState('Ethereum')
  const [loss, setLoss] = useState('')
  const [attackVector, setAttackVector] = useState('')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [incidents, setIncidents] = useState<Incident[]>([])

  useEffect(() => {
    fetchIncidents()
  }, [])

  const fetchIncidents = async () => {
    const { data } = await supabase
      .from('incidents')
      .select('id, title, protocol_name, chain, loss_usd')
      .order('created_at', { ascending: false })
    if (data) setIncidents(data)
  }

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')

    const { error } = await supabase.from('incidents').insert([
      {
        title,
        slug,
        protocol_name: protocol,
        chain,
        loss_usd: Number(loss) || 0,
        attack_vector: attackVector,
        content,
        status: 'published'
      }
    ])

    setLoading(false)

    if (error) {
      alert('Error publishing report: ' + error.message)
    } else {
      alert('Incident published successfully!')
      setTitle('')
      setProtocol('')
      setLoss('')
      setAttackVector('')
      setContent('')
      fetchIncidents()
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this threat report?')) return

    const { error } = await supabase.from('incidents').delete().eq('id', id)
    if (error) {
      alert('Failed to delete report: ' + error.message)
    } else {
      fetchIncidents()
    }
  }

  const inputStyle = {
    color: '#ffffff',
    backgroundColor: '#050505',
    borderColor: 'rgba(245, 158, 11, 0.3)',
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto space-y-10">
        
        {/* Publish Form */}
        <Card className="bg-neutral-950 border-amber-500/30 text-white shadow-xl">
          <CardHeader className="border-b border-neutral-900 pb-4">
            <CardTitle className="text-2xl font-bold text-white tracking-wide">
              Publish New DeFi Threat Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handlePublish} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-xs font-semibold tracking-wider text-amber-500/80 uppercase">
                    Report Title
                  </label>
                  <input 
                    placeholder="e.g., Access Control Bypass in Vault" 
                    value={title} 
                    onChange={(e) => setTitle(e.target.value)}
                    style={inputStyle}
                    className="w-full h-10 px-3 py-2 text-sm rounded-md border focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium placeholder:text-neutral-500"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold tracking-wider text-amber-500/80 uppercase">
                    Protocol Name
                  </label>
                  <input 
                    placeholder="e.g., Euler Finance" 
                    value={protocol} 
                    onChange={(e) => setProtocol(e.target.value)}
                    style={inputStyle}
                    className="w-full h-10 px-3 py-2 text-sm rounded-md border focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium placeholder:text-neutral-500"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold tracking-wider text-amber-500/80 uppercase">
                    Blockchain Network
                  </label>
                  <input 
                    placeholder="e.g., Ethereum, Arbitrum, Base" 
                    value={chain} 
                    onChange={(e) => setChain(e.target.value)}
                    style={inputStyle}
                    className="w-full h-10 px-3 py-2 text-sm rounded-md border focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium placeholder:text-neutral-500"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold tracking-wider text-amber-500/80 uppercase">
                    Estimated Loss (USD)
                  </label>
                  <input 
                    placeholder="e.g., 2000000" 
                    type="number"
                    value={loss} 
                    onChange={(e) => setLoss(e.target.value)}
                    style={inputStyle}
                    className="w-full h-10 px-3 py-2 text-sm rounded-md border focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium placeholder:text-neutral-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold tracking-wider text-amber-500/80 uppercase">
                  Attack Vector Classification
                </label>
                <input 
                  placeholder="e.g., Price Oracle Manipulation / Flash Loan Reentrancy" 
                  value={attackVector} 
                  onChange={(e) => setAttackVector(e.target.value)}
                  style={inputStyle}
                  className="w-full h-10 px-3 py-2 text-sm rounded-md border focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium placeholder:text-neutral-500"
                  required
                />
              </div>

              <div className="space-y-2 pt-2">
                <label className="text-xs font-semibold tracking-wider text-amber-500/80 uppercase">
                  Threat Intelligence Report Body & Diagram
                </label>
                <RichEditor onChange={setContent} />
              </div>

              <Button 
                type="submit" 
                disabled={loading}
                className="w-full bg-amber-500 hover:bg-amber-400 text-black font-extrabold tracking-wide py-3 cursor-pointer transition-all shadow-[0_0_15px_rgba(245,158,11,0.2)]"
              >
                {loading ? 'Publishing Report...' : 'Publish Breakdown to Platform'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Manage Existing Incidents */}
        <Card className="bg-neutral-950 border-amber-500/30 text-white shadow-xl">
          <CardHeader className="border-b border-neutral-900 pb-4">
            <CardTitle className="text-xl font-bold text-white tracking-wide">
              Manage Published Incident Reports
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {incidents.length === 0 ? (
              <p className="text-neutral-500 text-sm text-center py-4">No published reports found.</p>
            ) : (
              <div className="space-y-3">
                {incidents.map((item) => (
                  <div key={item.id} className="flex justify-between items-center bg-black p-4 rounded-lg border border-neutral-800">
                    <div>
                      <h4 className="font-bold text-white">{item.title}</h4>
                      <p className="text-xs text-neutral-400">
                        {item.protocol_name} • {item.chain} • ${Number(item.loss_usd).toLocaleString()}
                      </p>
                    </div>
                    <Button 
                      onClick={() => handleDelete(item.id)}
                      className="bg-red-950 hover:bg-red-900 text-red-400 border border-red-800/50 text-xs font-bold px-3 py-1.5"
                    >
                      Delete
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  )
}