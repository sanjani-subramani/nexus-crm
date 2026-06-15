import { useEffect, useRef } from 'react'

// Fixed-position auto-dismissing notification.
// toast = { type: 'success' | 'error', message: string } | null
export default function Toast({ toast, onDismiss }) {
  // Keep a ref so the timeout always calls the latest onDismiss
  // without adding it to the effect deps (which would reset the timer on every render).
  const dismissRef = useRef(onDismiss)
  dismissRef.current = onDismiss

  useEffect(() => {
    if (!toast) return
    const id = setTimeout(() => dismissRef.current(), 3500)
    return () => clearTimeout(id)
  }, [toast])

  if (!toast) return null

  const isError = toast.type === 'error'

  return (
    <div
      role="status"
      className={`fixed bottom-6 right-6 z-[200] flex items-center gap-3 px-4 py-3 rounded-xl border shadow-2xl text-sm font-medium ${
        isError
          ? 'bg-surface-raised border-danger/30'
          : 'bg-surface-raised border-success/30'
      }`}
    >
      {isError ? (
        <svg className="text-danger shrink-0" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      ) : (
        <svg className="text-success shrink-0" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      )}
      <span className="text-ink">{toast.message}</span>
      <button
        onClick={onDismiss}
        className="ml-1 text-muted hover:text-ink transition-colors p-0.5 shrink-0"
        aria-label="Dismiss"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  )
}
