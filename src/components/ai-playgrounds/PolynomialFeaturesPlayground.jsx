import { useCallback, useMemo } from 'react'
import PlaygroundShell from '../playgrounds/PlaygroundShell'
import VizCard from '../playgrounds/VizCard'

const W = 520
const H = 320
const PAD = 36
const COLORS = { primary: '#8b5cf6', secondary: '#f472b6', highlight: '#f97316', error: '#ef4444', tertiary: '#38bdf8', success: '#22c55e' }
const X_RANGE = [-3, 3]
const Y_RANGE = [-3, 3]

const DATA = []
for (let i = 0; i < 18; i++) {
  const angle = (i / 18) * Math.PI * 2
  const r = i < 9 ? 0.8 + Math.random() * 0.3 : 1.8 + Math.random() * 0.4
  DATA.push({ x: r * Math.cos(angle) + 0.1 * (i % 3 - 1), y: r * Math.sin(angle) + 0.1 * (i % 2 - 0.5), label: i < 9 ? 0 : 1 })
}

function sx(x) { return PAD + (x - X_RANGE[0]) / (X_RANGE[1] - X_RANGE[0]) * (W - PAD * 2) }
function sy(y) { return H - PAD - (y - Y_RANGE[0]) / (Y_RANGE[1] - Y_RANGE[0]) * (H - PAD * 2) }

function polyFeatures(deg) {
  const features = []
  for (let i = 0; i <= deg; i++) {
    for (let j = 0; j <= deg - i; j++) {
      if (i === 0 && j === 0) continue
      features.push({ i, j, name: i === 0 ? `y^${j}` : j === 0 ? `x^${i}` : `x^${i}y^${j}` })
    }
  }
  return features
}

function computeSteps({ degree }) {
  const steps = []
  const features = polyFeatures(degree)
  const nParams = features.length + 1

  steps.push({ description: '二维数据点：内圈(蓝)和外圈(粉)两类，线性边界无法分开', phase: 'data', degree, features, accuracy: 0.5, nParams, boundaryPoints: null })

  if (degree === 1) {
    // Linear boundary - a line that fails
    steps.push({ description: '尝试线性边界 (degree=1): 直线无法分离圆形分布', phase: 'linear-fail', degree, features, accuracy: 0.55, nParams, boundaryPoints: 'linear' })
    steps.push({ description: '线性模型准确率仅 55%，无法处理非线性边界', phase: 'fail-result', degree, features, accuracy: 0.55, nParams, boundaryPoints: 'linear' })
  } else {
    steps.push({ description: `生成 ${features.length} 个多项式特征 (degree=${degree})`, phase: 'generate', degree, features, accuracy: 0.55, nParams, boundaryPoints: null })

    steps.push({ description: `使用多项式特征拟合模型...`, phase: 'fit', degree, features, accuracy: 0.7, nParams, boundaryPoints: null })

    const acc = degree === 2 ? 0.92 : 0.97
    const gridRes = 30
    const boundaryPts = []
    for (let gi = 0; gi <= gridRes; gi++) {
      const angle = (gi / gridRes) * Math.PI * 2
      const r = degree === 2 ? 1.3 : 1.3 + 0.1 * Math.sin(angle * degree)
      boundaryPts.push({ x: r * Math.cos(angle), y: r * Math.sin(angle) })
    }
    steps.push({ description: `决策边界绘制完成：非线性边界分离两类`, phase: 'boundary', degree, features, accuracy: acc, nParams, boundaryPoints: boundaryPts })

    const linearAcc = 0.55
    steps.push({ description: `对比: 线性模型 ${linearAcc * 100}% → degree=${degree} 多项式 ${(acc * 100).toFixed(0)}%，提升 ${((acc - linearAcc) * 100).toFixed(0)}%`, phase: 'compare', degree, features, accuracy: acc, nParams, boundaryPoints: boundaryPts, linearAcc })
  }

  return steps
}

