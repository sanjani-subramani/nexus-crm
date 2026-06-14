import { useEffect, useState } from 'react'
import { getCampaigns } from '../api'

// ── Style maps ────────────────────────────────────────────────────────────────
const PRIORITY_STYLE = {
  High:   'bg-danger/10 text-danger',
  Medium: 'bg-warning/10 text-warning',
  Low:    'bg-white/5 text-muted',
}

// Each count column: label, data key, text color
const COUNT_COLS = [
  { label: 'All',         key: 'total_leads',  color: 'text-ink' },
  { label: 'Unallocated', key: 'unallocated',  color: 'text-muted' },
  { label: 'Active',      key: 'active',       color: 'text-accent' },
  { label: 'Converted',   key: 'converted',    color: 'text-success' },
  { label: 'Void',        key: 'void',         color: 'text-warning' },
  { label: 'Inactive',    key: 'inactive',     color: 'text-danger' },
]

function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
function TableSkeleton() {
  return (
    <tbody>
      {Array.from({ length: 6 }).map((_, i) => (
        <tr key={i} className="border-b border-white/5 animate-pulse">
          <td className="px-4 py-4">
            <div className="h-3.5 bg-white/8 rounded w-28 mb-2" />
            <div className="h-2.5 bg-white/5 rounded w-16" />
          </td>
          <td className="px-4 py-4"><div className="h-5 bg-white/8 rounded-full w-14" /></td>
          {COUNT_COLS.map(c => (
            <td key={c.key} className="px-4 py-4">
              <div className="h-4 bg-white/8 rounded w-8 mx-auto" />
            </td>
          ))}
          <td className="px-4 py-4"><div className="h-3 bg-white/5 rounded w-20" /></td>
        </tr>
      ))}
    </tbody>
  )
}

