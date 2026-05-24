import TreeViz from '../TreeViz'
import RBTreeViz from '../RBTreeViz'
import PlaygroundShell from './PlaygroundShell'
import { ArrayTextInput } from './inputs/ArrayInput'

const DEFAULTS = {
  bst: [50, 30, 70, 20, 40, 60, 80, 10, 25],
  rb: [10, 20, 30, 15, 25, 5, 1],
  avl: [30, 20, 40, 10, 25, 35, 50],
  treap: [5, 3, 7, 1, 4, 6, 9],
}

const PRESETS_FOR = {
  bst: [
    { id: 'balanced',  label: '平衡示例', state: () => ({ values: [50, 30, 70, 20, 40, 60, 80] }) },
    { id: 'degenerate', label: '退化示例', state: () => ({ values: [10, 20, 30, 40, 50] }) },
  ],
  rb: [
    { id: 'classic',   label: '典型示例', state: () => ({ values: [10, 20, 30, 15, 25, 5, 1] }) },
    { id: 'ascending', label: '升序插入', state: () => ({ values: [1, 2, 3, 4, 5, 6, 7] }) },
  ],
  avl: [
    { id: 'balanced',  label: '平衡示例', state: () => ({ values: [30, 20, 40, 10, 25, 35, 50] }) },
    { id: 'rotate',    label: '触发旋转', state: () => ({ values: [10, 20, 30, 40, 50] }) },
    { id: 'lr-rl',     label: 'LR/RL 案例', state: () => ({ values: [3, 1, 5, 2, 4, 7, 6] }) },
  ],
  treap: [
    { id: 'classic',   label: '典型示例', state: () => ({ values: [5, 3, 7, 1, 4, 6, 9] }) },
    { id: 'ascending', label: '升序插入', state: () => ({ values: [1, 2, 3, 4, 5, 6, 7] }) },
  ],
}

const LEGEND_FOR = {
  rb: [
    { color: '#ef4444', label: '红色节点' },
    { color: '#1f2937', label: '黑色节点' },
    { color: 'var(--yellow)', label: '当前操作' },
  ],
  avl: [
    { color: 'var(--accent-light)', label: '当前节点' },
    { color: 'var(--yellow)', label: '旋转节点' },
    { color: 'var(--green)', label: '平衡因子 |bf|≤1' },
    { color: '#ef4444', label: '不平衡 |bf|>1' },
  ],
  treap: [
    { color: 'var(--accent-light)', label: '当前节点 (值/优先级)' },
    { color: 'var(--yellow)', label: '旋转节点' },
    { color: 'var(--green)', label: '堆序满足' },
  ],
}

export default function TreePlayground({ algoFn, viz }) {
  const defaults = DEFAULTS[viz] || DEFAULTS.bst
  const presets = PRESETS_FOR[viz] || PRESETS_FOR.bst
  const VizComponent = viz === 'rb' ? RBTreeViz : TreeViz

  return (
    <PlaygroundShell
      initialState={{ values: defaults, text: defaults.join(' ') }}
      presets={presets}
      derivePayload={s => s.values}
      computeSteps={values => algoFn(values)}
      extraToolbar={({ state, setState, ctrl }) => (
        <ArrayTextInput
          state={state} setState={setState} ctrl={ctrl}
          field="values" textField="text"
          placeholder="50 30 70 20"
          minLen={1}
          positiveOnly={false}
        />
      )}
      renderViz={({ current }) => (
        <div style={{ marginBottom: 16 }}>
          <VizComponent stepData={current} />
        </div>
      )}
      legend={LEGEND_FOR[viz]}
    />
  )
}
