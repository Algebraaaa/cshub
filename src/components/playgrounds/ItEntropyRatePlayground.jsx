import PlaygroundShell from './PlaygroundShell'
import VizCard from './VizCard'
import FormulaPanel from './FormulaPanel'

const LINES = [
  '马尔可夫信源：π_t · P = π_{t+1}',
  '// 幂法迭代：反复用转移矩阵更新',
  'π₀ = [初始分布]',
  'π₁ = π₀ · P',
  'π₂ = π₁ · P',
  '...',
  '平稳分布 π：π · P = π',
  '熵率 H = Σᵢ πᵢ · H(Y|X=i)',
]

export default function ItEntropyRatePlayground({ algoFn }) {
  return (
    <PlaygroundShell
      presets={[
        { id: 'default', label: '2 状态链', state: {} },
      ]}
      computeSteps={() => algoFn({})}
      renderViz={({ current }) => (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, minHeight: 420 }}>
          <VizCard>
            <EntropyRateViz current={current} />
          </VizCard>
          <FormulaPanel lines={LINES} highlightLine={current.highlightLine} />
        </div>
      )}
    />
  )
}

function EntropyRateViz({ current }) {
  const { P, pi, stepIdx, Hrate, Hsingle } = current
  const n = P.length

  // 状态图
  const W = 360, H = 280
  const positions = n === 2
    ? [{ x: 100, y: 140 }, { x: 260, y: 140 }]
    : n === 3
    ? [{ x: 180, y: 70 }, { x: 80, y: 210 }, { x: 280, y: 210 }]
    : []

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', maxHeight: 320 }}>
      {/* 边 */}
      {P.map((row, i) => row.map((p, j) => {
        if (p < 0.001) return null
        const from = positions[i], to = positions[j]
        if (i === j) {
          // 自环
          const cx = from.x, cy = from.y - 48
          return (
            <g key={`${i}-${j}`}>
              <path d={`M ${from.x} ${from.y - 28} C ${cx - 28} ${cy - 22}, ${cx + 28} ${cy - 22}, ${from.x} ${from.y - 28}`}
                    fill="none" stroke="var(--glass-border-strong)" strokeWidth="1.5" markerEnd="url(#arrow)" />
              <text x={cx} y={cy - 30} fontSize="10" fill="var(--text-secondary)" textAnchor="middle" fontFamily="var(--font-mono)" fontWeight="600">
                {p.toFixed(2)}
              </text>
            </g>
          )
        }
        const dx = to.x - from.x, dy = to.y - from.y
        const len = Math.hypot(dx, dy)
        const ux = dx / len, uy = dy / len
        const startX = from.x + ux * 28, startY = from.y + uy * 28
        const endX = to.x - ux * 30, endY = to.y - uy * 30
        // 偏移一点避免重叠
        const offX = -uy * 6, offY = ux * 6
        return (
          <g key={`${i}-${j}`}>
            <line x1={startX + offX} y1={startY + offY} x2={endX + offX} y2={endY + offY}
                  stroke="var(--accent)" strokeWidth="2" opacity="0.8" markerEnd="url(#arrow)" />
            <text x={(startX + endX) / 2 + offX * 1.4} y={(startY + endY) / 2 + offY * 1.4}
                  fontSize="10" fill="var(--accent-light)" fontFamily="var(--font-mono)" fontWeight="700" textAnchor="middle">
              {p.toFixed(2)}
            </text>
          </g>
        )
      }))}
      <defs>
        <marker id="arrow" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
          <polygon points="0 0, 8 3, 0 6" fill="var(--accent)" />
        </marker>
      </defs>
      {/* 状态节点 */}
      {positions.map((pos, i) => (
        <g key={i}>
          <circle cx={pos.x} cy={pos.y} r="28"
                  fill="var(--surface)"
                  stroke="var(--accent)"
                  strokeWidth="2.5"
                  style={{ filter: 'drop-shadow(0 0 8px var(--accent-soft))' }} />
          <text x={pos.x} y={pos.y - 2} fontSize="15" textAnchor="middle" fill="var(--text-primary)" fontWeight="800">
            S{i}
          </text>
          <text x={pos.x} y={pos.y + 12} fontSize="10" textAnchor="middle" fill="var(--accent-light)" fontFamily="var(--font-mono)" fontWeight="700">
            π={pi[i].toFixed(2)}
          </text>
        </g>
      ))}
      {/* 结果 */}
      <g transform="translate(20, 235)">
        <rect width={320} height={40} rx="6" fill="var(--accent-soft)" stroke="var(--accent-border)" opacity="0.6" />
        <text x="10" y="16" fontSize="11" fill="var(--text-primary)" fontFamily="var(--font-mono)">
          单符号熵 H(π) = {Hsingle.toFixed(4)} 比特
        </text>
        <text x="10" y="32" fontSize="11" fill="var(--accent-light)" fontFamily="var(--font-mono)" fontWeight="700">
          熵率 H = {Hrate.toFixed(4)} 比特/符号 (迭代 {stepIdx})
        </text>
      </g>
    </svg>
  )
}
