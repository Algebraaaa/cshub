import { useCallback, useMemo } from 'react'
import PlaygroundShell from '../playgrounds/PlaygroundShell'
import VizCard from '../playgrounds/VizCard'

const W = 520
const H = 320
const PAD = 36
const X_RANGE = [0, 6]
const Y_RANGE = [0, 5]
const DATA = [
  { x: 1.0, y: 1.0, label: 0 }, { x: 1.5, y: 1.8, label: 0 }, { x: 2.2, y: 1.1, label: 0 },
  { x: 3.2, y: 3.6, label: 1 }, { x: 4.2, y: 3.2, label: 1 }, { x: 5.0, y: 4.0, label: 1 },
  { x: 4.7, y: 1.3, label: 0 }, { x: 5.2, y: 1.8, label: 0 },
]

function sx(x) { return PAD + (x - X_RANGE[0]) / (X_RANGE[1] - X_RANGE[0]) * (W - PAD * 2) }
function sy(y) { return H - PAD - (y - Y_RANGE[0]) / (Y_RANGE[1] - Y_RANGE[0]) * (H - PAD * 2) }

function computeSteps({ criterion }) {
  return [
    { description: `根节点: 计算 ${criterion} 不纯度`, phase: 'root', splits: [], impurity: 0.5, points: DATA, criterion },
    { description: '评估候选切分: x < 3.0', phase: 'first split', splits: [{ axis: 'x', value: 3.0 }], impurity: 0.22, points: DATA, criterion },
    { description: '继续切分右侧节点: y < 2.4', phase: 'second split', splits: [{ axis: 'x', value: 3.0 }, { axis: 'y', value: 2.4, fromX: 3.0 }], impurity: 0.04, points: DATA, criterion },
    { description: '形成叶子节点并输出多数类', phase: 'leaf vote', splits: [{ axis: 'x', value: 3.0 }, { axis: 'y', value: 2.4, fromX: 3.0 }], impurity: 0.0, points: DATA, criterion },
  ]
}

export default function DecisionTreePlayground() {
  const presets = useMemo(() => [
    { id: 'gini', label: 'Gini', state: { criterion: 'gini' } },
    { id: 'entropy', label: 'Entropy', state: { criterion: 'entropy' } },
  ], [])

  const computeStepsFn = useCallback(state => computeSteps(state), [])

  return (
    <PlaygroundShell
      initialState={{ criterion: 'gini' }}
      presets={presets}
      derivePayload={s => s}
      computeSteps={computeStepsFn}
      legend={[
        { color: '#38bdf8', label: '类别 0' },
        { color: '#f472b6', label: '类别 1' },
        { color: '#f97316', label: '切分规则' },
      ]}
      renderViz={({ current }) => (
        <VizCard>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxWidth: W }}>
              <rect x={PAD} y={PAD} width={W - PAD * 2} height={H - PAD * 2} fill="rgba(139,92,246,0.05)" rx="8" />
              {current.splits.map((split, i) => split.axis === 'x' ? (
                <line key={i} x1={sx(split.value)} y1={PAD} x2={sx(split.value)} y2={H - PAD} stroke="#f97316" strokeWidth="3" strokeDasharray="8 6" />
              ) : (
                <line key={i} x1={sx(split.fromX)} y1={sy(split.value)} x2={W - PAD} y2={sy(split.value)} stroke="#f97316" strokeWidth="3" strokeDasharray="8 6" />
              ))}
              {current.points.map((p, i) => (
                <circle key={i} cx={sx(p.x)} cy={sy(p.y)} r="6" fill={p.label ? '#f472b6' : '#38bdf8'} opacity="0.9" />
              ))}
            </svg>
            <div style={{ display: 'flex', gap: 12, fontSize: 12, color: 'var(--text-secondary)' }}>
              <span>phase: <b>{current.phase}</b></span>
              <span>{current.criterion}: <b>{current.impurity.toFixed(2)}</b></span>
            </div>
          </div>
        </VizCard>
      )}
    />
  )
}
