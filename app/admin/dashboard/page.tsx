'use client'

import { useState, useRef } from 'react'
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
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Form State
  const [title, setTitle] = useState('')
  const [protocolName, setProtocolName] = useState('')
  const [protocolLogoUrl, setProtocolLogoUrl] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [uploadingImage, setUploadingImage] = useState(false)
  const [selectedChain, setSelectedChain] = useState('Ethereum')
  const [customChain, setCustomChain] = useState('')
  const [lossUsd, setLossUsd] = useState('')
  const [dateOfHack, setDateOfHack] = useState('')
  const [impactLevel, setImpactLevel] = useState('Critical')
  const [downstreamProtocols, setDownstreamProtocols] = useState('')
  const [sources, setSources] = useState('')
  const [content, setContent] = useState('')

  // Attack Vectors
  const [selectedVectors, setSelectedVectors] = useState<string[]>([])
  const [customVectorInput, setCustomVectorInput] = useState('')

  // Dynamic Lists
  const [attackChain, setAttackChain] = useState<string[]>([''])
  const [defensiveControls, setDefensiveControls] = useState<string[]>([''])

  const [submitting, setSubmitting] = useState(false)

  // --- RICH TEXT FORMATTING TOOLBAR HANDLER ---
  const insertFormatting = (startTag: string, endTag: string = '', defaultPlaceholder: string = 'text') => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = content.substring(start, end)
    const replacement = `${startTag}${selectedText || defaultPlaceholder}${endTag}`

    const newContent = content.substring(0, start) + replacement + content.substring(end)
    setContent(newContent)

    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(
        start + startTag.length,
        start + startTag.length + (selectedText.length || defaultPlaceholder.length)
      )
    }, 0)
  }

  // --- LOCAL FILE UPLOAD HANDLER ---
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingImage(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}.${fileExt}`
      const filePath = `diagrams/${fileName}`

      // Upload to Supabase Bucket 'incident-media'
      const { error } = await supabase.storage
        .from('incident-media')
        .upload(filePath, file)

      if (error) {
        // Fallback: Convert to Base64 Data URL if Supabase bucket is missing
        const reader = new FileReader()
        reader.onloadend = () => {
          setImageUrl(reader.result as string)
          setUploadingImage(false)
        }
        reader.readAsDataURL(file)
      } else {
        const { data: publicUrlData } = supabase.storage
          .from('incident-media')
          .getPublicUrl(filePath)
        setImageUrl(publicUrlData.publicUrl)
        setUploadingImage(false)
      }
    } catch {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImageUrl(reader.result as string)
        setUploadingImage(false)
      }
      reader.readAsDataURL(file)
    }
  }

  // Tag Handlers
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

  // Dynamic Step Handlers
  const handleAttackStepChange = (index: number, value: string) => {
    const updated = [...attackChain]
    updated[index] = value
    setAttackChain(updated)
  }
  const addAttackStep = () => setAttackChain([...attackChain, ''])
  const removeAttackStep = (index: number) => {
    if (attackChain.length > 1) setAttackChain(attackChain.filter((_, i) => i !== index))
  }

  const handleDefensiveControlChange = (index: number, value: string) => {
    const updated = [...defensiveControls]
    updated[index] = value
    setDefensiveControls(updated)
  }
  const addDefensiveControl = () => setDefensiveControls([...defensiveControls, ''])
  const removeDefensiveControl = (index: number) => {
    if (defensiveControls.length > 1) setDefensiveControls(defensiveControls.filter((_, i) => i !== index))
  }

  const insertImageToContent = () => {
    if (!imageUrl) return
    const imgTag = `\n<img src="${imageUrl}" alt="Threat Diagram" class="w-full rounded-lg my-4 border border-neutral-800" />\n`
    setContent(prev => prev + imgTag)
  }

  // Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    const finalChain = selectedChain === 'Custom' ? customChain : selectedChain
    const vectorString = selectedVectors.join(', ')
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')

    const cleanedAttackChain = attackChain.filter(step => step.trim().length > 0)
    const cleanedDefensiveControls = defensiveControls.filter(ctrl => ctrl.trim().length > 0)

    const payload: Record<string, any> = {
      title,
      slug: `${slug}-${Date.now().toString().slice(-4)}`,
      protocol_name: protocolName,
      protocol_logo_url: protocolLogoUrl,
      image_url: imageUrl,
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

          {/* Section 4: Downstream Impact, Media Upload & Rich Text Body */}
          <Card className="bg-neutral-950 border-amber-500/20 text-white">
            <CardHeader className="pb-3 border-b border-neutral-900">
              <CardTitle className="text-xs font-bold text-amber-500 uppercase tracking-wider">
                4. Downstream Impact, Media Attachments & Narrative Body
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

              {/* IMAGE ATTACHMENT / FILE UPLOAD FIELD */}
              <div className="p-4 bg-neutral-900/40 border border-neutral-800 rounded-lg space-y-3">
                <div className="flex justify-between items-center">
                  <label className="block text-xs font-bold text-amber-500/90 uppercase tracking-wider">
                    🖼️ INCIDENT ARCHITECTURE / DIAGRAM IMAGE (UPLOAD FILE OR PASTE URL)
                  </label>
                  {imageUrl && (
                    <button 
                      type="button"
                      onClick={insertImageToContent}
                      className="text-[11px] text-amber-400 hover:text-amber-300 underline font-bold"
                    >
                      + Embed Image into Technical Body
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* File Upload Button */}
                  <div>
                    <span className="block text-[11px] text-neutral-400 mb-1">Upload JPEG/PNG File:</span>
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="w-full text-xs text-neutral-400 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:font-bold file:bg-amber-500/20 file:text-amber-400 hover:file:bg-amber-500/30 cursor-pointer"
                    />
                    {uploadingImage && <span className="text-[11px] text-amber-400 mt-1 block animate-pulse">Uploading file...</span>}
                  </div>

                  {/* Remote URL Input */}
                  <div>
                    <span className="block text-[11px] text-neutral-400 mb-1">Or Paste Image URL:</span>
                    <input 
                      type="url" 
                      placeholder="https://.../exploit-diagram.jpeg" 
                      value={imageUrl} 
                      onChange={e => setImageUrl(e.target.value)}
                      className="w-full h-9 px-3 bg-neutral-900 border border-neutral-800 rounded text-xs text-white focus:border-amber-500 outline-none"
                    />
                  </div>
                </div>
                
                {/* Image Preview Box */}
                {imageUrl && (
                  <div className="p-2 bg-neutral-900 border border-neutral-800 rounded flex items-center gap-3">
                    <img 
                      src={imageUrl} 
                      alt="Attachment Preview" 
                      className="w-24 h-16 object-cover rounded border border-amber-500/30"
                      onError={(e) => (e.currentTarget.style.display = 'none')}
                    />
                    <div className="text-xs text-neutral-400 truncate flex-1">
                      <span className="text-amber-400 font-bold block">Attached Diagram Preview</span>
                      <span className="text-[11px] font-mono truncate block">{imageUrl}</span>
                    </div>
                  </div>
                )}
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

              {/* RICH TEXT TECHNICAL ANALYSIS BODY */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-bold text-amber-500/80">
                    FULL TECHNICAL ANALYSIS BODY (RICH TEXT / HTML)
                  </label>
                  <span className="text-[11px] text-neutral-500">Highlight text & click toolbar to format</span>
                </div>

                {/* RICH TEXT FORMATTING TOOLBAR */}
                <div className="flex flex-wrap items-center gap-1.5 p-2 bg-neutral-900 border border-neutral-800 rounded-t-lg">
                  <button 
                    type="button" 
                    onClick={() => insertFormatting('<b>', '</b>', 'bold text')}
                    className="px-2.5 py-1 text-xs font-bold bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded text-amber-400"
                    title="Bold"
                  >
                    B
                  </button>
                  <button 
                    type="button" 
                    onClick={() => insertFormatting('<i>', '</i>', 'italic text')}
                    className="px-2.5 py-1 text-xs italic font-serif bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded text-amber-400"
                    title="Italic"
                  >
                    I
                  </button>
                  <button 
                    type="button" 
                    onClick={() => insertFormatting('<u>', '</u>', 'underlined text')}
                    className="px-2.5 py-1 text-xs underline bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded text-amber-400"
                    title="Underline"
                  >
                    U
                  </button>
                  <div className="w-px h-4 bg-neutral-700 mx-1" />
                  <button 
                    type="button" 
                    onClick={() => insertFormatting('<h3>', '</h3>', 'Section Heading')}
                    className="px-2 py-1 text-xs font-bold bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded text-neutral-300"
                  >
                    H3
                  </button>
                  <button 
                    type="button" 
                    onClick={() => insertFormatting('<p>', '</p>', 'Paragraph text...')}
                    className="px-2 py-1 text-xs bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded text-neutral-300"
                  >
                    P
                  </button>
                  <button 
                    type="button" 
                    onClick={() => insertFormatting('<code>', '</code>', 'function attack()')}
                    className="px-2 py-1 text-xs font-mono bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded text-neutral-300"
                  >
                    Code
                  </button>
                  <button 
                    type="button" 
                    onClick={() => insertFormatting('<ul>\n  <li>', '</li>\n</ul>', 'List item')}
                    className="px-2 py-1 text-xs bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded text-neutral-300"
                  >
                    List
                  </button>
                  <div className="w-px h-4 bg-neutral-700 mx-1" />
                  <button 
                    type="button" 
                    onClick={() => insertFormatting(`<img src="${imageUrl || 'https://...'}" alt="Diagram" class="w-full rounded-lg my-4" />`)}
                    className="px-2.5 py-1 text-xs bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/40 rounded font-bold"
                  >
                    + Insert Img Tag
                  </button>
                </div>

                <textarea 
                  ref={textareaRef}
                  rows={12} 
                  required
                  placeholder="Type your technical analysis body here... Use toolbar buttons above for Bold, Italic, Underline, and Headings." 
                  value={content} 
                  onChange={e => setContent(e.target.value)}
                  className="w-full p-3 bg-neutral-900 border border-neutral-800 border-t-0 rounded-b-lg text-xs text-white focus:border-amber-500 outline-none font-mono leading-relaxed"
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