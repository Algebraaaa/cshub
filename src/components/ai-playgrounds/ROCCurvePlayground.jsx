import { useCallback, useMemo } from 'react'
import PlaygroundShell from '../playgrounds/PlaygroundShell'
import VizCard from '../playgrounds/VizCard'

const W = 520
const H = 320
const PAD = 36
const COLORS = { primary: '#8b5cf6', secondary: '#f472b6', highlight: '#f97316', error: '#ef4444', tertiary: '#38bdf8', success: '#22c55e' }

function generateSamples(preset) {
  const rng = (seed) => { let s = seed; return () => { s = (s * 16807) % 2147483647; return s / 2147483647 } }
  const rand = rng(123)
  const samples = []
  const n = 18
  for (let i = 0; i < n; i++) {
    const actual = i < n / 2 ? 1 : 0
    let score
    if (preset === 'good') score = actual ? 0.55 + rand() * 0.45 : rand() * 0.45
    else if (preset === 'random') score = rand()
    else score = actual ? 0.8 + rand() * 0.2 : rand() * 0.2
    samples.push({ id: i, actual, score })
  }
  samples.sort((a, b) => b.score - a.score)
  return samples
}

function computeSteps({ preset }) {
  const samples = generateSamples(preset)
  const steps = []
  const rocPoints = []
  const totalPos = samples.filter(s => s.actual === 1).length
  const totalNeg = samples.filter(s => s.actual === 0).length

  steps.push({ description: '样本按预测分数降序排列', phase: 'overview', samples, rocPoints: [], threshold: 1.0, tpr: 0, fpr: 0, auc: 0, activeIdx: -1 })

  let tp = 0, fp = 0
  let prevTpr = 0, prevFpr = 0
  let aucVal = 0

  for (let i = 0; i < samples.length; i++) {
    const threshold = samples[i].score
    if (samples[i].actual === 1) tp++
    else fp++
    const tpr = tp / totalPos
    const fpr = fp / totalNeg
    aucVal += 0.5 * (tpr + prevTpr) * (fpr - prevFpr)
    rocPoints.push({ tpr, fpr, threshold })
    steps.push({
      description: `阈值=${threshold.toFixed(3)}: 样本${i + 1}(${samples[i].actual ? '正' : '负'}), TPR=${tpr.toFixed(3)}, FPR=${fpr.toFixed(3)}`,
      phase: 'sweep', samples, rocPoints: [...rocPoints], threshold, tpr, fpr, auc: aucVal, activeIdx: i,
    })
    prevTpr = tpr
    prevFpr = fpr
  }

  steps.push({ description: `ROC 曲线绘制完成，AUC = ${aucVal.toFixed(3)}`, phase: 'done', samples, rocPoints: [...rocPoints], threshold: 0, tpr: prevTpr, fpr: prevFpr, auc: aucVal, activeIdx: -1 })

  return steps
}

