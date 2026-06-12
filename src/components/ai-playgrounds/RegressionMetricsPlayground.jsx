import { useMemo, useCallback } from 'react'
import PlaygroundShell from '../playgrounds/PlaygroundShell'
import VizCard from '../playgrounds/VizCard'

const W = 540
const H = 360
const PAD = 50

// ── 固定数据集 ──
const PRESETS = {
  good: {
    label: '好拟合',
    trueVals: [2.0, 3.5, 5.0, 6.5, 8.0, 9.5, 11.0, 12.5, 14.0, 15.5],
    predVals: [2.1, 3.3, 5.2, 6.3, 8.2, 9.3, 11.1, 12.3, 14.2, 15.3],
  },
  bad: {
    label: '差拟合',
    trueVals: [2.0, 3.5, 5.0, 6.5, 8.0, 9.5, 11.0, 12.5, 14.0, 15.5],
    predVals: [5.0, 7.0, 3.0, 10.0, 6.0, 12.0, 8.5, 15.0, 11.0, 18.0],
  },
  overfit: {
    label: '过拟合',
    trueVals: [2.0, 3.5, 5.0, 6.5, 8.0, 9.5, 11.0, 12.5, 14.0, 15.5],
    predVals: [2.0, 3.5, 5.0, 6.5, 8.0, 9.5, 11.0, 12.5, 13.5, 17.0],
  },
}

function computeMetrics(trueVals, predVals) {
  const n = trueVals.length
  const residuals = trueVals.map((t, i) => t - predVals[i])
  const absResiduals = residuals.map(r => Math.abs(r))
  const mse = residuals.reduce((s, r) => s + r * r, 0) / n
  const mae = absResiduals.reduce((s, r) => s + r, 0) / n
  const rmse = Math.sqrt(mse)
  const meanTrue = trueVals.reduce((s, v) => s + v, 0) / n
  const ssTot = trueVals.reduce((s, v) => s + (v - meanTrue) ** 2, 0)
  const ssRes = residuals.reduce((s, r) => s + r * r, 0)
  const r2 = 1 - ssRes / ssTot
  return { residuals, absResiduals, mse, mae, rmse, r2 }
}

function computeSteps({ preset }) {
  const steps = []
  const { trueVals, predVals } = PRESETS[preset]
  const m = computeMetrics(trueVals, predVals)

  // Step 1: 展示数据
  steps.push({
    description: `展示 ${trueVals.length} 个样本的真实值与预测值`,
    phase: 'show_data',
    trueVals: [...trueVals],
    predVals: [...predVals],
    residuals: null,
    metrics: null,
    highlightIdx: -1,
  })

  // Step 2-11: 计算每个残差
  for (let i = 0; i < trueVals.length; i++) {
    steps.push({
      description: `样本 ${i + 1}: 残差 = ${trueVals[i].toFixed(1)} - ${predVals[i].toFixed(1)} = ${m.residuals[i].toFixed(2)}`,
      phase: 'residual',
      trueVals: [...trueVals],
      predVals: [...predVals],
      residuals: m.residuals.slice(0, i + 1),
      metrics: null,
      highlightIdx: i,
    })
  }

  // Step 12: 计算MSE
  steps.push({
    description: `MSE = Σ(残差²) / n = ${m.mse.toFixed(3)}`,
    phase: 'metric',
    trueVals: [...trueVals],
    predVals: [...predVals],
    residuals: [...m.residuals],
    metrics: { mse: m.mse },
    highlightIdx: -1,
  })

  // Step 13: 计算MAE
  steps.push({
    description: `MAE = Σ|残差| / n = ${m.mae.toFixed(3)}`,
    phase: 'metric',
    trueVals: [...trueVals],
    predVals: [...predVals],
    residuals: [...m.residuals],
    metrics: { mse: m.mse, mae: m.mae },
    highlightIdx: -1,
  })

  // Step 14: 计算RMSE
  steps.push({
    description: `RMSE = √MSE = √${m.mse.toFixed(3)} = ${m.rmse.toFixed(3)}`,
    phase: 'metric',
    trueVals: [...trueVals],
    predVals: [...predVals],
    residuals: [...m.residuals],
    metrics: { mse: m.mse, mae: m.mae, rmse: m.rmse },
    highlightIdx: -1,
  })

  // Step 15: 计算R²
  steps.push({
    description: `R² = 1 - SS_res/SS_tot = 1 - ${m.residuals.reduce((s, r) => s + r * r, 0).toFixed(1)}/${trueVals.reduce((s, v) => s + (v - trueVals.reduce((a, b) => a + b, 0) / trueVals.length) ** 2, 0).toFixed(1)} = ${m.r2.toFixed(3)}`,
    phase: 'metric',
    trueVals: [...trueVals],
    predVals: [...predVals],
    residuals: [...m.residuals],
    metrics: { mse: m.mse, mae: m.mae, rmse: m.rmse, r2: m.r2 },
    highlightIdx: -1,
  })

  // Step 16: 汇总
  const quality = m.r2 >= 0.95 ? '非常好的拟合' : m.r2 >= 0.7 ? '较好的拟合' : m.r2 >= 0.4 ? '一般的拟合' : '较差的拟合'
  steps.push({
    description: `汇总：MSE=${m.mse.toFixed(3)}, MAE=${m.mae.toFixed(3)}, RMSE=${m.rmse.toFixed(3)}, R²=${m.r2.toFixed(3)} → ${quality}`,
    phase: 'summary',
    trueVals: [...trueVals],
    predVals: [...predVals],
    residuals: [...m.residuals],
    metrics: { mse: m.mse, mae: m.mae, rmse: m.rmse, r2: m.r2 },
    highlightIdx: -1,
  })

  return steps
}

