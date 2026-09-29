import { useId, useMemo, useState } from 'react'
import { useStepData } from '../../contexts/StepContext'
import { computeVariableSchema, extractVariableMap } from '../../utils/stepProtocol'

const TEXT = {
  title: '\u5f53\u524d\u53d8\u91cf',
  empty: '\u5f53\u524d\u6b65\u9aa4\u6682\u65e0\u53d8\u91cf\u6570\u636e',
  missing: '-',
}

const PREVIEW_LENGTH = 22

function previewValue(formatted, raw) {
  if (formatted.length <= PREVIEW_LENGTH) return formatted
  if (Array.isArray(raw)) {
    const first = raw.slice(0, 2).map(item =>
      ['number', 'boolean', 'string'].includes(typeof item) ? String(item).slice(0, 5) : '…')
    return `[${first.join(', ')}${raw.length > 2 ? ', …' : ''}] (${raw.length})`
  }
  return formatted
}

function expandedValue(formatted, raw) {
  if (!Array.isArray(raw) || !raw.every(item => ['number', 'boolean', 'string'].includes(typeof item))) {
    return formatted
  }
  const values = raw.slice(0, 100).map(item => typeof item === 'string' ? JSON.stringify(item) : String(item))
  return `[${values.join(', ')}${raw.length > 100 ? `, … (共 ${raw.length} 项)` : ''}]`
}

export default function VariablePanel() {
  const stepData = useStepData()
  const { current, steps, step, total } = stepData || {}
  const [expandedKey, setExpandedKey] = useState(null)
  const detailId = useId()

  const schema = useMemo(() => computeVariableSchema(steps), [steps])
  const currentMap = useMemo(() => extractVariableMap(current), [current])
  const expandedEntry = currentMap.get(expandedKey)

  return (
    <aside style={{
      background: 'var(--glass-bg)',
      backdropFilter: 'var(--glass-blur)',
      WebkitBackdropFilter: 'var(--glass-blur)',
      border: '1px solid var(--glass-border)',
      boxShadow: 'var(--glass-shine)',
      borderRadius: 'var(--r-md)',
      padding: '12px 14px',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        marginBottom: schema.length > 0 ? 10 : 0,
      }}>
        <h3 style={{
          fontSize: 13,
          fontWeight: 800,
          color: 'var(--text-primary)',
        }}>{TEXT.title}</h3>
        {total > 0 && (
          <span style={{
            fontSize: 11,
            fontFamily: 'var(--font-mono)',
            color: 'var(--text-tertiary)',
          }}>
            {step + 1}/{total}
          </span>
        )}
      </div>

      {schema.length === 0 ? (
        <div style={{
          fontSize: 12.5,
          color: 'var(--text-tertiary)',
          lineHeight: 1.6,
        }}>{TEXT.empty}</div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 140px), 1fr))',
          gap: 8,
        }}>
          {schema.map(key => {
            const entry = currentMap.get(key)
            const hasValue = !!entry
            const canExpand = hasValue && entry.value.length > PREVIEW_LENGTH
            const Card = canExpand ? 'button' : 'div'
            return (
              <Card
                key={key}
                type={canExpand ? 'button' : undefined}
                aria-label={canExpand ? `查看 ${key} 的更多内容` : undefined}
                aria-expanded={canExpand ? expandedKey === key : undefined}
                aria-controls={canExpand && expandedKey === key ? detailId : undefined}
                title={canExpand ? entry.value : undefined}
                onClick={canExpand ? () => setExpandedKey(expandedKey === key ? null : key) : undefined}
                className={`min-w-0 rounded-md border bg-surface px-2.5 py-2 text-left transition-opacity ${hasValue ? '' : 'opacity-50'} ${expandedKey === key ? 'border-accent-border' : 'border-border-soft'} ${canExpand ? 'w-full cursor-pointer hover:border-accent-border focus-visible:outline-2 focus-visible:outline-accent' : ''}`}
              >
                <div className="mb-0.5 flex min-w-0 items-center justify-between gap-1 font-mono text-[10.5px] text-fg-faint" title={key}>
                  <span className="truncate">{key}</span>
                  {canExpand && <span aria-hidden="true" className="shrink-0">⌄</span>}
                </div>
                <div className={`truncate font-mono text-[12.5px] leading-[1.4] ${hasValue ? 'text-accent' : 'text-fg-faint'}`}>
                  {hasValue ? previewValue(entry.value, current?.[key]) : TEXT.missing}
                </div>
              </Card>
            )
          })}
        </div>
      )}
      {expandedEntry && (
        <div id={detailId} role="region" aria-label={`${expandedKey} 的变量详情`} className="mt-2 rounded-md border border-border-soft bg-surface px-3 py-2">
          <div className="mb-1 flex items-center justify-between gap-2">
            <span className="truncate font-mono text-xs font-semibold text-fg-muted">{expandedKey}</span>
            <button type="button" onClick={() => setExpandedKey(null)} className="shrink-0 text-xs text-fg-muted hover:text-accent">收起</button>
          </div>
          <div className="max-h-40 overflow-y-auto break-all font-mono text-xs leading-relaxed text-accent">
            {expandedValue(expandedEntry.value, current?.[expandedKey])}
          </div>
        </div>
      )}
    </aside>
  )
}
