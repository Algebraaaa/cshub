import { useCallback, useMemo } from 'react'
import PlaygroundShell from '../playgrounds/PlaygroundShell'
import VizCard from '../playgrounds/VizCard'

const W = 520
const H = 320
const PAD = 36
const COLORS = { primary: '#8b5cf6', secondary: '#f472b6', highlight: '#f97316', error: '#ef4444', tertiary: '#38bdf8', quaternary: '#fbbf24', success: '#22c55e' }
const FOLD_COLORS = ['#8b5cf6', '#f472b6', '#38bdf8', '#fbbf24', '#22c55e', '#f97316', '#ef4444', '#a78bfa', '#fb923c', '#34d399']

const N_SAMPLES = 20

function generateScores(k, seed) {
  const rng = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647 }
  return Array.from({ length: k }, () => 0.7 + rng() * 0.25)
}

function computeSteps({ k }) {
  const steps = []
  const assignments = Array.from({ length: N_SAMPLES }, (_, i) => i % k)
  const scores = generateScores(k, k * 1000 + 7)
  const foldResults = []

  steps.push({ description: `${N_SAMPLES} 个样本，准备进行 ${k} 折交叉验证`, phase: 'overview', assignments, k, currentFold: -1, foldResults: [], trainMask: null })

  steps.push({ description: `数据分成 ${k} 折，每折 ${Math.floor(N_SAMPLES / k)}~${Math.ceil(N_SAMPLES / k)} 个样本`, phase: 'split', assignments, k, currentFold: -1, foldResults: [], trainMask: null })

  for (let fold = 0; fold < k; fold++) {
    const testMask = assignments.map(a => a === fold)
    steps.push({ description: `第 ${fold + 1} 折: 橙色为测试集 (${testMask.filter(Boolean).length} 个样本)，其余为训练集`, phase: 'train', assignments, k, currentFold: fold, foldResults: [...foldResults], trainMask: testMask.map(v => !v) })

    foldResults.push({ fold: fold + 1, score: scores[fold] })
    steps.push({ description: `第 ${fold + 1} 折完成: 得分 = ${scores[fold].toFixed(3)}`, phase: 'score', assignments, k, currentFold: fold, foldResults: [...foldResults], trainMask: testMask.map(v => !v) })
  }

  const meanScore = foldResults.reduce((s, r) => s + r.score, 0) / foldResults.length
  const stdScore = Math.sqrt(foldResults.reduce((s, r) => s + (r.score - meanScore) ** 2, 0) / foldResults.length)
  const bestFold = foldResults.reduce((best, r) => r.score > best.score ? r : best, foldResults[0])

  steps.push({ description: `交叉验证完成: 均值=${meanScore.toFixed(3)} ± ${stdScore.toFixed(3)}, 最佳折=${bestFold.fold}`, phase: 'done', assignments, k, currentFold: -1, foldResults, trainMask: null, meanScore, stdScore, bestFold: bestFold.fold })

  return steps
}

export default function CrossValidationPlayground() {
  const presets = useMemo(() => [
    { id: 'k3', label: '3 折', state: { k: 3 } },
    { id: 'k5', label: '5 折', state: { k: 5 } },
    { id: 'k10', label: '10 折', state: { k: 10 } },
  ], [])

  const computeStepsFn = useCallback(state => computeSteps(state), [])

  return (
    <PlaygroundShell
      initialState={{ k: 5 }}
      presets={presets}
      derivePayload={s => s}
      computeSteps={computeStepsFn}
      legend={[
        { color: COLORS.highlight, label: '测试集 (当前折)' },
        { color: COLORS.primary, label: '训练集' },
        { color: COLORS.success, label: '已完成折' },
      ]}
      renderViz={({ current }) => {
        const stripY = PAD + 30
        const stripH = 32
        const cellW = (W - PAD * 2) / N_SAMPLES
        const barX = PAD + 20
        const barY = stripY + stripH + 50
        const barMaxH = H - barY - PAD - 30
        const barW = Math.min(40, (W - PAD * 2 - 40) / current.k - 8)

        return (
          <VizCard>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
              <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxWidth: W }}>
                <text x={PAD} y={PAD + 10} fontSize="11" fill="var(--text-secondary)" fontWeight="600">数据分折</text>
                {Array.from({ length: N_SAMPLES }, (_, i) => {
                  const fold = current.assignments[i]
                  const isTest = current.trainMask && !current.trainMask[i]
                  let fill = FOLD_COLORS[fold % FOLD_COLORS.length]
                  let opacity = 0.6
                  if (isTest) { fill = COLORS.highlight; opacity = 0.9 }
                  else if (current.trainMask) { opacity = 0.4 }
                  return (
                    <g key={i}>
                      <rect x={PAD + i * cellW + 1} y={stripY} width={cellW - 2} height={stripH} fill={fill} opacity={opacity} rx="3" />
                      <text x={PAD + i * cellW + cellW / 2} y={stripY + stripH + 14} textAnchor="middle" fontSize="7" fill="var(--text-tertiary)">{i + 1}</text>
                    </g>
                  )
                })}
                {current.currentFold >= 0 && (
                  <g>
                    <text x={W / 2} y={stripY + stripH + 32} textAnchor="middle" fontSize="12" fill={COLORS.highlight} fontWeight="600">折 {current.currentFold + 1} / {current.k}</text>
                  </g>
                )}

                <text x={PAD} y={barY - 10} fontSize="11" fill="var(--text-secondary)" fontWeight="600">各折得分</text>
                {current.foldResults.map((r, i) => {
                  const x = barX + i * (barW + 8)
                  const bh = r.score * barMaxH
                  const isBest = current.phase === 'done' && r.fold === current.bestFold
                  return (
                    <g key={i}>
                      <rect x={x} y={barY + barMaxH - bh} width={barW} height={bh} fill={isBest ? COLORS.success : COLORS.primary} opacity="0.8" rx="4" />
                      <text x={x + barW / 2} y={barY + barMaxH - bh - 6} textAnchor="middle" fontSize="9" fill="var(--text-primary)" fontWeight="600">{r.score.toFixed(3)}</text>
                      <text x={x + barW / 2} y={barY + barMaxH + 14} textAnchor="middle" fontSize="9" fill="var(--text-tertiary)">F{r.fold}</text>
                    </g>
                  )
                })}
                {current.phase === 'done' && current.meanScore !== undefined && (
                  <g>
                    <line x1={barX - 5} y1={barY + barMaxH - current.meanScore * barMaxH} x2={barX + current.k * (barW + 8)} y2={barY + barMaxH - current.meanScore * barMaxH} stroke={COLORS.highlight} strokeWidth="1.5" strokeDasharray="5 3" />
                    <text x={barX + current.k * (barW + 8) + 5} y={barY + barMaxH - current.meanScore * barMaxH + 4} fontSize="9" fill={COLORS.highlight}>μ={current.meanScore.toFixed(3)}</text>
                  </g>
                )}
              </svg>
              <div style={{ display: 'flex', gap: 12, fontSize: 12, color: 'var(--text-secondary)' }}>
                <span>当前折: <b>{current.currentFold >= 0 ? current.currentFold + 1 : '-'}</b></span>
                {current.meanScore !== undefined && <span>均值: <b>{current.meanScore.toFixed(3)}</b></span>}
                {current.stdScore !== undefined && <span>标准差: <b>{current.stdScore.toFixed(3)}</b></span>}
              </div>
            </div>
          </VizCard>
        )
      }}
    />
  )
}
