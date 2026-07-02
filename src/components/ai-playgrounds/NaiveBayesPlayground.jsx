import { useCallback, useMemo } from 'react'
import PlaygroundShell from '../playgrounds/PlaygroundShell'
import VizCard from '../playgrounds/VizCard'

const W = 520
const H = 320
const PAD = 36
const X_RANGE = [0, 6]
const Y_RANGE = [0, 5]

const CLASSES = {
  balanced: [
    { x: 1.0, y: 1.2, label: 0 }, { x: 1.5, y: 1.6, label: 0 }, { x: 1.8, y: 0.9, label: 0 },
    { x: 2.2, y: 1.8, label: 0 }, { x: 4.0, y: 3.5, label: 1 }, { x: 4.5, y: 3.9, label: 1 },
    { x: 4.8, y: 3.2, label: 1 }, { x: 5.2, y: 4.1, label: 1 },
  ],
  imbalanced: [
    { x: 1.0, y: 1.2, label: 0 }, { x: 1.5, y: 1.6, label: 0 }, { x: 1.8, y: 0.9, label: 0 },
    { x: 2.2, y: 1.8, label: 0 }, { x: 2.5, y: 1.3, label: 0 }, { x: 1.3, y: 2.0, label: 0 },
    { x: 4.5, y: 3.9, label: 1 }, { x: 5.0, y: 3.5, label: 1 },
  ],
  overlapping: [
    { x: 1.5, y: 2.0, label: 0 }, { x: 2.0, y: 1.5, label: 0 }, { x: 2.5, y: 2.5, label: 0 },
    { x: 2.8, y: 2.2, label: 0 }, { x: 3.0, y: 2.8, label: 1 }, { x: 3.5, y: 3.0, label: 1 },
    { x: 3.2, y: 2.4, label: 1 }, { x: 3.8, y: 3.2, label: 1 },
  ],
}

const TEST_POINT = { x: 3.0, y: 2.5 }

function sx(x) { return PAD + (x - X_RANGE[0]) / (X_RANGE[1] - X_RANGE[0]) * (W - PAD * 2) }
function sy(y) { return H - PAD - (y - Y_RANGE[0]) / (Y_RANGE[1] - Y_RANGE[0]) * (H - PAD * 2) }

function gaussian(x, mu, sigma) {
  return (1 / (Math.sqrt(2 * Math.PI) * sigma)) * Math.exp(-0.5 * ((x - mu) / sigma) ** 2)
}

function computeSteps({ preset }) {
  const data = CLASSES[preset] || CLASSES.balanced
  const steps = []
  const c0 = data.filter(p => p.label === 0)
  const c1 = data.filter(p => p.label === 1)
  const n = data.length

  const mean0x = c0.reduce((s, p) => s + p.x, 0) / c0.length
  const mean0y = c0.reduce((s, p) => s + p.y, 0) / c0.length
  const mean1x = c1.reduce((s, p) => s + p.x, 0) / c1.length
  const mean1y = c1.reduce((s, p) => s + p.y, 0) / c1.length

  const var0x = c0.reduce((s, p) => s + (p.x - mean0x) ** 2, 0) / c0.length + 0.01
  const var0y = c0.reduce((s, p) => s + (p.y - mean0y) ** 2, 0) / c0.length + 0.01
  const var1x = c1.reduce((s, p) => s + (p.x - mean1x) ** 2, 0) / c1.length + 0.01
  const var1y = c1.reduce((s, p) => s + (p.y - mean1y) ** 2, 0) / c1.length + 0.01

  steps.push({
    description: '第1步: 展示训练数据，两类样本分布',
    phase: 'data', data, priors: null, means: null, variances: null, posteriors: null, decision: null,
  })

  const prior0 = c0.length / n
  const prior1 = c1.length / n
  steps.push({
    description: `第2步: 计算先验概率 P(A)=${prior0.toFixed(2)}, P(B)=${prior1.toFixed(2)}`,
    phase: 'prior', data, priors: { c0: prior0, c1: prior1 }, means: null, variances: null, posteriors: null, decision: null,
  })

  steps.push({
    description: `第3步: 拟合各类高斯分布 μ₀=(${mean0x.toFixed(1)},${mean0y.toFixed(1)}) μ₁=(${mean1x.toFixed(1)},${mean1y.toFixed(1)})`,
    phase: 'fit', data, priors: { c0: prior0, c1: prior1 },
    means: { c0: { x: mean0x, y: mean0y }, c1: { x: mean1x, y: mean1y } },
    variances: { c0: { x: var0x, y: var0y }, c1: { x: var1x, y: var1y } },
    posteriors: null, decision: null,
  })

  const lik0x = gaussian(TEST_POINT.x, mean0x, Math.sqrt(var0x))
  const lik0y = gaussian(TEST_POINT.y, mean0y, Math.sqrt(var0y))
  const lik1x = gaussian(TEST_POINT.x, mean1x, Math.sqrt(var1x))
  const lik1y = gaussian(TEST_POINT.y, mean1y, Math.sqrt(var1y))

  steps.push({
    description: `第4步: 计算测试点似然 P(x|A)=${(lik0x * lik0y).toExponential(2)}, P(x|B)=${(lik1x * lik1y).toExponential(2)}`,
    phase: 'likelihood', data, priors: { c0: prior0, c1: prior1 },
    means: { c0: { x: mean0x, y: mean0y }, c1: { x: mean1x, y: mean1y } },
    variances: { c0: { x: var0x, y: var0y }, c1: { x: var1x, y: var1y } },
    posteriors: null, decision: null,
  })

  const post0 = prior0 * lik0x * lik0y
  const post1 = prior1 * lik1x * lik1y
  const total = post0 + post1 + 1e-12
  const p0 = post0 / total
  const p1 = post1 / total
  const decision = p0 >= p1 ? 0 : 1

  steps.push({
    description: `第5步: 贝叶斯公式 → P(A|x)=${p0.toFixed(3)}, P(B|x)=${p1.toFixed(3)}`,
    phase: 'posterior', data, priors: { c0: prior0, c1: prior1 },
    means: { c0: { x: mean0x, y: mean0y }, c1: { x: mean1x, y: mean1y } },
    variances: { c0: { x: var0x, y: var0y }, c1: { x: var1x, y: var1y } },
    posteriors: { c0: p0, c1: p1 }, decision: null,
  })

  steps.push({
    description: `第6步: 决策 → 测试点归为 ${decision === 0 ? '类别 A' : '类别 B'}`,
    phase: 'decision', data, priors: { c0: prior0, c1: prior1 },
    means: { c0: { x: mean0x, y: mean0y }, c1: { x: mean1x, y: mean1y } },
    variances: { c0: { x: var0x, y: var0y }, c1: { x: var1x, y: var1y } },
    posteriors: { c0: p0, c1: p1 }, decision,
  })

  return steps
}

