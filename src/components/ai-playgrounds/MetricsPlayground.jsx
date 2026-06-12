import { useCallback, useMemo, useState } from 'react'
import PlaygroundShell from '../playgrounds/PlaygroundShell'
import VizCard from '../playgrounds/VizCard'

const CLASS_A = '#8b5cf6'
const CLASS_B = '#ef4444'
const TP_COLOR = '#10b981'
const FP_COLOR = '#f59e0b'
const FN_COLOR = '#f97316'
const TN_COLOR = '#3b82f6'

// Generate 2 score distributions (class 0 and class 1)
function generateScores(sep) {
  // sep controls class separation: 0 = totally overlapped, 1 = well separated
  const class0 = []
  const class1 = []
  for (let i = 0; i < 25; i++) {
    class0.push(0.2 + (Math.random() * 0.5) - sep * 0.1)
    class1.push(0.5 + (Math.random() * 0.5) + sep * 0.1)
  }
  return {
    class0: class0.map(s => Math.max(0, Math.min(1, s))).sort((a, b) => a - b),
    class1: class1.map(s => Math.max(0, Math.min(1, s))).sort((a, b) => a - b),
  }
}

const PRESET_DATA = {
  'well-sep': generateScores(0.4),
  'overlap': generateScores(0.1),
  'imbalanced': (() => {
    const c0 = []
    const c1 = []
    for (let i = 0; i < 40; i++) c0.push(0.15 + Math.random() * 0.45)
    for (let i = 0; i < 10; i++) c1.push(0.5 + Math.random() * 0.45)
    return { class0: c0.sort(), class1: c1.sort() }
  })(),
}

function computeSteps({ presetKey, threshold }) {
  const { class0, class1 } = PRESET_DATA[presetKey]
  const th = threshold

  const steps = []

  // Count TP, FP, TN, FN
  // class 0 = negative, class 1 = positive
  // score >= th → predict positive
  const tp = class1.filter(s => s >= th).length
  const fp = class0.filter(s => s >= th).length
  const tn = class0.filter(s => s < th).length
  const fn = class1.filter(s => s < th).length

  const accuracy = (tp + tn) / (tp + tn + fp + fn || 1)
  const precision = tp / (tp + fp || 1)
  const recall = tp / (tp + fn || 1)
  const f1 = 2 * precision * recall / (precision + recall || 1e-9)
  const specificity = tn / (tn + fp || 1)
  const fpr = fp / (fp + tn || 1)

  // Compute ROC curve (all thresholds)
  const allScores = [
    ...class0.map(s => ({ s, y: 0 })),
    ...class1.map(s => ({ s, y: 1 })),
  ].sort((a, b) => a.s - b.s)

  const roc = []
  const pr = []
  let tp2 = class1.length
  let fp2 = class0.length
  let tn2 = 0
  let fn2 = 0
  roc.push({ x: 0, y: 0 })
  pr.push({ x: 0, y: 1 })
  allScores.forEach(({ y }) => {
    if (y === 1) { tp2--; fn2++ }
    else { fp2--; tn2++ }
    const tpr = tp2 / (tp2 + fn2 || 1)
    const fpr2 = fp2 / (fp2 + tn2 || 1)
    const prec = tp2 / (tp2 + fp2 || 1)
    roc.push({ x: fpr2, y: tpr })
    pr.push({ x: tpr, y: prec })
  })

  steps.push({
    description: `阈值 θ=${th.toFixed(2)}: TP=${tp}, FP=${fp}, TN=${tn}, FN=${fn}`,
    line: 1, phase: 'eval',
    threshold: th, class0, class1, tp, fp, tn, fn,
    accuracy, precision, recall, f1, specificity, fpr,
    roc, pr,
  })

  return steps
}

