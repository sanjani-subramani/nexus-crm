import { useEffect, useState } from 'react'
import { getAgents, getDashboardStats } from '../api'

// ── Simulation presets — assigned by agent index, wraps if > 5 agents ─────────

const SIM_PRESETS = [
  { status: 'on_call',  campaign: 'Facebook Apr 2026',  converted: 7, score: 91, baseSecs: 312 },
  { status: 'idle',     campaign: 'WhatsApp Leads',      converted: 5, score: 82, baseSecs: 0   },
  { status: 'on_call',  campaign: 'DSR May 2026',        converted: 3, score: 74, baseSecs: 89  },
  { status: 'alert',    campaign: 'Instagram Jun 2026',  converted: 1, score: 43, baseSecs: 147 },
  { status: 'on_break', campaign: 'Snapchat Campaign',   converted: 9, score: 96, baseSecs: 0   },
]

const STATUS_CFG = {
  on_call:  { label: 'On Call',  dot: 'bg-success', text: 'text-success', bg: 'bg-success/10', pulse: true  },
  idle:     { label: 'Idle',     dot: 'bg-muted',   text: 'text-muted',   bg: 'bg-white/5',   pulse: false },
  on_break: { label: 'On Break', dot: 'bg-warning',  text: 'text-warning', bg: 'bg-warning/10', pulse: false },
  alert:    { label: 'Alert',    dot: 'bg-danger',   text: 'text-danger',  bg: 'bg-danger/10', pulse: true  },
}

// ── Utilities ─────────────────────────────────────────────────────────────────

const fmtTime    = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
const scoreColor = (n) => n >= 80 ? 'text-success' : n >= 60 ? 'text-warning' : 'text-danger'
const scoreBg    = (n) => n >= 80 ? 'bg-success'   : n >= 60 ? 'bg-warning'   : 'bg-danger'

// ── Shared mini-components ────────────────────────────────────────────────────

function AgentAvatar({ name, className = 'w-9 h-9' }) {
  const initials = (name ?? '').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?'
  return (
    <div className={`${className} rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center shrink-0`}>
      <span className="text-accent text-xs font-bold leading-none">{initials}</span>
    </div>
  )
}

function StatusBadge({ status }) {
  const cfg = STATUS_CFG[status] ?? STATUS_CFG.idle
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${cfg.bg} ${cfg.text}`}>
      {cfg.pulse ? (
        <span className="relative flex h-1.5 w-1.5 shrink-0">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${cfg.dot} opacity-60`} />
          <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${cfg.dot}`} />
        </span>
      ) : (
        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} shrink-0`} />
      )}
      {cfg.label}
    </span>
  )
}

function ScoreBar({ score }) {
  return (
    <div className="h-1.5 rounded-full bg-white/8 overflow-hidden">
      <div className={`h-full rounded-full ${scoreBg(score)}`} style={{ width: `${score}%` }} />
    </div>
  )
}

// ── Stat Cards ────────────────────────────────────────────────────────────────

function StatCards({ onlineCount, alertCount, stats }) {
  const cards = [
    {
      label: 'Agents Online',
      value: onlineCount,
      numColor: 'text-success',
      iconBg: 'bg-success/10',
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
    },
    {
      label: 'Active Calls',
      value: 5,
      numColor: 'text-accent',
      iconBg: 'bg-accent/10',
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.68 9.5a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.59 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.56a16 16 0 0 0 6.53 6.53l1.92-1.92a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
        </svg>
      ),
    },
    {
      label: 'Converted Today',
      value: stats?.converted ?? '—',
      numColor: 'text-success',
      iconBg: 'bg-success/10',
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      ),
    },
    {
      label: 'Sentiment Alerts',
      value: alertCount,
      numColor: alertCount > 0 ? 'text-danger' : 'text-muted',
      iconBg: alertCount > 0 ? 'bg-danger/10' : 'bg-white/5',
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      ),
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map(card => (
        <div key={card.label} className="bg-surface-raised rounded-xl border border-white/8 p-5 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-muted text-xs font-medium uppercase tracking-wide">{card.label}</span>
            <div className={`w-7 h-7 rounded-lg ${card.iconBg} flex items-center justify-center ${card.numColor}`}>
              {card.icon}
            </div>
          </div>
          <p className={`text-3xl font-bold leading-none ${card.numColor}`}>{card.value}</p>
        </div>
      ))}
    </div>
  )
}

// ── Agent Wallboard ───────────────────────────────────────────────────────────

