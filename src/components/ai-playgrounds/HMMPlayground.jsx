import { useCallback, useMemo } from 'react'
import PlaygroundShell from '../playgrounds/PlaygroundShell'
import VizCard from '../playgrounds/VizCard'

const W = 520
const H = 320
const PAD = 36
const COLORS = { primary: '#8b5cf6', secondary: '#f472b6', highlight: '#f97316', tertiary: '#38bdf8', quaternary: '#fbbf24' }

const MODELS = {
  weather: {
    states: ['Sunny', 'Rainy', 'Cloudy'],
    observations: ['Walk', 'Shop', 'Clean', 'Cook', 'Walk'],
    transition: [
      [0.6, 0.2, 0.2],
      [0.1, 0.5, 0.4],
      [0.3, 0.3, 0.4],
    ],
    emission: [
      [0.5, 0.3, 0.1, 0.1],
      [0.1, 0.2, 0.5, 0.2],
      [0.2, 0.3, 0.3, 0.2],
    ],
    obsIndex: [0, 1, 2, 3, 0],
    initial: [0.5, 0.2, 0.3],
  },
  coin: {
    states: ['Fair', 'Biased', 'Double'],
    observations: ['H', 'T', 'H', 'H', 'T'],
    transition: [
      [0.7, 0.2, 0.1],
      [0.1, 0.6, 0.3],
      [0.2, 0.3, 0.5],
    ],
    emission: [
      [0.5, 0.5],
      [0.8, 0.2],
      [0.95, 0.05],
    ],
    obsIndex: [0, 1, 0, 0, 1],
    initial: [0.4, 0.35, 0.25],
  },
}

function computeSteps({ modelKey }) {
  const model = MODELS[modelKey]
  const { states, observations, transition, emission, obsIndex, initial } = model
  const N = states.length
  const T = observations.length
  const steps = []

  steps.push({
    description: '转移概率矩阵', phase: 'transition',
    model, timeStep: 0, alpha: null, viterbi: null, bestPath: [], pathProb: 0,
  })
  steps.push({
    description: '发射概率矩阵', phase: 'emission',
    model, timeStep: 0, alpha: null, viterbi: null, bestPath: [], pathProb: 0,
  })

  // Forward pass (alpha)
  const alpha = Array.from({ length: T }, () => new Array(N).fill(0))
  for (let s = 0; s < N; s++) alpha[0][s] = initial[s] * emission[s][obsIndex[0]]

  steps.push({
    description: `前向传播 t=0: α=[${alpha[0].map(v => v.toFixed(3)).join(', ')}]`,
    phase: 'forward', model, timeStep: 0, alpha: alpha.map(r => [...r]), viterbi: null, bestPath: [], pathProb: 0,
  })

  for (let t = 1; t < T; t++) {
    for (let s = 0; s < N; s++) {
      let sum = 0
      for (let prev = 0; prev < N; prev++) sum += alpha[t - 1][prev] * transition[prev][s]
      alpha[t][s] = sum * emission[s][obsIndex[t]]
    }
    steps.push({
      description: `前向传播 t=${t}: α=[${alpha[t].map(v => v.toFixed(3)).join(', ')}]`,
      phase: 'forward', model, timeStep: t, alpha: alpha.map(r => [...r]), viterbi: null, bestPath: [], pathProb: 0,
    })
  }

  // Viterbi
  const viterbi = Array.from({ length: T }, () => new Array(N).fill(0))
  const backptr = Array.from({ length: T }, () => new Array(N).fill(0))
  for (let s = 0; s < N; s++) viterbi[0][s] = initial[s] * emission[s][obsIndex[0]]

  steps.push({
    description: `Viterbi t=0: δ=[${viterbi[0].map(v => v.toFixed(3)).join(', ')}]`,
    phase: 'viterbi', model, timeStep: 0, alpha: alpha.map(r => [...r]),
    viterbi: viterbi.map(r => [...r]), bestPath: [0], pathProb: Math.max(...viterbi[0]),
  })

  for (let t = 1; t < T; t++) {
    for (let s = 0; s < N; s++) {
      let best = -1, bestVal = -Infinity
      for (let prev = 0; prev < N; prev++) {
        const val = viterbi[t - 1][prev] * transition[prev][s]
        if (val > bestVal) { bestVal = val; best = prev }
      }
      viterbi[t][s] = bestVal * emission[s][obsIndex[t]]
      backptr[t][s] = best
    }

    const bestState = viterbi[t].indexOf(Math.max(...viterbi[t]))
    steps.push({
      description: `Viterbi t=${t}: 最优状态=${states[bestState]}, δ=[${viterbi[t].map(v => v.toFixed(4)).join(', ')}]`,
      phase: 'viterbi', model, timeStep: t, alpha: alpha.map(r => [...r]),
      viterbi: viterbi.map(r => [...r]), bestPath: Array.from({ length: t + 1 }, (_, i) => {
        if (i === t) return bestState
        let s = bestState
        for (let j = t; j > i; j--) s = backptr[j][s]
        return s
      }), pathProb: Math.max(...viterbi[t]),
    })
  }

  // Backtrack
  let s = viterbi[T - 1].indexOf(Math.max(...viterbi[T - 1]))
  const fullPath = new Array(T)
  fullPath[T - 1] = s
  for (let t = T - 2; t >= 0; t--) { s = backptr[t + 1][s]; fullPath[t] = s }

  steps.push({
    description: `回溯完成: 最优路径=[${fullPath.map(i => states[i]).join(' → ')}]`,
    phase: 'backtrack', model, timeStep: T - 1, alpha: alpha.map(r => [...r]),
    viterbi: viterbi.map(r => [...r]), bestPath: fullPath, pathProb: Math.max(...viterbi[T - 1]),
  })

  return steps
}

