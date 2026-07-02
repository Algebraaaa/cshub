import { useMemo } from 'react'
import PlaygroundShell from '../playgrounds/PlaygroundShell'
import VizCard from '../playgrounds/VizCard'

const PRESETS = {
  classic: {
    label: '标准示例',
    items: [
      { id: 0, w: 2, v: 3, name: 'A' },
      { id: 1, w: 3, v: 4, name: 'B' },
      { id: 2, w: 4, v: 5, name: 'C' },
      { id: 3, w: 5, v: 6, name: 'D' },
    ],
    capacity: 5,
  },
  highval: {
    label: '高价值小件',
    items: [
      { id: 0, w: 1, v: 2, name: 'A' },
      { id: 1, w: 2, v: 5, name: 'B' },
      { id: 2, w: 3, v: 6, name: 'C' },
      { id: 3, w: 4, v: 9, name: 'D' },
    ],
    capacity: 5,
  },
  tight: {
    label: '紧凑容量',
    items: [
      { id: 0, w: 2, v: 6, name: 'A' },
      { id: 1, w: 2, v: 10, name: 'B' },
      { id: 2, w: 3, v: 12, name: 'C' },
      { id: 3, w: 3, v: 15, name: 'D' },
    ],
    capacity: 5,
  },
}

function computeSteps({ presetKey }) {
  const preset = PRESETS[presetKey]
  const { items, capacity } = preset
  const n = items.length
  // DP table: dp[i][w] = max value using first i items with capacity w
  const dp = Array.from({ length: n + 1 }, () => Array(capacity + 1).fill(0))
  const chosen = Array.from({ length: n + 1 }, () => Array(capacity + 1).fill(false))
  const steps = []

  // Step 0: empty table
  steps.push({
    description: `0/1 背包 DP。${n} 件物品, 容量=${capacity}。初始化 dp[0][w]=0 (无物品, 价值为0)。`,
    preset, dp: JSON.parse(JSON.stringify(dp)),
    highlight: null, chosen: JSON.parse(JSON.stringify(chosen)),
    traceback: null, phase: 'init', line: 1,
  })

  // Fill cell by cell
  for (let i = 1; i <= n; i++) {
    const it = items[i - 1]
    for (let w = 1; w <= capacity; w++) {
      const skip = dp[i - 1][w]
      const take = (w >= it.w) ? dp[i - 1][w - it.w] + it.v : -Infinity
      if (take > skip) {
        dp[i][w] = take
        chosen[i][w] = true
      } else {
        dp[i][w] = skip
      }
      const prev1 = { i: i - 1, w }
      const prev2 = (w >= it.w) ? { i: i - 1, w: w - it.w } : null
      steps.push({
        description: `计算 dp[${i}][${w}] (物品${it.name}: w=${it.w}, v=${it.v}): max(dp[${i - 1}][${w}]=${skip}, ${w >= it.w ? `dp[${i - 1}][${w - it.w}]+${it.v}=${take}` : '不可取'}) = ${dp[i][w]}. ${take > skip ? '✓ 选该物品' : '✗ 不选'}`,
        preset, dp: JSON.parse(JSON.stringify(dp)),
        highlight: { i, w, prev1, prev2 },
        chosen: JSON.parse(JSON.stringify(chosen)),
        currentItem: it, takeBetter: take > skip,
        traceback: null, phase: 'fill', line: 3,
      })
    }
  }

  // Traceback
  steps.push({
    description: `DP 表填充完毕。最优值 dp[${n}][${capacity}] = ${dp[n][capacity]}。开始回溯找选中物品。`,
    preset, dp: JSON.parse(JSON.stringify(dp)),
    highlight: { i: n, w: capacity },
    chosen: JSON.parse(JSON.stringify(chosen)),
    traceback: [], phase: 'traceback-start', line: 7,
  })

  let i = n, w = capacity
  const selected = []
  while (i > 0 && w > 0) {
    if (chosen[i][w]) {
      selected.push(items[i - 1])
      steps.push({
        description: `dp[${i}][${w}]: 选中物品${items[i - 1].name}。回溯到 dp[${i - 1}][${w - items[i - 1].w}]。`,
        preset, dp: JSON.parse(JSON.stringify(dp)),
        highlight: { i, w, tbFrom: { i, w }, tbTo: { i: i - 1, w: w - items[i - 1].w } },
        chosen: JSON.parse(JSON.stringify(chosen)),
        traceback: selected.slice(), phase: 'traceback', line: 8,
      })
      w -= items[i - 1].w
      i--
    } else {
      steps.push({
        description: `dp[${i}][${w}]: 未选中物品${items[i - 1].name}。回溯到 dp[${i - 1}][${w}]。`,
        preset, dp: JSON.parse(JSON.stringify(dp)),
        highlight: { i, w, tbFrom: { i, w }, tbTo: { i: i - 1, w } },
        chosen: JSON.parse(JSON.stringify(chosen)),
        traceback: selected.slice(), phase: 'traceback', line: 8,
      })
      i--
    }
  }

  steps.push({
    description: `完成! 选中: [${selected.map(s => s.name).join(', ')}], 总价值=${selected.reduce((s, it) => s + it.v, 0)}, 总重量=${selected.reduce((s, it) => s + it.w, 0)}/${capacity}`,
    preset, dp: JSON.parse(JSON.stringify(dp)),
    highlight: null, chosen: JSON.parse(JSON.stringify(chosen)),
    traceback: selected, phase: 'done', line: 9,
  })

  return steps
}

