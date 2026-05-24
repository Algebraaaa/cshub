import StaticStepPlayground from './StaticStepPlayground'

// ─────────────────────────────────────────────────────────────
// AdvancedStructurePlayground · 按 slug 分派到专门的 viz
//   已实现：monotonicstack / monotonicqueue / heapops / prefixdiff
//          + dagshortest / binaryanswer / btree
//   STRUCTURE_TOPICS 全部 7 个 slug 都有专门 viz，FallbackViz 仅作防御。
// 步骤数据见 src/algorithms/p0Topics.js STRUCTURE_TOPICS：
//   { phase, title, items, state, note, active, description }
// ─────────────────────────────────────────────────────────────

const LEGEND_STACK = [
  { color: '#3b82f6', label: '输入数组' },
  { color: '#a855f7', label: '栈中元素' },
  { color: '#f59e0b', label: '当前操作' },
  { color: '#22c55e', label: '已确定答案' },
]
const LEGEND_QUEUE = [
  { color: '#3b82f6', label: '输入流' },
  { color: '#a855f7', label: '队列内' },
  { color: '#f59e0b', label: '当前操作' },
  { color: '#ef4444', label: '过期 / 弹出' },
]
const LEGEND_HEAP = [
  { color: '#a855f7', label: '堆节点' },
  { color: '#f59e0b', label: '本步变化' },
  { color: '#3b82f6', label: '比较 / 交换路径' },
]
const LEGEND_PREFIX = [
  { color: '#3b82f6', label: '原数组' },
  { color: '#a855f7', label: '前缀和' },
  { color: '#22c55e', label: '差分' },
  { color: '#f59e0b', label: '当前查询 / 修改' },
]
const LEGEND_DAG = [
  { color: '#3b82f6', label: 'DAG 节点' },
  { color: '#f59e0b', label: '正在松弛的边' },
  { color: '#22c55e', label: '已确定最短距离' },
]
const LEGEND_BINARY = [
  { color: '#22c55e', label: '可行区间' },
  { color: '#ef4444', label: '不可行区间' },
  { color: '#f59e0b', label: '当前 mid' },
  { color: '#3b82f6', label: 'low / high' },
]
const LEGEND_BTREE = [
  { color: '#a855f7', label: '内部节点（多关键字）' },
  { color: '#22c55e', label: '叶子层（B+ 链）' },
  { color: '#f59e0b', label: '本步变化' },
]
const LEGEND_FALLBACK = [
  { color: '#3b82f6', label: '输入序列' },
  { color: '#a855f7', label: '当前结构状态' },
  { color: '#22c55e', label: '已确定结果' },
]

// 在函数内查表（运行时）避免 Vite Fast Refresh 把模块顶层函数声明
// 改写为 const 后破坏提升导致 ReferenceError（HMR 兼容修复）。
// HMR sanity check trigger
function resolveDispatch(slug) {
  switch (slug) {
    case 'monotonicstack': return { component: MonotonicStackViz, legend: LEGEND_STACK,  minHeight: 380 }
    case 'monotonicqueue': return { component: MonotonicQueueViz, legend: LEGEND_QUEUE,  minHeight: 360 }
    case 'heapops':        return { component: HeapopsViz,        legend: LEGEND_HEAP,   minHeight: 420 }
    case 'prefixdiff':     return { component: PrefixDiffViz,     legend: LEGEND_PREFIX, minHeight: 380 }
    case 'dagshortest':    return { component: DagShortestViz,    legend: LEGEND_DAG,    minHeight: 400 }
    case 'binaryanswer':   return { component: BinaryAnswerViz,   legend: LEGEND_BINARY, minHeight: 380 }
    case 'btree':          return { component: BTreeViz,          legend: LEGEND_BTREE,  minHeight: 420 }
    default:               return null
  }
}

export default function AdvancedStructurePlayground({ algoFn, algoSlug }) {
  const dispatch = resolveDispatch(algoSlug)
  if (dispatch) {
    const { component: Viz, legend, minHeight } = dispatch
    return (
      <StaticStepPlayground
        algoFn={algoFn}
        legend={legend}
        minHeight={minHeight}
        renderViz={({ current, steps, stepIndex }) => (
          <Viz current={current} steps={steps} stepIndex={stepIndex} />
        )}
      />
    )
  }
  // Fallback：未做专门 viz 的 slug 仍用旧两栏文字卡片
  return (
    <StaticStepPlayground
      algoFn={algoFn}
      legend={LEGEND_FALLBACK}
      minHeight={360}
      renderViz={({ current }) => <FallbackViz current={current} />}
    />
  )
}

