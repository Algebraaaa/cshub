import PlaygroundShell from './PlaygroundShell'
import VizCard from './VizCard'
import FormulaPanel from './FormulaPanel'

const LINES = [
  'D(P||Q) = Σᵢ P(i) log₂(P(i)/Q(i))    // KL 散度',
  'H(P,Q) = -Σᵢ P(i) log₂ Q(i)          // 交叉熵',
  '关系：H(P,Q) = H(P) + D(P||Q)',
  '// 逐项计算 KL 项和 CE 项',
  '// 注意：D(P||Q) ≠ D(Q||P) 非对称',
  'D(P||Q) ≥ 0（Gibbs 不等式）',
  '交叉熵 = 分类损失 softmax + CE',
]

const PRESETS = [
  { id: 'vs-unif', label: 'P vs 均匀', state: { P: [0.4, 0.35, 0.15, 0.1], Q: [0.25, 0.25, 0.25, 0.25] } },
  { id: 'close', label: '两分布接近', state: { P: [0.3, 0.25, 0.25, 0.2], Q: [0.28, 0.27, 0.23, 0.22] } },
  { id: 'far', label: '两分布远离', state: { P: [0.6, 0.25, 0.1, 0.05], Q: [0.05, 0.1, 0.25, 0.6] } },
]

export default function ItKLDivergencePlayground({ algoFn }) {
  return (
    <PlaygroundShell
      presets={PRESETS}
      initialState={{ P: [0.4, 0.35, 0.15, 0.1], Q: [0.25, 0.25, 0.25, 0.25] }}
      derivePayload={s => ({ P: s.P, Q: s.Q })}
      computeSteps={payload => algoFn(payload)}
      renderViz={({ current }) => (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, minHeight: 420 }}>
          <VizCard>
            <KLViz current={current} />
          </VizCard>
          <FormulaPanel lines={LINES} highlightLine={current.highlightLine} />
        </div>
      )}
    />
  )
}

function KLViz({ current }) {
  const { P, Q, cellIdx, kl, ce, Hp } = current
  const n = P.length
  const W = 380, H = 280, pad = 40
  const groupW = (W - 2 * pad) / n
  const barW = groupW * 0.38
  const maxY = 1.0

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', maxHeight: 320 }}>
      <line x1={pad} y1={H - pad} x2={W - pad} y2={H - pad} stroke="var(--glass-border-strong)" strokeWidth="1.5" />
      <line x1={pad} y1={pad} x2={pad} y2={H - pad} stroke="var(--glass-border-strong)" strokeWidth="1.5" />
      <text x={W/2} y={H - 8} textAnchor="middle" fontSize="11" fill="var(--text-tertiary)">符号 i</text>
      <text x={10} y={H/2} textAnchor="middle" fontSize="11" fill="var(--text-tertiary)" fontFamily="var(--font-mono)" transform={`rotate(-90, 10, ${H/2})`}>概率</text>

      {P.map((_, i) => {
        const active = cellIdx === i
        const cx = pad + i * groupW + groupW / 2
        const hP = (P[i] / maxY) * (H - 2 * pad)
        const hQ = (Q[i] / maxY) * (H - 2 * pad)
        return (
          <g key={i} style={{ transition: 'all 0.3s' }}>
            <rect x={cx - barW - 2} y={H - pad - hP} width={barW} height={hP}
                  fill={active ? 'var(--yellow)' : '#06b6d4'}
                  rx="2"
                  opacity={active ? 1 : 0.85}
                  style={{ filter: active ? 'drop-shadow(0 0 6px var(--yellow))' : 'none', transition: 'all 0.3s' }} />
            <rect x={cx + 2} y={H - pad - hQ} width={barW} height={hQ}
                  fill={active ? 'var(--pink)' : '#8b5cf6'}
                  rx="2"
                  opacity={active ? 1 : 0.85}
                  style={{ filter: active ? 'drop-shadow(0 0 6px var(--pink))' : 'none', transition: 'all 0.3s' }} />
            <text x={cx} y={H - pad + 16} fontSize="10" textAnchor="middle" fill="var(--text-secondary)" fontFamily="var(--font-mono)">i={i+1}</text>
          </g>
        )
      })}
      {/* 图例 */}
      <g transform="translate(180, 10)">
        <rect x="0" y="0" width="10" height="10" fill="#06b6d4" rx="2" />
        <text x="14" y="9" fontSize="10" fill="var(--text-secondary)" fontFamily="var(--font-mono)">真实 P</text>
        <rect x="70" y="0" width="10" height="10" fill="#8b5cf6" rx="2" />
        <text x="84" y="9" fontSize="10" fill="var(--text-secondary)" fontFamily="var(--font-mono)">模型 Q</text>
      </g>
      {/* 结果 */}
      <g transform="translate(40, 40)">
        <rect width={280} height={54} rx="6" fill="var(--accent-soft)" stroke="var(--accent-border)" opacity="0.6" />
        <text x="10" y="16" fontSize="11" fill="var(--text-primary)" fontFamily="var(--font-mono)">
          H(P) = {Hp.toFixed(4)}
        </text>
        <text x="10" y="32" fontSize="11" fill="var(--text-primary)" fontFamily="var(--font-mono)">
          D(P||Q) = {kl.toFixed(4)} 比特
        </text>
        <text x="10" y="48" fontSize="11" fill="var(--accent-light)" fontFamily="var(--font-mono)" fontWeight="700">
          H(P,Q) = {ce.toFixed(4)} = H(P)+D(P||Q)
        </text>
      </g>
    </svg>
  )
}
