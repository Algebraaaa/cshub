import PlaygroundShell from './PlaygroundShell'
import VizCard from './VizCard'
import FormulaPanel from './FormulaPanel'

const LINES = [
  '马尔可夫信源：X_t ~ P(X_t | X_{t-1})',
  '转移矩阵 P[i][j] = P(X_t=j | X_{t-1}=i)',
  '// 平稳分布 π：π P = π',
  '幂法迭代：π_{t+1} = π_t · P',
  '// 状态游走模拟',
  'current = S₀',
  'for t from 1 to T:',
  '  current ~ P[current, :]',
]

export default function ItMarkovSourcePlayground({ algoFn }) {
  return (
    <PlaygroundShell
      presets={[{ id: 'default', label: '3 状态天气模型' }]}
      computeSteps={() => algoFn()}
      renderViz={({ current }) => (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, minHeight: 460 }}>
          <VizCard>
            <MarkovSourceViz current={current} />
          </VizCard>
          <FormulaPanel lines={LINES} highlightLine={current.highlightLine} />
        </div>
      )}
    />
  )
}

function MarkovSourceViz({ current }) {
  const { P, states, piTrace, walk, walkTransitions, walkStep, currentState } = current
  const n = states.length
  const W = 400, H = 380
  // 状态节点位置（环形）
  const positions = []
  for (let i = 0; i < n; i++) {
    const angle = -Math.PI / 2 + (i / n) * 2 * Math.PI
    positions.push({ x: 200 + Math.cos(angle) * 110, y: 140 + Math.sin(angle) * 90 })
  }

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', maxHeight: 420 }}>
      <defs>
        <marker id="ms-arrow" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
          <polygon points="0 0, 8 3, 0 6" fill="var(--accent)" />
        </marker>
      </defs>
      {/* 边 */}
      {P.map((row, i) => row.map((p, j) => {
        if (p < 0.01) return null
        const from = positions[i], to = positions[j]
        if (i === j) {
          const cx = from.x, cy = from.y - 55
          return (
            <g key={`${i}-${j}`}>
              <path d={`M ${from.x} ${from.y - 28} C ${cx - 34} ${cy - 24}, ${cx + 34} ${cy - 24}, ${from.x} ${from.y - 28}`}
                    fill="none" stroke="var(--glass-border-strong)" strokeWidth="1.5" markerEnd="url(#ms-arrow)" />
              <text x={cx} y={cy - 30} fontSize="10" fill="var(--accent-light)" textAnchor="middle" fontFamily="var(--font-mono)" fontWeight="700">
                {p.toFixed(2)}
              </text>
            </g>
          )
        }
        const dx = to.x - from.x, dy = to.y - from.y
        const len = Math.hypot(dx, dy)
        const ux = dx / len, uy = dy / len
        const offX = -uy * 8, offY = ux * 8
        const startX = from.x + ux * 28 + offX, startY = from.y + uy * 28 + offY
        const endX = to.x - ux * 30 + offX, endY = to.y - uy * 30 + offY
        const highlight = walkStep >= 0 && walkTransitions[walkStep] && walkTransitions[walkStep].from === i && walkTransitions[walkStep].to === j
        return (
          <g key={`${i}-${j}`}>
            <line x1={startX} y1={startY} x2={endX} y2={endY}
                  stroke={highlight ? 'var(--yellow)' : 'var(--accent)'}
                  strokeWidth={highlight ? 3.5 : 1.5}
                  opacity={highlight ? 1 : 0.65}
                  markerEnd="url(#ms-arrow)"
                  style={{ filter: highlight ? 'drop-shadow(0 0 6px var(--yellow))' : 'none', transition: 'all 0.3s' }} />
            <text x={(startX + endX) / 2 + offX} y={(startY + endY) / 2 + offY - 3}
                  fontSize="10" fill={highlight ? 'var(--yellow)' : 'var(--accent-light)'} fontFamily="var(--font-mono)" fontWeight="700" textAnchor="middle">
              {p.toFixed(2)}
            </text>
          </g>
        )
      }))}
      {/* 状态节点 */}
      {positions.map((pos, i) => {
        const active = currentState === i
        return (
          <g key={i}>
            <circle cx={pos.x} cy={pos.y} r="32"
                    fill={active ? 'var(--yellow)' : 'var(--surface)'}
                    stroke={active ? 'var(--accent)' : 'var(--glass-border-strong)'}
                    strokeWidth={active ? 3 : 2}
                    style={{ filter: active ? 'drop-shadow(0 0 12px var(--yellow))' : 'none', transition: 'all 0.3s' }} />
            <text x={pos.x} y={pos.y - 3} fontSize="14" textAnchor="middle" fill={active ? '#000' : 'var(--text-primary)'} fontWeight="800">
              {states[i]}
            </text>
            <text x={pos.x} y={pos.y + 12} fontSize="9.5" textAnchor="middle"
                  fill={active ? '#000' : 'var(--accent-light)'} fontFamily="var(--font-mono)" fontWeight="700">
              π={(piTrace[piTrace.length - 1]?.[i] ?? 0).toFixed(2)}
            </text>
          </g>
        )
      })}
      {/* 转移矩阵 */}
      <g transform="translate(20, 250)">
        <text x="0" y="0" fontSize="10" fill="var(--text-tertiary)" fontFamily="var(--font-mono)" fontWeight="700">转移矩阵 P：</text>
        {P.map((row, i) => (
          <g key={i} transform={`translate(0, ${14 + i * 18})`}>
            {row.map((p, j) => {
              const highlight = walkStep >= 0 && walkTransitions[walkStep] && walkTransitions[walkStep].from === i && walkTransitions[walkStep].to === j
              return (
                <g key={j} transform={`translate(${j * 60}, 0)`}>
                  <rect width="55" height="16" rx="3"
                        fill={highlight ? 'var(--accent-soft)' : 'var(--surface)'}
                        stroke={highlight ? 'var(--accent)' : 'var(--border)'}
                        strokeWidth={highlight ? 2 : 1}
                        style={{ filter: highlight ? 'drop-shadow(0 0 4px var(--accent-soft))' : 'none', transition: 'all 0.3s' }} />
                  <text x="27.5" y="12" fontSize="10" textAnchor="middle"
                        fill={highlight ? 'var(--accent-light)' : 'var(--text-primary)'} fontFamily="var(--font-mono)" fontWeight={highlight ? 700 : 500}>
                    {p.toFixed(2)}
                  </text>
                </g>
              )
            })}
          </g>
        ))}
      </g>
      {/* 游走路径 */}
      <g transform="translate(10, 350)">
        <text x="0" y="0" fontSize="10" fill="var(--text-tertiary)" fontFamily="var(--font-mono)" fontWeight="700">游走：{walk.slice(0, walkStep + 2).map(s => states[s]).join(' → ')}</text>
      </g>
    </svg>
  )
}