export default function ROCCurvePlayground() {
  const presets = useMemo(() => [
    { id: 'good', label: '好分类器', state: { preset: 'good' } },
    { id: 'random', label: '随机分类器', state: { preset: 'random' } },
    { id: 'perfect', label: '完美分类器', state: { preset: 'perfect' } },
  ], [])

  const computeStepsFn = useCallback(state => computeSteps(state), [])

  return (
    <PlaygroundShell
      initialState={{ preset: 'good' }}
      presets={presets}
      derivePayload={s => s}
      computeSteps={computeStepsFn}
      legend={[
        { color: COLORS.primary, label: 'ROC 曲线' },
        { color: '#6b7280', label: '随机基线' },
        { color: COLORS.highlight, label: '当前阈值' },
      ]}
      renderViz={({ current }) => {
        const leftW = (W - PAD * 3) / 2
        const rightX = PAD * 2 + leftW
        const rightW = W - rightX - PAD
        const sampleH = (H - PAD * 2 - 10) / current.samples.length

        return (
          <VizCard>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
              <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxWidth: W }}>
                <rect x={PAD} y={PAD - 10} width={leftW} height={H - PAD * 2 + 10} fill="rgba(139,92,246,0.04)" rx="6" />
                <text x={PAD + leftW / 2} y={PAD + 4} textAnchor="middle" fontSize="10" fill="var(--text-secondary)" fontWeight="600">样本 (按分数排序)</text>
                {current.samples.map((s, i) => {
                  const y = PAD + 14 + i * sampleH
                  const isActive = current.activeIdx === i
                  return (
                    <g key={s.id}>
                      <rect x={PAD + 4} y={y} width={leftW - 8} height={sampleH - 1} fill={isActive ? 'rgba(249,115,22,0.2)' : 'transparent'} rx="2" />
                      <rect x={PAD + 8} y={y + 1} width={s.score * (leftW - 50)} height={sampleH - 3} fill={s.actual ? COLORS.secondary : COLORS.tertiary} opacity="0.7" rx="2" />
                      <text x={PAD + leftW - 12} y={y + sampleH / 2 + 3} textAnchor="end" fontSize="8" fill="var(--text-tertiary)">{s.score.toFixed(2)}</text>
                      {i <= current.activeIdx && <text x={PAD + 10} y={y + sampleH / 2 + 3} fontSize="7" fill={s.actual ? COLORS.success : COLORS.error}>{s.actual ? '●' : '○'}</text>}
                    </g>
                  )
                })}
                {current.activeIdx >= 0 && (
                  <line x1={PAD + 4} y1={PAD + 14 + (current.activeIdx + 0.5) * sampleH} x2={PAD + leftW - 4} y2={PAD + 14 + (current.activeIdx + 0.5) * sampleH} stroke={COLORS.highlight} strokeWidth="1.5" strokeDasharray="4 2" />
                )}

                <rect x={rightX} y={PAD - 10} width={rightW} height={H - PAD * 2 + 10} fill="rgba(56,189,248,0.04)" rx="6" />
                <text x={rightX + rightW / 2} y={PAD + 4} textAnchor="middle" fontSize="10" fill="var(--text-secondary)" fontWeight="600">ROC 曲线</text>
                <line x1={rightX + 10} y1={H - PAD - 10} x2={rightX + rightW - 10} y2={PAD + 14} stroke="#6b7280" strokeWidth="1" strokeDasharray="4 3" />
                <text x={rightX + rightW / 2} y={H - PAD + 8} textAnchor="middle" fontSize="9" fill="var(--text-tertiary)">FPR</text>
                <text x={rightX - 2} y={H / 2} textAnchor="middle" fontSize="9" fill="var(--text-tertiary)" transform={`rotate(-90,${rightX - 2},${H / 2})`}>TPR</text>

                {current.rocPoints.length > 1 && (
                  <polyline
                    points={current.rocPoints.map(p => `${rightX + 10 + p.fpr * (rightW - 20)},${H - PAD - 10 - p.tpr * (H - PAD * 2 - 24)}`).join(' ')}
                    fill="none" stroke={COLORS.primary} strokeWidth="2.5" strokeLinejoin="round"
                  />
                )}
                {current.rocPoints.map((p, i) => (
                  <circle key={i} cx={rightX + 10 + p.fpr * (rightW - 20)} cy={H - PAD - 10 - p.tpr * (H - PAD * 2 - 24)} r={i === current.rocPoints.length - 1 ? 4 : 2} fill={i === current.rocPoints.length - 1 ? COLORS.highlight : COLORS.primary} />
                ))}
              </svg>
              <div style={{ display: 'flex', gap: 12, fontSize: 12, color: 'var(--text-secondary)' }}>
                <span>阈值: <b>{current.threshold.toFixed(3)}</b></span>
                <span>TPR: <b>{current.tpr.toFixed(3)}</b></span>
                <span>FPR: <b>{current.fpr.toFixed(3)}</b></span>
                <span>AUC: <b>{current.auc.toFixed(3)}</b></span>
              </div>
            </div>
          </VizCard>
        )
      }}
    />
  )
}
