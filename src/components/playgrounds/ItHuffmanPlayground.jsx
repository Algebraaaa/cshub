import PlaygroundShell from './PlaygroundShell'
import VizCard from './VizCard'
import FormulaPanel from './FormulaPanel'

const LINES = [
  'Huffman(X): 最优前缀码',
  'Q ← 每个符号作为叶子（频率=f）',
  'while |Q| > 1:',
  '  a ← extract_min(Q)',
  '  b ← extract_min(Q)',
  '  parent ← 新节点(f=a.f+b.f, l=a, r=b)',
  '  insert(Q, parent)       // 左 0 / 右 1',
  'DFS 分配码字：root → 叶子',
  '平均码长 L = Σ fᵢ · lᵢ，效率 η = H / L',
]

const PRESETS = [
  { id: 'p1', label: '5 符号 (ABCDE)', state: { symbols: [{s:'A',f:.4},{s:'B',f:.3},{s:'C',f:.15},{s:'D',f:.1},{s:'E',f:.05}] } },
  { id: 'p2', label: '4 符号', state: { symbols: [{s:'A',f:.5},{s:'B',f:.25},{s:'C',f:.15},{s:'D',f:.1}] } },
  { id: 'p3', label: '3 符号', state: { symbols: [{s:'X',f:.6},{s:'Y',f:.3},{s:'Z',f:.1}] } },
]

export default function ItHuffmanPlayground({ algoFn }) {
  return (
    <PlaygroundShell
      presets={PRESETS}
      initialState={{ symbols: [{s:'A',f:.4},{s:'B',f:.3},{s:'C',f:.15},{s:'D',f:.1},{s:'E',f:.05}] }}
      derivePayload={s => ({ symbols: s.symbols })}
      computeSteps={payload => algoFn(payload)}
      renderViz={({ current }) => (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, minHeight: 440 }}>
          <VizCard>
            <HuffmanViz current={current} />
          </VizCard>
          <FormulaPanel lines={LINES} highlightLine={current.highlightLine} />
        </div>
      )}
    />
  )
}

