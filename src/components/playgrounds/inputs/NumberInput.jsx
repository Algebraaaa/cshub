import { TextInput } from '../shared'

// ─────────────────────────────────────────────────────────────
// NumberInput · 单数字 / 字符串输入策略（Strategy）
//
// 提供 Shell extraToolbar 内的"单一数值/字符串"输入控件，常与 ArrayInput 组合：
//   - <NumberField>  单整数输入（背包容量、目标金额等）
//   - <StringField>  单字符串输入（KMP 主串/模式串、LCS 序列等）
//
// 这些控件不直接持有"应用按钮"逻辑——它们把 onSubmit 透传给父级（通常在
// ArrayTextInput.apply 或 Playground 自定义的 apply 函数里统一触发）。
// ─────────────────────────────────────────────────────────────

export function parseIntInRange(text, { min = 1, max = Infinity } = {}) {
  const n = parseInt(text, 10)
  if (isNaN(n) || n < min || n > max) return null
  return n
}

export function NumberField({
  state,
  setState,
  field,
  textField,
  onApply,
  placeholder,
  width = 70,
  submitLabel = '',
  label,
}) {
  const text = state[textField] ?? String(state[field] ?? '')
  return (
    <>
      {label && (
        <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{label}</span>
      )}
      <TextInput
        value={text}
        onChange={v => setState({ ...state, [textField]: v })}
        onSubmit={onApply}
        placeholder={placeholder}
        width={width}
        submitLabel={submitLabel}
      />
    </>
  )
}

export function StringField({
  state,
  setState,
  textField,
  onApply,
  placeholder,
  width = 140,
  submitLabel = '',
  transform = (v) => v,
  label,
}) {
  return (
    <>
      {label && (
        <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{label}</span>
      )}
      <TextInput
        value={state[textField] ?? ''}
        onChange={v => setState({ ...state, [textField]: transform(v) })}
        onSubmit={onApply}
        placeholder={placeholder}
        width={width}
        submitLabel={submitLabel}
      />
    </>
  )
}
