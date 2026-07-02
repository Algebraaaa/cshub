import PlaygroundShell from './PlaygroundShell'
import VizCard from './VizCard'
import FormulaPanel from './FormulaPanel'

const LINES = [
  'ShannonFano(X): 次优前缀码',
  '符号按频率降序排列',
  'if |group| ≤ 1: return',
  'split ← 使上下两部分累计频率最接近的切分',
  '上半部分各符号码字追加 "0"',
  '下半部分各符号码字追加 "1"',
  '递归处理上下两部分',
  'L = Σ fᵢ · lᵢ，η = H / L（次优）',
]

const PRESETS = [
  { id: 'p1', label: '5 符号', state: { symbols: [{s:'A',f:.4},{s:'B',f:.3},{s:'C',f:.15},{s:'D',f:.1},{s:'E',f:.05}] } },
  { id: 'p2', label: '4 符号', state: { symbols: [{s:'A',f:.5},{s:'B',f:.25},{s:'C',f:.15},{s:'D',f:.1}] } },
]

export default function ItShannonFanoPlayground({ algoFn }) {
  return (
    <PlaygroundShell
      presets={PRESETS}
      initialState={{ symbols: [{s:'A',f:.4},{s:'B',f:.3},{s:'C',f:.15},{s:'D',f:.1},{s:'E',f:.05}] }}
      derivePayload={s => ({ symbols: s.symbols })}
      computeSteps={payload => algoFn(payload)}
      renderViz={({ current }) => (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, minHeight: 420 }}>
          <VizCard>
            <SFViz current={current} />
          </VizCard>
          <FormulaPanel lines={LINES} highlightLine={current.highlightLine} />
        </div>
      )}
    />
  )
}

function SFViz({ current }) {
  const { syms, trace, codes, step, avgLen, H, efficiency } = current
  const W = 400, Hv = 340

  return (
    <svg viewBox={`0 0 ${W} ${Hv}`} style={{ width: '100%', height: 'auto', maxHeight: 360 }}>
      {/* 表格 */}
      <g transform="translate(20, 20)">
        <text x="0" y="0" fontSize="10" fill="var(--text-tertiary)" fontFamily="var(--font-mono)" fontWeight="700">符号（按频率降序）</text>
        <g transform="translate(0, 14)">
          {['符号', '频率', '码字'].map((h, i) => (
            <text key={h} x={i * 100 + 20} y="10" fontSize="10.5" fill="var(--text-tertiary)" fontFamily="var(--font-mono)" fontWeight="700" textAnchor="middle">{h}</text>
          ))}
          {syms.map((s, i) => {
            const t = step >= 0 ? trace.find(tr => [...tr.left, ...tr.right].some(x => x.s === s.s)) : null
            const isActiveLeft = t && step >= 0 && trace[step] === t && trace[step].left.some(x => x.s === s.s)
            const isActiveRight = t && step >= 0 && trace[step] === t && trace[step].right.some(x => x.s === s.s)
            const bg = isActiveLeft ? 'var(--blue)' : isActiveRight ? 'var(--pink)' : 'var(--surface)'
            return (
              <g key={s.s} transform={`translate(0, ${28 + i * 28})`} style={{ transition: 'all 0.3s' }}>
                <rect x="0" y="0" width="280" height="24" rx="4"
                      fill={bg} opacity={isActiveLeft || isActiveRight ? 0.25 : 1}
                      stroke={isActiveLeft || isActiveRight ? 'var(--accent)' : 'var(--border)'}
                      strokeWidth={isActiveLeft || isActiveRight ? 2 : 1} />
                <text x="20" y="16" fontSize="12" textAnchor="middle"
                      fill="var(--text-primary)" fontFamily="var(--font-mono)" fontWeight="800">{s.s}</text>
                <text x="120" y="16" fontSize="11" textAnchor="middle"
                      fill="var(--accent-light)" fontFamily="var(--font-mono)" fontWeight="700">{s.f.toFixed(3)}</text>
                <text x="220" y="16" fontSize="11" textAnchor="middle"
                      fill={codes[s.s] ? 'var(--green)' : 'var(--text-tertiary)'}
                      fontFamily="var(--font-mono)" fontWeight="700">
                  "{codes[s.s] || ''}"
                </text>
              </g>
            )
          })}
        </g>
      </g>
      {/* 当前切分信息 */}
      {step >= 0 && step < trace.length && (
        <g transform="translate(20, 200)">
          <rect width={W - 40} height="52" rx="6" fill="var(--accent-soft)" stroke="var(--accent-border)" opacity="0.7" />
          <text x="10" y="16" fontSize="11" fill="var(--text-primary)" fontFamily="var(--font-mono)" fontWeight="700">
            第 {step + 1} 次切分 [前缀 "{trace[step].prefix}"]
          </text>
          <text x="10" y="32" fontSize="10.5" fill="var(--blue)" fontFamily="var(--font-mono)" fontWeight="600">
            左(0): {trace[step].left.map(x => x.s).join(',')}  Σf={trace[step].leftSum.toFixed(3)}
          </text>
          <text x="10" y="46" fontSize="10.5" fill="var(--pink)" fontFamily="var(--font-mono)" fontWeight="600">
            右(1): {trace[step].right.map(x => x.s).join(',')}  Σf={trace[step].rightSum.toFixed(3)}
          </text>
        </g>
      )}
      {/* 结果 */}
      <g transform="translate(20, 270)">
        <rect width={W - 40} height="60" rx="6" fill="var(--surface)" stroke="var(--border)" />
        <text x="10" y="16" fontSize="11" fill="var(--text-primary)" fontFamily="var(--font-mono)">
          码字：{Object.entries(codes).map(([s, c]) => `${s}→"${c}"(${c.length}b)`).join('  ')}
        </text>
        <text x="10" y="34" fontSize="11" fill="var(--text-primary)" fontFamily="var(--font-mono)">
          H = {H.toFixed(4)}   L = {avgLen.toFixed(4)}
        </text>
        <text x="10" y="50" fontSize="11" fill="var(--accent-light)" fontFamily="var(--font-mono)" fontWeight="700">
          效率 η = {(efficiency * 100).toFixed(2)}%（与霍夫曼编码对比，香农-费诺为次优）
        </text>
      </g>
    </svg>
  )
}
