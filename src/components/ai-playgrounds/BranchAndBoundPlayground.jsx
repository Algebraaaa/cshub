import { useCallback, useMemo } from 'react'
import PlaygroundShell from '../playgrounds/PlaygroundShell'
import VizCard from '../playgrounds/VizCard'

const W = 520, H = 320, PAD = 36

// Tree layout helpers
const TX = (col, total) => PAD + 40 + (col / Math.max(total - 1, 1)) * (W - 2 * PAD - 80)
const TY = (level) => PAD + 20 + level * 70

// IP: max x+y, 2x+3y<=12, x+y<=5, x,y>=0 integer
// LP relaxation optimal: x=3, y=2, obj=5
// Branch on x: x<=3 vs x>=4
// Left (x<=3): LP opt x=3,y=2, obj=5 → integer feasible!
// Right (x>=4): LP opt x=4,y=4/3, obj=5.33 → branch on y
//   y<=1: x=4,y=1, obj=5 → integer feasible
//   y>=2: infeasible
// Best integer: (3,2) obj=5 or (4,1) obj=5

function buildTree(preset) {
  const nodes = []
  const edges = []
  const addNode = (id, label, bound, sol, status, level, col, total) => {
    nodes.push({ id, label, bound, sol, status, level, col, total, x: TX(col, total), y: TY(level) })
  }
  const addEdge = (from, to) => edges.push({ from, to })

  // Root LP relaxation
  addNode('root', '根节点 LP', '5.00', '(3, 2)', 'fractional', 0, 0, 1)

  if (preset.id === 'tight') {
    addNode('L', 'x≤3', '5.00', '(3, 2)', 'integer', 1, 0, 2)
    addNode('R', 'x≥4', '4.67', '(4, 0.67)', 'fractional', 1, 1, 2)
    addNode('RL', 'y≤0', '4.00', '(4, 0)', 'integer', 2, 0, 3)
    addNode('RR', 'y≥1', '不可行', '—', 'pruned', 2, 1, 3)
    addEdge('root', 'L'); addEdge('root', 'R')
    addEdge('R', 'RL'); addEdge('R', 'RR')
    return { nodes, edges, best: '(3,2)', bestVal: 5, explored: 5, gap: 0 }
  }
  if (preset.id === 'loose') {
    addNode('L', 'x≤3', '5.00', '(3, 2)', 'integer', 1, 0, 2)
    addNode('R', 'x≥4', '5.33', '(4, 1.33)', 'fractional', 1, 1, 2)
    addNode('RL', 'y≤1', '5.00', '(4, 1)', 'integer', 2, 0, 2)
    addNode('RR', 'y≥2', '不可行', '—', 'pruned', 2, 1, 2)
    addEdge('root', 'L'); addEdge('root', 'R')
    addEdge('R', 'RL'); addEdge('R', 'RR')
    return { nodes, edges, best: '(3,2)', bestVal: 5, explored: 5, gap: 0 }
  }
  // standard
  addNode('L', 'x≤3', '5.00', '(3, 2)', 'integer', 1, 0, 2)
  addNode('R', 'x≥4', '5.33', '(4, 1.33)', 'fractional', 1, 1, 2)
  addNode('RL', 'y≤1', '5.00', '(4, 1)', 'integer', 2, 0, 3)
  addNode('RR', 'y≥2', '不可行', '—', 'pruned', 2, 2, 3)
  addEdge('root', 'L'); addEdge('root', 'R')
  addEdge('R', 'RL'); addEdge('R', 'RR')
  return { nodes, edges, best: '(3,2)', bestVal: 5, explored: 5, gap: 0 }
}

