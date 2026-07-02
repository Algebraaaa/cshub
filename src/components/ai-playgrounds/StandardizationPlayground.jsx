import { useCallback, useMemo } from 'react'
import PlaygroundShell from '../playgrounds/PlaygroundShell'
import VizCard from '../playgrounds/VizCard'

const W = 520
const H = 320
const PAD = 36
const COLORS = { primary: '#8b5cf6', secondary: '#f472b6', highlight: '#f97316', tertiary: '#38bdf8', success: '#22c55e' }

const PRESETS_DATA = {
  normal: [2.1, 2.5, 3.0, 3.2, 3.5, 3.8, 4.0, 4.1, 4.3, 4.5, 4.6, 4.8, 5.0, 5.2, 5.4, 5.5, 5.7, 6.0, 6.3, 6.8, 7.2, 7.8, 3.3, 4.9, 5.1],
  skewed: [1.0, 1.2, 1.3, 1.5, 1.6, 1.8, 2.0, 2.1, 2.2, 2.3, 2.5, 2.8, 3.0, 3.3, 3.8, 4.5, 5.5, 7.0, 9.0, 12.0, 1.1, 1.4, 1.7, 2.4, 3.5],
  multimodal: [1.0, 1.2, 1.5, 1.8, 2.0, 4.5, 4.8, 5.0, 5.2, 5.5, 8.0, 8.3, 8.5, 8.8, 9.0, 1.3, 1.6, 4.6, 5.1, 8.2, 8.6, 9.2, 1.1, 5.3, 8.1],
}

function mean(arr) { return arr.reduce((a, b) => a + b, 0) / arr.length }
function std(arr) { const m = mean(arr); return Math.sqrt(arr.reduce((s, v) => s + (v - m) ** 2, 0) / arr.length) }

function computeSteps({ dataKey }) {
  const raw = PRESETS_DATA[dataKey]
  const m = mean(raw)
  const s = std(raw)
  const mn = Math.min(...raw)
  const mx = Math.max(...raw)
  const zScores = raw.map(v => (v - m) / s)
  const minMax = raw.map(v => (v - mn) / (mx - mn))
  const steps = []

  steps.push({ description: '原始数据分布：显示所有数据点及均值/标准差', phase: 'raw', raw, zScores, minMax, m, s, mn, mx, highlightIdx: -1 })

  for (let i = 0; i < raw.length; i += 5) {
    const end = Math.min(i + 5, raw.length)
    steps.push({ description: `计算 z-score: z = (x - μ) / σ，处理第 ${i + 1}-${end} 个数据点`, phase: 'zscore', raw, zScores, minMax, m, s, mn, mx, highlightRange: [i, end] })
  }

  steps.push({ description: 'z-score 标准化完成：均值=0，标准差=1', phase: 'zscore-done', raw, zScores, minMax, m, s, mn, mx, highlightRange: null })

  for (let i = 0; i < raw.length; i += 5) {
    const end = Math.min(i + 5, raw.length)
    steps.push({ description: `计算 min-max: (x - min) / (max - min)，处理第 ${i + 1}-${end} 个数据点`, phase: 'minmax', raw, zScores, minMax, m, s, mn, mx, highlightRange: [i, end] })
  }

  steps.push({ description: 'Min-Max 归一化完成：所有值映射到 [0, 1]', phase: 'done', raw, zScores, minMax, m, s, mn, mx, highlightRange: null })

  return steps
}

function DotPlot({ data, label, color, highlightRange, sx, sy }) {
  const mn = Math.min(...data)
  const mx = Math.max(...data)
  return (
    <g>
      <text x={sx((mn + mx) / 2)} y={sy(5.2)} textAnchor="middle" fontSize="10" fill="var(--text-secondary)">{label}</text>
      <line x1={sx(mn)} y1={sy(0)} x2={sx(mx)} y2={sy(0)} stroke="var(--border)" strokeWidth="1" />
      <text x={sx(mn)} y={sy(-0.5)} textAnchor="middle" fontSize="8" fill="var(--text-tertiary)">{mn.toFixed(1)}</text>
      <text x={sx(mx)} y={sy(-0.5)} textAnchor="middle" fontSize="8" fill="var(--text-tertiary)">{mx.toFixed(1)}</text>
      {data.map((v, i) => {
        const isHl = highlightRange && i >= highlightRange[0] && i < highlightRange[1]
        return <circle key={i} cx={sx(v)} cy={sy(1 + (i % 4) * 0.8)} r={isHl ? 5 : 3.5} fill={isHl ? COLORS.highlight : color} opacity={isHl ? 1 : 0.7} />
      })}
    </g>
  )
}

