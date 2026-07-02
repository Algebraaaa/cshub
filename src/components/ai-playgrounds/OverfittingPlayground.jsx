import { useMemo, useCallback } from 'react'
import PlaygroundShell from '../playgrounds/PlaygroundShell'
import VizCard from '../playgrounds/VizCard'

const W = 560
const H = 380
const PAD = 45

// ── 固定数据点 ──
const DATA = [
  { x: 0.5, y: 1.2 }, { x: 1.0, y: 2.8 }, { x: 1.5, y: 2.5 },
  { x: 2.0, y: 4.1 }, { x: 2.5, y: 3.8 }, { x: 3.0, y: 5.5 },
  { x: 3.5, y: 5.0 }, { x: 4.0, y: 7.2 }, { x: 4.5, y: 6.5 },
  { x: 5.0, y: 8.0 },
]
const X_MIN = 0
const X_MAX = 5.5
const Y_MIN = 0
const Y_MAX = 10

// 多项式拟合（最小二乘）
function polyFit(points, degree) {
  const m = degree + 1
  // 构建范德蒙矩阵
  const X = points.map(p => Array.from({ length: m }, (_, j) => Math.pow(p.x, j)))
  const Y = points.map(p => p.y)
  // (X^T X) a = X^T y
  const XtX = Array.from({ length: m }, (_, i) =>
    Array.from({ length: m }, (_, j) =>
      X.reduce((s, row) => s + row[i] * row[j], 0)
    )
  )
  const XtY = Array.from({ length: m }, (_, i) =>
    X.reduce((s, row, idx) => s + row[i] * Y[idx], 0)
  )
  // 高斯消元
  for (let col = 0; col < m; col++) {
    let maxRow = col
    for (let row = col + 1; row < m; row++) {
      if (Math.abs(XtX[row][col]) > Math.abs(XtX[maxRow][col])) maxRow = row
    }
    ;[XtX[col], XtX[maxRow]] = [XtX[maxRow], XtX[col]]
    ;[XtY[col], XtY[maxRow]] = [XtY[maxRow], XtY[col]]
    for (let row = col + 1; row < m; row++) {
      const f = XtX[row][col] / XtX[col][col]
      for (let j = col; j < m; j++) XtX[row][j] -= f * XtX[col][j]
      XtY[row] -= f * XtY[col]
    }
  }
  const a = new Array(m)
  for (let i = m - 1; i >= 0; i--) {
    a[i] = XtY[i]
    for (let j = i + 1; j < m; j++) a[i] -= XtX[i][j] * a[j]
    a[i] /= XtX[i][i]
  }
  return a
}

function polyEval(coeffs, x) {
  return coeffs.reduce((s, c, i) => s + c * Math.pow(x, i), 0)
}

function mse(coeffs, points) {
  return points.reduce((s, p) => s + (p.y - polyEval(coeffs, p.x)) ** 2, 0) / points.length
}

