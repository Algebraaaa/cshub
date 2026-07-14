import { useMemo } from 'react'
import PlaygroundShell from './PlaygroundShell'
import VizCard from './VizCard'
import { ToolbarBtn, TextInput } from './shared'

const PRESETS = {
  small: {
    label: '示例 (8元素)',
    arr: [1, 3, 5, 7, 9, 11, 13, 15],
    ops: [
      { type: 'query', l: 1, r: 5 },
      { type: 'query', l: 0, r: 7 },
      { type: 'update', idx: 3, val: 20 },
      { type: 'query', l: 1, r: 5 },
    ],
  },
  alt: {
    label: '随机数组',
    arr: [2, 6, 1, 8, 4, 9, 3, 7],
    ops: [
      { type: 'query', l: 2, r: 6 },
      { type: 'update', idx: 0, val: 10 },
      { type: 'query', l: 0, r: 3 },
      { type: 'update', idx: 5, val: 1 },
      { type: 'query', l: 3, r: 7 },
    ],
  },
}

const NODE_R = 18
const LEVEL_H = 72

function treePosFor(n) {
  const positions = {}
  function pos(node, start, end, depth, xOffset) {
    if (start === end) {
      positions[node] = { x: xOffset[0] * 44 + 22, y: depth * LEVEL_H + 30 }
      xOffset[0]++
      return
    }
    const mid = Math.floor((start + end) / 2)
    pos(2 * node, start, mid, depth + 1, xOffset)
    const leftX = positions[2 * node]?.x ?? 0
    pos(2 * node + 1, mid + 1, end, depth + 1, xOffset)
    const rightX = positions[2 * node + 1]?.x ?? 0
    positions[node] = { x: (leftX + rightX) / 2, y: depth * LEVEL_H + 30 }
  }
  pos(1, 0, n - 1, 0, [0])
  return positions
}

function getEdges(node, start, end, n) {
  if (start === end || node >= 4 * n) return []
  const mid = Math.floor((start + end) / 2)
  return [
    { from: node, to: 2 * node, start, end, mid },
    { from: node, to: 2 * node + 1, start, end, mid },
    ...getEdges(2 * node, start, mid, n),
    ...getEdges(2 * node + 1, mid + 1, end, n),
  ]
}

export default function SegTreePlayground({ algoFn }) {
  return (
    <PlaygroundShell
      initialState={{ preset: 'small', customArr: null, inputText: '' }}
      derivePayload={state => ({
        arr: state.customArr ?? PRESETS[state.preset].arr,
        ops: PRESETS[state.preset].ops,
      })}
      computeSteps={({ arr, ops }) => algoFn(arr, ops)}
      extraToolbar={({ state, setState, ctrl }) => (
        <>
          {Object.entries(PRESETS).map(([key, p]) => (
            <ToolbarBtn key={key} active={state.preset === key} onClick={() => { setState(s => ({ ...s, preset: key, customArr: null })); ctrl.reset() }}>
              {p.label}
            </ToolbarBtn>
          ))}
        </>
      )}
      toolbarRight={({ current }) => (
        current?.result != null
          ? <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent-light)', fontFamily: 'var(--font-mono)' }}>结果: {current.result}</span>
          : null
      )}
      deriveCustomInput={({ state, setState, ctrl }) => {
        function applyCustomArr() {
          const parsed = state.inputText.split(/[\s,]+/).map(Number).filter(n => !isNaN(n))
          if (parsed.length >= 2 && parsed.length <= 16) {
            setState(s => ({ ...s, customArr: parsed }))
            ctrl.reset()
          }
        }
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 11, color: 'var(--text-tertiary)', whiteSpace: 'nowrap' }}>自定义数组</span>
            <TextInput value={state.inputText} onChange={v => setState(s => ({ ...s, inputText: v }))}
              placeholder="例：2 4 6 8 10 12 14 16"
              onSubmit={applyCustomArr} submitLabel="应用" />
            <span style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>2–16 个整数</span>
          </div>
        )
      }}
      renderViz={({ current }) => <SegTreeViz current={current} />}
    />
  )
}

