import PlaygroundShell from './PlaygroundShell'

const LEGEND = [
  { color: '#3b82f6', label: '原数组 a[i]' },
  { color: '#10b981', label: 'Fenwick 树 tree[i]' },
  { color: '#f59e0b', label: '当前正在访问的节点' },
  { color: '#a855f7', label: '查询累加路径' },
  { color: '#ec4899', label: '更新传播路径' },
]

export default function FenwickPlayground({ algoFn }) {
  return (
    <PlaygroundShell
      computeSteps={() => algoFn()}
      renderViz={({ current }) => (
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 10,
          marginBottom: 16,
          padding: '24px 20px',
          overflowX: 'auto',
          minHeight: 340,
        }}>
          <FenwickViz step={current} />
        </div>
      )}
      legend={LEGEND}
    />
  )
}

function FenwickViz({ step }) {
  if (!step) return null
  const { arr, tree, op, target, current, sum } = step
  const n = arr.length

  const isQuery = op === 'query' || op === 'rangeQuery'
  const isUpdate = op === 'update' || op === 'build'
  const accentColor = isQuery ? '#a855f7' : isUpdate ? '#ec4899' : '#f59e0b'

  return (
    <div>
      <div style={{
        display: 'flex', gap: 14, marginBottom: 22, flexWrap: 'wrap', justifyContent: 'center',
        padding: '10px 16px', borderRadius: 10,
        background: 'var(--surface-2)', border: '1px solid var(--border)',
        fontFamily: 'var(--font-mono)', fontSize: 13,
      }}>
        <Pill label="op" value={opLabel(op)} color={accentColor} />
        <Pill label="i" value={(current !== undefined && current >= 0) ? current : '—'} color="#f59e0b" />
        <Pill label="sum" value={sum !== undefined ? sum : '—'} color="#22c55e" />
      </div>

      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 11, color: 'var(--text-tertiary)', letterSpacing: 1, marginBottom: 8 }}>
          原数组 a[1..{n}]
        </div>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {arr.map((v, i) => (
            <Cell key={i} idx={i + 1} value={v} color="#3b82f6" highlighted={target === i + 1 && (op === 'update' || op === 'build')} />
          ))}
        </div>
      </div>

      <div>
        <div style={{ fontSize: 11, color: 'var(--text-tertiary)', letterSpacing: 1, marginBottom: 8 }}>
          Fenwick 树 tree[1..{n}]（管辖 lowbit(i) 个元素）
        </div>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {tree.slice(1).map((v, i) => {
            const idx = i + 1
            const isCurrent = idx === current
            const lb = lowbit_static(idx)
            return (
              <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Cell idx={idx} value={v} color={isCurrent ? accentColor : '#10b981'} highlighted={isCurrent} />
                <div style={{ fontSize: 9, color: 'var(--text-tertiary)', marginTop: 2 }}>lb={lb}</div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function lowbit_static(x) { return x & (-x) }

function Cell({ idx, value, color, highlighted }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ fontSize: 10, color: 'var(--text-tertiary)', marginBottom: 3 }}>{idx}</div>
      <div style={{
        width: 42, height: 42,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: highlighted ? `${color}30` : `${color}12`,
        border: `${highlighted ? 2 : 1}px solid ${highlighted ? color : `${color}55`}`,
        borderRadius: 8,
        fontSize: 14, fontWeight: 700,
        color: highlighted ? color : 'var(--text-primary)',
        boxShadow: highlighted ? `0 0 10px ${color}55` : 'none',
        transition: 'all 0.2s',
      }}>
        {value}
      </div>
    </div>
  )
}

function Pill({ label, value, color }) {
  return (
    <span style={{ display: 'inline-flex', gap: 6, alignItems: 'baseline' }}>
      <span style={{ fontSize: 11, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</span>
      <strong style={{ color, fontWeight: 700, fontSize: 14 }}>{value}</strong>
    </span>
  )
}

function opLabel(op) {
  return ({
    init: '初始化',
    build: '构建',
    query: '前缀查询',
    update: '单点更新',
    rangeQuery: '区间查询',
  })[op] || op
}
