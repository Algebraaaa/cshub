import { useCallback, useMemo } from 'react'
import PlaygroundShell from '../playgrounds/PlaygroundShell'
import VizCard from '../playgrounds/VizCard'

const W = 520
const H = 320
const PAD = 36
const X_RANGE = [0, 6]
const Y_RANGE = [0, 5]
const COLORS = ['#8b5cf6', '#f472b6', '#38bdf8']

function makeData(k) {
  const pts = []
  if (k === 2) {
    const centers = [{ x: 2, y: 1.8 }, { x: 4.5, y: 3.5 }]
    for (let c = 0; c < 2; c++) {
      for (let i = 0; i < 7; i++) {
        const a = (i / 7) * Math.PI * 2
        const r = 0.6 + Math.sin(i * 3 + c) * 0.25
        pts.push({ x: centers[c].x + Math.cos(a) * r, y: centers[c].y + Math.sin(a) * r })
      }
    }
  } else {
    const centers = [{ x: 1.5, y: 1.5 }, { x: 4.5, y: 1.5 }, { x: 3, y: 4 }]
    for (let c = 0; c < 3; c++) {
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * Math.PI * 2
        const r = 0.5 + Math.sin(i * 2.5 + c) * 0.2
        pts.push({ x: centers[c].x + Math.cos(a) * r, y: centers[c].y + Math.sin(a) * r })
      }
    }
  }
  return pts
}

function sx(x) { return PAD + (x - X_RANGE[0]) / (X_RANGE[1] - X_RANGE[0]) * (W - PAD * 2) }
function sy(y) { return H - PAD - (y - Y_RANGE[0]) / (Y_RANGE[1] - Y_RANGE[0]) * (H - PAD * 2) }

function gaussPdf(p, mu, sigma) {
  const dx = p.x - mu.x, dy = p.y - mu.y
  const s2 = sigma * sigma
  return Math.exp(-(dx * dx + dy * dy) / (2 * s2)) / (2 * Math.PI * s2)
}

function computeSteps({ k }) {
  const data = makeData(k)
  const steps = []
  let means = k === 2
    ? [{ x: 2.5, y: 2.0 }, { x: 4.0, y: 3.0 }]
    : [{ x: 2.0, y: 2.0 }, { x: 4.0, y: 2.0 }, { x: 3.0, y: 3.0 }]
  let sigmas = new Array(k).fill(0.8)
  let weights = new Array(k).fill(1 / k)

  for (let iter = 0; iter < 4; iter++) {
    // E-step
    const resp = data.map(p => {
      const probs = means.map((mu, c) => weights[c] * gaussPdf(p, mu, sigmas[c]))
      const total = probs.reduce((s, v) => s + v, 1e-12)
      return probs.map(v => v / total)
    })

    const logLikelihood = data.reduce((s, p) => {
      const prob = means.reduce((acc, mu, c) => acc + weights[c] * gaussPdf(p, mu, sigmas[c]), 1e-12)
      return s + Math.log(prob)
    }, 0)

    steps.push({
      description: `E-step (迭代 ${iter + 1}): 计算软分配, log-likelihood=${logLikelihood.toFixed(2)}`,
      phase: 'E', data, means: means.map(m => ({ ...m })), sigmas: [...sigmas], weights: [...weights], resp, logLikelihood, k, iter,
    })

    // M-step
    for (let c = 0; c < k; c++) {
      const nk = resp.reduce((s, r) => s + r[c], 0)
      if (nk < 1e-6) continue
      means[c] = {
        x: data.reduce((s, p, i) => s + resp[i][c] * p.x, 0) / nk,
        y: data.reduce((s, p, i) => s + resp[i][c] * p.y, 0) / nk,
      }
      const variance = data.reduce((s, p, i) => {
        const dx = p.x - means[c].x, dy = p.y - means[c].y
        return s + resp[i][c] * (dx * dx + dy * dy)
      }, 0) / nk
      sigmas[c] = Math.sqrt(Math.max(variance, 0.01))
      weights[c] = nk / data.length
    }

    steps.push({
      description: `M-step (迭代 ${iter + 1}): 更新参数, weights=[${weights.map(w => w.toFixed(2)).join(', ')}]`,
      phase: 'M', data, means: means.map(m => ({ ...m })), sigmas: [...sigmas], weights: [...weights], resp, logLikelihood, k, iter,
    })
  }

  return steps
}

