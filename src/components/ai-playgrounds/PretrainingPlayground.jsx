// LLM 预训练 · next-token prediction 真实损失演算
// 微型语料 → 输入/目标错位 → 模型预测分布（真实 softmax）→
// 逐 token 交叉熵 −log P(target) → 平均 loss → 参数更新后 loss 下降。
import { useCallback, useMemo } from 'react'
import PlaygroundShell from '../playgrounds/PlaygroundShell'
import VizCard from '../playgrounds/VizCard'

// 行号对应 curriculum.js LATE_COURSE_CODE['llm-pretraining'].code
const L = {
  tokens:  { pythonLine: 1, cppLine: 1 },
  inputs:  { pythonLine: 2, cppLine: 2 },
  targets: { pythonLine: 3, cppLine: 3 },
  logits:  { pythonLine: 4, cppLine: 4 },
  loss:    { pythonLine: 5, cppLine: 5 },
  step:    { pythonLine: 7, cppLine: 6 },
  ret:     { pythonLine: 8, cppLine: 7 },
}

const SENT = ['我', '爱', '机器', '学习']
const VOCAB = ['我', '爱', '机器', '学习', '苹果']

// 两轮的"模型 logits"（训练前 vs 一次更新后）——固定教学值，
// 体现"更新后正确 token 的 logit 上升 → loss 下降"
const LOGITS_BY_ROUND = [
  [ // 训练前：预测较差
    { 我: 0.5, 爱: 1.0, 机器: 0.3, 学习: 0.2, 苹果: 0.8 },   // 上文「我」→ 目标 爱
    { 我: 0.2, 爱: 0.4, 机器: 0.9, 学习: 0.6, 苹果: 1.0 },   // 上文「我 爱」→ 目标 机器
    { 我: 0.1, 爱: 0.2, 机器: 0.5, 学习: 1.1, 苹果: 0.9 },   // 上文「我 爱 机器」→ 目标 学习
  ],
  [ // 一次梯度更新后：正确 token 的 logit 提升
    { 我: 0.3, 爱: 2.0, 机器: 0.3, 学习: 0.2, 苹果: 0.5 },
    { 我: 0.1, 爱: 0.3, 机器: 2.1, 学习: 0.6, 苹果: 0.6 },
    { 我: 0.1, 爱: 0.2, 机器: 0.4, 学习: 2.2, 苹果: 0.5 },
  ],
]

const fmt = (v, d = 3) => Number(v.toFixed(d))

function softmax(logitMap) {
  const vals = VOCAB.map(w => logitMap[w])
  const m = Math.max(...vals)
  const ex = vals.map(v => Math.exp(v - m))
  const s = ex.reduce((a, b) => a + b, 0)
  return Object.fromEntries(VOCAB.map((w, i) => [w, ex[i] / s]))
}

function computeSteps() {
  const steps = []
  const inputs = SENT.slice(0, -1)
  const targets = SENT.slice(1)

  steps.push({ phase: 'tokens', sent: SENT,
    description: `语料句子「${SENT.join(' ')}」切分为 ${SENT.length} 个 token。词表 V = {${VOCAB.join(', ')}}（|V|=${VOCAB.length}）。`, ...L.tokens })
  steps.push({ phase: 'inputs', sent: SENT, inputs,
    description: `inputs = tokens[:-1] = [${inputs.join(', ')}]：模型每个位置只能看到它左边的上文。`, ...L.inputs })
  steps.push({ phase: 'targets', sent: SENT, inputs, targets,
    description: `targets = tokens[1:] = [${targets.join(', ')}]：每个位置的训练目标是预测下一个 token。`, ...L.targets })

  LOGITS_BY_ROUND.forEach((roundLogits, round) => {
    const losses = []
    const rows = []
    targets.forEach((tgt, t) => {
      const probs = softmax(roundLogits[t])
      const p = probs[tgt]
      const nll = -Math.log(p)
      losses.push(nll)
      rows.push({ context: SENT.slice(0, t + 1).join(' '), target: tgt, probs, p: fmt(p), nll: fmt(nll) })
      steps.push({
        phase: 'logits', sent: SENT, inputs, targets, rows: rows.slice(), round: round + 1, focusT: t,
        probability: fmt(p),
        description: `第 ${round + 1} 轮 · 位置 ${t}：上文「${SENT.slice(0, t + 1).join(' ')}」→ 模型输出分布，P(目标="${tgt}") = ${fmt(p)}，单 token 损失 −log P = ${fmt(nll)}。`,
        ...L.logits,
      })
    })
    const avg = losses.reduce((a, b) => a + b, 0) / losses.length
    steps.push({
      phase: 'loss', sent: SENT, inputs, targets, rows, round: round + 1, loss: fmt(avg),
      description: `第 ${round + 1} 轮平均交叉熵 loss = (${losses.map(v => fmt(v, 2)).join(' + ')}) / ${losses.length} = ${fmt(avg)}。`,
      ...L.loss,
    })
    if (round === 0) {
      steps.push({
        phase: 'step', sent: SENT, inputs, targets, rows, round: round + 1, loss: fmt(avg),
        description: `反向传播 + optimizer.step()：把正确 token 的 logit 推高、错误的压低。这一过程在海量文本上重复数万亿次。`,
        ...L.step,
      })
    }
  })

  const l0 = fmt(LOGITS_BY_ROUND[0].reduce((s, lm, t) => s - Math.log(softmax(lm)[targets[t]]), 0) / 3)
  const l1 = fmt(LOGITS_BY_ROUND[1].reduce((s, lm, t) => s - Math.log(softmax(lm)[targets[t]]), 0) / 3)
  steps.push({
    phase: 'ret', sent: SENT, inputs, targets, loss: l1,
    description: `一次更新后 loss 从 ${l0} 降到 ${l1}。预训练 = 在整个互联网文本上最小化这一损失；之后再经 SFT（指令微调）与 RLHF（偏好对齐）成为对话助手。`,
    ...L.ret,
  })
  return steps
}

