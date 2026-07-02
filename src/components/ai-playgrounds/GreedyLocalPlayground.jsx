import { useMemo } from 'react'
import PlaygroundShell from '../playgrounds/PlaygroundShell'
import VizCard from '../playgrounds/VizCard'

// Activity selection: each activity has (start, finish, name)
const ACTIVITY_PRESETS = {
  standard: {
    label: '标准贪心示例',
    activities: [
      { id: 0, name: 'A1', start: 1, finish: 4 },
      { id: 1, name: 'A2', start: 3, finish: 5 },
      { id: 2, name: 'A3', start: 0, finish: 6 },
      { id: 3, name: 'A4', start: 5, finish: 7 },
      { id: 4, name: 'A5', start: 3, finish: 9 },
      { id: 5, name: 'A6', start: 5, finish: 9 },
      { id: 6, name: 'A7', start: 6, finish: 10 },
      { id: 7, name: 'A8', start: 8, finish: 11 },
      { id: 8, name: 'A9', start: 8, finish: 12 },
      { id: 9, name: 'A10', start: 2, finish: 14 },
      { id: 10, name: 'A11', start: 12, finish: 16 },
    ],
    // Correct greedy by finish time selects: A1, A4, A7, A11 (4)
  },
  counterexample: {
    label: '最早开始·反例',
    activities: [
      { id: 0, name: 'X', start: 0, finish: 10 },  // earliest start but bad
      { id: 1, name: 'A', start: 1, finish: 3 },
      { id: 2, name: 'B', start: 4, finish: 6 },
      { id: 3, name: 'C', start: 7, finish: 9 },
    ],
    // Greedy by finish: A, B, C (3)
    // Greedy by start: X (1)  — 失败!
  },
  dense: {
    label: '密集区间',
    activities: [
      { id: 0, name: 'A', start: 1, finish: 3 },
      { id: 1, name: 'B', start: 2, finish: 4 },
      { id: 2, name: 'C', start: 3, finish: 5 },
      { id: 3, name: 'D', start: 4, finish: 6 },
      { id: 4, name: 'E', start: 5, finish: 7 },
      { id: 5, name: 'F', start: 2, finish: 5 },
      { id: 6, name: 'G', start: 1, finish: 6 },
    ],
  },
}

function computeSteps({ presetKey }) {
  const preset = ACTIVITY_PRESETS[presetKey]
  const acts = preset.activities
  const steps = []

  steps.push({
    description: `活动选择问题: ${acts.length} 个活动。目标: 选择最多不重叠活动。初始状态。`,
    preset, sorted: null, selected: [], skipped: [],
    currentIdx: -1, lastFinish: -1, mode: 'greedy-finish', phase: 'init', line: 1,
  })

  // Greedy by finish time (correct)
  const sorted = [...acts].sort((a, b) => a.finish - b.finish)
  steps.push({
    description: `正确策略: 按结束时间升序排序 → [${sorted.map(a => `${a.name}(${a.start}-${a.finish})`).join(', ')}]`,
    preset, sorted, selected: [], skipped: [],
    currentIdx: -1, lastFinish: -1, mode: 'greedy-finish', phase: 'sorted', line: 2,
  })

  let lastFinish = -1
  const selected = [], skipped = []
  for (let i = 0; i < sorted.length; i++) {
    const a = sorted[i]
    if (a.start >= lastFinish) {
      selected.push(a)
      lastFinish = a.finish
      steps.push({
        description: `步骤 ${i + 1}: 活动 ${a.name}(${a.start}-${a.finish}) 开始时间 ≥ 上一结束(${i === 0 ? '∅' : lastFinish - (a.finish - a.start)}) ✓ 选中。当前已选 ${selected.length} 个。`,
        preset, sorted, selected: selected.slice(), skipped: skipped.slice(),
        currentIdx: i, lastFinish, mode: 'greedy-finish', phase: 'select', line: 3,
      })
    } else {
      skipped.push(a)
      steps.push({
        description: `步骤 ${i + 1}: 活动 ${a.name}(${a.start}-${a.finish}) 开始时间 < 上一结束(${lastFinish}) ✗ 冲突, 跳过。`,
        preset, sorted, selected: selected.slice(), skipped: skipped.slice(),
        currentIdx: i, lastFinish, mode: 'greedy-finish', phase: 'skip', line: 4,
      })
    }
  }

  steps.push({
    description: `贪心(按结束时间)完成! 共选 ${selected.length} 个活动: [${selected.map(s => s.name).join(', ')}]。局部最优 → 全局最优。`,
    preset, sorted, selected: selected.slice(), skipped: skipped.slice(),
    currentIdx: -1, lastFinish, mode: 'greedy-finish', phase: 'done-good', line: 5,
  })

  // Show counterexample heuristic if present
  if (presetKey === 'counterexample') {
    const badSorted = [...acts].sort((a, b) => a.start - b.start)
    const badSel = [], badSkip = []
    let bf = -1
    badSorted.forEach(a => {
      if (a.start >= bf) { badSel.push(a); bf = a.finish } else { badSkip.push(a) }
    })
    steps.push({
      description: `反例演示: 用「最早开始时间」启发式 → 选择 [${badSel.map(s => s.name).join(', ')}] (共 ${badSel.length} 个), 而最优解为 ${selected.length} 个。局部最优 ≠ 全局最优!`,
      preset, sorted: badSorted, selected: badSel, skipped: badSkip,
      currentIdx: -1, lastFinish: bf, mode: 'greedy-start-bad', phase: 'done-bad', line: 8,
    })
  }

  return steps
}

