import { useCallback, useMemo } from 'react'
import PlaygroundShell from '../playgrounds/PlaygroundShell'
import VizCard from '../playgrounds/VizCard'

const W = 520
const H = 320
const PAD = 36
const X_RANGE = [0, 6]
const Y_RANGE = [0, 5]

const DATA = [
  { x: 0.8, y: 1.0, label: 0 }, { x: 1.3, y: 1.5, label: 0 }, { x: 1.7, y: 0.8, label: 0 },
  { x: 2.1, y: 1.9, label: 0 }, { x: 3.5, y: 3.4, label: 1 }, { x: 4.0, y: 3.8, label: 1 },
  { x: 4.6, y: 3.1, label: 1 }, { x: 5.0, y: 4.2, label: 1 },
  { x: 2.8, y: 2.6, label: 0 }, { x: 3.2, y: 3.0, label: 1 },
]


function findBestSplit(data) {
  let bestGini = Infinity
  let bestAxis = 'x'
  let bestVal = 3.0
  const axes = ['x', 'y']
  for (const axis of axes) {
    const vals = [...new Set(data.map(p => p[axis]))].sort((a, b) => a - b)
    for (let i = 0; i < vals.length - 1; i++) {
      const threshold = (vals[i] + vals[i + 1]) / 2
      const left = data.filter(p => p[axis] < threshold)
      const right = data.filter(p => p[axis] >= threshold)
      if (!left.length || !right.length) continue
      const giniL = 1 - [0, 1].reduce((s, l) => { const f = left.filter(p => p.label === l).length / left.length; return s + f * f }, 0)
      const giniR = 1 - [0, 1].reduce((s, l) => { const f = right.filter(p => p.label === l).length / right.length; return s + f * f }, 0)
      const gini = (left.length * giniL + right.length * giniR) / data.length
      if (gini < bestGini) { bestGini = gini; bestAxis = axis; bestVal = threshold }
    }
  }
  return { axis: bestAxis, value: bestVal, gini: bestGini }
}

function predict(tree, p) {
  const left = tree.data.filter(d => d[tree.split.axis] < tree.split.value)
  const right = tree.data.filter(d => d[tree.split.axis] >= tree.split.value)
  const group = p[tree.split.axis] < tree.split.value ? left : right
  const c0 = group.filter(d => d.label === 0).length
  const c1 = group.filter(d => d.label === 1).length
  return c1 > c0 ? 1 : 0
}

function computeSteps({ numTrees }) {
  const steps = []
  const trees = []
  const seed = 42

  for (let t = 0; t < numTrees; t++) {
    const pseudoRand = (i) => ((seed * (t + 1) * 17 + i * 31) % 97) / 97
    const sample = Array.from({ length: DATA.length }, (_, i) => DATA[Math.floor(pseudoRand(i) * DATA.length)])
    const split = findBestSplit(sample)
    const tree = { data: sample, split }
    trees.push(tree)

    let correct = 0
    for (const p of DATA) { if (predict(tree, p) === p.label) correct++ }
    const acc = correct / DATA.length

    steps.push({
      description: `构建第 ${t + 1}/${numTrees} 棵树: ${split.axis} < ${split.value.toFixed(2)}, 准确率 ${(acc * 100).toFixed(0)}%`,
      phase: 'build', trees: [...trees], currentTree: t, points: DATA, treeAccuracies: trees.map(tr => {
        let c = 0; for (const p of DATA) { if (predict(tr, p) === p.label) c++ }; return c / DATA.length
      }),
    })
  }

  let ensembleCorrect = 0
  for (const p of DATA) {
    const votes = trees.map(tr => predict(tr, p))
    const sum = votes.reduce((s, v) => s + v, 0)
    const pred = sum > numTrees / 2 ? 1 : 0
    if (pred === p.label) ensembleCorrect++
  }
  const ensembleAcc = ensembleCorrect / DATA.length

  steps.push({
    description: `集成投票: ${numTrees} 棵树多数表决 → 总准确率 ${(ensembleAcc * 100).toFixed(0)}%`,
    phase: 'ensemble', trees: [...trees], currentTree: -1, points: DATA,
    treeAccuracies: trees.map(tr => { let c = 0; for (const p of DATA) { if (predict(tr, p) === p.label) c++ }; return c / DATA.length }),
    ensembleAcc,
  })

  return steps
}

