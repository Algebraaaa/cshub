import { useMemo } from 'react'
import PlaygroundShell from './PlaygroundShell'
import VizCard from './VizCard'
import SvgCanvas from '../svg/SvgCanvas'
import { StringField } from './inputs/NumberInput'

const LEGEND = [
  { color: '#3b82f6', label: '插入路径' },
  { color: '#f59e0b', label: 'fail 指针' },
  { color: '#10b981', label: '终止节点' },
  { color: '#8b5cf6', label: '当前扫描节点' },
  { color: '#ec4899', label: '匹配命中' },
]

const PRESETS = [
  { id: 'default', label: '默认', state: { inputP: 'he, she, his, hers', inputT: 'ahishers' } },
  { id: 'dna', label: 'DNA', state: { inputP: 'ACT, CT, AC', inputT: 'AACTGACT' } },
  { id: 'news', label: '关键词', state: { inputP: 'ab, bc, abc', inputT: 'ababc' } },
]

const INITIAL = { inputP: 'he, she, his, hers', inputT: 'ahishers' }

const NODE_R = 16
const LEVEL_H = 60
const TREE_PAD_X = 64
const TREE_MIN_W = 420

export default function AhoPlayground({ algoFn }) {
  return (
    <PlaygroundShell
      initialState={INITIAL}
      presets={PRESETS}
      derivePayload={s => {
        const patterns = s.inputP.split(/[,，\s]+/).filter(Boolean)
        return { patterns, text: s.inputT }
      }}
      computeSteps={p => algoFn(p)}
      extraToolbar={({ state, setState, ctrl }) => {
        function apply() {
          ctrl.reset()
        }
        return (
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <StringField state={state} setState={setState} textField="inputP"
              label="模式串" placeholder="逗号分隔" width={180} onApply={apply} />
            <StringField state={state} setState={setState} textField="inputT"
              label="文本" placeholder="搜索文本" width={140} onApply={apply} submitLabel="应用" />
          </div>
        )
      }}
      renderViz={({ current }) => (
        <VizCard borderRadius={10} padding={0} noInner>
          {current && <AhoViz step={current} />}
        </VizCard>
      )}
      legend={LEGEND}
    />
  )
}

function layoutTrie(trieNodes) {
  if (!trieNodes || trieNodes.length === 0) return { positions: {}, width: TREE_MIN_W, height: 160 }
  const childrenOf = {}
  for (const nd of trieNodes) {
    childrenOf[nd.id] = Object.values(nd.children || {})
  }

  const positions = {}
  const offset = { x: 0 }

  function place(id, depth) {
    const kids = childrenOf[id] || []
    const start = offset.x
    for (const kidId of kids) place(kidId, depth + 1)
    const end = offset.x

    const x = kids.length === 0 ? (offset.x += 46, offset.x - 46) : (start + end - 46) / 2
    positions[id] = { x, y: depth * LEVEL_H + 36 }
  }

  place(0, 0)
  const allPos = Object.values(positions)
  const minX = allPos.length ? Math.min(...allPos.map(p => p.x)) : 0
  const maxX = allPos.length ? Math.max(...allPos.map(p => p.x)) : 0
  const maxY = allPos.length ? Math.max(...allPos.map(p => p.y)) : 0
  const treeWidth = Math.max(maxX - minX, NODE_R * 2)
  const width = Math.max(treeWidth + TREE_PAD_X * 2, TREE_MIN_W)
  const offsetX = (width - treeWidth) / 2 - minX

  for (const pos of Object.values(positions)) {
    pos.x += offsetX
  }

  return { positions, width, height: Math.max(maxY + 72, 180) }
}

