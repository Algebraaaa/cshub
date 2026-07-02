import { useCallback, useMemo } from 'react'
import PlaygroundShell from '../playgrounds/PlaygroundShell'
import VizCard from '../playgrounds/VizCard'

const W = 520
const H = 320
const PAD = 36
const COLORS = { primary: '#8b5cf6', secondary: '#f472b6', highlight: '#f97316', error: '#ef4444', tertiary: '#38bdf8', quaternary: '#fbbf24', success: '#22c55e' }

const FEATURES = [
  { name: '面积', importance: 0.85, corr: 0.92 },
  { name: '房间数', importance: 0.72, corr: 0.78 },
  { name: '楼层', importance: 0.35, corr: 0.30 },
  { name: '房龄', importance: 0.55, corr: -0.58 },
  { name: '地铁距离', importance: 0.68, corr: -0.65 },
  { name: '绿化率', importance: 0.20, corr: 0.15 },
  { name: '停车位', importance: 0.45, corr: 0.42 },
  { name: '物业费', importance: 0.15, corr: 0.10 },
]

function computeSteps({ method }) {
  const steps = []
  const sorted = [...FEATURES].sort((a, b) => b.importance - a.importance)
  const selected = new Set()

  steps.push({ description: '所有特征及其重要性得分', phase: 'overview', features: sorted, selected: new Set(), evaluating: -1, scores: [], corrMatrix: null })

  const corrMatrix = FEATURES.map((f1, i) => FEATURES.map((f2, j) => {
    if (i === j) return 1
    return Math.abs(f1.corr - f2.corr) < 0.3 ? 0.8 : 0.2
  }))

  if (method === 'filter') {
    const threshold = 0.4
    for (let i = 0; i < sorted.length; i++) {
      const pass = sorted[i].importance >= threshold
      if (pass) selected.add(sorted[i].name)
      steps.push({ description: `评估 "${sorted[i].name}"：重要性 ${sorted[i].importance.toFixed(2)} ${pass ? '≥' : '<'} 阈值 ${threshold} → ${pass ? '保留' : '剔除'}`, phase: 'evaluate', features: sorted, selected: new Set(selected), evaluating: i, scores: [], corrMatrix, threshold })
    }
  } else if (method === 'forward') {
    const scores = []
    for (let i = 0; i < 4; i++) {
      selected.add(sorted[i].name)
      const score = 0.65 + i * 0.08 - (i > 2 ? 0.02 : 0)
      scores.push({ fold: i + 1, score })
      steps.push({ description: `前向选择: 添加 "${sorted[i].name}"，模型得分 ${score.toFixed(3)}`, phase: 'evaluate', features: sorted, selected: new Set(selected), evaluating: i, scores: [...scores], corrMatrix })
    }
  } else {
    const l1Penalty = 0.3
    for (let i = 0; i < sorted.length; i++) {
      const survives = sorted[i].importance > l1Penalty
      if (survives) selected.add(sorted[i].name)
      steps.push({ description: `L1 正则: "${sorted[i].name}" 权重 ${sorted[i].importance.toFixed(2)} ${survives ? '>' : '≤'} 惩罚 ${l1Penalty} → ${survives ? '保留' : '压缩为0'}`, phase: 'evaluate', features: sorted, selected: new Set(selected), evaluating: i, scores: [], corrMatrix, l1Penalty })
    }
  }

  steps.push({ description: `特征选择完成: 从 ${FEATURES.length} 个特征中选出 ${selected.size} 个`, phase: 'done', features: sorted, selected: new Set(selected), evaluating: -1, scores: [], corrMatrix })

  return steps
}

export default function FeatureSelectionPlayground() {
  const presets = useMemo(() => [
    { id: 'filter', label: 'Filter (相关性)', state: { method: 'filter' } },
    { id: 'forward', label: 'Forward Selection', state: { method: 'forward' } },
    { id: 'l1', label: 'L1 正则化', state: { method: 'l1' } },
  ], [])

  const computeStepsFn = useCallback(state => computeSteps(state), [])

  return (
    <PlaygroundShell
      initialState={{ method: 'filter' }}
      presets={presets}
      derivePayload={s => s}
      computeSteps={computeStepsFn}
      legend={[
        { color: COLORS.success, label: '已选择' },
        { color: COLORS.error, label: '已剔除' },
        { color: COLORS.highlight, label: '评估中' },
      ]}
      renderViz={({ current }) => {
        const barX = PAD + 70
        const barMaxW = W - barX - PAD - 60
        const barH = 22
        const gap = 6
        const hmSize = 8
        const hmX = W - PAD - FEATURES.length * hmSize - 4

        return (
          <VizCard>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
              <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxWidth: W }}>
                {current.features.map((f, i) => {
                  const y = PAD + i * (barH + gap)
                  const bw = f.importance * barMaxW
                  const isSelected = current.selected.has(f.name)
                  const isEval = current.evaluating === i
                  let fill = '#4b5563'
                  if (isEval) fill = COLORS.highlight
                  else if (current.phase !== 'overview') fill = isSelected ? COLORS.success : COLORS.error

                  return (
                    <g key={f.name}>
                      <text x={barX - 6} y={y + 15} textAnchor="end" fontSize="10" fill="var(--text-primary)">{f.name}</text>
                      <rect x={barX} y={y} width={bw} height={barH} fill={fill} rx="4" opacity={current.phase !== 'overview' && !isSelected && !isEval ? 0.35 : 0.85} />
                      <text x={barX + bw + 6} y={y + 15} fontSize="9" fill="var(--text-secondary)">{f.importance.toFixed(2)}</text>
                      {current.phase !== 'overview' && (
                        <text x={barX + bw + 32} y={y + 15} fontSize="11" fill={isSelected ? COLORS.success : COLORS.error}>{isSelected ? '✓' : '✗'}</text>
                      )}
                    </g>
                  )
                })}
                {current.corrMatrix && (
                  <g>
                    <text x={hmX} y={PAD - 6} fontSize="8" fill="var(--text-tertiary)">相关性</text>
                    {current.corrMatrix.map((row, i) => row.map((v, j) => (
                      <rect key={`hm-${i}-${j}`} x={hmX + j * hmSize} y={PAD + 4 + i * hmSize} width={hmSize - 1} height={hmSize - 1} fill={COLORS.primary} opacity={v} rx="1" />
                    )))}
                  </g>
                )}
                {current.scores.length > 0 && (
                  <g>
                    <text x={PAD} y={H - PAD + 4} fontSize="9" fill="var(--text-secondary)">模型得分:</text>
                    {current.scores.map((s, i) => (
                      <g key={`sc-${i}`}>
                        <rect x={PAD + 60 + i * 50} y={H - PAD - 8} width={40} height={12} fill={COLORS.tertiary} rx="3" opacity="0.7" />
                        <text x={PAD + 80 + i * 50} y={H - PAD + 2} textAnchor="middle" fontSize="8" fill="#fff">{s.score.toFixed(2)}</text>
                      </g>
                    ))}
                  </g>
                )}
              </svg>
              <div style={{ display: 'flex', gap: 12, fontSize: 12, color: 'var(--text-secondary)' }}>
                <span>已评估: <b>{current.evaluating >= 0 ? current.evaluating + 1 : current.features.length}</b></span>
                <span>已选择: <b>{current.selected.size}</b></span>
                <span>缩减: <b>{current.phase === 'done' ? ((1 - current.selected.size / current.features.length) * 100).toFixed(0) : 0}%</b></span>
              </div>
            </div>
          </VizCard>
        )
      }}
    />
  )
}
