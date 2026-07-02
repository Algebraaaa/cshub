// RAG · 真实向量检索演算可视化
// 文档切片带 2D 嵌入 → 查询向量 → 逐文档真实余弦相似度 →
// Top-K 排序 → 注入 Prompt → 基于证据生成。
import { useCallback, useMemo } from 'react'
import PlaygroundShell from '../playgrounds/PlaygroundShell'
import VizCard from '../playgrounds/VizCard'

// 行号对应 curriculum.js LATE_COURSE_CODE['llm-rag'].code
const L = {
  embed:    { pythonLine: 2, cppLine: 2 },
  search:   { pythonLine: 3, cppLine: 3 },
  prompt:   { pythonLine: 4, cppLine: 4 },
  generate: { pythonLine: 5, cppLine: 5 },
  ret:      { pythonLine: 6, cppLine: 6 },
}

const QUERY = { text: 'Transformer 是哪一年提出的？', vec: [0.85, 0.30] }
const DOCS = [
  { id: 'D1', text: 'Transformer 由 Vaswani 等人于 2017 年在《Attention Is All You Need》中提出', vec: [0.88, 0.26] },
  { id: 'D2', text: '自注意力机制允许序列内任意位置直接交互', vec: [0.74, 0.42] },
  { id: 'D3', text: 'BERT 在 2018 年基于 Transformer 编码器预训练', vec: [0.80, 0.18] },
  { id: 'D4', text: '卷积神经网络擅长提取图像局部特征', vec: [0.18, 0.85] },
  { id: 'D5', text: '梯度下降沿负梯度方向更新参数', vec: [0.30, 0.65] },
  { id: 'D6', text: '红黑树通过旋转与染色保持平衡', vec: [0.05, 0.40] },
]
const TOP_K = 3

const fmt = (v) => Number(v.toFixed(3))
const cosine = (a, b) => {
  const dot = a[0] * b[0] + a[1] * b[1]
  return dot / (Math.hypot(...a) * Math.hypot(...b))
}

function computeSteps() {
  const steps = []
  const snap = (phase, desc, lines, extra = {}) => steps.push({ phase, description: desc, ...lines, ...extra })

  snap('embed', `用户提问：「${QUERY.text}」→ 嵌入为查询向量 q = [${QUERY.vec.join(', ')}]。知识库已离线切片并嵌入（${DOCS.length} 个片段）。`, L.embed, { showQuery: true })

  const scores = {}
  for (const d of DOCS) {
    scores[d.id] = cosine(QUERY.vec, d.vec)
    snap('search', `cosine(q, ${d.id}) = ${fmt(scores[d.id])}「${d.text.slice(0, 18)}…」`, L.search,
      { showQuery: true, scores: { ...scores }, focusDoc: d.id, probability: fmt(scores[d.id]) })
  }

  const ranked = [...DOCS].sort((a, b) => scores[b.id] - scores[a.id])
  const topK = ranked.slice(0, TOP_K).map(d => d.id)
  snap('search', `按相似度排序，取 Top-${TOP_K}：${topK.map(id => `${id}(${fmt(scores[id])})`).join(' > ')}。与提问无关的 ${ranked.slice(TOP_K).map(d => d.id).join('、')} 被过滤。`,
    L.search, { showQuery: true, scores, topK })

  snap('prompt', `构造 Prompt：把 ${topK.join('、')} 的原文作为「证据」拼接在问题前。模型生成时只需引用上下文，无需依赖参数化记忆。`,
    L.prompt, { showQuery: true, scores, topK, promptBuilt: true })

  snap('generate', `LLM 基于证据生成：「Transformer 于 2017 年由 Vaswani 等人提出（见 D1）」——答案有出处可查，幻觉风险显著降低。`,
    L.generate, { showQuery: true, scores, topK, promptBuilt: true, answered: true })

  snap('ret', `返回答案与引用片段。对比无检索的直接生成：RAG 用 O(检索) 的代价换取了事实性与可溯源性。`,
    L.ret, { showQuery: true, scores, topK, promptBuilt: true, answered: true })
  return steps
}

const W = 360, H = 280, PAD = 34
const sx = (v) => PAD + v * (W - 2 * PAD)
const sy = (v) => H - PAD - v * (H - 2 * PAD)