// ─── 共用：标题区 ──────────────────────────────────────────────
function Header({ eyebrow, title, phase }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
      <div>
        <div style={{ fontSize: 12, color: 'var(--text-tertiary)', fontWeight: 800, letterSpacing: '0.08em' }}>{eyebrow}</div>
        <div style={{ fontSize: 19, color: 'var(--text-primary)', fontWeight: 900, marginTop: 4 }}>{title}</div>
      </div>
      {phase && (
        <span style={{
          padding: '5px 11px', borderRadius: 99, fontSize: 11.5, fontWeight: 900, letterSpacing: '0.06em',
          fontFamily: 'var(--font-mono)', textTransform: 'uppercase',
          color: phaseColor(phase),
          background: `${phaseColor(phase)}1c`,
          border: `1px solid ${phaseColor(phase)}55`,
        }}>{phase}</span>
      )}
    </div>
  )
}

function phaseColor(phase) {
  switch (phase) {
    case 'push':    return '#a855f7'
    case 'pop':
    case 'popback': return '#ef4444'
    case 'expire':  return '#f59e0b'
    case 'insert':  return '#a855f7'
    case 'siftup':  return '#3b82f6'
    case 'siftdown':return '#0ea5e9'
    case 'delete':  return '#ef4444'
    case 'prefix':  return '#a855f7'
    case 'query':   return '#f59e0b'
    case 'diff':    return '#22c55e'
    case 'restore': return '#3b82f6'
    case 'topo':    return '#a855f7'
    case 'init':    return '#3b82f6'
    case 'relax':   return '#f59e0b'
    case 'range':   return '#22c55e'
    case 'mid':     return '#f59e0b'
    case 'done':    return '#22c55e'
    case 'node':    return '#a855f7'
    case 'split':   return '#f59e0b'
    case 'bplus':   return '#22c55e'
    default:        return '#94a3b8'
  }
}

function Cell({ value, kind = 'default', size = 42, mono = true }) {
  const palette = {
    default: { bg: 'var(--surface-2)', border: 'var(--border)', fg: 'var(--text-secondary)' },
    input:   { bg: '#3b82f614', border: '#3b82f655', fg: '#3b82f6' },
    stack:   { bg: '#a855f71c', border: '#a855f7', fg: '#a855f7' },
    queue:   { bg: '#a855f71c', border: '#a855f7', fg: '#a855f7' },
    active:  { bg: '#f59e0b22', border: '#f59e0b', fg: '#f59e0b' },
    success: { bg: '#22c55e1c', border: '#22c55e', fg: '#22c55e' },
    danger:  { bg: '#ef44441c', border: '#ef4444', fg: '#ef4444' },
    info:    { bg: '#0ea5e91c', border: '#0ea5e9', fg: '#0ea5e9' },
    muted:   { bg: 'var(--surface)', border: 'var(--border)', fg: 'var(--text-tertiary)' },
  }
  const c = palette[kind] || palette.default
  return (
    <span style={{
      minWidth: size, height: size, padding: '0 10px',
      borderRadius: 8, border: `2px solid ${c.border}`, background: c.bg, color: c.fg,
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      fontWeight: 900, fontFamily: mono ? 'var(--font-mono)' : 'inherit', fontSize: 15,
      transition: 'all 0.2s ease',
    }}>{value}</span>
  )
}

