import PlaygroundShell from './PlaygroundShell'
import VizCard from './VizCard'
import FormulaPanel from './FormulaPanel'

const LINES = [
  'H(X) = -Σᵢ p(xᵢ) log₂ p(xᵢ)       // 定义',
  '给定分布：p = [p₁, p₂, ..., pₙ]',
  '逐项计算 -pᵢ·log₂ pᵢ 并累加',
  '// 第一项：-p₁ log p₁',
  '// 第二项：-p₂ log p₂',
  '// ...',
  'H(X) = Σᵢ termᵢ',
  '均匀分布时熵最大 = log₂ n',
]

const PRESETS = [
  { id: 'fair', label: '均匀 4 值', state: { probs: [0.25, 0.25, 0.25, 0.25] } },
  { id: 'biased', label: '偏置分布', state: { probs: [0.5, 0.25, 0.125, 0.125] } },
  { id: 'skewed', label: '极偏分布', state: { probs: [0.8, 0.1, 0.07, 0.03] } },
  { id: 'coin', label: '偏置硬币', state: { probs: [0.9, 0.1] } },
]

export default function ItEntropyPlayground({ algoFn }) {
  return (
    <PlaygroundShell
      presets={PRESETS}
      initialState={{ probs: [0.5, 0.25, 0.125, 0.125] }}
      derivePayload={s => ({ probs: s.probs })}
      computeSteps={payload => algoFn(payload)}
      renderViz={({ current }) => (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, minHeight: 420 }}>
          <VizCard>
            <EntropyViz current={current} />
          </VizCard>
          <FormulaPanel lines={LINES} highlightLine={current.highlightLine} />
        </div>
      )}
    />
  )
}

function EntropyViz({ current }) {
  const { p, H, n, activeIdx } = current
  const W = 380, Ht = 260
  const pad = 40
  const barW = (W - 2 * pad) / n * 0.7
  const gap = (W - 2 * pad) / n * 0.3
  const maxY = Math.max(1.2, H + 0.3)

  return (
    <svg viewBox={`0 0 ${W} ${Ht}`} style={{ width: '100%', height: 'auto', maxHeight: 320 }}>
      <defs>
        <linearGradient id="ent-bar-g" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#06b6d4" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
        <linearGradient id="ent-bar-act" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#f97316" />
        </linearGradient>
      </defs>
      {/* 轴 */}
      <line x1={pad} y1={Ht - pad} x2={W - pad} y2={Ht - pad} stroke="var(--glass-border-strong)" strokeWidth="1.5" />
      <line x1={pad} y1={pad} x2={pad} y2={Ht - pad} stroke="var(--glass-border-strong)" strokeWidth="1.5" />
      <text x={W/2} y={Ht - 8} textAnchor="middle" fontSize="11" fill="var(--text-tertiary)">符号 xᵢ</text>
      <text x={10} y={Ht/2} textAnchor="middle" fontSize="11" fill="var(--text-tertiary)" fontFamily="var(--font-mono)" transform={`rotate(-90, 10, ${Ht/2})`}>p(xᵢ)</text>
      {/* 柱 */}
      {p.map((pi, i) => {
        const x = pad + i * (barW + gap) + gap / 2
        const h = (pi / maxY) * (Ht - 2 * pad)
        const active = activeIdx === i
        return (
          <g key={i} style={{ transition: 'all 0.3s' }}>
            <rect x={x} y={Ht - pad - h} width={barW} height={h}
                  fill={active ? 'url(#ent-bar-act)' : 'url(#ent-bar-g)'}
                  rx="3"
                  stroke={active ? 'var(--yellow)' : 'none'}
                  strokeWidth={active ? 2 : 0}
                  style={{ filter: active ? 'drop-shadow(0 0 6px var(--yellow))' : 'none', transition: 'all 0.3s' }} />
            <text x={x + barW / 2} y={Ht - pad + 16} fontSize="10" textAnchor="middle" fill="var(--text-secondary)" fontFamily="var(--font-mono)">
              x{i+1}
            </text>
            <text x={x + barW / 2} y={Ht - pad - h - 6} fontSize="10" textAnchor="middle" fill={active ? 'var(--yellow)' : 'var(--accent-light)'} fontFamily="var(--font-mono)" fontWeight="600">
              {pi.toFixed(3)}
            </text>
          </g>
        )
      })}
      {/* 信息块 */}
      <g transform={`translate(${pad}, ${pad + 10})`}>
        <rect width={240} height={36} rx="8" fill="var(--accent-soft)" stroke="var(--accent-border)" opacity="0.6" />
        <text x="10" y="15" fontSize="10.5" fill="var(--accent-light)" fontFamily="var(--font-mono)">
          H(X) = {H.toFixed(4)} 比特
        </text>
        <text x="10" y="30" fontSize="10" fill="var(--text-secondary)" fontFamily="var(--font-mono)">
          最大熵 (均匀) = {(Math.log2(n)).toFixed(4)} 比特
        </text>
      </g>
    </svg>
  )
}