export default function NaiveBayesPlayground() {
  const presets = useMemo(() => [
    { id: 'balanced', label: '均衡类别', state: { preset: 'balanced' } },
    { id: 'imbalanced', label: '不均衡', state: { preset: 'imbalanced' } },
    { id: 'overlapping', label: '重叠分布', state: { preset: 'overlapping' } },
  ], [])

  const computeStepsFn = useCallback(state => computeSteps(state), [])

  return (
    <PlaygroundShell
      initialState={{ preset: 'balanced' }}
      presets={presets}
      derivePayload={s => s}
      computeSteps={computeStepsFn}
      legend={[
        { color: '#8b5cf6', label: '类别 A' },
        { color: '#f472b6', label: '类别 B' },
        { color: '#f97316', label: '决策边界' },
      ]}
      renderViz={({ current }) => {
        const hasGauss = current.means != null
        return (
          <VizCard>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
              <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxWidth: W }}>
                <rect x={PAD} y={PAD} width={W - PAD * 2} height={H - PAD * 2} fill="rgba(139,92,246,0.05)" rx="8" />
                {hasGauss && (
                  <>
                    <ellipse cx={sx(current.means.c0.x)} cy={sy(current.means.c0.y)}
                      rx={Math.sqrt(current.variances.c0.x) * 50} ry={Math.sqrt(current.variances.c0.y) * 50}
                      fill="rgba(139,92,246,0.1)" stroke="#8b5cf6" strokeWidth="1.5" strokeDasharray="6 4" />
                    <ellipse cx={sx(current.means.c1.x)} cy={sy(current.means.c1.y)}
                      rx={Math.sqrt(current.variances.c1.x) * 50} ry={Math.sqrt(current.variances.c1.y) * 50}
                      fill="rgba(244,114,182,0.1)" stroke="#f472b6" strokeWidth="1.5" strokeDasharray="6 4" />
                  </>
                )}
                {current.data.map((p, i) => (
                  <circle key={i} cx={sx(p.x)} cy={sy(p.y)} r="6" fill={p.label === 0 ? '#8b5cf6' : '#f472b6'} opacity="0.9" />
                ))}
                <circle cx={sx(TEST_POINT.x)} cy={sy(TEST_POINT.y)} r="7" fill="none" stroke="#fbbf24" strokeWidth="2.5" />
                {current.decision !== null && (
                  <circle cx={sx(TEST_POINT.x)} cy={sy(TEST_POINT.y)} r="12"
                    fill="none" stroke={current.decision === 0 ? '#8b5cf6' : '#f472b6'} strokeWidth="3" />
                )}
              </svg>
              <div style={{ display: 'flex', gap: 12, fontSize: 12, color: 'var(--text-secondary)', flexWrap: 'wrap', justifyContent: 'center' }}>
                <span>阶段: <b>{current.phase}</b></span>
                {current.priors && <span>P(A): <b>{current.priors.c0.toFixed(2)}</b> P(B): <b>{current.priors.c1.toFixed(2)}</b></span>}
                {current.posteriors && <span>P(A|x): <b>{current.posteriors.c0.toFixed(3)}</b> P(B|x): <b>{current.posteriors.c1.toFixed(3)}</b></span>}
                {current.decision !== null && <span>预测: <b>{current.decision === 0 ? 'A' : 'B'}</b></span>}
              </div>
            </div>
          </VizCard>
        )
      }}
    />
  )
}
