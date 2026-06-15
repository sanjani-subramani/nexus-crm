import { useState } from 'react'

// ── Tag config ────────────────────────────────────────────────────────────────

const TAG = {
  quick:  { label: 'Quick Win', cls: 'text-success bg-success/10 border border-success/20' },
  medium: { label: 'Medium',    cls: 'text-warning bg-warning/10 border border-warning/20' },
  ai:     { label: 'AI / ML',   cls: 'text-accent  bg-accent/10  border border-accent/20'  },
}

const ICON_BG = {
  quick:  'bg-success/10 text-success',
  medium: 'bg-warning/10 text-warning',
  ai:     'bg-accent/10  text-accent',
}

// ── 17 Innovations ────────────────────────────────────────────────────────────

const INNOVATIONS = [
  {
    id: 1, tag: 'quick', title: 'End Call Button',
    desc: 'Prominent one-tap button that cleanly ends a live call and immediately opens the disposition flow.',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.42 19.42 0 0 1 4.26 9.77a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.17 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.15 9.9a16 16 0 0 0 3.53 3.41z"/><line x1="1" y1="1" x2="23" y2="23"/></svg>,
  },
  {
    id: 2, tag: 'quick', title: 'Lead Skip with Reason',
    desc: 'Skip a lead mid-queue with a logged reason and callback time — keeps queue data clean and auditable.',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="13 17 18 12 13 7"/><polyline points="6 17 11 12 6 7"/></svg>,
  },
  {
    id: 3, tag: 'quick', title: 'WhatsApp Free-Text',
    desc: 'Send a personalised WhatsApp brochure message directly from the dialer — pre-filled with customer name and scheme.',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  },
  {
    id: 4, tag: 'quick', title: 'Call Quality Indicator',
    desc: 'Live signal-strength bars plus recording-active status in the control bar — agents always know their connection quality.',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="1" y1="6" x2="1" y2="18"/><line x1="6" y1="3" x2="6" y2="21"/><line x1="11" y1="8" x2="11" y2="16"/><line x1="16" y1="5" x2="16" y2="19"/><line x1="21" y1="10" x2="21" y2="14"/></svg>,
  },
  {
    id: 5, tag: 'quick', title: 'Duplicate Lead Detection',
    desc: 'Flags leads with matching phone numbers across campaigns before assignment — prevents agents calling the same prospect twice.',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>,
  },
  {
    id: 6, tag: 'quick', title: 'Edit & Soft-Delete Leads',
    desc: 'In-table lead editing with soft-delete — data is always recoverable and a full audit trail is preserved.',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  },
  {
    id: 7, tag: 'medium', title: 'Live Supervisor Wallboard',
    desc: 'Real-time agent status grid with call timers, AI scores, and one-click escalation — the ops team\'s command view.',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>,
  },
  {
    id: 8, tag: 'medium', title: 'Auto Callback Scheduler',
    desc: 'Skipped and void leads auto-surface at the optimal retry window — zero manual follow-up required.',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  },
  {
    id: 9, tag: 'medium', title: 'Post-Call AI Disposition',
    desc: 'AI reads the call transcript and pre-fills outcome, lead temperature, and follow-up date — one click to accept.',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/><polyline points="9 12 11 14 15 10"/></svg>,
  },
  {
    id: 10, tag: 'ai', title: 'Real-time Call Assist',
    desc: 'Context-aware suggestions update live as the conversation evolves — objection handling, pricing cues, next steps.',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l2.09 6.26L20 10l-5.91 1.74L12 18l-2.09-6.26L4 10l5.91-1.74L12 2z"/><path d="M19 15l.94 2.06L22 18l-2.06.94L19 21l-.94-2.06L16 18l2.06-.94L19 15z"/></svg>,
  },
  {
    id: 11, tag: 'ai', title: 'Auto Call Transcription',
    desc: 'Chit-fund-tuned speech-to-text with speaker diarisation — every call searchable, every word logged.',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>,
  },
  {
    id: 12, tag: 'ai', title: 'Agent Performance Scoring',
    desc: 'ML model scores every call on talk ratio, listening, objection handling, and professionalism — ranked leaderboard.',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  },
  {
    id: 13, tag: 'ai', title: 'Optimal Calling Time',
    desc: 'Per-customer time-of-day predictions based on answer history — maximises first-call resolution rates.',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  },
  {
    id: 14, tag: 'ai', title: 'Sentiment-Aware Escalation',
    desc: 'Real-time call sentiment drops below threshold → supervisor is alerted instantly with a one-click escalation prompt.',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
  },
  {
    id: 15, tag: 'ai', title: 'Smart Lead Allocation',
    desc: 'Matches unallocated leads to agents by past conversion rate, language preference, and geographic zone.',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/></svg>,
  },
  {
    id: 16, tag: 'ai', title: 'Smart Product Recommendation',
    desc: 'Customer profiling surfaces the most suitable chit scheme — fewer back-and-forth questions, higher close rates.',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>,
  },
  {
    id: 17, tag: 'ai', title: 'Compliance Flagging',
    desc: 'Post-call NLP flags missing mandatory disclosures (prize pool cap, forfeiture clause) before the agent closes.',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>,
  },
]