function AgentWallboard({ agents, sim, tick }) {
  return (
    <div className="bg-surface-raised rounded-xl border border-white/8 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/8">
        <div>
          <h2 className="text-ink text-sm font-semibold">Live Agent Status</h2>
          <p className="text-muted text-xs mt-0.5">{agents.length} agents connected</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-60" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-success" />
          </span>
          <span className="text-muted text-xs">Live</span>
        </div>
      </div>

      {/* Column headers */}
      <div className="flex items-center gap-4 px-5 py-2 bg-white/3 border-b border-white/5">
        <div className="w-9 shrink-0" />
        <div className="flex-1 min-w-0 text-[10px] font-semibold text-muted uppercase tracking-wider">Agent</div>
        <div className="w-24 shrink-0 text-[10px] font-semibold text-muted uppercase tracking-wider">Status</div>
        <div className="w-16 shrink-0 text-[10px] font-semibold text-muted uppercase tracking-wider text-center">Duration</div>
        <div className="w-12 shrink-0 text-[10px] font-semibold text-muted uppercase tracking-wider text-center">Conv.</div>
        <div className="w-28 shrink-0 text-[10px] font-semibold text-muted uppercase tracking-wider">AI Score</div>
      </div>

      <div className="divide-y divide-white/5">
        {agents.map(agent => {
          const s = sim[agent.id]
          if (!s) return null
          const timerActive = s.status === 'on_call' || s.status === 'alert'
          const callSecs    = timerActive ? s.baseSecs + tick : 0
          const timerCls    = s.status === 'alert'
            ? 'font-mono text-sm font-semibold text-danger'
            : 'font-mono text-sm font-semibold text-success'

          return (
            <div
              key={agent.id}
              className={`flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-white/3 ${s.status === 'alert' ? 'bg-danger/5' : ''}`}
            >
              <AgentAvatar name={agent.name} className="w-9 h-9" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-ink text-sm font-medium leading-tight">{agent.name}</p>
                  {agent.role === 'supervisor' && (
                    <span className="text-[9px] text-muted bg-white/5 px-1.5 py-0.5 rounded font-semibold uppercase tracking-wider">SUP</span>
                  )}
                </div>
                <p className="text-muted text-xs mt-0.5 truncate">{s.campaign}</p>
              </div>
              <div className="w-24 shrink-0">
                <StatusBadge status={s.status} />
              </div>
              <div className="w-16 shrink-0 text-center">
                {timerActive
                  ? <span className={timerCls}>{fmtTime(callSecs)}</span>
                  : <span className="text-muted/25 text-sm">—</span>
                }
              </div>
              <div className="w-12 shrink-0 text-center">
                <p className="text-ink text-sm font-semibold">{s.converted}</p>
              </div>
              <div className="w-28 shrink-0">
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`text-xs font-bold tabular-nums ${scoreColor(s.score)}`}>{s.score}</span>
                  <span className="text-muted/40 text-[10px]">/ 100</span>
                </div>
                <ScoreBar score={s.score} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Escalation Alerts ─────────────────────────────────────────────────────────

function AlertRow({ alert, onResolve }) {
  const [pending, setPending] = useState(false)
  if (alert.resolved) return null

  const isEscalate = alert.action === 'escalate'
  const sc = alert.sentiment < 30
    ? { ring: 'bg-danger/10 border-danger/20', num: 'text-danger', bar: 'bg-danger', sub: 'text-danger/60' }
    : { ring: 'bg-warning/10 border-warning/20', num: 'text-warning', bar: 'bg-warning', sub: 'text-warning/60' }

  const handleAction = () => {
    setPending(true)
    setTimeout(() => onResolve(alert.id), 1500)
  }

  return (
    <div className={`flex items-start gap-4 px-5 py-4 ${isEscalate ? 'bg-danger/5' : ''}`}>
      <div className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center shrink-0 border ${sc.ring}`}>
        <span className={`text-xl font-bold leading-none ${sc.num}`}>{alert.sentiment}</span>
        <span className={`text-[9px] mt-0.5 font-medium ${sc.sub}`}>score</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-ink text-sm font-semibold leading-tight">{alert.name}</p>
        <p className="text-muted text-xs mt-0.5 leading-relaxed">{alert.message}</p>
        <div className="mt-2.5 h-1 w-32 rounded-full bg-white/8 overflow-hidden">
          <div className={`h-full rounded-full ${sc.bar}`} style={{ width: `${alert.sentiment}%` }} />
        </div>
      </div>
      {pending ? (
        <div className="flex items-center gap-1.5 shrink-0 py-1.5">
          <svg className="text-success" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span className="text-success text-xs font-semibold">{isEscalate ? 'Escalating…' : 'Hint sent'}</span>
        </div>
      ) : (
        <button
          onClick={handleAction}
          className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
            isEscalate
              ? 'bg-danger/10 border-danger/25 text-danger hover:bg-danger/15'
              : 'bg-accent/10 border-accent/25 text-accent hover:bg-accent/15'
          }`}
        >
          {isEscalate ? 'Escalate' : 'Send Hint'}
        </button>
      )}
    </div>
  )
}

function EscalationAlerts({ alerts, onResolve }) {
  const activeCount = alerts.filter(a => !a.resolved).length

  return (
    <div className="bg-surface-raised rounded-xl border border-white/8 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/8">
        <div className="flex items-center gap-2.5">
          <svg className="text-danger" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          <h2 className="text-ink text-sm font-semibold">Sentiment Escalations</h2>
          {activeCount > 0 && (
            <span className="text-[10px] font-bold text-danger bg-danger/10 px-1.5 py-0.5 rounded-full">{activeCount}</span>
          )}
        </div>
        <span className="text-muted text-xs">AI sentiment monitoring</span>
      </div>

      {activeCount === 0 ? (
        <div className="px-5 py-8 text-center">
          <div className="w-8 h-8 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-2">
            <svg className="text-success" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <p className="text-success text-sm font-medium">All clear</p>
          <p className="text-muted text-xs mt-1">No active sentiment alerts</p>
        </div>
      ) : (
        <div className="divide-y divide-white/5">
          {alerts.map(alert => (
            <AlertRow key={alert.id} alert={alert} onResolve={onResolve} />
          ))}
        </div>
      )}
    </div>
  )
}

// ── AI Performance Leaderboard ────────────────────────────────────────────────

function AILeaderboard({ agents, sim }) {
  const ranked = [...agents]
    .filter(a => sim[a.id])
    .sort((a, b) => (sim[b.id]?.score ?? 0) - (sim[a.id]?.score ?? 0))

  const RANK_COLOR = ['text-warning', 'text-muted', 'text-warning/40']

  return (
    <div className="bg-surface-raised rounded-xl border border-white/8 overflow-hidden">
      <div className="px-5 py-4 border-b border-white/8">
        <h2 className="text-ink text-sm font-semibold">AI Performance Leaderboard</h2>
        <p className="text-muted text-[10px] mt-0.5 leading-relaxed">
          Scores consider talk ratio, listening, objection handling, professionalism
        </p>
      </div>
      <div className="divide-y divide-white/5">
        {ranked.map((agent, i) => {
          const s    = sim[agent.id]
          const rank = i + 1
          return (
            <div key={agent.id} className="flex items-center gap-3 px-5 py-3.5">
              <span className={`text-sm font-bold w-5 text-center shrink-0 tabular-nums ${RANK_COLOR[i] ?? 'text-muted/25'}`}>
                {rank}
              </span>
              <AgentAvatar name={agent.name} className="w-7 h-7" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <p className="text-ink text-sm font-medium truncate">{agent.name}</p>
                  <span className={`text-sm font-bold tabular-nums shrink-0 ${scoreColor(s.score)}`}>{s.score}</span>
                </div>
                <ScoreBar score={s.score} />
              </div>
              <div className="text-right shrink-0 w-10">
                <p className="text-success text-sm font-semibold">{s.converted}</p>
                <p className="text-muted text-[10px] leading-none">conv</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Smart Lead Allocation ─────────────────────────────────────────────────────

function SmartAllocation({ stats, agents, sim }) {
  const [result, setResult]   = useState(null)
  const [running, setRunning] = useState(false)

  const unallocated     = stats?.unallocated ?? 0
  const availableAgents = agents.filter(a => {
    const s = sim[a.id]?.status
    return s === 'on_call' || s === 'idle'
  }).length

  const handleRun = () => {
    if (running) return
    setRunning(true)
    setResult(null)
    setTimeout(() => {
      setResult({ leads: unallocated, agents: availableAgents })
      setRunning(false)
    }, 1500)
  }

  return (
    <div className="bg-surface-raised rounded-xl border border-white/8 p-5">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-ink text-sm font-semibold">Smart Lead Allocation</h2>
          <p className="text-muted text-xs mt-0.5">AI-powered matching engine</p>
        </div>
        <span className="text-xs text-teal bg-teal/10 border border-teal/15 px-2.5 py-0.5 rounded-full font-semibold shrink-0">
          AI Match Rate 94%
        </span>
      </div>

      <div className="flex gap-3 mb-5">
        <div className="flex-1 bg-white/3 border border-white/5 rounded-xl p-3.5 text-center">
          <p className="text-2xl font-bold text-ink leading-none">{unallocated}</p>
          <p className="text-muted text-[11px] mt-1.5">Unallocated Leads</p>
        </div>
        <div className="flex-1 bg-white/3 border border-white/5 rounded-xl p-3.5 text-center">
          <p className="text-2xl font-bold text-ink leading-none">{availableAgents}</p>
          <p className="text-muted text-[11px] mt-1.5">Available Agents</p>
        </div>
      </div>

      <button
        onClick={handleRun}
        disabled={running || unallocated === 0}
        className="w-full flex items-center justify-center gap-2 py-2.5 bg-accent hover:bg-accent/90 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-accent/20"
      >
        {running ? (
          <>
            <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Running AI Allocation…
          </>
        ) : (
          <>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z" />
              <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z" />
            </svg>
            Run AI Allocation
          </>
        )}
      </button>

      {result && (
        <div className="mt-4 bg-success/5 border border-success/15 rounded-xl px-4 py-3.5">
          <div className="flex items-center gap-2 mb-1.5">
            <svg className="text-success" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span className="text-success text-[10px] font-semibold uppercase tracking-wider">Allocation Complete</span>
          </div>
          <p className="text-ink text-sm leading-relaxed">
            <span className="font-bold">{result.leads}</span> leads matched to{' '}
            <span className="font-bold">{result.agents}</span> agents based on past conversion rates, language, and region.
          </p>
        </div>
      )}
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function Supervisor() {
  const [agents, setAgents]   = useState([])
  const [stats, setStats]     = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)
  const [sim, setSim]         = useState({})
  const [alerts, setAlerts]   = useState([])
  const [tick, setTick]       = useState(0)

  useEffect(() => {
    const load = async () => {
      try {
        const [agentsData, statsData] = await Promise.all([getAgents(), getDashboardStats()])
        setAgents(agentsData)
        setStats(statsData)

        const simMap = {}
        agentsData.forEach((agent, i) => {
          simMap[agent.id] = { ...SIM_PRESETS[i % SIM_PRESETS.length] }
        })
        setSim(simMap)

        // Wire escalation alerts to real agent names.
        // Preset index 3 = 'alert' status agent (highest severity).
        const severe = agentsData[3] ?? agentsData[agentsData.length - 1]
        const mild   = agentsData[0]
        setAlerts([
          { id: 1, name: severe?.name ?? 'Agent', message: 'Angry customer — sentiment dropped to 23%',             sentiment: 23, action: 'escalate', resolved: false },
          { id: 2, name: mild?.name   ?? 'Agent', message: 'Customer hesitant, lacking confidence — sentiment 41%', sentiment: 41, action: 'hint',     resolved: false },
        ])
      } catch {
        setError('Could not load supervisor data. Make sure the backend is running on port 8000.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  // Single interval drives all live call timers — cleared on unmount
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 1000)
    return () => clearInterval(id)
  }, [])

  const handleResolveAlert = (alertId) =>
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, resolved: true } : a))

  const onlineCount = agents.filter(a => !!sim[a.id]).length
  const alertCount  = alerts.filter(a => !a.resolved).length

  if (loading) return (
    <div className="flex items-center justify-center h-48">
      <p className="text-muted text-sm animate-pulse">Loading wallboard…</p>
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
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-ink">Supervisor Wallboard</h1>
          <p className="text-muted text-sm mt-1">Live operations — {agents.length} agents connected</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-60" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-success" />
          </span>
          <span className="text-muted text-xs">Live · Auto-refreshing</span>
        </div>
      </div>

      {/* Top stat row */}
      <StatCards onlineCount={onlineCount} alertCount={alertCount} stats={stats} />

      {/* Body — 55 / 45 split */}
      <div className="flex gap-4 items-start">
        <div className="flex flex-col gap-4 flex-[11] min-w-0">
          <AgentWallboard agents={agents} sim={sim} tick={tick} />
          <EscalationAlerts alerts={alerts} onResolve={handleResolveAlert} />
        </div>
        <div className="flex flex-col gap-4 flex-[9] min-w-0">
          <AILeaderboard agents={agents} sim={sim} />
          <SmartAllocation stats={stats} agents={agents} sim={sim} />
        </div>
      </div>
    </div>
  )
}
