import PlaygroundShell from './PlaygroundShell'
import VizCard from './VizCard'
import FormulaPanel from './FormulaPanel'

const LINES = [
  '数据压缩：利用信源统计冗余',
  '// 关键指标',
  'H(X) = -Σ p log p              // 熵（理论下界）',
  'L = Σ pᵢ lᵢ                     // 平均码长',
  'η = H / L                        // 编码效率',
  'ρ = 1 - η                        // 冗余度',
  '// 香农第一定理',
  'H(X) ≤ L < H(X) + 1',
  '存在唯一可译码任意接近 H(X)',
]

export default function ItDataCompressionPlayground({ algoFn }) {
  return (
    <PlaygroundShell
      presets={[{ id: 'default', label: '4 符号示例' }]}
      computeSteps={() => algoFn()}
      renderViz={({ current }) => (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, minHeight: 440 }}>
          <VizCard>
            <DataCompressionViz current={current} />
          </VizCard>
          <FormulaPanel lines={LINES} highlightLine={current.highlightLine} />
        </div>
      )}
    />
  )
}

function DataCompressionViz({ current }) {
  const { syms, fixedCodes, huffCodes, fixedLen, fixedAvg, huffAvg, H, fixedEff, huffEff, fixedRed, huffRed } = current
  const W = 400, Hd = 360
  const barGap = 60

  return (
    <svg viewBox={`0 0 ${W} ${Hd}`} style={{ width: '100%', height: 'auto', maxHeight: 380 }}>
      <defs>
        <linearGradient id="dc-bar-fix" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f97316" />
          <stop offset="100%" stopColor="#ef4444" />
        </linearGradient>
        <linearGradient id="dc-bar-huf" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#06b6d4" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>
      <text x="20" y="22" fontSize="11" fill="var(--text-tertiary)" fontFamily="var(--font-mono)" fontWeight="700">
        符号频率分布
      </text>
      {syms.map((s, i) => (
        <g key={s.s} transform={`translate(${20 + i * barGap}, 40)`}>
          <text x="20" y="0" fontSize="10" textAnchor="middle" fill="var(--text-tertiary)" fontFamily="var(--font-mono)" fontWeight="600">{s.s}</text>
          <text x="20" y="14" fontSize="11" textAnchor="middle" fill="var(--accent-light)" fontFamily="var(--font-mono)" fontWeight="700">{s.f.toFixed(2)}</text>
        </g>
      ))}
      {/* 定长 vs 变长码长对比 */}
      <g transform="translate(20, 90)">
        <text x="0" y="0" fontSize="11" fill="var(--text-tertiary)" fontFamily="var(--font-mono)" fontWeight="700">
          码长对比（左：定长 {fixedLen}bit，右：霍夫曼）
        </text>
        {syms.map((s, i) => {
          const fLen = fixedCodes[s.s].length
          const hLen = huffCodes[s.s].length
          const maxH = 60
          return (
            <g key={s.s} transform={`translate(${i * barGap}, 14)`}>
              {/* 定长 */}
              <rect x="0" y={maxH - fLen * 15} width="18" height={fLen * 15} fill="url(#dc-bar-fix)" rx="2" />
              <text x="9" y={maxH - fLen * 15 - 3} fontSize="9" textAnchor="middle" fill="#f97316" fontFamily="var(--font-mono)" fontWeight="700">{fLen}</text>
              {/* 变长 */}
              <rect x="24" y={maxH - hLen * 15} width="18" height={hLen * 15} fill="url(#dc-bar-huf)" rx="2" />
              <text x="33" y={maxH - hLen * 15 - 3} fontSize="9" textAnchor="middle" fill="#06b6d4" fontFamily="var(--font-mono)" fontWeight="700">{hLen}</text>
            </g>
          )
        })}
      </g>
      {/* 码字表格 */}
      <g transform="translate(20, 185)">
        {['符号', '频率', '定长码', '霍夫曼码'].map((h, i) => (
          <text key={h} x={i * 95 + 40} y="10" fontSize="10" textAnchor="middle" fill="var(--text-tertiary)" fontFamily="var(--font-mono)" fontWeight="700">{h}</text>
        ))}
        {syms.map((s, i) => (
          <g key={s.s} transform={`translate(0, ${24 + i * 20})`}>
            <text x="40" y="14" fontSize="11" textAnchor="middle" fill="var(--text-primary)" fontFamily="var(--font-mono)" fontWeight="700">{s.s}</text>
            <text x="135" y="14" fontSize="10.5" textAnchor="middle" fill="var(--accent-light)" fontFamily="var(--font-mono)" fontWeight="600">{s.f.toFixed(2)}</text>
            <text x="230" y="14" fontSize="10.5" textAnchor="middle" fill="#f97316" fontFamily="var(--font-mono)" fontWeight="700">"{fixedCodes[s.s]}"</text>
            <text x="325" y="14" fontSize="10.5" textAnchor="middle" fill="#06b6d4" fontFamily="var(--font-mono)" fontWeight="700">"{huffCodes[s.s]}"</text>
          </g>
        ))}
      </g>
      {/* 指标总结 */}
      <g transform="translate(20, 290)">
        <rect width={W - 40} height="64" rx="6" fill="var(--accent-soft)" stroke="var(--accent-border)" opacity="0.6" />
        <text x="10" y="18" fontSize="11" fill="var(--text-primary)" fontFamily="var(--font-mono)">
          熵 H = {H.toFixed(4)} 比特
        </text>
        <text x="10" y="36" fontSize="11" fill="#f97316" fontFamily="var(--font-mono)" fontWeight="700">
          定长：L={fixedAvg.toFixed(3)}  η={(fixedEff * 100).toFixed(1)}%  冗余={(fixedRed * 100).toFixed(1)}%
        </text>
        <text x="10" y="54" fontSize="11" fill="#06b6d4" fontFamily="var(--font-mono)" fontWeight="700">
          霍夫曼：L={huffAvg.toFixed(3)}  η={(huffEff * 100).toFixed(1)}%  冗余={(huffRed * 100).toFixed(1)}%
        </text>
      </g>
    </svg>
  )
}
