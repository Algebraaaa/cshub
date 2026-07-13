import { useState, useMemo } from 'react'
import StepController, { useStepController } from '../StepController'
import { Toolbar, ToolbarBtn } from './shared'

const PRESETS = [
  { id: 'simple', label: 'a|b', regex: 'a|b' },
  { id: 'concat', label: 'abc',  regex: 'abc' },
  { id: 'star',   label: 'a*',   regex: 'a*' },
  { id: 'mix',    label: '(a|b)*c', regex: '(a|b)*c' },
  { id: 'hard',   label: 'a(b|c)*d', regex: 'a(b|c)*d' },
]

const R = 18  // node radius
const COL_W = 90

// 简易布局：BFS 分层 + 同层垂直堆叠
function layoutGraph(nodes, edges, start) {
  const positions = new Map()
  if (!start) return positions
  const visited = new Set([start])
  const layers = [[start]]
  // BFS
  let frontier = [start]
  while (frontier.length > 0) {
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
  // 未访问到的（不该有，但兜底）
  for (const [id] of nodes) if (!visited.has(id)) layers[layers.length - 1].push(id)

  layers.forEach((layer, li) => {
    const colX = 40 + li * COL_W
    layer.forEach((id, ri) => {
      const y = 50 + ri * 56
      positions.set(id, { x: colX, y })
    })
  })
  return positions
}

export default function RegexNfaPlayground({ algoFn }) {
  const [preset, setPreset] = useState('mix')
  const [custom, setCustom] = useState('')
  const regex = custom.trim() || PRESETS.find(p => p.id === preset).regex

  const steps = useMemo(() => {
    try { return algoFn(regex) } catch (e) { return [{ description: `语法错误：${e.message}`, nfa: { nodes: new Map(), edges: [], start: null, accept: null }, focus: [] }] }
  }, [algoFn, regex])
  const ctrl = useStepController(steps)
  const current = steps[ctrl.step]
  if (!current) return null

  const { nfa, focus = [] } = current
  const positions = layoutGraph(nfa.nodes, nfa.edges, nfa.start)
  const maxY = Math.max(0, ...[...positions.values()].map(p => p.y))
  const maxX = Math.max(200, ...[...positions.values()].map(p => p.x))
  const svgW = maxX + 80
  const svgH = maxY + 80

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
          placeholder="自定义正则：(a|b)*c"
          style={{
            padding: '5px 10px', fontSize: 12, borderRadius: 6,
            background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-primary)',
            width: 200, fontFamily: 'var(--font-mono)',
          }} />
      </Toolbar>

      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, marginBottom: 16, overflowX: 'auto' }}>
        <svg width={svgW} height={svgH} style={{ display: 'block', minHeight: 220 }}>
          <defs>
            <marker id="arrow-nfa" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--text-tertiary)" />
            </marker>
            <marker id="arrow-nfa-focus" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#a855f7" />
            </marker>
          </defs>

          {nfa.edges.map((e, i) => {
            const a = positions.get(e.from), b = positions.get(e.to)
            if (!a || !b) return null
            const focused = focus.includes(e.from) || focus.includes(e.to)
            const isSelf = e.from === e.to
            if (isSelf) {
              return (
                <g key={i}>
                  <path d={`M ${a.x} ${a.y - R} a 14 14 0 1 1 0.01 0`} fill="none" stroke="var(--text-tertiary)" strokeWidth="1.2" markerEnd="url(#arrow-nfa)" />
                  <text x={a.x} y={a.y - R - 12} textAnchor="middle" fontSize="11" fill={e.label === 'ε' ? 'var(--text-tertiary)' : '#a855f7'} fontFamily="var(--font-mono)" fontWeight={700}>{e.label}</text>
                </g>
              )
            }
            const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2
            // 偏移自避免重叠
            const dy = (i % 3 - 1) * 8
            return (
              <g key={i}>
                <line x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                  stroke={focused ? '#a855f7' : 'var(--text-tertiary)'} strokeWidth={focused ? 1.8 : 1.2}
                  markerEnd={focused ? 'url(#arrow-nfa-focus)' : 'url(#arrow-nfa)'} opacity={0.9} />
                <text x={mx + 4} y={my + dy} fontSize="11"
                  fill={e.label === 'ε' ? 'var(--text-tertiary)' : '#a855f7'}
                  fontFamily="var(--font-mono)" fontWeight={700}>
                  {e.label}
                </text>
              </g>
            )
          })}

          {[...nfa.nodes.values()].map(n => {
            const p = positions.get(n.id)
            if (!p) return null
            const isStart = n.id === nfa.start
            const isAccept = n.accepting
            const isFocus = focus.includes(n.id)
            const fill = isStart ? '#38bdf833' : isAccept ? '#22c55e33' : isFocus ? '#a855f733' : 'var(--surface-2)'
            const stroke = isFocus ? '#a855f7' : isStart ? '#38bdf8' : isAccept ? '#22c55e' : 'var(--border-strong)'
            return (
              <g key={n.id} style={{ transition: 'all 0.25s' }}>
                {isAccept && <circle cx={p.x} cy={p.y} r={R + 3} fill="none" stroke={stroke} strokeWidth="1.2" />}
                <circle cx={p.x} cy={p.y} r={R} fill={fill} stroke={stroke} strokeWidth={isFocus ? 2 : 1.5} />
                <text x={p.x} y={p.y + 4} textAnchor="middle" fontSize="10.5" fontWeight={700} fontFamily="var(--font-mono)"
                  fill={isFocus ? '#a855f7' : 'var(--text-primary)'}>
                  {n.id}
                </text>
                {isStart && <text x={p.x - R - 8} y={p.y + 4} fontSize="10" textAnchor="end" fontWeight={700} fill="#38bdf8">start</text>}
              </g>
            )
          })}
        </svg>
      </div>

      <StepController total={steps.length}
        ctrl={ctrl}
        description={current.description} />
    </div>
  )
}