function renderViz({ current }) {
  const { preset, sorted, selected, skipped, currentIdx, lastFinish, phase, mode } = current
  const acts = sorted || preset.activities
  const maxF = Math.max(...preset.activities.map(a => a.finish))
  const rowH = 28
  const padL = 60, padR = 20, padT = 30, padB = 40
  const chartW = 620
  const H = padT + acts.length * rowH + padB
  const timeW = chartW - padL - padR

  const isBad = mode === 'greedy-start-bad'

  return (
    <VizCard>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
        <svg viewBox={`0 0 ${chartW} ${H}`} style={{ width: '100%', maxWidth: chartW }}>
          {/* Time axis */}
          <line x1={padL} y1={H - padB + 4} x2={chartW - padR} y2={H - padB + 4} stroke="var(--border)" />
          {Array.from({ length: maxF + 1 }).map((_, t) => (
            <g key={`t-${t}`}>
              <line x1={padL + (t / maxF) * timeW} y1={padT} x2={padL + (t / maxF) * timeW} y2={H - padB + 4}
                stroke="var(--border)" strokeDasharray="2,3" opacity="0.4" />
              <text x={padL + (t / maxF) * timeW} y={H - padB + 18}
                textAnchor="middle" fontSize="10" fill="var(--text-tertiary)" fontFamily="monospace">{t}</text>
            </g>
          ))}
          <text x={chartW / 2} y={H - 6} textAnchor="middle" fontSize="11" fill="var(--text-tertiary)">时间</text>

          {/* Current selection boundary line */}
          {(phase === 'select' || phase === 'skip') && lastFinish >= 0 && (
            <g>
              <line x1={padL + (lastFinish / maxF) * timeW} y1={padT}
                x2={padL + (lastFinish / maxF) * timeW} y2={H - padB}
                stroke={isBad ? '#ef4444' : '#fbbf24'} strokeWidth="2" strokeDasharray="5,3" />
              <text x={padL + (lastFinish / maxF) * timeW + 4} y={padT + 12}
                fontSize="10" fill={isBad ? '#ef4444' : '#fbbf24'} fontFamily="monospace">
                上一结束 = {lastFinish}
              </text>
            </g>
          )}

          {/* Activities as bars */}
          {acts.map((a, idx) => {
            const isSelected = selected.some(s => s.id === a.id)
            const isSkipped = skipped.some(s => s.id === a.id)
            const isCurrent = idx === currentIdx
            const y = padT + idx * rowH
            const x1 = padL + (a.start / maxF) * timeW
            const w = Math.max(4, ((a.finish - a.start) / maxF) * timeW)
            let fill = 'var(--surface-2)'
            let border = 'var(--border)'
            if (isSelected) { fill = isBad ? 'rgba(239,68,68,0.3)' : 'rgba(16,185,129,0.3)'; border = isBad ? '#ef4444' : '#10b981' }
            if (isSkipped) { fill = 'rgba(148,163,184,0.2)'; border = '#64748b' }
            if (isCurrent) { border = '#fbbf24' }
            return (
              <g key={a.id}>
                <text x={padL - 6} y={y + rowH / 2 + 4}
                  textAnchor="end" fontSize="11" fill="var(--text-secondary)" fontFamily="monospace">
                  {a.name}
                </text>
                <rect x={x1} y={y + 3} width={w} height={rowH - 8} rx="4"
                  fill={fill} stroke={border} strokeWidth={isCurrent ? 2.5 : 1.5} />
                <text x={x1 + w / 2} y={y + rowH / 2 + 4}
                  textAnchor="middle" fontSize="10" fontFamily="monospace"
                  fill={isSelected ? (isBad ? '#fca5a5' : '#6ee7b7') : (isSkipped ? '#94a3b8' : 'var(--text-secondary)')}>
                  [{a.start},{a.finish}]
                </text>
                {isSelected && (
                  <text x={x1 + w - 10} y={y + rowH / 2 + 4} fontSize="10" fill={isBad ? '#ef4444' : '#10b981'}>
                    {isBad ? '✗' : '✓'}
                  </text>
                )}
              </g>
            )
          })}
        </svg>

        {/* Mode and stats */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center', width: '100%' }}>
          <div style={{
            padding: '6px 12px', borderRadius: 8, fontSize: 12, fontFamily: 'monospace',
            background: isBad ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)',
            border: `1px solid ${isBad ? '#ef4444' : '#10b981'}`,
            color: isBad ? '#fca5a5' : '#6ee7b7',
          }}>
            策略: {isBad ? '最早开始 × (局部最优≠全局最优)' : '最早结束 ✓ (贪心正确)'}
          </div>
          <div style={{
            padding: '6px 12px', borderRadius: 8, fontSize: 12, fontFamily: 'monospace',
            background: 'var(--surface)', border: '1px solid var(--border)',
          }}>
            已选 <b style={{ color: isBad ? '#ef4444' : '#10b981' }}>{selected.length}</b> / {acts.length}
            &nbsp;&nbsp;已跳过 <b style={{ color: '#94a3b8' }}>{skipped.length}</b>
          </div>
        </div>

        {selected.length > 0 && (
          <div style={{
            display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center',
            padding: '8px 12px', borderRadius: 8,
            background: isBad ? 'rgba(239,68,68,0.08)' : 'rgba(16,185,129,0.08)',
            border: `1px dashed ${isBad ? '#ef4444' : '#10b981'}`,
          }}>
            {selected.map(a => (
              <span key={a.id} style={{
                padding: '3px 8px', borderRadius: 5,
                background: isBad ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.2)',
                fontFamily: 'monospace', fontSize: 11,
              }}>
                {a.name}: [{a.start}, {a.finish}]
              </span>
            ))}
          </div>
        )}
      </div>
    </VizCard>
  )
}

export default function GreedyLocalPlayground() {
  const presets = useMemo(() => Object.entries(ACTIVITY_PRESETS).map(([id, p]) => ({ id, label: p.label, state: { presetKey: id } })), [])
  return (
    <PlaygroundShell
      initialState={{ presetKey: 'standard' }}
      presets={presets}
      computeSteps={computeSteps}
      legend={[
        { color: '#10b981', label: '正确选中' },
        { color: '#94a3b8', label: '跳过/冲突' },
        { color: '#fbbf24', label: '当前边界' },
        { color: '#ef4444', label: '次优(反例)' },
      ]}
      renderViz={renderViz}
    />
  )
}