// ─── 单调栈 ───────────────────────────────────────────────────
function MonotonicStackViz({ current }) {
  if (!current) return null
  const items = current.items || []
  const stack = current.state || []
  return (
    <div style={{ minWidth: 720 }}>
      <Header eyebrow="MONOTONIC STACK" title={current.title} phase={current.phase} />

      <RowLabel>输入数组 input</RowLabel>
      <div style={{ display: 'flex', gap: 8, marginBottom: 28, flexWrap: 'wrap' }}>
        {items.map((v, i) => (
          <Cell key={`in-${i}`} value={v} kind={stack.includes(v) ? 'stack' : 'input'} />
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 24, alignItems: 'start' }}>
        <div>
          <RowLabel>栈顶 ↑ stack</RowLabel>
          {/* 纵向栈：栈顶在上，新元素自上推入 */}
          <div style={{
            display: 'flex', flexDirection: 'column-reverse', gap: 6,
            padding: '12px 14px 8px', borderRadius: 10,
            background: 'var(--surface-2)', border: '1px solid var(--border)',
            minHeight: 200,
          }}>
            <div style={{
              alignSelf: 'stretch', textAlign: 'center', fontSize: 11, fontWeight: 800,
              color: 'var(--text-tertiary)', letterSpacing: '0.08em',
              padding: '4px 0', borderTop: '1px dashed var(--border)',
            }}>↓ 栈底</div>
            {stack.map((v, i) => (
              <Cell key={`s-${i}`} value={v} kind={i === stack.length - 1 ? 'active' : 'stack'} />
            ))}
          </div>
        </div>

        <ActionPanel description={current.description} note={current.note} />
      </div>
    </div>
  )
}

// ─── 单调队列 ─────────────────────────────────────────────────
function MonotonicQueueViz({ current }) {
  if (!current) return null
  const items = current.items || []
  const queue = current.state || []
  const isExpire = current.phase === 'expire'
  const isPopBack = current.phase === 'popback'
  return (
    <div style={{ minWidth: 720 }}>
      <Header eyebrow="MONOTONIC DEQUE" title={current.title} phase={current.phase} />

      <RowLabel>输入流 input</RowLabel>
      <div style={{ display: 'flex', gap: 8, marginBottom: 28, flexWrap: 'wrap' }}>
        {items.map((v, i) => (
          <Cell key={`in-${i}`} value={v} kind="input" />
        ))}
      </div>

      <RowLabel>
        <span>front ←</span>
        <span style={{ marginLeft: 'auto' }}>→ back</span>
      </RowLabel>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '14px 16px', borderRadius: 10,
        background: 'var(--surface-2)', border: '1px solid var(--border)',
        marginBottom: 18, minHeight: 78,
      }}>
        {queue.length === 0 && <span style={{ color: 'var(--text-tertiary)', fontWeight: 700 }}>（空）</span>}
        {queue.map((v, i) => {
          let kind = 'queue'
          if (i === 0 && isExpire) kind = 'danger'
          else if (i === queue.length - 1 && (isPopBack || current.phase === 'push')) kind = 'active'
          return <Cell key={`q-${i}`} value={v} kind={kind} />
        })}
      </div>

      <ActionPanel description={current.description} note={current.note} />
    </div>
  )
}