export default function RandomForestPlayground() {
  const presets = useMemo(() => [
    { id: 'three', label: '3 棵树', state: { numTrees: 3 } },
    { id: 'five', label: '5 棵树', state: { numTrees: 5 } },
    { id: 'single', label: '单棵树', state: { numTrees: 1 } },
  ], [])

  const computeStepsFn = useCallback(state => computeSteps(state), [])

  return (
    <PlaygroundShell
      initialState={{ numTrees: 3 }}
      presets={presets}
      derivePayload={s => s}
      computeSteps={computeStepsFn}
      legend={[
        { color: '#8b5cf6', label: '类别 0' },
        { color: '#f472b6', label: '类别 1' },
        { color: '#f97316', label: '树的切分' },
      ]}
      renderViz={({ current }) => {
        const gridCols = Math.min(current.trees.length, 3)
        const cellW = (W - PAD * 2) / gridCols
        const cellH = (H - PAD * 2 - 30) / Math.ceil(current.trees.length / gridCols)
        return (
          <VizCard>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
              <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxWidth: W }}>
                <rect x={PAD} y={PAD} width={W - PAD * 2} height={H - PAD * 2} fill="rgba(139,92,246,0.04)" rx="8" />
                {current.trees.map((tree, ti) => {
                  const col = ti % gridCols
                  const row = Math.floor(ti / gridCols)
                  const ox = PAD + col * cellW
                  const oy = PAD + row * cellH
                  const isActive = ti === current.currentTree
                  return (
                    <g key={ti}>
                      <rect x={ox + 2} y={oy + 2} width={cellW - 4} height={cellH - 4} fill="none"
                        stroke={isActive ? '#f97316' : 'var(--border-soft)'} strokeWidth={isActive ? 2 : 1} rx="4" />
                      <text x={ox + 8} y={oy + 14} fontSize="9" fill="var(--text-secondary)">Tree {ti + 1}</text>
                      {tree.split.axis === 'x' ? (
                        <line
                          x1={ox + (tree.split.value / X_RANGE[1]) * (cellW - 4) + 2}
                          y1={oy + 2}
                          x2={ox + (tree.split.value / X_RANGE[1]) * (cellW - 4) + 2}
                          y2={oy + cellH - 2}
                          stroke="#f97316" strokeWidth="2" strokeDasharray="4 3"
                        />
                      ) : (
                        <line
                          x1={ox + 2}
                          y1={oy + cellH - (tree.split.value / Y_RANGE[1]) * (cellH - 4) - 2}
                          x2={ox + cellW - 2}
                          y2={oy + cellH - (tree.split.value / Y_RANGE[1]) * (cellH - 4) - 2}
                          stroke="#f97316" strokeWidth="2" strokeDasharray="4 3"
                        />
                      )}
                      {current.points.map((p, pi) => (
                        <circle key={pi}
                          cx={ox + (p.x / X_RANGE[1]) * (cellW - 4) + 2}
                          cy={oy + cellH - (p.y / Y_RANGE[1]) * (cellH - 4) - 2}
                          r="3" fill={p.label === 0 ? '#8b5cf6' : '#f472b6'} opacity="0.85"
                        />
                      ))}
                    </g>
                  )
                })}
                {current.phase === 'ensemble' && (
                  <text x={W / 2} y={H - 8} textAnchor="middle" fontSize="12" fill="#f97316" fontWeight="600">
                    集成准确率: {(current.ensembleAcc * 100).toFixed(0)}%
                  </text>
                )}
              </svg>
              <div style={{ display: 'flex', gap: 12, fontSize: 12, color: 'var(--text-secondary)' }}>
                <span>阶段: <b>{current.phase}</b></span>
                <span>树数: <b>{current.trees.length}</b></span>
                {current.ensembleAcc != null && <span>集成: <b>{(current.ensembleAcc * 100).toFixed(0)}%</b></span>}
              </div>
            </div>
          </VizCard>
        )
      }}
    />
  )
}
