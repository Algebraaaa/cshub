import { useMemo, useCallback } from 'react'
import PlaygroundShell from '../playgrounds/PlaygroundShell'
import VizCard from '../playgrounds/VizCard'

function tanh(z) { return Math.tanh(z) }

// Simple RNN: input_size=1, hidden_size=2, output_size=1
// Sequence of 5 time steps
const SEQ_LEN = 5
const INPUTS = [0.3, 0.7, -0.2, 0.5, 0.1]

function computeSteps() {
  const steps = []
  const Wxh = [[0.5, -0.3], [0.2, 0.8]] // input → hidden
  const Whh = [[0.4, -0.1], [0.3, 0.6]] // hidden → hidden
  const Why = [[0.7], [-0.5]] // hidden → output
  const bh = [0.1, -0.1], by = [0.05]
  let h = [0, 0] // initial hidden state
  const allH = [[0, 0]]
  const allY = []

  steps.push({
    description: `RNN 初始化: 隐藏状态 h₀ = [0, 0], 准备处理长度为 ${SEQ_LEN} 的序列`,
    phase: 'init', t: 0,
    inputs: INPUTS, hiddenStates: allH.map(h => [...h]), outputs: [],
  })

  for (let t = 0; t < SEQ_LEN; t++) {
    const x = INPUTS[t]
    // Compute new hidden state
    const newH = [0, 0]
    for (let i = 0; i < 2; i++) {
      newH[i] = tanh(Wxh[i][0] * x + Wxh[i][1] * x + Whh[i][0] * h[0] + Whh[i][1] * h[1] + bh[i])
    }

    steps.push({
      description: `时刻 t=${t + 1}: 输入 x=${x}, 新隐藏状态 h${t + 1} = tanh(Wxh·x + Whh·h${t} + bh) = [${newH.map(v => v.toFixed(3)).join(', ')}]`,
      phase: 'hidden', t: t + 1, currentInput: x,
      inputs: INPUTS, hiddenStates: [...allH, newH].map(h => [...h]), outputs: allY.map(y => [...y]),
    })

    h = newH
    allH.push([...h])

    // Compute output
    const y = [Why[0][0] * h[0] + Why[1][0] * h[1] + by[0]]
    allY.push(y)

    steps.push({
      description: `时刻 t=${t + 1}: 输出 ŷ${t + 1} = Why·h${t + 1} + by = ${y[0].toFixed(4)}`,
      phase: 'output', t: t + 1, currentInput: x,
      inputs: INPUTS, hiddenStates: allH.map(h => [...h]), outputs: allY.map(y => [...y]),
    })
  }

  steps.push({
    description: `序列处理完成: 输入 [${INPUTS.join(', ')}] → 输出 [${allY.map(y => y[0].toFixed(3)).join(', ')}], 隐藏状态携带了历史信息`,
    phase: 'done', t: SEQ_LEN,
    inputs: INPUTS, hiddenStates: allH.map(h => [...h]), outputs: allY.map(y => [...y]),
  })

  return steps
}

const NODE_R = 16
const TIME_STEP_W = 90

