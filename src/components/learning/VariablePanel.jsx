import { useMemo } from 'react'
import { useStepData } from '../../contexts/StepContext'
import { computeVariableSchema, extractVariableMap } from '../../utils/stepProtocol'

const TEXT = {
  title: '\u5f53\u524d\u53d8\u91cf',
  empty: '\u5f53\u524d\u6b65\u9aa4\u6682\u65e0\u53d8\u91cf\u6570\u636e',
  missing: '-',
}

export default function VariablePanel() {
  const stepData = useStepData()
  const { current, steps, step, total } = stepData || {}

  const schema = useMemo(() => computeVariableSchema(steps), [steps])
  const currentMap = useMemo(() => extractVariableMap(current), [current])

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
          gridTemplateColumns: 'repeat(auto-fit, minmax(96px, 1fr))',
          gap: 8,
        }}>
          {schema.map(key => {
            const entry = currentMap.get(key)
            const hasValue = !!entry
            return (
              <div key={key} style={{
                minWidth: 0,
                padding: '8px 10px',
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                opacity: hasValue ? 1 : 0.5,
                transition: 'opacity 0.15s',
              }}>
                <div style={{
                  fontSize: 10.5,
                  color: 'var(--text-tertiary)',
                  fontFamily: 'var(--font-mono)',
                  marginBottom: 3,
                }}>{key}</div>
                <div title={entry?.value} style={{
                  fontSize: 12.5,
                  color: hasValue ? 'var(--accent-light)' : 'var(--text-tertiary)',
                  fontFamily: 'var(--font-mono)',
                  whiteSpace: 'normal',
                  wordBreak: 'break-all',
                  overflow: 'hidden',
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  lineHeight: 1.4,
                }}>{hasValue ? entry.value : TEXT.missing}</div>
              </div>
            )
          })}
        </div>
      )}
    </aside>
  )
}
