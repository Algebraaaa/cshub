import PlaygroundShell from './PlaygroundShell'
import VizCard from './VizCard'
import FormulaPanel from './FormulaPanel'

const LINES = [
  'I(X;Y) = H(X) - H(X|Y)',
  '       = Σᵢ Σⱼ p(x,y) log(p(x,y)/(p(x)p(y)))',
  '// 计算边缘分布 p(x), p(y)',
  '// 逐项计算 p(x,y) log(p(x,y)/(p(x)p(y)))',
  '// 项>0：x,y 正相关',
  '// 项=0：x,y 独立',
  'I(X;Y) = Σ term',
  '// 对称：I(X;Y) = I(Y;X) ≥ 0',
]

const PRESETS = [
  { id: 'corr', label: '高度相关', state: { table: [[0.25, 0.0], [0.25, 0.5]] } },
  { id: 'ind',  label: '相互独立', state: { table: [[0.2, 0.3], [0.2, 0.3]] } },
  { id: 'anti', label: '反向相关', state: { table: [[0.05, 0.45], [0.45, 0.05]] } },
]

export default function ItMutualInfoPlayground({ algoFn }) {
  return (
    <PlaygroundShell
      presets={PRESETS}
      initialState={{ table: [[0.25, 0.0], [0.25, 0.5]] }}
      derivePayload={s => ({ table: s.table })}
      computeSteps={payload => algoFn(payload)}
      renderViz={({ current }) => (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, minHeight: 440 }}>
          <VizCard>
            <MutualInfoViz current={current} />
          </VizCard>
          <FormulaPanel lines={LINES} highlightLine={current.highlightLine} />
        </div>
      )}
    />
  )
}

function MutualInfoViz({ current }) {
  const { P, cellIdx, Ixy, Hx, Hy, Hxy, HxGy } = current
  const m = P.length, n = P[0].length

  // 文氏图
  const cx = 150, cy = 130, r = 70, dx = 45
  // 简单画两个圆，交集表示互信息
  return (
    <div>
      <svg viewBox="0 0 380 280" style={{ width: '100%', height: 'auto', maxHeight: 240 }}>
        {/* 文氏图 */}
        <circle cx={cx - dx} cy={cy} r={r} fill="rgba(6,182,212,0.25)" stroke="var(--blue)" strokeWidth="2" />
        <circle cx={cx + dx} cy={cy} r={r} fill="rgba(236,72,153,0.25)" stroke="var(--pink)" strokeWidth="2" />
        <text x={cx - dx - 40} y={cy - r - 8} fontSize="11" fill="var(--blue)" fontFamily="var(--font-mono)" fontWeight="700">H(X)</text>
        <text x={cx + dx - 10} y={cy - r - 8} fontSize="11" fill="var(--pink)" fontFamily="var(--font-mono)" fontWeight="700">H(Y)</text>
        <text x={cx - 18} y={cy + 4} fontSize="13" fill="var(--accent-light)" fontFamily="var(--font-mono)" fontWeight="800">
          I={Ixy.toFixed(2)}
        </text>
        <text x={cx - dx - 55} y={cy + 15} fontSize="9" fill="var(--text-secondary)" fontFamily="var(--font-mono)">
          H(X|Y)={(HxGy).toFixed(2)}
        </text>
        <text x={cx + dx + 5} y={cy + 15} fontSize="9" fill="var(--text-secondary)" fontFamily="var(--font-mono)">
          H(Y|X)={(Hxy-Hx).toFixed(2)}
        </text>

        {/* 信息块 */}
        <g transform="translate(10, 220)">
          <rect width={360} height={46} rx="6" fill="var(--accent-soft)" stroke="var(--accent-border)" opacity="0.6" />
          <text x="10" y="17" fontSize="10.5" fill="var(--text-primary)" fontFamily="var(--font-mono)">
            H(X)={Hx.toFixed(3)}  H(Y)={Hy.toFixed(3)}  H(X,Y)={Hxy.toFixed(3)}
          </text>
          <text x="10" y="35" fontSize="10.5" fill="var(--accent-light)" fontFamily="var(--font-mono)" fontWeight="700">
            I(X;Y) = H(X)-H(X|Y) = {Ixy.toFixed(4)} 比特
          </text>
        </g>
      </svg>
      {/* 小概率表 */}
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${n + 1}, 1fr)`, gap: 4, fontSize: 11, fontFamily: 'var(--font-mono)', padding: '4px 12px' }}>
        <div />
        {Array.from({ length: n }, (_, j) => <div key={j} style={{ textAlign: 'center', color: 'var(--text-tertiary)', fontWeight: 600 }}>y{j+1}</div>)}
        {Array.from({ length: m }, (_, i) => (
          <div key={`row-${i}`} style={{ display: 'contents' }}>
            <div key={'l'+i} style={{ color: 'var(--text-tertiary)', fontWeight: 600, textAlign: 'center' }}>x{i+1}</div>
            {Array.from({ length: n }, (_, j) => {
              const idx = i * n + j
              const active = cellIdx === idx
              return (
                <div key={`cell-${i}-${j}`} style={{
                  textAlign: 'center',
                  padding: '4px 2px',
                  borderRadius: 4,
                  background: active ? 'var(--accent-soft)' : 'var(--surface)',
                  border: active ? '1px solid var(--accent)' : '1px solid var(--border)',
                  color: active ? 'var(--accent-light)' : 'var(--text-primary)',
                  fontWeight: active ? 700 : 400,
                  transition: 'all 0.3s',
                }}>
                  {P[i][j].toFixed(3)}
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
