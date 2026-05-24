import { useState, useMemo } from 'react'
import StepController, { useStepController } from '../StepController'
import { Toolbar, ToolbarBtn } from './shared'

const PRESETS = {
  fruits: {
    words: ['apple', 'app', 'apt', 'bat', 'ball', 'ban'],
    queries: ['app', 'apt', 'ap', 'cat'],
    label: '水果/词语',
  },
  nums: {
    words: ['do', 'dog', 'dot', 'door', 'cat', 'car', 'card'],
    queries: ['dog', 'door', 'do', 'ca'],
    label: '英文单词',
  },
}

const NODE_R = 18

function layoutTrie(root) {
  const nodes = []
  const edges = []
  const offset = { x: 0 }

  function place(node, depth, parentId) {
    const childKeys = Object.keys(node.children)
    const start = offset.x
    for (const k of childKeys) place(node.children[k], depth + 1, node.id)
    const end = offset.x

    const x = childKeys.length === 0 ? (offset.x += 52, offset.x - 52) : (start + end - 52) / 2
    nodes.push({ id: node.id, char: node.char, isEnd: node.isEnd, x, y: depth * 70 + 40 })
    if (parentId !== null) edges.push({ from: parentId, to: node.id })
  }

  place(root, 0, null)
  return { nodes, edges }
}

export default function TriePlayground({ algoFn }) {
  const [preset, setPreset] = useState('fruits')
  const { words, queries } = PRESETS[preset]
  const steps = useMemo(() => algoFn(words, queries), [algoFn, words, queries])
  const ctrl = useStepController(steps)
  const current = steps[ctrl.step]

  const { nodes, edges } = useMemo(() => {
    if (!current) return { nodes: [], edges: [] }
    return layoutTrie(current.root)
  }, [current])

  if (!current) return null

  const highlightSet = new Set(current.highlightIds || [])
  const maxX = nodes.length ? Math.max(...nodes.map(n => n.x)) + 50 : 300
  const maxY = nodes.length ? Math.max(...nodes.map(n => n.y)) + 50 : 100
  const posMap = Object.fromEntries(nodes.map(n => [n.id, n]))

  return (
    <div>
      <Toolbar>
        {Object.entries(PRESETS).map(([key, p]) => (
          <ToolbarBtn key={key} active={preset === key} onClick={() => { setPreset(key); ctrl.reset() }}>
            {p.label}
          </ToolbarBtn>
        ))}
        <div style={{ flex: 1 }} />
        <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
          插入: [{words.join(', ')}] &nbsp;|&nbsp; 查询: [{queries.join(', ')}]
        </div>
      </Toolbar>

      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, marginBottom: 16, overflowX: 'auto' }}>
        <svg width={Math.max(maxX + 40, 400)} height={Math.max(maxY + 20, 120)} style={{ display: 'block' }}>
          {edges.map((e, i) => {
            const a = posMap[e.from], b = posMap[e.to]
            if (!a || !b) return null
            const hi = highlightSet.has(e.from) && highlightSet.has(e.to)
            return (
              <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                stroke={hi ? '#8b5cf6' : 'var(--border)'}
                strokeWidth={hi ? 2.5 : 1.5} />
            )
          })}

          {nodes.map(node => {
            const hi = highlightSet.has(node.id)
            const isRoot = node.char === ''
            const bg = isRoot ? 'var(--surface-2)' : hi ? '#8b5cf6' : node.isEnd ? '#10b981' : 'var(--surface-3)'
            const fg = hi || node.isEnd ? 'white' : 'var(--text-primary)'
            return (
              <g key={node.id} style={{ transform: `translate(${node.x}px,${node.y}px)`, transition: 'transform 0.3s' }}>
                <circle r={NODE_R} fill={bg}
                  stroke={node.isEnd ? '#10b981' : hi ? '#8b5cf6' : 'var(--border)'}
                  strokeWidth={node.isEnd || hi ? 2 : 1.5} />
                <text textAnchor="middle" dominantBaseline="central"
                  fill={fg} fontSize={13} fontWeight={700} fontFamily="var(--font-mono)">
                  {isRoot ? '·' : node.char}
                </text>
                {node.isEnd && (
                  <circle r={3} cx={NODE_R - 4} cy={-NODE_R + 4} fill="#10b981" />
                )}
              </g>
            )
          })}
        </svg>

        <div style={{ display: 'flex', gap: 16, padding: '8px 16px', borderTop: '1px solid var(--border)', flexWrap: 'wrap' }}>
          {[
            { color: '#8b5cf6', label: '当前路径' },
            { color: '#10b981', label: '单词末尾' },
            { color: 'var(--surface-3)', label: '普通节点' },
          ].map(({ color, label }) => (
            <span key={label} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--text-secondary)' }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: color, display: 'inline-block' }} />
              {label}
            </span>
          ))}
        </div>
      </div>

      <StepController total={steps.length} step={ctrl.step} playing={ctrl.playing}
        speed={ctrl.speed} setSpeed={ctrl.setSpeed}
        play={ctrl.play} stop={ctrl.stop} prev={ctrl.prev} goNext={ctrl.goNext} reset={ctrl.reset} seek={ctrl.seek}
        description={current?.description} />
    </div>
  )
}
