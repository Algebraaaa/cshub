import StringViz from '../StringViz'
import PlaygroundShell from './PlaygroundShell'
import VizCard from './VizCard'
import { StringField } from './inputs/NumberInput'

const LEGEND_FOR = {
  naive: [
    { color: 'var(--blue)', label: '正在比较 / 指针位置' },
    { color: 'var(--red)', label: '字符不匹配' },
    { color: 'var(--green)', label: '字符匹配 / 完整命中' },
  ],
  kmp: [
    { color: 'var(--blue)', label: '正在比较 / 指针位置' },
    { color: 'var(--red)', label: '字符不匹配' },
    { color: 'var(--green)', label: '字符匹配 / 完整命中' },
    { color: 'var(--purple)', label: 'LPS / Next 数组指针' },
  ],
  rabinkarp: [
    { color: 'var(--blue)', label: '当前窗口 / 验证中' },
    { color: '#fbbf24', label: '哈希碰撞 (需逐字符验证)' },
    { color: 'var(--purple)', label: '滚动到下一窗' },
    { color: 'var(--green)', label: '完整匹配' },
  ],
}

const FALLBACK_LEGEND = [
  { color: 'var(--blue)', label: '正在比较 / 指针位置' },
  { color: 'var(--red)', label: '字符不匹配' },
  { color: 'var(--green)', label: '字符匹配' },
]

const EXAMPLES = [
  { id: 'ex1', label: '示例 1', text: 'AABAACAADAABAABA', pattern: 'AABA' },
  { id: 'ex2', label: '示例 2', text: 'THIS IS A TEST TEXT', pattern: 'TEST' },
  { id: 'ex3', label: '示例 3', text: 'AAAAABAAABA', pattern: 'AAAA' },
]

const PRESETS = EXAMPLES.map(e => ({
  id: e.id,
  label: e.label,
  state: { text: e.text, pattern: e.pattern, inputT: e.text, inputP: e.pattern },
}))

const INITIAL = {
  text: 'ABC ABCDAB ABCDABCDABDE',
  pattern: 'ABCDABD',
  inputT: 'ABC ABCDAB ABCDABCDABDE',
  inputP: 'ABCDABD',
}

export default function StringPlayground({ algoFn, algoSlug }) {
  const legend = LEGEND_FOR[algoSlug] || FALLBACK_LEGEND

  return (
    <PlaygroundShell
      initialState={INITIAL}
      presets={PRESETS}
      derivePayload={s => ({ text: s.text, pattern: s.pattern })}
      computeSteps={p => algoFn(p)}
      extraToolbar={({ state, setState, ctrl }) => {
        function apply() {
          if (state.inputT && state.inputP) {
            setState({ ...state, text: state.inputT, pattern: state.inputP })
            ctrl.reset()
          }
        }
        return (
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <StringField state={state} setState={setState} textField="inputT"
              label="Text" placeholder="主串" width={160} onApply={apply} />
            <StringField state={state} setState={setState} textField="inputP"
              label="Pattern" placeholder="模式串" width={120} onApply={apply} submitLabel="应用" />
          </div>
        )
      }}
      renderViz={({ current, total, ctrl }) => (
        <VizCard
          borderRadius={10}
          padding="30px 20px"
          minHeight={250}
          noInner
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          {total > 0
            ? <StringViz stepData={current} speedMs={ctrl.speed} />
            : <div style={{ color: 'var(--text-dim)' }}>请输入有效的主串和模式串</div>}
        </VizCard>
      )}
      legend={legend}
    />
  )
}