// ── Demo data ─────────────────────────────────────────────────────────────────

const CALLING_TIME_DATA = {
  'Ravi Kumar': {
    bestTime: '11 AM – 1 PM', answerRate: 68, avgCalls: 2.3,
    tip: 'Works in IT — call during his lunch break when personal calls are more likely to be answered.',
  },
  'Priya Menon': {
    bestTime: '6 PM – 8 PM', answerRate: 54, avgCalls: 3.1,
    tip: 'Homemaker — prefers evening calls after school pickup and household tasks wind down.',
  },
  'Ganesh Reddy': {
    bestTime: '9 AM – 11 AM', answerRate: 71, avgCalls: 1.8,
    tip: 'Business owner — most reachable early morning before the store opens and the day gets busy.',
  },
  'Meera Krishnan': {
    bestTime: '12 PM – 2 PM', answerRate: 61, avgCalls: 2.7,
    tip: 'Office worker — responds well to midday calls during the lunch hour away from her desk.',
  },
}

const DUPLICATE_PAIRS = [
  {
    id: 1, confidence: 97,
    a: { name: 'Ravi Kumar',  campaign: 'Facebook Apr 2026',  number: '98765 43210' },
    b: { name: 'Ravi K.',     campaign: 'WhatsApp Leads',      number: '98765 43210' },
  },
  {
    id: 2, confidence: 91,
    a: { name: 'Sunita Devi', campaign: 'DSR May 2026',        number: '87654 32109' },
    b: { name: 'S. Devi',     campaign: 'Instagram Jun 2026',  number: '87654 32109' },
  },
]

const PRODUCT_PROFILES = [
  { label: 'Salaried Professional, 32', scheme: '3×30', color: 'text-accent', reason: 'Stable monthly income supports consistent ₹30 K instalments. The 30-month tenure maximises early prize draw chances.' },
  { label: 'Self-employed, 45',         scheme: '4×40', color: 'text-teal',   reason: 'Higher income variability is suited to the larger ₹40 K scheme with a bigger prize pool and flexible entry windows.' },
  { label: 'Retired, 60',              scheme: '5×25', color: 'text-success', reason: 'Lower monthly outgo is critical. The shorter 25-month commitment is ideal for fixed pension income.' },
  { label: 'Young Graduate, 24',        scheme: '3×30', color: 'text-accent', reason: 'Entry-level salary benefits from a smaller monthly commitment. 30-month returns fit mid-term savings goals.' },
]

