import { useCallback, useMemo } from 'react'
import PlaygroundShell from '../playgrounds/PlaygroundShell'
import VizCard from '../playgrounds/VizCard'

const W = 520, H = 320, PAD = 36
const COLORS = { primary: '#8b5cf6', highlight: '#f97316', negative: '#ef4444', tertiary: '#38bdf8', output: '#22c55e', secondary: '#f472b6' }

// 4x4 input feature map
const INPUT_4x4 = [
  [1, 3, 2, 4],
  [5, 1, 6, 2],
  [3, 7, 1, 8],
  [2, 4, 5, 3],
]

// 6x6 input for 3x3 pooling
const INPUT_6x6 = [
  [1, 3, 2, 4, 0, 2],
  [5, 1, 6, 2, 3, 1],
  [3, 7, 1, 8, 4, 5],
  [2, 4, 5, 3, 1, 6],
  [6, 2, 8, 1, 3, 4],
  [0, 5, 3, 7, 2, 1],
]

const PRESETS_DATA = {
  max2: { input: INPUT_4x4, poolSize: 2, stride: 2, mode: 'max', label: 'Max Pool 2×2' },
  avg2: { input: INPUT_4x4, poolSize: 2, stride: 2, mode: 'avg', label: 'Avg Pool 2×2' },
  max3: { input: INPUT_6x6, poolSize: 3, stride: 3, mode: 'max', label: 'Max Pool 3×3' },
}

function computePool(input, poolSize, stride, mode) {
  const inH = input.length, inW = input[0].length
  const outH = Math.floor((inH - poolSize) / stride) + 1
  const outW = Math.floor((inW - poolSize) / stride) + 1
  const output = Array.from({ length: outH }, () => Array(outW).fill(null))
  const windows = []

  for (let oi = 0; oi < outH; oi++) {
    for (let oj = 0; oj < outW; oj++) {
      const si = oi * stride, sj = oj * stride
      const vals = []
      for (let pi = 0; pi < poolSize; pi++) {
        for (let pj = 0; pj < poolSize; pj++) {
          vals.push({ val: input[si + pi][sj + pj], ri: si + pi, ci: sj + pj })
        }
      }
      const result = mode === 'max'
        ? vals.reduce((best, v) => v.val > best.val ? v : best, vals[0])
        : { val: vals.reduce((s, v) => s + v.val, 0) / vals.length, ri: -1, ci: -1 }
      output[oi][oj] = parseFloat(result.val.toFixed(2))
      windows.push({ oi, oj, si, sj, vals, selected: result, result: parseFloat(result.val.toFixed(2)) })
    }
  }
  return { output, windows, outH, outW }
}

function computeSteps({ presetId }) {
  const p = PRESETS_DATA[presetId] || PRESETS_DATA.max2
  const { windows, outH, outW } = computePool(p.input, p.poolSize, p.stride, p.mode)
  const steps = []

  steps.push({
    description: `输入 ${p.input.length}×${p.input[0].length} 特征图, ${p.label}`,
    phase: 'init', input: p.input, output: Array.from({ length: outH }, () => Array(outW).fill(null)),
    mode: p.mode, poolSize: p.poolSize, label: p.label, windowIdx: -1, windows, outH, outW,
  })

  const filled = Array.from({ length: outH }, () => Array(outW).fill(null))
  windows.forEach((w, idx) => {
    filled[w.oi][w.oj] = w.result
    steps.push({
      description: `窗口 (${w.oi},${w.oj}): 值=[${w.vals.map(v => v.val).join(',')}] → ${p.mode === 'max' ? 'max' : 'avg'} = ${w.result}`,
      phase: 'pool', input: p.input, output: filled.map(r => [...r]),
      mode: p.mode, poolSize: p.poolSize, label: p.label, windowIdx: idx, windows, outH, outW,
      activeWindow: w,
    })
  })

  steps.push({
    description: `池化完成, 输出 ${outH}×${outW} 特征图`,
    phase: 'done', input: p.input, output: filled.map(r => [...r]),
    mode: p.mode, poolSize: p.poolSize, label: p.label, windowIdx: -1, windows, outH, outW,
  })
  return steps
}

const CELL = 42, GAP = 3

function gx(col, offset) { return offset + col * (CELL + GAP) }
function gy(row) { return PAD + 40 + row * (CELL + GAP) }

