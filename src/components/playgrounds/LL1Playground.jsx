import { useCallback } from 'react'
import PlaygroundShell from './PlaygroundShell'

const NON_TERMINALS = ['E', "E'", 'T', "T'", 'F']
const TERMINALS = ['+', '*', '(', ')', 'id', '$']
const GRAMMAR_RULES = [
  { nt: 'E',   rhs: ["T E'"] },
  { nt: "E'",  rhs: ["+ T E'", 'ε'] },
  { nt: 'T',   rhs: ["F T'"] },
  { nt: "T'",  rhs: ["* F T'", 'ε'] },
  { nt: 'F',   rhs: ['( E )', 'id'] },
]

const sL = { fontSize: 10, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-tertiary)', marginBottom: 6 }
const cardS = { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: 12 }
const thStyle = { textAlign: 'left', padding: '4px 8px', borderBottom: '1px solid var(--border)', border: '1px solid var(--border)', fontWeight: 700, fontSize: 11, color: 'var(--text-tertiary)' }
const tdStyle = { padding: '4px 8px', border: '1px solid var(--border)' }

function phaseLabel(p) { return { first: 'FIRST 集计算', follow: 'FOLLOW 集计算', table: '构建分析表', parse: '模拟解析' }[p] || p }
function phaseColor(p) { return { first: '#3b82f6', follow: '#a855f7', table: '#eab308', parse: '#22c55e' }[p] || 'var(--accent)' }