function computeSteps(preset) {
  const tree = buildTree(preset)
  const steps = []
  const visible = []
  const visibleEdges = []

  // Step 1: root
  visible.push(tree.nodes[0])
  steps.push({
    description: '求解根节点 LP 松弛：最优解 (3, 2)，目标值 5.00。变量为整数，检查是否整数解。',
    visibleNodes: [...visible], visibleEdges: [...visibleEdges], tree, explored: 1, best: '—', bestVal: '—', gap: '—',
  })

  // Step 2: branch on x
  visible.push(tree.nodes[1])
  visibleEdges.push(tree.edges[0])
  steps.push({
    description: 'x=3 已为整数，但检查完整解。左子节点 x≤3：LP 最优 (3,2)，目标值 5，整数可行！',
    visibleNodes: [...visible], visibleEdges: [...visibleEdges], tree, explored: 2, best: '(3,2)', bestVal: 5, gap: '0.00',
  })

  // Step 3: right child
  visible.push(tree.nodes[2])
  visibleEdges.push(tree.edges[1])
  steps.push({
    description: '右子节点 x≥4：LP 最优 (4, 1.33)，目标值 5.33。y=1.33 非整数，需要继续分支。',
    visibleNodes: [...visible], visibleEdges: [...visibleEdges], tree, explored: 3, best: '(3,2)', bestVal: 5, gap: '0.33',
  })

  // Step 4: branch on y left
  visible.push(tree.nodes[3])
  visibleEdges.push(tree.edges[2])
  steps.push({
    description: '分支 y≤1：LP 最优 (4,1)，目标值 5。整数可行！更新最优整数解。',
    visibleNodes: [...visible], visibleEdges: [...visibleEdges], tree, explored: 4, best: '(4,1)', bestVal: 5, gap: '0.00',
  })

  // Step 5: branch on y right (pruned)
  visible.push(tree.nodes[4])
  visibleEdges.push(tree.edges[3])
  steps.push({
    description: '分支 y≥2：不可行（违反约束）。剪枝该节点。',
    visibleNodes: [...visible], visibleEdges: [...visibleEdges], tree, explored: 5, best: '(3,2)', bestVal: 5, gap: '0.00',
  })

  // Step 6: done
  steps.push({
    description: `搜索完成！探索 ${tree.explored} 个节点，最优整数解 ${tree.best}，目标值 ${tree.bestVal}。`,
    visibleNodes: tree.nodes, visibleEdges: tree.edges, tree, explored: tree.explored, best: tree.best, bestVal: tree.bestVal, gap: '0.00',
  })

  return steps
}

const NODE_COLORS = { integer: '#22c55e', fractional: '#8b5cf6', pruned: '#94a3b8' }

export default function BranchAndBoundPlayground() {
  const presets = useMemo(() => [
    { id: 'standard', label: '标准 IP' },
    { id: 'tight', label: '紧界' },
    { id: 'loose', label: '松界' },
  ], [])

  const computeStepsFn = useCallback((preset) => computeSteps(preset), [])

  const legend = useMemo(() => [
    { color: '#8b5cf6', label: '分数解' },
    { color: '#22c55e', label: '整数解' },
    { color: '#94a3b8', label: '已剪枝' },
    { color: '#f97316', label: '最优解' },
  ], [])

  return (
    <PlaygroundShell
      presets={presets}
      computeSteps={computeStepsFn}
      legend={legend}
      renderViz={({ current }) => {
        const nodeMap = {}
        current.tree.nodes.forEach(n => { nodeMap[n.id] = n })

        return (
          <VizCard>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
              <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxWidth: 520 }}>
                {/* edges */}
                {current.visibleEdges.map((e, i) => {
                  const a = nodeMap[e.from], b = nodeMap[e.to]
                  if (!a || !b) return null
                  return <line key={i} x1={a.x} y1={a.y + 18} x2={b.x} y2={b.y - 18} stroke="var(--border-strong)" strokeWidth="2" />
                })}
                {/* nodes */}
                {current.visibleNodes.map(n => {
                  const isBest = n.status === 'integer' && n.sol === current.tree.best.replace('(', '').replace(')', '')
                  const color = isBest ? '#f97316' : NODE_COLORS[n.status] || '#8b5cf6'
                  return (
                    <g key={n.id} style={{ transition: 'all 0.3s' }}>
                      <rect x={n.x - 42} y={n.y - 18} width={84} height={52} rx={10}
                        fill="var(--bg-elev)" stroke={color} strokeWidth={isBest ? 2.5 : 1.5} />
                      <text x={n.x} y={n.y - 4} textAnchor="middle" fill="var(--text-secondary)" fontSize="10">{n.label}</text>
                      <text x={n.x} y={n.y + 10} textAnchor="middle" fill={color} fontSize="12" fontWeight="bold">
                        {n.status === 'pruned' ? '剪枝' : `${n.bound}`}
                      </text>
                      <text x={n.x} y={n.y + 24} textAnchor="middle" fill="var(--text-tertiary)" fontSize="9">{n.sol}</text>
                    </g>
                  )
                })}
              </svg>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, width: '100%', maxWidth: 440 }}>
                <InfoBox label="已探索" value={current.explored} />
                <InfoBox label="最优整数解" value={current.best} />
                <InfoBox label="目标值" value={current.bestVal} />
                <InfoBox label="间隙" value={current.gap} />
              </div>
            </div>
          </VizCard>
        )
      }}
    />
  )
}

function InfoBox({ label, value }) {
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '6px 10px', textAlign: 'center' }}>
      <div style={{ fontSize: 10, color: 'var(--text-tertiary)', marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 13, fontFamily: 'monospace', fontWeight: 600, color: 'var(--text-primary)' }}>{value}</div>
    </div>
  )
}
