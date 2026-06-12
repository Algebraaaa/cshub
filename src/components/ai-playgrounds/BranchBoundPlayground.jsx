import { useMemo } from 'react'
import PlaygroundShell from '../playgrounds/PlaygroundShell'
import VizCard from '../playgrounds/VizCard'

// 0-1 Knapsack: 4 items
const ITEMS_PRESETS = {
  classic: {
    label: '经典背包',
    items: [
      { id: 0, w: 2, v: 3 },
      { id: 1, w: 3, v: 5 },
      { id: 2, w: 4, v: 6 },
      { id: 3, w: 5, v: 10 },
    ],
    capacity: 8,
  },
  dense: {
    label: '高密度',
    items: [
      { id: 0, w: 1, v: 6 },
      { id: 1, w: 2, v: 10 },
      { id: 2, w: 3, v: 12 },
      { id: 3, w: 4, v: 15 },
    ],
    capacity: 5,
  },
  balanced: {
    label: '均衡型',
    items: [
      { id: 0, w: 3, v: 7 },
      { id: 1, w: 2, v: 4 },
      { id: 2, w: 5, v: 9 },
      { id: 3, w: 4, v: 8 },
    ],
    capacity: 7,
  },
}

// LP relaxation (fractional knapsack) upper bound on items with given fixed assignments
function lpBound(items, capacity, fixed) {
  // fixed[i]: 0=excluded, 1=included, undefined=free
  let used = 0, val = 0
  const free = []
  for (const it of items) {
    const f = fixed[it.id]
    if (f === 1) { used += it.w; val += it.v }
    else if (f === undefined) free.push(it)
  }
  if (used > capacity) return { feasible: false, bound: -Infinity, frac: [] }
  free.sort((a, b) => b.v / b.w - a.v / a.w)
  const frac = []
  for (const it of free) {
    if (used + it.w <= capacity) {
      used += it.w; val += it.v
      frac.push({ id: it.id, frac: 1 })
    } else {
      const take = (capacity - used) / it.w
      val += take * it.v
      frac.push({ id: it.id, frac: take })
      break
    }
  }
  return { feasible: true, bound: val, frac, used }
}

