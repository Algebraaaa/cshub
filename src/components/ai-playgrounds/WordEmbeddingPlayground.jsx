// 词嵌入 · 真实向量演算可视化
// 2D 投影散点 + 逐对余弦相似度 + king-man+woman 类比向量算术。
// 步骤携带 pythonLine/cppLine（对应 curriculum LATE_COURSE_CODE 的代码行）。
import { useCallback, useMemo } from 'react'
import PlaygroundShell from '../playgrounds/PlaygroundShell'
import VizCard from '../playgrounds/VizCard'

// 3 维教学向量（与课节 python 代码一致），前两维用于平面投影
const EMBED = {
  king:  [0.90, 0.20, 0.70],
  queen: [0.88, 0.22, 0.76],
  man:   [0.70, 0.10, 0.10],
  woman: [0.68, 0.18, 0.20],
  apple: [0.10, 0.90, 0.15],
  fruit: [0.15, 0.85, 0.25],
}
const WORDS = Object.keys(EMBED)

// 行号对应 curriculum.js LATE_COURSE_CODE['nlp-word-embedding'].code
const L = {
  load:    { pythonLine: 6,  cppLine: 5 },
  cosine:  { pythonLine: 4,  cppLine: 2 },
  query:   { pythonLine: 12, cppLine: 8 },
  scan:    { pythonLine: 13, cppLine: 10 },
  nearest: { pythonLine: 13, cppLine: 9 },
}

const dot = (a, b) => a.reduce((s, v, i) => s + v * b[i], 0)
const norm = (a) => Math.sqrt(dot(a, a))
const cosine = (a, b) => dot(a, b) / (norm(a) * norm(b))
const sub = (a, b) => a.map((v, i) => v - b[i])
const add = (a, b) => a.map((v, i) => v + b[i])
const fmt = (v, d = 3) => Number(v.toFixed(d))

const PAIRS = [['king', 'queen'], ['king', 'man'], ['man', 'woman'], ['king', 'apple']]

function computeSteps() {
  const steps = []
  const base = { vectors: EMBED, query: null, scores: {}, nearest: null }

  steps.push({
    ...base, phase: 'load', focusWords: WORDS,
    description: `加载 ${WORDS.length} 个词的嵌入向量（d=3），左图为前两维的平面投影。语义相近的词在空间中彼此靠近。`,
    ...L.load,
  })

  const scores = {}
  for (const [a, b] of PAIRS) {
    const c = cosine(EMBED[a], EMBED[b])
    scores[`${a}-${b}`] = c
    steps.push({
      ...base, phase: 'cosine', focusWords: [a, b], scores: { ...scores },
      probability: fmt(c),
      description: `cosine(${a}, ${b}) = ${fmt(c)}。${c > 0.9 ? '方向几乎一致 → 语义高度相关' : c > 0.6 ? '方向接近 → 语义相关' : '夹角大 → 语义无关'}。`,
      ...L.cosine,
    })
  }

  const query = add(sub(EMBED.king, EMBED.man), EMBED.woman)
  steps.push({
    ...base, phase: 'query', scores: { ...scores }, query, focusWords: ['king', 'man', 'woman'],
    description: `类比算术：query = vec(king) − vec(man) + vec(woman) = [${query.map(v => fmt(v, 2)).join(', ')}]。“王位属性”被保留，“男性属性”被替换为“女性属性”。`,
    ...L.query,
  })

  let best = null; let bestScore = -Infinity
  const queryScores = {}
  for (const w of WORDS) {
    if (w === 'king' || w === 'man' || w === 'woman') continue  // 排除输入词
    const c = cosine(query, EMBED[w])
    queryScores[w] = c
    if (c > bestScore) { bestScore = c; best = w }
    steps.push({
      ...base, phase: 'scan', scores: { ...scores }, query, queryScores: { ...queryScores }, focusWords: [w],
      probability: fmt(c),
      description: `cosine(query, ${w}) = ${fmt(c)}。`,
      ...L.scan,
    })
  }

  steps.push({
    ...base, phase: 'nearest', scores: { ...scores }, query, queryScores, nearest: best, focusWords: [best],
    probability: fmt(bestScore),
    description: `最近邻 = "${best}"（cosine = ${fmt(bestScore)}）。king − man + woman ≈ ${best}：词向量空间编码了类比关系。`,
    ...L.nearest,
  })
  return steps
}

