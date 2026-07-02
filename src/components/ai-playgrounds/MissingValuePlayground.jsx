import { useMemo, useCallback } from 'react'
import PlaygroundShell from '../playgrounds/PlaygroundShell'
import VizCard from '../playgrounds/VizCard'

// ── 固定数据集 ──
const COLUMNS = ['年龄', '收入(万)', '评分']
const RAW = [
  [25, 6, 78],
  [30, null, 85],
  [null, 8, 92],
  [22, 4, null],
  [35, 12, 88],
  [28, null, 76],
  [null, 7, 95],
  [40, 15, 90],
]

function colValues(data, c) {
  return data.map(r => r[c]).filter(v => v !== null)
}
function mean(arr) { return arr.reduce((a, b) => a + b, 0) / arr.length }
function median(arr) {
  const s = [...arr].sort((a, b) => a - b)
  const m = Math.floor(s.length / 2)
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2
}

function computeSteps({ method }) {
  const steps = []
  const data = RAW.map(r => [...r])
  const missingIdx = []
  data.forEach((row, ri) => row.forEach((v, ci) => {
    if (v === null) missingIdx.push({ ri, ci })
  }))

  // Step 1: 展示原始数据
  steps.push({
    description: '展示原始数据，红色标记缺失值 (null)',
    data: data.map(r => [...r]),
    highlights: [],
    missingCells: missingIdx.map(m => `${m.ri}-${m.ci}`),
    filledCells: [],
    phase: 'original',
  })

  // Step 2: 识别缺失位置
  steps.push({
    description: `共发现 ${missingIdx.length} 个缺失值，分布在 ${new Set(missingIdx.map(m => m.ci)).size} 列中`,
    data: data.map(r => [...r]),
    highlights: [],
    missingCells: missingIdx.map(m => `${m.ri}-${m.ci}`),
    filledCells: [],
    phase: 'identify',
  })

  if (method === 'drop') {
    // 删除行模式
    steps.push({
      description: '策略：删除包含缺失值的行',
      data: data.map(r => [...r]),
      highlights: missingIdx.map(m => `${m.ri}`),
      missingCells: missingIdx.map(m => `${m.ri}-${m.ci}`),
      filledCells: [],
      phase: 'strategy',
    })
    const keepRows = data.filter(row => row.every(v => v !== null))
    steps.push({
      description: `删除后保留 ${keepRows.length} 行（原 ${data.length} 行）`,
      data: keepRows,
      highlights: [],
      missingCells: [],
      filledCells: [],
      phase: 'result',
      isReduced: true,
    })
    return steps
  }

  // 填充模式
  const stats = {}
  COLUMNS.forEach((_, ci) => {
    const vals = colValues(data, ci)
    if (method === 'mean') {
      stats[ci] = { value: mean(vals), label: `均值 = ${mean(vals).toFixed(1)}` }
    } else {
      stats[ci] = { value: median(vals), label: `中位数 = ${median(vals).toFixed(1)}` }
    }
  })

  // Step 3: 计算统计量
  const statDesc = Object.values(stats).map(s => s.label).join('，')
  steps.push({
    description: `计算各列统计量：${statDesc}`,
    data: data.map(r => [...r]),
    highlights: [],
    missingCells: missingIdx.map(m => `${m.ri}-${m.ci}`),
    filledCells: [],
    phase: 'compute',
    stats,
  })

  // 逐步填充每个缺失值
  const filled = data.map(r => [...r])
  const filledSoFar = []
  missingIdx.forEach(({ ri, ci }, idx) => {
    const val = stats[ci].value
    filled[ri][ci] = Math.round(val * 10) / 10
    filledSoFar.push(`${ri}-${ci}`)
    steps.push({
      description: `填充第 ${idx + 1}/${missingIdx.length} 个缺失值：第${ri + 1}行"${COLUMNS[ci]}"← ${val.toFixed(1)}`,
      data: filled.map(r => [...r]),
      highlights: [`${ri}-${ci}`],
      missingCells: missingIdx.slice(idx + 1).map(m => `${m.ri}-${m.ci}`),
      filledCells: [...filledSoFar],
      phase: 'fill',
    })
  })

  // 结果
  steps.push({
    description: `填充完成！所有缺失值已用${method === 'mean' ? '均值' : '中位数'}替换`,
    data: filled.map(r => [...r]),
    highlights: [],
    missingCells: [],
    filledCells: [...filledSoFar],
    phase: 'result',
  })

  return steps
}

