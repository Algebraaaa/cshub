import { useCallback, useMemo } from 'react'
import PlaygroundShell from '../playgrounds/PlaygroundShell'
import VizCard from '../playgrounds/VizCard'

const W = 520
const H = 320
const PAD = 36
const COLORS = { primary: '#8b5cf6', secondary: '#f472b6', highlight: '#f97316', error: '#ef4444', tertiary: '#38bdf8', success: '#22c55e' }

const PRESETS_DATA = {
  three: {
    rows: [
      { color: 'red', size: 'S' }, { color: 'green', size: 'M' }, { color: 'blue', size: 'L' },
      { color: 'red', size: 'L' }, { color: 'green', size: 'S' }, { color: 'blue', size: 'M' },
    ],
    features: ['color', 'size'],
    categories: { color: ['red', 'green', 'blue'], size: ['S', 'M', 'L'] },
  },
  five: {
    rows: [
      { animal: 'cat', grade: 'A', city: 'NYC' }, { animal: 'dog', grade: 'B', city: 'LA' },
      { animal: 'fish', grade: 'C', city: 'NYC' }, { animal: 'bird', grade: 'A', city: 'SF' },
      { animal: 'cat', grade: 'B', city: 'LA' }, { animal: 'dog', grade: 'A', city: 'SF' },
    ],
    features: ['animal', 'grade', 'city'],
    categories: { animal: ['cat', 'dog', 'fish', 'bird'], grade: ['A', 'B', 'C'], city: ['NYC', 'LA', 'SF'] },
  },
}

function computeSteps({ dataKey, dropFirst }) {
  const { rows, features, categories } = PRESETS_DATA[dataKey]
  const steps = []
  const allCols = []
  features.forEach(f => categories[f].forEach((c, i) => {
    if (dropFirst && i === 0) return
    allCols.push(`${f}=${c}`)
  }))

  steps.push({ description: '原始数据表：展示包含分类特征的表格', phase: 'raw', rows, features, categories, allCols, encodedRows: null, activeCol: -1, activeRow: -1 })

  const catList = features.flatMap(f => categories[f])
  steps.push({ description: `识别所有类别: ${catList.join(', ')}`, phase: 'identify', rows, features, categories, allCols, encodedRows: null, activeCol: -1, activeRow: -1 })

  for (let c = 0; c < allCols.length; c++) {
    steps.push({ description: `创建二进制列: ${allCols[c]}`, phase: 'create-cols', rows, features, categories, allCols, encodedRows: null, activeCol: c, activeRow: -1 })
  }

  const encoded = rows.map(row => {
    const enc = {}
    allCols.forEach(col => {
      const [feat, val] = col.split('=')
      enc[col] = row[feat] === val ? 1 : 0
    })
    return enc
  })

  for (let r = 0; r < rows.length; r++) {
    steps.push({ description: `编码第 ${r + 1} 行: 填充 1 和 0`, phase: 'fill', rows, features, categories, allCols, encodedRows: encoded.slice(0, r + 1), activeCol: -1, activeRow: r })
  }

  steps.push({ description: `编码完成！${features.length} 个特征 → ${allCols.length} 个二进制列`, phase: 'done', rows, features, categories, allCols, encodedRows: encoded, activeCol: -1, activeRow: -1 })

  return steps
}

