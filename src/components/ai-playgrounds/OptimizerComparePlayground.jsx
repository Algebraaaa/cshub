import { useMemo, useCallback } from 'react'
import PlaygroundShell from '../playgrounds/PlaygroundShell'
import VizCard from '../playgrounds/VizCard'
import { OptVizCanvas, Axes, PathLine, contourPaths } from './OptViz2D'

// Rosenbrock-style bowl — multiple optimizer comparison on identical landscape
const fn = (x, y) => (1 - x) ** 2 + 10 * (y - x * x) ** 2
const grad = (x, y) => [
  -2 * (1 - x) - 40 * x * (y - x * x),
  20 * (y - x * x),
]
const X_RANGE = [-2, 2]
const Y_RANGE = [-1, 3]
const LEVELS = [0.5, 2, 6, 14, 30, 70]

// Multi-runner: compute one trajectory per optimizer and show them together
function computeAll({ lr }) {
  const optimizers = [
    { id: 'gd', label: 'GD', run: runGD, color: '#ef4444' },
    { id: 'momentum', label: 'Momentum', run: runMomentum, color: '#f97316' },
    { id: 'rmsprop', label: 'RMSProp', run: runRMSProp, color: '#8b5cf6' },
    { id: 'adam', label: 'Adam', run: runAdam, color: '#22d3ee' },
  ]
  const maxSteps = 60
  const all = optimizers.map((o) => ({ ...o, steps: o.run(maxSteps, lr) }))

  // Unify into single per-step snapshots where step i contains snapshot of ALL optimizers
  const outSteps = []
  for (let i = 0; i < maxSteps; i++) {
    const snapshots = all.map((o) => {
      const s = o.steps[Math.min(i, o.steps.length - 1)]
      return { id: o.id, label: o.label, color: o.color, x: s.x, y: s.y, loss: s.loss, path: s.path.slice(0, Math.min(i, s.path.length - 1) + 1) }
    })
    outSteps.push({
      description: `迭代 ${i + 1}: ` + snapshots.map((s) => `${s.label}=${s.loss.toFixed(3)}`).join(', '),
      snapshots, line: (i % 5) + 2,
    })
  }
  return outSteps
}

function runGD(n, lr) {
  let x = -1.5, y = 2.0
  const out = []
  const path = [{ x, y }]
  for (let i = 0; i < n; i++) {
    const [gx, gy] = grad(x, y)
    out.push({ x, y, loss: fn(x, y), path: path.slice() })
    x -= lr * 0.002 * gx
    y -= lr * 0.002 * gy
    path.push({ x, y })
  }
  return out
}
function runMomentum(n, lr) {
  let x = -1.5, y = 2.0, vx = 0, vy = 0, beta = 0.9
  const out = []
  const path = [{ x, y }]
  for (let i = 0; i < n; i++) {
    const [gx, gy] = grad(x, y)
    out.push({ x, y, loss: fn(x, y), path: path.slice() })
    vx = beta * vx + gx
    vy = beta * vy + gy
    x -= lr * 0.002 * vx
    y -= lr * 0.002 * vy
    path.push({ x, y })
  }
  return out
}
function runRMSProp(n, lr) {
  let x = -1.5, y = 2.0, sx = 0, sy = 0, beta = 0.9, eps = 1e-8
  const out = []
  const path = [{ x, y }]
  for (let i = 0; i < n; i++) {
    const [gx, gy] = grad(x, y)
    out.push({ x, y, loss: fn(x, y), path: path.slice() })
    sx = beta * sx + (1 - beta) * gx * gx
    sy = beta * sy + (1 - beta) * gy * gy
    x -= lr * 0.01 * gx / (Math.sqrt(sx) + eps)
    y -= lr * 0.01 * gy / (Math.sqrt(sy) + eps)
    path.push({ x, y })
  }
  return out
}
function runAdam(n, lr) {
  let x = -1.5, y = 2.0, mx = 0, my = 0, vx = 0, vy = 0, t = 0
  const b1 = 0.9, b2 = 0.999, eps = 1e-8
  const out = []
  const path = [{ x, y }]
  for (let i = 0; i < n; i++) {
    const [gx, gy] = grad(x, y)
    out.push({ x, y, loss: fn(x, y), path: path.slice() })
    t++
    mx = b1 * mx + (1 - b1) * gx
    my = b1 * my + (1 - b1) * gy
    vx = b2 * vx + (1 - b2) * gx * gx
    vy = b2 * vy + (1 - b2) * gy * gy
    const mhx = mx / (1 - b1 ** t), mhy = my / (1 - b1 ** t)
    const vhx = vx / (1 - b2 ** t), vhy = vy / (1 - b2 ** t)
    x -= lr * 0.01 * mhx / (Math.sqrt(vhx) + eps)
    y -= lr * 0.01 * mhy / (Math.sqrt(vhy) + eps)
    path.push({ x, y })
  }
  return out
}

