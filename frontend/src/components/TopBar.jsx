export default function TopBar() {
  return (
    <header
      className="sticky top-0 z-10 h-14 flex items-center gap-4 px-6 border-b border-white/8"
      style={{ background: 'rgba(17,24,39,0.85)', backdropFilter: 'blur(12px)' }}
    >
      {/* Search */}
      <div className="flex-1 max-w-xs">
        <div className="relative flex items-center">
          {/* Search icon */}
          <svg
            className="absolute left-2.5 text-muted pointer-events-none"
            width="14" height="14" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="Search leads, campaigns…"
            className="w-full bg-white/5 border border-white/8 rounded-lg pl-8 pr-3 py-1.5 text-sm text-ink placeholder:text-muted focus:outline-none focus:border-accent/40 focus:bg-white/8 transition-colors"
          />
        </div>
      </div>

      <div className="flex-1" />

      {/* Online status pill */}
      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-teal/20 bg-teal/8 text-teal text-xs font-medium">
        <span className="relative flex h-1.5 w-1.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal opacity-60" />
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-teal" />
        </span>
        Online
      </div>

      {/* Divider */}
      <div className="h-6 w-px bg-white/8" />

      {/* Profile */}
      <div className="flex items-center gap-2.5 cursor-pointer group">
        <div className="w-8 h-8 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center transition-colors group-hover:border-accent/50">
          <span className="text-accent text-xs font-semibold">SJ</span>
        </div>
        <div className="hidden sm:block">
          <p className="text-ink text-sm font-medium leading-none">Sanjani</p>
          <p className="text-muted text-xs mt-0.5">Supervisor</p>
        </div>
      </div>
    </header>
  )
}
