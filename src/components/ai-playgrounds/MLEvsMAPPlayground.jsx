import { useCallback, useMemo } from 'react'
import PlaygroundShell from '../playgrounds/PlaygroundShell'
import VizCard from '../playgrounds/VizCard'

const W = 520
const H = 320
const PAD = 36
const COLORS = { primary: '#8b5cf6', secondary: '#f472b6', highlight: '#f97316', error: '#ef4444', tertiary: '#38bdf8', quaternary: '#fbbf24' }

const FLIPS = ['H', 'T', 'H', 'H', 'T', 'H', 'H', 'H', 'T', 'H']

function betaDensity(x, a, b) {
  if (x <= 0 || x >= 1) return 0
  const logB = lgamma(a) + lgamma(b) - lgamma(a + b)
  return Math.exp((a - 1) * Math.log(x) + (b - 1) * Math.log(1 - x) - logB)
}

function lgamma(x) {
  // eslint-disable-next-line no-loss-of-precision
  const c = [76.18009172947146, -86.50532032941677, 24.01409824083091,
    -1.231739572450155, 0.001208650973866179, -0.000005395239384953]
  let y = x, tmp = x + 5.5
  tmp -= (x + 0.5) * Math.log(tmp)
  let ser = 1.000000000190015
  for (let j = 0; j < 6; j++) ser += c[j] / ++y
  // eslint-disable-next-line no-loss-of-precision
  return -tmp + Math.log(2.5066282746310005 * ser / x)
}

function computeSteps({ priorA, priorB }) {
  const steps = []
  let heads = 0
  let tails = 0

  // Prior
  steps.push({
    description: `先验分布: Beta(${priorA}, ${priorB})`,
    priorA, priorB, postA: priorA, postB: priorB, heads: 0, tails: 0, flipIndex: -1, flip: '',
    mle: 0.5, map: (priorA - 1) / Math.max(priorA + priorB - 2, 0.01),
  })

  for (let i = 0; i < FLIPS.length; i++) {
    const isH = FLIPS[i] === 'H'
    if (isH) heads++; else tails++
    const postA = priorA + heads
    const postB = priorB + tails
    const mle = heads / (heads + tails)
    const map = (postA - 1) / Math.max(postA + postB - 2, 0.01)

    steps.push({
      description: `第 ${i + 1} 次投掷: ${FLIPS[i]}, 后验 Beta(${postA}, ${postB})`,
      priorA, priorB, postA, postB, heads, tails, flipIndex: i, flip: FLIPS[i],
      mle, map,
    })
  }

  return steps
}

