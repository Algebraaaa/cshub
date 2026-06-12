import { useMemo, useCallback } from 'react'
import PlaygroundShell from '../playgrounds/PlaygroundShell'
import VizCard from '../playgrounds/VizCard'

const W = 520
const H = 380
const PAD = 50

// ── 固定数据集 ──
const PRESETS = {
  good: {
    label: '好模型 AUC≈0.9',
    data: [
      { score: 0.95, label: 1 }, { score: 0.92, label: 1 }, { score: 0.88, label: 1 },
      { score: 0.85, label: 1 }, { score: 0.80, label: 1 }, { score: 0.78, label: 1 },
      { score: 0.72, label: 1 }, { score: 0.65, label: 1 },
      { score: 0.55, label: 0 }, { score: 0.48, label: 0 }, { score: 0.42, label: 0 },
      { score: 0.38, label: 0 }, { score: 0.35, label: 0 }, { score: 0.30, label: 0 },
      { score: 0.25, label: 0 }, { score: 0.20, label: 0 }, { score: 0.15, label: 0 },
      { score: 0.10, label: 0 }, { score: 0.05, label: 0 },
    ],
  },
  medium: {
    label: '中等模型 AUC≈0.7',
    data: [
      { score: 0.90, label: 1 }, { score: 0.82, label: 1 }, { score: 0.75, label: 1 },
      { score: 0.70, label: 1 }, { score: 0.65, label: 0 }, { score: 0.60, label: 1 },
      { score: 0.55, label: 1 }, { score: 0.50, label: 1 },
      { score: 0.48, label: 0 }, { score: 0.45, label: 0 }, { score: 0.40, label: 1 },
      { score: 0.38, label: 0 }, { score: 0.35, label: 0 }, { score: 0.30, label: 0 },
      { score: 0.25, label: 0 }, { score: 0.22, label: 0 }, { score: 0.18, label: 0 },
      { score: 0.12, label: 0 }, { score: 0.08, label: 0 },
    ],
  },
  random: {
    label: '随机模型 AUC≈0.5',
    data: [
      { score: 0.92, label: 0 }, { score: 0.85, label: 1 }, { score: 0.78, label: 0 },
      { score: 0.72, label: 1 }, { score: 0.65, label: 0 }, { score: 0.60, label: 1 },
      { score: 0.55, label: 0 }, { score: 0.50, label: 1 },
      { score: 0.48, label: 1 }, { score: 0.45, label: 0 }, { score: 0.40, label: 0 },
      { score: 0.35, label: 1 }, { score: 0.30, label: 0 }, { score: 0.25, label: 1 },
      { score: 0.20, label: 0 }, { score: 0.18, label: 1 }, { score: 0.12, label: 0 },
      { score: 0.08, label: 1 }, { score: 0.05, label: 0 },
    ],
  },
}

function computeROC(data) {
  const sorted = [...data].sort((a, b) => b.score - a.score)
  const totalP = sorted.filter(d => d.label === 1).length
  const totalN = sorted.filter(d => d.label === 0).length
  let TP = 0, FP = 0
  const points = [{ tpr: 0, fpr: 0, threshold: 1.01 }]
  for (const d of sorted) {
    if (d.label === 1) TP++
    else FP++
    points.push({
      tpr: TP / totalP,
      fpr: FP / totalN,
      threshold: d.score,
    })
  }
  // AUC via trapezoidal
  let auc = 0
  for (let i = 1; i < points.length; i++) {
    auc += (points[i].fpr - points[i - 1].fpr) * (points[i].tpr + points[i - 1].tpr) / 2
  }
  return { points, auc }
}

function computeSteps({ dataset }) {
  const steps = []
  const data = PRESETS[dataset].data
  const sorted = [...data].sort((a, b) => b.score - a.score)
  const totalP = sorted.filter(d => d.label === 1).length
  const totalN = sorted.filter(d => d.label === 0).length
  const roc = computeROC(data)

  // Step 1: 展示原始数据
  steps.push({
    description: `展示 ${data.length} 个样本的预测分数与真实标签`,
    phase: 'show_data',
    sorted,
    rocPoints: [],
    auc: null,
    currentIdx: -1,
  })

  // Step 2: 按分数降序排列
  steps.push({
    description: `按预测分数从高到低排序，共 ${totalP} 个正样本，${totalN} 个负样本`,
    phase: 'sorted',
    sorted,
    rocPoints: [],
    auc: null,
    currentIdx: -1,
  })

  // Step 3: 从最高阈值开始
  steps.push({
    description: '阈值 = +∞ 时，所有样本预测为负，TPR=0, FPR=0',
    phase: 'threshold',
    sorted,
    rocPoints: [roc.points[0]],
    auc: null,
    currentIdx: -1,
  })

  // 逐步遍历每个阈值
  let TP = 0, FP = 0
  for (let i = 0; i < sorted.length; i++) {
    const d = sorted[i]
    if (d.label === 1) TP++
    else FP++
    const tpr = TP / totalP
    const fpr = FP / totalN
    steps.push({
      description: `阈值 ≤ ${d.score.toFixed(2)}: ${d.label === 1 ? '正' : '负'}样本 → TPR=${tpr.toFixed(2)}, FPR=${fpr.toFixed(2)}`,
      phase: 'threshold',
      sorted,
      rocPoints: roc.points.slice(0, i + 2),
      auc: null,
      currentIdx: i,
    })
  }

  // 计算AUC
  steps.push({
    description: `ROC曲线绘制完成，计算 AUC = ${roc.auc.toFixed(3)}`,
    phase: 'auc',
    sorted,
    rocPoints: roc.points,
    auc: roc.auc,
    currentIdx: -1,
  })

  // 解读
  const interp = roc.auc >= 0.9 ? '优秀模型' : roc.auc >= 0.7 ? '中等模型' : '较差模型（接近随机）'
  steps.push({
    description: `AUC = ${roc.auc.toFixed(3)}，属于${interp}`,
    phase: 'interpret',
    sorted,
    rocPoints: roc.points,
    auc: roc.auc,
    currentIdx: -1,
  })

  return steps
}

