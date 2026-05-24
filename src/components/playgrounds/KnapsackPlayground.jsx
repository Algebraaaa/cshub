import PlaygroundShell from './PlaygroundShell'
import { StringField } from './inputs/NumberInput'

const EX1_ITEMS = [{ weight: 2, value: 6 }, { weight: 2, value: 10 }, { weight: 3, value: 12 }]
const EX2_ITEMS = [{ weight: 1, value: 1 }, { weight: 3, value: 4 }, { weight: 4, value: 5 }, { weight: 5, value: 7 }]

const itemsToText = (items) => items.map(i => `${i.weight},${i.value}`).join(' ')

const PRESETS = [
  {
    id: 'ex1', label: '示例 1',
    state: { items: EX1_ITEMS, capacity: 5, itemText: itemsToText(EX1_ITEMS), capText: '5' },
  },
  {
    id: 'ex2', label: '示例 2',
    state: { items: EX2_ITEMS, capacity: 7, itemText: itemsToText(EX2_ITEMS), capText: '7' },
  },
]

const INITIAL = { items: EX1_ITEMS, capacity: 5, itemText: itemsToText(EX1_ITEMS), capText: '5' }

const thStyle = { padding: '6px 10px', border: '1px solid var(--border)', background: 'var(--surface-2)', color: 'var(--text-secondary)', textAlign: 'center', minWidth: 38, fontWeight: 600 }
const tdStyle = { padding: '6px 10px', border: '1px solid var(--border)', textAlign: 'center', minWidth: 38 }

export default function KnapsackPlayground({ algoFn }) {
  return (
    <PlaygroundShell
      initialState={INITIAL}
      presets={PRESETS}
      derivePayload={s => ({ items: s.items, capacity: s.capacity })}
      computeSteps={p => algoFn(p.items, p.capacity)}
      extraToolbar={({ state, setState, ctrl }) => {
        function apply() {
          const parsed = state.itemText.trim().split(/\s+/).map(s => {
            const [w, v] = s.split(',').map(Number)
            return { weight: w, value: v }
          }).filter(i => !isNaN(i.weight) && !isNaN(i.value))
          const cap = parseInt(state.capText, 10)
          if (parsed.length && cap > 0 && cap <= 20) {
            setState({ ...state, items: parsed, capacity: cap })
            ctrl.reset()
          }
        }
        return (
          <>
            <StringField state={state} setState={setState} textField="itemText"
              label="物品 (重量,价值)：" width={220} placeholder="2,6 2,10 3,12" onApply={apply} />
            <StringField state={state} setState={setState} textField="capText"
              label="容量：" width={60} onApply={apply} submitLabel="应用" />
          </>
        )
      }}
      renderViz={({ current, state }) => <KnapsackPanel current={current} items={state.items} capacity={state.capacity} />}
    />
  )
}

function KnapsackPanel({ current, items, capacity }) {
  const { dp, highlight } = current || {}

  return (
    <>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {items.map((item, i) => (
          <div key={i} style={{
            padding: '8px 12px', borderRadius: 6,
            background: 'var(--surface)', border: '1px solid var(--border)',
            fontSize: 12, fontFamily: 'var(--font-mono)',
          }}>
            <span style={{ color: 'var(--text-tertiary)' }}>物品{i + 1}</span>{' '}
            <span style={{ color: 'var(--blue)' }}>w={item.weight}</span>{' '}
            <span style={{ color: 'var(--green)' }}>v={item.value}</span>
          </div>
        ))}
      </div>

      {dp && (
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 10,
          padding: 16,
          marginBottom: 16,
          overflowX: 'auto',
        }}>
          <table style={{ borderCollapse: 'collapse', fontSize: 13, fontFamily: 'var(--font-mono)', margin: '0 auto' }}>
            <thead>
              <tr>
                <th style={thStyle}>i\w</th>
                {Array.from({ length: capacity + 1 }, (_, w) => (
                  <th key={w} style={thStyle}>{w}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dp.map((row, i) => (
                <tr key={i}>
                  <td style={{ ...tdStyle, color: 'var(--accent-light)', fontWeight: 600 }}>
                    {i === 0 ? '∅' : `物品${i}`}
                  </td>
                  {row.map((val, w) => {
                    const isHL = highlight && highlight[0] === i && highlight[1] === w
                    return (
                      <td key={w} style={{
                        ...tdStyle,
                        background: isHL ? 'var(--yellow)' : val > 0 ? 'rgba(139,92,246,0.15)' : 'transparent',
                        color: isHL ? '#000' : 'var(--text-primary)',
                        fontWeight: isHL ? 700 : 500,
                        transition: 'background 0.3s, color 0.3s',
                      }}>{val}</td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}