function AhoViz({ step }) {
  const { text, trie, currentNode, textIdx, phase, failPath, matches } = step
  const trieNodes = trie.nodes

  const { positions, width, height } = useMemo(() => layoutTrie(trieNodes), [trieNodes])

  // Collect edges (parent → child)
  const edges = useMemo(() => {
    const e = []
    for (const nd of trieNodes) {
      for (const ch in nd.children) {
        e.push({ from: nd.id, to: nd.children[ch], char: ch })
      }
    }
    return e
  }, [trieNodes])

  // Fail edges
  const failEdges = useMemo(() => {
    return trieNodes
      .filter(nd => nd.id !== 0 && nd.fail !== undefined)
      .map(nd => ({ from: nd.id, to: nd.fail }))
  }, [trieNodes])

  const failSet = new Set(failPath || [])
  const isSearching = phase === 'search' || phase === 'search-done'

  // Build match ranges for text highlighting
  const matchRanges = (matches || []).map(m => ({ start: m.start, end: m.end, pattern: m.pattern }))

  return (
    <div>
      {/* Text display with match highlighting */}
      {isSearching && (
        <div style={{
          padding: '10px 16px', margin: '0 0 4px 0',
          borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)',
          background: 'var(--surface-2)', fontFamily: 'var(--font-mono)', fontSize: 14,
        }}>
          <span style={{ fontSize: 11, color: 'var(--text-tertiary)', marginRight: 8 }}>文本:</span>
          {text.split('').map((ch, i) => {
            const isCurrent = i === textIdx
            const inMatch = matchRanges.some(r => i >= r.start && i <= r.end)
            return (
              <span key={i} style={{
                display: 'inline-block', width: 20, textAlign: 'center',
                background: isCurrent ? 'rgba(139,92,246,0.35)' : inMatch ? 'rgba(236,72,153,0.2)' : 'transparent',
                borderBottom: isCurrent ? '2px solid #8b5cf6' : inMatch ? '2px solid #ec4899' : '2px solid transparent',
                color: isCurrent ? '#8b5cf6' : inMatch ? '#ec4899' : 'var(--text-primary)',
                fontWeight: isCurrent || inMatch ? 700 : 400,
                transition: 'all 0.15s',
              }}>{ch}</span>
            )
          })}
          {matchRanges.length > 0 && (
            <div style={{ marginTop: 6, fontSize: 11, color: '#ec4899' }}>
              匹配: {matchRanges.map(r => `"${r.pattern}"[${r.start}..${r.end}]`).join(', ')}
            </div>
          )}
        </div>
      )}

      {/* Trie SVG */}
      <SvgCanvas viewBox={`0 0 ${width} ${height}`}
        style={{ borderRadius: 0, border: 'none', minHeight: height }}>

        {/* Fail links (dashed) */}
        {failEdges.map((e, i) => {
          const a = positions[e.from], b = positions[e.to]
          if (!a || !b) return null
          const isFailPath = failSet.has(e.from)
          // Draw curved dashed line
          const midX = (a.x + b.x) / 2 + 20
          const midY = (a.y + b.y) / 2
          return (
            <g key={`f${i}`}>
              <path d={`M${a.x},${a.y} Q${midX},${midY} ${b.x},${b.y}`}
                fill="none"
                stroke={isFailPath ? '#f59e0b' : 'rgba(245,158,11,0.25)'}
                strokeWidth={isFailPath ? 2 : 1}
                strokeDasharray="4 3"
                markerEnd={isFailPath ? 'url(#arrowFail)' : undefined} />
            </g>
          )
        })}

        <defs>
          <marker id="arrowFail" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
            <path d="M0,0 L8,3 L0,6" fill="none" stroke="#f59e0b" strokeWidth="1.5" />
          </marker>
        </defs>

        {/* Tree edges */}
        {edges.map((e, i) => {
          const a = positions[e.from], b = positions[e.to]
          if (!a || !b) return null
          const hi = failSet.has(e.from) || (e.from === currentNode || e.to === currentNode)
          return (
            <g key={`e${i}`}>
              <line x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                stroke={hi && isSearching ? '#8b5cf6' : 'var(--border)'}
                strokeWidth={hi ? 2 : 1.5} />
              <text x={(a.x + b.x) / 2 + 8} y={(a.y + b.y) / 2 - 4}
                fill="var(--text-tertiary)" fontSize={10} fontFamily="var(--font-mono)">
                {e.char}
              </text>
            </g>
          )
        })}

        {/* Nodes */}
        {trieNodes.map(nd => {
          const pos = positions[nd.id]
          if (!pos) return null
          const isCurrent = nd.id === currentNode
          const isEnd = nd.isEnd
          const inFailPath = failSet.has(nd.id)

          let bg = 'var(--surface-3)'
          let fg = 'var(--text-primary)'
          let strokeColor = 'var(--border)'

          if (isCurrent) {
            bg = '#8b5cf6'
            fg = 'white'
            strokeColor = '#8b5cf6'
          } else if (isEnd && phase === 'insert') {
            bg = '#10b981'
            fg = 'white'
            strokeColor = '#10b981'
          } else if (inFailPath) {
            bg = 'rgba(245,158,11,0.2)'
            fg = '#f59e0b'
            strokeColor = '#f59e0b'
          } else if (isEnd) {
            bg = 'rgba(16,185,129,0.15)'
            fg = '#10b981'
            strokeColor = '#10b981'
          }

          return (
            <g key={nd.id} style={{
              transform: `translate(${pos.x}px,${pos.y}px)`,
              transition: 'transform 0.3s',
            }}>
              <circle r={NODE_R} fill={bg} stroke={strokeColor}
                strokeWidth={isCurrent || isEnd ? 2 : 1.5} />
              <text textAnchor="middle" dominantBaseline="central"
                fill={fg} fontSize={12} fontWeight={700} fontFamily="var(--font-mono)">
                {nd.id === 0 ? '·' : nd.char}
              </text>
              {isEnd && (
                <circle r={3} cx={NODE_R - 3} cy={-NODE_R + 3} fill="#10b981" />
              )}
              <text x={0} y={NODE_R + 12} textAnchor="middle"
                fill="var(--text-tertiary)" fontSize={8} fontFamily="var(--font-mono)">
                {nd.id}
              </text>
            </g>
          )
        })}
      </SvgCanvas>
    </div>
  )
}
