import { useEffect, useRef, useState } from 'react'
import { createDisposition, getAgents, getLeads } from '../api'
import Toast from '../components/Toast'

// ── Constants ─────────────────────────────────────────────────────────────────

// Chit-fund / real-estate themed call exchange, one line appended every 10 s
const TRANSCRIPT_LINES = [
  { speaker: 'Agent',    text: 'Good morning! Am I speaking with the customer?' },
  { speaker: 'Customer', text: 'Yes, speaking. Who is this?' },
  { speaker: 'Agent',    text: 'This is Karthik from Nexus Finance regarding chit fund schemes you enquired about.' },
  { speaker: 'Customer', text: 'Oh yes, I did fill a form online last week.' },
  { speaker: 'Agent',    text: 'We have a popular 3×30 scheme — ₹30,000 per month for 30 months with a prize pool of 9 lakhs.' },
  { speaker: 'Customer', text: 'What is the interest rate? And how does the monthly draw work?' },
  { speaker: 'Agent',    text: 'Fully registered under the Chit Funds Act. The auction happens monthly — transparent and government-certified.' },
  { speaker: 'Customer', text: 'Can my wife also be a co-applicant? We prefer a joint arrangement.' },
  { speaker: 'Agent',    text: 'Absolutely — joint applications are welcome. Shall I send the full brochure on WhatsApp right now?' },
  { speaker: 'Customer', text: 'Yes please send it. I will discuss with family and call back.' },
]

// Suggestion changes as transcript progresses (reverse-searched for the highest matching minLines)
const ASSIST_SUGGESTIONS = [
  { minLines: 0, text: 'Confirm the customer\'s identity and introduce yourself clearly.' },
  { minLines: 2, text: 'Customer is engaged — present the scheme highlights and prize pool.' },
  { minLines: 4, text: 'Mention Chit Funds Act registration to build trust. Address concerns proactively.' },
  { minLines: 6, text: 'Customer is asking detailed questions — this is a warm signal. Stay patient.' },
  { minLines: 7, text: 'Co-applicant interest detected — highlight joint application benefits and simplified KYC.' },
  { minLines: 8, text: 'Strong close signal — send WhatsApp brochure now while on call.' },
  { minLines: 9, text: 'Customer wants to discuss with family. Lock in a callback date before ending.' },
]

const AI_DISP = {
  outcome: 'in_progress',
  temperature: 'hot',
  followupDate: '2026-06-18',
  confidence: 87,
  insight: 'Customer asked about co-applicant options and pricing — strong engagement, likely to convert.',
}

const SKIP_REASONS = [
  { value: 'try_tomorrow', label: 'Try Tomorrow' },
  { value: 'busy',         label: 'Customer Busy' },
  { value: 'wrong_time',   label: 'Wrong Time of Day' },
]

const OUTCOME_OPTIONS = [
  { value: 'converted',   label: 'Converted',   activeClass: 'bg-success/10 text-success' },
  { value: 'in_progress', label: 'In Progress',  activeClass: 'bg-accent/10 text-accent' },
  { value: 'lost',        label: 'Lost',         activeClass: 'bg-danger/10 text-danger' },
]

const TEMP_OPTIONS = [
  { value: 'hot',  label: 'Hot',  activeClass: 'bg-danger/10 text-danger' },
  { value: 'warm', label: 'Warm', activeClass: 'bg-warning/10 text-warning' },
  { value: 'cold', label: 'Cold', activeClass: 'bg-teal/10 text-teal' },
]

const PRODUCTS = ['3x30', '4x40', '5x25', 'Other']

const NOT_CONNECTED_REASONS = [
  { value: 'switched_off',    label: 'Phone Switched Off' },
  { value: 'rejected',        label: 'Call Rejected' },
  { value: 'out_of_coverage', label: 'Out of Coverage' },
  { value: 'no_answer',       label: 'No Answer' },
  { value: 'busy',            label: 'Line Busy' },
]