function computeSteps({ degree }) {
  const steps = []
  const trainData = DATA.slice(0, 7) // 前7个作为训练集
  const testData = DATA.slice(7)     // 后3个作为测试集

  // Step 1: 展示数据
  steps.push({
    description: `展示数据：${trainData.length} 个训练点 + ${testData.length} 个测试点`,
    phase: 'show_data',
    coeffs: null,
    degree: 0,
    trainData,
    testData,
    trainMSE: null,
    testMSE: null,
    allErrors: null,
  })

  // 对不同次数拟合
  const degrees = [1, 3, 5, 7, 9]
  const allErrors = []

  for (const d of degrees) {
    const coeffs = polyFit(trainData, d)
    const tMSE = mse(coeffs, trainData)
    const eMSE = mse(coeffs, testData)
    allErrors.push({ degree: d, trainMSE: tMSE, testMSE: eMSE })

    steps.push({
      description: `拟合 ${d} 次多项式：训练MSE=${tMSE.toFixed(3)}, 测试MSE=${eMSE.toFixed(3)}`,
      phase: 'fit',
      coeffs,
      degree: d,
      trainData,
      testData,
      trainMSE: tMSE,
      testMSE: eMSE,
      allErrors: [...allErrors],
    })
  }

  // 偏差-方差权衡图
  steps.push({
    description: '偏差-方差权衡：模型复杂度增加，训练误差持续下降，测试误差先降后升',
    phase: 'tradeoff',
    coeffs: polyFit(trainData, degree || 3),
    degree: degree || 3,
    trainData,
    testData,
    trainMSE: allErrors.find(e => e.degree === (degree || 3))?.trainMSE,
    testMSE: allErrors.find(e => e.degree === (degree || 3))?.testMSE,
    allErrors: [...allErrors],
  })

  const selectedLabel = degree === 1 ? '欠拟合(高偏差)' : degree === 9 ? '过拟合(高方差)' : '较好的平衡'
  steps.push({
    description: `当前选择 ${degree} 次多项式 → ${selectedLabel}`,
    phase: 'selected',
    coeffs: polyFit(trainData, degree),
    degree,
    trainData,
    testData,
    trainMSE: allErrors.find(e => e.degree === degree)?.trainMSE,
    testMSE: allErrors.find(e => e.degree === degree)?.testMSE,
    allErrors: [...allErrors],
  })

  return steps
}

function DataAndFitSVG({ trainData, testData, coeffs, degree }) {
  const plotW = W - PAD * 2
  const plotH = (H - 30) / 2 - PAD

  const sx = (x) => PAD + ((x - X_MIN) / (X_MAX - X_MIN)) * plotW
  const sy = (y, oy) => oy + plotH - ((y - Y_MIN) / (Y_MAX - Y_MIN)) * plotH

  // 拟合曲线点
  let curvePoints = null
  if (coeffs) {
    const pts = []
    for (let x = X_MIN; x <= X_MAX; x += 0.1) {
      const y = polyEval(coeffs, x)
      if (y >= Y_MIN - 2 && y <= Y_MAX + 2) pts.push({ x, y })
    }
    curvePoints = pts
  }

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxWidth: W }}>
      <rect x={PAD} y={10} width={plotW} height={plotH + 10} fill="rgba(139,92,246,0.03)" rx="4" />
      <text x={W / 2} y={22} textAnchor="middle" fontSize="11" fill="var(--text-secondary)" fontWeight="600">
        数据与拟合曲线 ({degree}次多项式)
      </text>

      {/* 轴 */}
      <line x1={PAD} y1={PAD + plotH} x2={PAD + plotW} y2={PAD + plotH} stroke="var(--border)" strokeWidth="1" />
      <line x1={PAD} y1={PAD} x2={PAD} y2={PAD + plotH} stroke="var(--border)" strokeWidth="1" />

      {/* 拟合曲线 */}
      {curvePoints && (
        <polyline
          points={curvePoints.map(p => `${sx(p.x)},${sy(p.y, PAD)}`).join(' ')}
          fill="none"
          stroke="#8b5cf6"
          strokeWidth="2"
          opacity="0.85"
        />
      )}

      {/* 训练数据点 */}
      {trainData.map((p, i) => (
        <circle key={`t${i}`} cx={sx(p.x)} cy={sy(p.y, PAD)} r="4.5" fill="#3b82f6" opacity="0.85" />
      ))}
      {/* 测试数据点 */}
      {testData.map((p, i) => (
        <circle key={`e${i}`} cx={sx(p.x)} cy={sy(p.y, PAD)} r="4.5" fill="#f97316" opacity="0.85" />
      ))}

      {/* 偏差-方差图 */}
    </svg>
  )
}