const W = 460, H = 300, PAD = 40
const sx = (v) => PAD + v * (W - 2 * PAD)
const sy = (v) => H - PAD - v * (H - 2 * PAD)

function SpaceViz({ current }) {
  const focus = new Set(current.focusWords || [])
  const q = current.query
  return (
    <VizCard>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'center' }}>
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxWidth: 460 }}>
          <line x1={PAD} y1={H - PAD} x2={W - PAD} y2={H - PAD} stroke="var(--border)" />
          <line x1={PAD} y1={PAD} x2={PAD} y2={H - PAD} stroke="var(--border)" />
          <text x={W / 2} y={H - 8} textAnchor="middle" fill="var(--text-tertiary)" fontSize="10">维度 1</text>
          <text x={12} y={H / 2} textAnchor="middle" fill="var(--text-tertiary)" fontSize="10" transform={`rotate(-90, 12, ${H / 2})`}>维度 2</text>

          {/* 类比向量箭头：king → king-man、→ +woman */}
          {q && (
            <g>
              <line x1={sx(EMBED.king[0])} y1={sy(EMBED.king[1])} x2={sx(q[0])} y2={sy(q[1])}
                stroke="var(--accent)" strokeWidth="2" strokeDasharray="5,4" opacity="0.85" />
              <circle cx={sx(q[0])} cy={sy(q[1])} r="7" fill="none" stroke="var(--accent)" strokeWidth="2.5">
                <animate attributeName="r" values="7;10;7" dur="1.2s" repeatCount="indefinite" />
              </circle>
              <text x={sx(q[0]) + 10} y={sy(q[1]) - 8} fill="var(--accent)" fontSize="11" fontWeight="700">query</text>
            </g>
          )}

          {WORDS.map(w => {
            const [x, y] = EMBED[w]
            const hot = focus.has(w)
            const isNearest = current.nearest === w
            return (
              <g key={w}>
                <circle cx={sx(x)} cy={sy(y)} r={hot ? 9 : 6}
                  fill={isNearest ? '#10b981' : hot ? 'var(--accent)' : 'var(--surface)'}
                  stroke={hot || isNearest ? 'white' : 'var(--border-strong)'} strokeWidth="1.5" />
                <text x={sx(x)} y={sy(y) - 12} textAnchor="middle" fontSize="11" fontWeight={hot ? 700 : 500}
                  fill={isNearest ? '#10b981' : hot ? 'var(--accent-light)' : 'var(--text-secondary)'}>{w}</text>
              </g>
            )
          })}
        </svg>

        <div style={{ minWidth: 200, fontSize: 12, fontFamily: 'var(--font-mono)' }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--text-tertiary)', marginBottom: 6 }}>
            COSINE 相似度
          </div>
          {Object.entries(current.scores || {}).map(([k, v]) => (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', gap: 10, padding: '2px 0', color: 'var(--text-secondary)' }}>
              <span>{k}</span><b style={{ color: v > 0.9 ? '#10b981' : v > 0.6 ? 'var(--accent-light)' : 'var(--text-tertiary)' }}>{fmt(v)}</b>
            </div>
          ))}
          {current.queryScores && (
            <>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--text-tertiary)', margin: '10px 0 6px' }}>
                QUERY 最近邻扫描
              </div>
              {Object.entries(current.queryScores).map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', gap: 10, padding: '2px 0',
                  color: current.nearest === k ? '#10b981' : 'var(--text-secondary)' }}>
                  <span>query · {k}</span><b>{fmt(v)}</b>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </VizCard>
  )
}

export default function WordEmbeddingPlayground() {
  const presets = useMemo(() => [{ id: 'analogy', label: 'king − man + woman', state: {} }], [])
  const computeStepsFn = useCallback(() => computeSteps(), [])
  return (
    <PlaygroundShell
      initialState={{}}
      presets={presets}
      computeSteps={computeStepsFn}
      legend={[
        { color: 'var(--accent)', label: '当前词 / 类比向量' },
        { color: '#10b981', label: '最近邻结果' },
      ]}
      renderViz={({ current }) => <SpaceViz current={current} />}
    />
  )
}
