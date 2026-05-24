import CountingSortViz from '../CountingSortViz'
import PlaygroundShell from './PlaygroundShell'
import { randomArray, ArrayTextInput } from './inputs/ArrayInput'

const LEGEND = [
  { color: '#f59e0b', label: '当前处理元素' },
  { color: '#6366f1', label: '计数桶（有值）' },
  { color: '#8b5cf6', label: '输出中' },
  { color: '#10b981', label: '排序完成' },
]

const COUNT_OPTS = { min: 1, max: 15 }
const SMALL_OPTS = { min: 1, max: 8 }
const REPEAT_OPTS = { min: 1, max: 5 }

const PRESETS = [
  { id: 'random10', label: '🎲 随机 (10)', state: () => ({ arr: randomArray(10, COUNT_OPTS) }) },
  { id: 'small8',   label: '小数组 (8)',  state: () => ({ arr: randomArray(8,  SMALL_OPTS) }) },
  { id: 'repeats',  label: '重复多',      state: () => ({ arr: randomArray(12, REPEAT_OPTS) }) },
]

export default function CountingSortPlayground({ algoFn }) {
  return (
    <PlaygroundShell
      initialState={{ arr: randomArray(10, COUNT_OPTS), text: '' }}
      presets={PRESETS}
      derivePayload={s => s.arr}
      computeSteps={arr => algoFn(arr)}
      extraToolbar={({ state, setState, ctrl }) => (
        <ArrayTextInput state={state} setState={setState} ctrl={ctrl}
          placeholder="自定义：3 1 4 1 5 9 2（值 ≤ 99）" />
      )}
      renderViz={({ current }) => (
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 10,
          marginBottom: 16,
          padding: '20px 12px',
          overflowX: 'auto',
        }}>
          <CountingSortViz stepData={current} />
        </div>
      )}
      legend={LEGEND}
    />
  )
}