function ScatterSVG({ trueVals, predVals, residuals, highlightIdx }) {
  const allVals = [...trueVals, ...predVals]
  const vMin = Math.min(...allVals) - 1
  const vMax = Math.max(...allVals) + 1
  const plotW = W - PAD * 2
  const plotH = H - PAD * 2

  const sx = (v) => PAD + ((v - vMin) / (vMax - vMin)) * plotW
  const sy = (v) => PAD + plotH - ((v - vMin) / (vMax - vMin)) * plotH

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxWidth: W }}>
      {/* 背景网格 */}
      <rect x={PAD} y={PAD} width={plotW} height={plotH} fill="rgba(139,92,246,0.03)" rx="4" />
      {/* 对角线（完美预测线） */}
      <line x1={sx(vMin)} y1={sy(vMin)} x2={sx(vMax)} y2={sy(vMax)} stroke="var(--text-tertiary)" strokeWidth="1" strokeDasharray="6,4" />
      <text x={sx(vMax) - 4} y={sy(vMax) + 14} textAnchor="end" fontSize="9" fill="var(--text-tertiary)">完美预测</text>
      {/* 轴 */}
      <line x1={PAD} y1={PAD + plotH} x2={PAD + plotW} y2={PAD + plotH} stroke="var(--border)" strokeWidth="1.5" />
      <line x1={PAD} y1={PAD} x2={PAD} y2={PAD + plotH} stroke="var(--border)" strokeWidth="1.5" />
      <text x={PAD + plotW / 2} y={PAD + plotH + 30} textAnchor="middle" fontSize="12" fill="var(--text-secondary)">真实值</text>
      <text x={PAD - 30} y={PAD + plotH / 2} textAnchor="middle" fontSize="12" fill="var(--text-secondary)" transform={`rotate(-90,${PAD - 30},${PAD + plotH / 2})`}>预测值</text>

      {/* 数据点 + 误差线 */}
      {trueVals.map((t, i) => {
        const p = predVals[i]
        const isHL = i === highlightIdx
        return (
          <g key={i}>
            {/* 误差线 */}
            {residuals && i < residuals.length && (
              <line
                x1={sx(t)} y1={sy(t)} x2={sx(t)} y2={sy(p)}
                stroke="#ef4444" strokeWidth={isHL ? 2 : 1}
                opacity={isHL ? 0.9 : 0.4}
              />
            )}
            {/* 真实值点 */}
            <circle cx={sx(t)} cy={sy(t)} r={isHL ? 6 : 4} fill="#8b5cf6" opacity="0.85" />
            {/* 预测值点 */}
            <circle cx={sx(t)} cy={sy(p)} r={isHL ? 6 : 4} fill="#f97316" opacity="0.85" />
          </g>
        )
      })}
    </svg>
  )
}

export default function RegressionMetricsPlayground() {
  const presets = useMemo(() => [
    { id: 'good', label: '好拟合', state: { preset: 'good' } },
    { id: 'bad', label: '差拟合', state: { preset: 'bad' } },
    { id: 'overfit', label: '过拟合', state: { preset: 'overfit' } },
  ], [])

  const computeStepsFn = useCallback(state => computeSteps(state), [])

  return (
    <PlaygroundShell
      initialState={{ preset: 'good' }}
      presets={presets}
      derivePayload={s => s}
      computeSteps={computeStepsFn}
      legend={[
        { color: '#8b5cf6', label: '真实值' },
        { color: '#f97316', label: '预测值' },
        { color: '#ef4444', label: '残差' },
      ]}
      renderViz={({ current }) => (
        <VizCard>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <ScatterSVG
              trueVals={current.trueVals}
              predVals={current.predVals}
              residuals={current.residuals}
              highlightIdx={current.highlightIdx}
            />
            {current.metrics && (
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
                {[
                  { key: 'mse', label: 'MSE', color: '#ef4444' },
                  { key: 'mae', label: 'MAE', color: '#f59e0b' },
                  { key: 'rmse', label: 'RMSE', color: '#f97316' },
                  { key: 'r2', label: 'R²', color: '#10b981' },
                ].map(m => (
                  <div key={m.key} style={{
                    padding: '3px 10px',
                    borderRadius: 5,
                    background: current.metrics[m.key] !== undefined ? `${m.color}12` : 'var(--surface)',
                    border: current.metrics[m.key] !== undefined ? `1px solid ${m.color}40` : '1px solid var(--border)',
                    fontSize: 12,
                    color: 'var(--text-primary)',
                    transition: 'all 0.3s',
                  }}>
                    {m.label}: <b>{current.metrics[m.key] !== undefined ? current.metrics[m.key].toFixed(3) : '?'}</b>
                  </div>
                ))}
              </div>
            )}
          </div>
        </VizCard>
      )}
    />
  )
}