// ── Utilities & shared display ────────────────────────────────────────────────

const TEMP_STYLE = {
  hot:  'bg-danger/10 text-danger',
  warm: 'bg-warning/10 text-warning',
  cold: 'bg-teal/10 text-teal',
}

function fmtTime(secs) {
  return `${String(Math.floor(secs / 60)).padStart(2, '0')}:${String(secs % 60).padStart(2, '0')}`
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

function DetailRow({ label, value }) {
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-white/5 last:border-0">
      <span className="text-muted text-[11px] font-semibold uppercase tracking-wider w-28 shrink-0 pt-0.5">{label}</span>
      <span className="text-ink text-sm">{value ?? <span className="text-white/20">—</span>}</span>
    </div>
  )
}

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

// Reusable styled native select — avoids repeating the chevron SVG everywhere
function SelectField({ value, onChange, children, focusColor = 'accent' }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={onChange}
        className={`w-full appearance-none bg-surface border border-white/8 text-ink text-sm rounded-lg pl-3 pr-8 py-2.5 focus:outline-none focus:border-${focusColor}/40 transition-colors cursor-pointer`}
      >
        {children}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-muted">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>
    </div>
  )
}

// ── AI Feature Components ─────────────────────────────────────────────────────

// Animated waveform bars + rolling sentiment score, re-randomized every 3 s via parent effect
function SentimentAnalysis({ bars, score, isActive }) {
  const scoreColor = score > 65 ? 'text-success' : score > 45 ? 'text-warning' : 'text-danger'
  const label      = score > 65 ? 'Positive' : score > 45 ? 'Neutral' : 'Negative'

  return (
    <div className="bg-surface-raised rounded-xl border border-white/8 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-muted text-[11px] font-semibold uppercase tracking-wider">AI Sentiment</span>
          {isActive && (
            <span className="inline-flex items-center gap-1 text-[10px] text-success bg-success/10 px-1.5 py-0.5 rounded-full font-medium">
              <span className="w-1 h-1 rounded-full bg-success animate-pulse" />
              Live
            </span>
          )}
        </div>
        <span className={`text-xs font-semibold tabular-nums ${scoreColor}`}>
          {label} · {score}%
        </span>
      </div>

      {/* Waveform — CSS transition makes height changes animate smoothly */}
      <div className="flex items-end gap-0.75 h-10">
        {bars.map((h, i) => {
          const c = h > 0.62 ? 'bg-success' : h > 0.38 ? 'bg-warning' : 'bg-danger'
          return (
            <div
              key={i}
              className={`flex-1 rounded-sm transition-all duration-700 ease-in-out ${c}`}
              style={{ height: `${Math.round(h * 100)}%`, opacity: isActive ? 0.65 + h * 0.35 : 0.25 }}
            />
          )
        })}
      </div>
      <div className="flex justify-between mt-1.5">
        <span className="text-muted/50 text-[10px]">Negative</span>
        <span className="text-muted/50 text-[10px]">Positive</span>
      </div>
    </div>
  )
}

