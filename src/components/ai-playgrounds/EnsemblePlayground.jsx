import { useCallback, useMemo } from 'react'
import PlaygroundShell from '../playgrounds/PlaygroundShell'
import VizCard from '../playgrounds/VizCard'

const W = 540
const H = 360
const PAD = 36
const X_RANGE = [-1, 11]
const Y_RANGE = [-1, 9]
const N_LEARNERS = 5

const CLASS_COLORS = { 0: '#8b5cf6', 1: '#ef4444' }
const STUMP_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#06b6d4']

// Generate XOR-ish non-linear data
function genData(key) {
  if (key === 'linear') {
    return [
      { x: 1, y: 2, label: 0 }, { x: 2, y: 1, label: 0 }, { x: 1.5, y: 3, label: 0 }, { x: 3, y: 1.5, label: 0 }, { x: 0.5, y: 2.5, label: 0 },
      { x: 7, y: 6, label: 1 }, { x: 8, y: 5, label: 1 }, { x: 7.5, y: 7, label: 1 }, { x: 9, y: 5.5, label: 1 }, { x: 6.5, y: 6.5, label: 1 },
    ]
  }
  if (key === 'checker') {
    return [
      { x: 1, y: 1, label: 0 }, { x: 2, y: 2, label: 0 }, { x: 1.5, y: 1.5, label: 0 },
      { x: 7, y: 7, label: 0 }, { x: 8, y: 6, label: 0 }, { x: 7.5, y: 6.5, label: 0 },
      { x: 1, y: 7, label: 1 }, { x: 2, y: 6, label: 1 }, { x: 1.5, y: 6.5, label: 1 },
      { x: 7, y: 1, label: 1 }, { x: 8, y: 2, label: 1 }, { x: 7.5, y: 1.5, label: 1 },
    ]
  }
  // concentric
  const inner = []
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI * 2 * i) / 6
    inner.push({ x: 5 + Math.cos(a) * 0.8, y: 4.5 + Math.sin(a) * 0.8, label: 1 })
  }
  const outer = []
  for (let i = 0; i < 8; i++) {
    const a = (Math.PI * 2 * i) / 8
    outer.push({ x: 5 + Math.cos(a) * 2.8, y: 4.5 + Math.sin(a) * 2.8, label: 0 })
  }
  return [...inner, ...outer]
}

const DATA_SETS = {
  linear: genData('linear'),
  checker: genData('checker'),
  concentric: genData('concentric'),
}

function sx(x) { return PAD + (x - X_RANGE[0]) / (X_RANGE[1] - X_RANGE[0]) * (W - PAD * 2) }
function sy(y) { return H - PAD - (y - Y_RANGE[0]) / (Y_RANGE[1] - Y_RANGE[0]) * (H - PAD * 2) }

// Train a decision stump on weighted data: pick single axis threshold
function trainStump(data, weights) {
  let best = { axis: 'x', threshold: 5, leftPred: 0, error: Infinity }
  ;['x', 'y'].forEach(axis => {
    const sorted = [...data].sort((a, b) => a[axis] - b[axis])
    for (let i = 0; i < sorted.length - 1; i++) {
      const th = (sorted[i][axis] + sorted[i + 1][axis]) / 2
      const leftPred = 0
      // predict: <=th → 0, >th → 1
      let err = 0
      data.forEach((d, idx) => {
        const pred = d[axis] <= th ? leftPred : 1 - leftPred
        if (pred !== d.label) err += weights[idx]
      })
      if (err < best.error) {
        best = { axis, threshold: th, leftPred, error: err }
      }
      // try flipping
      let err2 = 0
      data.forEach((d, idx) => {
        const pred = d[axis] <= th ? 1 : 0
        if (pred !== d.label) err2 += weights[idx]
      })
      if (err2 < best.error) {
        best = { axis, threshold: th, leftPred: 1, error: err2 }
      }
    }
  })
  return best
}