export default function GMMPlayground() {
  const presets = useMemo(() => [
    { id: 'k2', label: '2 个分量', state: { k: 2 } },
    { id: 'k3', label: '3 个分量', state: { k: 3 } },
  ], [])

  const computeStepsFn = useCallback(state => computeSteps(state), [])

  return (
    <PlaygroundShell
      initialState={{ k: 2 }}
      presets={presets}
      derivePayload={s => s}
      computeSteps={computeStepsFn}
      legend={[
        { color: '#8b5cf6', label: '分量 1' },
        { color: '#f472b6', label: '分量 2' },
        { color: '#38bdf8', label: '分量 3' },
      ]}
      renderViz={({ current }) => (
        <VizCard>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxWidth: W }}>
              <rect x={PAD} y={PAD} width={W - PAD * 2} height={H - PAD * 2} fill="rgba(139,92,246,0.05)" rx="8" />
              {/* Gaussian ellipses */}
              {current.means.map((mu, c) => {
                const rx = current.sigmas[c] * 2 / (X_RANGE[1] - X_RANGE[0]) * (W - PAD * 2)
                const ry = current.sigmas[c] * 2 / (Y_RANGE[1] - Y_RANGE[0]) * (H - PAD * 2)
                return (
                  <ellipse key={c} cx={sx(mu.x)} cy={sy(mu.y)} rx={rx} ry={ry}
                    fill={COLORS[c]} opacity={0.12} stroke={COLORS[c]} strokeWidth="1.5" strokeDasharray="4 3" />
                )
              })}
              {/* Data points with soft assignment colors */}
              {current.data.map((p, i) => {
                const resp = current.resp[i]
                const r = Math.round(resp[0] * 139 + (resp[1] || 0) * 244 + (resp[2] || 0) * 56)
                const g = Math.round(resp[0] * 92 + (resp[1] || 0) * 114 + (resp[2] || 0) * 223)
                const b = Math.round(resp[0] * 246 + (resp[1] || 0) * 182 + (resp[2] || 0) * 248)
                return (
                  <circle key={i} cx={sx(p.x)} cy={sy(p.y)} r="6"
                    fill={`rgb(${r},${g},${b})`} opacity="0.9" stroke="#fff" strokeWidth="1" />
                )
              })}
              {/* Mean markers */}
              {current.means.map((mu, c) => (
                <g key={`mean-${c}`}>
                  <line x1={sx(mu.x) - 6} y1={sy(mu.y)} x2={sx(mu.x) + 6} y2={sy(mu.y)} stroke={COLORS[c]} strokeWidth="2.5" />
                  <line x1={sx(mu.x)} y1={sy(mu.y) - 6} x2={sx(mu.x)} y2={sy(mu.y) + 6} stroke={COLORS[c]} strokeWidth="2.5" />
                </g>
              ))}
            </svg>
            <div style={{ display: 'flex', gap: 12, fontSize: 12, color: 'var(--text-secondary)' }}>
              <span>迭代: <b>{current.iter + 1}</b></span>
              <span>phase: <b>{current.phase}</b></span>
              <span>LL: <b>{current.logLikelihood.toFixed(1)}</b></span>
              <span>weights: <b>[{current.weights.map(w => w.toFixed(2)).join(', ')}]</b></span>
            </div>
          </div>
        </VizCard>
      )}
    />
  )
}