// Scrollable transcript — manages its own ref so parent doesn't need one
function LiveTranscript({ lines }) {
  const containerRef = useRef(null)

  // Auto-scroll to newest line whenever lines array grows
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
  }, [lines.length])

  return (
    <div className="bg-surface-raised rounded-xl border border-white/8 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/8">
        <span className="text-muted text-[11px] font-semibold uppercase tracking-wider">Live Transcript</span>
        <span className="inline-flex items-center gap-1.5 text-[10px] text-accent bg-accent/10 px-2 py-0.5 rounded-full font-medium">
          <span className="w-1 h-1 rounded-full bg-accent animate-pulse" />
          Auto-transcribing
        </span>
      </div>
      <div ref={containerRef} className="h-36 overflow-y-auto px-4 py-3 space-y-2.5 scroll-smooth">
        {lines.length === 0 ? (
          <p className="text-muted/40 text-xs italic">Transcript will appear here once transcription begins…</p>
        ) : (
          lines.map((line, i) => (
            <div key={i} className="flex gap-2.5">
              <span className={`text-[10px] font-bold uppercase tracking-wide shrink-0 w-16 pt-0.5 ${
                line.speaker === 'Agent' ? 'text-accent' : 'text-teal'
              }`}>
                {line.speaker}
              </span>
              <span className="text-ink/80 text-xs leading-relaxed">{line.text}</span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

// AI suggestion derived from how many transcript lines have appeared
function CallAssist({ transcriptLength }) {
  const suggestion = [...ASSIST_SUGGESTIONS]
    .reverse()
    .find(s => transcriptLength >= s.minLines) ?? ASSIST_SUGGESTIONS[0]

  return (
    <div className="bg-success/5 border border-success/15 rounded-xl p-4">
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2">
          {/* Sparkle-style icon */}
          <svg className="text-success" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2l2.09 6.26L20 10l-5.91 1.74L12 18l-2.09-6.26L4 10l5.91-1.74L12 2z" />
            <path d="M19 15l.94 2.06L22 18l-2.06.94L19 21l-.94-2.06L16 18l2.06-.94L19 15z" />
          </svg>
          <span className="text-success text-[11px] font-semibold uppercase tracking-wider">Call Assist</span>
        </div>
        <span className="inline-flex items-center gap-1.5 text-[10px] text-success bg-success/10 px-2 py-0.5 rounded-full font-medium">
          <span className="w-1 h-1 rounded-full bg-success animate-pulse" />
          AI is listening
        </span>
      </div>
      <p className="text-ink/90 text-sm leading-relaxed">{suggestion.text}</p>
    </div>
  )
}

// WhatsApp free-text panel — pre-fills a personalized message
function WhatsAppPanel({ lead, onClose }) {
  const firstName = lead?.customer_name?.split(' ')[0] ?? 'there'
  const product   = lead?.product ?? '3x30'
  const [message, setMessage] = useState(
    `Hi ${firstName},\n\nThank you for your time today. As discussed, please find below our ${product} scheme details.\n\nOur ${product} chit fund offers a prize pool of ₹9 Lakhs, fully registered under the Chit Funds Act. Monthly instalment and transparent auction process.\n\nFeel free to call us back with any questions.\n\nBest regards,\nNexus Finance Team`
  )

  return (
    <div className="bg-surface-raised rounded-xl border border-success/20 p-5">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <svg className="text-success" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          <span className="text-success text-sm font-semibold">WhatsApp — {lead?.customer_name}</span>
        </div>
        <button onClick={onClose} className="text-muted hover:text-ink p-1 rounded-lg hover:bg-white/5 transition-colors">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
      <p className="text-muted font-mono text-xs mb-3">{lead?.contact_number}</p>
      <textarea
        value={message}
        onChange={e => setMessage(e.target.value)}
        rows={6}
        className="w-full bg-surface border border-white/8 text-ink text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-success/40 resize-none transition-colors"
      />
      <div className="flex justify-end gap-2 mt-3">
        <button onClick={onClose} className="px-3 py-1.5 text-sm text-muted hover:text-ink hover:bg-white/5 rounded-lg transition-colors">
          Cancel
        </button>
        <button className="flex items-center gap-2 px-4 py-1.5 bg-success/10 border border-success/25 text-success text-sm font-semibold rounded-lg hover:bg-success/15 transition-colors">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
          Send via WhatsApp
        </button>
      </div>
    </div>
  )
}

// AI-generated disposition suggestion shown at the top of the disposition flow
function AIDispositionSuggestion({ onAccept }) {
  return (
    <div className="bg-accent/5 border border-accent/15 rounded-xl p-4">
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2">
          <svg className="text-accent" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2l2.09 6.26L20 10l-5.91 1.74L12 18l-2.09-6.26L4 10l5.91-1.74L12 2z" />
          </svg>
          <span className="text-accent text-[11px] font-semibold uppercase tracking-wider">AI Suggestion</span>
        </div>
        <span className="text-muted/60 text-[10px] bg-white/5 px-2 py-0.5 rounded-full">
          {AI_DISP.confidence}% confidence
        </span>
      </div>
      <div className="flex flex-wrap gap-2 mb-2.5">
        <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-accent/10 text-accent">In Progress</span>
        <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-danger/10 text-danger">Hot</span>
        <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-white/5 text-muted">
          Follow-up: 18 Jun 2026
        </span>
      </div>
      <p className="text-muted text-xs mb-3 leading-relaxed">"{AI_DISP.insight}"</p>
      <button
        onClick={onAccept}
        className="w-full py-2 text-sm font-semibold text-accent border border-accent/25 rounded-lg hover:bg-accent/10 transition-colors"
      >
        Accept AI Suggestion
      </button>
    </div>
  )
}

// Skip lead panel — owns its own reason/callback state
function SkipPanel({ onClose, onSkip }) {
  const [reason, setReason]     = useState('')
  const [callback, setCallback] = useState('')

  return (
    <div className="bg-surface-raised rounded-xl border border-white/8 p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-ink text-sm font-semibold">Skip This Lead</p>
          <p className="text-muted text-xs mt-0.5">The lead will stay in queue and re-surface later</p>
        </div>
        <button onClick={onClose} className="text-muted hover:text-ink p-1 rounded-lg hover:bg-white/5 transition-colors">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
      <div className="flex gap-4 mb-4">
        <div className="flex-1">
          <label className="block text-muted text-[11px] font-semibold uppercase tracking-wider mb-1.5">Reason</label>
          <SelectField value={reason} onChange={e => setReason(e.target.value)}>
            <option value="">Select reason…</option>
            {SKIP_REASONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
          </SelectField>
        </div>
        <div className="flex-1">
          <label className="block text-muted text-[11px] font-semibold uppercase tracking-wider mb-1.5">Callback Date/Time</label>
          <input
            type="datetime-local"
            value={callback}
            onChange={e => setCallback(e.target.value)}
            className="w-full bg-surface border border-white/8 text-ink text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-accent/40 transition-colors"
          />
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <button onClick={onClose} className="px-3 py-1.5 text-sm text-muted hover:text-ink hover:bg-white/5 rounded-lg transition-colors">
          Cancel
        </button>
        <button
          onClick={() => reason && onSkip({ reason, callback })}
          disabled={!reason}
          className="flex items-center gap-2 px-4 py-1.5 bg-warning/10 border border-warning/25 text-warning text-sm font-semibold rounded-lg hover:bg-warning/15 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Skip &amp; Next
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="13 17 18 12 13 7" /><polyline points="6 17 11 12 6 7" />
          </svg>
        </button>
      </div>
    </div>
  )
}

// ── Core Components ───────────────────────────────────────────────────────────

function CallQualityIndicator() {
  return (
    <div className="flex items-center gap-2 shrink-0">
      <div className="flex items-end gap-0.5 h-3.5">
        {[0.3, 0.55, 0.75, 1].map((h, i) => (
          <div
            key={i}
            className={`w-0.75 rounded-sm ${i < 3 ? 'bg-success' : 'bg-success/25'}`}
            style={{ height: `${h * 100}%` }}
          />
        ))}
      </div>
      <div className="leading-none">
        <p className="text-success text-[11px] font-semibold leading-none">Strong</p>
        <div className="flex items-center gap-1 mt-0.75">
          <span className="w-1.5 h-1.5 rounded-full bg-danger animate-pulse" />
          <p className="text-muted text-[10px] leading-none">Rec. active</p>
        </div>
      </div>
    </div>
  )
}

function CallControlBar({
  agent, lead, callState, callTimer, onBreak, onToggleBreak, onStart, onEnd,
  onWhatsapp, whatsappOpen,
}) {
  const isActive = callState === 'active'
  const isEnded  = callState === 'ended'

  return (
    <div className="bg-surface-raised rounded-xl border border-white/8 px-5 py-4 flex items-center gap-5">
      {/* Agent info */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-9 h-9 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center shrink-0">
          <span className="text-accent text-xs font-bold">
            {agent?.name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </span>
        </div>
        <div className="min-w-0">
          <p className="text-ink text-sm font-semibold leading-tight truncate">{agent?.name}</p>
          <p className="text-muted text-xs">{agent?.branch} · {agent?.zone}</p>
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

      <div className="h-10 w-px bg-white/8 shrink-0" />

      {/* Live call area */}
      <div className="flex-1 flex items-center justify-center gap-4">
        {isActive ? (
          <>
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-60" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-success" />
            </span>
            <div className="text-center">
              <p className="text-ink font-semibold text-sm leading-tight">{lead?.customer_name}</p>
              <p className="text-muted font-mono text-xs">{lead?.contact_number}</p>
            </div>
            <div className="bg-success/10 border border-success/20 rounded-lg px-4 py-1.5">
              <p className="text-success font-mono text-lg font-bold leading-none tracking-wider">
                {fmtTime(callTimer)}
              </p>
            </div>
          </>
        ) : isEnded ? (
          <p className="text-warning text-sm font-medium">Disposition pending — {lead?.customer_name}</p>
        ) : (
          <p className="text-muted text-sm">{lead ? `Ready to call ${lead.customer_name}` : 'No leads in queue'}</p>
        )}
      </div>

      <div className="h-10 w-px bg-white/8 shrink-0" />

      {/* Quality + WA + total + action */}
      <div className="flex items-center gap-4 shrink-0">
        <CallQualityIndicator />

        {/* WhatsApp toggle */}
        <button
          onClick={onWhatsapp}
          disabled={!lead}
          title="Send WhatsApp message"
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors disabled:opacity-25 disabled:cursor-not-allowed ${
            whatsappOpen
              ? 'bg-success/10 text-success border-success/25'
              : 'text-muted border-white/8 hover:text-success hover:border-success/20'
          }`}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          WA
        </button>

        <div className="h-8 w-px bg-white/8" />

        <div className="text-right">
          <p className="text-muted text-[10px] uppercase tracking-wider font-semibold">Today</p>
          <p className="text-ink font-mono text-sm font-semibold">01:05:01</p>
        </div>

        {isActive ? (
          <button
            onClick={onEnd}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-danger/10 border border-danger/25 text-danger text-sm font-semibold hover:bg-danger/15 transition-colors"
          >
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
                isCurrent ? 'bg-accent/8 border-l-2 border-l-accent' : isDone ? 'opacity-35' : 'hover:bg-white/3'
              }`}
            >
              <span className={`text-xs font-bold tabular-nums w-5 shrink-0 ${isCurrent ? 'text-accent' : 'text-muted'}`}>
                {isDone ? '✓' : i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium truncate leading-tight ${isCurrent ? 'text-ink' : isDone ? 'text-muted' : 'text-ink/80'}`}>
                  {lead.customer_name}
                </p>
                <p className="text-muted text-xs truncate mt-0.5">{lead.campaign_name || '—'}</p>
              </div>
              <TempPill temperature={lead.temperature} />
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

function ActiveLeadPanel({ lead, callState }) {
  if (!lead) return (
    <div className="bg-surface-raised rounded-xl border border-white/8 flex items-center justify-center py-20">
      <p className="text-muted text-sm">Queue complete — no more leads</p>
    </div>
  )
  return (
    <div className="bg-surface-raised rounded-xl border border-white/8 overflow-hidden">
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
      <div className="px-5 py-1">
        <DetailRow label="Campaign"   value={lead.campaign_name} />
        <DetailRow label="Product"    value={lead.product} />
        <DetailRow label="Address"    value={lead.address} />
        <DetailRow label="Zone"       value={lead.zone} />
        <DetailRow label="Branch"     value={lead.branch} />
        <DetailRow label="Email"      value={lead.email} />
        <DetailRow label="Source"     value={lead.leads_generated_by} />
        <DetailRow label="Past Calls" value={lead.attempt_count > 0 ? `${lead.attempt_count} previous attempt${lead.attempt_count !== 1 ? 's' : ''}` : 'First contact'} />
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

function DispositionFlow({ lead, disp, setDispField, onRedial, onSubmit, onOpenSkip, submitting = false }) {
  const canSubmit = disp.connected === false ? !!disp.reason : disp.connected === true ? !!disp.outcome : false

  return (
    <div className="bg-surface-raised rounded-xl border border-white/8 overflow-hidden">
      <div className="px-5 py-4 border-b border-white/8 flex items-center justify-between">
        <div>
          <h3 className="text-ink font-semibold text-sm">Disposition — {lead?.customer_name}</h3>
          <p className="text-muted text-xs mt-0.5">Log the outcome of this call</p>
        </div>
        <span className="text-muted font-mono text-xs bg-white/5 px-2.5 py-1 rounded-full">{lead?.contact_number}</span>
      </div>

      <div className="px-5 py-5 space-y-6">
        {/* Connection question */}
        <div>
          <p className="text-muted text-xs font-semibold uppercase tracking-wider mb-3">Was the call connected?</p>
          <div className="flex flex-wrap gap-2">
            <button onClick={onRedial} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-white/5 border border-white/8 text-muted hover:text-ink hover:border-white/20 transition-colors">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
              </svg>
              Redial
            </button>
            <button
              onClick={() => setDispField('connected', false)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border transition-colors ${disp.connected === false ? 'bg-danger/10 text-danger border-danger/25' : 'text-muted border-white/8 hover:text-danger hover:border-danger/20'}`}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
              Not Connected
            </button>
            <button
              onClick={() => setDispField('connected', true)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border transition-colors ${disp.connected === true ? 'bg-success/10 text-success border-success/25' : 'text-muted border-white/8 hover:text-success hover:border-success/20'}`}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Yes, Connected
            </button>
          </div>
        </div>

        {/* Not connected — reason */}
        {disp.connected === false && (
          <div>
            <label className="block text-muted text-xs font-semibold uppercase tracking-wider mb-2">Reason</label>
            <SelectField value={disp.reason} onChange={e => setDispField('reason', e.target.value)}>
              <option value="">Select a reason…</option>
              {NOT_CONNECTED_REASONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
            </SelectField>
          </div>
        )}

        {/* Connected — outcome form */}
        {disp.connected === true && (
          <div className="space-y-5">
            <div>
              <label className="block text-muted text-xs font-semibold uppercase tracking-wider mb-2">
                Outcome <span className="text-danger">*</span>
              </label>
              <ButtonGroup options={OUTCOME_OPTIONS} value={disp.outcome} onChange={v => setDispField('outcome', v)} />
            </div>
            <div>
              <label className="block text-muted text-xs font-semibold uppercase tracking-wider mb-2">Lead Temperature</label>
              <ButtonGroup options={TEMP_OPTIONS} value={disp.temperature} onChange={v => setDispField('temperature', v)} />
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-muted text-xs font-semibold uppercase tracking-wider mb-2">Product</label>
                <SelectField value={disp.product} onChange={e => setDispField('product', e.target.value)}>
                  <option value="">Select product…</option>
                  {PRODUCTS.map(p => <option key={p} value={p}>{p}</option>)}
                </SelectField>
              </div>
              <div className="flex-1">
                <label className="block text-muted text-xs font-semibold uppercase tracking-wider mb-2">Next Follow-up</label>
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

        {/* Submit row */}
        {disp.connected !== null && (
          <div className="flex items-center justify-between pt-2 border-t border-white/8">
            <button
              onClick={onOpenSkip}
              className="text-muted text-xs hover:text-warning transition-colors"
            >
              ↪ Skip this lead instead
            </button>
            <button
              onClick={onSubmit}
              disabled={!canSubmit || submitting}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent hover:bg-accent/90 text-white text-sm font-semibold transition-colors disabled:opacity-30 disabled:cursor-not-allowed shadow-lg shadow-accent/20"
            >
              {submitting ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving…
                </>
              ) : (
                <>
                  Submit &amp; Next
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                  </svg>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function Dialer() {
  // Core state
  const [agent, setAgent]                   = useState(null)
  const [queue, setQueue]                   = useState([])
  const [loading, setLoading]               = useState(true)
  const [error, setError]                   = useState(null)
  const [currentIndex, setCurrentIndex]     = useState(0)
  const [callState, setCallState]           = useState('idle')
  const [callTimer, setCallTimer]           = useState(0)
  const [onBreak, setOnBreak]               = useState(false)
  const [disp, setDisp]                     = useState({
    connected: null, outcome: '', reason: '', temperature: '', product: '', followupDate: '',
  })

  // AI feature state
  const [sentimentBars, setSentimentBars]   = useState(() =>
    Array.from({ length: 10 }, () => Math.random() * 0.6 + 0.3)
  )
  const [sentimentScore, setSentimentScore] = useState(72)
  const [transcript, setTranscript]         = useState([])
  const [whatsappOpen, setWhatsappOpen]     = useState(false)
  const [skipOpen, setSkipOpen]             = useState(false)
  const [submitting, setSubmitting]         = useState(false)
  const [toast, setToast]                   = useState(null)

  const setDispField = (key, val) => setDisp(prev => ({ ...prev, [key]: val }))
  const resetDisp    = () => setDisp({ connected: null, outcome: '', reason: '', temperature: '', product: '', followupDate: '' })

  // Load agent + their active leads
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

  // Call timer — 1 s tick while active
  useEffect(() => {
    if (callState !== 'active') return
    const id = setInterval(() => setCallTimer(t => t + 1), 1000)
    return () => clearInterval(id)
  }, [callState])

  // Sentiment bars — re-randomize every 3 s during active call; cleanup on state change or unmount
  useEffect(() => {
    if (callState !== 'active') return
    const id = setInterval(() => {
      setSentimentScore(prev => Math.min(99, Math.max(40, prev + Math.round(Math.random() * 16 - 8))))
      setSentimentBars(Array.from({ length: 10 }, () => Math.random() * 0.65 + 0.25))
    }, 3000)
    return () => clearInterval(id)
  }, [callState])

  // Transcript — append one line every 10 s during active call
  useEffect(() => {
    if (callState !== 'active') return
    const id = setInterval(() => {
      setTranscript(prev => prev.length >= TRANSCRIPT_LINES.length ? prev : [...prev, TRANSCRIPT_LINES[prev.length]])
    }, 10000)
    return () => clearInterval(id)
  }, [callState])

  const currentLead = queue[currentIndex] ?? null

  const handleStart = () => {
    if (!currentLead || onBreak) return
    setCallState('active')
    setCallTimer(0)
    setTranscript([])
    setSentimentScore(72)
    setSentimentBars(Array.from({ length: 10 }, () => Math.random() * 0.6 + 0.3))
  }

  const handleEnd = () => { setCallState('ended'); resetDisp() }

  const handleRedial = () => {
    setCallState('active')
    setCallTimer(0)
    setDisp(prev => ({ ...prev, connected: null }))
  }

  const handleSubmit = async () => {
    if (!currentLead || submitting) return
    setSubmitting(true)
    try {
      await createDisposition({
        lead_id:           currentLead.id,
        agent_id:          agent?.id ?? null,
        call_connected:    disp.connected,
        outcome:           disp.outcome    || null,
        temperature:       disp.temperature || null,
        product:           disp.product    || null,
        reason:            disp.reason     || null,
        next_followup_date: disp.followupDate || null,
      })
      setToast({ type: 'success', message: 'Disposition saved — lead updated' })
      advance()
    } catch (err) {
      setToast({
        type: 'error',
        message: err?.response?.data?.detail ?? 'Failed to save disposition',
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleAcceptAI = () => {
    setDispField('connected', true)
    setDispField('outcome', AI_DISP.outcome)
    setDispField('temperature', AI_DISP.temperature)
    setDispField('followupDate', AI_DISP.followupDate)
  }

  const handleSkip = ({ reason, callback }) => {
    console.log('Skip lead:', { lead: currentLead, reason, callback })
    setSkipOpen(false)
    advance()
  }

  const advance = () => {
    setCurrentIndex(i => i + 1)
    setCallState('idle')
    setCallTimer(0)
    setTranscript([])
    resetDisp()
    setWhatsappOpen(false)
    setSkipOpen(false)
  }

  const handlePrioritize = (index) => {
    if (index <= currentIndex) return
    setQueue(prev => {
      const next = [...prev]
      const [lead] = next.splice(index, 1)
      next.splice(currentIndex + 1, 0, lead)
      return next
    })
  }

  if (loading) return (
    <div className="flex items-center justify-center h-48">
      <p className="text-muted text-sm animate-pulse">Loading dialer…</p>
    </div>
  )

  if (error) return (
    <div className="flex items-center gap-3 rounded-xl border border-danger/25 bg-danger/8 px-4 py-3 text-danger text-sm">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
        <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
      {error}
    </div>
  )

  return (
    <div className="flex flex-col gap-4">
      {/* Control bar */}
      <CallControlBar
        agent={agent} lead={currentLead} callState={callState} callTimer={callTimer}
        onBreak={onBreak} onToggleBreak={() => setOnBreak(b => !b)}
        onStart={handleStart} onEnd={handleEnd}
        onWhatsapp={() => setWhatsappOpen(w => !w)} whatsappOpen={whatsappOpen}
      />

      {/* WhatsApp panel */}
      {whatsappOpen && <WhatsAppPanel lead={currentLead} onClose={() => setWhatsappOpen(false)} />}

      {/* Body */}
      {queue.length === 0 ? (
        <div className="bg-surface-raised rounded-xl border border-white/8 py-20 text-center">
          <p className="text-muted text-sm font-medium">No active leads in queue</p>
          <p className="text-muted/60 text-xs mt-1">Leads are assigned from the Leads page</p>
        </div>
      ) : (
        <div className="flex gap-4 items-start">
          {/* Left — call queue */}
          <div className="w-2/5 shrink-0">
            <CallQueue queue={queue} currentIndex={currentIndex} onPrioritize={handlePrioritize} />
          </div>

          {/* Right — contextual panel */}
          <div className="flex-1 min-w-0 flex flex-col gap-4">
            {callState === 'ended' ? (
              <>
                <AIDispositionSuggestion onAccept={handleAcceptAI} />
                <DispositionFlow
                  lead={currentLead} disp={disp} setDispField={setDispField}
                  onRedial={handleRedial} onSubmit={handleSubmit}
                  onOpenSkip={() => setSkipOpen(s => !s)}
                  submitting={submitting}
                />
                {skipOpen && <SkipPanel onClose={() => setSkipOpen(false)} onSkip={handleSkip} />}
              </>
            ) : (
              <>
                <ActiveLeadPanel lead={currentLead} callState={callState} />
                {callState === 'active' && (
                  <>
                    <SentimentAnalysis bars={sentimentBars} score={sentimentScore} isActive />
                    <LiveTranscript lines={transcript} />
                    <CallAssist transcriptLength={transcript.length} />
                  </>
                )}
              </>
            )}
          </div>
        </div>
      )}
      <Toast toast={toast} onDismiss={() => setToast(null)} />
    </div>
  )
}
