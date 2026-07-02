import { useCallback, useMemo } from 'react'
import PlaygroundShell from '../playgrounds/PlaygroundShell'
import VizCard from '../playgrounds/VizCard'

const W = 520
const H = 320
const PAD = 36
const COLORS = { primary: '#8b5cf6', secondary: '#f472b6', highlight: '#f97316', error: '#ef4444', tertiary: '#38bdf8', success: '#22c55e' }

function generateSamples(preset) {
  const rng = (seed) => { let s = seed; return () => { s = (s * 16807) % 2147483647; return s / 2147483647 } }
  const rand = rng(42)
  const samples = []
  for (let i = 0; i < 20; i++) {
    const actual = i < 10 ? 1 : 0
    let prob
    if (preset === 'balanced') prob = actual ? 0.5 + rand() * 0.45 : rand() * 0.5
    else if (preset === 'high-precision') prob = actual ? 0.6 + rand() * 0.4 : rand() * 0.35
    else prob = actual ? 0.35 + rand() * 0.65 : rand() * 0.6
    samples.push({ id: i, actual, prob, predicted: prob >= 0.5 ? 1 : 0 })
  }
  return samples
}

function computeSteps({ preset }) {
  const samples = generateSamples(preset)
  const steps = []
  let tp = 0, fp = 0, tn = 0, fn = 0

  steps.push({ description: '展示 20 个样本及其真实标签与预测概率', phase: 'samples', samples, tp, fp, tn, fn, classifyIdx: -1, metrics: null })

  for (let i = 0; i < samples.length; i++) {
    const s = samples[i]
    if (s.actual === 1 && s.predicted === 1) tp++
    else if (s.actual === 0 && s.predicted === 1) fp++
    else if (s.actual === 0 && s.predicted === 0) tn++
    else fn++
    steps.push({ description: `分类样本 ${i + 1}: 真实=${s.actual}, 预测=${s.predicted} → ${s.actual === 1 && s.predicted === 1 ? 'TP' : s.actual === 0 && s.predicted === 1 ? 'FP' : s.actual === 0 && s.predicted === 0 ? 'TN' : 'FN'}`, phase: 'classify', samples, tp, fp, tn, fn, classifyIdx: i, metrics: null })
  }

  steps.push({ description: `混淆矩阵完成: TP=${tp}, FP=${fp}, TN=${tn}, FN=${fn}`, phase: 'matrix-done', samples, tp, fp, tn, fn, classifyIdx: -1, metrics: null })

  const acc = (tp + tn) / samples.length
  const prec = tp + fp > 0 ? tp / (tp + fp) : 0
  const rec = tp + fn > 0 ? tp / (tp + fn) : 0
  const f1 = prec + rec > 0 ? 2 * prec * rec / (prec + rec) : 0

  const metricSteps = [
    { key: 'accuracy', label: '准确率', formula: '(TP+TN)/N', value: acc },
    { key: 'precision', label: '精确率', formula: 'TP/(TP+FP)', value: prec },
    { key: 'recall', label: '召回率', formula: 'TP/(TP+FN)', value: rec },
    { key: 'f1', label: 'F1 分数', formula: '2·P·R/(P+R)', value: f1 },
  ]

  for (let i = 0; i < metricSteps.length; i++) {
    const activeMetrics = metricSteps.slice(0, i + 1).reduce((o, m) => ({ ...o, [m.key]: m.value }), {})
    steps.push({ description: `计算${metricSteps[i].label}: ${metricSteps[i].formula} = ${metricSteps[i].value.toFixed(3)}`, phase: 'metrics', samples, tp, fp, tn, fn, classifyIdx: -1, metrics: activeMetrics, activeMetric: metricSteps[i].key })
  }

  return steps
}

