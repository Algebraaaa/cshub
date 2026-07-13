import { useState, useMemo } from 'react'
import StepController, { useStepController } from '../StepController'
import { Toolbar, ToolbarBtn } from './shared'

const PRESETS = [
  { id: 'alt',  label: 'a|b',     regex: 'a|b' },
  { id: 'star', label: 'a*',      regex: 'a*' },
  { id: 'mix',  label: '(a|b)*c', regex: '(a|b)*c' },
  { id: 'hard', label: 'a(b|c)*d', regex: 'a(b|c)*d' },
]

const R = 22
const COL_W = 130

function layout(states, edges, start) {
  const pos = new Map()
  if (states.length === 0) return pos
  const visited = new Set([start])
  const layers = [[start]]
  let frontier = [start]
  while (frontier.length) {
    const next = []
    for (const id of frontier) {
      for (const e of edges) {
        if (e.from === id && !visited.has(e.to)) {
          visited.add(e.to)
          next.push(e.to)
        }
      }
    }
    if (next.length === 0) break
    layers.push(next)
    frontier = next
  }
  for (const s of states) if (!visited.has(s.id)) layers[layers.length - 1].push(s.id)

  layers.forEach((layer, li) => {
    const x = 50 + li * COL_W
    layer.forEach((id, ri) => {
      pos.set(id, { x, y: 60 + ri * 72 })
    })
  })
  return pos
}

export default function NfaToDfaPlayground({ algoFn }) {
  const [preset, setPreset] = useState('mix')
  const [custom, setCustom] = useState('')
  const regex = custom.trim() || PRESETS.find(p => p.id === preset).regex

  const steps = useMemo(() => {
    try { return algoFn(regex) } catch (e) { return [{ description: `语法错误：${e.message}`, dfa: { states: [], edges: [] }, nfa: { nodes: new Map(), edges: [] }, alphabet: [] }] }
  }, [algoFn, regex])
  const ctrl = useStepController(steps)
  const current = steps[ctrl.step]
  if (!current) return null

  const { dfa, alphabet, focusDfaState, focusClosure = [] } = current
  const start = dfa.states[0]?.id
  const positions = layout(dfa.states, dfa.edges, start)
  const maxX = Math.max(280, ...[...positions.values()].map(p => p.x))
  const maxY = Math.max(140, ...[...positions.values()].map(p => p.y))

  return (
    <div>
      <Toolbar>
        {PRESETS.map(p => (
          <ToolbarBtn key={p.id} active={preset === p.id && !custom.trim()}
            onClick={() => { setPreset(p.id); setCustom(''); ctrl.reset() }}>
            {p.label}
          </ToolbarBtn>
        ))}
        <div style={{ flex: 1 }} />
        <input value={custom} onChange={e => { setCustom(e.target.value); ctrl.reset() }}
          placeholder="自定义正则"
          style={{
            padding: '5px 10px', fontSize: 12, borderRadius: 6,
            background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-primary)',
            width: 180, fontFamily: 'var(--font-mono)',
          }} />
        <span style={{ fontSize: 11, color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>
          Σ = {`{${alphabet.join(',')}}`}
        </span>
      </Toolbar>

      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 240px', gap: 12,
        marginBottom: 16,
      }}>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, overflowX: 'auto' }}>
          <svg width={maxX + 60} height={maxY + 60} style={{ display: 'block' }}>
            <defs>
              <marker id="arrow-dfa" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--text-tertiary)" />
              </marker>
            </defs>
            {dfa.edges.map((e, i) => {
              const a = positions.get(e.from), b = positions.get(e.to)
              if (!a || !b) return null
              if (e.from === e.to) {
                return (
                  <g key={i}>
                    <path d={`M ${a.x - 6} ${a.y - R} a 16 16 0 1 0 12 0`} fill="none" stroke="var(--text-tertiary)" strokeWidth="1.3" markerEnd="url(#arrow-dfa)" />
                    <text x={a.x} y={a.y - R - 18} textAnchor="middle" fontSize="11" fill="#a855f7" fontFamily="var(--font-mono)" fontWeight={700}>{e.label}</text>
                  </g>
                )
              }
              const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2
              return (
                <g key={i}>
                  <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="var(--text-tertiary)" strokeWidth="1.3" markerEnd="url(#arrow-dfa)" opacity={0.85} />
                  <text x={mx + 4} y={my - 4} fontSize="11" fill="#a855f7" fontFamily="var(--font-mono)" fontWeight={700}>{e.label}</text>
                </g>
              )
            })}
            {dfa.states.map(s => {
              const p = positions.get(s.id)
              if (!p) return null
              const isFocus = s.id === focusDfaState
              const fill = isFocus ? '#a855f733' : s.id === start ? '#38bdf833' : s.accepting ? '#22c55e33' : 'var(--surface-2)'
              const stroke = isFocus ? '#a855f7' : s.id === start ? '#38bdf8' : s.accepting ? '#22c55e' : 'var(--border-strong)'
              return (
                <g key={s.id}>
                  {s.accepting && <circle cx={p.x} cy={p.y} r={R + 3} fill="none" stroke={stroke} strokeWidth="1.2" />}
                  <circle cx={p.x} cy={p.y} r={R} fill={fill} stroke={stroke} strokeWidth={isFocus ? 2.2 : 1.5} />
                  <text x={p.x} y={p.y + 4} textAnchor="middle" fontSize="12" fontWeight={800} fontFamily="var(--font-mono)" fill={isFocus ? '#a855f7' : 'var(--text-primary)'}>
                    {s.id}
                  </text>
                  <text x={p.x} y={p.y + R + 14} textAnchor="middle" fontSize="9" fill="var(--text-tertiary)" fontFamily="var(--font-mono)">
                    {`{${s.closure.join(',')}}`}
                  </text>
                </g>
              )
            })}
          </svg>
        </div>

        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: 12 }}>
          <div style={{ fontSize: 11, color: 'var(--text-tertiary)', fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8 }}>
            DFA 状态表
          </div>
          <table style={{ borderCollapse: 'collapse', width: '100%', fontFamily: 'var(--font-mono)', fontSize: 11.5 }}>
            <thead>
              <tr style={{ color: 'var(--text-tertiary)' }}>
                <th style={th}>DFA</th>
                {alphabet.map(s => <th key={s} style={th}>{s}</th>)}
              </tr>
            </thead>
            <tbody>
              {dfa.states.map(s => {
                const focus = s.id === focusDfaState
                return (
                  <tr key={s.id} style={{ background: focus ? 'var(--accent-soft)' : 'transparent' }}>
                    <td style={{ ...td, color: s.accepting ? '#22c55e' : 'var(--text-primary)', fontWeight: 800 }}>
                      {s.id}{s.accepting ? '*' : ''}
                    </td>
                    {alphabet.map(sym => {
                      const e = dfa.edges.find(e => e.from === s.id && e.label === sym)
                      return <td key={sym} style={td}>{e ? e.to : '—'}</td>
                    })}
                  </tr>
                )
              })}
            </tbody>
          </table>
          {focusClosure.length > 0 && (
            <div style={{ marginTop: 10, padding: 8, borderRadius: 6, background: 'var(--surface-2)', fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
              ε-closure ≡ {`{${focusClosure.join(', ')}}`}
            </div>
          )}
        </div>
      </div>

      <StepController total={steps.length}
        ctrl={ctrl}
        description={current.description} />
    </div>
  )
}

const th = { textAlign: 'left', padding: '3px 6px', borderBottom: '1px solid var(--border)', fontWeight: 700, fontSize: 10 }
const td = { padding: '3px 6px', borderBottom: '1px solid var(--border)' }
