import PlaygroundShell from './PlaygroundShell'
import VizCard from './VizCard'
import { ToolbarBtn } from './shared'

const PRESETS = {
  basic:    { label: '基础插入', m: 4, values: [10, 20, 5, 15, 25, 30, 1, 35, 12] },
  ordered:  { label: '顺序插入', m: 4, values: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] },
  random:   { label: '更高阶 m=5', m: 5, values: [50, 30, 70, 10, 40, 60, 80, 20, 90, 5, 25, 55] },
}

const NODE_H = 30
const KEY_W = 28
const LEVEL_GAP = 70

// 简单 layout：每个节点先算子树宽度
function layoutTree(node) {
  if (!node) return { width: 0, layout: null }
  const widthOfNode = Math.max(node.keys.length, 1) * KEY_W + 12
  if (node.isLeaf) {
    return { width: widthOfNode, layout: { node, w: widthOfNode, children: [] } }
  }
  let total = 0
  const children = node.children.map(c => {
    const r = layoutTree(c)
    total += r.width
    return r.layout
  })
  total += (children.length - 1) * 16
  const w = Math.max(widthOfNode, total)
  return { width: w, layout: { node, w, children } }
}

function placeNodes(layout, x, y, out) {
  const cx = x + layout.w / 2
  out.push({ node: layout.node, cx, cy: y })
  if (layout.children.length > 0) {
    let curX = x + (layout.w - layout.children.reduce((s, c) => s + c.w, 0) - (layout.children.length - 1) * 16) / 2
    for (const c of layout.children) {
      placeNodes(c, curX, y + LEVEL_GAP, out)
      curX += c.w + 16
    }
  }
}

function derivePayload(state) {
  if (state.customInput.trim()) {
    const arr = state.customInput.split(/[\s,，]+/).map(s => parseInt(s, 10)).filter(n => !isNaN(n)).slice(0, 16)
    if (arr.length > 0) return { m: PRESETS[state.preset].m, values: arr }
  }
  return PRESETS[state.preset]
}

export default function BPlusTreePlayground({ algoFn }) {
  return (
    <PlaygroundShell
      initialState={{ preset: 'basic', customInput: '' }}
      derivePayload={derivePayload}
      computeSteps={({ m, values }) => algoFn(m, values)}
      extraToolbar={({ state, setState, ctrl }) => (
        <>
          {Object.entries(PRESETS).map(([key, p]) => (
            <ToolbarBtn key={key} active={state.preset === key && !state.customInput.trim()}
              onClick={() => { setState(s => ({ ...s, preset: key, customInput: '' })); ctrl.reset() }}>
              {p.label}
            </ToolbarBtn>
          ))}
          <input value={state.customInput} onChange={e => { setState(s => ({ ...s, customInput: e.target.value })); ctrl.reset() }}
            placeholder="自定义数列：10 20 5 15"
            style={{
              padding: '5px 10px', fontSize: 12, borderRadius: 6,
              background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-primary)',
              width: 220,
            }} />
        </>
      )}
      toolbarRight={({ state }) => (
        <span style={{ fontSize: 11, color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>
          m={PRESETS[state.preset].m} · max keys={PRESETS[state.preset].m - 1}
        </span>
      )}
      renderViz={({ current }) => {
        const { tree, focusId, action, key, splitFrom } = current
        const { width, layout } = tree ? layoutTree(tree) : { width: 400, layout: null }
        const placed = []
        if (layout) placeNodes(layout, 20, 20, placed)
        const svgW = Math.max(width + 40, 480)
        const svgH = placed.length > 0 ? Math.max(...placed.map(p => p.cy)) + NODE_H + 20 : 200

        const actionColor = {
          init: '#64748b',
          descend: '#3b82f6',
          insert: '#10b981',
          split: '#ef4444',
          promote: '#f59e0b',
          newroot: '#a855f7',
          skip: '#94a3b8',
          done: '#22c55e',
        }[action] || '#a855f7'

        return (
          <VizCard borderRadius={10} padding={0} noInner>
            <svg width={svgW} height={svgH} style={{ display: 'block' }}>
              {/* 边 */}
              {layout && drawEdges(layout, 20, 20).map((edge, i) => (
                <line key={i} x1={edge.x1} y1={edge.y1 + NODE_H} x2={edge.x2} y2={edge.y2}
                  stroke="var(--border-strong)" strokeWidth="1.5" />
              ))}
              {placed.map(({ node, cx, cy }) => {
                const w = node.keys.length * KEY_W + 12
                const isFocus = node.id === focusId
                const isSplit = node.id === splitFrom
                const stroke = isFocus ? actionColor : isSplit ? '#ef4444' : 'var(--border-strong)'
                const fill = isFocus ? `${actionColor}22` : isSplit ? '#ef444422' : node.isLeaf ? 'rgba(56,189,248,0.08)' : 'rgba(168,85,247,0.08)'
                return (
                  <g key={node.id} style={{ transition: 'all 0.3s' }}>
                    <rect x={cx - w / 2} y={cy} width={w} height={NODE_H} rx={6}
                      fill={fill} stroke={stroke} strokeWidth={isFocus || isSplit ? 2 : 1.5} />
                    {node.keys.map((k, i) => (
                      <g key={i}>
                        {i > 0 && (
                          <line x1={cx - w / 2 + 6 + i * KEY_W} y1={cy + 4} x2={cx - w / 2 + 6 + i * KEY_W} y2={cy + NODE_H - 4}
                            stroke="var(--border)" strokeWidth="0.8" />
                        )}
                        <text x={cx - w / 2 + 6 + i * KEY_W + KEY_W / 2} y={cy + NODE_H / 2 + 4.5}
                          textAnchor="middle" fontSize="12.5" fontWeight={k === key ? 800 : 600}
                          fill={k === key ? actionColor : 'var(--text-primary)'}
                          fontFamily="var(--font-mono)">
                          {k}
                        </text>
                      </g>
                    ))}
                    {node.isLeaf && (
                      <text x={cx - w / 2 - 4} y={cy + NODE_H / 2 + 3} textAnchor="end" fontSize="9" fill="var(--text-tertiary)" fontWeight={700}>L</text>
                    )}
                  </g>
                )
              })}
            </svg>
          </VizCard>
        )
      }}
    />
  )
}

function drawEdges(layout, x, y) {
  const edges = []
  function go(l, cx, cy) {
    if (l.children.length === 0) return
    let curX = cx - l.w / 2 + (l.w - l.children.reduce((s, c) => s + c.w, 0) - (l.children.length - 1) * 16) / 2
    for (const c of l.children) {
      const ccx = curX + c.w / 2
      edges.push({ x1: cx, y1: cy, x2: ccx, y2: cy + LEVEL_GAP })
      go(c, ccx, cy + LEVEL_GAP)
      curX += c.w + 16
    }
  }
  go(layout, x + layout.w / 2, y)
  return edges
}