// ─── 堆操作：二叉堆 SVG + 数组视图 ──────────────────────────────
function HeapopsViz({ current, steps, stepIndex }) {
  if (!current) return null
  const heap = current.state || []
  const prev = steps[stepIndex - 1]?.state || []
  // 找出本步变化的下标（值不同的位置）
  const changedIdx = new Set()
  const maxLen = Math.max(heap.length, prev.length)
  for (let i = 0; i < maxLen; i++) {
    if (heap[i] !== prev[i]) changedIdx.add(i)
  }

  // 计算树节点坐标（完全二叉树）
  const depth = Math.ceil(Math.log2(heap.length + 1))
  const levelGap = 70
  const NODE_R = 22
  const W = 720
  const positions = heap.map((_, i) => {
    const level = Math.floor(Math.log2(i + 1))
    const offsetInLevel = i - (Math.pow(2, level) - 1)
    const count = Math.pow(2, level)
    const x = ((offsetInLevel + 0.5) / count) * W
    const y = 50 + level * levelGap
    return { x, y, level }
  })
  const H = 50 + depth * levelGap + 20

  return (
    <div style={{ minWidth: 720 }}>
      <Header eyebrow="BINARY HEAP" title={current.title} phase={current.phase} />

      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ marginBottom: 18 }}>
        {/* 父子连线 */}
        {heap.map((_, i) => {
          if (i === 0) return null
          const parent = Math.floor((i - 1) / 2)
          const a = positions[parent]
          const b = positions[i]
          const involved = changedIdx.has(i) || changedIdx.has(parent)
          return (
            <line key={`e-${i}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y}
              stroke={involved ? '#3b82f6' : 'var(--border)'}
              strokeWidth={involved ? 2.5 : 1.5}
              strokeDasharray={involved ? '0' : '4 4'} />
          )
        })}
        {/* 节点 */}
        {heap.map((v, i) => {
          const p = positions[i]
          const changed = changedIdx.has(i)
          const fill = changed ? '#f59e0b' : '#a855f7'
          return (
            <g key={`n-${i}`} style={{ transition: 'transform 0.2s' }}>
              <circle cx={p.x} cy={p.y} r={NODE_R}
                fill={`${fill}22`} stroke={fill} strokeWidth={changed ? 3 : 2} />
              <text x={p.x} y={p.y + 5} textAnchor="middle"
                fontFamily="var(--font-mono)" fontWeight="900" fontSize="14"
                fill={fill}>{v}</text>
              <text x={p.x - NODE_R - 4} y={p.y - NODE_R + 2} textAnchor="end"
                fontSize="9" fontWeight="700" fill="var(--text-tertiary)" fontFamily="var(--font-mono)">[{i}]</text>
            </g>
          )
        })}
      </svg>

      <RowLabel>数组表示 arr</RowLabel>
      <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
        {heap.map((v, i) => (
          <Cell key={`a-${i}`} value={v} kind={changedIdx.has(i) ? 'active' : 'stack'} size={38} />
        ))}
      </div>

      <ActionPanel description={current.description} note={current.note} />
    </div>
  )
}

// ─── 前缀和 / 差分 ────────────────────────────────────────────
function PrefixDiffViz({ current }) {
  if (!current) return null
  const items = current.items || []
  // 计算前缀和
  const prefix = [0]
  for (const v of items) prefix.push(prefix[prefix.length - 1] + v)
  // 计算差分
  const diff = items.map((v, i) => i === 0 ? v : v - items[i - 1])

  const phase = current.phase

  return (
    <div style={{ minWidth: 720 }}>
      <Header eyebrow="PREFIX SUM / DIFFERENCE" title={current.title} phase={phase} />

      <RowLabel>原数组 a[i]</RowLabel>
      <IndexedRow values={items} kind="input" highlight={phase === 'restore' ? items.map((_, i) => i) : []} />

      <RowLabel style={{ marginTop: 22 }}>
        前缀和 pre[i] = pre[i-1] + a[i]
        {phase === 'query' && <span style={{ marginLeft: 12, color: '#f59e0b' }}>· 查询 [2,4] = pre[4] − pre[1]</span>}
      </RowLabel>
      <IndexedRow
        values={prefix}
        kind={phase === 'prefix' || phase === 'query' ? 'stack' : 'muted'}
        highlight={phase === 'query' ? [1, 4] : phase === 'prefix' ? prefix.map((_, i) => i) : []}
        startIndex={0}
      />

      <RowLabel style={{ marginTop: 22 }}>
        差分 diff[i] = a[i] − a[i-1]
        {phase === 'diff' && <span style={{ marginLeft: 12, color: '#22c55e' }}>· 区间加：diff[l] += v, diff[r+1] −= v</span>}
      </RowLabel>
      <IndexedRow
        values={diff}
        kind={phase === 'diff' || phase === 'restore' ? 'success' : 'muted'}
        highlight={[]}
      />

      <div style={{ marginTop: 18 }}>
        <ActionPanel description={current.description} note={current.note} />
      </div>
    </div>
  )
}

function IndexedRow({ values, kind = 'default', highlight = [], startIndex = 0 }) {
  const hl = new Set(highlight)
  return (
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
      {values.map((v, i) => (
        <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
          <Cell value={v} kind={hl.has(i) ? 'active' : kind} size={42} />
          <span style={{ fontSize: 10, color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{i + startIndex}</span>
        </div>
      ))}
    </div>
  )
}

// ─── 共用：操作说明面板 ───────────────────────────────────────
function ActionPanel({ description, note }) {
  return (
    <div style={{
      padding: 14, borderRadius: 8,
      background: 'var(--surface)', border: '1px solid var(--border)',
    }}>
      <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 8, fontWeight: 800, letterSpacing: '0.06em' }}>当前操作</div>
      <div style={{ color: 'var(--text-primary)', fontWeight: 700, lineHeight: 1.7, fontSize: 14 }}>{description}</div>
      {note && (
        <div style={{
          marginTop: 10, padding: '6px 10px', borderRadius: 6,
          background: '#22c55e14', border: '1px solid #22c55e44',
          color: '#22c55e', fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 800,
          display: 'inline-block',
        }}>{note}</div>
      )}
    </div>
  )
}

function RowLabel({ children, style }) {
  return (
    <div style={{
      fontSize: 11, color: 'var(--text-tertiary)', fontWeight: 800, letterSpacing: '0.08em',
      marginBottom: 8, display: 'flex', alignItems: 'center', textTransform: 'uppercase',
      ...style,
    }}>{children}</div>
  )
}

// ─── DAG 最短路 ───────────────────────────────────────────────
// items=['S','A','B','C','T'] 拓扑顺序；硬编码一份 4-边 DAG：
//   S→A(2), S→B(5), A→C(2), B→C(1), C→T(2)
// dist 演化按 stepIndex 推：
//   0 topo  → 全 ?
//   1 init  → S=0, 其余 ∞
//   2 relax → 松弛 S 的出边：A=2, B=5
//   3 relax → 松弛 A/B/C：C=4, T=6（路径 S→A→C→T=6 或 S→B→C→T=8 取 min）
const DAG_NODES = ['S', 'A', 'B', 'C', 'T']
const DAG_EDGES = [
  { from: 'S', to: 'A', w: 2 },
  { from: 'S', to: 'B', w: 5 },
  { from: 'A', to: 'C', w: 2 },
  { from: 'B', to: 'C', w: 1 },
  { from: 'C', to: 'T', w: 2 },
]
const DAG_DIST = [
  { S: '?', A: '?', B: '?', C: '?', T: '?' },                 // topo
  { S: '0', A: '∞', B: '∞', C: '∞', T: '∞' },                 // init
  { S: '0', A: '2', B: '5', C: '∞', T: '∞' },                 // relax S
  { S: '0', A: '2', B: '5', C: '4', T: '6' },                 // relax all
]
const DAG_HOT_EDGES = [
  [],                                       // topo
  [],                                       // init
  ['S->A', 'S->B'],                         // relax S
  ['A->C', 'B->C', 'C->T'],                 // relax all
]

function DagShortestViz({ current, stepIndex }) {
  if (!current) return null
  const dist = DAG_DIST[stepIndex] || DAG_DIST[DAG_DIST.length - 1]
  const hot = new Set(DAG_HOT_EDGES[stepIndex] || [])

  const W = 720, H = 200
  const xs = { S: 70, A: 230, B: 230, C: 430, T: 620 }
  const ys = { S: 100, A: 50, B: 150, C: 100, T: 100 }
  const NODE_R = 22

  const isFinal = v => v !== '?' && v !== '∞'

  return (
    <div style={{ minWidth: 720 }}>
      <Header eyebrow="DAG SHORTEST PATH" title={current.title} phase={current.phase} />

      <RowLabel>DAG（按拓扑顺序）</RowLabel>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ marginBottom: 18 }}>
        <defs>
          <marker id="dag-arrow" markerWidth="10" markerHeight="10" refX="9" refY="5" orient="auto">
            <path d="M1,1 L9,5 L1,9 Z" fill="#94a3b8" />
          </marker>
          <marker id="dag-arrow-hot" markerWidth="10" markerHeight="10" refX="9" refY="5" orient="auto">
            <path d="M1,1 L9,5 L1,9 Z" fill="#f59e0b" />
          </marker>
        </defs>
        {/* 边 */}
        {DAG_EDGES.map(({ from, to, w }) => {
          const key = `${from}->${to}`
          const isHot = hot.has(key)
          const x1 = xs[from], y1 = ys[from], x2 = xs[to], y2 = ys[to]
          // 留出节点半径
          const dx = x2 - x1, dy = y2 - y1, len = Math.sqrt(dx*dx + dy*dy)
          const ux = dx / len, uy = dy / len
          const sx = x1 + ux * NODE_R, sy = y1 + uy * NODE_R
          const ex = x2 - ux * (NODE_R + 6), ey = y2 - uy * (NODE_R + 6)
          const mx = (x1 + x2) / 2, my = (y1 + y2) / 2
          return (
            <g key={key}>
              <line x1={sx} y1={sy} x2={ex} y2={ey}
                stroke={isHot ? '#f59e0b' : '#94a3b8'}
                strokeWidth={isHot ? 3 : 1.6}
                markerEnd={`url(#${isHot ? 'dag-arrow-hot' : 'dag-arrow'})`} />
              <rect x={mx - 13} y={my - 11} width="26" height="18" rx="6"
                fill="var(--surface)" stroke={isHot ? '#f59e0b' : 'var(--border)'} />
              <text x={mx} y={my + 4} textAnchor="middle"
                fontSize="11" fontWeight="800" fontFamily="var(--font-mono)"
                fill={isHot ? '#f59e0b' : 'var(--text-secondary)'}>{w}</text>
            </g>
          )
        })}
        {/* 节点 */}
        {DAG_NODES.map(n => {
          const done = isFinal(dist[n])
          const color = done ? '#22c55e' : '#3b82f6'
          return (
            <g key={n}>
              <circle cx={xs[n]} cy={ys[n]} r={NODE_R}
                fill={`${color}22`} stroke={color} strokeWidth="2.4" />
              <text x={xs[n]} y={ys[n] + 5} textAnchor="middle"
                fontSize="14" fontWeight="900" fill={color}
                fontFamily="var(--font-mono)">{n}</text>
            </g>
          )
        })}
      </svg>

      <RowLabel>dist[]</RowLabel>
      <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
        {DAG_NODES.map(n => (
          <div key={n} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <Cell value={dist[n]} kind={isFinal(dist[n]) ? 'success' : (dist[n] === '∞' ? 'muted' : 'default')} size={42} />
            <span style={{ fontSize: 10.5, color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)', fontWeight: 800 }}>{n}</span>
          </div>
        ))}
      </div>

      <ActionPanel description={current.description} note={current.note} />
    </div>
  )
}

// ─── 二分答案 ─────────────────────────────────────────────────
// items=[1,2,4,8,16,32] 候选；按 step 演化 low/high/mid：
//   0 range → low=1, high=32, mid=null
//   1 mid   → low=1, high=32, mid=16, ok=true → 下一步 high=16
//   2 mid   → low=1, high=16, mid=8,  ok=false → 下一步 low=9
//   3 done  → answer=12
const BINARY_STATES = [
  { low: 1, high: 32, mid: null,  feasibleFrom: null },
  { low: 1, high: 32, mid: 16,    feasibleFrom: 16, ok: true },
  { low: 1, high: 16, mid: 8,     feasibleFrom: 16, ok: false },
  { low: 12, high: 12, mid: null, feasibleFrom: 12, answer: 12 },
]

function BinaryAnswerViz({ current, stepIndex }) {
  if (!current) return null
  const st = BINARY_STATES[stepIndex] || BINARY_STATES[BINARY_STATES.length - 1]
  const items = current.items || []

  const W = 720, H = 110
  const padL = 40, padR = 40
  const usable = W - padL - padR
  const min = items[0], max = items[items.length - 1]
  const xOf = v => padL + ((v - min) / (max - min)) * usable

  // 可行/不可行分界
  const lowX = xOf(st.low), highX = xOf(st.high)
  const cutoff = st.feasibleFrom != null ? xOf(st.feasibleFrom) : null

  return (
    <div style={{ minWidth: 720 }}>
      <Header eyebrow="BINARY SEARCH ON ANSWER" title={current.title} phase={current.phase} />

      <RowLabel>候选答案空间</RowLabel>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ marginBottom: 18 }}>
        {/* 不可行区（红色背景） */}
        {cutoff != null && (
          <rect x={padL} y="38" width={cutoff - padL} height="22" fill="#ef444422" stroke="#ef444466" />
        )}
        {/* 可行区（绿色背景） */}
        {cutoff != null && (
          <rect x={cutoff} y="38" width={W - padR - cutoff} height="22" fill="#22c55e22" stroke="#22c55e66" />
        )}
        {/* 主轴 */}
        <line x1={padL} y1="49" x2={W - padR} y2="49" stroke="var(--border)" strokeWidth="1.5" />
        {/* tick marks 与刻度值 */}
        {items.map(v => (
          <g key={v}>
            <line x1={xOf(v)} y1="44" x2={xOf(v)} y2="54" stroke="var(--text-tertiary)" strokeWidth="1.5" />
            <text x={xOf(v)} y="74" textAnchor="middle" fontSize="11" fontWeight="800"
              fontFamily="var(--font-mono)" fill="var(--text-secondary)">{v}</text>
          </g>
        ))}
        {/* low / high 指示 */}
        <g>
          <polygon points={`${lowX - 6},22 ${lowX + 6},22 ${lowX},34`} fill="#3b82f6" />
          <text x={lowX} y="16" textAnchor="middle" fontSize="10" fontWeight="900"
            fontFamily="var(--font-mono)" fill="#3b82f6">low={st.low}</text>
        </g>
        <g>
          <polygon points={`${highX - 6},22 ${highX + 6},22 ${highX},34`} fill="#3b82f6" />
          <text x={highX} y="16" textAnchor="middle" fontSize="10" fontWeight="900"
            fontFamily="var(--font-mono)" fill="#3b82f6">high={st.high}</text>
        </g>
        {/* mid 标记 */}
        {st.mid != null && (
          <g>
            <circle cx={xOf(st.mid)} cy="49" r="9" fill="#f59e0b" stroke="#fff" strokeWidth="2" />
            <text x={xOf(st.mid)} y="98" textAnchor="middle" fontSize="11" fontWeight="900"
              fontFamily="var(--font-mono)" fill="#f59e0b">mid={st.mid}{st.ok != null ? (st.ok ? ' ✓' : ' ✗') : ''}</text>
          </g>
        )}
        {/* answer 标记 */}
        {st.answer != null && (
          <g>
            <circle cx={xOf(st.answer)} cy="49" r="11" fill="#22c55e" stroke="#fff" strokeWidth="2" />
            <text x={xOf(st.answer)} y="98" textAnchor="middle" fontSize="11" fontWeight="900"
              fontFamily="var(--font-mono)" fill="#22c55e">answer={st.answer}</text>
          </g>
        )}
      </svg>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 14 }}>
        <KvCard label="low"  value={st.low}  color="#3b82f6" />
        <KvCard label="high" value={st.high} color="#3b82f6" />
        <KvCard label={st.answer != null ? 'answer' : 'mid'} value={st.answer ?? (st.mid ?? '—')} color={st.answer != null ? '#22c55e' : '#f59e0b'} />
      </div>

      <ActionPanel description={current.description} note={current.note} />
    </div>
  )
}

