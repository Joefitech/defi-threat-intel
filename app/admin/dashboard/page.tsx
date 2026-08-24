'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

// Major Chain Presets with High-Res Logos
const CHAIN_PRESETS = [
  { name: 'Ethereum', logo: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png' },
  { name: 'BNB Chain', logo: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/binance/info/logo.png' },
  { name: 'Arbitrum', logo: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/arbitrum/info/logo.png' },
  { name: 'Base', logo: 'https://raw.githubusercontent.com/base-org/brand-kit/main/logo/in-product/Base_Network_Logo.svg' },
  { name: 'Solana', logo: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/solana/info/logo.png' },
  { name: 'Polygon', logo: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/polygon/info/logo.png' },
  { name: 'Optimism', logo: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/optimism/info/logo.png' },
  { name: 'Avalanche', logo: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/avalanchec/info/logo.png' },
]

// Standardized Vector Presets
const VECTOR_PRESETS = [
  'Price Oracle Manipulation',
  'Bridge Logic Flaw',
  'Spot Price Manipulation',
  'Improper Access Control',
  'Private Key Compromised',
  'Reentrancy',
  'Hot Wallet Compromise'
]

export default function AdminDashboardPage() {
  const router = useRouter()

  // Form State
  const [title, setTitle] = useState('')
  const [protocolName, setProtocolName] = useState('')
  const [protocolLogoUrl, setProtocolLogoUrl] = useState('')
  const [selectedChain, setSelectedChain] = useState('Ethereum')
  const [customChain, setCustomChain] = useState('')
  const [lossUsd, setLossUsd] = useState('')
  const [dateOfHack, setDateOfHack] = useState('')
  const [impactLevel, setImpactLevel] = useState('Critical')
  const [downstreamProtocols, setDownstreamProtocols] = useState('')
  const [sources, setSources] = useState('')
  const [content, setContent] = useState('')

  // 1. Attack Vectors (Multi-Select + Custom)
  const [selectedVectors, setSelectedVectors] = useState<string[]>([])
  const [customVectorInput, setCustomVectorInput] = useState('')

  // 2. Isolated Dynamic Lists
  const [attackChain, setAttackChain] = useState<string[]>([''])
  const [defensiveControls, setDefensiveControls] = useState<string[]>([''])

  const [submitting, setSubmitting] = useState(false)

  // Vector Toggle & Custom Creator Handlers
  const toggleVector = (vector: string) => {
    if (selectedVectors.includes(vector)) {
      setSelectedVectors(selectedVectors.filter(v => v !== vector))
    } else {
      setSelectedVectors([...selectedVectors, vector])
    }
  }

  const addCustomVector = () => {
    const trimmed = customVectorInput.trim()
    if (trimmed && !selectedVectors.includes(trimmed)) {
      setSelectedVectors([...selectedVectors, trimmed])
      setCustomVectorInput('')
    }
  }

  // Dynamic Attack Chain Handlers
  const handleAttackStepChange = (index: number, value: string) => {
    const updated = [...attackChain]
    updated[index] = value
    setAttackChain(updated)
  }

  const addAttackStep = () => setAttackChain([...attackChain, ''])
  const removeAttackStep = (index: number) => {
    if (attackChain.length > 1) {
      setAttackChain(attackChain.filter((_, i) => i !== index))
    }
  }

  // Dynamic Defensive Controls Handlers
  const handleDefensiveControlChange = (index: number, value: string) => {
    const updated = [...defensiveControls]
    updated[index] = value
    setDefensiveControls(updated)
  }

  const addDefensiveControl = () => setDefensiveControls([...defensiveControls, ''])
  const removeDefensiveControl = (index: number) => {
    if (defensiveControls.length > 1) {
      setDefensiveControls(defensiveControls.filter((_, i) => i !== index))
    }
  }

  // Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    const finalChain = selectedChain === 'Custom' ? customChain : selectedChain
    const vectorString = selectedVectors.join(', ')
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')

    // Clean dynamic arrays
    const cleanedAttackChain = attackChain.filter(step => step.trim().length > 0)
    const cleanedDefensiveControls = defensiveControls.filter(ctrl => ctrl.trim().length > 0)

    const payload: Record<string, any> = {
      title,
      slug: `${slug}-${Date.now().toString().slice(-4)}`,
      protocol_name: protocolName,
      protocol_logo_url: protocolLogoUrl,
      chain: finalChain,
      loss_usd: parseFloat(lossUsd) || 0,
      attack_vector: vectorString,
      date_of_hack: dateOfHack ? dateOfHack : null,
      impact_level: impactLevel,
      downstream_protocols: downstreamProtocols,
      sources,
      attack_chain: cleanedAttackChain,
      defensive_controls: cleanedDefensiveControls,
      content,
      status: 'published'
    }

    const { error } = await supabase.from('incidents').insert([payload])

    if (error) {
      alert(`Submission error: ${error.message}`)
    } else {
      alert('Threat Breakdown Published Successfully!')
      router.push('/')
    }
    setSubmitting(false)
  }

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-10 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        
        <div className="border-b border-amber-500/20 pb-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-black text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
              Publish Incident Breakdown
            </h1>
            <p className="text-xs text-neutral-400 mt-1">Defi Threat Intelligence Command Console</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Section 1: Core Protocol & Network Metadata */}
          <Card className="bg-neutral-950 border-amber-500/20 text-white">
            <CardHeader className="pb-3 border-b border-neutral-900">
              <CardTitle className="text-xs font-bold text-amber-500 uppercase tracking-wider">
                1. Protocol & Network Metadata
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-amber-500/80 mb-1">REPORT TITLE</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="e.g., Access Control & Bridge Proxy Drain" 
                    value={title} 
                    onChange={e => setTitle(e.target.value)}
                    className="w-full h-10 px-3 bg-neutral-900 border border-neutral-800 rounded text-sm text-white focus:border-amber-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-amber-500/80 mb-1">PROTOCOL NAME</label>
                  <div className="flex gap-2 items-center">
                    <input 
                      type="text" 
                      required 
                      placeholder="e.g., Humanity Protocol" 
                      value={protocolName} 
                      onChange={e => setProtocolName(e.target.value)}
                      className="w-full h-10 px-3 bg-neutral-900 border border-neutral-800 rounded text-sm text-white focus:border-amber-500 outline-none"
                    />
                    {protocolLogoUrl ? (
                      <img src={protocolLogoUrl} alt="Logo" className="w-8 h-8 rounded-full border border-amber-500/40 object-cover" />
                    ) : protocolName ? (
                      <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 text-xs font-bold">
                        {protocolName.charAt(0).toUpperCase()}
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>

              {/* Protocol Logo URL */}
              <div>
                <label className="block text-xs font-bold text-amber-500/80 mb-1">PROTOCOL LOGO URL (OPTIONAL)</label>
                <input 
                  type="url" 
                  placeholder="https://.../logo.png" 
                  value={protocolLogoUrl} 
                  onChange={e => setProtocolLogoUrl(e.target.value)}
                  className="w-full h-10 px-3 bg-neutral-900 border border-neutral-800 rounded text-xs text-white focus:border-amber-500 outline-none"
                />
              </div>

              {/* Blockchain Selector with Logos */}
              <div>
                <label className="block text-xs font-bold text-amber-500/80 mb-2">BLOCKCHAIN NETWORK</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {CHAIN_PRESETS.map((chain) => (
                    <button
                      type="button"
                      key={chain.name}
                      onClick={() => setSelectedChain(chain.name)}
                      className={`flex items-center gap-2 p-2 rounded-lg border text-xs font-bold transition-all ${
                        selectedChain === chain.name 
                          ? 'bg-amber-500/20 border-amber-500 text-amber-400' 
                          : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                      }`}
                    >
                      <img src={chain.logo} alt={chain.name} className="w-4 h-4 rounded-full object-contain" />
                      <span>{chain.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Loss & Dates */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-amber-500/80 mb-1">ESTIMATED LOSS (USD)</label>
                  <input 
                    type="number" 
                    required 
                    placeholder="32000000" 
                    value={lossUsd} 
                    onChange={e => setLossUsd(e.target.value)}
                    className="w-full h-10 px-3 bg-neutral-900 border border-neutral-800 rounded text-sm text-white focus:border-amber-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-amber-500/80 mb-1">DATE OF HACK</label>
                  <input 
                    type="date" 
                    value={dateOfHack} 
                    onChange={e => setDateOfHack(e.target.value)}
                    className="w-full h-10 px-3 bg-neutral-900 border border-neutral-800 rounded text-xs text-white focus:border-amber-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-amber-500/80 mb-1">IMPACT SEVERITY</label>
                  <select 
                    value={impactLevel} 
                    onChange={e => setImpactLevel(e.target.value)}
                    className="w-full h-10 px-3 bg-neutral-900 border border-neutral-800 rounded text-xs text-white focus:border-amber-500 outline-none"
                  >
                    <option value="Critical">Critical (Complete Drain / Core Exploited)</option>
                    <option value="High">High (Significant Loss / Partial Vulnerability)</option>
                    <option value="Medium">Medium (Limited Vault Impact)</option>
                    <option value="Low">Low (Informational / Minor Risk)</option>
                  </select>
                </div>
              </div>

            </CardContent>
          </Card>

          {/* Section 2: Attack Vector Classification Tags */}
          <Card className="bg-neutral-950 border-amber-500/20 text-white">
            <CardHeader className="pb-3 border-b border-neutral-900">
              <CardTitle className="text-xs font-bold text-amber-500 uppercase tracking-wider">
                2. Attack Vector Classification Tags
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              
              {/* Selected Tags Display */}
              {selectedVectors.length > 0 && (
                <div className="flex flex-wrap gap-2 p-3 bg-neutral-900/60 border border-amber-500/30 rounded-lg">
                  <span className="text-xs text-neutral-400 self-center mr-1">Active Tags:</span>
                  {selectedVectors.map(vec => (
                    <span 
                      key={vec} 
                      className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/20 text-amber-400 border border-amber-500/40 text-xs font-bold rounded-full"
                    >
                      {vec}
                      <button 
                        type="button" 
                        onClick={() => toggleVector(vec)}
                        className="hover:text-white transition-colors text-sm font-bold ml-1"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Standard Preset Vector Badges */}
              <div>
                <label className="block text-xs font-bold text-neutral-400 mb-2">Select Standardized Vectors:</label>
                <div className="flex flex-wrap gap-2">
                  {VECTOR_PRESETS.map(preset => {
                    const isSelected = selectedVectors.includes(preset)
                    return (
                      <button
                        type="button"
                        key={preset}
                        onClick={() => toggleVector(preset)}
                        className={`px-3 py-1.5 text-xs font-bold rounded-md border transition-all ${
                          isSelected
                            ? 'bg-amber-500 text-black border-amber-400 font-extrabold'
                            : 'bg-neutral-900 text-neutral-300 border-neutral-800 hover:border-amber-500/50'
                        }`}
                      >
                        {isSelected ? '✓ ' : '+ '}{preset}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Add Custom Vector Input */}
              <div className="flex gap-2 pt-2">
                <input 
                  type="text" 
                  placeholder="Create custom vector tag..." 
                  value={customVectorInput}
                  onChange={e => setCustomVectorInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCustomVector(); }}}
                  className="flex-1 h-9 px-3 bg-neutral-900 border border-neutral-800 rounded text-xs text-white focus:border-amber-500 outline-none"
                />
                <Button 
                  type="button" 
                  onClick={addCustomVector}
                  className="bg-neutral-800 hover:bg-neutral-700 text-amber-400 border border-amber-500/30 text-xs font-bold h-9 px-4"
                >
                  + Add Custom Vector
                </Button>
              </div>

            </CardContent>
          </Card>

          {/* Section 3: Dynamic Attack Chain & Defensive Controls */}
          <Card className="bg-neutral-950 border-amber-500/20 text-white">
            <CardHeader className="pb-3 border-b border-neutral-900">
              <CardTitle className="text-xs font-bold text-amber-500 uppercase tracking-wider">
                3. Isolated Attack Chain & Defensive Controls
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-6">
              
              {/* Dynamic Attack Chain List */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-amber-500/90 uppercase tracking-wider">
                    ⚡ Attack Execution Flow (Sequence)
                  </label>
                  <Button 
                    type="button" 
                    onClick={addAttackStep} 
                    className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold h-7 px-3"
                  >
                    ＋ Add Attack Step
                  </Button>
                </div>

                <div className="space-y-2">
                  {attackChain.map((step, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <span className="text-xs font-mono font-bold text-amber-500/70 w-14 shrink-0">
                        Step {idx + 1}:
                      </span>
                      <input 
                        type="text" 
                        placeholder="e.g., Attacker compromised laptop 1 via phishing attachment to gain SSH keys" 
                        value={step}
                        onChange={e => handleAttackStepChange(idx, e.target.value)}
                        className="flex-1 h-9 px-3 bg-neutral-900 border border-neutral-800 rounded text-xs text-white focus:border-amber-500 outline-none"
                      />
                      {attackChain.length > 1 && (
                        <button 
                          type="button" 
                          onClick={() => removeAttackStep(idx)}
                          className="text-neutral-500 hover:text-red-400 px-2 text-sm font-bold"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Dynamic Defensive Controls List */}
              <div className="space-y-3 pt-4 border-t border-neutral-900">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-amber-500/90 uppercase tracking-wider">
                    🛡️ Defensive Controls & Mitigation Recommendations
                  </label>
                  <Button 
                    type="button" 
                    onClick={addDefensiveControl} 
                    className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold h-7 px-3"
                  >
                    ＋ Add Defensive Control
                  </Button>
                </div>

                <div className="space-y-2">
                  {defensiveControls.map((ctrl, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <span className="text-xs font-mono font-bold text-amber-500/70 w-14 shrink-0">
                        Ctrl {idx + 1}:
                      </span>
                      <input 
                        type="text" 
                        placeholder="e.g., Mandatory Hardware Security Modules (HSM) for administrative multisig signers" 
                        value={ctrl}
                        onChange={e => handleDefensiveControlChange(idx, e.target.value)}
                        className="flex-1 h-9 px-3 bg-neutral-900 border border-neutral-800 rounded text-xs text-white focus:border-amber-500 outline-none"
                      />
                      {defensiveControls.length > 1 && (
                        <button 
                          type="button" 
                          onClick={() => removeDefensiveControl(idx)}
                          className="text-neutral-500 hover:text-red-400 px-2 text-sm font-bold"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

            </CardContent>
          </Card>

          {/* Section 4: Downstream Impact, Sources & Narrative Body */}
          <Card className="bg-neutral-950 border-amber-500/20 text-white">
            <CardHeader className="pb-3 border-b border-neutral-900">
              <CardTitle className="text-xs font-bold text-amber-500 uppercase tracking-wider">
                4. Downstream Impact, Sources & Narrative Body
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              
              <div>
                <label className="block text-xs font-bold text-amber-500/80 mb-1">DOWNSTREAM IMPACTED PROTOCOLS</label>
                <input 
                  type="text" 
                  placeholder="e.g., Curve pools, Aave v3 collateral vaults" 
                  value={downstreamProtocols} 
                  onChange={e => setDownstreamProtocols(e.target.value)}
                  className="w-full h-10 px-3 bg-neutral-900 border border-neutral-800 rounded text-xs text-white focus:border-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-amber-500/80 mb-1">AGGREGATED SOURCES & REFERENCES (ONE PER LINE)</label>
                <textarea 
                  rows={3}
                  placeholder="https://etherscan.io/tx/0x...&#10;PeckShield Twitter Incident Alert" 
                  value={sources} 
                  onChange={e => setSources(e.target.value)}
                  className="w-full p-3 bg-neutral-900 border border-neutral-800 rounded text-xs text-white focus:border-amber-500 outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-amber-500/80 mb-1">FULL TECHNICAL ANALYSIS BODY (HTML / RICH TEXT)</label>
                <textarea 
                  rows={10} 
                  required
                  placeholder="Paste your report HTML body here..." 
                  value={content} 
                  onChange={e => setContent(e.target.value)}
                  className="w-full p-3 bg-neutral-900 border border-neutral-800 rounded text-xs text-white focus:border-amber-500 outline-none font-mono"
                />
              </div>

            </CardContent>
          </Card>

          {/* Action Footer */}
          <div className="flex justify-end pt-4">
            <Button 
              type="submit" 
              disabled={submitting}
              className="bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs uppercase tracking-wider px-8 py-3 rounded-lg shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all cursor-pointer"
            >
              {submitting ? 'Publishing Threat Intelligence...' : '🚀 Publish Threat Breakdown'}
            </Button>
          </div>

        </form>
      </div>
    </div>
  )
}