export default function HMMPlayground() {
  const presets = useMemo(() => [
    { id: 'weather', label: '天气模型', state: { modelKey: 'weather' } },
    { id: 'coin', label: '硬币模型', state: { modelKey: 'coin' } },
  ], [])

  const computeStepsFn = useCallback(state => computeSteps(state), [])

  return (
    <PlaygroundShell
      initialState={{ modelKey: 'weather' }}
      presets={presets}
      derivePayload={s => s}
      computeSteps={computeStepsFn}
      legend={[
        { color: '#8b5cf6', label: '隐藏状态' },
        { color: '#f97316', label: 'Viterbi 路径' },
        { color: '#38bdf8', label: '观测序列' },
      ]}
      renderViz={({ current }) => {
        const { model, bestPath, alpha, timeStep, phase } = current
        const { states, observations } = model
        const N = states.length
        const T = observations.length
        const stateY = PAD + 50
        const obsY = H - PAD - 30
        const stateGap = (W - PAD * 2) / (N + 1)
        const obsGap = (W - PAD * 2) / (T + 1)
        const stateCx = (i) => PAD + stateGap * (i + 1)
        const obsCx = (t) => PAD + obsGap * (t + 1)

        return (
          <VizCard>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxWidth: W }}>
                <rect x={PAD} y={PAD} width={W - PAD * 2} height={H - PAD * 2} fill="rgba(139,92,246,0.05)" rx="8" />
                {/* Transition arrows */}
                {states.map((_, i) => states.map((_, j) => {
                  if (i === j) return null
                  const prob = model.transition[i][j]
                  if (prob < 0.15) return null
                  const x1 = stateCx(i), y1 = stateY, x2 = stateCx(j), y2 = stateY
                  const mx = (x1 + x2) / 2, my = y1 - 25 - Math.abs(i - j) * 8
                  return (
                    <g key={`t-${i}-${j}`}>
                      <path d={`M${x1},${y1 - 14} Q${mx},${my} ${x2},${y2 - 14}`} fill="none" stroke="#94a3b8" strokeWidth="1" opacity="0.5" />
                      <text x={mx} y={my + 8} textAnchor="middle" fontSize="7" fill="var(--text-tertiary)">{prob.toFixed(1)}</text>
                    </g>
                  )
                }))}
                {/* State nodes */}
                {states.map((name, i) => {
                  const onPath = bestPath.includes(i)
                  return (
                    <g key={`s-${i}`}>
                      <circle cx={stateCx(i)} cy={stateY} r="18" fill={onPath ? COLORS.highlight : COLORS.primary}
                        opacity={onPath ? 0.9 : 0.6} stroke="#fff" strokeWidth="1.5" />
                      <text x={stateCx(i)} y={stateY + 4} textAnchor="middle" fontSize="9" fill="#fff" fontWeight="600">{name}</text>
                      {alpha && <text x={stateCx(i)} y={stateY + 32} textAnchor="middle" fontSize="7" fill="var(--text-tertiary)">
                        α={alpha[Math.min(timeStep, (alpha?.length || 1) - 1)]?.[i]?.toFixed(3) ?? '-'}
                      </text>}
                    </g>
                  )
                })}
                {/* Observation nodes */}
                {observations.map((obs, t) => {
                  const active = t <= timeStep
                  const onPath = bestPath[t] !== undefined
                  return (
                    <g key={`o-${t}`}>
                      <rect x={obsCx(t) - 16} y={obsY - 12} width="32" height="24" rx="6"
                        fill={onPath ? COLORS.highlight : '#94a3b8'} opacity={active ? 0.85 : 0.35} stroke="#fff" strokeWidth="1" />
                      <text x={obsCx(t)} y={obsY + 4} textAnchor="middle" fontSize="9" fill="#fff" fontWeight="600">{obs}</text>
                    </g>
                  )
                })}
                {/* Viterbi path highlight */}
                {bestPath.length > 1 && bestPath.map((s, t) => {
                  if (t >= bestPath.length - 1) return null
                  return (
                    <line key={`vp-${t}`} x1={obsCx(t)} y1={obsY - 14} x2={obsCx(t + 1)} y2={obsY - 14}
                      stroke={COLORS.highlight} strokeWidth="2.5" opacity="0.7" />
                  )
                })}
                {/* Links from state to observation */}
                {bestPath.map((s, t) => (
                  <line key={`link-${t}`} x1={stateCx(s)} y1={stateY + 18} x2={obsCx(t)} y2={obsY - 14}
                    stroke={COLORS.highlight} strokeWidth="1" strokeDasharray="4 3" opacity="0.5" />
                ))}
                {/* Labels */}
                <text x={PAD + 4} y={stateY - 24} fontSize="9" fill="var(--text-tertiary)" fontWeight="600">隐藏状态</text>
                <text x={PAD + 4} y={obsY - 24} fontSize="9" fill="var(--text-tertiary)" fontWeight="600">观测序列</text>
              </svg>
              <div style={{ display: 'flex', gap: 12, fontSize: 12, color: 'var(--text-secondary)', flexWrap: 'wrap' }}>
                <span>step: <b>{timeStep}</b></span>
                <span>phase: <b>{phase}</b></span>
                <span>path: <b>{bestPath.map(i => states[i]).join('→') || '-'}</b></span>
                <span>P(path): <b>{current.pathProb.toFixed(5)}</b></span>
              </div>
            </div>
          </VizCard>
        )
      }}
    />
  )
}
