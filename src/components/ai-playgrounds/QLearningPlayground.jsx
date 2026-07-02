// Q-Learning · 真实 Q 表更新可视化
// 4×4 网格世界，两个 episode 的真实 TD 演算：每步展示
// target = r + γ·max Q(s')、TD error、Q(s,a) 的新值。动作序列固定以保证可复现。
import { useCallback, useMemo } from 'react'
import PlaygroundShell from '../playgrounds/PlaygroundShell'
import VizCard from '../playgrounds/VizCard'

// 行号对应 curriculum.js LATE_COURSE_CODE['rl-qlearning'].code
const L = {
  init:   { pythonLine: 1, cppLine: 1 },
  act:    { pythonLine: 2, cppLine: 2 },
  step:   { pythonLine: 3, cppLine: 3 },
  target: { pythonLine: 4, cppLine: 4 },
  error:  { pythonLine: 5, cppLine: 5 },
  update: { pythonLine: 6, cppLine: 6 },
  done:   { pythonLine: 7, cppLine: 7 },
}

const N = 4
const GOAL = 15          // 右下角
const TRAP = 6           // (1,2)
const ALPHA = 0.5, GAMMA = 0.9
const ACTIONS = ['↑', '→', '↓', '←']
const DELTA = { 0: [-1, 0], 1: [0, 1], 2: [1, 0], 3: [0, -1] }

// 固定的探索动作序列（模拟 ε-greedy 的采样结果，保证演示可复现）
const EPISODES = [
  { name: 'Episode 1（探索）', actions: [1, 1, 2, 2, 1, 2] },          // 0→1→2→6(陷阱)
  { name: 'Episode 2（沿更新后的 Q 改进）', actions: [2, 2, 1, 1, 2, 1] }, // 0→4→8→9→10→14→15
]

const fmt = (v) => Number(v.toFixed(2))
const cellRC = (s) => [Math.floor(s / N), s % N]

function stepEnv(s, a) {
  const [r, c] = cellRC(s)
  const [dr, dc] = DELTA[a]
  const nr = Math.min(N - 1, Math.max(0, r + dr))
  const nc = Math.min(N - 1, Math.max(0, c + dc))
  const ns = nr * N + nc
  const reward = ns === GOAL ? 10 : ns === TRAP ? -10 : -1
  const terminal = ns === GOAL || ns === TRAP
  return { ns, reward, terminal }
}

function computeSteps() {
  const Q = Array.from({ length: N * N }, () => [0, 0, 0, 0])
  const steps = []
  const snapQ = () => Q.map(row => row.map(fmt))

  steps.push({
    phase: 'init', q: snapQ(), agent: 0,
    description: `初始化：4×4 网格世界，Q 表全 0。奖励：到达 ⭐(目标) +10、💀(陷阱) −10、每步 −1。α=${ALPHA}，γ=${GAMMA}。`,
    ...L.init,
  })

  for (const ep of EPISODES) {
    let s = 0
    steps.push({ phase: 'episode', q: snapQ(), agent: s, description: `${ep.name}：从左上角 s=0 出发。`, ...L.init })
    for (const a of ep.actions) {
      steps.push({
        phase: 'act', q: snapQ(), agent: s, action: a, focusCell: s,
        description: `在 s=${s} 用 ε-greedy 选动作 "${ACTIONS[a]}"（当前 Q(${s})=[${Q[s].map(fmt).join(', ')}]）。`,
        ...L.act,
      })
      const { ns, reward, terminal } = stepEnv(s, a)
      steps.push({
        phase: 'step', q: snapQ(), agent: ns, action: a, focusCell: ns, reward,
        description: `执行后到达 s'=${ns}，获得奖励 r=${reward}${terminal ? (ns === GOAL ? '（到达目标）' : '（掉入陷阱）') : ''}。`,
        ...L.step,
      })
      const maxNext = terminal ? 0 : Math.max(...Q[ns])
      const target = reward + GAMMA * maxNext
      steps.push({
        phase: 'target', q: snapQ(), agent: ns, focusCell: ns, reward,
        description: `TD target = r + γ·max Q(s') = ${reward} + ${GAMMA}×${fmt(maxNext)} = ${fmt(target)}。`,
        ...L.target,
      })
      const tdError = target - Q[s][a]
      steps.push({
        phase: 'error', q: snapQ(), agent: ns, focusCell: s, loss: fmt(Math.abs(tdError)),
        description: `TD error = target − Q(s,a) = ${fmt(target)} − ${fmt(Q[s][a])} = ${fmt(tdError)}。`,
        ...L.error,
      })
      Q[s][a] = Q[s][a] + ALPHA * tdError
      steps.push({
        phase: 'update', q: snapQ(), agent: ns, focusCell: s, updated: [s, a], loss: fmt(Math.abs(tdError)),
        description: `更新 Q(${s}, ${ACTIONS[a]}) ← ${fmt(Q[s][a] - ALPHA * tdError)} + ${ALPHA}×${fmt(tdError)} = ${fmt(Q[s][a])}。`,
        ...L.update,
      })
      s = ns
      if (terminal) break
    }
  }

  steps.push({
    phase: 'done', q: snapQ(), agent: GOAL,
    description: `两个 episode 后，Q 表已为沿途状态学到价值估计。重复足够多次后，沿 max Q 的贪心路径就是最优策略。`,
    ...L.done,
  })
  return steps
}

