import PlaygroundShell from './PlaygroundShell'
import VizCard from './VizCard'
import FormulaPanel from './FormulaPanel'

const LINES = [
  '马尔可夫信道：信道状态 S_t 按马尔可夫链演化',
  'P(Y_t | X_t, S_t) 取决于当前状态和输入',
  '// 好状态(G)：低错误率 p_g',
  '// 坏状态(B)：高错误率 p_b',
  'S_{t+1} ~ P_state[S_t, :]',
  'Y_t ~ P_channel[S_t, X_t, :]',
  '错误呈突发（成簇出现）',
  '交织 interleaving 可打散突发错误',
]

export default function ItMarkovChannelPlayground({ algoFn }) {
  return (
    <PlaygroundShell
      presets={[{ id: 'default', label: 'Gilbert-Elliott 模型' }]}
      computeSteps={() => algoFn()}
      renderViz={({ current }) => (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, minHeight: 460 }}>
          <VizCard>
            <MarkovChannelViz current={current} />
          </VizCard>
          <FormulaPanel lines={LINES} highlightLine={current.highlightLine} />
        </div>
      )}
    />
  )
}

function MarkovChannelViz({ current }) {
  const { S, states, P_given_S, inputs, outputs, errors, stateSeq, t } = current
  const W = 400, H = 380
  const positions = [{ x: 100, y: 110 }, { x: 300, y: 110 }]

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', maxHeight: 420 }}>
      <defs>
        <marker id="mc-arrow" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
          <polygon points="0 0, 8 3, 0 6" fill="var(--accent)" />
        </marker>
      </defs>
      {/* 信道状态节点 */}
      <text x="200" y="24" fontSize="11" textAnchor="middle" fill="var(--text-tertiary)" fontFamily="var(--font-mono)" fontWeight="700">信道状态图</text>
      {S.map((row, i) => row.map((p, j) => {
        if (p < 0.01) return null
        const from = positions[i], to = positions[j]
        if (i === j) {
          const cx = from.x, cy = from.y - 50
          return (
            <g key={`${i}-${j}`}>
              <path d={`M ${from.x} ${from.y - 28} C ${cx - 30} ${cy - 22}, ${cx + 30} ${cy - 22}, ${from.x} ${from.y - 28}`}
                    fill="none" stroke="var(--glass-border-strong)" strokeWidth="1.5" markerEnd="url(#mc-arrow)" />
              <text x={cx} y={cy - 26} fontSize="10" fill="var(--accent-light)" textAnchor="middle" fontFamily="var(--font-mono)" fontWeight="700">
                {p.toFixed(2)}
              </text>
            </g>
          )
        }
        const dx = to.x - from.x, dy = to.y - from.y
        const len = Math.hypot(dx, dy)
        const ux = dx / len, uy = dy / len
        const offX = -uy * 6, offY = ux * 6
        return (
          <g key={`${i}-${j}`}>
            <line x1={from.x + ux * 28 + offX} y1={from.y + uy * 28 + offY}
                  x2={to.x - ux * 30 + offX} y2={to.y - uy * 30 + offY}
                  stroke="var(--accent)" strokeWidth="1.8" opacity="0.75" markerEnd="url(#mc-arrow)" />
            <text x={(from.x + to.x) / 2 + offX * 1.3} y={(from.y + to.y) / 2 + offY * 1.3 - 3}
                  fontSize="10" fill="var(--accent-light)" fontFamily="var(--font-mono)" fontWeight="700" textAnchor="middle">
              {p.toFixed(2)}
            </text>
          </g>
        )
      }))}
      {positions.map((pos, i) => {
        const active = t >= 0 && stateSeq[t] === i
        return (
          <g key={i}>
            <circle cx={pos.x} cy={pos.y} r="28"
                    fill={active ? (i === 0 ? 'var(--green)' : 'var(--red)') : 'var(--surface)'}
                    stroke="var(--accent)" strokeWidth={active ? 3 : 1.5}
                    style={{ filter: active ? 'drop-shadow(0 0 10px ' + (i === 0 ? 'var(--green)' : 'var(--red)') + ')' : 'none', transition: 'all 0.3s' }} />
            <text x={pos.x} y={pos.y - 2} fontSize="13" textAnchor="middle"
                  fill={active ? '#000' : 'var(--text-primary)'} fontWeight="800">
              {states[i]}
            </text>
            <text x={pos.x} y={pos.y + 12} fontSize="9" textAnchor="middle"
                  fill={active ? '#000' : 'var(--accent-light)'} fontFamily="var(--font-mono)" fontWeight="700">
              Pe={P_given_S[i][0][1]}
            </text>
          </g>
        )
      })}

      {/* 传输序列 */}
      <g transform="translate(10, 190)">
        <text x="0" y="0" fontSize="10" fill="var(--text-tertiary)" fontFamily="var(--font-mono)" fontWeight="700">传输演示：</text>
        <g transform="translate(0, 14)">
          {inputs.map((x, i) => {
            const isActive = t === i
            const hasError = i <= t && errors[i]
            const st = i <= t ? stateSeq[i] : -1
            return (
              <g key={i} transform={`translate(${i * 54}, 0)`}>
                <rect width="50" height="74" rx="5"
                      fill={isActive ? 'var(--accent-soft)' : 'var(--surface)'}
                      stroke={isActive ? 'var(--accent)' : hasError ? 'var(--red)' : 'var(--border)'}
                      strokeWidth={isActive ? 2 : 1}
                      style={{ filter: isActive ? 'drop-shadow(0 0 6px var(--accent-soft))' : 'none', transition: 'all 0.3s' }} />
                <text x="25" y="14" fontSize="9" textAnchor="middle" fill="var(--text-tertiary)" fontFamily="var(--font-mono)">t={i+1}</text>
                <text x="25" y="28" fontSize="10" textAnchor="middle" fill="var(--blue)" fontFamily="var(--font-mono)" fontWeight="700">X={x}</text>
                <text x="25" y="42" fontSize="9" textAnchor="middle" fill={st === 0 ? 'var(--green)' : st === 1 ? 'var(--red)' : 'var(--text-tertiary)'} fontFamily="var(--font-mono)" fontWeight="600">
                  {st < 0 ? '?' : states[st]}
                </text>
                <text x="25" y="56" fontSize="10" textAnchor="middle"
                      fill={i > t ? 'var(--text-tertiary)' : hasError ? 'var(--red)' : 'var(--green)'}
                      fontFamily="var(--font-mono)" fontWeight="700">
                  Y={i > t ? '?' : outputs[i]}
                </text>
                <text x="25" y="69" fontSize="8" textAnchor="middle"
                      fill={i > t ? 'var(--text-tertiary)' : hasError ? 'var(--red)' : 'var(--text-secondary)'} fontFamily="var(--font-mono)">
                  {i > t ? '' : hasError ? '✗ 错误' : '✓ 正确'}
                </text>
              </g>
            )
          })}
        </g>
      </g>
      {/* 状态矩阵 */}
      <g transform="translate(20, 310)">
        <text x="0" y="0" fontSize="10" fill="var(--text-tertiary)" fontFamily="var(--font-mono)" fontWeight="700">信道状态转移 S：</text>
        {S.map((row, i) => (
          <g key={i} transform={`translate(0, ${12 + i * 16})`}>
            {row.map((p, j) => (
              <g key={j} transform={`translate(${j * 60}, 0)`}>
                <rect width="55" height="14" rx="2" fill="var(--surface)" stroke="var(--border)" />
                <text x="27.5" y="11" fontSize="9.5" textAnchor="middle" fill="var(--text-primary)" fontFamily="var(--font-mono)">
                  {p.toFixed(2)}
                </text>
              </g>
            ))}
          </g>
        ))}
      </g>
    </svg>
  )
}
