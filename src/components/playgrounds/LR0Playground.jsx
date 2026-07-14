import { useCallback } from 'react'
import PlaygroundShell from './PlaygroundShell'

const TERMINALS = ['id', '+', '$']
const GOTO_COLS = ['E', 'T']
const ALL_COLS = [...TERMINALS, ...GOTO_COLS]

const cardS = { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: 12 }
const sL = { fontSize: 10, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-tertiary)', marginBottom: 8 }
const thS = { textAlign: 'left', padding: '4px 10px', border: '1px solid var(--border)', fontWeight: 700, fontSize: 11, color: 'var(--text-tertiary)' }
const tdS = { padding: '4px 10px', border: '1px solid var(--border)' }

function phaseLabel(p) { return { items: '构建项集', table: '构建分析表', parse: '模拟解析' }[p] || p }
function phaseColor(p) { return { items: '#3b82f6', table: '#eab308', parse: '#22c55e' }[p] || 'var(--accent)' }

function ItemsView({ items, transitions, highlight }) {
  return (
    <div style={{ ...cardS, marginBottom: 12, overflowX: 'auto' }}>
      <div style={sL}>LR(0) 项集</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
        {items.map(s => {
          const isHL = highlight && highlight.stateId === s.id
          return (
            <div key={s.id} style={{ minWidth: 160, border: `1.5px solid ${isHL ? '#eab308' : 'var(--border)'}`, borderRadius: 8, background: isHL ? '#eab30811' : 'var(--surface-2)', padding: 8, transition: 'all 0.2s', flexShrink: 0 }}>
              <div style={{ fontSize: 11, fontWeight: 800, marginBottom: 4, color: isHL ? '#eab308' : '#3b82f6', fontFamily: 'var(--font-mono)' }}>I{s.id}</div>
              {(s.allItems || []).map((item, i) => (
                <div key={i} style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, color: 'var(--text-secondary)', lineHeight: 1.5, whiteSpace: 'nowrap' }}>{item}</div>
              ))}
            </div>
          )
        })}
      </div>
      {transitions.length > 0 && (
        <div style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: 5 }}>
          {transitions.map((tr, i) => (
            <span key={i} style={{ padding: '2px 8px', borderRadius: 12, background: 'var(--surface)', border: '1px solid var(--border)', fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-secondary)' }}>
              I{tr.from} <span style={{ color: '#a855f7' }}>—{tr.symbol}→</span> I{tr.to}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

function TableView({ table, highlight }) {
  const stateIds = Object.keys(table).map(Number).sort((a, b) => a - b)
  return (
    <table style={{ borderCollapse: 'collapse', fontFamily: 'var(--font-mono)', fontSize: 11.5 }}>
      <thead>
        <tr>
          <th style={thS}>状态</th>
          <th style={{ ...thS, color: '#22c55e' }} colSpan={TERMINALS.length}>ACTION</th>
          <th style={{ ...thS, color: '#3b82f6' }} colSpan={GOTO_COLS.length}>GOTO</th>
        </tr>
        <tr>
          <th style={thS}></th>
          {TERMINALS.map(t => <th key={t} style={{ ...thS, color: highlight && highlight.sym === t ? '#22c55e' : 'var(--text-tertiary)', background: highlight && highlight.sym === t ? '#22c55e11' : 'transparent' }}>{t}</th>)}
          {GOTO_COLS.map(nt => <th key={nt} style={{ ...thS, color: highlight && highlight.sym === nt ? '#3b82f6' : 'var(--text-tertiary)', background: highlight && highlight.sym === nt ? '#3b82f611' : 'transparent' }}>{nt}</th>)}
        </tr>
      </thead>
      <tbody>
        {stateIds.map(sid => (
          <tr key={sid} style={{ background: highlight && highlight.stateId === sid ? '#3b82f611' : 'transparent' }}>
            <td style={{ ...tdS, fontWeight: 700, color: highlight && highlight.stateId === sid ? '#3b82f6' : 'var(--text-primary)' }}>{sid}</td>
            {ALL_COLS.map(col => {
              const val = table[sid] ? table[sid][col] : null
              const isHL = highlight && highlight.stateId === sid && highlight.sym === col
              let cc = 'var(--text-tertiary)', cb = 'transparent'
              if (val) {
                if (val === 'acc') { cc = '#22c55e'; cb = '#22c55e11' }
                else if (val.startsWith('s')) { cc = '#3b82f6'; cb = '#3b82f611' }
                else if (val.startsWith('r')) { cc = '#ef4444'; cb = '#ef444411' }
                else if (val.startsWith('g')) { cc = '#a855f7'; cb = '#a855f711' }
              }
              return <td key={col} style={{ ...tdS, background: isHL ? '#eab30833' : cb, border: isHL ? '2px solid #eab308' : '1px solid var(--border)', color: isHL ? '#eab308' : (val ? cc : 'var(--text-tertiary)'), fontWeight: isHL || val ? 700 : 400, transition: 'all 0.2s' }}>{val || '—'}</td>
            })}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export default function LR0Playground({ algoFn }) {
  const computeSteps = useCallback(() => {
    try { return algoFn() } catch (e) {
      return [{ phase: 'items', items: [], transitions: [], table: {}, description: `错误：${e.message}` }]
    }
  }, [algoFn])

  return (
    <PlaygroundShell
      computeSteps={computeSteps}
      extraToolbar={
        <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
          S'→E &nbsp;|&nbsp; E→E+T &nbsp;|&nbsp; E→T &nbsp;|&nbsp; T→id
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
        const { phase, items, transitions, table, stack, input, action, highlight } = current
        return (
          <>
      {phase === 'items' && <ItemsView items={items} transitions={transitions} highlight={highlight} />}

      {phase === 'table' && (
        <div>
          <ItemsView items={items} transitions={transitions} highlight={null} />
          <div style={{ ...cardS, marginBottom: 12, overflowX: 'auto' }}>
            <div style={sL}>ACTION / GOTO 表</div>
            <TableView table={table} highlight={highlight} />
          </div>
        </div>
      )}

      {phase === 'parse' && (
        <div style={{ marginBottom: 12 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
            <div style={cardS}>
              <div style={sL}>状态栈（栈顶 →）</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 5 }}>
                {(stack || []).map((s, i) => {
                  const isTop = i === (stack || []).length - 1
                  return <span key={i} style={{ padding: '3px 8px', borderRadius: 5, background: isTop ? '#3b82f622' : 'var(--surface-2)', border: `1px solid ${isTop ? '#3b82f6' : 'var(--border)'}`, color: isTop ? '#3b82f6' : 'var(--text-primary)', fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: isTop ? 700 : 400 }}>{s.state}</span>
                })}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {(stack || []).map((s, i) => {
                  const isTop = i === (stack || []).length - 1
                  return <span key={i} style={{ padding: '3px 8px', borderRadius: 5, background: isTop ? '#a855f722' : 'var(--surface-2)', border: `1px solid ${isTop ? '#a855f7' : 'var(--border)'}`, color: isTop ? '#a855f7' : 'var(--text-secondary)', fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: isTop ? 700 : 400 }}>{s.symbol}</span>
                })}
              </div>
              <div style={{ fontSize: 10, color: 'var(--text-tertiary)', marginTop: 4 }}>↑ 状态 &nbsp; ↑ 符号</div>
            </div>
            <div style={cardS}>
              <div style={sL}>剩余输入</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                {(input || []).map((sym, i) => {
                  const isCurr = i === 0
                  return <span key={i} style={{ padding: '4px 10px', borderRadius: 6, background: isCurr ? '#22c55e22' : 'var(--surface-2)', border: `1px solid ${isCurr ? '#22c55e' : 'var(--border)'}`, color: isCurr ? '#22c55e' : 'var(--text-tertiary)', fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: isCurr ? 700 : 400 }}>{sym}</span>
                })}
              </div>
            </div>
          </div>

          <div style={{ ...cardS, marginBottom: 12, background: '#eab30811', border: '1px solid #eab30844', textAlign: 'center' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 14, color: '#eab308' }}>{action}</span>
            {highlight && (
              <span style={{ marginLeft: 12, fontSize: 11.5, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                查表 [<b style={{ color: '#3b82f6' }}>{highlight.stateId}</b>, <b style={{ color: '#22c55e' }}>{highlight.sym}</b>]
              </span>
            )}
          </div>

          <div style={{ ...cardS, overflowX: 'auto' }}>
            <div style={sL}>ACTION / GOTO 表（参考）</div>
            <TableView table={table} highlight={highlight} />
          </div>
        </div>
      )}
          </>
        )
      }}
    />
  )
}