function computeSteps({ presetKey, method }) {
  const data = DATA_SETS[presetKey]
  const N = data.length
  const steps = []

  // Bootstrap samples (bagging) or weighted training (AdaBoost)
  const learners = []
  const alphas = [] // AdaBoost weights
  let weights = Array(N).fill(1 / N)

  steps.push({
    description: `初始化: ${method === 'bagging' ? 'Bagging (随机森林)' : 'AdaBoost'}, N=${N} 个样本, 训练 ${N_LEARNERS} 个弱学习器`,
    line: 1, phase: 'init', method,
    data, weights, learners, alphas,
    currentLearner: -1, bootstrapIndices: [], currentStump: null,
  })

  for (let l = 0; l < N_LEARNERS; l++) {
    // Create sample indices
    let sampleIndices
    if (method === 'bagging') {
      sampleIndices = Array.from({ length: N }, () => Math.floor(Math.random() * N))
    } else {
      // AdaBoost: weighted sample
      sampleIndices = []
      for (let i = 0; i < N; i++) sampleIndices.push(i) // use all data with weights
    }

    steps.push({
      description: `${method === 'bagging' ? `Bagging: 抽取 bootstrap 样本 (第 ${l + 1} 个学习器)` : `AdaBoost: 第 ${l + 1} 轮,权重分布更新完成`}`,
      line: 3, phase: 'sample', method,
      data, weights: [...weights], learners: [...learners], alphas: [...alphas],
      currentLearner: l, bootstrapIndices: sampleIndices, currentStump: null,
    })

    // Train stump
    const trainWeights = method === 'bagging'
      ? sampleIndices.map(() => 1 / sampleIndices.length)
      : weights
    const trainData = method === 'bagging' ? sampleIndices.map(i => data[i]) : data
    const stump = trainStump(trainData, trainWeights)

    // Compute predictions and accuracy
    const preds = data.map(d => (d[stump.axis] <= stump.threshold ? stump.leftPred : 1 - stump.leftPred))
    const correct = preds.map((p, i) => p === data[i].label)

    steps.push({
      description: `学习器 ${l + 1}: 学到决策桩 ${stump.axis} ≤ ${stump.threshold.toFixed(2)} → 类 ${stump.leftPred},错误率=${stump.error.toFixed(3)}`,
      line: 5, phase: 'train', method,
      data, weights: [...weights], learners: [...learners], alphas: [...alphas], correct,
      currentLearner: l, bootstrapIndices: sampleIndices, currentStump: stump,
    })

    learners.push(stump)

    // AdaBoost: update weights
    if (method === 'adaboost') {
      const err = Math.max(1e-6, Math.min(1 - 1e-6, stump.error))
      const alpha = 0.5 * Math.log((1 - err) / err)
      alphas.push(alpha)
      let newW = weights.map((w, i) => w * Math.exp(-alpha * (correct[i] ? 1 : -1)))
      const Z = newW.reduce((a, b) => a + b, 0)
      weights = newW.map(w => w / Z)

      steps.push({
        description: `AdaBoost: α${l + 1}=${alpha.toFixed(3)},更新样本权重(错分样本权重提升)`,
        line: 7, phase: 'weight-update', method,
        data, weights: [...weights], learners: [...learners], alphas: [...alphas], correct,
        currentLearner: l, bootstrapIndices: sampleIndices, currentStump: stump,
      })
    } else {
      alphas.push(1 / N_LEARNERS) // equal weight for bagging
    }
  }

  // Final ensemble prediction contour
  const finalPreds = data.map((d) => {
    const votes = learners.map(l => {
      const pred = d[l.axis] <= l.threshold ? l.leftPred : 1 - l.leftPred
      return (pred === 1 ? 1 : -1) * (alphas[learners.indexOf(l)] || 1 / N_LEARNERS)
    })
    const sum = votes.reduce((a, b) => a + b, 0)
    return sum >= 0 ? 1 : 0
  })
  const ensembleAcc = finalPreds.filter((p, i) => p === data[i].label).length / N

  steps.push({
    description: `集成完成: 组合 ${N_LEARNERS} 个弱学习器 → 集成准确率=${(ensembleAcc * 100).toFixed(0)}%`,
    line: 10, phase: 'ensemble', method,
    data, weights, learners, alphas, correct: finalPreds.map((p, i) => p === data[i].label),
    currentLearner: N_LEARNERS, bootstrapIndices: [], currentStump: null,
    ensembleAcc,
  })

  return steps
}

