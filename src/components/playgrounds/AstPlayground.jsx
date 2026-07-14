import PlaygroundShell from './PlaygroundShell'
import { ToolbarBtn } from './shared'

const PRESETS = [
  { id: 'simple', label: '1+2*3',       src: '1 + 2 * 3' },
  { id: 'paren',  label: '(1+2)*3',     src: '(1 + 2) * 3' },
  { id: 'mix',    label: '1+2*3-4/2',   src: '1 + 2 * 3 - 4 / 2' },
  { id: 'deep',   label: '((1+2)*3)+4', src: '((1 + 2) * 3) + 4' },
]

const NODE_W = 44
const NODE_H = 30
const LEVEL_H = 56

function layoutTree(root) {
  if (!root) return { width: 0, layout: null }
  // 先算每个子树的宽度
  function go(node) {
    if (!node) return null
    if (!node.children || node.children.length === 0) return { node, w: NODE_W + 12, children: [] }
    const kids = node.children.map(go).filter(Boolean)
    const w = Math.max(NODE_W + 12, kids.reduce((s, c) => s + c.w, 0) + 16 * (kids.length - 1))
    return { node, w, children: kids }
  }
  const l = go(root)
  return { width: l.w, layout: l }
}

function placeNodes(layout, x, y, out) {
  const cx = x + layout.w / 2
  out.push({ node: layout.node, cx, cy: y })
  if (layout.children.length > 0) {
    const totalW = layout.children.reduce((s, c) => s + c.w, 0) + 16 * (layout.children.length - 1)
    let curX = x + (layout.w - totalW) / 2
    for (const c of layout.children) {
      placeNodes(c, curX, y + LEVEL_H, out)
      curX += c.w + 16
    }
  }
}

export default function AstPlayground({ algoFn }) {
  return (
    <PlaygroundShell
      initialState={{ preset: 'simple', custom: '' }}
      derivePayload={state => state.custom.trim() || PRESETS.find(p => p.id === state.preset).src}
      computeSteps={src => {
        try { return algoFn(src) } catch (e) { return [{ description: `错误：${e.message}`, tokens: [], pos: 0, ruleStack: [], tree: null }] }
      }}
      extraToolbar={({ state, setState, ctrl }) => (
        <>
          {PRESETS.map(p => (
            <ToolbarBtn key={p.id} active={state.preset === p.id && !state.custom.trim()}
              onClick={() => { setState(s => ({ ...s, preset: p.id, custom: '' })); ctrl.reset() }}>
              {p.label}
            </ToolbarBtn>
          ))}
          <input value={state.custom} onChange={e => { setState(s => ({ ...s, custom: e.target.value })); ctrl.reset() }}
            placeholder="自定义表达式：(3+4)*2"
            style={{
              padding: '5px 10px', fontSize: 12, borderRadius: 6,
              background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-primary)',
              width: 220, fontFamily: 'var(--font-mono)',
            }} />
        </>
      )}
      renderViz={({ current }) => {
        const { tokens = [], pos, focusTokenIdx, focusNodeId, tree, ruleStack = [] } = current
        const { width, layout } = layoutTree(tree)
        const placed = []
        if (layout) placeNodes(layout, 20, 30, placed)
        const svgW = Math.max(width + 40, 360)
        const svgH = placed.length > 0 ? Math.max(...placed.map(p => p.cy)) + NODE_H + 20 : 100

        return (
          <>
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 200px', gap: 12,
              marginBottom: 12,
            }}>
              <div style={{
                padding: 12, borderRadius: 10,
                background: 'var(--surface)', border: '1px solid var(--border)',
              }}>
                <div style={{ fontSize: 11, color: 'var(--text-tertiary)', fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8 }}>
                  Token 流（已扫 {pos}/{tokens.length}）
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                  {tokens.map((t, i) => {
                    const isPast = i < pos
                    const isFocus = i === focusTokenIdx
                    return (
                      <span key={i} style={{
                        padding: '3px 9px',
                        borderRadius: 6,
                        background: isFocus ? '#a855f7' : isPast ? 'var(--surface-3)' : 'var(--surface-2)',
                        color: isFocus ? 'white' : isPast ? 'var(--text-tertiary)' : 'var(--text-primary)',
                        border: `1px solid ${isFocus ? '#a855f7' : 'var(--border)'}`,
                        fontSize: 12, fontFamily: 'var(--font-mono)', fontWeight: 700,
                        transition: 'all 0.15s',
                      }}>{t.value}</span>
                    )
                  })}
                </div>
              </div>
              <div style={{
                padding: 12, borderRadius: 10,
                background: 'var(--surface)', border: '1px solid var(--border)',
              }}>
                <div style={{ fontSize: 11, color: 'var(--text-tertiary)', fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8 }}>
                  规则栈
                </div>
                <div style={{ display: 'flex', flexDirection: 'column-reverse', gap: 4 }}>
                  {ruleStack.length === 0 && <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>—</span>}
                  {ruleStack.map((r, i) => (
                    <span key={i} style={{
                      padding: '3px 8px',
                      background: i === ruleStack.length - 1 ? '#a855f722' : 'var(--surface-2)',
                      color: i === ruleStack.length - 1 ? '#a855f7' : 'var(--text-secondary)',
                      border: '1px solid var(--border)',
                      borderRadius: 6,
                      fontSize: 11.5, fontFamily: 'var(--font-mono)', fontWeight: 700,
                    }}>{r}</span>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, marginBottom: 16, overflowX: 'auto' }}>
              <svg width={svgW} height={svgH} style={{ display: 'block' }}>
                {layout && drawEdges(layout, 20, 30).map((e, i) => (
                  <line key={i} x1={e.x1} y1={e.y1 + NODE_H / 2} x2={e.x2} y2={e.y2 - NODE_H / 2}
                    stroke="var(--border-strong)" strokeWidth="1.5" />
                ))}
                {placed.map(({ node, cx, cy }) => {
                  const isFocus = node.id === focusNodeId
                  const isOp = node.kind === 'Op'
                  const fill = isFocus ? '#a855f7' : isOp ? '#38bdf8' : '#22c55e'
                  const stroke = isFocus ? '#a855f7' : isOp ? '#38bdf8' : '#22c55e'
                  return (
                    <g key={node.id} style={{ transition: 'all 0.25s' }}>
                      <rect x={cx - NODE_W / 2} y={cy - NODE_H / 2} width={NODE_W} height={NODE_H} rx={8}
                        fill={`${fill}22`} stroke={stroke} strokeWidth={isFocus ? 2 : 1.5} />
                      <text x={cx} y={cy + 4.5} textAnchor="middle" fontSize="13" fontWeight={800} fontFamily="var(--font-mono)"
                        fill={isFocus ? '#a855f7' : 'var(--text-primary)'}>
                        {node.value}
                      </text>
                    </g>
                  )
                })}
              </svg>
            </div>
          </>
        )
      }}
    />
  )
}

function drawEdges(layout, x, y) {
  const edges = []
  function go(l, cx, cy) {
    if (!l.children || l.children.length === 0) return
    const totalW = l.children.reduce((s, c) => s + c.w, 0) + 16 * (l.children.length - 1)
    let curX = cx - l.w / 2 + (l.w - totalW) / 2
    for (const c of l.children) {
      const ccx = curX + c.w / 2
      edges.push({ x1: cx, y1: cy, x2: ccx, y2: cy + LEVEL_H })
      go(c, ccx, cy + LEVEL_H)
      curX += c.w + 16
    }
  }
  go(layout, x + layout.w / 2, y)
  return edges
}
