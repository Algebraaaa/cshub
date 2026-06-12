import PlaygroundShell from './PlaygroundShell'
import VizCard from './VizCard'
import FormulaPanel from './FormulaPanel'

const LINES = [
  'H(X,Y) = -Σᵢ Σⱼ p(xᵢ,yⱼ) log p(xᵢ,yⱼ)',
  '// 先计算边缘分布 p(x), p(y)',
  'H(Y|X) = -Σᵢ Σⱼ p(xᵢ,yⱼ) log(p(yⱼ|xᵢ))',
  '// 逐单元格计算联合熵项与条件熵项',
  'H(X,Y) = Σ term_xy',
  'H(Y|X) = Σ term_cond',
  '// 链法则：H(X,Y) = H(X) + H(Y|X)',
]

const PRESETS = [
  { id: 'p1', label: '2×3 表格', state: { table: [[1/8, 1/8, 0], [1/8, 1/4, 1/8]] } },
  { id: 'p2', label: '相关 2×2', state: { table: [[0.4, 0.1], [0.1, 0.4]] } },
  { id: 'p3', label: '独立 2×2', state: { table: [[0.2, 0.3], [0.2, 0.3]] } },
]

export default function ItJointEntropyPlayground({ algoFn }) {
  return (
    <PlaygroundShell
      presets={PRESETS}
      initialState={{ table: [[1/8, 1/8, 0], [1/8, 1/4, 1/8]] }}
      derivePayload={s => ({ table: s.table })}
      computeSteps={payload => algoFn(payload)}
      renderViz={({ current }) => (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, minHeight: 420 }}>
          <VizCard>
            <JointEntropyViz current={current} />
          </VizCard>
          <FormulaPanel lines={LINES} highlightLine={current.highlightLine} />
        </div>
      )}
    />
  )
}

function JointEntropyViz({ current }) {
  const { P, px, py, cells, cellIdx, Hxy, Hygx, Hx, Hy } = current
  const m = P.length, n = P[0].length
  const cellW = 70, cellH = 42
  const startX = 80, startY = 50
  const W = startX + n * cellW + 80, H = startY + m * cellH + 100

  const activeCell = cellIdx >= 0 && cellIdx < cells.length ? cells[cellIdx] : null

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', maxHeight: 360 }}>
      {/* 列标题 Y */}
      <text x={startX + n * cellW / 2} y={20} fontSize="12" textAnchor="middle" fill="var(--text-primary)" fontWeight="700">Y →</text>
      {Array.from({ length: n }, (_, j) => (
        <text key={j} x={startX + j * cellW + cellW / 2} y={startY - 8} fontSize="11" textAnchor="middle" fill="var(--text-secondary)" fontFamily="var(--font-mono)" fontWeight="600">
          y{j+1}
        </text>
      ))}
      {/* 边缘 p(y) 行 */}
      <text x={startX - 30} y={startY + m * cellH + 25} fontSize="11" fill="var(--text-tertiary)" fontFamily="var(--font-mono)">p(y)</text>
      {Array.from({ length: n }, (_, j) => (
        <g key={j}>
          <rect x={startX + j * cellW} y={startY + m * cellH + 12} width={cellW} height={cellH} fill="var(--glass-bg-mid)" stroke="var(--glass-border)" rx="4" />
          <text x={startX + j * cellW + cellW / 2} y={startY + m * cellH + 37} fontSize="10.5" textAnchor="middle" fill="var(--text-secondary)" fontFamily="var(--font-mono)">
            {py[j].toFixed(3)}
          </text>
        </g>
      ))}
      {/* 行 */}
      {Array.from({ length: m }, (_, i) => (
        <g key={i}>
          <text x={startX - 25} y={startY + i * cellH + cellH / 2 + 4} fontSize="11" fill="var(--text-secondary)" fontFamily="var(--font-mono)" fontWeight="600">
            x{i+1}
          </text>
          {Array.from({ length: n }, (_, j) => {
            const isActive = activeCell && activeCell.i === i && activeCell.j === j
            return (
              <g key={j} style={{ transition: 'all 0.3s' }}>
                <rect x={startX + j * cellW} y={startY + i * cellH} width={cellW} height={cellH}
                      fill={isActive ? 'var(--accent-soft)' : 'var(--surface)'}
                      stroke={isActive ? 'var(--accent)' : 'var(--glass-border)'}
                      strokeWidth={isActive ? 2 : 1}
                      rx="4"
                      style={{ filter: isActive ? 'drop-shadow(0 0 6px var(--accent-soft))' : 'none', transition: 'all 0.3s' }} />
                <text x={startX + j * cellW + cellW / 2} y={startY + i * cellH + cellH / 2 + 4} fontSize="11" textAnchor="middle"
                      fill={isActive ? 'var(--accent-light)' : 'var(--text-primary)'}
                      fontFamily="var(--font-mono)" fontWeight={isActive ? 700 : 500}>
                  {P[i][j].toFixed(3)}
                </text>
              </g>
            )
          })}
          {/* 边缘 p(x) 列 */}
          <rect x={startX + n * cellW + 8} y={startY + i * cellH} width={cellW} height={cellH} fill="var(--glass-bg-mid)" stroke="var(--glass-border)" rx="4" />
          <text x={startX + n * cellW + 8 + cellW / 2} y={startY + i * cellH + cellH / 2 + 4} fontSize="10.5" textAnchor="middle" fill="var(--text-secondary)" fontFamily="var(--font-mono)">
            {px[i].toFixed(3)}
          </text>
        </g>
      ))}
      <text x={startX + n * cellW + 8 + cellW / 2} y={startY - 8} fontSize="11" textAnchor="middle" fill="var(--text-tertiary)" fontFamily="var(--font-mono)">p(x)</text>

      {/* 结果 */}
      <g transform={`translate(${startX}, ${startY + m * cellH + 68})`}>
        <rect width={340} height={56} rx="8" fill="var(--accent-soft)" stroke="var(--accent-border)" opacity="0.6" />
        <text x="10" y="18" fontSize="11" fill="var(--accent-light)" fontFamily="var(--font-mono)">
          H(X)={Hx.toFixed(3)}   H(Y)={Hy.toFixed(3)}
        </text>
        <text x="10" y="36" fontSize="11" fill="var(--accent-light)" fontFamily="var(--font-mono)">
          H(X,Y)={Hxy.toFixed(3)}   H(Y|X)={Hygx.toFixed(3)}
        </text>
        <text x="10" y="52" fontSize="10" fill="var(--text-secondary)" fontFamily="var(--font-mono)">
          验证：H(X)+H(Y|X) = {(Hx+Hygx).toFixed(3)} ≈ H(X,Y)
        </text>
      </g>
    </svg>
  )
}