// Build branch-and-bound tree and step list
function computeSteps({ presetKey }) {
  const preset = ITEMS_PRESETS[presetKey]
  const { items, capacity } = preset
  const steps = []
  const nodes = [] // id, parentId, fixed, bound, type: 'lp'|'integer'|'pruned', depth, branchVar, branchVal
  let idCounter = 0
  const rootId = idCounter++

  // Root: LP relaxation, no fixed vars
  const rootLp = lpBound(items, capacity, {})
  nodes.push({
    id: rootId, parentId: null, fixed: {}, bound: rootLp.bound,
    type: 'lp', depth: 0, frac: rootLp.frac, used: rootLp.used, status: 'open',
  })
  steps.push({
    description: `根节点 LP 松弛: z_LP = ${rootLp.bound.toFixed(2)}。容量=${capacity}。无变量固定。`,
    nodes: JSON.parse(JSON.stringify(nodes)), currentId: rootId, preset, best: null, line: 1,
  })

  // BFS: open list of nodes
  const open = [{ id: rootId }]
  let best = null // best integer solution so far: { value, fixed, used }
  let currentId = rootId

  while (open.length) {
    const { id } = open.shift()
    currentId = id
    const node = nodes.find(n => n.id === id)
    if (!node || node.status !== 'open') continue

    // Find fractional variable to branch on
    const fr = node.frac || []
    const branchOn = fr.find(f => f.frac > 0.001 && f.frac < 0.999)

    if (!branchOn) {
      // Integer solution!
      node.status = 'integer'
      node.type = 'integer'
      const solVal = items.reduce((s, it) => s + (node.fixed[it.id] === 1 ? it.v : 0), 0)
      const solUsed = items.reduce((s, it) => s + (node.fixed[it.id] === 1 ? it.w : 0), 0)
      node.bound = solVal
      if (!best || solVal > best.value) {
        best = { value: solVal, fixed: { ...node.fixed }, used: solUsed }
      }
      steps.push({
        description: `节点 #${id}: 所有变量为整数! 整数解 z = ${solVal}, 已用重量=${solUsed}。更新全局上界。`,
        nodes: JSON.parse(JSON.stringify(nodes)), currentId: id, preset, best: { ...best }, line: 3,
      })
      continue
    }

    // Branch on branchOn.id = 0 and 1
    steps.push({
      description: `节点 #${id}: 变量 x${branchOn.id + 1} = ${branchOn.frac.toFixed(2)} 非整数。分支: x${branchOn.id + 1}=0 和 x${branchOn.id + 1}=1。`,
      nodes: JSON.parse(JSON.stringify(nodes)), currentId: id, preset, best: best ? { ...best } : null,
      branchVar: branchOn.id, line: 4,
    })

    for (const val of [0, 1]) {
      const childFixed = { ...node.fixed, [branchOn.id]: val }
      const lp = lpBound(items, capacity, childFixed)
      const childId = idCounter++
      let status = 'open', type = 'lp', pruneReason = null

      if (!lp.feasible) {
        status = 'pruned'; type = 'pruned'; pruneReason = 'infeasible'
      } else {
        // Check integrality
        const childFrac = lp.frac || []
        const allInt = childFrac.every(f => f.frac < 0.001 || f.frac > 0.999)
        // Determine node's z value for bound comparison
        let nodeZ = lp.bound
        if (allInt) {
          // Recalculate as integer
          nodeZ = items.reduce((s, it) => s + (childFixed[it.id] === 1 ? it.v : 0), 0)
          if (!best || nodeZ > best.value) {
            best = { value: nodeZ, fixed: { ...childFixed }, used: lp.used }
          }
          status = 'integer'; type = 'integer'; pruneReason = null
        } else if (best && lp.bound <= best.value) {
          status = 'pruned'; type = 'pruned'; pruneReason = 'bound'
        }
        lp.bound = nodeZ
      }

      nodes.push({
        id: childId, parentId: id, fixed: childFixed, bound: lp.bound,
        type, depth: node.depth + 1, frac: lp.frac, used: lp.used, status,
        pruneReason, branchVar: branchOn.id, branchVal: val,
      })
    }

    // Add newly created children to steps (show the two children)
    const last2 = nodes.slice(-2)
    steps.push({
      description: `生成子节点 #${last2[0].id} (x${branchOn.id + 1}=0, 上界=${last2[0].bound.toFixed(2)}, ${last2[0].status}) 和 #${last2[1].id} (x${branchOn.id + 1}=1, 上界=${last2[1].bound.toFixed(2)}, ${last2[1].status})`,
      nodes: JSON.parse(JSON.stringify(nodes)), currentId: last2[0].id, preset, best: best ? { ...best } : null,
      line: 5,
    })

    // Check pruning and add opens
    for (const child of last2) {
      if (child.status === 'open') open.push({ id: child.id })
      if (child.status === 'pruned') {
        steps.push({
          description: `节点 #${child.id}: ${child.pruneReason === 'infeasible' ? '不可行' : `上界 ${child.bound.toFixed(2)} ≤ 当前最优 ${best.value}`}，剪枝 ✗`,
          nodes: JSON.parse(JSON.stringify(nodes)), currentId: child.id, preset, best: best ? { ...best } : null,
          line: 6,
        })
      }
      if (child.status === 'integer') {
        steps.push({
          description: `节点 #${child.id}: 整数解 z=${child.bound.toFixed(0)}，记录为候选。`,
          nodes: JSON.parse(JSON.stringify(nodes)), currentId: child.id, preset, best: best ? { ...best } : null,
          line: 7,
        })
      }
    }

    if (nodes.length > 30) break // safety
  }

  // Final step
  steps.push({
    description: best
      ? `B&B 完成。最优整数解: 选择物品 [${items.filter(it => best.fixed[it.id] === 1).map(it => it.id + 1).join(',')}], 总价值=${best.value}, 重量=${best.used}/${capacity}`
      : 'B&B 完成，无可行整数解。',
    nodes: JSON.parse(JSON.stringify(nodes)), currentId, preset, best: best ? { ...best } : null, line: 9,
  })

  return steps
}

// Compute node positions: simple leveled tree
function layoutNodes(nodes) {
  const byDepth = {}
  nodes.forEach(n => { byDepth[n.depth] = byDepth[n.depth] || []; byDepth[n.depth].push(n.id) })
  const pos = {}
  Object.keys(byDepth).forEach(d => {
    const ids = byDepth[d]
    const totalW = 240
    ids.forEach((id, i) => {
      pos[id] = {
        x: 40 + (ids.length === 1 ? totalW / 2 : (i / (ids.length - 1)) * totalW),
        y: 30 + parseInt(d) * 80,
      }
    })
  })
  return pos
}

