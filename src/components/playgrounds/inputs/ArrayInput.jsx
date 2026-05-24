import { TextInput } from '../shared'

// ─────────────────────────────────────────────────────────────
// ArrayInput · 数组输入策略（Strategy）
//
// 提供受控输入态下"数组输入"场景的复用工具：
//   - randomArray / sortedArray 等 state 构造器
//   - parseNumberList 文本解析
//   - <ArrayTextInput> 文本输入控件（受控接入 Shell extraToolbar）
//
// 典型用法（在 Playground 内）：
//
//   <PlaygroundShell
//     initialState={{ arr: randomArray(14), text: '' }}
//     presets={[
//       { id: 'random', label: '🎲 随机', state: () => ({ arr: randomArray(14) }) },
//       { id: 'short',  label: '短 (8)',  state: () => ({ arr: randomArray(8) }) },
//     ]}
//     derivePayload={s => s.arr}
//     computeSteps={arr => algoFn(arr)}
//     extraToolbar={({ state, setState, ctrl }) => (
//       <ArrayTextInput state={state} setState={setState} ctrl={ctrl} placeholder="3 1 4 1 5" />
//     )}
//     renderViz={({ current, state }) => <Viz stepData={current} maxVal={Math.max(...state.arr)} />}
//   />
// ─────────────────────────────────────────────────────────────

export function randomArray(n = 14, { min = 10, max = 99 } = {}) {
  return Array.from({ length: n }, () => Math.floor(Math.random() * (max - min + 1)) + min)
}

export function parseNumberList(text, { positiveOnly = true, minLen = 2 } = {}) {
  const parsed = String(text || '').split(/[\s,]+/).map(Number).filter(n => {
    if (isNaN(n)) return false
    if (positiveOnly && n <= 0) return false
    return true
  })
  return parsed.length >= minLen ? parsed : null
}

export function ArrayTextInput({
  state,
  setState,
  ctrl,
  field = 'arr',          // state 上承载数字数组的字段名（默认 'arr'）
  textField = 'text',     // state 上承载草稿文本的字段名（默认 'text'）
  placeholder = '5 3 8 1 9 2',
  minLen = 2,
  positiveOnly = true,
  width = 220,
  submitLabel = '应用',
}) {
  function apply() {
    const parsed = parseNumberList(state[textField], { positiveOnly, minLen })
    if (parsed) {
      setState({ ...state, [field]: parsed })
      ctrl.reset()
    }
  }
  return (
    <TextInput
      value={state[textField] || ''}
      onChange={text => setState({ ...state, [textField]: text })}
      onSubmit={apply}
      placeholder={placeholder}
      width={width}
      submitLabel={submitLabel}
    />
  )
}
