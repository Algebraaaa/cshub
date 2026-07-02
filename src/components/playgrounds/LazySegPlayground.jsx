import PlaygroundShell from './PlaygroundShell'
import VizCard from './VizCard'

const LEGEND = [
  { color: '#3b82f6', label: '建树节点' },
  { color: '#ec4899', label: '下推 lazy' },
  { color: '#10b981', label: '区间加法' },
  { color: '#8b5cf6', label: '区间查询' },
]

const ACTION_COLOR = {
  init: 'var(--text-secondary)',
  build: '#3b82f6',
  'build-done': '#3b82f6',
  pushdown: '#ec4899',
  rangeAdd: '#10b981',
  'rangeAdd-start': '#10b981',
  'rangeAdd-done': '#10b981',
  query: '#8b5cf6',
  'query-start': '#8b5cf6',
  'query-done': '#8b5cf6',
}

export default function LazySegPlayground({ algoFn }) {
  return (
    <PlaygroundShell
      computeSteps={() => algoFn()}
      renderViz={({ current }) => (
        <VizCard borderRadius={10} padding="24px 20px" minHeight={340} noInner>
          <LazySegViz step={current} />
        </VizCard>
      )}
      legend={LEGEND}
    />
  )
}

function LazySegViz({ step }) {
  if (!step) return null
  const { arr, tree, lazy, n, highlighted, queryRange, action, result } = step
  const hiSet = new Set(highlighted)
  const color = ACTION_COLOR[action] || 'var(--text-secondary)'

  // Only show tree nodes that have been touched (non-zero or highlighted)
  const maxIdx = Math.min(4 * n, 30)
  const treeCells = []
  for (let i = 1; i < maxIdx; i++) {
    if (tree[i] !== 0 || lazy[i] !== 0 || hiSet.has(i)) {
      treeCells.push(i)
    }
  }

  return (
    <div>
      {/* Status bar */}
      <div style={{
        display: 'flex', gap: 14, marginBottom: 16, flexWrap: 'wrap',
        justifyContent: 'center', padding: '8px 14px', borderRadius: 8,
        background: 'var(--surface-2)', border: '1px solid var(--border)',
        fontFamily: 'var(--font-mono)', fontSize: 12,
      }}>
        <Pill label="操作" value={actionLabel(action)} color={color} />
        {result !== null && <Pill label="结果" value={result} color="#22c55e" />}
        {queryRange && <Pill label="区间" value={`[${queryRange[0]},${queryRange[1]}]`} color="#a855f7" />}
      </div>

      {/* Original array */}
      <div style={{ marginBottom: 16 }}>
        <SectionLabel>原始数组 a[0..{n - 1}]</SectionLabel>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {arr.map((v, i) => {
            const inRange = queryRange && i >= queryRange[0] && i <= queryRange[1]
            return (
              <Cell key={i} idx={i} value={v}
                color={inRange ? '#8b5cf6' : '#3b82f6'}
                highlighted={!!inRange} />
            )
          })}
        </div>
      </div>

      {/* Tree array */}
      <div style={{ marginBottom: 16 }}>
        <SectionLabel>线段树 tree[1..{maxIdx - 1}]</SectionLabel>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {treeCells.map(i => (
            <Cell key={i} idx={i} value={tree[i]}
              color={hiSet.has(i) ? color : '#10b981'}
              highlighted={hiSet.has(i)} />
          ))}
        </div>
      </div>

      {/* Lazy array */}
      <div>
        <SectionLabel>懒标记 lazy[1..{maxIdx - 1}]</SectionLabel>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {treeCells.map(i => (
            <Cell key={i} idx={i} value={lazy[i]}
              color={hiSet.has(i) && action === 'pushdown' ? '#ec4899' : '#f59e0b'}
              highlighted={hiSet.has(i) && lazy[i] !== 0} />
          ))}
        </div>
      </div>
    </div>
  )
}

function Cell({ idx, value, color, highlighted }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ fontSize: 9, color: 'var(--text-tertiary)', marginBottom: 2 }}>{idx}</div>
      <div style={{
        width: 40, height: 36,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: highlighted ? `${color}30` : `${color}10`,
        border: `${highlighted ? 2 : 1}px solid ${highlighted ? color : `${color}44`}`,
        borderRadius: 6,
        fontSize: 12, fontWeight: 700, fontFamily: 'var(--font-mono)',
        color: highlighted ? color : 'var(--text-primary)',
        boxShadow: highlighted ? `0 0 8px ${color}44` : 'none',
        transition: 'all 0.2s',
      }}>
        {value}
      </div>
    </div>
  )
}

function SectionLabel({ children }) {
  return (
    <div style={{
      fontSize: 11, color: 'var(--text-tertiary)',
      letterSpacing: 1, marginBottom: 6, textTransform: 'uppercase',
    }}>
      {children}
    </div>
  )
}

function Pill({ label, value, color }) {
  return (
    <span style={{ display: 'inline-flex', gap: 6, alignItems: 'baseline' }}>
      <span style={{ fontSize: 10, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</span>
      <strong style={{ color, fontWeight: 700, fontSize: 13 }}>{value}</strong>
    </span>
  )
}

function actionLabel(a) {
  return ({
    init: '初始化', build: '建树', 'build-done': '建树完成',
    pushdown: '下推 lazy',
    rangeAdd: '区间加法', 'rangeAdd-start': '开始区间加法', 'rangeAdd-done': '区间加法完成',
    query: '区间查询', 'query-start': '开始查询', 'query-done': '查询完成',
  })[a] || a
}
