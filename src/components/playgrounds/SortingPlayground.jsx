import SortingViz from '../SortingViz'
import MergeSortViz from '../MergeSortViz'
import QuickSortViz from '../QuickSortViz'
import PlaygroundShell from './PlaygroundShell'
import { randomArray, ArrayTextInput } from './inputs/ArrayInput'

const VIZ_FOR = {
  mergesort: MergeSortViz,
  quicksort: QuickSortViz,
}

const LEGEND_FOR = {
  mergesort: [
    { color: '#f59e0b', label: '正在划分 ▼' },
    { color: '#3b82f6', label: '左半' },
    { color: '#ec4899', label: '右半' },
    { color: '#8b5cf6', label: '已归并到父层 ▲' },
    { color: 'var(--accent-light)', label: '归并目标 slot' },
    { color: '#10b981', label: '排序完成' },
  ],
  quicksort: [
    { color: 'var(--pink)', label: '当前 Pivot' },
    { color: 'rgba(16, 185, 129, 0.55)', label: '≤ Pivot 已分组' },
    { color: 'rgba(139, 92, 246, 0.4)', label: '待扫描' },
    { color: 'var(--yellow)', label: '正在比较' },
    { color: '#059669', label: '已最终归位' },
  ],
}

const DEFAULT_LEGEND = [
  { color: 'var(--yellow)', label: '比较中' },
  { color: 'var(--red)', label: '交换' },
  { color: 'var(--green)', label: '已排序' },
]

export default function SortingPlayground({ algoFn, algoSlug }) {
  const startSize = (algoSlug === 'mergesort' || algoSlug === 'quicksort') ? 10 : 14
  const VizComponent = VIZ_FOR[algoSlug] || SortingViz
  const legend = LEGEND_FOR[algoSlug] || DEFAULT_LEGEND

  const presets = [
    { id: 'random',  label: '🎲 随机数组',  state: () => ({ arr: randomArray(14) }) },
    { id: 'short8',  label: '短数组 (8)',   state: () => ({ arr: randomArray(8) }) },
    { id: 'sorted',  label: '已排序',       state: (s) => ({ arr: [...s.arr].sort((a, b) => a - b) }) },
    { id: 'reverse', label: '逆序',         state: (s) => ({ arr: [...s.arr].sort((a, b) => b - a) }) },
  ]

  return (
    <PlaygroundShell
      initialState={{ arr: randomArray(startSize), text: '' }}
      presets={presets}
      derivePayload={s => s.arr}
      computeSteps={arr => algoFn(arr)}
      extraToolbar={({ state, setState, ctrl }) => (
        <ArrayTextInput state={state} setState={setState} ctrl={ctrl}
          placeholder="自定义：5 3 8 1 9 2" />
      )}
      renderViz={({ current, state }) => (
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: '16px',
          marginBottom: 16,
          overflow: 'hidden',
        }}>
          <div style={{
            padding: '24px 12px',
            overflowX: 'auto',
            overflowY: 'hidden',
          }}>
            <VizComponent stepData={current} maxVal={Math.max(...state.arr)} />
          </div>
        </div>
      )}
      legend={legend}
    />
  )
}