function renderViz({ current }) {
  const { nodes, currentId, preset, best } = current
  const pos = layoutNodes(nodes)
  const { items, capacity } = preset

  return (
    <VizCard>
      <div style={{ display: 'flex', gap: 16, width: '100%' }}>
        {/* Left: tree */}
        <div style={{ flex: '0 0 320px', minWidth: 320 }}>
          <svg viewBox="0 0 320 300" style={{ width: '100%' }}>
            {/* Edges */}
            {nodes.filter(n => n.parentId !== null).map(n => {
              const p = pos[n.parentId], c = pos[n.id]
              if (!p || !c) return null
              const struck = n.status === 'pruned'
              return (
                <g key={`e-${n.id}`}>
                  <line x1={p.x} y1={p.y + 15} x2={c.x} y2={c.y - 15}
                    stroke={n.status === 'pruned' ? '#ef4444' : '#64748b'} strokeWidth="1.5" />
                  {struck && (
                    <g transform={`translate(${(p.x + c.x) / 2}, ${(p.y + c.y) / 2})`}>
                      <line x1="-8" y1="-8" x2="8" y2="8" stroke="#ef4444" strokeWidth="2" />
                      <line x1="-8" y1="8" x2="8" y2="-8" stroke="#ef4444" strokeWidth="2" />
                    </g>
                  )}
                  <text x={(p.x + c.x) / 2 + (n.branchVal === 0 ? -10 : 4)} y={(p.y + c.y) / 2}
                    fontSize="9" fill="#94a3b8" fontFamily="monospace">
                    {n.branchVar !== undefined ? `x${n.branchVar + 1}=${n.branchVal}` : ''}
                  </text>
                </g>
              )
            })}
            {/* Nodes */}
            {nodes.map(n => {
              const p = pos[n.id]
              if (!p) return null
              const isCurrent = n.id === currentId
              let fill = '#1e293b', stroke = '#64748b', labelColor = '#cbd5e1'
              if (n.status === 'integer') { fill = '#064e3b'; stroke = '#10b981'; labelColor = '#6ee7b7' }
              if (n.status === 'pruned') { fill = '#450a0a'; stroke = '#ef4444'; labelColor = '#fca5a5' }
              if (isCurrent) stroke = '#fbbf24'
              return (
                <g key={n.id}>
                  <rect x={p.x - 28} y={p.y - 16} width="56" height="32" rx="6"
                    fill={fill} stroke={stroke} strokeWidth={isCurrent ? 2.5 : 1.5} />
                  <text x={p.x} y={p.y - 3} textAnchor="middle" fontSize="9" fill={labelColor} fontFamily="monospace">
                    #{n.id} z={n.bound.toFixed(n.type === 'integer' ? 0 : 1)}
                  </text>
                  <text x={p.x} y={p.y + 9} textAnchor="middle" fontSize="8" fill="#94a3b8">
                    {n.status === 'pruned' ? '✗ 剪枝' : n.status === 'integer' ? '★ 整数' : '● LP'}
                  </text>
                </g>
              )
            })}
          </svg>
        </div>

        {/* Right: items + best */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 600 }}>物品 (容量={capacity})</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 6 }}>
            {items.map(it => {
              const selected = best && best.fixed[it.id] === 1
              return (
                <div key={it.id} style={{
                  padding: '8px 10px', borderRadius: 8,
                  background: selected ? 'var(--accent-soft)' : 'var(--surface)',
                  border: `1px solid ${selected ? 'var(--accent-border)' : 'var(--border)'}`,
                  fontFamily: 'monospace', fontSize: 12,
                }}>
                  <div>物品 {it.id + 1}</div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: 11 }}>
                    w={it.w} v={it.v} (ρ={(it.v / it.w).toFixed(2)})
                  </div>
                </div>
              )
            })}
          </div>

          {best && (
            <div style={{
              padding: 10, borderRadius: 8, background: '#064e3b', border: '1px solid #10b981',
              fontSize: 12, fontFamily: 'monospace',
            }}>
              <div style={{ color: '#6ee7b7', fontWeight: 700, marginBottom: 4 }}>当前最优整数解</div>
              <div style={{ color: '#cbd5e1' }}>
                z* = {best.value} &nbsp; 重量 = {best.used}/{capacity}
              </div>
              <div style={{ color: '#cbd5e1' }}>
                x = [{items.map(it => best.fixed[it.id] || 0).join(', ')}]
              </div>
            </div>
          )}

          <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
            节点数: {nodes.length} | 剪枝: {nodes.filter(n => n.status === 'pruned').length} | 整数解: {nodes.filter(n => n.status === 'integer').length}
          </div>
        </div>
      </div>
    </VizCard>
  )
}

export default function BranchBoundPlayground() {
  const presets = useMemo(() => Object.entries(ITEMS_PRESETS).map(([id, p]) => ({ id, label: p.label, state: { presetKey: id } })), [])
  return (
    <PlaygroundShell
      initialState={{ presetKey: 'classic' }}
      presets={presets}
      computeSteps={computeSteps}
      legend={[
        { color: '#1e293b', label: 'LP 松弛节点' },
        { color: '#064e3b', label: '整数解' },
        { color: '#450a0a', label: '剪枝节点' },
        { color: '#fbbf24', label: '当前节点' },
      ]}
      renderViz={renderViz}
    />
  )
}
