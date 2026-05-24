import PlaygroundShell from './PlaygroundShell'
import { ToolbarBtn, TextInput } from './shared'

const LEGEND = [
  { color: 'var(--blue)', label: '当前搜索区间 [l, r]' },
  { color: 'var(--accent-light)', label: 'mid 中点指针' },
  { color: 'var(--green)', label: '找到 / 答案位置' },
  { color: '#fbbf24', label: '已排除区间' },
]

const EXAMPLES = [
  { id: 'ex1',  label: '示例 1 (升序 10 个)', array: [1, 3, 5, 7, 9, 11, 13, 15, 17, 19], target: 11 },
  { id: 'ex2',  label: '示例 2 (含重复)',     array: [1, 2, 2, 2, 5, 5, 8, 10],            target: 5 },
  { id: 'miss', label: '未命中',              array: [2, 4, 6, 8, 10, 12, 14, 16],          target: 9 },
]

const PRESETS = EXAMPLES.map(e => ({
  id: e.id,
  label: e.label,
  state: {
    array: e.array, target: e.target,
    arrayText: e.array.join(' '), targetText: String(e.target),
  },
}))

const VARIANTS = [
  { key: 'classic', label: '经典二分' },
  { key: 'lower',   label: '左边界 (lower_bound)' },
  { key: 'upper',   label: '右边界 (upper_bound)' },
]

const INITIAL = {
  array: EXAMPLES[0].array, target: EXAMPLES[0].target, variant: 'classic',
  arrayText: EXAMPLES[0].array.join(' '), targetText: String(EXAMPLES[0].target),
}

export default function BinarySearchPlayground({ algoFn }) {
  return (
    <PlaygroundShell
      initialState={INITIAL}
      presets={PRESETS}
      derivePayload={s => ({ array: s.array, target: s.target, variant: s.variant })}
      computeSteps={p => algoFn(p)}
      extraToolbar={({ state, setState, ctrl }) => {
        function applyCustom() {
          const parsed = state.arrayText.split(/[\s,]+/).map(Number).filter(n => !isNaN(n))
          const t = Number(state.targetText)
          if (parsed.length >= 2 && !isNaN(t)) {
            setState({ ...state, array: parsed.sort((a, b) => a - b), target: t })
            ctrl.reset()
          }
        }
        function selectVariant(v) {
          setState({ ...state, variant: v })
          ctrl.reset()
        }
        return (
          <>
            {VARIANTS.map(v => (
              <ToolbarBtn key={v.key} active={state.variant === v.key} onClick={() => selectVariant(v.key)}>
                {v.label}
              </ToolbarBtn>
            ))}
            <span style={{ fontSize: 12.5, color: 'var(--text-tertiary)' }}>数组</span>
            <TextInput value={state.arrayText}
              onChange={v => setState({ ...state, arrayText: v })}
              placeholder="1 3 5 7 9" onSubmit={applyCustom} width={220} />
            <span style={{ fontSize: 12.5, color: 'var(--text-tertiary)' }}>目标</span>
            <TextInput value={state.targetText}
              onChange={v => setState({ ...state, targetText: v })}
              placeholder="11" onSubmit={applyCustom} width={80} />
          </>
        )
      }}
      renderViz={({ current }) => (
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 10,
          marginBottom: 16,
          padding: '32px 20px 60px',
          overflowX: 'auto',
        }}>
          <BinarySearchViz step={current} />
        </div>
      )}
      legend={LEGEND}
    />
  )
}

function BinarySearchViz({ step }) {
  if (!step) return null
  const { array, l, r, mid, found } = step

  return (
    <div>
      <div style={{
        display: 'flex', gap: 14, marginBottom: 24, flexWrap: 'wrap',
        padding: '10px 16px', borderRadius: 10,
        background: 'var(--surface-2)', border: '1px solid var(--border)',
        fontFamily: 'var(--font-mono)', fontSize: 13,
      }}>
        <Pill label="l" value={l} color="#3b82f6" />
        <Pill label="r" value={r} color="#3b82f6" />
        <Pill label="mid" value={mid >= 0 ? mid : '—'} color="var(--accent-light)" />
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: 6, flexWrap: 'wrap', position: 'relative' }}>
        {array.map((val, i) => {
          const inRange = i >= l && i <= r
          const isMid = i === mid
          const isFound = i === found && found >= 0
          let bg, border, color

          if (isFound) {
            bg = 'rgba(34, 197, 94, 0.18)'; border = '2px solid var(--green)'; color = 'var(--green)'
          } else if (isMid) {
            bg = 'rgba(168, 85, 247, 0.18)'; border = '2px solid var(--accent-light)'; color = 'var(--accent-light)'
          } else if (inRange) {
            bg = 'rgba(59, 130, 246, 0.10)'; border = '1px solid rgba(59, 130, 246, 0.4)'; color = 'var(--text-primary)'
          } else {
            bg = 'rgba(251, 191, 36, 0.06)'; border = '1px dashed rgba(251, 191, 36, 0.3)'; color = 'var(--text-tertiary)'
          }

          return (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
              <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 4, height: 14 }}>
                {i === l && i === r ? 'l=r' : i === l ? 'l' : i === r ? 'r' : ''}
              </div>
              <div style={{
                width: 44, height: 44,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: bg, border, borderRadius: 8,
                fontSize: 15, fontWeight: 700, color,
                transition: 'all 0.2s',
              }}>
                {val}
              </div>
              <div style={{ fontSize: 10, color: 'var(--text-tertiary)', marginTop: 4, height: 14 }}>{i}</div>
              {isMid && (
                <div style={{ position: 'absolute', bottom: -22, fontSize: 11, color: 'var(--accent-light)', fontWeight: 700 }}>↑ mid</div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function Pill({ label, value, color }) {
  return (
    <span style={{ display: 'inline-flex', gap: 6, alignItems: 'baseline' }}>
      <span style={{ fontSize: 11, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</span>
      <strong style={{ color, fontWeight: 700 }}>{value}</strong>
    </span>
  )
}
