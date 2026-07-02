import { useCallback, useMemo } from 'react'
import PlaygroundShell from '../playgrounds/PlaygroundShell'
import VizCard from '../playgrounds/VizCard'

const W = 520, H = 320, PAD = 36
const COLORS = { primary: '#8b5cf6', highlight: '#f97316', negative: '#ef4444', tertiary: '#38bdf8', output: '#22c55e', secondary: '#f472b6' }

// 5x5 input grid
const INPUT = [
  [1, 2, 0, 1, 3],
  [0, 1, 3, 2, 1],
  [2, 0, 1, 1, 0],
  [1, 3, 2, 0, 2],
  [0, 1, 1, 3, 1],
]

const FILTERS = {
  edge: { matrix: [[-1, -1, -1], [-1, 8, -1], [-1, -1, -1]], label: '边缘检测' },
  blur: { matrix: [[1 / 9, 1 / 9, 1 / 9], [1 / 9, 1 / 9, 1 / 9], [1 / 9, 1 / 9, 1 / 9]], label: '模糊' },
  sharpen: { matrix: [[0, -1, 0], [-1, 5, -1], [0, -1, 0]], label: '锐化' },
}

function convolve(input, filter, oi, oj) {
  let sum = 0
  const products = []
  for (let fi = 0; fi < 3; fi++) {
    for (let fj = 0; fj < 3; fj++) {
      const val = input[oi + fi][oj + fj]
      const w = filter[fi][fj]
      products.push({ val, w, prod: val * w, fi, fj })
      sum += val * w
    }
  }
  return { sum, products }
}

function computeSteps({ filterKey }) {
  const filter = FILTERS[filterKey] || FILTERS.edge
  const outSize = 3 // 5-3+1
  const output = Array.from({ length: outSize }, () => Array(outSize).fill(0))
  const steps = []

  steps.push({ description: `输入 5×5 特征图 + ${filter.label} 3×3 卷积核`, phase: 'init', filter: filter.matrix, filterLabel: filter.label, output: output.map(r => [...r]), oi: -1, oj: -1, products: null, sum: null })

  for (let oi = 0; oi < outSize; oi++) {
    for (let oj = 0; oj < outSize; oj++) {
      const { sum, products } = convolve(INPUT, filter.matrix, oi, oj)
      output[oi][oj] = parseFloat(sum.toFixed(2))
      steps.push({
        description: `位置 (${oi},${oj}): 感受野 × 卷积核 → Σ = ${sum.toFixed(2)}`,
        phase: 'convolve', filter: filter.matrix, filterLabel: filter.label,
        output: output.map(r => [...r]), oi, oj, products, sum: parseFloat(sum.toFixed(2)),
      })
    }
  }

  steps.push({ description: `卷积完成, 输出 3×3 特征图`, phase: 'done', filter: filter.matrix, filterLabel: filter.label, output: output.map(r => [...r]), oi: -1, oj: -1, products: null, sum: null })
  return steps
}

const CELL = 38
const GAP = 2

function gridX(col, offsetX) { return offsetX + col * (CELL + GAP) }
function gridY(row) { return PAD + 30 + row * (CELL + GAP) }