export default function OneHotPlayground() {
  const presets = useMemo(() => [
    { id: 'three', label: '3 类别', state: { dataKey: 'three', dropFirst: false } },
    { id: 'five', label: '5 类别', state: { dataKey: 'five', dropFirst: false } },
    { id: 'drop-first', label: 'Drop First', state: { dataKey: 'three', dropFirst: true } },
  ], [])

  const computeStepsFn = useCallback(state => computeSteps(state), [])

  return (
    <PlaygroundShell
      initialState={{ dataKey: 'three', dropFirst: false }}
      presets={presets}
      derivePayload={s => s}
      computeSteps={computeStepsFn}
      legend={[
        { color: COLORS.success, label: '1 (激活)' },
        { color: '#374151', label: '0 (未激活)' },
        { color: COLORS.highlight, label: '当前处理' },
      ]}
      renderViz={({ current }) => {
        const cellW = 48
        const cellH = 28
        const tableX = PAD
        const tableY = PAD + 20
        const encX = PAD + current.features.length * cellW + 40

        return (
          <VizCard>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
              <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxWidth: W }}>
                <text x={tableX + 30} y={PAD + 8} fontSize="11" fill="var(--text-secondary)" fontWeight="600">原始表</text>
                {current.features.map((f, i) => (
                  <g key={`h-${i}`}>
                    <rect x={tableX + i * cellW} y={tableY} width={cellW} height={cellH} fill="rgba(139,92,246,0.15)" stroke="var(--border)" />
                    <text x={tableX + i * cellW + cellW / 2} y={tableY + 18} textAnchor="middle" fontSize="10" fill="var(--text-primary)" fontWeight="600">{f}</text>
                  </g>
                ))}
                {current.rows.map((row, r) => (
                  <g key={`r-${r}`}>
                    {current.features.map((f, i) => (
                      <g key={`c-${r}-${i}`}>
                        <rect x={tableX + i * cellW} y={tableY + (r + 1) * cellH} width={cellW} height={cellH} fill={current.activeRow === r ? 'rgba(249,115,22,0.15)' : 'var(--surface)'} stroke="var(--border)" />
                        <text x={tableX + i * cellW + cellW / 2} y={tableY + (r + 1) * cellH + 18} textAnchor="middle" fontSize="9" fill="var(--text-primary)">{row[f]}</text>
                      </g>
                    ))}
                  </g>
                ))}

                {current.phase !== 'raw' && current.phase !== 'identify' && (
                  <g>
                    <text x={encX + 30} y={PAD + 8} fontSize="11" fill="var(--text-secondary)" fontWeight="600">编码矩阵</text>
                    {current.allCols.map((col, c) => (
                      <g key={`eh-${c}`}>
                        <rect x={encX + c * cellW} y={tableY} width={cellW} height={cellH} fill={current.activeCol === c ? 'rgba(249,115,22,0.3)' : 'rgba(56,189,248,0.12)'} stroke="var(--border)" />
                        <text x={encX + c * cellW + cellW / 2} y={tableY + 12} textAnchor="middle" fontSize="7" fill="var(--text-primary)">{col}</text>
                      </g>
                    ))}
                    {current.encodedRows && current.encodedRows.map((enc, r) => (
                      <g key={`er-${r}`}>
                        {current.allCols.map((col, c) => (
                          <g key={`ec-${r}-${c}`}>
                            <rect x={encX + c * cellW} y={tableY + (r + 1) * cellH} width={cellW} height={cellH} fill={enc[col] ? 'rgba(34,197,94,0.3)' : 'rgba(55,65,81,0.15)'} stroke="var(--border)" />
                            <text x={encX + c * cellW + cellW / 2} y={tableY + (r + 1) * cellH + 18} textAnchor="middle" fontSize="10" fill={enc[col] ? COLORS.success : '#6b7280'} fontWeight={enc[col] ? '700' : '400'}>{enc[col]}</text>
                          </g>
                        ))}
                      </g>
                    ))}
                    {current.phase === 'create-cols' && current.activeCol >= 0 && (
                      <line x1={tableX + current.features.length * cellW + 5} y1={tableY + 14} x2={encX + current.activeCol * cellW} y2={tableY + 14} stroke={COLORS.highlight} strokeWidth="1.5" strokeDasharray="4 3" markerEnd="url(#arrow)" />
                    )}
                  </g>
                )}
                <defs>
                  <marker id="arrow" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
                    <path d="M0,0 L8,3 L0,6" fill={COLORS.highlight} />
                  </marker>
                </defs>
              </svg>
              <div style={{ display: 'flex', gap: 12, fontSize: 12, color: 'var(--text-secondary)' }}>
                <span>原始特征: <b>{current.features.length}</b></span>
                <span>编码列: <b>{current.allCols.length}</b></span>
                <span>稀疏度: <b>{current.encodedRows ? ((1 - current.encodedRows.reduce((s, r) => s + Object.values(r).reduce((a, b) => a + b, 0), 0) / (current.encodedRows.length * current.allCols.length)) * 100).toFixed(0) : 0}%</b></span>
              </div>
            </div>
          </VizCard>
        )
      }}
    />
  )
}
