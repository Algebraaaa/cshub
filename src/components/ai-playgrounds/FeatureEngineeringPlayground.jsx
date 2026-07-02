import { useCallback, useMemo, useState } from 'react'
import PlaygroundShell from '../playgrounds/PlaygroundShell'
import VizCard from '../playgrounds/VizCard'

const TAB_LABELS = {
  missing: '缺失值填充',
  normalize: '标准化',
  onehot: 'One-Hot 编码',
  poly: '多项式特征',
}

// ───────────── Tab 1: Missing value fill ─────────────
const MISSING_DATA = [
  { id: 0, name: 'Alice', age: 25 },
  { id: 1, name: 'Bob', age: null },
  { id: 2, name: 'Carol', age: 32 },
  { id: 3, name: 'Dan', age: null },
  { id: 4, name: 'Eve', age: 28 },
  { id: 5, name: 'Frank', age: null },
  { id: 6, name: 'Grace', age: 45 },
  { id: 7, name: 'Heidi', age: 22 },
]

// ───────────── Tab 2: Normalization (two features, different scales) ─────────────
function genNormData() {
  return [
    { age: 25, income: 32000 },
    { age: 30, income: 48000 },
    { age: 45, income: 85000 },
    { age: 28, income: 38000 },
    { age: 52, income: 110000 },
    { age: 35, income: 55000 },
    { age: 41, income: 72000 },
    { age: 22, income: 28000 },
  ]
}

// ───────────── Tab 3: One-hot encoding ─────────────
const CAT_DATA = [
  { id: 0, color: 'red' },
  { id: 1, color: 'blue' },
  { id: 2, color: 'green' },
  { id: 3, color: 'red' },
  { id: 4, color: 'blue' },
  { id: 5, color: 'green' },
  { id: 6, color: 'red' },
]
const CATEGORIES = ['red', 'green', 'blue']

// ───────────── Tab 4: Polynomial features (x → x², x1*x2) ─────────────
const POLY_DATA = [
  { x: 1.0, y: 0.5 },
  { x: 2.0, y: 1.8 },
  { x: 0.5, y: -0.3 },
  { x: 3.0, y: 2.2 },
  { x: -1.0, y: 0.8 },
]

