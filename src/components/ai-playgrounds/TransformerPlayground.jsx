// Transformer 编码块 · 真实数值演算可视化
// 3 个 token × d=4，逐阶段计算：位置编码 → 自注意力 → 残差+LayerNorm → FFN → 输出。
// 每一步展示真实矩阵数值；步骤携带 pythonLine/cppLine。
import { useCallback, useMemo } from 'react'
import PlaygroundShell from '../playgrounds/PlaygroundShell'
import VizCard from '../playgrounds/VizCard'

// 行号对应 curriculum.js LATE_COURSE_CODE['nlp-transformer'].code
const L = {
  input:   { pythonLine: 1, cppLine: 1 },
  posenc:  { pythonLine: 2, cppLine: 2 },
  attn:    { pythonLine: 3, cppLine: 3 },
  norm1:   { pythonLine: 4, cppLine: 4 },
  ffn:     { pythonLine: 5, cppLine: 5 },
  norm2:   { pythonLine: 6, cppLine: 6 },
  output:  { pythonLine: 7, cppLine: 7 },
}

const TOKENS = ['我', '爱', 'AI']
const D = 4
// 固定输入嵌入（教学值）
const X0 = [
  [0.8, 0.1, 0.3, 0.0],
  [0.2, 0.9, 0.1, 0.4],
  [0.1, 0.3, 0.8, 0.6],
]

const fmt = (v) => Number(v.toFixed(2))
const matFmt = (M) => M.map(row => row.map(fmt))

function posEncoding(t, i) {
  const angle = t / Math.pow(10000, (2 * Math.floor(i / 2)) / D)
  return i % 2 === 0 ? Math.sin(angle) : Math.cos(angle)
}
function addMat(A, B) { return A.map((r, i) => r.map((v, j) => v + B[i][j])) }
function softmaxRow(row) {
  const m = Math.max(...row)
  const ex = row.map(v => Math.exp(v - m))
  const s = ex.reduce((a, b) => a + b, 0)
  return ex.map(e => e / s)
}
function layerNorm(M) {
  return M.map(row => {
    const mean = row.reduce((a, b) => a + b, 0) / row.length
    const variance = row.reduce((a, b) => a + (b - mean) ** 2, 0) / row.length
    const std = Math.sqrt(variance + 1e-5)
    return row.map(v => (v - mean) / std)
  })
}

