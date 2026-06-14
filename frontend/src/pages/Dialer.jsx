import { useEffect, useState } from 'react'
import { getAgents, getLeads } from '../api'

// ── Utilities ─────────────────────────────────────────────────────────────────

function fmtTime(secs) {
  return `${String(Math.floor(secs / 60)).padStart(2, '0')}:${String(secs % 60).padStart(2, '0')}`
}

const TEMP_STYLE = {
  hot:  'bg-danger/10 text-danger',
  warm: 'bg-warning/10 text-warning',
  cold: 'bg-teal/10 text-teal',
}

function TempPill({ temperature }) {
  if (!temperature) return <span className="text-white/20 text-xs">—</span>
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${TEMP_STYLE[temperature]}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {temperature}
    </span>
  )
}

// Label + value row used in the member detail card
function DetailRow({ label, value }) {
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-white/5 last:border-0">
      <span className="text-muted text-[11px] font-semibold uppercase tracking-wider w-28 shrink-0 pt-0.5">
        {label}
      </span>
      <span className="text-ink text-sm">
        {value ?? <span className="text-white/20">—</span>}
      </span>
    </div>
  )
}

// Toggle button group (used for outcome / temperature in disposition)
function ButtonGroup({ options, value, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(opt => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value === value ? '' : opt.value)}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
            value === opt.value
              ? `${opt.activeClass} border-current`
              : 'text-muted border-white/8 hover:border-white/20 hover:text-ink'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

// ── Call Control Bar ──────────────────────────────────────────────────────────
function CallControlBar({ agent, lead, callState, callTimer, onBreak, onToggleBreak, onStart, onEnd }) {
  const isActive = callState === 'active'
  const isEnded  = callState === 'ended'

  return (
    <div className="bg-surface-raised rounded-xl border border-white/8 px-5 py-4 flex items-center gap-6">
      {/* Agent section */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-9 h-9 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center shrink-0">
          <span className="text-accent text-xs font-bold">
            {agent?.name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </span>
        </div>
        <div className="min-w-0">
          <p className="text-ink text-sm font-semibold leading-tight truncate">{agent?.name}</p>
          <p className="text-muted text-xs capitalize">{agent?.branch} · {agent?.zone}</p>
        </div>
      </div>

      {/* Break toggle */}
      <button
        onClick={onToggleBreak}
        className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
          onBreak
            ? 'bg-warning/10 text-warning border-warning/20 hover:bg-warning/15'
            : 'text-muted border-white/8 hover:text-ink hover:border-white/20'
        }`}
      >
        {onBreak ? '● On Break — Resume' : 'Take Break'}
      </button>

      {/* Divider */}
      <div className="h-10 w-px bg-white/8 shrink-0" />

      {/* Active call area (expands) */}
      <div className="flex-1 flex items-center justify-center gap-4">
        {isActive ? (
          <>
            {/* Pulsing live indicator */}
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-60" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-success" />
            </span>
            <div className="text-center">
              <p className="text-ink font-semibold text-sm leading-tight">{lead?.customer_name}</p>
              <p className="text-muted font-mono text-xs">{lead?.contact_number}</p>
            </div>
            {/* Running timer */}
            <div className="bg-success/10 border border-success/20 rounded-lg px-4 py-1.5">
              <p className="text-success font-mono text-lg font-bold leading-none tracking-wider">
                {fmtTime(callTimer)}
              </p>
            </div>
          </>
        ) : isEnded ? (
          <p className="text-warning text-sm font-medium">Disposition pending for {lead?.customer_name}</p>
        ) : (
          <p className="text-muted text-sm">
            {lead ? `Ready to call ${lead.customer_name}` : 'No leads in queue'}
          </p>
        )}
      </div>

      {/* Divider */}
      <div className="h-10 w-px bg-white/8 shrink-0" />

      {/* Total time + call action */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="text-right">
          <p className="text-muted text-[10px] uppercase tracking-wider font-semibold">Today</p>
          <p className="text-ink font-mono text-sm font-semibold">01:05:01</p>
        </div>

        {isActive ? (
          <button
            onClick={onEnd}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-danger/10 border border-danger/25 text-danger text-sm font-semibold hover:bg-danger/15 transition-colors"
          >
            {/* End call icon */}
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" transform="rotate(135 12 12)" />
            </svg>
            End Call
          </button>
        ) : (
          <button
            onClick={onStart}
            disabled={!lead || onBreak || isEnded}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-success/10 border border-success/25 text-success text-sm font-semibold hover:bg-success/15 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {/* Phone icon */}
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
            </svg>
            Start Call
          </button>
        )}
      </div>
    </div>
  )
}

// ── Call Queue ────────────────────────────────────────────────────────────────
function CallQueue({ queue, currentIndex, onPrioritize }) {
  return (
    <div className="bg-surface-raised rounded-xl border border-white/8 overflow-hidden flex flex-col">
      <div className="px-4 py-3 border-b border-white/8 flex items-center justify-between">
        <h2 className="text-ink text-sm font-semibold">Call Queue</h2>
        <span className="text-muted text-xs">{queue.length} leads</span>
      </div>

      <div className="overflow-y-auto flex-1">
        {queue.map((lead, i) => {
          const isCurrent = i === currentIndex
          const isDone    = i < currentIndex
          return (
            <div
              key={lead.id}
              className={`flex items-center gap-3 px-4 py-3 border-b border-white/5 last:border-0 transition-colors ${
                isCurrent
                  ? 'bg-accent/8 border-l-2 border-l-accent'
                  : isDone
                  ? 'opacity-35'
                  : 'hover:bg-white/3'
              }`}
            >
              {/* Position number */}
              <span className={`text-xs font-bold tabular-nums w-5 shrink-0 ${isCurrent ? 'text-accent' : 'text-muted'}`}>
                {isDone ? '✓' : i + 1}
              </span>

              {/* Lead info */}
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium truncate leading-tight ${isCurrent ? 'text-ink' : isDone ? 'text-muted' : 'text-ink/80'}`}>
                  {lead.customer_name}
                </p>
                <p className="text-muted text-xs truncate mt-0.5">{lead.campaign_name || '—'}</p>
              </div>

              {/* Temperature */}
              <TempPill temperature={lead.temperature} />

              {/* Prioritize button (only for upcoming leads) */}
              {i > currentIndex && (
                <button
                  onClick={() => onPrioritize(i)}
                  title="Move to next"
                  className="text-muted hover:text-accent transition-colors shrink-0 p-1 rounded hover:bg-accent/10"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="18 15 12 9 6 15" />
                  </svg>
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Active Lead Panel ─────────────────────────────────────────────────────────
function ActiveLeadPanel({ lead, callState }) {
  if (!lead) return (
    <div className="bg-surface-raised rounded-xl border border-white/8 flex items-center justify-center h-full py-20">
      <p className="text-muted text-sm">Queue complete — no more leads</p>
    </div>
  )

  return (
    <div className="bg-surface-raised rounded-xl border border-white/8 overflow-hidden">
      {/* Lead header */}
      <div className={`px-5 py-5 border-b border-white/8 ${callState === 'active' ? 'bg-accent/5' : ''}`}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-ink text-lg font-bold leading-tight">{lead.customer_name}</p>
            <p className="text-muted font-mono text-sm mt-1">{lead.contact_number}</p>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <TempPill temperature={lead.temperature} />
            <span className="text-muted text-xs bg-white/5 px-2 py-0.5 rounded-full">
              Attempt {lead.attempt_count + 1}
            </span>
          </div>
        </div>
      </div>

      {/* Member details */}
      <div className="px-5 py-1">
        <DetailRow label="Campaign"    value={lead.campaign_name} />
        <DetailRow label="Product"     value={lead.product} />
        <DetailRow label="Address"     value={lead.address} />
        <DetailRow label="Zone"        value={lead.zone} />
        <DetailRow label="Branch"      value={lead.branch} />
        <DetailRow label="Email"       value={lead.email} />
        <DetailRow label="Source"      value={lead.leads_generated_by} />
        <DetailRow label="Past Calls"  value={lead.attempt_count > 0 ? `${lead.attempt_count} previous attempt${lead.attempt_count !== 1 ? 's' : ''}` : 'First contact'} />
        {lead.next_followup_date && (
          <DetailRow
            label="Follow-up"
            value={new Date(lead.next_followup_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
          />
        )}
      </div>
    </div>
  )
}

// ── Disposition Flow ──────────────────────────────────────────────────────────
const OUTCOME_OPTIONS = [
  { value: 'converted',   label: 'Converted',   activeClass: 'bg-success/10 text-success' },
  { value: 'in_progress', label: 'In Progress',  activeClass: 'bg-accent/10 text-accent' },
  { value: 'lost',        label: 'Lost',         activeClass: 'bg-danger/10 text-danger' },
]

const TEMP_OPTIONS = [
  { value: 'hot',  label: '🔴 Hot',  activeClass: 'bg-danger/10 text-danger' },
  { value: 'warm', label: '🟡 Warm', activeClass: 'bg-warning/10 text-warning' },
  { value: 'cold', label: '🔵 Cold', activeClass: 'bg-teal/10 text-teal' },
]

const PRODUCTS = ['3x30', '4x40', '5x25', 'Other']

const NOT_CONNECTED_REASONS = [
  { value: 'switched_off',   label: 'Phone Switched Off' },
  { value: 'rejected',       label: 'Call Rejected' },
  { value: 'out_of_coverage',label: 'Out of Coverage' },
  { value: 'no_answer',      label: 'No Answer' },
  { value: 'busy',           label: 'Line Busy' },
]

function DispositionFlow({ lead, disp, setDispField, onRedial, onSubmit }) {
  // Validation: need at minimum a reason (not-connected) or outcome (connected)
  const canSubmit = disp.connected === false
    ? !!disp.reason
    : disp.connected === true
    ? !!disp.outcome
    : false

  return (
    <div className="bg-surface-raised rounded-xl border border-white/8 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-white/8 flex items-center justify-between">
        <div>
          <h3 className="text-ink font-semibold text-sm">Disposition — {lead?.customer_name}</h3>
          <p className="text-muted text-xs mt-0.5">Log the outcome of this call</p>
        </div>
        <span className="text-muted font-mono text-xs bg-white/5 px-2.5 py-1 rounded-full">
          {lead?.contact_number}
        </span>
      </div>

      <div className="px-5 py-5 space-y-6">
        {/* Step 1: Was the call connected? */}
        <div>
          <p className="text-muted text-xs font-semibold uppercase tracking-wider mb-3">
            Was the call connected?
          </p>
          <div className="flex flex-wrap gap-2">
            {/* Redial */}
            <button
              onClick={onRedial}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-white/5 border border-white/8 text-muted hover:text-ink hover:border-white/20 transition-colors"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
              </svg>
              Redial
            </button>

            {/* Not connected */}
            <button
              onClick={() => setDispField('connected', false)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border transition-colors ${
                disp.connected === false
                  ? 'bg-danger/10 text-danger border-danger/25'
                  : 'text-muted border-white/8 hover:text-danger hover:border-danger/20'
              }`}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
              Not Connected
            </button>

            {/* Yes connected */}
            <button
              onClick={() => setDispField('connected', true)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border transition-colors ${
                disp.connected === true
                  ? 'bg-success/10 text-success border-success/25'
                  : 'text-muted border-white/8 hover:text-success hover:border-success/20'
              }`}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Yes, Connected
            </button>
          </div>
        </div>

        {/* Step 2a: Not connected — reason */}
        {disp.connected === false && (
          <div className="space-y-4">
            <div>
              <label className="block text-muted text-xs font-semibold uppercase tracking-wider mb-2">
                Reason
              </label>
              <div className="relative">
                <select
                  value={disp.reason}
                  onChange={e => setDispField('reason', e.target.value)}
                  className="w-full appearance-none bg-surface border border-white/8 text-ink text-sm rounded-lg pl-3 pr-8 py-2.5 focus:outline-none focus:border-accent/40 transition-colors cursor-pointer"
                >
                  <option value="">Select a reason…</option>
                  {NOT_CONNECTED_REASONS.map(r => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-muted">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2b: Connected — outcome form */}
        {disp.connected === true && (
          <div className="space-y-5">
            {/* Outcome */}
            <div>
              <label className="block text-muted text-xs font-semibold uppercase tracking-wider mb-2">
                Outcome <span className="text-danger">*</span>
              </label>
              <ButtonGroup
                options={OUTCOME_OPTIONS}
                value={disp.outcome}
                onChange={v => setDispField('outcome', v)}
              />
            </div>

            {/* Temperature */}
            <div>
              <label className="block text-muted text-xs font-semibold uppercase tracking-wider mb-2">
                Lead Temperature
              </label>
              <ButtonGroup
                options={TEMP_OPTIONS}
                value={disp.temperature}
                onChange={v => setDispField('temperature', v)}
              />
            </div>

            {/* Product + follow-up date in a row */}
            <div className="flex gap-4">
              {/* Product */}
              <div className="flex-1">
                <label className="block text-muted text-xs font-semibold uppercase tracking-wider mb-2">
                  Product
                </label>
                <div className="relative">
                  <select
                    value={disp.product}
                    onChange={e => setDispField('product', e.target.value)}
                    className="w-full appearance-none bg-surface border border-white/8 text-ink text-sm rounded-lg pl-3 pr-8 py-2.5 focus:outline-none focus:border-accent/40 transition-colors cursor-pointer"
                  >
                    <option value="">Select product…</option>
                    {PRODUCTS.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-muted">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Follow-up date */}
              <div className="flex-1">
                <label className="block text-muted text-xs font-semibold uppercase tracking-wider mb-2">
                  Next Follow-up
                </label>
                <input
                  type="date"
                  value={disp.followupDate}
                  onChange={e => setDispField('followupDate', e.target.value)}
                  className="w-full bg-surface border border-white/8 text-ink text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-accent/40 transition-colors"
                />
              </div>
            </div>
          </div>
        )}

        {/* Submit */}
        {disp.connected !== null && (
          <div className="flex items-center justify-between pt-2 border-t border-white/8">
            <p className="text-muted text-xs">
              {canSubmit ? 'Ready to submit — this will advance to the next lead.' : 'Fill in the required fields above.'}
            </p>
            <button
              onClick={onSubmit}
              disabled={!canSubmit}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent hover:bg-accent/90 text-white text-sm font-semibold transition-colors disabled:opacity-30 disabled:cursor-not-allowed shadow-lg shadow-accent/20"
            >
              Submit &amp; Next
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function Dialer() {
  const [agent, setAgent]           = useState(null)
  const [queue, setQueue]           = useState([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [callState, setCallState]   = useState('idle')  // 'idle' | 'active' | 'ended'
  const [callTimer, setCallTimer]   = useState(0)
  const [onBreak, setOnBreak]       = useState(false)
  const [disp, setDisp]             = useState({
    connected: null, outcome: '', reason: '', temperature: '', product: '', followupDate: '',
  })

  const setDispField = (key, val) => setDisp(prev => ({ ...prev, [key]: val }))

  // Load agent (first agent with role "agent") and their active leads
  useEffect(() => {
    const load = async () => {
      try {
        const agents = await getAgents()
        const picked = agents.find(a => a.role === 'agent') ?? agents[0]
        setAgent(picked)
        const leads = await getLeads({ agent_id: picked.id, status: 'active' })
        setQueue(leads)
      } catch {
        setError('Could not load dialer data. Make sure the backend is running on port 8000.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  // Tick the call timer every second while a call is active
  useEffect(() => {
    if (callState !== 'active') return
    const id = setInterval(() => setCallTimer(t => t + 1), 1000)
    return () => clearInterval(id)
  }, [callState])

  const currentLead = queue[currentIndex] ?? null

  const handleStart = () => {
    if (!currentLead || onBreak) return
    setCallState('active')
    setCallTimer(0)
  }

  const handleEnd = () => {
    setCallState('ended')
    setDisp({ connected: null, outcome: '', reason: '', temperature: '', product: '', followupDate: '' })
  }

  const handleRedial = () => {
    setCallState('active')
    setCallTimer(0)
    setDisp(prev => ({ ...prev, connected: null }))
  }

  const handleSubmit = () => {
    console.log('Disposition:', { lead: currentLead, ...disp })
    setCurrentIndex(i => i + 1)
    setCallState('idle')
    setCallTimer(0)
    setDisp({ connected: null, outcome: '', reason: '', temperature: '', product: '', followupDate: '' })
  }

  // Move lead at `index` to just after the current lead (next to be called)
  const handlePrioritize = (index) => {
    if (index <= currentIndex) return
    setQueue(prev => {
      const next = [...prev]
      const [lead] = next.splice(index, 1)
      next.splice(currentIndex + 1, 0, lead)
      return next
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <p className="text-muted text-sm animate-pulse">Loading dialer…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-danger/25 bg-danger/8 px-4 py-3 text-danger text-sm">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
          <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        {error}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 min-h-0">
      {/* Call control bar */}
      <CallControlBar
        agent={agent}
        lead={currentLead}
        callState={callState}
        callTimer={callTimer}
        onBreak={onBreak}
        onToggleBreak={() => setOnBreak(b => !b)}
        onStart={handleStart}
        onEnd={handleEnd}
      />

      {/* Body */}
      {queue.length === 0 ? (
        <div className="bg-surface-raised rounded-xl border border-white/8 py-20 text-center">
          <svg className="mx-auto mb-3 text-muted/30" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 3.07 9.8 19.79 19.79 0 0 1 0 1.17 2 2 0 0 1 2 0h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L6.91 7.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
          </svg>
          <p className="text-muted text-sm font-medium">No active leads in queue</p>
          <p className="text-muted/60 text-xs mt-1">Leads are assigned from the Leads page</p>
        </div>
      ) : (
        <div className="flex gap-4">
          {/* Left: call queue */}
          <div className="w-2/5 shrink-0">
            <CallQueue
              queue={queue}
              currentIndex={currentIndex}
              onPrioritize={handlePrioritize}
            />
          </div>

          {/* Right: lead detail or disposition */}
          <div className="flex-1 min-w-0">
            {callState === 'ended' ? (
              <DispositionFlow
                lead={currentLead}
                disp={disp}
                setDispField={setDispField}
                onRedial={handleRedial}
                onSubmit={handleSubmit}
              />
            ) : (
              <ActiveLeadPanel lead={currentLead} callState={callState} />
            )}
          </div>
        </div>
      )}
    </div>
  )
}
