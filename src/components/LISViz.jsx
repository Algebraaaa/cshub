const NODE = 40

export default function LISViz({ stepData }) {
  if (!stepData) return null
  const { arr, dp, i: curI, j: curJ, improved, lisPath, phase } = stepData
  const maxDP = Math.max(...dp, 1)

  function nodeColor(idx) {
    const inLIS = lisPath.includes(idx)
    const isI = idx === curI
    const isJ = idx === curJ

    if (phase === 'done' && inLIS)  return { bg: '#10b981', border: '#059669', ring: null }
    if (phase === 'trace' && inLIS) return { bg: '#8b5cf6', border: '#7c3aed', ring: null }
    if (isI) return { bg: 'linear-gradient(135deg, #f59e0b, #d97706)', border: '#f59e0b', ring: null }
    if (isJ && improved) return { bg: 'linear-gradient(135deg, #a78bfa, #7c3aed)', border: '#a78bfa', ring: '0 0 0 3px rgba(167,139,250,0.4), 0 0 16px rgba(167,139,250,0.5)' }
    if (isJ) return { bg: 'linear-gradient(135deg, #6b7280, #4b5563)', border: '#6b7280', ring: '0 0 0 3px rgba(245,158,11,0.3)' }
    return { bg: 'linear-gradient(135deg, #4b5563, #374151)', border: '#374151', ring: null }
  }

  return (
    <div style={{ padding: '8px 16px', fontFamily: 'var(--font-mono)', minWidth: 400 }}>

      {/* Array nodes */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'flex-end' }}>
        {arr.map((v, idx) => {
          const { bg, border, ring } = nodeColor(idx)
          return (
            <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              {/* dp bar */}
              <div style={{
                width: 6,
                height: Math.max(4, Math.round((dp[idx] / maxDP) * 48)),
                background: lisPath.includes(idx) ? '#8b5cf6' : '#4b5563',
                borderRadius: 3,
                transition: 'height 0.3s, background 0.3s',
              }} />
              <div style={{
                width: NODE, height: NODE,
                borderRadius: 10,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: bg,
                border: `2px solid ${border}`,
                color: 'white',
                fontWeight: 700, fontSize: 15,
                boxShadow: ring || '0 2px 8px rgba(0,0,0,0.3)',
                transition: 'all 0.25s',
              }}>{v}</div>
              <span style={{ fontSize: 9, color: 'var(--text-tertiary)' }}>[{idx}]</span>
            </div>
          )
        })}
      </div>

      {/* DP values row */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {dp.map((d, idx) => {
          const isI = idx === curI
          const isJ = idx === curJ
          return (
            <div key={idx} style={{
              width: NODE, height: 24,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: 4,
              fontSize: 12, fontWeight: 600,
              background: isI ? 'rgba(245,158,11,0.2)' : isJ && improved ? 'rgba(167,139,250,0.2)' : 'transparent',
              color: isI ? '#f59e0b' : isJ && improved ? '#a78bfa' : 'var(--text-tertiary)',
              transition: 'all 0.25s',
            }}>
              {d}
            </div>
          )
        })}
      </div>

      {/* Legend row */}
      <div style={{ display: 'flex', gap: 16, fontSize: 11, color: 'var(--text-tertiary)', flexWrap: 'wrap' }}>
        <LegendDot color="#f59e0b" label="当前目标 i" />
        <LegendDot color="#a78bfa" label="比较 j（有更新）" />
        <LegendDot color="#6b7280" label="比较 j（无更新）" />
        <LegendDot color="#8b5cf6" label="LIS 路径" />
        <LegendDot color="#10b981" label="最终 LIS" />
      </div>

      {/* LIS result */}
      {lisPath.length > 0 && (
        <div style={{ marginTop: 12, padding: '10px 14px', borderRadius: 8, background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <span style={{ fontSize: 11, color: 'var(--text-tertiary)', fontWeight: 600 }}>LIS = </span>
          <span style={{ fontSize: 14, color: '#10b981', fontWeight: 700 }}>
            [{lisPath.map(i => arr[i]).join(', ')}]
          </span>
          <span style={{ fontSize: 11, color: 'var(--text-tertiary)', marginLeft: 10 }}>
            长度 {lisPath.length}
          </span>
        </div>
      )}
    </div>
  )
}

function LegendDot({ color, label }) {
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      <span style={{ width: 10, height: 10, borderRadius: 3, background: color, display: 'inline-block' }} />
      {label}
    </span>
  )
}