function RNNViz({ current }) {
  if (!current) return null
  const { t, hiddenStates, outputs } = current
  const W = SEQ_LEN * TIME_STEP_W + 80
  const H = 260

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxWidth: W }}>
      {/* Time step labels */}
      {INPUTS.map((_, i) => (
        <text key={`t${i}`} x={50 + i * TIME_STEP_W + 20} y={15} textAnchor="middle" fill="var(--text-tertiary)" fontSize="10">
          t={i + 1}
        </text>
      ))}

      {/* Input nodes */}
      {INPUTS.map((x, i) => {
        const cx = 50 + i * TIME_STEP_W + 20
        const cy = 50
        const isActive = current.phase !== 'init' && (t === i + 1 || current.phase === 'done')
        return (
          <g key={`in${i}`}>
            <circle cx={cx} cy={cy} r={NODE_R}
              fill={isActive ? '#3b82f6' : 'var(--surface)'}
              stroke={isActive ? '#60a5fa' : 'var(--border)'} strokeWidth="1.5">
              {t === i + 1 && current.phase === 'hidden' && <animate attributeName="r" values={`${NODE_R};${NODE_R + 3};${NODE_R}`} dur="0.8s" repeatCount="indefinite" />}
            </circle>
            <text x={cx} y={cy + 4} textAnchor="middle" fill={isActive ? 'white' : 'var(--text-primary)'} fontSize="9" fontFamily="monospace">
              {x.toFixed(1)}
            </text>
          </g>
        )
      })}

      {/* Hidden nodes */}
      {INPUTS.map((_, i) => {
        const cx = 50 + i * TIME_STEP_W + 20
        const cy = 130
        const hs = hiddenStates?.[i + 1] || [0, 0]
        const isActive = t >= i + 1
        return (
          <g key={`h${i}`}>
            {i > 0 && (
              <line x1={50 + (i - 1) * TIME_STEP_W + 20 + NODE_R} y1={cy} x2={cx - NODE_R} y2={cy}
                stroke={isActive ? '#f97316' : 'var(--border)'} strokeWidth={isActive ? 2 : 0.5} opacity={isActive ? 0.8 : 0.3} />
            )}
            <circle cx={cx} cy={cy} r={NODE_R}
              fill={isActive ? '#f97316' : 'var(--surface)'}
              stroke={isActive ? '#fb923c' : 'var(--border)'} strokeWidth="1.5">
              {t === i + 1 && <animate attributeName="r" values={`${NODE_R};${NODE_R + 3};${NODE_R}`} dur="0.8s" repeatCount="indefinite" />}
            </circle>
            <text x={cx} y={cy + 3} textAnchor="middle" fill={isActive ? 'white' : 'var(--text-tertiary)'} fontSize="8" fontFamily="monospace">
              {isActive ? `[${hs.map(v => v.toFixed(1)).join(',')}]` : 'h'}
            </text>
          </g>
        )
      })}

      {/* Output nodes */}
      {INPUTS.map((_, i) => {
        const cx = 50 + i * TIME_STEP_W + 20
        const cy = 210
        const out = outputs?.[i]
        const isActive = out !== undefined
        return (
          <g key={`o${i}`}>
            <line x1={cx} y1={130 + NODE_R} x2={cx} y2={cy - NODE_R}
              stroke={isActive ? '#10b981' : 'var(--border)'} strokeWidth={isActive ? 1.5 : 0.5} opacity={isActive ? 0.7 : 0.2} />
            <circle cx={cx} cy={cy} r={NODE_R}
              fill={isActive ? '#10b981' : 'var(--surface)'}
              stroke={isActive ? '#34d399' : 'var(--border)'} strokeWidth="1.5">
              {t === i + 1 && current.phase === 'output' && <animate attributeName="r" values={`${NODE_R};${NODE_R + 3};${NODE_R}`} dur="0.8s" repeatCount="indefinite" />}
            </circle>
            <text x={cx} y={cy + 4} textAnchor="middle" fill={isActive ? 'white' : 'var(--text-tertiary)'} fontSize="9" fontFamily="monospace">
              {isActive ? out[0].toFixed(2) : 'ŷ'}
            </text>
          </g>
        )
      })}

      {/* Labels */}
      <text x={25} y={55} textAnchor="middle" fill="var(--text-tertiary)" fontSize="9">输入</text>
      <text x={25} y={135} textAnchor="middle" fill="var(--text-tertiary)" fontSize="9">隐藏</text>
      <text x={25} y={215} textAnchor="middle" fill="var(--text-tertiary)" fontSize="9">输出</text>
    </svg>
  )
}

export default function RNNPlayground() {
  const presets = useMemo(() => [
    { id: 'rnn', label: 'RNN 时间展开', state: { mode: 'rnn' } },
  ], [])
  const computeStepsFn = useCallback(() => computeSteps(), [])

  return (
    <PlaygroundShell
      initialState={{ mode: 'rnn' }}
      presets={presets} derivePayload={s => s} computeSteps={computeStepsFn}
      legend={[
        { color: '#3b82f6', label: '输入' },
        { color: '#f97316', label: '隐藏状态' },
        { color: '#10b981', label: '输出' },
      ]}
      renderViz={({ current }) => (
        <VizCard>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <RNNViz current={current} />
            <div style={{ fontSize: 11, color: 'var(--text-tertiary)', textAlign: 'center' }}>
              隐藏状态 h_t = tanh(Wxh·x_t + Whh·h_(t-1) + bh) 传递历史信息
            </div>
          </div>
        </VizCard>
      )}
    />
  )
}
