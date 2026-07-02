// 策略梯度 REINFORCE · 真实数值演算可视化
// 3 臂老虎机：softmax 策略 → 固定采样轨迹 → 折扣回报 G_t →
// ∇log π·G 更新偏好 → 策略分布真实变化。两轮迭代展示收敛趋势。
import { useCallback, useMemo } from 'react'
import PlaygroundShell from '../playgrounds/PlaygroundShell'
import VizCard from '../playgrounds/VizCard'

// 行号对应 curriculum.js LATE_COURSE_CODE['rl-policy-gradient'].code
const L = {
  policy:  { pythonLine: 1, cppLine: 1 },
  sample:  { pythonLine: 2, cppLine: 2 },
  returns: { pythonLine: 3, cppLine: 3 },
  grad:    { pythonLine: 6, cppLine: 6 },
  update:  { pythonLine: 8, cppLine: 8 },
}

const ARMS = ['A', 'B', 'C']
const TRUE_REWARD = [1, 3, 8]   // C 是最优臂
const LR = 0.05, GAMMA = 1.0
// 固定采样序列（模拟按概率采样的结果，保证可复现）
const SAMPLED = [[0, 1, 2], [2, 1, 2]]

const fmt = (v, d = 3) => Number(v.toFixed(d))

function softmax(prefs) {
  const m = Math.max(...prefs)
  const ex = prefs.map(v => Math.exp(v - m))
  const s = ex.reduce((a, b) => a + b, 0)
  return ex.map(e => e / s)
}

function computeSteps() {
  const prefs = [0, 0, 0]   // 偏好参数 θ
  const steps = []
  const snap = (phase, desc, lines, extra = {}) => steps.push({
    phase, prefs: prefs.map(v => fmt(v)), probs: softmax(prefs).map(v => fmt(v)),
    description: desc, ...lines, ...extra,
  })

  snap('policy', `3 臂老虎机（真实平均奖励 A=${TRUE_REWARD[0]}、B=${TRUE_REWARD[1]}、C=${TRUE_REWARD[2]}，对策略不可见）。初始偏好 θ=[0,0,0] → 策略 π=softmax(θ)=[${softmax(prefs).map(v => fmt(v, 2)).join(', ')}]，均匀随机。`, L.policy)

  SAMPLED.forEach((episode, epIdx) => {
    // 1. 采样轨迹
    const rewards = episode.map(a => TRUE_REWARD[a])
    snap('sample', `迭代 ${epIdx + 1}：按 π 采样 ${episode.length} 次 → 动作 [${episode.map(a => ARMS[a]).join(', ')}]，奖励 [${rewards.join(', ')}]。`,
      L.sample, { trajectory: episode, rewards })

    // 2. 折扣回报（γ=1 → 后缀和）
    const G = rewards.map((_, t) => rewards.slice(t).reduce((s, r, k) => s + r * GAMMA ** k, 0))
    snap('returns', `计算回报 G_t = Σ γ^k·r：G = [${G.join(', ')}]。早期动作"分享"了后续奖励的功劳。`,
      L.returns, { trajectory: episode, rewards, G })

    // 3. 逐步梯度 + 更新：∇θ log π(a) = onehot(a) − π
    episode.forEach((a, t) => {
      const probs = softmax(prefs)
      const grad = probs.map((p, i) => (i === a ? 1 - p : -p))
      snap('grad', `t=${t}：∇log π(${ARMS[a]}) = onehot − π = [${grad.map(v => fmt(v, 2)).join(', ')}]，乘以 G_${t}=${G[t]} 得梯度贡献。`,
        L.grad, { trajectory: episode, G, gradStep: t, loss: fmt(-Math.log(probs[a]) * G[t]) })
      grad.forEach((g, i) => { prefs[i] += LR * g * G[t] })
      snap('update', `θ ← θ + ${LR}×G_${t}×∇log π → θ=[${prefs.map(v => fmt(v, 2)).join(', ')}]，π=[${softmax(prefs).map(v => fmt(v, 2)).join(', ')}]。高回报动作的概率被推高。`,
        L.update, { trajectory: episode, G, gradStep: t })
    })
  })

  const final = softmax(prefs)
  const best = final.indexOf(Math.max(...final))
  snap('policy', `两轮迭代后 π=[${final.map(v => fmt(v, 2)).join(', ')}]：最优臂 ${ARMS[best]} 的概率从 0.33 升至 ${fmt(final[best], 2)}。继续训练将进一步收敛——这就是"直接优化策略"。`,
    L.policy, { probability: fmt(final[best]) })
  return steps
}