function renderViz({ current }) {
  const { preset, dp, highlight, chosen, traceback, phase, currentItem, takeBetter } = current
  const { items, capacity } = preset
  const n = items.length
  const cellW = 56, cellH = 40
  const padX = 70, padY = 40

  const cols = capacity + 1
  const rows = n + 1
  const W = padX + cols * cellW + 20
  const H = padY + rows * cellH + 40

  const isFill = phase === 'fill'
  const isTB = phase === 'traceback' || phase === 'traceback-start'

  // Is cell part of traceback path?
  const tbSet = new Set()
  if (isTB && traceback) {
    let ii = n, ww = capacity
    tbSet.add(`${ii},${ww}`)
    traceback.forEach((it) => {
      if (chosen[it.id + 1][ww] && dp[it.id + 1][ww] === dp[it.id][ww - it.w] + it.v) {
        ww -= it.w
      }
      ii = it.id
      tbSet.add(`${ii},${ww}`)
    })
  }

  return (
    <VizCard>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
        <div style={{ overflowX: 'auto', width: '100%' }}>
          <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', minWidth: W }}>
            {/* Column headers (capacity) */}
            {Array.from({ length: capacity + 1 }).map((_, w) => (
              <text key={`ch-${w}`} x={padX + w * cellW + cellW / 2} y={padY - 8}
                textAnchor="middle" fontSize="11" fill="var(--text-tertiary)" fontFamily="monospace">
                w={w}
              </text>
            ))}
            {/* Row headers (items) */}
            <text x={padX - 8} y={padY - 8 + cellH / 2} textAnchor="end" fontSize="11" fill="var(--text-tertiary)" fontFamily="monospace">
              ∅
            </text>
            {items.map((it, i) => (
              <text key={`rh-${i}`} x={padX - 8} y={padY + (i + 1) * cellH + cellH / 2 + 4}
                textAnchor="end" fontSize="11" fill="var(--text-tertiary)" fontFamily="monospace">
                {it.name}(w{it.w},v{it.v})
              </text>
            ))}

            {/* Cells */}
            {Array.from({ length: rows }).map((_, i) =>
              Array.from({ length: cols }).map((__, w) => {
                const isCur = highlight && highlight.i === i && highlight.w === w
                const isPrev1 = isFill && highlight && highlight.prev1 && highlight.prev1.i === i && highlight.prev1.w === w
                const isPrev2 = isFill && highlight && highlight.prev2 && highlight.prev2.i === i && highlight.prev2.w === w
                const isTB = tbSet.has(`${i},${w}`)
                const isSelected = chosen[i] && chosen[i][w]
                let bg = 'var(--surface-2)'
                if (i === 0 || w === 0) bg = 'var(--surface)'
                if (isSelected && phase !== 'fill') bg = 'rgba(16,185,129,0.2)'
                if (isPrev1) bg = 'rgba(56,189,248,0.25)'
                if (isPrev2) bg = 'rgba(244,114,182,0.3)'
                if (isTB) bg = 'rgba(251,191,36,0.3)'
                if (isCur) bg = isFill && takeBetter ? 'rgba(239,68,68,0.35)' : 'rgba(251,191,36,0.5)'
                return (
                  <g key={`c-${i}-${w}`}>
                    <rect x={padX + w * cellW} y={padY + i * cellH} width={cellW - 2} height={cellH - 2}
                      rx="4" fill={bg} stroke="var(--border)" strokeWidth={isCur ? 2 : 1} />
                    <text x={padX + w * cellW + cellW / 2} y={padY + i * cellH + cellH / 2 + 4}
                      textAnchor="middle" fontSize="13" fontFamily="monospace"
                      fill={isCur ? 'var(--text-primary)' : 'var(--text-secondary)'}
                      fontWeight={isCur || isTB ? 700 : 500}>
                      {dp[i][w]}
                    </text>
                    {isSelected && !isFill && (
                      <circle cx={padX + w * cellW + cellW - 10} cy={padY + i * cellH + 8} r="4" fill="#10b981" />
                    )}
                  </g>
                )
              })
            )}

            {/* Arrow from prev cells to current */}
            {isFill && highlight && (
              <g>
                {highlight.prev1 && (
                  <line x1={padX + highlight.prev1.w * cellW + cellW / 2} y1={padY + highlight.prev1.i * cellH + cellH - 2}
                    x2={padX + highlight.w * cellW + cellW / 2} y2={padY + highlight.i * cellH + 2}
                    stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="3,2" />
                )}
                {highlight.prev2 && (
                  <line x1={padX + highlight.prev2.w * cellW + cellW / 2} y1={padY + highlight.prev2.i * cellH + cellH - 2}
                    x2={padX + highlight.w * cellW + cellW / 2} y2={padY + highlight.i * cellH + 2}
                    stroke="#f472b6" strokeWidth="1.5" strokeDasharray="3,2" />
                )}
              </g>
            )}
          </svg>
        </div>

        {isFill && currentItem && (
          <div style={{
            padding: '8px 12px', borderRadius: 8,
            background: takeBetter ? 'rgba(239,68,68,0.1)' : 'rgba(56,189,248,0.1)',
            border: `1px solid ${takeBetter ? '#ef4444' : '#38bdf8'}`,
            fontFamily: 'monospace', fontSize: 12, color: 'var(--text-primary)',
          }}>
            当前物品 <b>{currentItem.name}</b>: 重量={currentItem.w}, 价值={currentItem.v}
            &nbsp;→&nbsp; {takeBetter ? '选取! 价值更高' : '跳过, 保持原值'}
          </div>
        )}

        {/* Items list */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', width: '100%' }}>
          {items.map(it => {
            const sel = traceback && traceback.some(s => s.id === it.id)
            return (
              <div key={it.id} style={{
                padding: '6px 10px', borderRadius: 8, fontFamily: 'monospace', fontSize: 12,
                background: sel ? 'var(--accent-soft)' : 'var(--surface)',
                border: `1px solid ${sel ? 'var(--accent-border)' : 'var(--border)'}`,
                color: sel ? 'var(--text-primary)' : 'var(--text-secondary)',
              }}>
                {sel && '✓ '}{it.name}: w={it.w} v={it.v}
              </div>
            )
          })}
        </div>
      </div>
    </VizCard>
  )
}

export default function DPBagPlayground() {
  const presets = useMemo(() => Object.entries(PRESETS).map(([id, p]) => ({ id, label: p.label, state: { presetKey: id } })), [])
  return (
    <PlaygroundShell
      initialState={{ presetKey: 'classic' }}
      presets={presets}
      computeSteps={computeSteps}
      legend={[
        { color: 'rgba(251,191,36,0.5)', label: '当前计算格' },
        { color: 'rgba(56,189,248,0.25)', label: 'dp[i-1][w] (不取)' },
        { color: 'rgba(244,114,182,0.3)', label: 'dp[i-1][w-wi]+vi (取)' },
        { color: 'rgba(16,185,129,0.2)', label: '选中物品的格子' },
      ]}
      renderViz={renderViz}
    />
  )
}