const COMPLIANCE_CALLS = [
  {
    id: 1, agent: 'Karthik', customer: 'Ravi Kumar', duration: '4:32',
    status: 'flagged',
    detail: 'Missing mandatory disclosure: prize pool cap and forfeiture clause not mentioned during the call.',
  },
  {
    id: 2, agent: 'Shriram', customer: 'Priya Menon', duration: '6:15',
    status: 'compliant',
    detail: 'All disclosures covered — prize pool, Chit Funds Act registration, forfeiture terms delivered.',
  },
  {
    id: 3, agent: 'Sandesh', customer: 'Ganesh Reddy', duration: '3:48',
    status: 'compliant',
    detail: 'Risk warnings and co-applicant terms delivered per approved script.',
  },
]

// ── Shared ────────────────────────────────────────────────────────────────────

function DemoCard({ title, subtitle, children }) {
  return (
    <div className="bg-surface-raised rounded-xl border border-white/8 overflow-hidden">
      <div className="px-5 py-4 border-b border-white/8">
        <h3 className="text-ink text-sm font-semibold">{title}</h3>
        {subtitle && <p className="text-muted text-xs mt-0.5">{subtitle}</p>}
      </div>
      <div className="p-5">{children}</div>
    </div>
  )
}

function SelectField({ value, onChange, children }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={onChange}
        className="w-full appearance-none bg-surface border border-white/8 text-ink text-sm rounded-lg pl-3 pr-8 py-2.5 focus:outline-none focus:border-accent/40 transition-colors cursor-pointer"
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

// ── Innovation Card ───────────────────────────────────────────────────────────

function InnovationCard({ item }) {
  const tag = TAG[item.tag]
  const iconBg = ICON_BG[item.tag]
  return (
    <div className="bg-surface-raised rounded-xl border border-white/8 p-5 flex flex-col gap-3 hover:border-white/15 transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div className={`w-9 h-9 rounded-xl ${iconBg} flex items-center justify-center shrink-0`}>
          {item.icon}
        </div>
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${tag.cls}`}>
          {tag.label}
        </span>
      </div>
      <div>
        <p className="text-ink text-sm font-semibold leading-tight">{item.title}</p>
        <p className="text-muted text-xs mt-1.5 leading-relaxed">{item.desc}</p>
      </div>
    </div>
  )
}

// ── Demo: Optimal Calling Time ────────────────────────────────────────────────

function CallingTimeDemo() {
  const leads = Object.keys(CALLING_TIME_DATA)
  const [selected, setSelected] = useState(leads[0])
  const d = CALLING_TIME_DATA[selected]

  return (
    <DemoCard title="Optimal Calling Time Predictor" subtitle="AI predicts per-customer best call windows from answer history">
      <SelectField value={selected} onChange={e => setSelected(e.target.value)}>
        {leads.map(l => <option key={l} value={l}>{l}</option>)}
      </SelectField>

      <div className="mt-4 space-y-3">
        {/* Best time — hero */}
        <div className="bg-accent/5 border border-accent/15 rounded-xl px-4 py-3.5 flex items-center justify-between">
          <span className="text-muted text-xs font-semibold uppercase tracking-wider">Best Window</span>
          <span className="text-accent text-lg font-bold">{d.bestTime}</span>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/3 border border-white/5 rounded-xl p-3.5 text-center">
            <p className={`text-xl font-bold leading-none ${d.answerRate >= 65 ? 'text-success' : d.answerRate >= 50 ? 'text-warning' : 'text-danger'}`}>
              {d.answerRate}%
            </p>
            <p className="text-muted text-[11px] mt-1.5">Answer Rate</p>
          </div>
          <div className="bg-white/3 border border-white/5 rounded-xl p-3.5 text-center">
            <p className="text-xl font-bold text-ink leading-none">{d.avgCalls}</p>
            <p className="text-muted text-[11px] mt-1.5">Avg Calls to Convert</p>
          </div>
        </div>

        {/* AI Tip */}
        <div className="flex gap-3 bg-surface rounded-xl border border-white/5 px-4 py-3">
          <div className="mt-0.5 shrink-0">
            <svg className="text-accent" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2l2.09 6.26L20 10l-5.91 1.74L12 18l-2.09-6.26L4 10l5.91-1.74L12 2z"/>
            </svg>
          </div>
          <p className="text-muted text-xs leading-relaxed italic">{d.tip}</p>
        </div>
      </div>
    </DemoCard>
  )
}

// ── Demo: Duplicate Lead Detection ────────────────────────────────────────────

function DuplicateDetectionDemo() {
  const [merged, setMerged] = useState(new Set())

  return (
    <DemoCard title="Duplicate Lead Detection" subtitle="Flagged pairs with matching contact numbers across campaigns">
      <div className="space-y-3">
        {DUPLICATE_PAIRS.map(pair => {
          const isMerged = merged.has(pair.id)
          return (
            <div
              key={pair.id}
              className={`rounded-xl border p-4 transition-colors ${
                isMerged ? 'border-success/20 bg-success/5' : 'border-warning/20 bg-warning/5'
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2">
                  {isMerged ? (
                    <svg className="text-success" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  ) : (
                    <svg className="text-warning" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                    </svg>
                  )}
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${isMerged ? 'text-success' : 'text-warning'}`}>
                    {isMerged ? 'Merged' : `${pair.confidence}% match`}
                  </span>
                </div>
                {!isMerged && (
                  <button
                    onClick={() => setMerged(prev => new Set([...prev, pair.id]))}
                    className="shrink-0 text-xs font-semibold px-3 py-1 rounded-lg bg-warning/10 border border-warning/25 text-warning hover:bg-warning/15 transition-colors"
                  >
                    Merge
                  </button>
                )}
              </div>

              {/* The two leads side by side */}
              <div className="grid grid-cols-2 gap-3">
                {[pair.a, pair.b].map((lead, i) => (
                  <div key={i} className="bg-white/5 rounded-lg px-3 py-2.5">
                    <p className="text-ink text-sm font-medium leading-tight">{lead.name}</p>
                    <p className="text-muted text-xs mt-0.5">{lead.campaign}</p>
                    <p className="text-muted font-mono text-[11px] mt-1">{lead.number}</p>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </DemoCard>
  )
}

// ── Demo: Smart Product Recommendation ───────────────────────────────────────

function ProductRecommendationDemo() {
  const [idx, setIdx] = useState(0)
  const profile = PRODUCT_PROFILES[idx]

  return (
    <DemoCard title="Smart Product Recommendation" subtitle="AI matches customer profile to the best-fit chit scheme">
      <SelectField value={idx} onChange={e => setIdx(Number(e.target.value))}>
        {PRODUCT_PROFILES.map((p, i) => (
          <option key={i} value={i}>{p.label}</option>
        ))}
      </SelectField>

      <div className="mt-4 space-y-3">
        {/* Recommended scheme — hero */}
        <div className="bg-surface rounded-xl border border-white/8 px-4 py-4 flex items-center justify-between">
          <div>
            <p className="text-muted text-[10px] font-semibold uppercase tracking-wider mb-0.5">Recommended Scheme</p>
            <p className={`text-3xl font-bold leading-none ${profile.color}`}>{profile.scheme}</p>
          </div>
          <div className="text-right">
            <p className="text-muted text-[10px] font-semibold uppercase tracking-wider mb-0.5">AI Confidence</p>
            <p className="text-ink text-lg font-bold">94%</p>
          </div>
        </div>

        {/* Reason */}
        <div className="flex gap-3 bg-accent/5 border border-accent/10 rounded-xl px-4 py-3.5">
          <svg className="text-accent mt-0.5 shrink-0" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2l2.09 6.26L20 10l-5.91 1.74L12 18l-2.09-6.26L4 10l5.91-1.74L12 2z"/>
          </svg>
          <p className="text-ink/80 text-xs leading-relaxed">{profile.reason}</p>
        </div>
      </div>
    </DemoCard>
  )
}

// ── Demo: Compliance Flagging ─────────────────────────────────────────────────

function ComplianceFlaggingDemo() {
  const [reviewed, setReviewed] = useState(false)

  return (
    <DemoCard title="Compliance Flagging" subtitle="Post-call NLP checks mandatory disclosures — flags before close">
      <div className="space-y-3">
        {COMPLIANCE_CALLS.map(call => {
          const flagged = call.status === 'flagged'
          const isReviewed = flagged && reviewed
          return (
            <div
              key={call.id}
              className={`rounded-xl border p-4 transition-colors ${
                isReviewed   ? 'border-success/20 bg-success/5' :
                flagged      ? 'border-danger/25  bg-danger/5'  :
                               'border-success/15 bg-success/5'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                    isReviewed || !flagged ? 'bg-success/15' : 'bg-danger/15'
                  }`}>
                    {isReviewed || !flagged ? (
                      <svg className="text-success" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    ) : (
                      <svg className="text-danger" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                      </svg>
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-ink text-sm font-semibold">{call.agent}</span>
                      <span className="text-muted text-xs">→ {call.customer}</span>
                      <span className="text-muted font-mono text-[11px] bg-white/5 px-1.5 py-0.5 rounded">{call.duration}</span>
                    </div>
                    <p className={`text-xs mt-1 leading-relaxed ${
                      isReviewed ? 'text-success/70' :
                      flagged    ? 'text-danger/80'  : 'text-muted'
                    }`}>
                      {isReviewed ? 'Marked as reviewed — escalated to team lead.' : call.detail}
                    </p>
                  </div>
                </div>
                {flagged && !isReviewed && (
                  <button
                    onClick={() => setReviewed(true)}
                    className="shrink-0 text-xs font-semibold px-3 py-1 rounded-lg bg-danger/10 border border-danger/25 text-danger hover:bg-danger/15 transition-colors whitespace-nowrap"
                  >
                    Review
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </DemoCard>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

const COUNTS = { quick: 0, medium: 0, ai: 0 }
INNOVATIONS.forEach(i => COUNTS[i.tag]++)

export default function AIFeatures() {
  return (
    <div className="flex flex-col gap-8">

      {/* Page header */}
      <div>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-ink">AI Innovation Showcase</h1>
            <p className="text-muted text-sm mt-1">
              {INNOVATIONS.length} enhancements built from real gaps in the CRM walkthrough
            </p>
          </div>
          {/* Live indicator */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-60" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-accent" />
            </span>
            <span className="text-muted text-xs">Demos active</span>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-3">
          <span className="text-xs font-semibold text-success bg-success/10 border border-success/20 px-2.5 py-1 rounded-full">
            {COUNTS.quick} Quick Wins
          </span>
          <span className="text-xs font-semibold text-warning bg-warning/10 border border-warning/20 px-2.5 py-1 rounded-full">
            {COUNTS.medium} Medium
          </span>
          <span className="text-xs font-semibold text-accent bg-accent/10 border border-accent/20 px-2.5 py-1 rounded-full">
            {COUNTS.ai} AI / ML
          </span>
        </div>
      </div>

      {/* Innovation grid */}
      <div>
        <h2 className="text-sm font-semibold text-ink mb-4">All Innovations</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {INNOVATIONS.map(item => <InnovationCard key={item.id} item={item} />)}
        </div>
      </div>

      {/* Interactive demos */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-semibold text-ink">Interactive Demos</h2>
            <p className="text-muted text-xs mt-0.5">Try the AI features below — all running on mock data</p>
          </div>
          <span className="text-[10px] font-semibold text-accent bg-accent/10 border border-accent/20 px-2 py-0.5 rounded-full">
            4 Live Demos
          </span>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <CallingTimeDemo />
          <DuplicateDetectionDemo />
          <ProductRecommendationDemo />
          <ComplianceFlaggingDemo />
        </div>
      </div>

    </div>
  )
}
