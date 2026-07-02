import PlaygroundShell from './PlaygroundShell'
import VizCard from './VizCard'
import FormulaPanel from './FormulaPanel'

const LINES_BSC = [
  'BSC(p): P(Y=X|X) = 1-p, P(Y≠X|X) = p',
  '转移矩阵 P(Y|X) =',
  '  [[1-p, p  ],',
  '   [p,   1-p]]',
  '输入比特 → {以 1-p 正确, 以 p 翻转} → 输出比特',
  '容量 C = 1 - H(p) 比特/信道使用',
]
const LINES_BEC = [
  'BEC(p): P(Y=X|X) = 1-p, P(Y=e|X) = p',
  '转移矩阵 P(Y|X) =',
  '  [[1-p, p, 0],',
  '   [0,   p, 1-p]]',
  '输入比特 → {以 1-p 正确, 以 p 擦除} → 输出 {0,e,1}',
  '容量 C = 1 - p（接收方知道哪里出错）',
]

export default function ItChannelPlayground({ algoFn }) {
  return (
    <PlaygroundShell
      presets={[
        { id: 'bsc01', label: 'BSC p=0.1', state: { type: 'bsc', p: 0.1 } },
        { id: 'bsc03', label: 'BSC p=0.3', state: { type: 'bsc', p: 0.3 } },
        { id: 'bec02', label: 'BEC p=0.2', state: { type: 'bec', p: 0.2 } },
        { id: 'bec05', label: 'BEC p=0.5', state: { type: 'bec', p: 0.5 } },
      ]}
      initialState={{ type: 'bsc', p: 0.1 }}
      derivePayload={s => ({ type: s.type, p: s.p })}
      computeSteps={payload => algoFn(payload)}
      renderViz={({ current, state }) => (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, minHeight: 420 }}>
          <VizCard>
            <ChannelViz current={current} />
          </VizCard>
          {state.type === 'bsc'
            ? <FormulaPanel lines={LINES_BSC} highlightLine={current.highlightLine} title="BSC 信道模型" />
            : <FormulaPanel lines={LINES_BEC} highlightLine={current.highlightLine} title="BEC 信道模型" />}
        </div>
      )}
    />
  )
}

function ChannelViz({ current }) {
  const { type, flipProb, erasureProb, t, demoSeq, outputs, noises, capacity } = current
  const isBSC = type === 'bsc'
  const W = 400, H = 280

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', maxHeight: 320 }}>
      {/* 信源 → 信道 → 信宿 */}
      <g>
        {/* 信源 */}
        <rect x="10" y="100" width="70" height="56" rx="10" fill="rgba(6,182,212,0.2)" stroke="var(--blue)" strokeWidth="1.5" />
        <text x="45" y="122" fontSize="11" textAnchor="middle" fill="var(--blue)" fontWeight="700">信源</text>
        <text x="45" y="140" fontSize="10" textAnchor="middle" fill="var(--text-secondary)" fontFamily="var(--font-mono)">X ∈ {'{0,1}'}</text>
        {/* 信道 */}
        <rect x="155" y="80" width="90" height="96" rx="10" fill="rgba(236,72,153,0.2)" stroke="var(--pink)" strokeWidth="1.5" />
        <text x="200" y="102" fontSize="11" textAnchor="middle" fill="var(--pink)" fontWeight="700">{isBSC ? 'BSC' : 'BEC'}信道</text>
        <text x="200" y="120" fontSize="10" textAnchor="middle" fill="var(--text-secondary)" fontFamily="var(--font-mono)">p={(isBSC ? flipProb : erasureProb).toFixed(2)}</text>
        <text x="200" y="138" fontSize="10" textAnchor="middle" fill="var(--text-secondary)" fontFamily="var(--font-mono)">噪声干扰</text>
        <text x="200" y="156" fontSize="10" textAnchor="middle" fill="var(--accent-light)" fontFamily="var(--font-mono)" fontWeight="700">C={capacity.toFixed(3)}</text>
        {/* 信宿 */}
        <rect x="320" y="100" width="70" height="56" rx="10" fill="rgba(16,185,129,0.2)" stroke="var(--green)" strokeWidth="1.5" />
        <text x="355" y="122" fontSize="11" textAnchor="middle" fill="var(--green)" fontWeight="700">信宿</text>
        <text x="355" y="140" fontSize="10" textAnchor="middle" fill="var(--text-secondary)" fontFamily="var(--font-mono)">Y</text>

        {/* 箭头 */}
        <line x1="80" y1="128" x2="155" y2="128" stroke="var(--accent)" strokeWidth="2" markerEnd="url(#ch-arrow)" />
        <line x1="245" y1="128" x2="320" y2="128" stroke="var(--accent)" strokeWidth="2" markerEnd="url(#ch-arrow)" />

        <defs>
          <marker id="ch-arrow" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill="var(--accent)" />
          </marker>
        </defs>
      </g>

      {/* 传输示例序列 */}
      <g transform="translate(10, 200)">
        <text x="0" y="0" fontSize="11" fill="var(--text-tertiary)" fontFamily="var(--font-mono)" fontWeight="600">
          传输演示（t={t < 0 ? '等待' : t + 1}）：
        </text>
        {demoSeq.map((x, i) => {
          const isActive = t === i
          const hasError = t >= 0 && i <= t && noises[i]
          return (
            <g key={i} transform={`translate(${i * 55}, 16)`}>
              <rect width="48" height="48" rx="6"
                    fill={isActive ? 'var(--accent-soft)' : 'var(--surface)'}
                    stroke={isActive ? 'var(--accent)' : hasError ? 'var(--red)' : 'var(--border)'}
                    strokeWidth={isActive ? 2 : 1}
                    style={{ filter: isActive ? 'drop-shadow(0 0 6px var(--accent-soft))' : 'none', transition: 'all 0.3s' }} />
              <text x="24" y="18" fontSize="11" textAnchor="middle" fill="var(--blue)" fontFamily="var(--font-mono)" fontWeight="700">
                X={x}
              </text>
              <text x="24" y="32" fontSize="9" textAnchor="middle" fill="var(--text-tertiary)" fontFamily="var(--font-mono)">↓</text>
              <text x="24" y="44" fontSize="11" textAnchor="middle"
                    fill={i > t ? 'var(--text-tertiary)' : hasError ? 'var(--red)' : 'var(--green)'}
                    fontFamily="var(--font-mono)" fontWeight="700">
                Y={i > t ? '?' : outputs[i]}
              </text>
            </g>
          )
        })}
      </g>
    </svg>
  )
}