function KvCard({ label, value, color }) {
  return (
    <div style={{
      padding: '10px 12px', borderRadius: 8,
      background: `${color}14`, border: `1px solid ${color}55`,
    }}>
      <div style={{ fontSize: 10.5, color: 'var(--text-tertiary)', fontWeight: 800, letterSpacing: '0.06em', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 900, color, fontFamily: 'var(--font-mono)' }}>{value}</div>
    </div>
  )
}

// ─── B / B+ 树 ────────────────────────────────────────────────
// items=['10','20','30','40','50']；按 step 渲染不同形态：
//   0 node  → 单节点 [10,20,30]（满了，准备分裂）
//   1 split → 父 [20] + 子 [10] [30,40]（插 40 触发分裂，中间键上提）
//   2 bplus → 同上 + 叶子链条（B+ 特征）
//   3 range → 同上 + 高亮叶子扫描路径 20→30→40

function BTreeViz({ current, stepIndex }) {
  if (!current) return null
  const phase = current.phase
  const W = 720, H = 240
  const NODE_H = 36
  const KEY_W = 36

  // 节点描述：{ x, y, keys[], id, kind('root'|'leaf') }
  let nodes, edges, leafChain
  if (phase === 'node' || stepIndex === 0) {
    // 单节点
    nodes = [{ id: 'n0', x: 360, y: 140, keys: ['10', '20', '30'], kind: 'leaf', highlighted: true }]
    edges = []
    leafChain = []
  } else {
    // 分裂后：父[20]，子[10] / [30,40]
    nodes = [
      { id: 'p',  x: 360, y: 60,  keys: ['20'],         kind: 'root', highlighted: phase === 'split' },
      { id: 'c1', x: 180, y: 170, keys: ['10'],         kind: 'leaf', highlighted: phase === 'split' || (phase === 'range') },
      { id: 'c2', x: 540, y: 170, keys: ['30', '40'],   kind: 'leaf', highlighted: phase === 'split' || (phase === 'range') },
    ]
    edges = [
      { from: 'p', to: 'c1', label: '<20' },
      { from: 'p', to: 'c2', label: '≥20' },
    ]
    leafChain = (phase === 'bplus' || phase === 'range') ? ['c1', 'c2'] : []
  }

  const xOf = id => nodes.find(n => n.id === id).x
  const yOf = id => nodes.find(n => n.id === id).y
  const widthOf = id => {
    const n = nodes.find(x => x.id === id)
    return Math.max(KEY_W, n.keys.length * KEY_W)
  }

  return (
    <div style={{ minWidth: 720 }}>
      <Header eyebrow="B / B+ TREE" title={current.title} phase={phase} />

      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ marginBottom: 18 }}>
        {/* 边 */}
        {edges.map(({ from, to, label }) => {
          const x1 = xOf(from), y1 = yOf(from) + NODE_H / 2
          const x2 = xOf(to),   y2 = yOf(to) - NODE_H / 2
          const mx = (x1 + x2) / 2, my = (y1 + y2) / 2
          return (
            <g key={`e-${from}-${to}`}>
              <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--border)" strokeWidth="1.6" />
              <text x={mx} y={my + 4} textAnchor="middle"
                fontSize="10" fontWeight="800" fontFamily="var(--font-mono)" fill="var(--text-tertiary)">{label}</text>
            </g>
          )
        })}

        {/* 叶子链（B+ 特征：dashed 蛇形连接） */}
        {leafChain.length >= 2 && (() => {
          const a = nodes.find(n => n.id === leafChain[0])
          const b = nodes.find(n => n.id === leafChain[1])
          const ax = a.x + widthOf(a.id) / 2 + 4
          const bx = b.x - widthOf(b.id) / 2 - 4
          const y = a.y + NODE_H / 2 + 18
          const isRange = phase === 'range'
          return (
            <g>
              <path d={`M ${ax} ${a.y} Q ${ax + 14} ${y} ${(ax + bx) / 2} ${y} Q ${bx - 14} ${y} ${bx} ${b.y}`}
                fill="none" stroke={isRange ? '#22c55e' : '#22c55e88'}
                strokeWidth={isRange ? 3 : 2.2}
                strokeDasharray={isRange ? '0' : '6 4'}
                markerEnd="url(#btree-arrow)" />
              <text x={(ax + bx) / 2} y={y + 16} textAnchor="middle"
                fontSize="10.5" fontWeight="800" fontFamily="var(--font-mono)" fill="#22c55e">
                {isRange ? 'range scan: 20 → 30 → 40' : 'B+ leaf chain'}
              </text>
            </g>
          )
        })()}

        <defs>
          <marker id="btree-arrow" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto">
            <path d="M1,1 L9,5 L1,9 Z" fill="#22c55e" />
          </marker>
        </defs>

        {/* 节点（多关键字盒子） */}
        {nodes.map(n => {
          const w = widthOf(n.id)
          const x0 = n.x - w / 2
          const y0 = n.y - NODE_H / 2
          const color = n.highlighted
            ? '#f59e0b'
            : n.kind === 'leaf' ? '#22c55e' : '#a855f7'
          const isRangeHit = phase === 'range' && n.kind === 'leaf'
          return (
            <g key={n.id}>
              <rect x={x0} y={y0} width={w} height={NODE_H} rx="6"
                fill={`${color}1c`} stroke={color}
                strokeWidth={n.highlighted ? 2.6 : 2} />
              {n.keys.map((k, i) => {
                const cx = x0 + (i + 0.5) * (w / n.keys.length)
                // 分隔线
                const dividerX = x0 + (i + 1) * (w / n.keys.length)
                const isRangeKey = isRangeHit && ['20', '30', '40'].includes(k)
                return (
                  <g key={i}>
                    <text x={cx} y={n.y + 5} textAnchor="middle"
                      fontSize="14" fontWeight="900" fontFamily="var(--font-mono)"
                      fill={isRangeKey ? '#22c55e' : color}>{k}</text>
                    {i < n.keys.length - 1 && (
                      <line x1={dividerX} y1={y0 + 4} x2={dividerX} y2={y0 + NODE_H - 4}
                        stroke={color} strokeOpacity="0.4" strokeWidth="1" />
                    )}
                  </g>
                )
              })}
            </g>
          )
        })}
      </svg>

      <ActionPanel description={current.description} note={current.note} />
    </div>
  )
}

// ─── 旧版回退（理论上不再触达，留作防御） ──────────────────────
function FallbackViz({ current }) {
  if (!current) return null
  return (
    <div style={{ minWidth: 720 }}>
      <Header eyebrow="ADVANCED DATA STRUCTURE" title={current.title} phase={current.phase} />
      <div style={{ marginBottom: 18 }}>
        <RowLabel>输入 / 关键集合</RowLabel>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {(current.items || []).map((item, i) => (
            <Cell key={i} value={item} kind="input" />
          ))}
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <div style={{ padding: 16, borderRadius: 8, background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
          <RowLabel>结构状态</RowLabel>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            {(current.state || []).map((item, i) => (
              <Cell key={i} value={item} kind="stack" />
            ))}
          </div>
        </div>
        <ActionPanel description={current.description} note={current.note} />
      </div>
    </div>
  )
}