function ErrorChartSVG({ allErrors, highlightDegree }) {
  if (!allErrors || allErrors.length === 0) return null
  const cW = 560
  const cH = 160
  const cPad = 40
  const cPlotW = cW - cPad * 2
  const cPlotH = cH - cPad - 20

  const maxErr = Math.max(...allErrors.flatMap(e => [e.trainMSE, e.testMSE])) * 1.1
  const minDeg = Math.min(...allErrors.map(e => e.degree))
  const maxDeg = Math.max(...allErrors.map(e => e.degree))

  const sx = (d) => cPad + ((d - minDeg) / (maxDeg - minDeg)) * cPlotW
  const sy = (v) => 10 + cPlotH - (v / maxErr) * cPlotH

  return (
    <svg viewBox={`0 0 ${cW} ${cH}`} style={{ width: '100%', maxWidth: cW }}>
      <rect x={cPad} y={10} width={cPlotW} height={cPlotH} fill="rgba(139,92,246,0.03)" rx="4" />
      <text x={cW / 2} y={8} textAnchor="middle" fontSize="10" fill="var(--text-secondary)" fontWeight="600">训练/测试误差 vs 模型复杂度</text>
      {/* 轴 */}
      <line x1={cPad} y1={10 + cPlotH} x2={cPad + cPlotW} y2={10 + cPlotH} stroke="var(--border)" strokeWidth="1" />
      <line x1={cPad} y1={10} x2={cPad} y2={10 + cPlotH} stroke="var(--border)" strokeWidth="1" />
      <text x={cW / 2} y={cH - 2} textAnchor="middle" fontSize="9" fill="var(--text-tertiary)">多项式次数</text>

      {/* 训练误差线 */}
      <polyline
        points={allErrors.map(e => `${sx(e.degree)},${sy(e.trainMSE)}`).join(' ')}
        fill="none" stroke="#3b82f6" strokeWidth="2"
      />
      {/* 测试误差线 */}
      <polyline
        points={allErrors.map(e => `${sx(e.degree)},${sy(e.testMSE)}`).join(' ')}
        fill="none" stroke="#ef4444" strokeWidth="2" strokeDasharray="6,3"
      />

      {/* 数据点 */}
      {allErrors.map(e => (
        <g key={e.degree}>
          <circle cx={sx(e.degree)} cy={sy(e.trainMSE)} r="4" fill="#3b82f6" />
          <circle cx={sx(e.degree)} cy={sy(e.testMSE)} r="4" fill="#ef4444" />
          {e.degree === highlightDegree && (
            <line x1={sx(e.degree)} y1={10} x2={sx(e.degree)} y2={10 + cPlotH} stroke="#8b5cf6" strokeWidth="1.5" strokeDasharray="3,3" />
          )}
          <text x={sx(e.degree)} y={10 + cPlotH + 12} textAnchor="middle" fontSize="9" fill="var(--text-tertiary)">{e.degree}</text>
        </g>
      ))}
    </svg>
  )
}

export default function OverfittingPlayground() {
  const presets = useMemo(() => [
    { id: 'under', label: '欠拟合(1次)', state: { degree: 1 } },
    { id: 'good', label: '合适(3次)', state: { degree: 3 } },
    { id: 'over', label: '过拟合(9次)', state: { degree: 9 } },
  ], [])

  const computeStepsFn = useCallback(state => computeSteps(state), [])

  return (
    <PlaygroundShell
      initialState={{ degree: 3 }}
      presets={presets}
      derivePayload={s => s}
      computeSteps={computeStepsFn}
      legend={[
        { color: '#3b82f6', label: '训练集' },
        { color: '#f97316', label: '测试集' },
        { color: '#8b5cf6', label: '拟合曲线' },
        { color: '#ef4444', label: '测试误差' },
      ]}
      renderViz={({ current }) => (
        <VizCard>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <DataAndFitSVG
              trainData={current.trainData}
              testData={current.testData}
              coeffs={current.coeffs}
              degree={current.degree}
            />
            <ErrorChartSVG
              allErrors={current.allErrors}
              highlightDegree={current.degree}
            />
            {current.trainMSE !== null && current.testMSE !== null && (
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                <span style={{ fontSize: 12, color: '#3b82f6' }}>训练MSE: <b>{current.trainMSE.toFixed(3)}</b></span>
                <span style={{ fontSize: 12, color: '#ef4444' }}>测试MSE: <b>{current.testMSE.toFixed(3)}</b></span>
              </div>
            )}
          </div>
        </VizCard>
      )}
    />
  )
}