export default function OptimizerComparePlayground() {
  const compute = useCallback((s) => computeAll(s), [])
  const presets = useMemo(() => [
    { id: 'balanced', label: '标准学习率', state: { lr: 1 } },
    { id: 'fast', label: '较高学习率', state: { lr: 1.8 } },
    { id: 'slow', label: '较低学习率', state: { lr: 0.5 } },
  ], [])
  const contours = useMemo(() => contourPaths(fn, X_RANGE, Y_RANGE, LEVELS), [])

  return (
    <PlaygroundShell
      initialState={{ lr: 1 }}
      presets={presets}
      derivePayload={(s) => s}
      computeSteps={compute}
      legend={[
        { color: '#ef4444', label: 'GD' },
        { color: '#f97316', label: 'Momentum' },
        { color: '#8b5cf6', label: 'RMSProp' },
        { color: '#22d3ee', label: 'Adam' },
      ]}
      renderViz={({ current }) => (
        <VizCard>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
            <OptVizCanvas>
              <Axes xRange={X_RANGE} yRange={Y_RANGE} xLabel="w1" yLabel="w2" />
              {contours.map((d, i) => (
                <path key={i} d={d} fill="none" stroke="var(--border)" strokeWidth="0.8" opacity="0.5" />
              ))}
              {current.snapshots.map((s) => (
                <PathLine key={s.id} points={s.path} xRange={X_RANGE} yRange={Y_RANGE} color={s.color} dashed />
              ))}
              {current.snapshots.map((s) => (
                <circle
                  key={s.id}
                  cx={toSvgX(s.x, X_RANGE)}
                  cy={toSvgY(s.y, Y_RANGE)}
                  r="4.5"
                  fill={s.color}
                  stroke="white"
                  strokeWidth="1.5"
                />
              ))}
            </OptVizCanvas>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 8,
              width: '100%',
              maxWidth: 500,
            }}>
              {current.snapshots.map((s) => (
                <div key={s.id} style={{
                  background: 'var(--surface)',
                  border: `1px solid ${s.color}`,
                  borderRadius: 8,
                  padding: '6px 8px',
                  textAlign: 'center',
                }}>
                  <div style={{ fontSize: 10, color: s.color, fontWeight: 600, marginBottom: 2 }}>{s.label}</div>
                  <div style={{ fontSize: 12, fontFamily: 'monospace', color: 'var(--text-primary)' }}>{s.loss.toFixed(3)}</div>
                </div>
              ))}
            </div>
          </div>
        </VizCard>
      )}
    />
  )
}

// local helpers to avoid cyclic import weirdness
const W = 480, H = 320, PAD = 35
function toSvgX(x, r) { return PAD + (x - r[0]) / (r[1] - r[0]) * (W - 2 * PAD) }
function toSvgY(y, r) { return H - PAD - (y - r[0]) / (r[1] - r[0]) * (H - 2 * PAD) }
