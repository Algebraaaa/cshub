import LISViz from '../LISViz'
import PlaygroundShell from './PlaygroundShell'
import { randomArray, ArrayTextInput } from './inputs/ArrayInput'

const CLASSIC = [1, 3, 5, 7, 9, 2, 4, 6, 8]
const LIS_OPTS = { min: 1, max: 20 }

const PRESETS = [
  { id: 'random10', label: '🎲 随机 (10)', state: () => ({ arr: randomArray(10, LIS_OPTS) }) },
  { id: 'random8',  label: '短数组 (8)',  state: () => ({ arr: randomArray(8, LIS_OPTS) }) },
  { id: 'classic',  label: '经典示例',    state: () => ({ arr: CLASSIC }) },
]

export default function LISPlayground({ algoFn }) {
  return (
    <PlaygroundShell
      initialState={{ arr: randomArray(10, LIS_OPTS), text: '' }}
      presets={PRESETS}
      derivePayload={s => s.arr}
      computeSteps={arr => algoFn(arr)}
      extraToolbar={({ state, setState, ctrl }) => (
        <ArrayTextInput state={state} setState={setState} ctrl={ctrl}
          placeholder="自定义：10 9 2 5 3 7 101 18" />
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
          <LISViz stepData={current} />
        </div>
      )}
    />
  )
}