function DistributionChart({ class0, class1, threshold }) {
  const W = 480
  const H = 150
  const PAD = 24
  const NBINS = 20
  const BIN_W = (W - PAD * 2) / NBINS

  const hist0 = new Array(NBINS).fill(0)
  const hist1 = new Array(NBINS).fill(0)
  class0.forEach(s => {
    const b = Math.min(NBINS - 1, Math.floor(s * NBINS))
    hist0[b]++
  })
  class1.forEach(s => {
    const b = Math.min(NBINS - 1, Math.floor(s * NBINS))
    hist1[b]++
  })
  const maxCount = Math.max(...hist0, ...hist1, 1)
  const BAR_SCALE = (H - PAD * 2 - 20) / maxCount

  function binX(b) { return PAD + b * BIN_W }

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxWidth: W }}>
      <text x={W / 2} y={14} textAnchor="middle" fontSize="11" fill="var(--text-secondary)">分类器分数分布</text>
      {/* class 0 bars */}
      {hist0.map((c, b) => c > 0 && (
        <rect key={`h0-${b}`} x={binX(b) + 1} y={H - PAD - c * BAR_SCALE}
          width={BIN_W - 2} height={c * BAR_SCALE} fill={CLASS_A} opacity="0.7" rx="1" />
      ))}
      {/* class 1 bars */}
      {hist1.map((c, b) => c > 0 && (
        <rect key={`h1-${b}`} x={binX(b) + 1} y={H - PAD - c * BAR_SCALE - 2}
          width={BIN_W - 2} height={c * BAR_SCALE} fill={CLASS_B} opacity="0.6" rx="1" />
      ))}
      {/* threshold line */}
      <line x1={PAD + threshold * (W - PAD * 2)} y1={PAD}
        x2={PAD + threshold * (W - PAD * 2)} y2={H - PAD}
        stroke="#f97316" strokeWidth="2.5" strokeDasharray="5 4" />
      <text x={PAD + threshold * (W - PAD * 2)} y={PAD - 4}
        textAnchor="middle" fontSize="10" fill="#f97316" fontWeight="600">
        θ = {threshold.toFixed(2)}
      </text>
      {/* axis */}
      <line x1={PAD} y1={H - PAD} x2={W - PAD} y2={H - PAD} stroke="var(--border)" />
      <text x={PAD} y={H - 4} textAnchor="start" fontSize="9" fill="var(--text-tertiary)">0.0</text>
      <text x={W - PAD} y={H - 4} textAnchor="end" fontSize="9" fill="var(--text-tertiary)">1.0</text>
    </svg>
  )
}

function ConfusionMatrix({ tp, fp, tn, fn }) {
  const cells = [
    { label: 'TN', val: tn, color: TN_COLOR, bg: 'rgba(59,130,246,0.15)', row: 0, col: 0 },
    { label: 'FP', val: fp, color: FP_COLOR, bg: 'rgba(245,158,11,0.15)', row: 0, col: 1 },
    { label: 'FN', val: fn, color: FN_COLOR, bg: 'rgba(249,115,22,0.15)', row: 1, col: 0 },
    { label: 'TP', val: tp, color: TP_COLOR, bg: 'rgba(16,185,129,0.15)', row: 1, col: 1 },
  ]
  const SIZE = 120
  const CELL = 54
  const GAP = 4

  return (
    <svg viewBox={`0 0 ${SIZE} ${SIZE + 30}`} style={{ width: SIZE, height: SIZE + 30 }}>
      <text x={SIZE / 2} y={12} textAnchor="middle" fontSize="11" fill="var(--text-secondary)">混淆矩阵</text>
      {/* labels */}
      <text x={CELL / 2 + 12} y={28} textAnchor="middle" fontSize="9" fill="var(--text-tertiary)">Pred 0</text>
      <text x={CELL + GAP + CELL / 2 + 12} y={28} textAnchor="middle" fontSize="9" fill="var(--text-tertiary)">Pred 1</text>
      <text x={4} y={35 + CELL / 2} textAnchor="start" fontSize="9" fill="var(--text-tertiary)">True 0</text>
      <text x={4} y={35 + CELL + GAP + CELL / 2} textAnchor="start" fontSize="9" fill="var(--text-tertiary)">True 1</text>

      {cells.map(c => (
        <g key={c.label}>
          <rect x={12 + c.col * (CELL + GAP)} y={30 + c.row * (CELL + GAP)}
            width={CELL} height={CELL} rx="6"
            fill={c.bg} stroke={c.color} strokeWidth="1.5" />
          <text x={12 + c.col * (CELL + GAP) + CELL / 2} y={30 + c.row * (CELL + GAP) + CELL / 2 - 4}
            textAnchor="middle" fontSize="10" fontWeight="600" fill={c.color}>{c.label}</text>
          <text x={12 + c.col * (CELL + GAP) + CELL / 2} y={30 + c.row * (CELL + GAP) + CELL / 2 + 12}
            textAnchor="middle" fontSize="16" fontWeight="700" fill={c.color}>{c.val}</text>
        </g>
      ))}
    </svg>
  )
}

