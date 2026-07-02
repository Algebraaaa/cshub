import PlaygroundShell from './PlaygroundShell'
import VizCard from './VizCard'
import FormulaPanel from './FormulaPanel'

const LINES = [
  'C = max_{p(x)} I(X;Y)                 // 定义',
  'Blahut-Arimoto 迭代:',
  '  1. 初始化输入分布 q(x)',
  '  2. r(y) = Σ_x q(x) P(y|x)',
  '  3. I = Σ q(x) P(y|x) log(P(y|x)/r(y))',
  '  4. q\'(x) ∝ exp(Σ_y P(y|x) log(P(y|x)/r(y)))',
  '  5. 归一化 q\'，回到步骤 2',
  'BSC(p) 容量 C = 1 - H(p)（解析解）',
]

export default function ItChannelCapacityPlayground({ algoFn }) {
  return (
    <PlaygroundShell
      presets={[{ id: 'default', label: 'BSC p=0.1' }]}
      computeSteps={() => algoFn()}
      renderViz={({ current }) => (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, minHeight: 420 }}>
          <VizCard>
            <CapacityViz current={current} />
          </VizCard>
          <FormulaPanel lines={LINES} highlightLine={current.highlightLine} />
        </div>
      )}
    />
  )
}

function CapacityViz({ current }) {
  const { iter, trace, capacity, q, r, I } = current
  const W = 400, H = 300
  const pad = 50
  const plotW = W - 2 * pad, plotH = 160
  const maxI = Math.max(1, capacity * 1.2)

  const pts = trace.map((t, i) => [i + 1, Math.min(t.I, maxI)])
  const sx = x => pad + (x / (trace.length + 1)) * plotW
  const sy = y => pad + plotH - (y / maxI) * plotH
  const pathD = pts.length > 1 ? pts.map(([x, y], i) => `${i === 0 ? 'M' : 'L'} ${sx(x)} ${sy(y)}`).join(' ') : ''

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', maxHeight: 340 }}>
      <defs>
        <linearGradient id="cap-g" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#06b6d4" />
          <stop offset="100%" stopColor="#ec4899" />
        </linearGradient>
      </defs>
      {/* 轴 */}
      <line x1={pad} y1={pad + plotH} x2={W - pad} y2={pad + plotH} stroke="var(--glass-border-strong)" strokeWidth="1.5" />
      <line x1={pad} y1={pad} x2={pad} y2={pad + plotH} stroke="var(--glass-border-strong)" strokeWidth="1.5" />
      <text x={W/2} y={pad + plotH + 20} textAnchor="middle" fontSize="11" fill="var(--text-tertiary)">迭代次数</text>
      <text x={14} y={pad + plotH/2} textAnchor="middle" fontSize="10" fill="var(--text-tertiary)" fontFamily="var(--font-mono)" transform={`rotate(-90, 14, ${pad + plotH/2})`}>I(X;Y) 比特</text>
      {/* 容量上限线 */}
      <line x1={pad} y1={sy(capacity)} x2={W - pad} y2={sy(capacity)} stroke="var(--red)" strokeDasharray="4 4" strokeWidth="1.5" opacity="0.7" />
      <text x={W - pad} y={sy(capacity) - 4} textAnchor="end" fontSize="10" fill="var(--red)" fontFamily="var(--font-mono)" fontWeight="700">
        C = {capacity.toFixed(4)}
      </text>
      {/* 曲线 */}
      {pathD && <path d={pathD} fill="none" stroke="url(#cap-g)" strokeWidth="2.5" style={{ filter: 'drop-shadow(0 0 6px rgba(139,92,246,0.5))' }} />}
      {/* 当前点 */}
      {iter > 0 && iter <= trace.length && (
        <>
          <circle cx={sx(iter)} cy={sy(I)} r="6" fill="var(--accent)" stroke="white" strokeWidth="2"
                  style={{ filter: 'drop-shadow(0 0 8px var(--accent))' }} />
          <text x={sx(iter) + 10} y={sy(I) - 6} fontSize="11" fill="var(--accent-light)" fontFamily="var(--font-mono)" fontWeight="700">
            I = {I.toFixed(5)}
          </text>
        </>
      )}
      {/* 刻度 */}
      {Array.from({ length: trace.length }, (_, i) => (
        <g key={i}>
          <line x1={sx(i + 1)} y1={pad + plotH} x2={sx(i + 1)} y2={pad + plotH + 3} stroke="var(--text-tertiary)" />
          <text x={sx(i + 1)} y={pad + plotH + 14} fontSize="9" fill="var(--text-tertiary)" textAnchor="middle" fontFamily="var(--font-mono)">{i + 1}</text>
        </g>
      ))}
      {/* 当前分布 */}
      <g transform={`translate(${pad}, ${pad + plotH + 30})`}>
        <rect width={plotW} height="46" rx="6" fill="var(--accent-soft)" stroke="var(--accent-border)" opacity="0.6" />
        <text x="10" y="16" fontSize="10.5" fill="var(--text-primary)" fontFamily="var(--font-mono)">
          输入 q(x) = [{q.map(v => v.toFixed(4)).join(', ')}]
        </text>
        <text x="10" y="32" fontSize="10.5" fill="var(--text-primary)" fontFamily="var(--font-mono)">
          输出 r(y) = [{r.map(v => v.toFixed(4)).join(', ')}]
        </text>
      </g>
    </svg>
  )
}