function TokenChips({ tokens, dimLast, label, color }) {
  return (
    <div>
      <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-tertiary)', marginBottom: 4 }}>{label}</div>
      <div style={{ display: 'flex', gap: 6 }}>
        {tokens.map((t, i) => (
          <span key={i} style={{
            padding: '4px 10px', borderRadius: 8, fontSize: 13, fontWeight: 600,
            background: color, color: 'var(--text-primary)',
            opacity: dimLast && i === tokens.length - 1 ? 0.35 : 1,
            border: '1px solid var(--border)',
          }}>{t}</span>
        ))}
      </div>
    </div>
  )
}

function LMViz({ current }) {
  return (
    <VizCard>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 22 }}>
          <TokenChips tokens={current.sent} label="语料 tokens" color="var(--surface)" />
          {current.inputs && <TokenChips tokens={current.inputs} label="inputs（上文）" color="rgba(139,92,246,0.15)" />}
          {current.targets && <TokenChips tokens={current.targets} label="targets（下一个词）" color="rgba(16,185,129,0.15)" />}
        </div>

        {current.rows?.length > 0 && (
          <table style={{ borderCollapse: 'collapse', fontSize: 12, fontFamily: 'var(--font-mono)', maxWidth: 640 }}>
            <thead>
              <tr style={{ color: 'var(--text-tertiary)', fontSize: 10, textAlign: 'left' }}>
                <th style={{ padding: '3px 8px' }}>上文</th>
                <th style={{ padding: '3px 8px' }}>目标</th>
                <th style={{ padding: '3px 8px' }}>预测分布（P 最高的 3 个）</th>
                <th style={{ padding: '3px 8px' }}>P(目标)</th>
                <th style={{ padding: '3px 8px' }}>−log P</th>
              </tr>
            </thead>
            <tbody>
              {current.rows.map((row, t) => {
                const top3 = Object.entries(row.probs).sort((a, b) => b[1] - a[1]).slice(0, 3)
                const hot = current.focusT === t
                return (
                  <tr key={t} style={{
                    borderTop: '1px solid var(--border)',
                    background: hot ? 'var(--accent-soft)' : 'transparent',
                    color: 'var(--text-secondary)',
                  }}>
                    <td style={{ padding: '4px 8px' }}>{row.context}</td>
                    <td style={{ padding: '4px 8px', fontWeight: 700, color: '#10b981' }}>{row.target}</td>
                    <td style={{ padding: '4px 8px' }}>
                      {top3.map(([w, p]) => `${w}:${fmt(p, 2)}`).join('  ')}
                    </td>
                    <td style={{ padding: '4px 8px', fontWeight: 700 }}>{row.p}</td>
                    <td style={{ padding: '4px 8px', color: row.nll > 1.5 ? '#ef4444' : '#10b981', fontWeight: 700 }}>{row.nll}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}

        {current.loss != null && (
          <div style={{ fontSize: 13, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
            {current.round ? `第 ${current.round} 轮 ` : ''}平均 loss = <b style={{ color: current.loss > 1.2 ? '#ef4444' : '#10b981' }}>{current.loss}</b>
          </div>
        )}
      </div>
    </VizCard>
  )
}

export default function PretrainingPlayground() {
  const presets = useMemo(() => [{ id: 'next-token', label: 'Next-token 预测', state: {} }], [])
  const computeStepsFn = useCallback(() => computeSteps(), [])
  return (
    <PlaygroundShell
      initialState={{}}
      presets={presets}
      computeSteps={computeStepsFn}
      legend={[
        { color: 'var(--accent)', label: '当前训练位置' },
        { color: '#10b981', label: '目标 token / loss 下降' },
      ]}
      renderViz={({ current }) => <LMViz current={current} />}
    />
  )
}