export default function PoolingPlayground() {
  const presets = useMemo(() => [
    { id: 'max2', label: 'Max 2×2', state: { presetId: 'max2' } },
    { id: 'avg2', label: 'Avg 2×2', state: { presetId: 'avg2' } },
    { id: 'max3', label: 'Max 3×3', state: { presetId: 'max3' } },
  ], [])

  const computeStepsFn = useCallback(state => computeSteps(state), [])

  return (
    <PlaygroundShell
      initialState={{ presetId: 'max2' }}
      presets={presets}
      derivePayload={s => s}
      computeSteps={computeStepsFn}
      legend={[
        { color: COLORS.primary, label: '输入' },
        { color: COLORS.highlight, label: '当前窗口' },
        { color: COLORS.output, label: '输出' },
      ]}
      renderViz={({ current }) => {
        const { input, output, activeWindow, mode, poolSize, outH, outW } = current
        const inH = input.length, inW = input[0].length
        const inputOffset = PAD
        const outputOffset = PAD + inW * (CELL + GAP) + 60
        return (
          <VizCard>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxWidth: W }}>
                <text x={inputOffset + inW * (CELL + GAP) / 2} y={PAD + 20} textAnchor="middle" fontSize="11" fill="var(--text-tertiary)" fontWeight="600">
                  输入 {inH}×{inW}
                </text>
                <text x={outputOffset + outW * (CELL + GAP) / 2} y={PAD + 20} textAnchor="middle" fontSize="11" fill="var(--text-tertiary)" fontWeight="600">
                  输出 {outH}×{outW}
                </text>
                {/* Input grid */}
                {input.map((row, ri) => row.map((v, ci) => {
                  const inWindow = activeWindow && ri >= activeWindow.si && ri < activeWindow.si + poolSize && ci >= activeWindow.sj && ci < activeWindow.sj + poolSize
                  const isSelected = inWindow && mode === 'max' && activeWindow.selected.ri === ri && activeWindow.selected.ci === ci
                  return (
                    <g key={`in-${ri}-${ci}`}>
                      <rect x={gx(ci, inputOffset)} y={gy(ri)} width={CELL} height={CELL} rx="5"
                        fill={isSelected ? COLORS.output : inWindow ? COLORS.highlight : COLORS.primary}
                        opacity={inWindow ? 0.3 : 0.08}
                        stroke={isSelected ? COLORS.output : inWindow ? COLORS.highlight : 'var(--border)'}
                        strokeWidth={inWindow ? 2 : 0.5}
                        style={{ transition: 'fill 0.2s, stroke 0.2s' }} />
                      <text x={gx(ci, inputOffset) + CELL / 2} y={gy(ri) + CELL / 2 + 5} textAnchor="middle" fontSize="14"
                        fill={isSelected ? COLORS.output : inWindow ? COLORS.highlight : 'var(--text-primary)'}
                        fontWeight={isSelected ? 800 : inWindow ? 600 : 400}>{v}</text>
                    </g>
                  )
                }))}
                {/* Arrow */}
                {activeWindow && (
                  <g>
                    <line x1={inputOffset + inW * (CELL + GAP) + 8} y1={H / 2} x2={outputOffset - 12} y2={H / 2}
                      stroke={COLORS.highlight} strokeWidth="2" markerEnd="url(#pool-arrow)" />
                    <defs>
                      <marker id="pool-arrow" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
                        <polygon points="0 0, 8 3, 0 6" fill={COLORS.highlight} />
                      </marker>
                    </defs>
                    <text x={(inputOffset + inW * (CELL + GAP) + outputOffset) / 2} y={H / 2 - 10}
                      textAnchor="middle" fontSize="11" fill={COLORS.highlight} fontWeight="600">
                      {mode === 'max' ? 'max' : 'avg'}={activeWindow.result}
                    </text>
                  </g>
                )}
                {/* Output grid */}
                {output.map((row, ri) => row.map((v, ci) => {
                  const isCurrent = activeWindow && activeWindow.oi === ri && activeWindow.oj === ci
                  const filled = v !== null
                  return (
                    <g key={`out-${ri}-${ci}`}>
                      <rect x={gx(ci, outputOffset)} y={gy(ri)} width={CELL} height={CELL} rx="5"
                        fill={filled ? COLORS.output : 'transparent'} opacity={filled ? 0.25 : 1}
                        stroke={isCurrent ? COLORS.highlight : 'var(--border)'} strokeWidth={isCurrent ? 2.5 : 0.5}
                        style={{ transition: 'fill 0.3s' }} />
                      <text x={gx(ci, outputOffset) + CELL / 2} y={gy(ri) + CELL / 2 + 5} textAnchor="middle" fontSize="13"
                        fill={filled ? COLORS.output : 'var(--text-tertiary)'} fontWeight={filled ? 700 : 400}>
                        {filled ? v : '·'}
                      </text>
                    </g>
                  )
                }))}
              </svg>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6, width: '100%', maxWidth: 420 }}>
                <InfoBox label="窗口位置" value={activeWindow ? `(${activeWindow.oi}, ${activeWindow.oj})` : '-'} />
                <InfoBox label="窗口值" value={activeWindow ? `[${activeWindow.vals.map(v => v.val).join(',')}]` : '-'} />
                <InfoBox label={`${mode === 'max' ? '最大值' : '平均值'}`} value={activeWindow ? activeWindow.result : '-'} />
                <InfoBox label="输出维度" value={`${outH}×${outW}`} />
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
