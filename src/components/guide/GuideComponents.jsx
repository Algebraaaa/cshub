/**
 * 信息卡片组件（Glassmorphic 风格）
 * type: 'tip' | 'warning' | 'info' | 'danger' | 'success'
 */
const STYLES = {
  tip: {
    bg: 'rgba(52,211,153,0.06)',
    border: 'rgba(52,211,153,0.25)',
    glow: 'rgba(52,211,153,0.12)',
    icon: '💡',
    label: '技巧',
    color: '#34d399',
  },
  warning: {
    bg: 'rgba(251,191,36,0.06)',
    border: 'rgba(251,191,36,0.25)',
    glow: 'rgba(251,191,36,0.12)',
    icon: '⚠️',
    label: '注意',
    color: '#fbbf24',
  },
  info: {
    bg: 'rgba(96,165,250,0.06)',
    border: 'rgba(96,165,250,0.25)',
    glow: 'rgba(96,165,250,0.12)',
    icon: 'ℹ️',
    label: '说明',
    color: '#60a5fa',
  },
  danger: {
    bg: 'rgba(248,113,113,0.06)',
    border: 'rgba(248,113,113,0.25)',
    glow: 'rgba(248,113,113,0.12)',
    icon: '🚨',
    label: '重要',
    color: '#f87171',
  },
  success: {
    bg: 'rgba(52,211,153,0.06)',
    border: 'rgba(52,211,153,0.25)',
    glow: 'rgba(52,211,153,0.12)',
    icon: '✅',
    label: '完成',
    color: '#34d399',
  },
}

