import { useMemo } from 'react'
import PlaygroundShell from '../playgrounds/PlaygroundShell'
import VizCard from '../playgrounds/VizCard'

// 4 tokens with embeddings
const TOKEN_PRESETS = {
  simple: {
    label: '简单句: "我 爱 深度 学习"',
    tokens: [
      { text: '我', embed: [1.0, 0.2, 0.1] },
      { text: '爱', embed: [0.3, 1.0, 0.2] },
      { text: '深度', embed: [0.1, 0.3, 1.0] },
      { text: '学习', embed: [0.2, 0.1, 0.9] },
    ],
    Wq: [[1, 0, 0], [0, 1, 0], [0, 0, 1]], // identity-ish for clarity
    Wk: [[1, 0, 0], [0, 1, 0], [0, 0, 1]],
    Wv: [[1, 0, 0], [0, 1, 0], [0, 0, 1]],
  },
  attention: {
    label: '注意力型: "猫 坐 在 垫子"',
    tokens: [
      { text: '猫', embed: [0.9, 0.1, 0.0] },   // subject
      { text: '坐', embed: [0.2, 0.9, 0.1] },   // verb
      { text: '在', embed: [0.1, 0.2, 0.8] },   // preposition
      { text: '垫子', embed: [0.7, 0.0, 0.5] }, // object (cat-like)
    ],
    Wq: [[0.8, 0.1, 0.0], [0.1, 0.9, 0.0], [0.0, 0.0, 1.0]],
    Wk: [[0.9, 0.0, 0.0], [0.0, 0.8, 0.1], [0.0, 0.1, 0.9]],
    Wv: [[1, 0, 0], [0, 1, 0], [0, 0, 1]],
  },
  selfref: {
    label: '自指: "它 它 很 好"',
    tokens: [
      { text: '它', embed: [1.0, 0.0, 0.0] },
      { text: '它', embed: [0.95, 0.02, 0.0] },  // near duplicate
      { text: '很', embed: [0.0, 1.0, 0.0] },
      { text: '好', embed: [0.0, 0.1, 1.0] },
    ],
    Wq: [[1, 0, 0], [0, 1, 0], [0, 0, 1]],
    Wk: [[1, 0, 0], [0, 1, 0], [0, 0, 1]],
    Wv: [[1, 0, 0], [0, 1, 0], [0, 0, 1]],
  },
}

function matVec(M, v) {
  return M.map(row => row.reduce((s, r, j) => s + r * v[j], 0))
}

function softmax(arr) {
  const mx = Math.max(...arr)
  const ex = arr.map(x => Math.exp(x - mx))
  const s = ex.reduce((a, b) => a + b, 0)
  return ex.map(e => e / s)
}

function computeSteps({ presetKey }) {
  const preset = TOKEN_PRESETS[presetKey]
  const { tokens, Wq, Wk, Wv } = preset
  const d = tokens[0].embed.length
  const steps = []
  const T = tokens.length

  // Step 1: Input embeddings
  steps.push({
    description: `步骤 1: 输入 ${T} 个 token 及其嵌入向量 (d=${d})。`,
    preset, phase: 'input', tokens, line: 1,
  })

  // Step 2: Q, K, V projection
  const Q = tokens.map(t => matVec(Wq, t.embed))
  const K = tokens.map(t => matVec(Wk, t.embed))
  const V = tokens.map(t => matVec(Wv, t.embed))
  steps.push({
    description: `步骤 2: 线性投影得到 Q, K, V。Q = X·Wq, K = X·Wk, V = X·Wv。每个 token 有 q, k, v 向量。`,
    preset, phase: 'qkv', tokens, Q, K, V, line: 2,
  })

  // Step 3: Q·K^T / sqrt(d) attention scores
  const sqrtD = Math.sqrt(d)
  const scores = Q.map(qi => K.map(kj => qi.reduce((s, v, k) => s + v * kj[k], 0) / sqrtD))
  steps.push({
    description: `步骤 3: 计算注意力得分矩阵 S = Q·Kᵀ / √d = Q·Kᵀ / ${sqrtD.toFixed(2)}。S[i][j] 表示 token i 对 token j 的关注程度。`,
    preset, phase: 'scores', tokens, Q, K, V, scores, currentRow: -1, line: 3,
  })

  // Step 4: softmax row by row
  for (let i = 0; i < T; i++) {
    const attn = softmax(scores[i])
    steps.push({
      description: `步骤 4.${i + 1}: 对第 ${i} 行 (token "${tokens[i].text}") 做 softmax 归一化 → 注意力权重 α = [${attn.map(v => v.toFixed(2)).join(', ')}]`,
      preset, phase: 'softmax', tokens, Q, K, V, scores, currentRow: i, attn,
      line: 4 + i,
    })
  }

  // Full attention matrix after softmax
  const attnMatrix = scores.map(row => softmax(row))
  steps.push({
    description: `步骤 5: 完整注意力权重矩阵 A = softmax(Q·Kᵀ/√d)。每行和为 1, 表示各 token 的注意力分配。`,
    preset, phase: 'attn-matrix', tokens, Q, K, V, scores, attnMatrix, currentRow: -1, line: 8,
  })

  // Step 6: weighted sum to get output
  const outputs = attnMatrix.map((row) => {
    const out = [0, 0, 0]
    for (let j = 0; j < T; j++) {
      for (let k = 0; k < d; k++) out[k] += row[j] * V[j][k]
    }
    return out
  })
  steps.push({
    description: `步骤 6: 输出 = A·V。每个输出 token 是 V 的加权和。例: 输出"${tokens[0].text}" = Σ α[0][j] · V_j。`,
    preset, phase: 'output', tokens, Q, K, V, scores, attnMatrix, outputs, line: 9,
  })

  return steps
}

