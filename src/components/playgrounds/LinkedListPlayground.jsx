import { useState, useMemo } from 'react'
import StepController, { useStepController } from '../StepController'
import { Toolbar, ToolbarBtn } from './shared'

const PRESETS = {
  basic: {
    label: '插入 & 搜索',
    ops: [
      { type: 'append', val: 10 },
      { type: 'append', val: 20 },
      { type: 'append', val: 30 },
      { type: 'prepend', val: 5 },
      { type: 'append', val: 40 },
      { type: 'search', val: 30 },
      { type: 'search', val: 99 },
    ],
  },
  delete: {
    label: '插入 & 删除',
    ops: [
      { type: 'append', val: 1 },
      { type: 'append', val: 2 },
      { type: 'append', val: 3 },
      { type: 'append', val: 4 },
      { type: 'append', val: 5 },
      { type: 'delete', val: 3 },
      { type: 'delete', val: 1 },
      { type: 'delete', val: 5 },
    ],
  },
  reverse: {
    label: '链表反转',
    ops: [
      { type: 'append', val: 1 },
      { type: 'append', val: 2 },
      { type: 'append', val: 3 },
      { type: 'append', val: 4 },
      { type: 'append', val: 5 },
      { type: 'reverse' },
    ],
  },
}

const NODE_W = 54
const NODE_H = 38
const GAP = 28
const ROW_H = 90
const COLS = 6

function nodePos(idx) {
  const row = Math.floor(idx / COLS)
  const col = idx % COLS
  const rtl = row % 2 === 1
  const actualCol = rtl ? (COLS - 1 - col) : col
  return { x: 30 + actualCol * (NODE_W + GAP), y: 30 + row * ROW_H }
}

export default function LinkedListPlayground({ algoFn }) {
  const [preset, setPreset] = useState('basic')
  const { ops } = PRESETS[preset]
  const steps = useMemo(() => algoFn(ops), [algoFn, ops])
  const ctrl = useStepController(steps)
  const current = steps[ctrl.step]

  if (!current) return null

  const { nodes } = current
  const highlightSet = new Set(current.highlighted)
  const { prev: prevPtr, current: currPtr } = current.pointers

  const posMap = Object.fromEntries(nodes.map((n, i) => [n.id, nodePos(i)]))
  const totalRows = Math.ceil(nodes.length / COLS) || 1
  const svgH = 30 + totalRows * ROW_H + 10

  function actionColor(id) {
    if (highlightSet.has(id)) {
      if (current.action === 'delete' || current.action === 'delete-traverse') return '#ef4444'
      if (current.action === 'search-found') return '#10b981'
      return '#8b5cf6'
    }
    return null
  }

  return (
    <div>
      <Toolbar>
        {Object.entries(PRESETS).map(([key, p]) => (
          <ToolbarBtn key={key} active={preset === key} onClick={() => { setPreset(key); ctrl.reset() }}>
            {p.label}
          </ToolbarBtn>
        ))}
      </Toolbar>

      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, marginBottom: 16, overflowX: 'auto' }}>
        <svg width={Math.max(30 + COLS * (NODE_W + GAP) + 20, 400)} height={Math.max(svgH, 100)} style={{ display: 'block' }}>
          {nodes.length === 0 && (
            <text x={200} y={55} textAnchor="middle" fill="var(--text-tertiary)" fontSize={13}>空链表</text>
          )}

          {/* Edges (arrows) */}
          {nodes.map((n, i) => {
            if (n.nextId === null) return null
            const from = posMap[n.id]
            const toIdx = nodes.findIndex(x => x.id === n.nextId)
            if (toIdx < 0) return null
            const to = posMap[n.nextId]
            if (!from || !to) return null
            const sameRow = Math.floor(i / COLS) === Math.floor(toIdx / COLS)
            const hi = highlightSet.has(n.id) && highlightSet.has(n.nextId)

            let x1, y1, x2, y2
            if (sameRow && toIdx === i + 1) {
              const row = Math.floor(i / COLS)
              const rtl = row % 2 === 1
              x1 = from.x + (rtl ? 0 : NODE_W); y1 = from.y + NODE_H / 2
              x2 = to.x + (rtl ? NODE_W : 0); y2 = to.y + NODE_H / 2
            } else {
              x1 = from.x + NODE_W / 2; y1 = from.y + NODE_H
              x2 = to.x + NODE_W / 2; y2 = to.y
            }

            return (
              <g key={n.id}>
                <defs>
                  <marker id={`arr-${n.id}`} markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
                    <path d="M0,0 L6,3 L0,6 Z" fill={hi ? '#8b5cf6' : 'var(--text-tertiary)'} />
                  </marker>
                </defs>
                <line x1={x1} y1={y1} x2={x2} y2={y2}
                  stroke={hi ? '#8b5cf6' : 'var(--text-tertiary)'}
                  strokeWidth={hi ? 2.5 : 1.5}
                  markerEnd={`url(#arr-${n.id})`} />
              </g>
            )
          })}

          {/* Nodes */}
          {nodes.map((n) => {
            const p = posMap[n.id]
            const ac = actionColor(n.id)
            const isNull = n.nextId === null
            return (
              <g key={n.id}>
                <rect x={p.x} y={p.y} width={NODE_W} height={NODE_H}
                  rx={6}
                  fill={ac || 'var(--surface-2)'}
                  stroke={ac || 'var(--border)'}
                  strokeWidth={ac ? 2 : 1.5}
                  style={{ transition: 'fill 0.2s, stroke 0.2s' }} />
                <text x={p.x + NODE_W / 2} y={p.y + NODE_H / 2}
                  textAnchor="middle" dominantBaseline="central"
                  fill={ac ? 'white' : 'var(--text-primary)'}
                  fontSize={14} fontWeight={700} fontFamily="var(--font-mono)">
                  {n.val}
                </text>
                {/* pointer indicator */}
                {(n.id === currPtr || n.id === prevPtr) && (
                  <text x={p.x + NODE_W / 2} y={p.y - 8}
                    textAnchor="middle" fill={n.id === currPtr ? '#8b5cf6' : '#f59e0b'}
                    fontSize={10} fontWeight={700}>
                    {n.id === currPtr ? 'curr' : 'prev'}
                  </text>
                )}
                {isNull && (
                  <text x={p.x + NODE_W + 8} y={p.y + NODE_H / 2}
                    dominantBaseline="central"
                    fill="var(--text-tertiary)" fontSize={10} fontFamily="var(--font-mono)">
                    null
                  </text>
                )}
              </g>
            )
          })}
        </svg>

        <div style={{ display: 'flex', gap: 16, padding: '8px 16px', borderTop: '1px solid var(--border)', flexWrap: 'wrap' }}>
          {[
            { color: '#8b5cf6', label: '操作/插入节点' },
            { color: '#ef4444', label: '删除节点' },
            { color: '#10b981', label: '找到节点' },
          ].map(({ color, label }) => (
            <span key={label} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--text-secondary)' }}>
              <span style={{ width: 10, height: 10, borderRadius: 2, background: color, display: 'inline-block' }} />
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
