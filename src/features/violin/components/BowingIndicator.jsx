// BowingIndicator: shows an animated bow stroke direction.
// direction: 'down' | 'up' | null

export default function BowingIndicator({ direction = null, label = '' }) {
  if (!direction) return null

  const isDown = direction === 'down'

  return (
    <div className="flex flex-col items-center gap-1.5">
      {label && (
        <div className="text-[10px] font-bold tracking-widest uppercase text-fg-faint">{label}</div>
      )}
      <div className="relative w-20 h-10 flex items-center justify-center">
        <svg viewBox="0 0 80 40" width="80" height="40" xmlns="http://www.w3.org/2000/svg">
          {/* Bow stick */}
          <rect x={8} y={18} width={64} height={4} rx={2} fill="var(--text-tertiary)" opacity={0.4} />
          {/* Arrow */}
          {isDown ? (
            <>
              <line x1={40} y1={2} x2={40} y2={36} stroke="var(--accent)" strokeWidth={2.5} strokeLinecap="round" />
              <polyline points="33,28 40,38 47,28" fill="none" stroke="var(--accent)" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
            </>
          ) : (
            <>
              <line x1={40} y1={38} x2={40} y2={4} stroke="var(--accent)" strokeWidth={2.5} strokeLinecap="round" />
              <polyline points="33,12 40,2 47,12" fill="none" stroke="var(--accent)" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
            </>
          )}
        </svg>
      </div>
      <div className="text-xs font-semibold text-fg-muted">
        {isDown ? '下弓 (↓)' : '上弓 (↑)'}
      </div>
    </div>
  )
}