export function InfoCard({ type = 'info', title, children }) {
  const s = STYLES[type]
  return (
    <div style={{
      background: s.bg,
      border: `1px solid ${s.border}`,
      borderLeft: `3px solid ${s.color}`,
      borderRadius: 14,
      padding: '14px 18px',
      margin: '16px 0',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      boxShadow: `0 4px 24px ${s.glow}`,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: children ? 8 : 0 }}>
        <span style={{ fontSize: 15 }}>{s.icon}</span>
        {title && (
          <span style={{ fontSize: 13, fontWeight: 700, color: s.color }}>{title}</span>
        )}
        {!title && (
          <span style={{ fontSize: 10, fontWeight: 700, color: s.color, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{s.label}</span>
        )}
      </div>
      {children && (
        <div style={{ fontSize: 13.5, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
          {children}
        </div>
      )}
    </div>
  )
}

/**
 * 步骤卡片 — 带数字序号的操作步骤
 */
export function StepCard({ number, title, children, color = 'var(--accent)' }) {
  return (
    <div style={{
      display: 'flex', gap: 16,
      padding: '16px 0',
      borderBottom: '1px solid var(--glass-border)',
    }}>
      <div style={{
        width: 32, height: 32, borderRadius: 10, flexShrink: 0,
        background: `${color}18`,
        border: `1.5px solid ${color}44`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 13, fontWeight: 800, color,
        marginTop: 2,
        backdropFilter: 'blur(10px)',
        boxShadow: `0 2px 8px ${color}22`,
      }}>
        {number}
      </div>
      <div style={{ flex: 1 }}>
        {title && (
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
            {title}
          </div>
        )}
        <div style={{ fontSize: 13.5, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
          {children}
        </div>
      </div>
    </div>
  )
}

/**
 * 比较表格 — Glassmorphic 版本
 */
export function CompareTable({ headers, rows }) {
  return (
    <div style={{
      border: '1px solid var(--glass-border-strong)',
      borderRadius: 16,
      overflowX: 'auto',
      WebkitOverflowScrolling: 'touch',
      margin: '16px 0',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      background: 'var(--glass-bg)',
      boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
    }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 'max-content' }}>
        <thead>
          <tr style={{ background: 'var(--glass-bg-mid)' }}>
            {headers.map((h, i) => (
              <th key={i} style={{
                padding: '11px 18px', textAlign: 'left',
                fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)',
                textTransform: 'uppercase', letterSpacing: '0.08em',
                borderBottom: '1px solid var(--glass-border-strong)',
              }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} style={{ borderBottom: ri < rows.length - 1 ? '1px solid var(--glass-border)' : 'none' }}>
              {row.map((cell, ci) => (
                <td key={ci} style={{
                  padding: '11px 18px',
                  fontSize: 13, color: ci === 0 ? 'var(--text-primary)' : 'var(--text-secondary)',
                  fontWeight: ci === 0 ? 600 : 400,
                  background: ri % 2 !== 0 ? 'var(--glass-bg)' : 'transparent',
                }}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/**
 * 资源卡片（链接 + 描述）— Glassmorphic 版本
 */
export function ResourceCard({ title, url, desc, tag, tagColor = 'var(--accent)' }) {
  return (
    <a href={url} target="_blank" rel="noreferrer" style={{
      display: 'flex', alignItems: 'flex-start', gap: 14,
      padding: '14px 18px',
      background: 'var(--glass-bg-mid)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      border: '1px solid var(--glass-border-strong)',
      borderRadius: 14,
      margin: '8px 0',
      transition: 'all 0.2s cubic-bezier(0.2,0.8,0.2,1)',
      textDecoration: 'none',
      boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
    }}
    onMouseEnter={e => {
      e.currentTarget.style.borderColor = 'var(--accent-border)'
      e.currentTarget.style.background = 'var(--glass-bg-strong)'
      e.currentTarget.style.transform = 'translateY(-2px)'
      e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)'
    }}
    onMouseLeave={e => {
      e.currentTarget.style.borderColor = 'var(--glass-border-strong)'
      e.currentTarget.style.background = 'var(--glass-bg-mid)'
      e.currentTarget.style.transform = 'translateY(0)'
      e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.06)'
    }}>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{title}</span>
          {tag && (
            <span style={{
              fontSize: 10, padding: '2px 8px', borderRadius: 99,
              background: `${tagColor}18`,
              border: `1px solid ${tagColor}33`,
              color: tagColor, fontWeight: 700,
            }}>{tag}</span>
          )}
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-tertiary)', lineHeight: 1.5 }}>{desc}</div>
      </div>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="2" style={{ flexShrink: 0, marginTop: 2 }}>
        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
        <polyline points="15 3 21 3 21 9"/>
        <line x1="10" y1="14" x2="21" y2="3"/>
      </svg>
    </a>
  )
}

/**
 * 横向占满的提示横幅 — 区别于 InfoCard 的小卡片，适合页面顶部声明（免责声明、风险提示）。
 */
export function Banner({ type = 'info', title, children }) {
  const s = STYLES[type] || STYLES.info
  return (
    <div style={{
      width: '100%',
      padding: 'var(--space-4) var(--space-5)',
      margin: 'var(--space-3) 0',
      background: s.bg,
      border: `1px solid ${s.border}`,
      borderLeft: `4px solid ${s.color}`,
      borderRadius: 12,
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      boxShadow: `0 4px 20px ${s.glow}`,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: children ? 6 : 0 }}>
        <span style={{ fontSize: 'var(--fs-lg)' }}>{s.icon}</span>
        {title && (
          <span style={{
            fontSize: 'var(--fs-md)', fontWeight: 700, color: s.color,
            letterSpacing: '0.01em',
          }}>{title}</span>
        )}
      </div>
      {children && (
        <div style={{
          fontSize: 'var(--fs-sm)',
          color: 'var(--text-secondary)',
          lineHeight: 'var(--lh-loose)',
        }}>
          {children}
        </div>
      )}
    </div>
  )
}

/**
 * 错误提示框 — 用于工具类页面的语法 / 参数错误。
 * 比 InfoCard danger 更紧凑，避免抢戏。
 */
export function ErrorBox({ children, title }) {
  if (!children) return null
  return (
    <div role="alert" aria-live="polite" style={{
      padding: 'var(--space-3) var(--space-4)',
      margin: 'var(--space-2) 0',
      background: 'rgba(248, 113, 113, 0.10)',
      border: '1px solid rgba(248, 113, 113, 0.35)',
      borderRadius: 8,
      fontFamily: 'var(--font-mono)',
      fontSize: 'var(--fs-sm)',
      color: '#fca5a5',
      lineHeight: 'var(--lh-normal)',
      display: 'flex',
      gap: 10,
      alignItems: 'flex-start',
    }}>
      <span style={{ fontSize: 'var(--fs-md)', flexShrink: 0 }}>⚠</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        {title && <div style={{ fontWeight: 700, marginBottom: 4 }}>{title}</div>}
        <div style={{ wordBreak: 'break-word' }}>{children}</div>
      </div>
    </div>
  )
}