export default function EnsemblePlayground() {
  const presets = useMemo(() => [
    { id: 'bag-checker', label: 'Bagging · 棋盘', state: { presetKey: 'checker', method: 'bagging' } },
    { id: 'ada-checker', label: 'AdaBoost · 棋盘', state: { presetKey: 'checker', method: 'adaboost' } },
    { id: 'bag-concentric', label: 'Bagging · 同心', state: { presetKey: 'concentric', method: 'bagging' } },
    { id: 'ada-concentric', label: 'AdaBoost · 同心', state: { presetKey: 'concentric', method: 'adaboost' } },
    { id: 'bag-linear', label: 'Bagging · 线性', state: { presetKey: 'linear', method: 'bagging' } },
  ], [])

  const computeStepsFn = useCallback(state => computeSteps(state), [])

  return (
    <PlaygroundShell
      initialState={{ presetKey: 'checker', method: 'bagging' }}
      presets={presets}
      derivePayload={s => s}
      computeSteps={computeStepsFn}
      legend={[
        { color: CLASS_COLORS[0], label: '类 0' },
        { color: CLASS_COLORS[1], label: '类 1' },
        { color: '#f97316', label: '决策桩边界' },
      ]}
      renderViz={({ current }) => (
        <VizCard>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
            <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxWidth: W }}>
              <rect x={PAD} y={PAD} width={W - PAD * 2} height={H - PAD * 2} fill="rgba(139,92,246,0.04)" rx="8" />

              {/* Draw all trained stumps */}
              {current.learners.map((s, i) => {
                const color = STUMP_COLORS[i % STUMP_COLORS.length]
                const isCurrent = i === current.currentLearner
                if (s.axis === 'x') {
                  return (
                    <line key={`st-${i}`} x1={sx(s.threshold)} y1={PAD} x2={sx(s.threshold)} y2={H - PAD}
                      stroke={color} strokeWidth={isCurrent ? 3 : 1.5}
                      strokeDasharray={isCurrent ? 'none' : '5 4'}
                      opacity={isCurrent ? 1 : 0.55} />
                  )
                }
                return (
                  <line key={`st-${i}`} x1={PAD} y1={sy(s.threshold)} x2={W - PAD} y2={sy(s.threshold)}
                    stroke={color} strokeWidth={isCurrent ? 3 : 1.5}
                    strokeDasharray={isCurrent ? 'none' : '5 4'}
                    opacity={isCurrent ? 1 : 0.55} />
                )
              })}

              {/* Data points */}
              {current.data.map((d, i) => {
                const isBoosted = current.method === 'adaboost' && current.weights
                const size = isBoosted ? 4 + current.weights[i] * 120 : 6
                const inSample = current.bootstrapIndices.includes(i)
                return (
                  <circle key={i} cx={sx(d.x)} cy={sy(d.y)} r={size}
                    fill={CLASS_COLORS[d.label]}
                    stroke={inSample && current.currentLearner >= 0 ? '#f97316' : 'white'}
                    strokeWidth={inSample && current.currentLearner >= 0 ? 2 : 1}
                    opacity="0.9"
                    style={{ transition: 'all 0.3s' }}
                  />
                )
              })}
            </svg>

            {/* Learner weight strip */}
            <div style={{ display: 'flex', gap: 4, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
              {current.learners.map((_, i) => (
                <div key={i} style={{
                  width: 28, height: 10,
                  background: STUMP_COLORS[i % STUMP_COLORS.length],
                  borderRadius: 3,
                  opacity: i <= current.currentLearner ? 1 : 0.25,
                  transform: current.method === 'adaboost' && current.alphas[i]
                    ? `scaleY(${Math.max(0.3, current.alphas[i] * 1.5)})`
                    : undefined,
                  transformOrigin: 'bottom',
                  transition: 'all 0.3s',
                  title: current.method === 'adaboost' ? `α${i + 1}=${(current.alphas[i] || 0).toFixed(2)}` : `learner ${i + 1}`,
                }} />
              ))}
            </div>

            <div style={{ display: 'flex', gap: 14, fontSize: 12, color: 'var(--text-secondary)', flexWrap: 'wrap', justifyContent: 'center' }}>
              <span>method: <b style={{ color: 'var(--text-primary)' }}>{current.method}</b></span>
              <span>phase: <b style={{ color: 'var(--text-primary)' }}>{current.phase}</b></span>
              <span>学习器: <b>{Math.max(0, current.currentLearner + 1)}</b>/{N_LEARNERS}</span>
              {current.ensembleAcc !== undefined && (
                <span>集成准确率: <b style={{ color: '#10b981' }}>{(current.ensembleAcc * 100).toFixed(0)}%</b></span>
              )}
              {current.method === 'adaboost' && current.currentStump && (
                <span>err: <b>{current.currentStump.error.toFixed(3)}</b></span>
              )}
            </div>
          </div>
        </VizCard>
      )}
    />
  )
}