function RagViz({ current }) {
  const topK = new Set(current.topK || [])
  return (
    <VizCard>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 18 }}>
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxWidth: 360 }}>
          <line x1={PAD} y1={H - PAD} x2={W - PAD} y2={H - PAD} stroke="var(--border)" />
          <line x1={PAD} y1={PAD} x2={PAD} y2={H - PAD} stroke="var(--border)" />
          <text x={W / 2} y={H - 8} textAnchor="middle" fontSize="9" fill="var(--text-tertiary)">嵌入空间（2D 投影）</text>

          {current.showQuery && (
            <g>
              {DOCS.filter(d => current.focusDoc === d.id || topK.has(d.id)).map(d => (
                <line key={d.id} x1={sx(QUERY.vec[0])} y1={sy(QUERY.vec[1])} x2={sx(d.vec[0])} y2={sy(d.vec[1])}
                  stroke={topK.has(d.id) ? '#10b981' : '#f97316'} strokeWidth="1.4" strokeDasharray="4,3" opacity="0.8" />
              ))}
              <circle cx={sx(QUERY.vec[0])} cy={sy(QUERY.vec[1])} r="8" fill="var(--accent)" stroke="white" strokeWidth="2">
                <animate attributeName="r" values="8;10;8" dur="1.2s" repeatCount="indefinite" />
              </circle>
              <text x={sx(QUERY.vec[0])} y={sy(QUERY.vec[1]) - 13} textAnchor="middle" fontSize="10" fontWeight="700" fill="var(--accent-light)">query</text>
            </g>
          )}
          {DOCS.map(d => (
            <g key={d.id} opacity={current.topK && !topK.has(d.id) ? 0.4 : 1}>
              <circle cx={sx(d.vec[0])} cy={sy(d.vec[1])} r={current.focusDoc === d.id ? 8 : 6}
                fill={topK.has(d.id) ? '#10b981' : current.focusDoc === d.id ? '#f97316' : 'var(--surface)'}
                stroke="var(--border-strong)" strokeWidth="1.2" />
              <text x={sx(d.vec[0])} y={sy(d.vec[1]) + 16} textAnchor="middle" fontSize="9" fill="var(--text-secondary)">{d.id}</text>
            </g>
          ))}
        </svg>

        <div style={{ minWidth: 240, maxWidth: 420, fontSize: 12 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-tertiary)', marginBottom: 6 }}>相似度检索</div>
          {DOCS.map(d => {
            const s = current.scores?.[d.id]
            return (
              <div key={d.id} style={{
                display: 'flex', gap: 8, padding: '3px 0', alignItems: 'baseline',
                color: topK.has(d.id) ? '#10b981' : current.focusDoc === d.id ? '#f97316' : 'var(--text-secondary)',
                opacity: current.topK && !topK.has(d.id) ? 0.55 : 1,
              }}>
                <b style={{ fontFamily: 'var(--font-mono)', flexShrink: 0 }}>{d.id} {s != null ? fmt(s) : '—'}</b>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.text}</span>
              </div>
            )
          })}

          {current.promptBuilt && (
            <div style={{
              marginTop: 10, padding: '8px 10px', borderRadius: 8, fontSize: 11.5, lineHeight: 1.8,
              background: 'var(--surface)', border: '1px solid var(--border)', fontFamily: 'var(--font-mono)',
            }}>
              <span style={{ color: 'var(--text-tertiary)' }}>PROMPT ▸</span> 根据以下证据回答：<br />
              {(current.topK || []).map(id => <span key={id} style={{ color: '#10b981' }}>[{id}] </span>)}
              <span style={{ color: 'var(--text-tertiary)' }}>…</span><br />
              问题：{QUERY.text}
              {current.answered && (
                <div style={{ marginTop: 6, color: 'var(--accent-light)', fontWeight: 700 }}>
                  ANSWER ▸ Transformer 于 2017 年提出（引用 D1）
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </VizCard>
  )
}

export default function RAGPlayground() {
  const presets = useMemo(() => [{ id: 'retrieval', label: '语义检索 + 生成', state: {} }], [])
  const computeStepsFn = useCallback(() => computeSteps(), [])
  return (
    <PlaygroundShell
      initialState={{}}
      presets={presets}
      computeSteps={computeStepsFn}
      legend={[
        { color: 'var(--accent)', label: '查询向量' },
        { color: '#f97316', label: '正在计算相似度' },
        { color: '#10b981', label: 'Top-K 命中' },
      ]}
      renderViz={({ current }) => <RagViz current={current} />}
    />
  )
}