function ROCInset({ roc, pr, fpr, recall, precision }) {
  const W = 120
  const H = 120
  const PAD = 18

  function px(x) { return PAD + x * (W - PAD * 2) }
  function py(y) { return H - PAD - y * (H - PAD * 2) }

  const rocPath = 'M' + roc.map(p => `${px(p.x)},${py(p.y)}`).join('L')
  const prPath = 'M' + pr.map(p => `${px(p.x)},${py(p.y)}`).join('L')

  return (
    <svg viewBox={`0 0 ${W * 2 + 10} ${H + 20}`} style={{ width: W * 2 + 10, height: H + 20 }}>
      {/* ROC */}
      <text x={W / 2} y={12} textAnchor="middle" fontSize="10" fill="var(--text-secondary)">ROC</text>
      <rect x={PAD} y={PAD} width={W - PAD * 2} height={H - PAD * 2} fill="var(--surface-2)" rx="4" />
      <line x1={PAD} y1={py(1)} x2={px(1)} y2={py(1)} stroke="var(--border)" strokeDasharray="2 2" />
      <path d={`M${px(0)},${py(0)}L${px(1)},${py(1)}`} fill="none" stroke="var(--border)" strokeDasharray="3 3" />
      <path d={rocPath} fill="none" stroke="#8b5cf6" strokeWidth="2" />
      <circle cx={px(fpr)} cy={py(recall)} r="4" fill="#f97316" stroke="white" strokeWidth="1.5" />

      {/* PR */}
      <text x={W + 5 + W / 2} y={12} textAnchor="middle" fontSize="10" fill="var(--text-secondary)">PR</text>
      <rect x={W + 5 + PAD} y={PAD} width={W - PAD * 2} height={H - PAD * 2} fill="var(--surface-2)" rx="4" />
      <path d={prPath} fill="none" stroke="#10b981" strokeWidth="2" />
      <circle cx={W + 5 + px(recall)} cy={py(precision)} r="4" fill="#f97316" stroke="white" strokeWidth="1.5" />
    </svg>
  )
}

function MetricChip({ label, value, color }) {
  return (
    <div style={{
      background: 'var(--surface)',
      border: `1px solid ${color}40`,
      borderRadius: 8,
      padding: '6px 10px',
      minWidth: 74,
      textAlign: 'center',
    }}>
      <div style={{ fontSize: 9, color: 'var(--text-tertiary)', marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 14, fontFamily: 'monospace', fontWeight: 700, color }}>{(value * 100).toFixed(1)}%</div>
    </div>
  )
}

export default function MetricsPlayground() {
  const [threshold, setThreshold] = useState(0.5)

  const presets = useMemo(() => [
    { id: 'well-sep', label: '分离良好', state: { presetKey: 'well-sep' } },
    { id: 'overlap', label: '高度重叠', state: { presetKey: 'overlap' } },
    { id: 'imbalanced', label: '不平衡数据', state: { presetKey: 'imbalanced' } },
  ], [])

  const computeStepsFn = useCallback(state => computeSteps({ ...state, threshold }), [threshold])

  return (
    <PlaygroundShell
      initialState={{ presetKey: 'well-sep' }}
      presets={presets}
      derivePayload={s => s}
      computeSteps={computeStepsFn}
      extraToolbar={({ setState }) => (
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-secondary)' }}>
          阈值 θ:
          <input type="range" min="0" max="1" step="0.01" value={threshold}
            onChange={(e) => {
              const v = parseFloat(e.target.value)
              setThreshold(v)
              setState(p => ({ ...p, threshold: v }))
            }}
            style={{ width: 110 }} />
          <span style={{ fontFamily: 'monospace', fontSize: 11, minWidth: 36, color: '#f97316', fontWeight: 600 }}>
            {threshold.toFixed(2)}
          </span>
        </label>
      )}
      legend={[
        { color: CLASS_A, label: '真实负类 (0)' },
        { color: CLASS_B, label: '真实正类 (1)' },
        { color: '#f97316', label: '决策阈值' },
      ]}
      renderViz={({ current }) => (
        <VizCard>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
            <DistributionChart class0={current.class0} class1={current.class1} threshold={current.threshold} />

            <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', flexWrap: 'wrap', justifyContent: 'center' }}>
              <ConfusionMatrix tp={current.tp} fp={current.fp} tn={current.tn} fn={current.fn} />
              <ROCInset roc={current.roc} pr={current.pr} fpr={current.fpr} recall={current.recall} precision={current.precision} />
            </div>

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
              <MetricChip label="Accuracy" value={current.accuracy} color="#8b5cf6" />
              <MetricChip label="Precision" value={current.precision} color="#10b981" />
              <MetricChip label="Recall" value={current.recall} color="#3b82f6" />
              <MetricChip label="F1-Score" value={current.f1} color="#ef4444" />
              <MetricChip label="Specificity" value={current.specificity} color="#f59e0b" />
            </div>
          </div>
        </VizCard>
      )}
    />
  )
}
