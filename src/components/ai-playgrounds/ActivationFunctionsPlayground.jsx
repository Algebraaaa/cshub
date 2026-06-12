import { useCallback, useMemo } from 'react'
import PlaygroundShell from '../playgrounds/PlaygroundShell'
import VizCard from '../playgrounds/VizCard'

const W = 520, H = 320, PAD = 36
const COLORS = { sigmoid: '#8b5cf6', tanh: '#38bdf8', relu: '#f97316', leaky: '#f472b6', gelu: '#22c55e' }

const FUNCS = {
  sigmoid: { fn: x => 1 / (1 + Math.exp(-x)), dfn: s => s * (1 - s), range: [-6, 6], label: 'Sigmoid', color: COLORS.sigmoid, outRange: '(0, 1)', dAt0: '0.25', vanish: '高', dead: '无' },
  tanh: { fn: Math.tanh, dfn: s => 1 - s * s, range: [-4, 4], label: 'Tanh', color: COLORS.tanh, outRange: '(-1, 1)', dAt0: '1.0', vanish: '中', dead: '无' },
  relu: { fn: x => Math.max(0, x), dfn: (s, x) => x > 0 ? 1 : 0, range: [-4, 4], label: 'ReLU', color: COLORS.relu, outRange: '[0, ∞)', dAt0: '0 (未定义)', vanish: '低', dead: '高 (x<0)' },
  leaky: { fn: x => x > 0 ? x : 0.1 * x, dfn: (_, x) => x > 0 ? 1 : 0.1, range: [-4, 4], label: 'LeakyReLU', color: COLORS.leaky, outRange: '(-∞, ∞)', dAt0: '0.1', vanish: '低', dead: '低' },
  gelu: { fn: x => x * 0.5 * (1 + Math.tanh(Math.sqrt(2 / Math.PI) * (x + 0.044715 * x * x * x))), dfn: (_, x) => { const t = Math.tanh(Math.sqrt(2 / Math.PI) * (x + 0.044715 * x ** 3)); return 0.5 * (1 + t) + x * 0.5 * (1 - t * t) * Math.sqrt(2 / Math.PI) * (1 + 3 * 0.044715 * x * x) }, range: [-4, 4], label: 'GELU', color: COLORS.gelu, outRange: '(-0.17, ∞)', dAt0: '0.5', vanish: '低', dead: '无' },
}

function buildCurve(key, xMin, xMax) {
  const f = FUNCS[key]
  const pts = [], dpts = []
  const step = (xMax - xMin) / 120
  let yMin = Infinity, yMax = -Infinity, dyMin = Infinity, dyMax = -Infinity
  for (let x = xMin; x <= xMax; x += step) {
    const y = f.fn(x)
    const dy = f.dfn(y, x)
    pts.push({ x, y }); dpts.push({ x, y: dy })
    if (y < yMin) yMin = y; if (y > yMax) yMax = y
    if (dy < dyMin) dyMin = dy; if (dy > dyMax) dyMax = dy
  }
  return { pts, dpts, yRange: [yMin - 0.1, yMax + 0.1], dyRange: [Math.min(dyMin - 0.05, -0.1), dyMax + 0.1] }
}

function sx(x, range) { return PAD + (x - range[0]) / (range[1] - range[0]) * (W - PAD * 2) }
function sy(y, range, top, height) { return top + height - (y - range[0]) / (range[1] - range[0]) * height }

function computeSteps({ keys }) {
  const steps = []
  keys.forEach((key, idx) => {
    const f = FUNCS[key]
    const curve = buildCurve(key, f.range[0], f.range[1])
    steps.push({
      description: `${idx + 1}. ${f.label}: 输出范围 ${f.outRange}, f'(0)=${f.dAt0}`,
      key, curve, info: f, phase: 'single',
    })
  })
  // Final comparison step
  steps.push({
    description: '对比: 所有激活函数曲线叠加',
    keys, phase: 'compare',
    curves: keys.map(k => ({ key: k, ...buildCurve(k, FUNCS[k].range[0], FUNCS[k].range[1]), info: FUNCS[k] })),
  })
  return steps
}