export default function MLEvsMAPPlayground() {
  const presets = useMemo(() => [
    { id: 'uniform', label: '均匀先验 Beta(1,1)', state: { priorA: 1, priorB: 1 } },
    { id: 'beta22', label: 'Beta(2,2) 先验', state: { priorA: 2, priorB: 2 } },
    { id: 'beta51', label: 'Beta(5,1) 先验', state: { priorA: 5, priorB: 1 } },
  ], [])

  const computeStepsFn = useCallback(state => computeSteps(state), [])

  return (
    <PlaygroundShell
      initialState={{ priorA: 1, priorB: 1 }}
      presets={presets}
      derivePayload={s => s}
      computeSteps={computeStepsFn}
      legend={[
        { color: '#94a3b8', label: '先验分布' },
        { color: '#8b5cf6', label: '后验分布' },
        { color: '#f97316', label: 'MLE 估计' },
        { color: '#38bdf8', label: 'MAP 估计' },
      ]}
      renderViz={({ current }) => {
        const { priorA, priorB, postA, postB, mle, map } = current
        const N = 100
        const xVals = Array.from({ length: N }, (_, i) => (i + 0.5) / N)
        const priorYVals = xVals.map(x => betaDensity(x, priorA, priorB))
        const postYVals = xVals.map(x => betaDensity(x, postA, postB))
        const maxY = Math.max(...priorYVals, ...postYVals, 0.01)
        const chartL = PAD + 20, chartR = W - PAD - 10
        const chartT = PAD + 10, chartB = H - PAD - 10
        const cw = chartR - chartL, ch = chartB - chartT

        const toPath = (yVals) => yVals.map((y, i) => {
          const px = chartL + (i / (N - 1)) * cw
          const py = chartB - (y / maxY) * ch
          return `${i === 0 ? 'M' : 'L'}${px.toFixed(1)},${py.toFixed(1)}`
        }).join(' ')

        return (
          <VizCard>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxWidth: W }}>
                <rect x={PAD} y={PAD} width={W - PAD * 2} height={H - PAD * 2} fill="rgba(139,92,246,0.05)" rx="8" />
                {/* Axes */}
                <line x1={chartL} y1={chartB} x2={chartR} y2={chartB} stroke="var(--border)" strokeWidth="1" />
                <line x1={chartL} y1={chartT} x2={chartL} y2={chartB} stroke="var(--border)" strokeWidth="1" />
                {[0, 0.25, 0.5, 0.75, 1].map(v => (
                  <g key={v}>
                    <text x={chartL + v * cw} y={chartB + 14} textAnchor="middle" fontSize="8" fill="var(--text-tertiary)">{v}</text>
                    <line x1={chartL + v * cw} y1={chartB} x2={chartL + v * cw} y2={chartB + 4} stroke="var(--border)" strokeWidth="1" />
                  </g>
                ))}
                <text x={chartL + cw / 2} y={chartB + 26} textAnchor="middle" fontSize="9" fill="var(--text-tertiary)">θ (正面概率)</text>
                {/* Prior curve (dashed) */}
                <path d={toPath(priorYVals)} fill="none" stroke="#94a3b8" strokeWidth="2" strokeDasharray="6 4" opacity="0.7" />
                {/* Posterior curve (solid) */}
                <path d={toPath(postYVals)} fill="none" stroke={COLORS.primary} strokeWidth="2.5" />
                <path d={`${toPath(postYVals)} L${chartR},${chartB} L${chartL},${chartB} Z`} fill={COLORS.primary} opacity="0.08" />
                {/* MLE line */}
                <line x1={chartL + mle * cw} y1={chartT} x2={chartL + mle * cw} y2={chartB}
                  stroke={COLORS.highlight} strokeWidth="2" strokeDasharray="8 4" />
                <text x={chartL + mle * cw} y={chartT - 4} textAnchor="middle" fontSize="8" fill={COLORS.highlight} fontWeight="600">
                  MLE={mle.toFixed(2)}
                </text>
                {/* MAP line */}
                {postA > 1 && postB > 1 && (
                  <>
                    <line x1={chartL + map * cw} y1={chartT} x2={chartL + map * cw} y2={chartB}
                      stroke={COLORS.tertiary} strokeWidth="2" strokeDasharray="4 4" />
                    <text x={chartL + map * cw} y={chartT + 10} textAnchor="middle" fontSize="8" fill={COLORS.tertiary} fontWeight="600">
                      MAP={map.toFixed(2)}
                    </text>
                  </>
                )}
                {/* Flip indicator */}
                {current.flipIndex >= 0 && (
                  <text x={W - PAD - 10} y={PAD + 24} textAnchor="end" fontSize="11" fontWeight="700"
                    fill={current.flip === 'H' ? COLORS.highlight : COLORS.tertiary}>
                    {current.flip === 'H' ? '正面 H' : '反面 T'}
                  </text>
                )}
              </svg>
              <div style={{ display: 'flex', gap: 12, fontSize: 12, color: 'var(--text-secondary)', flexWrap: 'wrap' }}>
                <span>投掷: <b>{current.heads + current.tails}</b></span>
                <span>H/T: <b>{current.heads}/{current.tails}</b></span>
                <span>MLE: <b>{current.mle.toFixed(3)}</b></span>
                <span>MAP: <b>{current.map.toFixed(3)}</b></span>
                <span>后验: <b>Beta({current.postA},{current.postB})</b></span>
              </div>
            </div>
          </VizCard>
        )
      }}
    />
  )
}
