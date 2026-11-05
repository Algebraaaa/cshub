// 雅思模块共享的轻量 UI 原语（Tailwind，遵循 AGENTS.md token）。
import { Link } from 'react-router-dom'

export function IeltsCard({ children, className = '', ...rest }) {
  return (
    <div className={`glass-card p-5 ${className}`} {...rest}>
      {children}
    </div>
  )
}

export function IeltsButton({ variant = 'primary', children, className = '', ...rest }) {
  const cls = variant === 'ghost' ? 'btn-ghost' : 'btn-primary'
  return (
    <button type="button" className={`${cls} text-sm ${className}`} {...rest}>
      {children}
    </button>
  )
}

const BADGE_TONES = {
  rule: 'border-success/50 text-success',
  model: 'border-accent-border text-accent',
  danger: 'border-danger/50 text-danger',
  warn: 'border-warning/50 text-warning',
  muted: 'border-border-strong text-fg-faint',
  mock: 'border-warning/60 bg-warning/10 text-warning',
}

export function Badge({ tone = 'muted', children }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold ${BADGE_TONES[tone] || BADGE_TONES.muted}`}>
      {children}
    </span>
  )
}

export function Field({ label, hint, children }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold text-fg-muted">{label}</span>
      {children}
      {hint ? <span className="mt-1 block text-[11px] text-fg-faint">{hint}</span> : null}
    </label>
  )
}

export const inputClass = 'w-full rounded-lg border border-border-strong bg-bg px-3 py-2 text-sm text-fg outline-none focus:border-accent'

export function Banner({ tone = 'warn', children }) {
  const cls = {
    warn: 'border-warning/50 bg-warning/10 text-warning',
    info: 'border-accent-border bg-accent-soft text-accent',
    danger: 'border-danger/50 bg-danger/10 text-danger',
    ok: 'border-success/50 bg-success/10 text-success',
  }[tone]
  return (
    <div className={`rounded-lg border px-3 py-2 text-xs leading-relaxed ${cls}`} role="status">
      {children}
    </div>
  )
}

export function EmptyState({ children }) {
  return (
    <div className="rounded-xl border border-dashed border-border-strong p-8 text-center text-sm text-fg-faint">
      {children}
    </div>
  )
}

export function IeltsLink({ to, children, className = '' }) {
  return <Link to={to} className={`text-accent hover:underline ${className}`}>{children}</Link>
}