// ── Campaign row ──────────────────────────────────────────────────────────────
function CampaignRow({ campaign }) {
  return (
    <tr className="border-b border-white/5 last:border-0 hover:bg-white/3 transition-colors cursor-pointer">
      {/* Name + category */}
      <td className="px-4 py-4">
        <p className="text-ink font-medium text-sm">{campaign.name}</p>
        {campaign.category && (
          <p className="text-muted text-xs mt-0.5">{campaign.category}</p>
        )}
      </td>

      {/* Priority badge */}
      <td className="px-4 py-4">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${PRIORITY_STYLE[campaign.priority] ?? PRIORITY_STYLE.Low}`}>
          {campaign.priority ?? 'Low'}
        </span>
      </td>

      {/* Count columns */}
      {COUNT_COLS.map(col => (
        <td key={col.key} className="px-4 py-4 text-center">
          <span className={`text-sm font-semibold tabular-nums ${col.color}`}>
            {campaign[col.key] ?? 0}
          </span>
        </td>
      ))}

      {/* Created date */}
      <td className="px-4 py-4 text-xs text-muted whitespace-nowrap">
        {formatDate(campaign.created_date)}
      </td>
    </tr>
  )
}

// ── Add Campaign Modal ────────────────────────────────────────────────────────
function AddCampaignModal({ onClose }) {
  const [form, setForm] = useState({ name: '', category: '', priority: 'Medium' })

  const set = (key, value) => setForm(prev => ({ ...prev, [key]: value }))

  // Close on backdrop click
  const onBackdrop = (e) => { if (e.target === e.currentTarget) onClose() }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
      onClick={onBackdrop}
    >
      <div className="w-full max-w-md bg-surface-raised border border-white/10 rounded-2xl shadow-2xl">
        {/* Modal header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-white/8">
          <div>
            <h2 className="text-ink font-semibold text-[1rem]">Add Campaign</h2>
            <p className="text-muted text-xs mt-0.5">Create a new lead campaign</p>
          </div>
          <button
            onClick={onClose}
            className="text-muted hover:text-ink transition-colors p-1 rounded-lg hover:bg-white/5"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Modal body */}
        <div className="px-6 py-5 space-y-4">
          {/* Campaign Name */}
          <div>
            <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
              Campaign Name <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={e => set('name', e.target.value)}
              placeholder="e.g. Facebook May 2026"
              className="w-full bg-surface border border-white/8 text-ink text-sm rounded-lg px-3 py-2.5 placeholder:text-muted focus:outline-none focus:border-accent/40 transition-colors"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
              Category
            </label>
            <input
              type="text"
              value={form.category}
              onChange={e => set('category', e.target.value)}
              placeholder="e.g. Social Media, Direct Sales"
              className="w-full bg-surface border border-white/8 text-ink text-sm rounded-lg px-3 py-2.5 placeholder:text-muted focus:outline-none focus:border-accent/40 transition-colors"
            />
          </div>

          {/* Priority */}
          <div>
            <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
              Priority
            </label>
            <div className="relative">
              <select
                value={form.priority}
                onChange={e => set('priority', e.target.value)}
                className="w-full appearance-none bg-surface border border-white/8 text-ink text-sm rounded-lg pl-3 pr-8 py-2.5 focus:outline-none focus:border-accent/40 transition-colors cursor-pointer"
              >
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-muted">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>
            </div>
          </div>

          {/* Info note */}
          <div className="flex gap-2.5 bg-accent/5 border border-accent/15 rounded-lg px-3 py-2.5">
            <svg className="text-accent shrink-0 mt-0.5" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <p className="text-muted text-xs leading-relaxed">
              Lead upload and additional settings will be available after the campaign is created.
            </p>
          </div>
        </div>

        {/* Modal footer */}
        <div className="flex items-center justify-end gap-3 px-6 pb-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-muted hover:text-ink hover:bg-white/5 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-white bg-accent hover:bg-accent/90 rounded-lg transition-colors shadow-lg shadow-accent/20"
          >
            Save Campaign
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function Campaigns() {
  const [campaigns, setCampaigns] = useState([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState(null)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    getCampaigns()
      .then(data => { setCampaigns(data); setLoading(false) })
      .catch(() => {
        setError('Could not load campaigns. Make sure the FastAPI server is running on port 8000.')
        setLoading(false)
      })
  }, [])

  return (
    <>
      <div>
        {/* Page header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-semibold text-ink">Campaigns</h1>
            <p className="text-muted text-sm mt-1">Manage and monitor all lead campaigns</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-accent hover:bg-accent/90 rounded-lg transition-colors shadow-lg shadow-accent/20"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add Campaign
          </button>
        </div>

        {/* Error banner */}
        {error && (
          <div className="mb-4 flex items-center gap-3 rounded-xl border border-danger/25 bg-danger/8 px-4 py-3 text-danger text-sm">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {error}
          </div>
        )}

        {/* Result count */}
        {!loading && !error && (
          <p className="text-muted text-xs mb-3">
            <span className="text-ink font-medium">{campaigns.length}</span> campaign{campaigns.length !== 1 ? 's' : ''}
          </p>
        )}

        {/* Table */}
        <div className="bg-surface-raised rounded-xl border border-white/8 overflow-hidden">
          <table className="w-full text-sm min-w-190">
            <thead>
              <tr className="border-b border-white/8 bg-white/5">
                <th className="text-left text-[11px] font-semibold text-muted uppercase tracking-wider px-4 py-3 w-48">
                  Campaign
                </th>
                <th className="text-left text-[11px] font-semibold text-muted uppercase tracking-wider px-4 py-3">
                  Priority
                </th>
                {COUNT_COLS.map(col => (
                  <th
                    key={col.key}
                    className={`text-center text-[11px] font-semibold uppercase tracking-wider px-4 py-3 ${col.color} opacity-70`}
                  >
                    {col.label}
                  </th>
                ))}
                <th className="text-left text-[11px] font-semibold text-muted uppercase tracking-wider px-4 py-3">
                  Created
                </th>
              </tr>
            </thead>

            {loading ? (
              <TableSkeleton />
            ) : campaigns.length === 0 ? (
              <tbody>
                <tr>
                  <td colSpan={9}>
                    <div className="py-16 text-center">
                      <svg className="mx-auto mb-3 text-muted/30" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
                        <line x1="4" y1="22" x2="4" y2="15" />
                      </svg>
                      <p className="text-muted text-sm font-medium">No campaigns yet</p>
                      <p className="text-muted/60 text-xs mt-1">Click "Add Campaign" to create the first one</p>
                    </div>
                  </td>
                </tr>
              </tbody>
            ) : (
              <tbody>
                {campaigns.map(c => <CampaignRow key={c.id} campaign={c} />)}
              </tbody>
            )}
          </table>
        </div>
      </div>

      {/* Modal rendered outside table to avoid stacking context issues */}
      {showModal && <AddCampaignModal onClose={() => setShowModal(false)} />}
    </>
  )
}
