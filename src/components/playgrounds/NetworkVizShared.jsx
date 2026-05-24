export function NetworkPanel({ children, minHeight = 360 }) {
  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 10,
      marginBottom: 16,
      padding: '22px 18px',
      overflowX: 'auto',
      minHeight,
    }}>
      {children}
    </div>
  )
}

export function SceneTitle({ eyebrow, title, badge }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
      <div>
        <div style={{ fontSize: 12, color: 'var(--text-tertiary)', fontWeight: 700, letterSpacing: '0.08em' }}>
          {eyebrow}
        </div>
        <div style={{ marginTop: 4, fontSize: 18, color: 'var(--text-primary)', fontWeight: 800 }}>
          {title}
        </div>
      </div>
      {badge}
    </div>
  )
}

export function PhaseBadge({ label, color = 'var(--accent-light)' }) {
  return (
    <span style={{
      padding: '6px 12px',
      borderRadius: 99,
      background: `${color}1f`,
      border: `1px solid ${color}66`,
      color,
      fontSize: 12,
      fontWeight: 800,
      whiteSpace: 'nowrap',
    }}>
      {label}
    </span>
  )
}

export function MetricsBar({ children }) {
  return (
    <div style={{
      display: 'flex',
      gap: 14,
      flexWrap: 'wrap',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 16,
      padding: '10px 14px',
      borderRadius: 8,
      background: 'var(--surface-2)',
      border: '1px solid var(--border)',
      fontFamily: 'var(--font-mono)',
    }}>
      {children}
    </div>
  )
}

export function MetricPill({ label, value, color = 'var(--accent-light)' }) {
  return (
    <span style={{ display: 'inline-flex', gap: 6, alignItems: 'baseline', minWidth: 0 }}>
      <span style={{ fontSize: 11, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</span>
      <strong style={{ color, fontWeight: 800, fontSize: 14 }}>{value}</strong>
    </span>
  )
}

export function TeachingNote({ children }) {
  const hasContent = !!children
  return (
    <div style={{
      marginTop: 10,
      padding: '10px 14px',
      background: hasContent ? 'rgba(251, 191, 36, 0.10)' : 'transparent',
      border: `1px solid ${hasContent ? 'rgba(251, 191, 36, 0.35)' : 'transparent'}`,
      borderRadius: 8,
      fontSize: 12.5,
      color: 'var(--text-secondary)',
      lineHeight: 1.7,
      minHeight: 42,            // reserve space even when empty to avoid layout shift
      visibility: hasContent ? 'visible' : 'hidden',
    }}>
      {children || ' '}
    </div>
  )
}

export function EndpointBox({ x, y, title, subtitle, color }) {
  return (
    <g>
      <rect x={x - 72} y={y - 24} width="144" height="48" rx="8" fill={`${color}18`} stroke={color} strokeOpacity="0.7" />
      <circle cx={x - 52} cy={y} r="5" fill={color} />
      <text x={x} y={y - 4} textAnchor="middle" fill="var(--text-primary)" fontSize="14" fontWeight="900">{title}</text>
      <text x={x} y={y + 14} textAnchor="middle" fill="var(--text-secondary)" fontSize="10" fontWeight="700">{subtitle}</text>
    </g>
  )
}