export default function ActivationFunctionsPlayground() {
  const presets = useMemo(() => [
    { id: 'all', label: '全部对比', state: { keys: ['sigmoid', 'tanh', 'relu', 'leaky', 'gelu'] } },
    { id: 'sig_relu', label: 'Sigmoid vs ReLU', state: { keys: ['sigmoid', 'relu'] } },
    { id: 'leaky', label: 'Leaky 变体', state: { keys: ['relu', 'leaky', 'gelu'] } },
  ], [])

  const computeStepsFn = useCallback(state => computeSteps(state), [])

  return (
    <PlaygroundShell
      initialState={{ keys: ['sigmoid', 'tanh', 'relu', 'leaky', 'gelu'] }}
      presets={presets}
      derivePayload={s => s}
      computeSteps={computeStepsFn}
      legend={Object.values(FUNCS).map(f => ({ color: f.color, label: f.label }))}
      renderViz={({ current }) => {
        if (current.phase === 'compare') {
          return (
            <VizCard>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxWidth: W }}>
                  {/* Axes */}
                  <line x1={PAD} y1={H / 2} x2={W - PAD} y2={H / 2} stroke="var(--border)" strokeWidth="1" />
                  <line x1={W / 2} y1={PAD} x2={W / 2} y2={H - PAD} stroke="var(--border)" strokeWidth="1" />
                  {current.curves.map(c => {
                    const xRange = [-4, 4]
                    const yRange = [-1.5, 2.5]
                    const pathD = c.pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${sx(p.x, xRange)},${sy(p.y, yRange, PAD, H - PAD * 2)}`).join('')
                    return <path key={c.key} d={pathD} fill="none" stroke={c.info.color} strokeWidth="2.5" opacity="0.85" />
                  })}
                  <text x={W - PAD + 5} y={H / 2 + 4} fontSize="10" fill="var(--text-tertiary)">x</text>
                  <text x={W / 2 + 5} y={PAD - 5} fontSize="10" fill="var(--text-tertiary)">f(x)</text>
                </svg>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
                  {current.curves.map(c => (
                    <div key={c.key} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--text-secondary)' }}>
                      <span style={{ width: 10, height: 10, borderRadius: '50%', background: c.info.color, display: 'inline-block' }} />
                      {c.info.label}
                    </div>
                  ))}
                </div>
              </div>
            </VizCard>
          )
        }
        // Single function view
        const { curve, info, key } = current
        const xRange = info.range
        const chartH = (H - PAD * 2 - 20) / 2
        const topChart = PAD
        const botChart = PAD + chartH + 20
        const pathMain = curve.pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${sx(p.x, xRange)},${sy(p.y, curve.yRange, topChart, chartH)}`).join('')
        const pathDeriv = curve.dpts.map((p, i) => `${i === 0 ? 'M' : 'L'}${sx(p.x, xRange)},${sy(p.y, curve.dyRange, botChart, chartH)}`).join('')
        return (
          <VizCard>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxWidth: W }}>
                {/* Top chart: function */}
                <line x1={PAD} y1={topChart + chartH} x2={W - PAD} y2={topChart + chartH} stroke="var(--border)" strokeWidth="0.5" />
                <path d={pathMain} fill="none" stroke={info.color} strokeWidth="2.5" />
                <text x={PAD - 5} y={topChart + 12} textAnchor="end" fontSize="10" fill="var(--text-tertiary)">f(x)</text>
                <text x={W / 2} y={topChart - 4} textAnchor="middle" fontSize="12" fill={info.color} fontWeight="700">{info.label}</text>
                {/* Bottom chart: derivative */}
                <line x1={PAD} y1={botChart + chartH} x2={W - PAD} y2={botChart + chartH} stroke="var(--border)" strokeWidth="0.5" />
                <path d={pathDeriv} fill="none" stroke={info.color} strokeWidth="2" strokeDasharray="6,3" opacity="0.7" />
                <text x={PAD - 5} y={botChart + 12} textAnchor="end" fontSize="10" fill="var(--text-tertiary)">f'(x)</text>
                {/* Dead zone highlight for ReLU */}
                {key === 'relu' && (
                  <rect x={sx(-4, xRange)} y={topChart} width={sx(0, xRange) - sx(-4, xRange)} height={chartH}
                    fill={COLORS.negative} opacity="0.08" rx="4" />
                )}
                {/* Axes */}
                <line x1={sx(0, xRange)} y1={topChart} x2={sx(0, xRange)} y2={botChart + chartH} stroke="var(--border)" strokeWidth="0.5" />
              </svg>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 5, width: '100%', maxWidth: 480 }}>
                <InfoBox label="函数" value={info.label} />
                <InfoBox label="输出范围" value={info.outRange} />
                <InfoBox label="f'(0)" value={info.dAt0} />
                <InfoBox label="梯度消失" value={info.vanish} />
                <InfoBox label="死神经元" value={info.dead} />
              </div>
            </div>
          </VizCard>
        )
      }}
    />
  )
}

function InfoBox({ label, value }) {
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '5px 6px', textAlign: 'center' }}>
      <div style={{ fontSize: 9, color: 'var(--text-tertiary)', marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 11, fontFamily: 'monospace', fontWeight: 600, color: 'var(--text-primary)' }}>{value}</div>
    </div>
  )
}
