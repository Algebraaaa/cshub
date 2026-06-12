import { useCallback, useMemo } from 'react'
import PlaygroundShell from '../playgrounds/PlaygroundShell'
import VizCard from '../playgrounds/VizCard'

const W = 520
const H = 320
const PAD = 36
const X_RANGE = [0, 6]
const Y_RANGE = [0, 5]

const DATA = [
  { x: 0.5, y: 1.0, label: 0 }, { x: 1.0, y: 2.5, label: 1 }, { x: 1.5, y: 1.2, label: 0 },
  { x: 2.0, y: 3.0, label: 1 }, { x: 2.5, y: 1.5, label: 0 }, { x: 3.0, y: 3.5, label: 1 },
  { x: 3.5, y: 1.8, label: 0 }, { x: 4.0, y: 3.8, label: 1 }, { x: 4.5, y: 2.0, label: 0 },
  { x: 5.0, y: 4.0, label: 1 }, { x: 5.3, y: 1.4, label: 0 }, { x: 5.5, y: 3.2, label: 1 },
]

function sx(x) { return PAD + (x - X_RANGE[0]) / (X_RANGE[1] - X_RANGE[0]) * (W - PAD * 2) }
function sy(y) { return H - PAD - (y - Y_RANGE[0]) / (Y_RANGE[1] - Y_RANGE[0]) * (H - PAD * 2) }

function findBestStump(data, weights) {
  let bestErr = Infinity
  let bestAxis = 'x'
  let bestVal = 3.0
  let bestDir = 1

  for (const axis of ['x', 'y']) {
    const vals = data.map(p => p[axis]).sort((a, b) => a - b)
    for (let i = 0; i < vals.length - 1; i++) {
      const threshold = (vals[i] + vals[i + 1]) / 2
      for (const dir of [1, -1]) {
        let err = 0
        for (let j = 0; j < data.length; j++) {
          const pred = (dir * data[j][axis] < dir * threshold) ? 0 : 1
          if (pred !== data[j].label) err += weights[j]
        }
        if (err < bestErr) { bestErr = err; bestAxis = axis; bestVal = threshold; bestDir = dir }
      }
    }
  }
  return { axis: bestAxis, value: bestVal, dir: bestDir, error: bestErr }
}

function stumpPredict(stump, p) {
  return (stump.dir * p[stump.axis] < stump.dir * stump.value) ? 0 : 1
}

function computeSteps({ numRounds }) {
  const steps = []
  const n = DATA.length
  let weights = Array(n).fill(1 / n)
  const stumps = []
  const alphas = []

  for (let round = 0; round < numRounds; round++) {
    const stump = findBestStump(DATA, weights)
    const eps = Math.max(stump.error, 1e-6)
    const alpha = 0.5 * Math.log((1 - eps) / eps)

    stumps.push(stump)
    alphas.push(alpha)

    const predictions = DATA.map(p => stumpPredict(stump, p))
    const newWeights = weights.map((w, i) => {
      const correct = predictions[i] === DATA[i].label ? 1 : -1
      return w * Math.exp(-alpha * correct)
    })
    const wSum = newWeights.reduce((s, v) => s + v, 0)
    weights = newWeights.map(w => w / wSum)

    let trainCorrect = 0
    for (let i = 0; i < n; i++) {
      let score = 0
      for (let j = 0; j < stumps.length; j++) {
        score += alphas[j] * (stumpPredict(stumps[j], DATA[i]) === 1 ? 1 : -1)
      }
      const pred = score > 0 ? 1 : 0
      if (pred === DATA[i].label) trainCorrect++
    }

    steps.push({
      description: `第 ${round + 1} 轮: α=${alpha.toFixed(3)}, 加权误差=${eps.toFixed(3)}, 训练准确率=${((trainCorrect / n) * 100).toFixed(0)}%`,
      round, alpha, weightedError: eps, accuracy: trainCorrect / n,
      stumps: [...stumps], alphas: [...alphas], weights: [...weights], points: DATA,
    })
  }

  return steps
}

export default function AdaBoostPlayground() {
  const presets = useMemo(() => [
    { id: 'three', label: '3 轮', state: { numRounds: 3 } },
    { id: 'five', label: '5 轮', state: { numRounds: 5 } },
    { id: 'ten', label: '10 轮', state: { numRounds: 10 } },
  ], [])

  const computeStepsFn = useCallback(state => computeSteps(state), [])

  return (
    <PlaygroundShell
      initialState={{ numRounds: 3 }}
      presets={presets}
      derivePayload={s => s}
      computeSteps={computeStepsFn}
      legend={[
        { color: '#8b5cf6', label: '类别 0' },
        { color: '#f472b6', label: '类别 1' },
        { color: '#f97316', label: '决策树桩' },
        { color: '#ef4444', label: '高权重样本' },
      ]}
      renderViz={({ current }) => {
        const maxW = Math.max(...current.weights)
        const currentStump = current.stumps[current.stumps.length - 1]
        return (
          <VizCard>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
              <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxWidth: W }}>
                <rect x={PAD} y={PAD} width={W - PAD * 2} height={H - PAD * 2} fill="rgba(139,92,246,0.05)" rx="8" />
                {current.stumps.slice(0, -1).map((st, i) => {
                  const opacity = 0.15 + 0.15 * i
                  if (st.axis === 'x') {
                    return <line key={i} x1={sx(st.value)} y1={PAD} x2={sx(st.value)} y2={H - PAD} stroke="#f97316" strokeWidth="1.5" strokeDasharray="4 4" opacity={opacity} />
                  }
                  return <line key={i} x1={PAD} y1={sy(st.value)} x2={W - PAD} y2={sy(st.value)} stroke="#f97316" strokeWidth="1.5" strokeDasharray="4 4" opacity={opacity} />
                })}
                {currentStump && (
                  currentStump.axis === 'x' ? (
                    <line x1={sx(currentStump.value)} y1={PAD} x2={sx(currentStump.value)} y2={H - PAD} stroke="#f97316" strokeWidth="3" strokeDasharray="8 6" />
                  ) : (
                    <line x1={PAD} y1={sy(currentStump.value)} x2={W - PAD} y2={sy(currentStump.value)} stroke="#f97316" strokeWidth="3" strokeDasharray="8 6" />
                  )
                )}
                {current.points.map((p, i) => {
                  const wNorm = current.weights[i] / maxW
                  const r = 4 + wNorm * 8
                  return (
                    <circle key={i} cx={sx(p.x)} cy={sy(p.y)} r={r}
                      fill={p.label === 0 ? '#8b5cf6' : '#f472b6'}
                      stroke={wNorm > 0.6 ? '#ef4444' : 'transparent'}
                      strokeWidth={wNorm > 0.6 ? 2 : 0}
                      opacity={0.85}
                    />
                  )
                })}
              </svg>
              <div style={{ display: 'flex', gap: 12, fontSize: 12, color: 'var(--text-secondary)' }}>
                <span>轮次: <b>{current.round + 1}</b></span>
                <span>α: <b>{current.alpha.toFixed(3)}</b></span>
                <span>加权误差: <b>{current.weightedError.toFixed(3)}</b></span>
                <span>准确率: <b>{(current.accuracy * 100).toFixed(0)}%</b></span>
              </div>
            </div>
          </VizCard>
        )
      }}
    />
  )
}