function ROCSVG({ rocPoints, auc }) {
  const plotW = W - PAD * 2
  const plotH = H - PAD * 2 - 40
  const ox = PAD
  const oy = PAD + 40

  const sx = (fpr) => ox + fpr * plotW
  const sy = (tpr) => oy + plotH - tpr * plotH

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxWidth: W }}>
      {/* 坐标轴 */}
      <line x1={ox} y1={oy + plotH} x2={ox + plotW} y2={oy + plotH} stroke="var(--border)" strokeWidth="1.5" />
      <line x1={ox} y1={oy} x2={ox} y2={oy + plotH} stroke="var(--border)" strokeWidth="1.5" />
      {/* 对角线（随机分类器） */}
      <line x1={sx(0)} y1={sy(0)} x2={sx(1)} y2={sy(1)} stroke="var(--text-tertiary)" strokeWidth="1" strokeDasharray="6,4" />
      <text x={sx(0.5)} y={sy(0.5) + 14} textAnchor="middle" fontSize="10" fill="var(--text-tertiary)">随机 (AUC=0.5)</text>

      {/* 轴标签 */}
      <text x={ox + plotW / 2} y={oy + plotH + 30} textAnchor="middle" fontSize="12" fill="var(--text-secondary)">FPR (假正率)</text>
      <text x={ox - 30} y={oy + plotH / 2} textAnchor="middle" fontSize="12" fill="var(--text-secondary)" transform={`rotate(-90,${ox - 30},${oy + plotH / 2})`}>TPR (真正率)</text>
      {/* 刻度 */}
      <text x={ox} y={oy + plotH + 14} textAnchor="middle" fontSize="9" fill="var(--text-tertiary)">0</text>
      <text x={ox + plotW} y={oy + plotH + 14} textAnchor="middle" fontSize="9" fill="var(--text-tertiary)">1</text>
      <text x={ox - 10} y={oy + plotH} textAnchor="end" fontSize="9" fill="var(--text-tertiary)">0</text>
      <text x={ox - 10} y={oy + 4} textAnchor="end" fontSize="9" fill="var(--text-tertiary)">1</text>

      {/* AUC 填充 */}
      {auc !== null && rocPoints.length > 1 && (
        <polygon
          points={[
            `${sx(0)},${sy(0)}`,
            ...rocPoints.map(p => `${sx(p.fpr)},${sy(p.tpr)}`),
            `${sx(rocPoints[rocPoints.length - 1].fpr)},${sy(0)}`,
          ].join(' ')}
          fill="rgba(139,92,246,0.12)"
        />
      )}

      {/* ROC 曲线 */}
      {rocPoints.length > 1 && (
        <polyline
          points={rocPoints.map(p => `${sx(p.fpr)},${sy(p.tpr)}`).join(' ')}
          fill="none"
          stroke="#8b5cf6"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
      )}

      {/* ROC 点 */}
      {rocPoints.map((p, i) => (
        <circle key={i} cx={sx(p.fpr)} cy={sy(p.tpr)} r="3" fill="#8b5cf6" opacity="0.8" />
      ))}

      {/* AUC 值 */}
      {auc !== null && (
        <text x={ox + plotW - 10} y={oy + 20} textAnchor="end" fontSize="14" fontWeight="700" fill="#8b5cf6">
          AUC = {auc.toFixed(3)}
        </text>
      )}
    </svg>
  )
}

export default function ROCAUCPlayground() {
  const presets = useMemo(() => [
    { id: 'good', label: '好模型 AUC≈0.9', state: { dataset: 'good' } },
    { id: 'medium', label: '中等模型 AUC≈0.7', state: { dataset: 'medium' } },
    { id: 'random', label: '随机模型 AUC≈0.5', state: { dataset: 'random' } },
  ], [])

  const computeStepsFn = useCallback(state => computeSteps(state), [])

  return (
    <PlaygroundShell
      initialState={{ dataset: 'good' }}
      presets={presets}
      derivePayload={s => s}
      computeSteps={computeStepsFn}
      legend={[
        { color: '#8b5cf6', label: 'ROC 曲线' },
        { color: 'var(--text-tertiary)', label: '随机基线' },
      ]}
      renderViz={({ current }) => (
        <VizCard>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <ROCSVG rocPoints={current.rocPoints} auc={current.auc} />
            {current.currentIdx >= 0 && current.sorted && (
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center', maxWidth: W }}>
                {current.sorted.map((d, i) => (
                  <span key={i} style={{
                    padding: '1px 6px',
                    borderRadius: 3,
                    fontSize: 10,
                    background: i === current.currentIdx
                      ? (d.label === 1 ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)')
                      : 'var(--surface)',
                    border: `1px solid ${i === current.currentIdx ? (d.label === 1 ? '#10b981' : '#ef4444') : 'var(--border)'}`,
                    color: 'var(--text-secondary)',
                  }}>
                    {d.score.toFixed(2)}/{d.label === 1 ? 'P' : 'N'}
                  </span>
                ))}
              </div>
            )}
          </div>
        </VizCard>
      )}
    />
  )
}
