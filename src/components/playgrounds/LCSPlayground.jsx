import PlaygroundShell from './PlaygroundShell'
import { StringField } from './inputs/NumberInput'

const EXAMPLES = [
  { id: 'classic', label: '经典示例', s1: 'ABCBDAB',  s2: 'BDCABA' },
  { id: 'dna',     label: 'DNA 示例', s1: 'AGGTAB',   s2: 'GXTXAYB' },
  { id: 'word',    label: '单词示例', s1: 'PROGRAM',  s2: 'ALGORITHM' },
]

const PRESETS = EXAMPLES.map(e => ({
  id: e.id,
  label: e.label,
  state: { s1: e.s1, s2: e.s2, t1: e.s1, t2: e.s2 },
}))

const INITIAL = { s1: 'ABCBDAB', s2: 'BDCABA', t1: 'ABCBDAB', t2: 'BDCABA' }

const thStyle = { padding: '6px 10px', border: '1px solid var(--border)', background: 'var(--surface-2)', color: 'var(--text-secondary)', textAlign: 'center', minWidth: 38, fontWeight: 600 }
const tdStyle = { padding: '6px 10px', border: '1px solid var(--border)', textAlign: 'center', minWidth: 38 }

export default function LCSPlayground({ algoFn }) {
  return (
    <PlaygroundShell
      initialState={INITIAL}
      presets={PRESETS}
      derivePayload={s => ({ s1: s.s1, s2: s.s2 })}
      computeSteps={p => algoFn(p.s1, p.s2)}
      extraToolbar={({ state, setState, ctrl }) => {
        function apply() {
          if (state.t1 && state.t2 && state.t1.length <= 10 && state.t2.length <= 10) {
            setState({ ...state, s1: state.t1, s2: state.t2 })
            ctrl.reset()
          }
        }
        return (
          <>
            <StringField state={state} setState={setState} textField="t1"
              label="s1：" width={140} onApply={apply}
              transform={v => v.toUpperCase()} />
            <StringField state={state} setState={setState} textField="t2"
              label="s2：" width={140} onApply={apply}
              transform={v => v.toUpperCase()} submitLabel="应用" />
          </>
        )
      }}
      renderViz={({ current, state }) => <LCSTable current={current} s1={state.s1} s2={state.s2} />}
    />
  )
}

function LCSTable({ current, s1, s2 }) {
  const { dp, highlight, matchLine, backtrack = [], result } = current || {}
  const inBacktrack = (i, j) => backtrack.some(([bi, bj]) => bi === i && bj === j)

  return (
    <>
      {result !== undefined && (
        <div style={{
          padding: '12px 16px', marginBottom: 16, borderRadius: 8,
          background: 'var(--green-soft)', border: '1px solid rgba(16,185,129,0.3)',
          fontSize: 14, display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <span style={{ color: 'var(--green)', fontWeight: 600 }}>当前 LCS</span>
          <span style={{
            fontFamily: 'var(--font-mono)', color: 'var(--text-primary)',
            fontWeight: 700, fontSize: 16, letterSpacing: '0.05em',
          }}>
            {result || '(空)'}
          </span>
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
                {s2.split('').map((c, j) => (
                  <th key={j} style={{
                    ...thStyle,
                    background: matchLine && matchLine[1] === j ? 'var(--yellow)' : 'var(--surface-2)',
                    color: matchLine && matchLine[1] === j ? '#000' : 'var(--text-secondary)',
                    transition: 'all 0.3s',
                  }}>{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dp.map((row, i) => (
                <tr key={i}>
                  <th style={{
                    ...thStyle,
                    background: matchLine && matchLine[0] === i - 1 ? 'var(--yellow)' : 'var(--surface-2)',
                    color: matchLine && matchLine[0] === i - 1 ? '#000' : 'var(--text-secondary)',
                    transition: 'all 0.3s',
                  }}>{i === 0 ? '∅' : s1[i - 1]}</th>
                  {row.map((val, j) => {
                    const isHL = highlight && highlight[0] === i && highlight[1] === j
                    const isBack = inBacktrack(i, j)
                    let bg = 'transparent', color = 'var(--text-primary)'
                    if (isHL) { bg = 'var(--yellow)'; color = '#000' }
                    else if (isBack) { bg = 'rgba(16,185,129,0.35)' }
                    else if (val > 0) bg = 'rgba(139,92,246,0.12)'
                    return (
                      <td key={j} style={{
                        ...tdStyle, background: bg, color,
                        fontWeight: isHL || isBack ? 700 : 500,
                        transition: 'all 0.25s',
                      }}>{val}</td>
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
          { color: 'rgba(139,92,246,0.4)', label: 'dp > 0' },
          { color: 'rgba(16,185,129,0.6)', label: '回溯路径' },
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