function SegTreeViz({ current }) {
  const n = current.arr.length
  const positions = useMemo(() => treePosFor(n), [n])
  const edges = useMemo(() => getEdges(1, 0, n - 1, n), [n])

  const { tree, highlighted, queryRange, updateIdx, action } = current
  const hiSet = new Set(highlighted)

  const maxX = Math.max(...Object.values(positions).map(p => p.x)) + NODE_R + 10
  const maxY = Math.max(...Object.values(positions).map(p => p.y)) + NODE_R + 30

  function nodeColor(idx) {
    if (!tree[idx] && tree[idx] !== 0) return 'var(--surface-2)'
    if (hiSet.has(idx)) {
      if (action === 'query') return '#8b5cf6'
      if (action.startsWith('update')) return '#f59e0b'
      return '#3b82f6'
    }
    return 'var(--surface-2)'
  }

  return (
    <>
      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        {/* Array display */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', marginBottom: 6 }}>原始数组</div>
          <div style={{ display: 'flex', gap: 4 }}>
            {current.arr.map((v, i) => {
              const inQuery = queryRange && i >= queryRange[0] && i <= queryRange[1]
              const isUpdate = i === updateIdx
              return (
                <div key={i} style={{ textAlign: 'center' }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: isUpdate ? '#f59e0b' : inQuery ? 'rgba(139,92,246,0.2)' : 'var(--surface-2)',
                    border: `1px solid ${isUpdate ? '#f59e0b' : inQuery ? '#8b5cf6' : 'var(--border)'}`,
                    fontSize: 12, fontWeight: 700, fontFamily: 'var(--font-mono)',
                    color: isUpdate ? 'white' : 'var(--text-primary)',
                  }}>{v}</div>
                  <div style={{ fontSize: 9, color: 'var(--text-tertiary)', marginTop: 2 }}>{i}</div>
                </div>
              )
            })}
          </div>
          {queryRange && (
            <div style={{ fontSize: 10, color: 'var(--accent-light)', marginTop: 4, fontFamily: 'var(--font-mono)' }}>
              查询区间 [{queryRange[0]}, {queryRange[1]}]
            </div>
          )}
        </div>

        {/* Legend */}
        <div style={{ padding: '8px 12px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 11 }}>
          <div style={{ fontWeight: 700, color: 'var(--text-tertiary)', marginBottom: 6 }}>图例</div>
          {[
            { color: '#8b5cf6', label: '查询访问' },
            { color: '#f59e0b', label: '更新路径' },
            { color: '#3b82f6', label: '建树节点' },
          ].map(({ color, label }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: color, display: 'inline-block' }} />
              <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tree SVG */}
      <VizCard borderRadius={10} padding={0} noInner>
        <svg width={Math.max(maxX + 10, 400)} height={maxY} style={{ display: 'block' }}>
          {edges.map((e, i) => {
            const a = positions[e.from], b = positions[e.to]
            if (!a || !b) return null
            const hi = hiSet.has(e.from) && hiSet.has(e.to)
            return (
              <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                stroke={hi ? '#8b5cf6' : 'var(--border)'}
                strokeWidth={hi ? 2 : 1.5} />
            )
          })}

          {Object.entries(positions).map(([idx, p]) => {
            const i = Number(idx)
            const val = tree[i]
            if (val === undefined || val === 0 && !hiSet.has(i) && i > 1) {
              if (i >= 2 * n + 1) return null
            }
            const color = nodeColor(i)
            const textFill = hiSet.has(i) ? 'white' : 'var(--text-primary)'
            return (
              <g key={i} style={{ transform: `translate(${p.x}px,${p.y}px)`, transition: 'transform 0.3s' }}>
                <circle r={NODE_R} fill={color}
                  stroke={hiSet.has(i) ? color : 'var(--border)'}
                  strokeWidth={hiSet.has(i) ? 2 : 1.5} />
                <text textAnchor="middle" dominantBaseline="central"
                  fill={textFill} fontSize={11} fontWeight={700} fontFamily="var(--font-mono)">
                  {val ?? ''}
                </text>
              </g>
            )
          })}
        </svg>
      </VizCard>
    </>
  )
}