export default function PolynomialFeaturesPlayground() {
  const presets = useMemo(() => [
    { id: 'deg1', label: 'Degree 1 (线性)', state: { degree: 1 } },
    { id: 'deg2', label: 'Degree 2 (二次)', state: { degree: 2 } },
    { id: 'deg3', label: 'Degree 3 (三次)', state: { degree: 3 } },
  ], [])

  const computeStepsFn = useCallback(state => computeSteps(state), [])

  return (
    <PlaygroundShell
      initialState={{ degree: 2 }}
      presets={presets}
      derivePayload={s => s}
      computeSteps={computeStepsFn}
      legend={[
        { color: COLORS.tertiary, label: '类别 0 (内圈)' },
        { color: COLORS.secondary, label: '类别 1 (外圈)' },
        { color: COLORS.highlight, label: '决策边界' },
      ]}
      renderViz={({ current }) => {
        const gridRes = 20
        const gridCells = []
        if (current.boundaryPoints && current.boundaryPoints !== 'linear') {
          for (let gi = 0; gi < gridRes; gi++) {
            for (let gj = 0; gj < gridRes; gj++) {
              const x = X_RANGE[0] + (X_RANGE[1] - X_RANGE[0]) * gi / gridRes
              const y = Y_RANGE[0] + (Y_RANGE[1] - Y_RANGE[0]) * gj / gridRes
              const r = Math.sqrt(x * x + y * y)
              const inside = r < 1.3
              gridCells.push({ x, y, cls: inside ? 0 : 1 })
            }
          }
        }

        return (
          <VizCard>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
              <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxWidth: W }}>
                <rect x={PAD} y={PAD - 10} width={W - PAD * 2} height={H - PAD * 2 + 10} fill="rgba(139,92,246,0.03)" rx="6" />
                <line x1={PAD} y1={H - PAD} x2={W - PAD} y2={H - PAD} stroke="var(--border)" />
                <line x1={PAD} y1={PAD} x2={PAD} y2={H - PAD} stroke="var(--border)" />
                <line x1={sx(X_RANGE[0])} y1={sy(0)} x2={sx(X_RANGE[1])} y2={sy(0)} stroke="var(--border)" strokeWidth="0.5" strokeDasharray="3 3" />
                <line x1={sx(0)} y1={sy(Y_RANGE[0])} x2={sx(0)} y2={sy(Y_RANGE[1])} stroke="var(--border)" strokeWidth="0.5" strokeDasharray="3 3" />

                {gridCells.map((c, i) => (
                  <rect key={i} x={sx(c.x)} y={sy(c.y) + (Y_RANGE[1] - Y_RANGE[0]) / gridRes * (H - PAD * 2) / (Y_RANGE[1] - Y_RANGE[0]) - (H - PAD * 2) / gridRes} width={(X_RANGE[1] - X_RANGE[0]) / gridRes * (W - PAD * 2) / (X_RANGE[1] - X_RANGE[0]) + 1} height={(H - PAD * 2) / gridRes + 1} fill={c.cls === 0 ? COLORS.tertiary : COLORS.secondary} opacity="0.08" />
                ))}

                {current.boundaryPoints === 'linear' && (
                  <line x1={sx(-2)} y1={sy(-0.5)} x2={sx(2)} y2={sy(0.5)} stroke={COLORS.error} strokeWidth="2.5" strokeLinecap="round" strokeDasharray="6 4" />
                )}
                {Array.isArray(current.boundaryPoints) && current.boundaryPoints.length > 1 && (
                  <polyline
                    points={current.boundaryPoints.map(p => `${sx(p.x)},${sy(p.y)}`).join(' ') + ` ${sx(current.boundaryPoints[0].x)},${sy(current.boundaryPoints[0].y)}`}
                    fill="none" stroke={COLORS.highlight} strokeWidth="2.5" strokeLinejoin="round"
                  />
                )}

                {DATA.map((p, i) => (
                  <circle key={i} cx={sx(p.x)} cy={sy(p.y)} r="5" fill={p.label === 0 ? COLORS.tertiary : COLORS.secondary} stroke="#fff" strokeWidth="1.5" opacity="0.92" />
                ))}

                <text x={W - PAD - 4} y={PAD + 12} textAnchor="end" fontSize="11" fill="var(--text-secondary)" fontWeight="600">degree = {current.degree}</text>
                <text x={W - PAD - 4} y={PAD + 28} textAnchor="end" fontSize="10" fill="var(--text-tertiary)">{current.nParams} 个参数</text>
              </svg>
              <div style={{ display: 'flex', gap: 12, fontSize: 12, color: 'var(--text-secondary)' }}>
                <span>degree: <b>{current.degree}</b></span>
                <span>特征数: <b>{current.features.length}</b></span>
                <span>准确率: <b>{(current.accuracy * 100).toFixed(0)}%</b></span>
                <span>参数: <b>{current.nParams}</b></span>
              </div>
            </div>
          </VizCard>
        )
      }}
    />
  )
}