function computeSteps({ tab }) {
  const steps = []

  if (tab === 'missing') {
    const vals = MISSING_DATA.map(d => d.age).filter(v => v !== null)
    const mean = vals.reduce((a, b) => a + b, 0) / vals.length
    const sorted = [...vals].sort((a, b) => a - b)
    const median = sorted.length % 2 ? sorted[(sorted.length - 1) / 2] : (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2

    steps.push({
      description: '原始数据: 3 条记录 age 字段为 null(缺失)',
      line: 1, phase: 'before',
      tab, data: MISSING_DATA, filled: null, stat: null,
    })
    steps.push({
      description: `计算统计量: mean=${mean.toFixed(1)}, median=${median.toFixed(0)}`,
      line: 2, phase: 'stat',
      tab, data: MISSING_DATA, filled: null, stat: { mean, median },
    })
    steps.push({
      description: `用均值填充缺失值: mean=${mean.toFixed(1)}`,
      line: 3, phase: 'mean-fill',
      tab, data: MISSING_DATA, filled: 'mean', fillValue: mean, stat: { mean, median },
    })
    steps.push({
      description: `用中位数填充缺失值: median=${median.toFixed(0)}`,
      line: 4, phase: 'median-fill',
      tab, data: MISSING_DATA, filled: 'median', fillValue: median, stat: { mean, median },
    })
    return steps
  }

  if (tab === 'normalize') {
    const data = genNormData()
    const ageVals = data.map(d => d.age)
    const incVals = data.map(d => d.income)
    const ageMin = Math.min(...ageVals), ageMax = Math.max(...ageVals)
    const incMin = Math.min(...incVals), incMax = Math.max(...incVals)
    const ageMean = ageVals.reduce((a, b) => a + b, 0) / ageVals.length
    const incMean = incVals.reduce((a, b) => a + b, 0) / incVals.length
    const ageStd = Math.sqrt(ageVals.reduce((s, v) => s + (v - ageMean) ** 2, 0) / ageVals.length)
    const incStd = Math.sqrt(incVals.reduce((s, v) => s + (v - incMean) ** 2, 0) / incVals.length)

    const minmaxData = data.map(d => ({
      age: (d.age - ageMin) / (ageMax - ageMin),
      income: (d.income - incMin) / (incMax - incMin),
    }))
    const zscoreData = data.map(d => ({
      age: (d.age - ageMean) / ageStd,
      income: (d.income - incMean) / incStd,
    }))

    steps.push({
      description: '原始数据: age(20-60 量级), income(2.8w-11w 量级),尺度差异巨大',
      line: 1, phase: 'before',
      tab, data, normalized: null, stats: { ageMin, ageMax, ageMean, ageStd, incMin, incMax, incMean, incStd },
    })
    steps.push({
      description: 'Min-Max 标准化: x\' = (x - min) / (max - min),映射到 [0,1]',
      line: 2, phase: 'minmax',
      tab, data: minmaxData, normalized: 'minmax', stats: { ageMin, ageMax, ageMean, ageStd, incMin, incMax, incMean, incStd },
    })
    steps.push({
      description: 'Z-Score 标准化: x\' = (x - μ) / σ,均值 0,标准差 1',
      line: 3, phase: 'zscore',
      tab, data: zscoreData, normalized: 'zscore', stats: { ageMin, ageMax, ageMean, ageStd, incMin, incMax, incMean, incStd },
    })
    return steps
  }

  if (tab === 'onehot') {
    steps.push({
      description: '原始类别特征: color ∈ {red, green, blue}',
      line: 1, phase: 'before', tab, data: CAT_DATA, categories: CATEGORIES,
    })
    const encoded = CAT_DATA.map(row => {
      const onehot = {}
      CATEGORIES.forEach(c => { onehot[c] = row.color === c ? 1 : 0 })
      return { ...row, onehot }
    })
    steps.push({
      description: `One-Hot 编码: 3 个类别 → 3 个二元特征,每行恰有一个 1`,
      line: 2, phase: 'after', tab, data: encoded, categories: CATEGORIES,
    })
    return steps
  }

  if (tab === 'poly') {
    steps.push({
      description: '原始 2 个特征 [x, y] — 线性不可分',
      line: 1, phase: 'before', tab, data: POLY_DATA,
    })
    const augmented = POLY_DATA.map(p => ({
      x: p.x, y: p.y, x2: p.x * p.x, y2: p.y * p.y, xy: p.x * p.y,
    }))
    steps.push({
      description: '添加多项式特征: [x, y, x², y², x·y] — 特征维度从 2 → 5',
      line: 2, phase: 'after', tab, data: augmented,
    })
    return steps
  }

  return steps
}

// ───────────── Render helpers ─────────────

function DataTable({ headers, rows, highlightCol }) {
  return (
    <table style={{ borderCollapse: 'collapse', fontSize: 12, width: '100%' }}>
      <thead>
        <tr>
          {headers.map(h => (
            <th key={h} style={{
              padding: '6px 10px', textAlign: 'center',
              background: 'var(--surface-2)', color: 'var(--text-secondary)',
              borderBottom: '1px solid var(--border)', fontWeight: 600, fontSize: 11,
            }}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, ri) => (
          <tr key={ri}>
            {row.map((cell, ci) => (
              <td key={ci} style={{
                padding: '5px 10px', textAlign: 'center',
                color: highlightCol === ci ? '#f97316' : 'var(--text-primary)',
                fontWeight: highlightCol === ci ? 600 : 400,
                fontFamily: typeof cell === 'number' ? 'monospace' : 'inherit',
                borderBottom: '1px solid var(--border)',
                background: cell === null || cell === 'null' ? 'rgba(239,68,68,0.1)' : 'transparent',
                fontSize: 11,
              }}>
                {cell === null ? <span style={{ color: '#ef4444' }}>NULL</span> : cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function renderMissing(current) {
  const filled = current.filled
  const data = current.data.map(d => {
    let age = d.age
    if (age === null && filled === 'mean') age = current.fillValue.toFixed(1)
    if (age === null && filled === 'median') age = current.fillValue.toFixed(0)
    return [d.name, age === null ? null : age]
  })
  return (
    <div style={{ width: '100%', maxWidth: 400 }}>
      <DataTable headers={['Name', 'Age']} rows={data} highlightCol={filled ? 1 : -1} />
      {current.stat && (
        <div style={{ marginTop: 10, display: 'flex', gap: 14, justifyContent: 'center', fontSize: 12 }}>
          <span style={{ color: 'var(--text-secondary)' }}>mean: <b style={{ color: '#8b5cf6' }}>{current.stat.mean.toFixed(1)}</b></span>
          <span style={{ color: 'var(--text-secondary)' }}>median: <b style={{ color: '#10b981' }}>{current.stat.median.toFixed(0)}</b></span>
        </div>
      )}
    </div>
  )
}

function renderNormalize(current) {
  const rows = current.data.map(d => [
    typeof d.age === 'number' ? d.age.toFixed(current.normalized === 'minmax' ? 3 : 2) : d.age.toFixed(1),
    typeof d.income === 'number' ? d.income.toFixed(current.normalized === 'minmax' ? 3 : current.normalized === 'zscore' ? 2 : 0) : d.income,
  ])
  const labels = current.normalized === 'minmax'
    ? ['age (min-max)', 'income (min-max)']
    : current.normalized === 'zscore'
      ? ['age (z-score)', 'income (z-score)']
      : ['age', 'income']

  // Also show a small scatter plot
  const W = 320, H = 180, PAD = 30
  const xs = current.data.map(d => d.age)
  const ys = current.data.map(d => d.income)
  const xMin = Math.min(...xs), xMax = Math.max(...xs)
  const yMin = Math.min(...ys), yMax = Math.max(...ys)

  return (
    <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center', alignItems: 'flex-start' }}>
      <div style={{ width: '100%', maxWidth: 340 }}>
        <DataTable headers={labels} rows={rows} />
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: W, height: H }}>
        <rect x={PAD} y={PAD} width={W - PAD * 2} height={H - PAD * 2} fill="rgba(139,92,246,0.04)" rx="6" />
        {current.data.map((d, i) => {
          const cx = PAD + (d.age - xMin) / Math.max(1e-6, xMax - xMin) * (W - PAD * 2)
          const cy = H - PAD - (d.income - yMin) / Math.max(1e-6, yMax - yMin) * (H - PAD * 2)
          return <circle key={i} cx={cx} cy={cy} r="5" fill="#8b5cf6" opacity="0.85" />
        })}
        <text x={W / 2} y={H - 6} textAnchor="middle" fontSize="10" fill="var(--text-tertiary)">age</text>
        <text x={10} y={H / 2} textAnchor="middle" fontSize="10" fill="var(--text-tertiary)" transform={`rotate(-90, 10, ${H / 2})`}>income</text>
      </svg>
    </div>
  )
}

function renderOneHot(current) {
  if (current.phase === 'before') {
    return (
      <div style={{ width: '100%', maxWidth: 260 }}>
        <DataTable headers={['id', 'color']} rows={current.data.map(d => [d.id, d.color])} highlightCol={1} />
      </div>
    )
  }
  const rows = current.data.map(d => [
    d.id,
    d.color,
    d.onehot.red, d.onehot.green, d.onehot.blue,
  ])
  const colorForCol = { 2: '#ef4444', 3: '#10b981', 4: '#3b82f6' }
  return (
    <div style={{ width: '100%', maxWidth: 400 }}>
      <table style={{ borderCollapse: 'collapse', fontSize: 12, width: '100%' }}>
        <thead>
          <tr>
            {['id', 'color', 'red', 'green', 'blue'].map((h, ci) => (
              <th key={h} style={{
                padding: '6px 8px', textAlign: 'center',
                background: 'var(--surface-2)', color: colorForCol[ci] || 'var(--text-secondary)',
                borderBottom: '1px solid var(--border)', fontWeight: 600, fontSize: 11,
              }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri}>
              {row.map((cell, ci) => (
                <td key={ci} style={{
                  padding: '5px 8px', textAlign: 'center',
                  color: colorForCol[ci] || 'var(--text-primary)',
                  fontFamily: ci >= 2 ? 'monospace' : 'inherit',
                  fontWeight: ci >= 2 && cell === 1 ? 700 : 400,
                  borderBottom: '1px solid var(--border)', fontSize: 11,
                  background: ci >= 2 && cell === 1 ? colorForCol[ci] + '22' : 'transparent',
                }}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function renderPoly(current) {
  if (current.phase === 'before') {
    return (
      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center', alignItems: 'flex-start' }}>
        <div style={{ width: '100%', maxWidth: 240 }}>
          <DataTable headers={['x', 'y']} rows={current.data.map(d => [d.x.toFixed(1), d.y.toFixed(1)])} />
        </div>
        <div style={{ color: 'var(--text-secondary)', fontSize: 12, padding: '8px 12px' }}>
          维度 = 2
        </div>
      </div>
    )
  }
  return (
    <div style={{ width: '100%', maxWidth: 540 }}>
      <DataTable
        headers={['x', 'y', 'x²', 'y²', 'x·y']}
        rows={current.data.map(d => [
          d.x.toFixed(1), d.y.toFixed(1),
          d.x2.toFixed(2), d.y2.toFixed(2), d.xy.toFixed(2),
        ])}
      />
      <div style={{ marginTop: 10, textAlign: 'center', color: 'var(--text-secondary)', fontSize: 12 }}>
        维度: <b style={{ color: '#8b5cf6' }}>2 → 5</b>
      </div>
    </div>
  )
}

export default function FeatureEngineeringPlayground() {
  const [tab, setTab] = useState('missing')

  const presets = useMemo(() => [
    { id: 'missing', label: '缺失值', state: { tab: 'missing' } },
    { id: 'normalize', label: '标准化', state: { tab: 'normalize' } },
    { id: 'onehot', label: 'One-Hot', state: { tab: 'onehot' } },
    { id: 'poly', label: '多项式', state: { tab: 'poly' } },
  ], [])

  const computeStepsFn = useCallback(state => computeSteps({ tab: state.tab }), [])

  return (
    <PlaygroundShell
      initialState={{ tab: 'missing' }}
      presets={presets}
      derivePayload={s => s}
      computeSteps={computeStepsFn}
      renderViz={({ current, state }) => {
        // Sync tab on preset change
        if (state.tab !== tab) setTimeout(() => setTab(state.tab), 0)
        return (
          <VizCard>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#8b5cf6' }}>
                {TAB_LABELS[current.tab]}
              </div>
              {current.tab === 'missing' && renderMissing(current)}
              {current.tab === 'normalize' && renderNormalize(current)}
              {current.tab === 'onehot' && renderOneHot(current)}
              {current.tab === 'poly' && renderPoly(current)}
            </div>
          </VizCard>
        )
      }}
    />
  )
}