const CELL = 64

function GridViz({ current }) {
  const q = current.q
  return (
    <VizCard>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, justifyContent: 'center' }}>
        <svg width={N * CELL + 2} height={N * CELL + 2}>
          {Array.from({ length: N * N }, (_, s) => {
            const [r, c] = cellRC(s)
            const best = Math.max(...q[s])
            const isAgent = current.agent === s
            const isFocus = current.focusCell === s
            return (
              <g key={s}>
                <rect x={c * CELL + 1} y={r * CELL + 1} width={CELL - 2} height={CELL - 2} rx="6"
                  fill={s === GOAL ? 'rgba(16,185,129,0.22)' : s === TRAP ? 'rgba(239,68,68,0.20)'
                    : best > 0 ? `rgba(139,92,246,${Math.min(0.4, best / 18)})` : 'var(--surface)'}
                  stroke={isFocus ? '#f97316' : 'var(--border)'} strokeWidth={isFocus ? 2.5 : 1} />
                <text x={c * CELL + 8} y={r * CELL + 14} fontSize="9" fill="var(--text-tertiary)">{s}</text>
                {s === GOAL && <text x={c * CELL + CELL / 2} y={r * CELL + CELL / 2 + 5} textAnchor="middle" fontSize="18">⭐</text>}
                {s === TRAP && <text x={c * CELL + CELL / 2} y={r * CELL + CELL / 2 + 5} textAnchor="middle" fontSize="16">💀</text>}
                {/* 四方向 Q 值 */}
                {s !== GOAL && s !== TRAP && q[s].map((v, a) => {
                  if (v === 0) return null
                  const pos = [
                    [CELL / 2, 12], [CELL - 12, CELL / 2 + 3], [CELL / 2, CELL - 6], [12, CELL / 2 + 3],
                  ][a]
                  const isUpdated = current.updated && current.updated[0] === s && current.updated[1] === a
                  return (
                    <text key={a} x={c * CELL + pos[0]} y={r * CELL + pos[1]} textAnchor="middle"
                      fontSize="8.5" fontFamily="var(--font-mono)" fontWeight={isUpdated ? 800 : 500}
                      fill={isUpdated ? '#f97316' : v > 0 ? '#10b981' : '#ef4444'}>{v}</text>
                  )
                })}
                {isAgent && (
                  <circle cx={c * CELL + CELL / 2} cy={r * CELL + CELL / 2} r="10"
                    fill="var(--accent)" stroke="white" strokeWidth="2">
                    <animate attributeName="r" values="10;12;10" dur="1s" repeatCount="indefinite" />
                  </circle>
                )}
              </g>
            )
          })}
        </svg>

        <div style={{ fontSize: 12, fontFamily: 'var(--font-mono)', minWidth: 180 }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--text-tertiary)', marginBottom: 6 }}>
            Q(s=当前焦点) 各方向
          </div>
          {current.focusCell != null && ACTIONS.map((label, a) => (
            <div key={a} style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0',
              color: current.updated?.[1] === a && current.updated?.[0] === current.focusCell ? '#f97316' : 'var(--text-secondary)' }}>
              <span>Q({current.focusCell}, {label})</span>
              <b>{current.q[current.focusCell][a]}</b>
            </div>
          ))}
          <div style={{ marginTop: 10, color: 'var(--text-tertiary)', fontSize: 11, lineHeight: 1.8 }}>
            α = {ALPHA} · γ = {GAMMA}<br />
            {current.reward != null && <>本步奖励 r = <b style={{ color: current.reward > 0 ? '#10b981' : '#ef4444' }}>{current.reward}</b></>}
          </div>
        </div>
      </div>
    </VizCard>
  )
}

export default function QLearningPlayground() {
  const presets = useMemo(() => [{ id: 'gridworld', label: '4×4 网格世界', state: {} }], [])
  const computeStepsFn = useCallback(() => computeSteps(), [])
  return (
    <PlaygroundShell
      initialState={{}}
      presets={presets}
      computeSteps={computeStepsFn}
      legend={[
        { color: 'var(--accent)', label: '智能体位置' },
        { color: '#f97316', label: '正在更新的 Q(s,a)' },
        { color: '#10b981', label: '正 Q 值 / 目标' },
      ]}
      renderViz={({ current }) => <GridViz current={current} />}
    />
  )
}
