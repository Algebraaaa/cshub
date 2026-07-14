import PlaygroundShell from './PlaygroundShell'

const CELL = 38
const PAD = 12

const PRESET_GRIDS = {
  maze1: {
    label: '迷宫1',
    grid: [
      [0,0,0,0,0,0,0,0],
      [0,1,1,0,1,1,1,0],
      [0,0,1,0,0,0,1,0],
      [0,0,1,1,1,0,1,0],
      [0,0,0,0,1,0,0,0],
      [0,1,1,0,1,1,1,0],
      [0,0,0,0,0,0,0,0],
    ],
    start: [0, 0],
    end: [6, 7],
  },
  maze2: {
    label: '迷宫2',
    grid: [
      [0,0,0,1,0,0,0,0],
      [0,1,0,1,0,1,1,0],
      [0,1,0,0,0,0,1,0],
      [0,1,1,1,1,0,1,0],
      [0,0,0,0,1,0,0,0],
      [1,1,0,0,1,1,0,0],
      [0,0,0,0,0,0,0,0],
    ],
    start: [0, 0],
    end: [6, 7],
  },
  open: {
    label: '开阔地',
    grid: [
      [0,0,0,0,0,0],
      [0,0,0,0,0,0],
      [0,0,1,1,0,0],
      [0,0,1,1,0,0],
      [0,0,0,0,0,0],
      [0,0,0,0,0,0],
    ],
    start: [0, 0],
    end: [5, 5],
  },
}

function cellColor(r, c, data) {
  if (!data) return 'var(--surface-2)'
  const [sr, sc] = data.start, [er, ec] = data.end
  if (r === sr && c === sc) return '#10b981'
  if (r === er && c === ec) return '#ef4444'
  if (data.grid[r][c] === 1) return 'var(--surface-3)'
  if (data.path && data.path.some(([pr, pc]) => pr === r && pc === c)) return '#8b5cf6'
  if (data.current && data.current.r === r && data.current.c === c) return '#f59e0b'
  if (data.closed.some(p => p.r === r && p.c === c)) return 'rgba(59,130,246,0.3)'
  if (data.open.some(p => p.r === r && p.c === c)) return 'rgba(139,92,246,0.2)'
  return 'var(--surface)'
}

function cellBorder(r, c, data) {
  if (!data) return 'var(--border)'
  const [sr, sc] = data.start, [er, ec] = data.end
  if (r === sr && c === sc) return '#10b981'
  if (r === er && c === ec) return '#ef4444'
  if (data.current && data.current.r === r && data.current.c === c) return '#f59e0b'
  if (data.path && data.path.some(([pr, pc]) => pr === r && pc === c)) return '#8b5cf6'
  return 'var(--border)'
}

const PRESET_LIST = Object.entries(PRESET_GRIDS).map(([id, p]) => ({ id, label: p.label, grid: p.grid, start: p.start, end: p.end }))

export default function AStarPlayground({ algoFn }) {
  return (
    <PlaygroundShell
      presets={PRESET_LIST}
      computeSteps={({ grid, start, end }) => algoFn(grid, start, end)}
      toolbarRight={({ current }) => (
        <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
          Open: {current?.open.length} &nbsp; Closed: {current?.closed.length}
        </span>
      )}
      renderViz={({ current, presetId }) => {
        const { grid } = PRESET_GRIDS[presetId]
        const rows = grid.length, cols = grid[0].length
        const svgW = PAD * 2 + cols * CELL
        const svgH = PAD * 2 + rows * CELL

        return (
          <div style={{ display: 'flex', gap: 16, marginBottom: 16, flexWrap: 'wrap' }}>
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: PAD }}>
              <svg width={svgW} height={svgH} style={{ display: 'block' }}>
                {Array.from({ length: rows }, (_, r) =>
                  Array.from({ length: cols }, (_, c) => {
                    const x = PAD + c * CELL, y = PAD + r * CELL
                    const bg = cellColor(r, c, current)
                    const bd = cellBorder(r, c, current)
                    const gv = current.g[r][c]
                    const fv = current.f[r][c]
                    const isWall = grid[r][c] === 1
                    const [sr, sc] = current.start, [er, ec] = current.end
                    const isStart = r === sr && c === sc, isEnd = r === er && c === ec

                    return (
                      <g key={`${r}-${c}`}>
                        <rect x={x} y={y} width={CELL - 1} height={CELL - 1}
                          rx={3} fill={bg} stroke={bd} strokeWidth={bd !== 'var(--border)' ? 2 : 1} />
                        {isStart && <text x={x + CELL/2} y={y + CELL/2} textAnchor="middle" dominantBaseline="central" fill="white" fontSize={11} fontWeight={700}>S</text>}
                        {isEnd && <text x={x + CELL/2} y={y + CELL/2} textAnchor="middle" dominantBaseline="central" fill="white" fontSize={11} fontWeight={700}>E</text>}
                        {!isWall && !isStart && !isEnd && gv !== Infinity && (
                          <>
                            <text x={x + 3} y={y + 10} fill="var(--text-tertiary)" fontSize={8}>g={gv}</text>
                            <text x={x + 3} y={y + CELL - 3} fill="var(--text-tertiary)" fontSize={8}>f={fv}</text>
                          </>
                        )}
                      </g>
                    )
                  })
                )}
              </svg>
            </div>

            <div style={{ flex: 1, minWidth: 140, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ padding: '10px 12px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', marginBottom: 6 }}>图例</div>
                {[
                  { color: '#10b981', label: '起点 S' },
                  { color: '#ef4444', label: '终点 E' },
                  { color: '#f59e0b', label: '当前节点' },
                  { color: 'rgba(139,92,246,0.2)', label: 'Open 集' },
                  { color: 'rgba(59,130,246,0.3)', label: 'Closed 集' },
                  { color: '#8b5cf6', label: '最短路径' },
                  { color: 'var(--surface-3)', label: '障碍物' },
                ].map(({ color, label }) => (
                  <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                    <span style={{ width: 12, height: 12, borderRadius: 2, background: color, display: 'inline-block', border: '1px solid var(--border)', flexShrink: 0 }} />
                    <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{label}</span>
                  </div>
                ))}
              </div>
              {current.current && (
                <div style={{ padding: '10px 12px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, fontFamily: 'var(--font-mono)' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', marginBottom: 4 }}>当前节点</div>
                  <div style={{ fontSize: 12, color: 'var(--text-primary)' }}>({current.current.r}, {current.current.c})</div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>
                    g={current.g[current.current.r][current.current.c]} &nbsp;
                    f={current.f[current.current.r][current.current.c]}
                  </div>
                </div>
              )}
            </div>
          </div>
        )
      }}
    />
  )
}