function DataTable({ rows, columns, missingCells, filledCells, highlights }) {
  const cellStyle = (key) => ({
    padding: '6px 14px',
    textAlign: 'center',
    fontSize: 13,
    border: '1px solid var(--border)',
    background: highlights?.includes(key)
      ? 'rgba(16,185,129,0.15)'
      : missingCells?.includes(key)
        ? 'rgba(239,68,68,0.15)'
        : filledCells?.includes(key)
          ? 'rgba(16,185,129,0.08)'
          : 'var(--surface)',
    color: missingCells?.includes(key)
      ? '#ef4444'
      : 'var(--text-primary)',
    fontWeight: highlights?.includes(key) ? 700 : 400,
    transition: 'background 0.3s, color 0.3s',
  })
  const headerStyle = {
    padding: '6px 14px',
    textAlign: 'center',
    fontSize: 13,
    fontWeight: 700,
    border: '1px solid var(--border)',
    background: 'rgba(139,92,246,0.1)',
    color: 'var(--text-primary)',
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center' }}>
      <table style={{ borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr>
            <th style={headerStyle}>#</th>
            {columns.map((c, i) => <th key={i} style={headerStyle}>{c}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri}>
              <td style={{ ...headerStyle, fontWeight: 400, background: 'rgba(139,92,246,0.05)' }}>{ri + 1}</td>
              {row.map((v, ci) => {
                const key = `${ri}-${ci}`
                return (
                  <td key={ci} style={cellStyle(key)}>
                    {v === null ? 'NaN' : typeof v === 'number' ? (Number.isInteger(v) ? v : v.toFixed(1)) : v}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function MissingValuePlayground() {
  const presets = useMemo(() => [
    { id: 'mean', label: '均值填充', state: { method: 'mean' } },
    { id: 'median', label: '中位数填充', state: { method: 'median' } },
    { id: 'drop', label: '删除行', state: { method: 'drop' } },
  ], [])

  const computeStepsFn = useCallback(state => computeSteps(state), [])

  return (
    <PlaygroundShell
      initialState={{ method: 'mean' }}
      presets={presets}
      derivePayload={s => s}
      computeSteps={computeStepsFn}
      legend={[
        { color: '#ef4444', label: '缺失值' },
        { color: '#10b981', label: '已填充' },
      ]}
      renderViz={({ current }) => (
        <VizCard>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            {!current.isReduced && (
              <DataTable
                rows={current.data}
                columns={COLUMNS}
                missingCells={current.missingCells}
                filledCells={current.filledCells}
                highlights={current.highlights}
              />
            )}
            {current.isReduced && (
              <DataTable
                rows={current.data}
                columns={COLUMNS}
                missingCells={[]}
                filledCells={[]}
                highlights={[]}
              />
            )}
            {current.stats && (
              <div style={{ display: 'flex', gap: 12, fontSize: 12, color: 'var(--text-secondary)', flexWrap: 'wrap', justifyContent: 'center' }}>
                {COLUMNS.map((c, i) => (
                  <span key={i} style={{ padding: '2px 8px', background: 'rgba(139,92,246,0.08)', borderRadius: 4 }}>
                    {c}: {current.stats[i]?.label}
                  </span>
                ))}
              </div>
            )}
          </div>
        </VizCard>
      )}
    />
  )
}
