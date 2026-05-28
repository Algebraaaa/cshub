import { useCallback, useMemo } from 'react'
import PlaygroundShell from '../playgrounds/PlaygroundShell'
import VizCard from '../playgrounds/VizCard'

const W = 520
const H = 320
const PAD = 36
const X_RANGE = [0, 6]
const Y_RANGE = [0, 5]

const DATA = [
  { x: 1.0, y: 1.1, label: -1 }, { x: 1.8, y: 1.4, label: -1 }, { x: 2.4, y: 1.9, label: -1 },
  { x: 3.5, y: 3.2, label: 1 }, { x: 4.1, y: 3.8, label: 1 }, { x: 5.0, y: 3.5, label: 1 },
]

function sx(x) { return PAD + (x - X_RANGE[0]) / (X_RANGE[1] - X_RANGE[0]) * (W - PAD * 2) }
function sy(y) { return H - PAD - (y - Y_RANGE[0]) / (Y_RANGE[1] - Y_RANGE[0]) * (H - PAD * 2) }
function boundaryY(x, slope, intercept) { return slope * x + intercept }

function computeSteps({ C }) {
  const targetSlope = -0.72
  const targetIntercept = 4.38
  return Array.from({ length: 14 }, (_, i) => {
    const t = i / 13
    const slope = -0.15 + (targetSlope + 0.15) * t
    const intercept = 2.75 + (targetIntercept - 2.75) * t
    const margin = (0.35 + 0.55 * t) * (C < 1 ? 1.25 : 1)
    const hingeLoss = Math.max(0, 1.4 - t * 1.25) * (C < 1 ? 0.8 : 1)
    return {
      description: `步骤 ${i + 1}: 调整分隔超平面，margin=${margin.toFixed(2)}`,
      points: DATA, slope, intercept, margin, hingeLoss, C, supportVectors: 2,
    }
  })
}

export default function SVMPlayground() {
  const presets = useMemo(() => [
    { id: 'hard', label: '硬间隔', state: { C: 10 } },
    { id: 'soft', label: '软间隔', state: { C: 0.5 } },
  ], [])

  const computeStepsFn = useCallback(state => computeSteps(state), [])

  return (
    <PlaygroundShell
      initialState={{ C: 10 }}
      presets={presets}
      derivePayload={s => s}
      computeSteps={computeStepsFn}
      legend={[
        { color: '#38bdf8', label: '负类' },
        { color: '#f472b6', label: '正类' },
        { color: '#f97316', label: '最大间隔边界' },
      ]}
      renderViz={({ current }) => {
        const y0 = boundaryY(X_RANGE[0], current.slope, current.intercept)
        const y1 = boundaryY(X_RANGE[1], current.slope, current.intercept)
        const upper0 = y0 + current.margin
        const upper1 = y1 + current.margin
        const lower0 = y0 - current.margin
        const lower1 = y1 - current.margin
        return (
          <VizCard>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
              <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxWidth: W }}>
                <rect x={PAD} y={PAD} width={W - PAD * 2} height={H - PAD * 2} fill="rgba(139,92,246,0.05)" rx="8" />
                <line x1={sx(X_RANGE[0])} y1={sy(upper0)} x2={sx(X_RANGE[1])} y2={sy(upper1)} stroke="#f97316" strokeWidth="1.5" strokeDasharray="7 6" opacity="0.8" />
                <line x1={sx(X_RANGE[0])} y1={sy(lower0)} x2={sx(X_RANGE[1])} y2={sy(lower1)} stroke="#f97316" strokeWidth="1.5" strokeDasharray="7 6" opacity="0.8" />
                <line x1={sx(X_RANGE[0])} y1={sy(y0)} x2={sx(X_RANGE[1])} y2={sy(y1)} stroke="#f97316" strokeWidth="3" strokeLinecap="round" />
                {current.points.map((p, i) => {
                  const support = i === 2 || i === 3
                  return (
                    <circle key={i} cx={sx(p.x)} cy={sy(p.y)} r={support ? 8 : 6} fill={p.label > 0 ? '#f472b6' : '#38bdf8'} stroke={support ? '#fff' : 'transparent'} strokeWidth="2" opacity="0.92" />
                  )
                })}
              </svg>
              <div style={{ display: 'flex', gap: 12, fontSize: 12, color: 'var(--text-secondary)' }}>
                <span>margin: <b>{current.margin.toFixed(2)}</b></span>
                <span>hinge: <b>{current.hingeLoss.toFixed(2)}</b></span>
                <span>C: <b>{current.C}</b></span>
              </div>
            </div>
          </VizCard>
        )
      }}
    />
  )
}