function HuffmanViz({ current }) {
  const { syms, mergeTrace, codeTrace, codes, currentMerge, currentCode, avgLen, H, efficiency } = current
  const W = 400, Hh = 360

  // 构建树结构：找到根节点（无父节点）
  const allNodes = {}
  syms.forEach((s, i) => { allNodes[i] = { id: i, symbol: s.s, freq: s.f, left: null, right: null } })
  mergeTrace.forEach(m => {
    allNodes[m.parent.id] = { id: m.parent.id, symbol: null, freq: m.parent.freq, left: m.left.id, right: m.right.id }
  })
  // 找根
  const childSet = new Set()
  Object.values(allNodes).forEach(n => {
    if (n.left != null) childSet.add(n.left)
    if (n.right != null) childSet.add(n.right)
  })
  let rootId = null
  for (const id in allNodes) if (!childSet.has(Number(id))) { rootId = Number(id); break }

  // 计算布局
  function layout(id, depth, xStart, xEnd) {
    const node = allNodes[id]
    if (!node) return null
    const cx = (xStart + xEnd) / 2
    const cy = 50 + depth * 60
    node.cx = cx; node.cy = cy; node.depth = depth
    if (node.symbol == null) {
      const mid = (xStart + xEnd) / 2
      layout(node.left, depth + 1, xStart, mid)
      layout(node.right, depth + 1, mid, xEnd)
    }
  }
  if (rootId != null) layout(rootId, 0, 30, W - 30)

  // 当前合并高亮
  const activeLeftId = currentMerge >= 0 && currentMerge < mergeTrace.length ? mergeTrace[currentMerge].left.id : null
  const activeRightId = currentMerge >= 0 && currentMerge < mergeTrace.length ? mergeTrace[currentMerge].right.id : null
  const activeParentId = currentMerge >= 0 && currentMerge < mergeTrace.length ? mergeTrace[currentMerge].parent.id : null
  const mergedIds = new Set()
  for (let i = 0; i <= currentMerge && i < mergeTrace.length; i++) {
    mergedIds.add(mergeTrace[i].left.id)
    mergedIds.add(mergeTrace[i].right.id)
  }

  return (
    <svg viewBox={`0 0 ${W} ${Hh}`} style={{ width: '100%', height: 'auto', maxHeight: 380 }}>
      {/* 边 */}
      {Object.values(allNodes).map(n => {
        if (n.symbol != null) return null
        const L = allNodes[n.left], R = allNodes[n.right]
        if (!L || !R) return null
        return (
          <g key={`e-${n.id}`} style={{ transition: 'all 0.3s' }}>
            <line x1={n.cx} y1={n.cy + 18} x2={L.cx} y2={L.cy - 18}
                  stroke={activeLeftId === L.id || activeParentId === n.id ? 'var(--yellow)' : 'var(--accent)'}
                  strokeWidth={activeLeftId === L.id || activeParentId === n.id ? 2.5 : 1.5}
                  opacity={mergedIds.has(L.id) || n.id === rootId || activeParentId === n.id ? 0.8 : 0.2} />
            <line x1={n.cx} y1={n.cy + 18} x2={R.cx} y2={R.cy - 18}
                  stroke={activeRightId === R.id || activeParentId === n.id ? 'var(--yellow)' : 'var(--pink)'}
                  strokeWidth={activeRightId === R.id || activeParentId === n.id ? 2.5 : 1.5}
                  opacity={mergedIds.has(R.id) || n.id === rootId || activeParentId === n.id ? 0.8 : 0.2} />
            <text x={(n.cx + L.cx) / 2 - 8} y={(n.cy + L.cy) / 2} fontSize="10" fill="var(--accent-light)" fontFamily="var(--font-mono)" fontWeight="700">0</text>
            <text x={(n.cx + R.cx) / 2 + 4} y={(n.cy + R.cy) / 2} fontSize="10" fill="var(--pink)" fontFamily="var(--font-mono)" fontWeight="700">1</text>
          </g>
        )
      })}
      {/* 节点 */}
      {Object.values(allNodes).map(n => {
        const isActive = n.id === activeLeftId || n.id === activeRightId || n.id === activeParentId
        const isLeaf = n.symbol != null
        const code = isLeaf ? codes[n.symbol] : null
        return (
          <g key={n.id} style={{ transition: 'all 0.3s' }}>
            <rect x={n.cx - 22} y={n.cy - 18} width="44" height="36" rx="8"
                  fill={isActive ? (isLeaf ? 'var(--yellow)' : 'var(--accent-soft)') : 'var(--surface)'}
                  stroke={isActive ? 'var(--accent)' : 'var(--glass-border-strong)'}
                  strokeWidth={isActive ? 2.5 : 1.5}
                  style={{ filter: isActive ? 'drop-shadow(0 0 8px var(--accent-soft))' : 'none' }} />
            <text x={n.cx} y={n.cy - 3} fontSize={isLeaf ? 13 : 10} textAnchor="middle"
                  fill={isActive && isLeaf ? '#000' : 'var(--text-primary)'}
                  fontWeight="800" fontFamily="var(--font-mono)">
              {isLeaf ? n.symbol : `N${n.id}`}
            </text>
            <text x={n.cx} y={n.cy + 11} fontSize="9.5" textAnchor="middle"
                  fill={isActive && isLeaf ? '#000' : 'var(--accent-light)'}
                  fontFamily="var(--font-mono)" fontWeight="700">
              {n.freq.toFixed(2)}
            </text>
            {isLeaf && code && (
              <text x={n.cx} y={n.cy + 38} fontSize="10" textAnchor="middle"
                    fill={currentCode >= 0 && codeTrace[currentCode]?.symbol === n.symbol ? 'var(--yellow)' : 'var(--green)'}
                    fontFamily="var(--font-mono)" fontWeight="700">
                "{code}"
              </text>
            )}
          </g>
        )
      })}
      {/* 信息 */}
      <g transform="translate(10, 300)">
        <rect width={W - 20} height="56" rx="6" fill="var(--accent-soft)" stroke="var(--accent-border)" opacity="0.6" />
        <text x="10" y="16" fontSize="11" fill="var(--text-primary)" fontFamily="var(--font-mono)">
          码字：{Object.entries(codes).map(([s, c]) => `${s}→${c}`).join('  ')}
        </text>
        <text x="10" y="34" fontSize="11" fill="var(--text-primary)" fontFamily="var(--font-mono)">
          H = {H.toFixed(4)} 比特   平均码长 L = {avgLen.toFixed(4)}
        </text>
        <text x="10" y="50" fontSize="11" fill="var(--accent-light)" fontFamily="var(--font-mono)" fontWeight="700">
          编码效率 η = {(efficiency * 100).toFixed(2)}%
        </text>
      </g>
    </svg>
  )
}
