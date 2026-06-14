import { useEffect, useState } from 'react'
import { getDashboardStats, getCampaigns } from '../api'

// ── Stat card definitions ─────────────────────────────────────────────────────
const STAT_CARDS = [
  {
    key: 'total_leads',
    label: 'All Leads',
    numColor: 'text-ink',
    iconBg: 'bg-white/5',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="6" height="6" rx="1" /><rect x="9" y="3" width="6" height="6" rx="1" /><rect x="16" y="3" width="6" height="6" rx="1" />
        <rect x="2" y="11" width="6" height="6" rx="1" /><rect x="9" y="11" width="6" height="6" rx="1" /><rect x="16" y="11" width="6" height="6" rx="1" />
        <rect x="2" y="19" width="6" height="6" rx="1" /><rect x="9" y="19" width="6" height="6" rx="1" /><rect x="16" y="19" width="6" height="6" rx="1" />
      </svg>
    ),
  },
  {
    key: 'unallocated',
    label: 'Unallocated',
    numColor: 'text-muted',
    iconBg: 'bg-white/5',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 12V22H4V12" /><path d="M22 7H2v5h20V7z" /><path d="M12 22V7" />
        <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
        <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
      </svg>
    ),
  },
  {
    key: 'active',
    label: 'Active',
    numColor: 'text-accent',
    iconBg: 'bg-accent/10',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
  },
  {
    key: 'converted',
    label: 'Converted',
    numColor: 'text-success',
    iconBg: 'bg-success/10',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
  },
  {
    key: 'void',
    label: 'Void',
    numColor: 'text-warning',
    iconBg: 'bg-warning/10',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
  },
  {
    key: 'inactive',
    label: 'Inactive',
    numColor: 'text-danger',
    iconBg: 'bg-danger/10',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
      </svg>
    ),
  },
]

// ── Priority badge styling ─────────────────────────────────────────────────────
const PRIORITY_STYLE = {
  High:   'bg-danger/10 text-danger',
  Medium: 'bg-warning/10 text-warning',
  Low:    'bg-white/5 text-muted',
}

// ── Skeleton loaders ──────────────────────────────────────────────────────────
function StatsSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="bg-surface-raised rounded-xl border border-white/8 p-5 animate-pulse">
          <div className="h-3 bg-white/8 rounded w-2/3 mb-4" />
          <div className="h-8 bg-white/8 rounded w-1/2" />
        </div>
      ))}
    </div>
  )
}

function CampaignsSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-surface-raised rounded-xl border border-white/8 p-5 animate-pulse">
          <div className="h-4 bg-white/8 rounded w-1/3 mb-3" />
          <div className="h-3 bg-white/8 rounded w-1/4 mb-4" />
          <div className="h-2 bg-white/8 rounded w-full" />
        </div>
      ))}
    </div>
  )
}

// ── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({ card, value }) {
  return (
    <div className="bg-surface-raised rounded-xl border border-white/8 p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-muted text-xs font-medium uppercase tracking-wide">{card.label}</span>
        <div className={`w-7 h-7 rounded-lg ${card.iconBg} flex items-center justify-center ${card.numColor}`}>
          {card.icon}
        </div>
      </div>
      <p className={`text-3xl font-bold leading-none ${card.numColor}`}>{value ?? '—'}</p>
    </div>
  )
}

// ── Campaign card ─────────────────────────────────────────────────────────────
function CampaignCard({ campaign }) {
  const total = campaign.total_leads || 0

  // Stacked progress bar segments (active / converted / void / unallocated)
  const pct = (n) => (total > 0 ? Math.round((n / total) * 100) : 0)
  const activePct    = pct(campaign.active)
  const convertedPct = pct(campaign.converted)
  const voidPct      = pct(campaign.void)
  const inactivePct  = pct(campaign.inactive)

  return (
    <div className="bg-surface-raised rounded-xl border border-white/8 p-5">
      {/* Header row */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <p className="text-ink font-semibold text-sm leading-tight">{campaign.name}</p>
          <p className="text-muted text-xs mt-0.5">{campaign.category || 'Uncategorised'}</p>
        </div>
        <span className={`shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full ${PRIORITY_STYLE[campaign.priority] ?? PRIORITY_STYLE.Low}`}>
          {campaign.priority}
        </span>
      </div>

      {/* Lead count pills */}
      <div className="flex flex-wrap gap-2 mb-4">
        <Pill label="Total"       value={total}               color="text-ink bg-white/5" />
        <Pill label="Active"      value={campaign.active}     color="text-accent bg-accent/10" />
        <Pill label="Converted"   value={campaign.converted}  color="text-success bg-success/10" />
        <Pill label="Void"        value={campaign.void}       color="text-warning bg-warning/10" />
        <Pill label="Unallocated" value={campaign.unallocated}color="text-muted bg-white/5" />
      </div>

      {/* Stacked progress bar */}
      <div className="h-1.5 rounded-full bg-white/5 overflow-hidden flex">
        <div className="h-full bg-accent transition-all"     style={{ width: `${activePct}%` }} />
        <div className="h-full bg-success transition-all"    style={{ width: `${convertedPct}%` }} />
        <div className="h-full bg-warning transition-all"    style={{ width: `${voidPct}%` }} />
        <div className="h-full bg-danger/60 transition-all"  style={{ width: `${inactivePct}%` }} />
      </div>
      <p className="text-muted text-[10px] mt-1.5">
        {activePct}% active · {convertedPct}% converted
      </p>
    </div>
  )
}

function Pill({ label, value, color }) {
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg ${color}`}>
      <span className="font-bold">{value}</span>
      <span className="opacity-70">{label}</span>
    </span>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const [stats, setStats]         = useState(null)
  const [campaigns, setCampaigns] = useState([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState(null)

  useEffect(() => {
    const load = async () => {
      try {
        const [statsData, campaignsData] = await Promise.all([
          getDashboardStats(),
          getCampaigns(),
        ])
        setStats(statsData)
        setCampaigns(campaignsData)
      } catch {
        setError('Could not reach the backend. Make sure the FastAPI server is running on port 8000.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div>
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-ink">Dashboard</h1>
        <p className="text-muted text-sm mt-1">Live overview of your contact centre</p>
      </div>

      {/* Error banner */}
      {error && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-danger/25 bg-danger/8 px-4 py-3 text-danger text-sm">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {error}
        </div>
      )}

      {/* Stat cards */}
      {loading ? (
        <StatsSkeleton />
      ) : stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4">
          {STAT_CARDS.map(card => (
            <StatCard key={card.key} card={card} value={stats[card.key]} />
          ))}
        </div>
      )}

      {/* Campaign performance */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-ink">Campaign Performance</h2>
          <span className="text-muted text-xs">{campaigns.length} campaigns</span>
        </div>

        {loading ? (
          <CampaignsSkeleton />
        ) : campaigns.length === 0 ? (
          <div className="rounded-xl border border-white/8 bg-surface-raised p-10 text-center text-muted text-sm">
            No campaigns found.
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {campaigns.map(c => <CampaignCard key={c.id} campaign={c} />)}
          </div>
        )}
      </div>
    </div>
  )
}
