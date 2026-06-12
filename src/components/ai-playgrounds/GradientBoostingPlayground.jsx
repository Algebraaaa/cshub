import { useCallback, useMemo } from 'react'
import PlaygroundShell from '../playgrounds/PlaygroundShell'
import VizCard from '../playgrounds/VizCard'

const W = 520
const H = 320
const PAD = 36
const X_RANGE = [0, 6]
const Y_RANGE = [0, 6]

const DATA = [
  { x: 0.5, y: 1.8 }, { x: 1.2, y: 2.5 }, { x: 2.0, y: 1.6 },
  { x: 2.8, y: 3.8 }, { x: 3.5, y: 3.2 }, { x: 4.2, y: 4.5 },
  { x: 5.0, y: 4.0 }, { x: 5.6, y: 5.1 },
]

function sx(x) { return PAD + (x - X_RANGE[0]) / (X_RANGE[1] - X_RANGE[0]) * (W - PAD * 2) }
function sy(y) { return H - PAD - (y - Y_RANGE[0]) / (Y_RANGE[1] - Y_RANGE[0]) * (H - PAD * 2) }

function fitStump(xs, ys, weights) {
  let bestLoss = Infinity
  let bestThreshold = xs[0]
  let bestLeftVal = 0
  let bestRightVal = 0

  const sorted = xs.map((x, i) => ({ x, y: ys[i], w: weights[i] })).sort((a, b) => a.x - b.x)
  for (let i = 0; i < sorted.length - 1; i++) {
    const threshold = (sorted[i].x + sorted[i + 1].x) / 2
    const left = sorted.filter(s => s.x <= threshold)
    const right = sorted.filter(s => s.x > threshold)
    const leftW = left.reduce((s, d) => s + d.w, 0) || 1
    const rightW = right.reduce((s, d) => s + d.w, 0) || 1
    const leftVal = left.reduce((s, d) => s + d.w * d.y, 0) / leftW
    const rightVal = right.reduce((s, d) => s + d.w * d.y, 0) / rightW
    let loss = 0
    for (const d of sorted) {
      const pred = d.x <= threshold ? leftVal : rightVal
      loss += d.w * (d.y - pred) ** 2
    }
    if (loss < bestLoss) { bestLoss = loss; bestThreshold = threshold; bestLeftVal = leftVal; bestRightVal = rightVal }
  }
  return { threshold: bestThreshold, leftVal: bestLeftVal, rightVal: bestRightVal }
}

function stumpPredict(stump, x) {
  return x <= stump.threshold ? stump.leftVal : stump.rightVal
}

function computeSteps({ numTrees, learningRate }) {
  const steps = []
  const n = DATA.length
  const xs = DATA.map(d => d.x)
  const ys = DATA.map(d => d.y)
  const meanY = ys.reduce((s, v) => s + v, 0) / n
  let predictions = Array(n).fill(meanY)
  const treeContribs = []

  steps.push({
    description: `初始预测: 均值=${meanY.toFixed(2)}, MSE=${(ys.reduce((s, y, i) => s + (y - predictions[i]) ** 2, 0) / n).toFixed(3)}`,
    iteration: 0, predictions: [...predictions], residuals: ys.map((y, i) => y - predictions[i]),
    trees: [], treeContribs: [], mse: ys.reduce((s, y, i) => s + (y - predictions[i]) ** 2, 0) / n,
    learningRate, points: DATA,
  })

  for (let t = 0; t < numTrees; t++) {
    const residuals = ys.map((y, i) => y - predictions[i])
    const weights = Array(n).fill(1)
    const stump = fitStump(xs, residuals, weights)
    treeContribs.push(stump)

    const contrib = xs.map(x => learningRate * stumpPredict(stump, x))
    predictions = predictions.map((p, i) => p + contrib[i])

    const mse = ys.reduce((s, y, i) => s + (y - predictions[i]) ** 2, 0) / n

    steps.push({
      description: `第 ${t + 1} 棵树: 拟合残差, 切分 x=${stump.threshold.toFixed(2)}, MSE=${mse.toFixed(3)}`,
      iteration: t + 1, predictions: [...predictions], residuals: ys.map((y, i) => y - predictions[i]),
      trees: [...treeContribs], treeContribs: [...treeContribs], mse, learningRate, points: DATA,
      currentStump: stump,
    })
  }

  return steps
}

export default function GradientBoostingPlayground() {
  const presets = useMemo(() => [
    { id: 'three', label: '3 棵树', state: { numTrees: 3, learningRate: 0.5 } },
    { id: 'five', label: '5 棵树', state: { numTrees: 5, learningRate: 0.5 } },
    { id: 'slow', label: '小学习率', state: { numTrees: 5, learningRate: 0.2 } },
  ], [])

  const computeStepsFn = useCallback(state => computeSteps(state), [])

  return (
    <PlaygroundShell
      initialState={{ numTrees: 3, learningRate: 0.5 }}
      presets={presets}
      derivePayload={s => s}
      computeSteps={computeStepsFn}
      legend={[
        { color: '#8b5cf6', label: '数据点' },
        { color: '#f97316', label: '集成预测' },
        { color: '#ef4444', label: '残差' },
        { color: '#38bdf8', label: '当前树切分' },
      ]}
      renderViz={({ current }) => {
        const predLine = []
        for (let x = X_RANGE[0]; x <= X_RANGE[1]; x += 0.1) {
          let pred = current.points.reduce((s, p) => s + p.y, 0) / current.points.length
          for (const stump of current.treeContribs) {
            pred += current.learningRate * stumpPredict(stump, x)
          }
          predLine.push({ x, y: pred })
        }
        const pathD = predLine.map((p, i) => `${i === 0 ? 'M' : 'L'}${sx(p.x).toFixed(1)},${sy(p.y).toFixed(1)}`).join(' ')

        return (
          <VizCard>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
              <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxWidth: W }}>
                <line x1={PAD} y1={H - PAD} x2={W - PAD} y2={H - PAD} stroke="var(--border)" />
                <line x1={PAD} y1={PAD} x2={PAD} y2={H - PAD} stroke="var(--border)" />
                {current.currentStump && (
                  <line x1={sx(current.currentStump.threshold)} y1={PAD} x2={sx(current.currentStump.threshold)} y2={H - PAD}
                    stroke="#38bdf8" strokeWidth="2" strokeDasharray="6 4" />
                )}
                {current.points.map((p, i) => {
                  const pred = current.predictions[i]
                  return (
                    <g key={i}>
                      <line x1={sx(p.x)} y1={sy(pred)} x2={sx(p.x)} y2={sy(p.y)}
                        stroke="#ef4444" strokeWidth="1.5" opacity="0.6" />
                      <circle cx={sx(p.x)} cy={sy(p.y)} r="5" fill="#8b5cf6" opacity="0.9" />
                      <circle cx={sx(p.x)} cy={sy(pred)} r="3" fill="#f97316" opacity="0.7" />
                    </g>
                  )
                })}
                <path d={pathD} fill="none" stroke="#f97316" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
              <div style={{ display: 'flex', gap: 12, fontSize: 12, color: 'var(--text-secondary)' }}>
                <span>迭代: <b>{current.iteration}</b></span>
                <span>MSE: <b>{current.mse.toFixed(3)}</b></span>
                <span>学习率: <b>{current.learningRate}</b></span>
                <span>树数: <b>{current.treeContribs.length}</b></span>
              </div>
            </div>
          </VizCard>
        )
      }}
    />
  )
}