export default function LL1Playground({ algoFn }) {
  const computeSteps = useCallback(() => {
    try { return algoFn() } catch (e) {
      return [{ phase: 'first', firstSets: {}, followSets: {}, table: {}, description: `错误：${e.message}` }]
    }
  }, [algoFn])

  return (
    <PlaygroundShell
      computeSteps={computeSteps}
      extraToolbar={
        <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
          E→TE' | E'→+TE'|ε | T→FT' | T'→*FT'|ε | F→(E)|id
        </span>
      }
      toolbarRight={({ current }) => {
        const pc = phaseColor(current?.phase)
        return (
          <span style={{ padding: '3px 10px', borderRadius: 20, background: pc + '22', border: `1px solid ${pc}55`, color: pc, fontSize: 11, fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
            {phaseLabel(current?.phase)}
          </span>
        )
      }}
      renderViz={({ current }) => {
        const { phase, firstSets, followSets, table, highlightNT, highlightCell, stack, input, action, highlight } = current
        return (
          <>
      {(phase === 'first' || phase === 'follow') && (
        <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 12, marginBottom: 12 }}>
          <div style={cardS}>
            <div style={sL}>文法规则</div>
            {GRAMMAR_RULES.map(({ nt, rhs }) => (
              <div key={nt} style={{ marginBottom: 5, background: highlightNT === nt ? 'var(--accent-soft)' : 'transparent', borderRadius: 6, padding: '3px 6px', border: highlightNT === nt ? '1px solid var(--accent-border)' : '1px solid transparent', transition: 'all 0.2s' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12.5, color: highlightNT === nt ? 'var(--accent-light)' : 'var(--text-primary)', fontWeight: highlightNT === nt ? 700 : 400 }}>
                  <b>{nt}</b> → {rhs.join(' | ')}
                </span>
              </div>
            ))}
          </div>
          <div style={cardS}>
            <div style={sL}>{phase === 'first' ? 'FIRST 集合' : 'FOLLOW 集合'}</div>
            <table style={{ borderCollapse: 'collapse', width: '100%', fontFamily: 'var(--font-mono)', fontSize: 12 }}>
              <thead>
                <tr>
                  <th style={thStyle}>非终结符</th>
                  {(phase === 'first' ? [...TERMINALS, 'ε'] : TERMINALS).map(t => <th key={t} style={thStyle}>{t}</th>)}
                </tr>
              </thead>
              <tbody>
                {NON_TERMINALS.map(nt => {
                  const sets = phase === 'first' ? (firstSets[nt] || []) : (followSets[nt] || [])
                  const isHL = highlightNT === nt
                  return (
                    <tr key={nt} style={{ background: isHL ? '#3b82f622' : 'transparent', transition: 'background 0.2s' }}>
                      <td style={{ ...tdStyle, fontWeight: 700, color: isHL ? '#3b82f6' : 'var(--text-primary)' }}>{nt}</td>
                      {(phase === 'first' ? [...TERMINALS, 'ε'] : TERMINALS).map(t => {
                        const has = sets.includes(t)
                        return (
                          <td key={t} style={{ ...tdStyle, background: has && isHL ? '#22c55e33' : has ? '#22c55e18' : 'transparent', color: has ? '#22c55e' : 'var(--text-tertiary)', fontWeight: has ? 700 : 400, transition: 'all 0.2s' }}>
                            {has ? '✓' : ''}
                          </td>
                        )
                      })}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {phase === 'table' && (
        <div style={{ ...cardS, marginBottom: 12, overflowX: 'auto' }}>
          <div style={sL}>LL(1) 分析表</div>
          <table style={{ borderCollapse: 'collapse', fontFamily: 'var(--font-mono)', fontSize: 12, minWidth: 520 }}>
            <thead>
              <tr>
                <th style={{ ...thStyle, minWidth: 40 }}></th>
                {TERMINALS.map(t => <th key={t} style={{ ...thStyle, minWidth: 80 }}>{t}</th>)}
              </tr>
            </thead>
            <tbody>
              {NON_TERMINALS.map(nt => (
                <tr key={nt}>
                  <td style={{ ...tdStyle, fontWeight: 700, color: 'var(--text-primary)' }}>{nt}</td>
                  {TERMINALS.map(t => {
                    const val = table[nt] ? table[nt][t] : null
                    const isHL = highlightCell && highlightCell.nt === nt && val && val === highlightCell.production
                    return (
                      <td key={t} style={{ ...tdStyle, background: isHL ? '#eab30833' : val ? '#3b82f611' : 'transparent', border: isHL ? '1.5px solid #eab308' : '1px solid var(--border)', color: val ? 'var(--text-primary)' : 'var(--text-tertiary)', fontWeight: isHL ? 700 : 400, transition: 'all 0.2s', fontSize: 11, whiteSpace: 'nowrap' }}>
                        {val || '—'}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {phase === 'parse' && (
        <div style={{ marginBottom: 12 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
            <div style={cardS}>
              <div style={sL}>分析栈（栈顶 →）</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                {(stack || []).map((sym, i) => {
                  const isTop = i === (stack || []).length - 1
                  return <span key={i} style={{ padding: '4px 10px', borderRadius: 6, background: isTop ? '#3b82f622' : 'var(--surface-2)', border: `1px solid ${isTop ? '#3b82f6' : 'var(--border)'}`, color: isTop ? '#3b82f6' : 'var(--text-primary)', fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: isTop ? 700 : 400, transition: 'all 0.2s' }}>{sym}</span>
                })}
              </div>
            </div>
            <div style={cardS}>
              <div style={sL}>剩余输入</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                {(input || []).map((sym, i) => {
                  const isCurr = i === 0
                  return <span key={i} style={{ padding: '4px 10px', borderRadius: 6, background: isCurr ? '#22c55e22' : 'var(--surface-2)', border: `1px solid ${isCurr ? '#22c55e' : 'var(--border)'}`, color: isCurr ? '#22c55e' : 'var(--text-tertiary)', fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: isCurr ? 700 : 400, transition: 'all 0.2s' }}>{sym}</span>
                })}
              </div>
            </div>
          </div>

          <div style={{ ...cardS, marginBottom: 12, background: '#eab30811', border: '1px solid #eab30844', textAlign: 'center' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 14, color: '#eab308' }}>动作：{action}</span>
            {highlight && (
              <span style={{ marginLeft: 16, fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                查表 M[<b style={{ color: '#3b82f6' }}>{highlight.nonTerminal}</b>, <b style={{ color: '#22c55e' }}>{highlight.terminal}</b>]
              </span>
            )}
          </div>

          <div style={{ ...cardS, overflowX: 'auto' }}>
            <div style={sL}>LL(1) 分析表（参考）</div>
            <table style={{ borderCollapse: 'collapse', fontFamily: 'var(--font-mono)', fontSize: 11, minWidth: 480 }}>
              <thead>
                <tr>
                  <th style={thStyle}></th>
                  {TERMINALS.map(t => <th key={t} style={{ ...thStyle, color: highlight && highlight.terminal === t ? '#22c55e' : 'var(--text-tertiary)', background: highlight && highlight.terminal === t ? '#22c55e11' : 'transparent' }}>{t}</th>)}
                </tr>
              </thead>
              <tbody>
                {NON_TERMINALS.map(nt => (
                  <tr key={nt} style={{ background: highlight && highlight.nonTerminal === nt ? '#3b82f611' : 'transparent' }}>
                    <td style={{ ...tdStyle, fontWeight: 700, color: highlight && highlight.nonTerminal === nt ? '#3b82f6' : 'var(--text-primary)' }}>{nt}</td>
                    {TERMINALS.map(t => {
                      const val = table[nt] ? table[nt][t] : null
                      const isHL = highlight && highlight.nonTerminal === nt && highlight.terminal === t
                      return <td key={t} style={{ ...tdStyle, background: isHL ? '#eab30833' : 'transparent', border: isHL ? '2px solid #eab308' : '1px solid var(--border)', color: val ? (isHL ? '#eab308' : 'var(--text-primary)') : 'var(--text-tertiary)', fontWeight: isHL ? 700 : 400, fontSize: 10.5, whiteSpace: 'nowrap', transition: 'all 0.2s' }}>{val || '—'}</td>
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
          </>
        )
      }}
    />
  )
}
