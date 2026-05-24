import PlaygroundShell from './PlaygroundShell'
import { StringField } from './inputs/NumberInput'

const EXAMPLES = [
  { id: 'classic', label: '经典示例',     s1: 'SUNDAY', s2: 'SATURDAY' },
  { id: 'kitten',  label: 'kitten→sitting', s1: 'kitten', s2: 'sitting' },
  { id: 'abc',     label: '单字符替换',   s1: 'ABC',    s2: 'AXC' },
]

const PRESETS = EXAMPLES.map(e => ({
  id: e.id,
  label: e.label,
  state: { s1: e.s1, s2: e.s2, t1: e.s1, t2: e.s2 },
}))

const INITIAL = { s1: 'SUNDAY', s2: 'SATURDAY', t1: 'SUNDAY', t2: 'SATURDAY' }

const thStyle = { padding: '6px 10px', border: '1px solid var(--border)', background: 'var(--surface-2)', color: 'var(--text-secondary)', textAlign: 'center', minWidth: 38, fontWeight: 600 }
const tdStyle = { padding: '6px 10px', border: '1px solid var(--border)', textAlign: 'center', minWidth: 38 }

export default function EditDistancePlayground({ algoFn }) {
  return (
    <PlaygroundShell
      initialState={INITIAL}
      presets={PRESETS}
      derivePayload={s => ({ s1: s.s1, s2: s.s2 })}
      computeSteps={p => algoFn(p.s1, p.s2)}
      extraToolbar={({ state, setState, ctrl }) => {
        function apply() {
          const a = (state.t1 || '').toUpperCase().slice(0, 10)
          const b = (state.t2 || '').toUpperCase().slice(0, 10)
          if (a && b) {
            setState({ ...state, s1: a, s2: b })
            ctrl.reset()
          }
        }
        return (
          <>
            <StringField state={state} setState={setState} textField="t1"
              label="s1：" width={120} onApply={apply} />
            <StringField state={state} setState={setState} textField="t2"
              label="s2：" width={120} onApply={apply} submitLabel="应用" />
          </>
        )
      }}
      renderViz={({ current, state }) => <EDTable current={current} s1={state.s1} s2={state.s2} />}
    />
  )
}

function EDTable({ current, s1, s2 }) {
  const { dp, i, j, phase, opName } = current || {}

  return (
    <>
      {phase === 'done' && dp && (
        <div style={{
          padding: '12px 16px', marginBottom: 16, borderRadius: 8,
          background: 'var(--green-soft)', border: '1px solid rgba(16,185,129,0.3)',
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <span style={{ color: 'var(--green)', fontWeight: 600 }}>最小编辑距离</span>
          <span style={{
            fontFamily: 'var(--font-mono)', color: 'var(--text-primary)',
            fontWeight: 800, fontSize: 24,
          }}>
            {dp[dp.length - 1][dp[0].length - 1]}
          </span>
          <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            步操作（增/删/替换）
          </span>
        </div>
      )}

      {phase === 'calc' && opName && (
        <div style={{
          padding: '8px 14px', marginBottom: 12, borderRadius: 8,
          background: opName === '替换' ? 'rgba(239,68,68,0.1)' : opName === '插入' ? 'rgba(59,130,246,0.1)' : 'rgba(16,185,129,0.1)',
          border: `1px solid ${opName === '替换' ? 'rgba(239,68,68,0.3)' : opName === '插入' ? 'rgba(59,130,246,0.3)' : 'rgba(16,185,129,0.3)'}`,
          fontSize: 13, display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <span style={{
            fontWeight: 700,
            color: opName === '替换' ? '#ef4444' : opName === '插入' ? '#3b82f6' : '#10b981',
          }}>
            {opName === '替换' ? '✏️ 替换' : opName === '插入' ? '➕ 插入' : '🗑️ 删除'}
          </span>
          <span style={{ color: 'var(--text-secondary)' }}>操作代价最小</span>
        </div>
      )}

      {dp && (
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 10, padding: 16, marginBottom: 16, overflowX: 'auto',
        }}>
          <table style={{ borderCollapse: 'collapse', fontSize: 13, fontFamily: 'var(--font-mono)', margin: '0 auto' }}>
            <thead>
              <tr>
                <th style={thStyle}></th>
                <th style={thStyle}>∅</th>
                {s2.split('').map((c, jj) => (
                  <th key={jj} style={{
                    ...thStyle,
                    background: j === jj + 1 && phase !== 'init' ? 'var(--yellow)' : 'var(--surface-2)',
                    color: j === jj + 1 && phase !== 'init' ? '#000' : 'var(--text-secondary)',
                    transition: 'all 0.3s',
                  }}>{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dp.map((row, ii) => (
                <tr key={ii}>
                  <th style={{
                    ...thStyle,
                    background: i === ii && phase !== 'init' ? 'var(--yellow)' : 'var(--surface-2)',
                    color: i === ii && phase !== 'init' ? '#000' : 'var(--text-secondary)',
                    transition: 'all 0.3s',
                  }}>{ii === 0 ? '∅' : s1[ii - 1]}</th>
                  {row.map((val, jj) => {
                    const isActive = ii === i && jj === j && phase !== 'init'
                    const isFilled = (ii < i) || (ii === i && jj < j)
                    const isMatch = phase === 'match' && ii === i && jj === j
                    let bg = 'transparent'
                    if (isActive) bg = phase === 'match' ? 'rgba(16,185,129,0.4)' : 'var(--yellow)'
                    else if (isFilled && val > 0) bg = 'rgba(139,92,246,0.12)'
                    return (
                      <td key={jj} style={{
                        ...tdStyle, background: bg,
                        color: isActive ? '#000' : 'var(--text-primary)',
                        fontWeight: isActive ? 700 : 500,
                        transition: 'all 0.25s',
                        outline: isActive ? `2px solid ${isMatch ? 'var(--green)' : 'var(--yellow)'}` : 'none',
                      }}>
                        {val}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div style={{ display: 'flex', gap: 16, marginBottom: 16, flexWrap: 'wrap', fontSize: 11, color: 'var(--text-secondary)' }}>
        {[
          { color: 'var(--yellow)', label: '当前格' },
          { color: 'rgba(16,185,129,0.4)', label: '字符相同（无操作）' },
          { color: 'rgba(139,92,246,0.2)', label: '已计算' },
        ].map(({ color, label }) => (
          <span key={label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 11, height: 11, borderRadius: 3, background: color, display: 'inline-block' }} />
            {label}
          </span>
        ))}
      </div>
    </>
  )
}