export default function CNNConvolutionPlayground() {
  const presets = useMemo(() => [
    { id: 'edge', label: '边缘检测', state: { filterKey: 'edge' } },
    { id: 'blur', label: '模糊', state: { filterKey: 'blur' } },
    { id: 'sharpen', label: '锐化', state: { filterKey: 'sharpen' } },
  ], [])

  const computeStepsFn = useCallback(state => computeSteps(state), [])

  return (
    <PlaygroundShell
      initialState={{ filterKey: 'edge' }}
      presets={presets}
      derivePayload={s => s}
      computeSteps={computeStepsFn}
      legend={[
        { color: COLORS.primary, label: '输入' },
        { color: COLORS.highlight, label: '感受野' },
        { color: COLORS.secondary, label: '卷积核' },
        { color: COLORS.output, label: '输出' },
      ]}
      renderViz={({ current }) => {
        const { output, oi, oj, filter, filterLabel, sum } = current
        const inputOffset = PAD
        const filterOffset = PAD + 5 * (CELL + GAP) + 24
        const outputOffset = filterOffset + 3 * (CELL + GAP) + 30
        return (
          <VizCard>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxWidth: W }}>
                {/* Labels */}
                <text x={inputOffset + 2.5 * (CELL + GAP)} y={PAD + 18} textAnchor="middle" fontSize="11" fill="var(--text-tertiary)" fontWeight="600">输入 5×5</text>
                <text x={filterOffset + 1.5 * (CELL + GAP)} y={PAD + 18} textAnchor="middle" fontSize="11" fill="var(--text-tertiary)" fontWeight="600">{filterLabel}</text>
                <text x={outputOffset + 1.5 * (CELL + GAP)} y={PAD + 18} textAnchor="middle" fontSize="11" fill="var(--text-tertiary)" fontWeight="600">输出 3×3</text>
                {/* Input grid */}
                {INPUT.map((row, ri) => row.map((v, ci) => {
                  const inField = oi >= 0 && ri >= oi && ri < oi + 3 && oj >= 0 && ci >= oj && ci < oj + 3
                  return (
                    <g key={`in-${ri}-${ci}`}>
                      <rect x={gridX(ci, inputOffset)} y={gridY(ri)} width={CELL} height={CELL} rx="4"
                        fill={inField ? COLORS.highlight : COLORS.primary} opacity={inField ? 0.25 : 0.08}
                        stroke={inField ? COLORS.highlight : 'var(--border)'} strokeWidth={inField ? 2 : 0.5} />
                      <text x={gridX(ci, inputOffset) + CELL / 2} y={gridY(ri) + CELL / 2 + 4} textAnchor="middle" fontSize="12"
                        fill={inField ? COLORS.highlight : 'var(--text-primary)'} fontWeight={inField ? 700 : 400}>{v}</text>
                    </g>
                  )
                }))}
                {/* Filter grid */}
                {filter.map((row, ri) => row.map((v, ci) => (
                  <g key={`f-${ri}-${ci}`}>
                    <rect x={gridX(ci, filterOffset)} y={gridY(ri)} width={CELL} height={CELL} rx="4"
                      fill={COLORS.secondary} opacity="0.1" stroke={COLORS.secondary} strokeWidth="1" />
                    <text x={gridX(ci, filterOffset) + CELL / 2} y={gridY(ri) + CELL / 2 + 4} textAnchor="middle" fontSize="10"
                      fill={COLORS.secondary} fontWeight="600">{typeof v === 'number' ? (Number.isInteger(v) ? v : v.toFixed(2)) : v}</text>
                  </g>
                )))}
                {/* Output grid */}
                {output.map((row, ri) => row.map((v, ci) => {
                  const isCurrent = ri === oi && ci === oj
                  const filled = v !== 0 || isCurrent
                  return (
                    <g key={`out-${ri}-${ci}`}>
                      <rect x={gridX(ci, outputOffset)} y={gridY(ri)} width={CELL} height={CELL} rx="4"
                        fill={filled ? COLORS.output : 'transparent'} opacity={filled ? 0.2 : 1}
                        stroke={isCurrent ? COLORS.highlight : 'var(--border)'} strokeWidth={isCurrent ? 2.5 : 0.5} />
                      <text x={gridX(ci, outputOffset) + CELL / 2} y={gridY(ri) + CELL / 2 + 4} textAnchor="middle" fontSize="11"
                        fill={filled ? COLORS.output : 'var(--text-tertiary)'} fontWeight={filled ? 700 : 400}>
                        {filled ? (typeof v === 'number' ? v.toFixed(1) : v) : '·'}
                      </text>
                    </g>
                  )
                }))}
                {/* Sum display */}
                {sum !== null && (
                  <text x={W / 2} y={H - 12} textAnchor="middle" fontSize="12" fill={COLORS.highlight} fontWeight="700">
                    Σ = {sum.toFixed(2)}
                  </text>
                )}
              </svg>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6, width: '100%', maxWidth: 400 }}>
                <InfoBox label="位置" value={oi >= 0 ? `(${oi}, ${oj})` : '-'} />
                <InfoBox label="卷积核" value={filterLabel} />
                <InfoBox label="输出值" value={sum !== null ? sum.toFixed(2) : '-'} />
                <InfoBox label="输出尺寸" value="3×3" />
              </div>
            </div>
          </VizCard>
        )
      }}
    />
  )
}

function InfoBox({ label, value }) {
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '5px 8px', textAlign: 'center' }}>
      <div style={{ fontSize: 10, color: 'var(--text-tertiary)', marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 12, fontFamily: 'monospace', fontWeight: 600, color: 'var(--text-primary)' }}>{value}</div>
    </div>
  )
}