function computeSteps() {
  const steps = []
  const push = (phase, matrices, desc, lines, extra = {}) =>
    steps.push({ phase, matrices, description: desc, ...lines, ...extra })

  push('input', [{ name: 'X（输入嵌入）', m: matFmt(X0) }],
    `输入 ${TOKENS.length} 个 token（"${TOKENS.join(' ')}"），每个映射为 d=${D} 的嵌入向量。`, L.input)

  // 1. 位置编码
  const PE = X0.map((_, t) => Array.from({ length: D }, (_, i) => posEncoding(t, i)))
  const X1 = addMat(X0, PE)
  push('posenc', [
    { name: 'PE（sin/cos 位置编码）', m: matFmt(PE) },
    { name: 'X + PE', m: matFmt(X1), hot: true },
  ], `叠加位置编码：PE[t,2i]=sin(t/10000^(2i/d))，PE[t,2i+1]=cos(...)。注意力本身不感知顺序，位置信息由此注入。`, L.posenc)

  // 2. 自注意力（Wq=Wk=Wv=I 简化，教学聚焦在 QK^T/softmax 的真实数值）
  const scale = Math.sqrt(D)
  const scores = X1.map(qi => X1.map(kj => qi.reduce((s, v, d) => s + v * kj[d], 0) / scale))
  push('attn', [{ name: `QKᵀ/√d（注意力分数）`, m: matFmt(scores), hot: true }],
    `计算注意力分数：score[i][j] = Q_i · K_j / √${D}。第 i 行表示 token "${TOKENS[0]}…" 对每个位置的关注强度（softmax 前）。`, L.attn)

  const A = scores.map(softmaxRow)
  push('attn', [{ name: 'softmax 后的注意力权重 A', m: matFmt(A), hot: true }],
    `逐行 softmax 归一化，每行和为 1。例如第 1 行 [${A[0].map(fmt).join(', ')}]：token "${TOKENS[0]}" 的输出由三个位置按这些权重加权。`,
    L.attn, { probability: fmt(Math.max(...A.flat())) })

  const attnOut = A.map(row => Array.from({ length: D }, (_, d) => row.reduce((s, w, j) => s + w * X1[j][d], 0)))
  push('attn', [{ name: 'Attn = A·V', m: matFmt(attnOut), hot: true }],
    `注意力输出 = 权重 × V（V=X+PE）。每个 token 的新表示混合了上下文信息。`, L.attn)

  // 3. 残差 + LayerNorm
  const H = layerNorm(addMat(X1, attnOut))
  push('norm1', [{ name: 'H = LayerNorm(X + Attn)', m: matFmt(H), hot: true }],
    `残差连接保留原始信息，LayerNorm 把每行归一化为均值 0、方差 1，稳定深层训练。`, L.norm1)

  // 4. FFN：W1 放大 ReLU 再压回（用固定教学权重 = 翻倍 + ReLU + 减半）
  const F = H.map(row => row.map(v => Math.max(0, v * 2) * 0.5))
  push('ffn', [{ name: 'F = FFN(H) = W₂·ReLU(W₁·H)', m: matFmt(F), hot: true }],
    `逐位置前馈网络：先升维 + ReLU（负值归零），再降回 d=${D}。本演示用 W₁=2I、W₂=0.5I 展示 ReLU 的截断效果。`, L.ffn)

  // 5. 残差 + LayerNorm 2
  const Y = layerNorm(addMat(H, F))
  push('norm2', [{ name: 'Y = LayerNorm(H + F)', m: matFmt(Y), hot: true }],
    `第二次残差 + LayerNorm。`, L.norm2)

  push('output', [{ name: 'Y（编码块输出）', m: matFmt(Y), hot: true }],
    `输出 ${TOKENS.length}×${D} 的上下文化表示，可继续送入下一层编码块或解码器。一个标准 Transformer 由 N 个这样的块堆叠。`, L.output)

  return steps
}

function MatrixTable({ name, m, hot }) {
  return (
    <div style={{ minWidth: 0 }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: hot ? 'var(--accent-light)' : 'var(--text-tertiary)', marginBottom: 4 }}>{name}</div>
      <table style={{ borderCollapse: 'collapse', fontFamily: 'var(--font-mono)', fontSize: 11.5 }}>
        <tbody>
          {m.map((row, i) => (
            <tr key={i}>
              <td style={{ padding: '2px 6px', color: 'var(--text-tertiary)', fontSize: 10 }}>{TOKENS[i] ?? i}</td>
              {row.map((v, j) => (
                <td key={j} style={{
                  padding: '3px 8px', textAlign: 'right',
                  border: '1px solid var(--border)',
                  background: hot ? `rgba(139,92,246,${Math.min(0.45, Math.abs(v) * 0.25)})` : 'transparent',
                  color: 'var(--text-primary)',
                }}>{v.toFixed(2)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

const STAGES = [
  ['input', '输入'], ['posenc', '位置编码'], ['attn', '自注意力'],
  ['norm1', 'Add&Norm'], ['ffn', 'FFN'], ['norm2', 'Add&Norm'], ['output', '输出'],
]

export default function TransformerPlayground() {
  const presets = useMemo(() => [{ id: 'encoder', label: '编码块前向', state: {} }], [])
  const computeStepsFn = useCallback(() => computeSteps(), [])
  return (
    <PlaygroundShell
      initialState={{}}
      presets={presets}
      computeSteps={computeStepsFn}
      renderViz={({ current }) => (
        <VizCard>
          {/* 阶段流水条 */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 12 }}>
            {STAGES.map(([key, label]) => (
              <span key={key + label} style={{
                padding: '3px 10px', borderRadius: 99, fontSize: 11, fontWeight: 600,
                background: current.phase === key ? 'var(--accent-soft)' : 'var(--surface)',
                color: current.phase === key ? 'var(--accent-light)' : 'var(--text-tertiary)',
                border: `1px solid ${current.phase === key ? 'var(--accent-border)' : 'var(--border)'}`,
              }}>{label}</span>
            ))}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 18 }}>
            {current.matrices.map(mt => <MatrixTable key={mt.name} {...mt} />)}
          </div>
        </VizCard>
      )}
    />
  )
}