export default function ConfusionMatrixPlayground() {
  const presets = useMemo(() => [
    { id: 'balanced', label: '均衡分类器', state: { preset: 'balanced' } },
    { id: 'high-precision', label: '高精确率', state: { preset: 'high-precision' } },
    { id: 'high-recall', label: '高召回率', state: { preset: 'high-recall' } },
  ], [])

  const computeStepsFn = useCallback(state => computeSteps(state), [])

  return (
    <PlaygroundShell
      initialState={{ preset: 'balanced' }}
      presets={presets}
      derivePayload={s => s}
      computeSteps={computeStepsFn}
      legend={[
        { color: COLORS.success, label: 'TP (真阳性)' },
        { color: COLORS.error, label: 'FP (假阳性)' },
        { color: COLORS.tertiary, label: 'TN (真阴性)' },
        { color: COLORS.quaternary || '#fbbf24', label: 'FN (假阴性)' },
      ]}
      renderViz={({ current }) => {
        const mxX = PAD + 30
        const mxY = PAD + 40
        const cellSize = 80
        const cells = [
          { label: 'TP', value: current.tp, color: COLORS.success, row: 0, col: 0 },
          { label: 'FP', value: current.fp, color: COLORS.error, row: 0, col: 1 },
          { label: 'FN', value: current.fn, color: '#fbbf24', row: 1, col: 0 },
          { label: 'TN', value: current.tn, color: COLORS.tertiary, row: 1, col: 1 },
        ]
        const metricDefs = [
          { key: 'accuracy', label: 'Accuracy', value: current.metrics?.accuracy },
          { key: 'precision', label: 'Precision', value: current.metrics?.precision },
          { key: 'recall', label: 'Recall', value: current.metrics?.recall },
          { key: 'f1', label: 'F1', value: current.metrics?.f1 },
        ]
        const barX = mxX + cellSize * 2 + 60
        const barMaxW = W - barX - PAD
        const barH = 24

        return (
          <VizCard>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
              <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxWidth: W }}>
                <text x={mxX + cellSize} y={mxY - 20} textAnchor="middle" fontSize="11" fill="var(--text-secondary)" fontWeight="600">预测</text>
                <text x={mxX - 18} y={mxY + cellSize} textAnchor="middle" fontSize="11" fill="var(--text-secondary)" fontWeight="600" transform={`rotate(-90,${mxX - 18},${mxY + cellSize})`}>实际</text>
                <text x={mxX + cellSize * 0.5} y={mxY - 6} textAnchor="middle" fontSize="9" fill="var(--text-tertiary)">正</text>
                <text x={mxX + cellSize * 1.5} y={mxY - 6} textAnchor="middle" fontSize="9" fill="var(--text-tertiary)">负</text>
                {cells.map(c => {
                  const x = mxX + c.col * cellSize
                  const y = mxY + c.row * cellSize
                  const maxVal = Math.max(current.tp, current.fp, current.tn, current.fn, 1)
                  const opacity = 0.2 + 0.7 * (c.value / maxVal)
                  return (
                    <g key={c.label}>
                      <rect x={x} y={y} width={cellSize} height={cellSize} fill={c.color} opacity={opacity} rx="6" stroke="var(--border)" />
                      <text x={x + cellSize / 2} y={y + cellSize / 2 - 6} textAnchor="middle" fontSize="20" fill="#fff" fontWeight="700">{c.value}</text>
                      <text x={x + cellSize / 2} y={y + cellSize / 2 + 14} textAnchor="middle" fontSize="11" fill="rgba(255,255,255,0.8)">{c.label}</text>
                    </g>
                  )
                })}
                {metricDefs.map((m, i) => {
                  const y = mxY + i * (barH + 10)
                  const bw = (m.value ?? 0) * barMaxW
                  const isActive = current.activeMetric === m.key
                  return (
                    <g key={m.key}>
                      <text x={barX - 6} y={y + 16} textAnchor="end" fontSize="10" fill={isActive ? COLORS.highlight : 'var(--text-secondary)'}>{m.label}</text>
                      <rect x={barX} y={y + 2} width={barMaxW} height={barH - 4} fill="rgba(139,92,246,0.08)" rx="4" />
                      {m.value !== undefined && (
                        <>
                          <rect x={barX} y={y + 2} width={bw} height={barH - 4} fill={isActive ? COLORS.highlight : COLORS.primary} rx="4" opacity="0.8" />
                          <text x={barX + bw + 6} y={y + 16} fontSize="10" fill="var(--text-primary)" fontWeight={isActive ? '700' : '400'}>{m.value.toFixed(3)}</text>
                        </>
                      )}
                    </g>
                  )
                })}
              </svg>
              <div style={{ display: 'flex', gap: 12, fontSize: 12, color: 'var(--text-secondary)' }}>
                <span>TP: <b>{current.tp}</b></span>
                <span>FP: <b>{current.fp}</b></span>
                <span>TN: <b>{current.tn}</b></span>
                <span>FN: <b>{current.fn}</b></span>
              </div>
            </div>
          </VizCard>
        )
      }}
    />
  )
}
