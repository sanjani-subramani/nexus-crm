import { useEffect, useState } from 'react'
import { getLeads, getCampaigns } from '../api'

// ── Badge / pill style maps ───────────────────────────────────────────────────
const STATUS_STYLE = {
  active:      'bg-accent/10 text-accent',
  converted:   'bg-success/10 text-success',
  void:        'bg-warning/10 text-warning',
  inactive:    'bg-danger/10 text-danger',
  unallocated: 'bg-white/5 text-muted',
}

const TEMP_STYLE = {
  hot:  'bg-danger/10 text-danger',
  warm: 'bg-warning/10 text-warning',
  cold: 'bg-teal/10 text-teal',
}

// ── Small shared components ───────────────────────────────────────────────────
function StatusBadge({ status }) {
  const style = STATUS_STYLE[status] ?? STATUS_STYLE.unallocated
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${style}`}>
      {status}
    </span>
  )
}

function TempPill({ temperature }) {
  if (!temperature) return <span className="text-muted/40 text-xs">—</span>
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${TEMP_STYLE[temperature]}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {temperature}
    </span>
  )
}

// Styled native select wrapped with a chevron icon
function FilterSelect({ value, onChange, children }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={onChange}
        className="appearance-none bg-surface-raised border border-white/8 text-ink text-sm rounded-lg pl-3 pr-8 py-2 cursor-pointer focus:outline-none focus:border-accent/40 transition-colors hover:border-white/15"
      >
        {children}
      </select>
      {/* Chevron */}
      <div className="pointer-events-none absolute inset-y-0 right-2.5 flex items-center text-muted">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>
    </div>
  )
}

// Skeleton rows while loading
function TableSkeleton() {
  const widths = ['w-32', 'w-24', 'w-20', 'w-12', 'w-16', 'w-14', 'w-20']
  return (
    <tbody>
      {Array.from({ length: 7 }).map((_, i) => (
        <tr key={i} className="border-b border-white/5 animate-pulse">
          {widths.map((w, j) => (
            <td key={j} className="px-4 py-4">
              <div className={`h-3 bg-white/8 rounded ${j === 4 || j === 5 ? 'rounded-full' : ''} ${w}`} />
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  )
}

// Lead table row
function LeadRow({ lead }) {
  return (
    <tr className="border-b border-white/5 last:border-0 hover:bg-white/[0.03] transition-colors cursor-pointer">
      <td className="px-4 py-3.5">
        <p className="text-ink font-medium text-sm">{lead.customer_name}</p>
        {lead.zone && <p className="text-muted text-xs mt-0.5">{lead.zone}</p>}
      </td>
      <td className="px-4 py-3.5 font-mono text-xs text-muted tracking-wide">
        {lead.contact_number}
      </td>
      <td className="px-4 py-3.5 text-sm text-muted">
        {lead.campaign_name || <span className="text-white/20">—</span>}
      </td>
      <td className="px-4 py-3.5 text-sm text-muted">
        {lead.product || <span className="text-white/20">—</span>}
      </td>
      <td className="px-4 py-3.5">
        <StatusBadge status={lead.status} />
      </td>
      <td className="px-4 py-3.5">
        <TempPill temperature={lead.temperature} />
      </td>
      <td className="px-4 py-3.5 text-sm text-muted">
        {lead.agent_name || <span className="text-white/20">Unassigned</span>}
      </td>
    </tr>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function Leads() {
  const [leads, setLeads]               = useState([])
  const [filteredLeads, setFilteredLeads] = useState([])
  const [campaigns, setCampaigns]       = useState([])
  const [loading, setLoading]           = useState(true)
  const [error, setError]               = useState(null)
  const [search, setSearch]             = useState('')
  const [filters, setFilters]           = useState({
    status: '',
    campaign_id: '',
    temperature: '',
  })

  // Fetch campaigns once for the dropdown
  useEffect(() => {
    getCampaigns().then(setCampaigns).catch(() => {})
  }, [])

  // Re-fetch leads from the API whenever any dropdown filter changes
  useEffect(() => {
    setLoading(true)
    setError(null)

    const params = {}
    if (filters.status)      params.status      = filters.status
    if (filters.campaign_id) params.campaign_id = filters.campaign_id
    if (filters.temperature) params.temperature = filters.temperature

    getLeads(params)
      .then(data => { setLeads(data); setLoading(false) })
      .catch(() => {
        setError('Could not load leads. Make sure the FastAPI server is running on port 8000.')
        setLoading(false)
      })
  }, [filters])

  // Client-side search across customer name and contact number
  useEffect(() => {
    if (!search.trim()) {
      setFilteredLeads(leads)
    } else {
      const q = search.toLowerCase()
      setFilteredLeads(
        leads.filter(l =>
          l.customer_name.toLowerCase().includes(q) ||
          l.contact_number.includes(q)
        )
      )
    }
  }, [search, leads])

  const setFilter = (key, value) =>
    setFilters(prev => ({ ...prev, [key]: value }))

  return (
    <div>
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-ink">Leads</h1>
        <p className="text-muted text-sm mt-1">Browse, filter, and manage all leads</p>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        {/* Status dropdown */}
        <FilterSelect value={filters.status} onChange={e => setFilter('status', e.target.value)}>
          <option value="">All Statuses</option>
          <option value="unallocated">Unallocated</option>
          <option value="active">Active</option>
          <option value="converted">Converted</option>
          <option value="void">Void</option>
          <option value="inactive">Inactive</option>
        </FilterSelect>

        {/* Campaign dropdown */}
        <FilterSelect value={filters.campaign_id} onChange={e => setFilter('campaign_id', e.target.value)}>
          <option value="">All Campaigns</option>
          {campaigns.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </FilterSelect>

        {/* Temperature dropdown */}
        <FilterSelect value={filters.temperature} onChange={e => setFilter('temperature', e.target.value)}>
          <option value="">All Temperatures</option>
          <option value="hot">Hot</option>
          <option value="warm">Warm</option>
          <option value="cold">Cold</option>
        </FilterSelect>

        {/* Text search — client-side */}
        <div className="relative flex items-center flex-1 min-w-48">
          <svg
            className="absolute left-3 text-muted pointer-events-none"
            width="14" height="14" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or number…"
            className="w-full bg-surface-raised border border-white/8 text-ink text-sm rounded-lg pl-9 pr-3 py-2 placeholder:text-muted focus:outline-none focus:border-accent/40 transition-colors hover:border-white/15"
          />
          {/* Clear button */}
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2.5 text-muted hover:text-ink transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>
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
          Showing <span className="text-ink font-medium">{filteredLeads.length}</span>{' '}
          lead{filteredLeads.length !== 1 ? 's' : ''}
          {search && ` matching "${search}"`}
        </p>
      )}

      {/* Table */}
      <div className="bg-surface-raised rounded-xl border border-white/8 overflow-hidden">
        <table className="w-full text-sm min-w-[720px]">
          <thead>
            <tr className="border-b border-white/8 bg-white/5">
              {['Customer Name', 'Contact No.', 'Campaign', 'Product', 'Status', 'Temperature', 'Agent'].map(col => (
                <th
                  key={col}
                  className="text-left text-[11px] font-semibold text-muted uppercase tracking-wider px-4 py-3"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>

          {loading ? (
            <TableSkeleton />
          ) : filteredLeads.length === 0 ? (
            <tbody>
              <tr>
                <td colSpan={7}>
                  <div className="py-16 text-center">
                    <svg className="mx-auto mb-3 text-muted/30" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                    <p className="text-muted text-sm font-medium">No leads match these filters</p>
                    <p className="text-muted/60 text-xs mt-1">Try adjusting the dropdowns or clearing the search</p>
                  </div>
                </td>
              </tr>
            </tbody>
          ) : (
            <tbody>
              {filteredLeads.map(lead => (
                <LeadRow key={lead.id} lead={lead} />
              ))}
            </tbody>
          )}
        </table>
      </div>
    </div>
  )
}