export default function StandardizationPlayground() {
  const presets = useMemo(() => [
    { id: 'normal', label: '正态分布', state: { dataKey: 'normal' } },
    { id: 'skewed', label: '偏态分布', state: { dataKey: 'skewed' } },
    { id: 'multimodal', label: '多峰分布', state: { dataKey: 'multimodal' } },
  ], [])

  const computeStepsFn = useCallback(state => computeSteps(state), [])

  return (
    <PlaygroundShell
      initialState={{ dataKey: 'normal' }}
      presets={presets}
      derivePayload={s => s}
      computeSteps={computeStepsFn}
      legend={[
        { color: COLORS.primary, label: '原始数据' },
        { color: COLORS.tertiary, label: 'Z-score' },
        { color: COLORS.secondary, label: 'Min-Max' },
        { color: COLORS.highlight, label: '正在变换' },
      ]}
      renderViz={({ current }) => {
        const panelW = (W - PAD * 4) / 3
        const sxRaw = v => PAD + (v - current.mn) / (current.mx - current.mn || 1) * (panelW - 10)
        const zMn = Math.min(...current.zScores)
        const zMx = Math.max(...current.zScores)
        const sxZ = v => PAD + panelW + 10 + (v - zMn) / (zMx - zMn || 1) * (panelW - 10)
        const sxMM = v => PAD + (panelW + 10) * 2 + v * (panelW - 10)
        const syDot = row => H - PAD - 30 - row * 18

        return (
          <VizCard>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
              <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxWidth: W }}>
                {[0, 1, 2].map(i => (
                  <rect key={i} x={PAD + i * (panelW + 10)} y={PAD - 10} width={panelW} height={H - PAD * 2 + 10} fill="rgba(139,92,246,0.04)" rx="6" />
                ))}
                <DotPlot data={current.raw} label="原始数据" color={COLORS.primary} highlightRange={current.phase === 'raw' || current.phase === 'zscore' ? current.highlightRange : null} sx={sxRaw} sy={syDot} />
                <DotPlot data={current.zScores} label="Z-score 标准化" color={COLORS.tertiary} highlightRange={current.phase === 'zscore-done' || current.phase === 'minmax' ? current.highlightRange : null} sx={sxZ} sy={syDot} />
                <DotPlot data={current.minMax} label="Min-Max 归一化" color={COLORS.secondary} highlightRange={current.phase === 'minmax' || current.phase === 'done' ? current.highlightRange : null} sx={sxMM} sy={syDot} />
                {current.phase === 'raw' && (
                  <g>
                    <line x1={sxRaw(current.m)} y1={PAD} x2={sxRaw(current.m)} y2={H - PAD - 20} stroke={COLORS.highlight} strokeWidth="1.5" strokeDasharray="4 3" />
                    <text x={sxRaw(current.m)} y={PAD - 2} textAnchor="middle" fontSize="9" fill={COLORS.highlight}>μ={current.m.toFixed(2)}</text>
                  </g>
                )}
              </svg>
              <div style={{ display: 'flex', gap: 12, fontSize: 12, color: 'var(--text-secondary)', flexWrap: 'wrap', justifyContent: 'center' }}>
                <span>μ: <b>{current.m.toFixed(2)}</b></span>
                <span>σ: <b>{current.s.toFixed(2)}</b></span>
                <span>min: <b>{current.mn.toFixed(2)}</b></span>
                <span>max: <b>{current.mx.toFixed(2)}</b></span>
              </div>
            </div>
          </VizCard>
        )
      }}
    />
  )
}