function EmbeddingVec({ vec }) {
  return (
    <div style={{ display: 'flex', gap: 2, fontSize: 10, fontFamily: 'monospace' }}>
      {vec.map((v, i) => {
        const opacity = Math.min(1, Math.max(0.2, Math.abs(v)))
        const bg = v >= 0 ? `rgba(139,92,246,${opacity})` : `rgba(244,114,182,${opacity})`
        return (
          <div key={i} style={{
            padding: '2px 5px', borderRadius: 3, background: bg, color: 'white', minWidth: 22, textAlign: 'center',
          }}>{v.toFixed(2)}</div>
        )
      })}
    </div>
  )
}

function renderViz({ current }) {
  const { phase, tokens, Q, K, V, scores, attnMatrix, currentRow, attn, outputs } = current

  const cellStyle = {
    padding: '8px 10px', borderRadius: 6, fontFamily: 'monospace', fontSize: 11,
    background: 'var(--surface)', border: '1px solid var(--border)', textAlign: 'center',
  }

  return (
    <VizCard>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
        {/* Token strip */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
          {tokens.map((t, i) => (
            <div key={i} style={{
              ...cellStyle,
              borderColor: currentRow === i ? '#fbbf24' : 'var(--border)',
              boxShadow: currentRow === i ? '0 0 0 2px rgba(251,191,36,0.3)' : 'none',
            }}>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 2 }}>{t.text}</div>
              <div style={{ fontSize: 9, color: 'var(--text-tertiary)' }}>token #{i}</div>
              {phase !== 'input' && (
                <div style={{ marginTop: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 2, fontSize: 9, color: '#38bdf8' }}>
                    <span>q</span><EmbeddingVec vec={Q[i]} color="#38bdf8" />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 2, fontSize: 9, color: '#f472b6' }}>
                    <span>k</span><EmbeddingVec vec={K[i]} color="#f472b6" />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 2, fontSize: 9, color: '#10b981' }}>
                    <span>v</span><EmbeddingVec vec={V[i]} color="#10b981" />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Attention heatmap */}
        {(phase === 'scores' || phase === 'softmax' || phase === 'attn-matrix' || phase === 'output') && (() => {
          const matrix = phase === 'attn-matrix' || phase === 'output' ? attnMatrix : (phase === 'softmax' && attn ? scores.map((r, i) => i === currentRow ? attn : r) : scores)
          const allVals = matrix.flat()
          const mx = Math.max(...allVals), mn = Math.min(...allVals)
          const title = phase === 'scores' ? '得分 S = Q·Kᵀ/√d' : '注意力权重 A = softmax(S)'
          return (
            <div>
              <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6, fontWeight: 600 }}>
                {title}
              </div>
              <div style={{ display: 'inline-block', borderRadius: 8, overflow: 'hidden', border: '1px solid var(--border)' }}>
                {/* Header row (K tokens) */}
                <div style={{ display: 'grid', gridTemplateColumns: `60px repeat(${tokens.length}, 56px)` }}>
                  <div style={{ padding: '6px 4px', background: 'var(--surface)', textAlign: 'center', fontSize: 10, color: 'var(--text-tertiary)' }}>Q \ K</div>
                  {tokens.map((t, j) => (
                    <div key={j} style={{
                      padding: '6px 4px', background: 'var(--surface)', textAlign: 'center',
                      fontSize: 11, fontWeight: 600, color: '#f472b6', fontFamily: 'monospace',
                    }}>
                      {t.text}
                    </div>
                  ))}
                  {matrix.map((row, i) => (
                    <RowKey row={row} i={i} tokens={tokens} currentRow={currentRow} phase={phase} mx={mx} mn={mn} />
                  ))}
                </div>
              </div>
            </div>
          )
        })()}

        {/* Softmax row detail */}
        {phase === 'softmax' && attn && (
          <div style={{
            display: 'flex', gap: 6, padding: '8px 12px', borderRadius: 8,
            background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.3)',
            fontFamily: 'monospace', fontSize: 11,
          }}>
            <span style={{ color: 'var(--text-secondary)' }}>
              "{tokens[currentRow].text}" 注意力分配 →
            </span>
            {tokens.map((t, j) => (
              <span key={j} style={{ color: attn[j] > 0.4 ? '#8b5cf6' : 'var(--text-secondary)', fontWeight: attn[j] > 0.4 ? 700 : 500 }}>
                {t.text}: {attn[j].toFixed(2)}
              </span>
            ))}
            <span style={{ color: 'var(--text-tertiary)' }}>
              Σ = {attn.reduce((s, v) => s + v, 0).toFixed(2)}
            </span>
          </div>
        )}

        {/* Output vectors */}
        {phase === 'output' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: '100%', maxWidth: 600 }}>
            <div style={{ textAlign: 'center', fontSize: 12, color: '#10b981', fontWeight: 600 }}>
              输出 Output = A · V
            </div>
            {tokens.map((t, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '6px 10px', borderRadius: 6,
                background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)',
              }}>
                <span style={{ fontFamily: 'monospace', fontSize: 12, minWidth: 60, color: 'var(--text-secondary)' }}>
                  out({t.text})
                </span>
                <EmbeddingVec vec={outputs[i]} color="#10b981" />
                {/* Attention bars */}
                <div style={{ display: 'flex', gap: 2, marginLeft: 'auto' }}>
                  {attnMatrix[i].map((a, j) => (
                    <div key={j} style={{
                      width: 6, height: Math.max(3, a * 28),
                      background: '#8b5cf6', borderRadius: 2, opacity: 0.7,
                    }} title={`→${tokens[j].text}: ${a.toFixed(2)}`} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </VizCard>
  )
}

function RowKey({ row, i, tokens, currentRow, phase, mx, mn }) {
  const isCur = i === currentRow && (phase === 'scores' || phase === 'softmax')
  return (
    <>
      <div style={{
        padding: '8px 4px', background: isCur ? 'rgba(251,191,36,0.2)' : 'var(--surface)',
        textAlign: 'center', fontSize: 11, fontWeight: 600, color: '#38bdf8', fontFamily: 'monospace',
        borderTop: isCur ? '2px solid #fbbf24' : '1px solid var(--border)',
        borderBottom: isCur ? '2px solid #fbbf24' : '1px solid var(--border)',
        borderLeft: isCur ? '2px solid #fbbf24' : '1px solid var(--border)',
      }}>
        {tokens[i].text}
      </div>
      {row.map((v, j) => {
        const range = mx - mn || 1
        const norm = (v - mn) / range
        const isAttn = phase === 'attn-matrix' || phase === 'output' || (phase === 'softmax' && isCur)
        let bg, fg
        if (isAttn) {
          bg = `rgba(139,92,246,${Math.max(0.15, norm)})`
          fg = norm > 0.4 ? 'white' : '#334155'
        } else {
          const r = Math.round(255 * (1 - norm) + 56 * norm)
          const g = Math.round(255 * (1 - norm) + 189 * norm)
          const b = Math.round(255 * (1 - norm) + 248 * norm)
          bg = `rgb(${r},${g},${b})`
          fg = norm > 0.5 ? 'white' : '#334155'
        }
        return (
          <div key={j} style={{
            background: bg, color: fg,
            padding: '8px 4px', fontSize: 11, fontFamily: 'monospace', fontWeight: 600,
            textAlign: 'center',
            borderTop: isCur && j === 0 ? '2px solid #fbbf24' : (isCur ? '2px solid #fbbf24' : '1px solid var(--border)'),
            borderBottom: isCur ? '2px solid #fbbf24' : '1px solid var(--border)',
            borderRight: isCur && j === row.length - 1 ? '2px solid #fbbf24' : (isCur ? '2px solid #fbbf24' : '1px solid var(--border)'),
          }}>
            {v.toFixed(2)}
          </div>
        )
      })}
    </>
  )
}

export default function AttentionPlayground() {
  const presets = useMemo(() => Object.entries(TOKEN_PRESETS).map(([id, p]) => ({ id, label: p.label, state: { presetKey: id } })), [])
  return (
    <PlaygroundShell
      initialState={{ presetKey: 'simple' }}
      presets={presets}
      computeSteps={computeSteps}
      legend={[
        { color: '#38bdf8', label: 'Q 查询 (Query)' },
        { color: '#f472b6', label: 'K 键 (Key)' },
        { color: '#10b981', label: 'V 值 (Value)' },
        { color: '#8b5cf6', label: '注意力权重' },
        { color: '#fbbf24', label: '当前处理行' },
      ]}
      renderViz={renderViz}
    />
  )
}
