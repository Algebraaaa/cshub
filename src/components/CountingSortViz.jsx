const NODE = 36

export default function CountingSortViz({ stepData }) {
  if (!stepData) return null
  const { input, counts, output, phase, activeInputIdx, activeCountVal, activeOutputIdx } = stepData
  const maxCount = Math.max(...counts, 1)

  return (
    <div style={{ padding: '8px 16px', fontFamily: 'var(--font-mono)', minWidth: 500 }}>
      {/* Original input array */}
      <Label>原始输入</Label>
      <div style={{ display: 'flex', gap: 6, marginBottom: 18, flexWrap: 'wrap' }}>
        {input.map((el, i) => {
          const isActive = activeInputIdx === i
          return (
            <Cell key={el.id}
              value={el.value}
              label={`[${i}]`}
              active={isActive}
              dim={phase === 'output' && activeInputIdx != null && i < activeInputIdx}
              color={isActive ? '#f59e0b' : phase === 'done' ? '#10b981' : undefined}
            />
          )
        })}
      </div>

      {/* Count / prefix array */}
      <Label>{phase === 'prefix' || phase === 'output' || phase === 'done' ? '前缀和数组（输出位置）' : '计数桶 counts[]'}</Label>
      <div style={{ display: 'flex', gap: 4, marginBottom: 18, flexWrap: 'wrap', alignItems: 'flex-end' }}>
        {counts.map((c, v) => {
          const isActive = activeCountVal === v
          const barH = maxCount > 0 ? Math.max(4, Math.round((c / maxCount) * 48)) : 4
          return (
            <div key={v} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
              <span style={{ fontSize: 11, color: isActive ? '#f59e0b' : 'var(--text-tertiary)' }}>{c}</span>
              <div style={{
                width: 30,
                height: barH,
                background: isActive ? '#f59e0b' : c > 0 ? '#6366f1' : 'var(--border)',
                borderRadius: '3px 3px 0 0',
                transition: 'height 0.2s, background 0.2s',
              }} />
              <span style={{ fontSize: 10, color: isActive ? '#f59e0b' : 'var(--text-tertiary)' }}>{v}</span>
            </div>
          )
        })}
      </div>

      {/* Output array */}
      <Label>输出数组</Label>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {output.map((el, i) => {
          const isActive = activeOutputIdx === i
          return (
            // key 含元素 id:空槽被填充时 Cell 重挂载 → pop 落位动画
            <Cell key={el ? `f-${el.id}` : `e-${i}`}
              value={el ? el.value : ''}
              label={`[${i}]`}
              active={isActive}
              empty={!el}
              justLanded={!!el && phase !== 'done'}
              color={
                isActive ? '#a78bfa'
                : phase === 'done' ? '#10b981'
                : el ? '#8b5cf6'
                : undefined
              }
            />
          )
        })}
      </div>
    </div>
  )
}

function Label({ children }) {
  return (
    <div style={{
      fontSize: 10, fontWeight: 700,
      color: 'var(--text-tertiary)',
      letterSpacing: '0.08em',
      marginBottom: 6,
    }}>
      {children}
    </div>
  )
}

function Cell({ value, label, active, dim, empty, color, justLanded }) {
  const bg = color
    ? color
    : empty ? 'transparent'
    : 'linear-gradient(135deg, #6b7280, #4b5563)'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
      <div style={{
        width: NODE, height: NODE,
        borderRadius: 8,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: bg,
        border: empty ? '1px dashed var(--border)' : active ? `2px solid white` : '1px solid transparent',
        color: 'white',
        fontWeight: 700, fontSize: 14,
        opacity: dim ? 0.35 : 1,
        boxShadow: active ? `0 0 0 3px ${color}66, 0 0 18px ${color}99` : 'none',
        transition: 'all 0.25s',
        animation: justLanded ? 'pop 0.3s ease-out' : 'none',
      }}>
        {value !== '' ? value : ''}
      </div>
      <span style={{ fontSize: 9, color: 'var(--text-tertiary)' }}>{label}</span>
    </div>
  )
}
