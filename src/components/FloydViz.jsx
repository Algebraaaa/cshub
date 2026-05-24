export default function FloydViz({ stepData }) {
  if (!stepData) return null
  const { dist, nodes, k, i, j, relaxed, phase } = stepData
  const fmt = (v) => (v === Infinity ? '∞' : v)

  function cellStyle(r, c) {
    const isResult = phase === 'done'
    const isDiag = r === c
    const isActiveCell = r === i && c === j
    const isKRow = r === k
    const isKCol = c === k
    const isKNode = r === k && c === k

    let bg, border, color, fontWeight

    if (isDiag) {
      bg = 'rgba(255,255,255,0.04)'
      color = 'var(--text-tertiary)'
      fontWeight = 500
    } else if (isResult) {
      bg = dist[r][c] === Infinity ? 'rgba(255,255,255,0.03)' : 'rgba(52,211,153,0.15)'
      color = dist[r][c] === Infinity ? 'var(--text-tertiary)' : '#34d399'
      fontWeight = 600
    } else if (isActiveCell) {
      bg = relaxed ? 'rgba(167,139,250,0.3)' : 'rgba(255,255,255,0.08)'
      border = relaxed ? '2px solid #a78bfa' : '2px solid rgba(255,255,255,0.2)'
      color = relaxed ? '#c4b5fd' : 'var(--text-primary)'
      fontWeight = 700
    } else if (isKNode) {
      bg = 'rgba(245,158,11,0.25)'
      color = '#fbbf24'
      fontWeight = 700
    } else if (isKRow || isKCol) {
      bg = 'rgba(245,158,11,0.08)'
      color = 'var(--text-secondary)'
      fontWeight = 500
    } else {
      bg = 'transparent'
      color = dist[r][c] === Infinity ? 'var(--text-tertiary)' : 'var(--text-secondary)'
      fontWeight = 400
    }

    return {
      background: bg,
      border: border || '1px solid var(--border)',
      color,
      fontWeight,
      width: 44,
      height: 36,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 13,
      fontFamily: 'var(--font-mono)',
      borderRadius: 4,
      transition: 'background 0.25s, color 0.2s',
    }
  }

  return (
    <div style={{ padding: '8px 16px', overflowX: 'auto' }}>
      {/* Current k indicator */}
      {k != null && phase !== 'done' && (
        <div style={{ marginBottom: 12, fontSize: 13, color: 'var(--text-secondary)' }}>
          中间节点 k =
          <span style={{
            marginLeft: 6, padding: '2px 10px', borderRadius: 6,
            background: 'rgba(245,158,11,0.2)', color: '#fbbf24',
            fontFamily: 'var(--font-mono)', fontWeight: 700,
          }}>{nodes[k]}</span>
          {i != null && (
            <>
              <span style={{ marginLeft: 10, color: 'var(--text-tertiary)' }}>松弛</span>
              <span style={{ marginLeft: 6, padding: '2px 10px', borderRadius: 6,
                background: 'rgba(139,92,246,0.2)', color: '#a78bfa',
                fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                dist[{nodes[i]}][{nodes[j]}]
              </span>
            </>
          )}
        </div>
      )}

      {/* Matrix */}
      <div style={{ display: 'inline-block' }}>
        {/* Header row */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 4, marginLeft: 44 }}>
          {nodes.map((nd, c) => (
            <div key={c} style={{
              width: 44, textAlign: 'center',
              fontSize: 12, fontWeight: 700,
              color: k != null && c === k ? '#fbbf24' : 'var(--text-tertiary)',
              fontFamily: 'var(--font-mono)',
              transition: 'color 0.2s',
            }}>{nd}</div>
          ))}
        </div>

        {/* Data rows */}
        {nodes.map((nd, r) => (
          <div key={r} style={{ display: 'flex', gap: 4, marginBottom: 4, alignItems: 'center' }}>
            <div style={{
              width: 36, textAlign: 'right', paddingRight: 8,
              fontSize: 12, fontWeight: 700,
              color: k != null && r === k ? '#fbbf24' : 'var(--text-tertiary)',
              fontFamily: 'var(--font-mono)',
              transition: 'color 0.2s',
            }}>{nd}</div>
            {nodes.map((_, c) => (
              <div key={c} style={cellStyle(r, c)}>
                {fmt(dist[r][c])}
              </div>
            ))}
          </div>
        ))}
      </div>

      {phase === 'done' && (
        <div style={{
          marginTop: 12, fontSize: 12,
          color: '#34d399',
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#34d399', display: 'inline-block' }} />
          全源最短路径已就绪
        </div>
      )}
    </div>
  )
}