function BanditViz({ current }) {
  return (
    <VizCard>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, justifyContent: 'center', alignItems: 'flex-end' }}>
        {/* 策略分布柱状图 */}
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-tertiary)', marginBottom: 8 }}>
            策略分布 π = softmax(θ)
          </div>
          <div style={{ display: 'flex', gap: 18, alignItems: 'flex-end', height: 150 }}>
            {ARMS.map((arm, i) => {
              const p = current.probs[i]
              const inTraj = current.trajectory?.[current.gradStep] === i
              return (
                <div key={arm} style={{ textAlign: 'center', width: 56 }}>
                  <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', marginBottom: 3 }}>{p}</div>
                  <div style={{
                    height: Math.max(4, p * 130), borderRadius: '6px 6px 0 0',
                    background: inTraj ? '#f97316' : 'var(--accent)',
                    opacity: 0.4 + p, transition: 'height 0.3s',
                  }} />
                  <div style={{ marginTop: 4, fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>
                    {arm}<span style={{ fontSize: 9, color: 'var(--text-tertiary)' }}> r̄={TRUE_REWARD[i]}</span>
                  </div>
                  <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-tertiary)' }}>θ={current.prefs[i]}</div>
                </div>
              )
            })}
          </div>
        </div>

        {/* 轨迹与回报表 */}
        {current.trajectory && (
          <table style={{ borderCollapse: 'collapse', fontSize: 12, fontFamily: 'var(--font-mono)' }}>
            <thead>
              <tr style={{ color: 'var(--text-tertiary)', fontSize: 10 }}>
                <th style={{ padding: '2px 10px' }}>t</th>
                <th style={{ padding: '2px 10px' }}>a_t</th>
                <th style={{ padding: '2px 10px' }}>r_t</th>
                <th style={{ padding: '2px 10px' }}>G_t</th>
              </tr>
            </thead>
            <tbody>
              {current.trajectory.map((a, t) => (
                <tr key={t} style={{
                  color: current.gradStep === t ? '#f97316' : 'var(--text-secondary)',
                  fontWeight: current.gradStep === t ? 700 : 400,
                }}>
                  <td style={{ padding: '2px 10px', textAlign: 'center' }}>{t}</td>
                  <td style={{ padding: '2px 10px', textAlign: 'center' }}>{ARMS[a]}</td>
                  <td style={{ padding: '2px 10px', textAlign: 'center' }}>{current.rewards?.[t] ?? TRUE_REWARD[a]}</td>
                  <td style={{ padding: '2px 10px', textAlign: 'center' }}>{current.G?.[t] ?? '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </VizCard>
  )
}

export default function PolicyGradientPlayground() {
  const presets = useMemo(() => [{ id: 'bandit', label: '3 臂老虎机 REINFORCE', state: {} }], [])
  const computeStepsFn = useCallback(() => computeSteps(), [])
  return (
    <PlaygroundShell
      initialState={{}}
      presets={presets}
      computeSteps={computeStepsFn}
      legend={[
        { color: 'var(--accent)', label: '动作概率' },
        { color: '#f97316', label: '当前更新的动作' },
      ]}
      renderViz={({ current }) => <BanditViz current={current} />}
    />
  )
}
