import PlaygroundShell from './PlaygroundShell'
import VizCard from './VizCard'
import { TextInput } from './shared'
import FormulaPanel from './FormulaPanel'

const LINES = [
  'I(x) = -log₂ p(x)                // 定义：自信息',
  '已知 p(x) = P                    // 代入概率',
  'I(x) = -log₂ P                   // 计算数值',
  '单位：比特(bit)；p 越小 I 越大',
]

export default function ItSelfInfoPlayground({ algoFn }) {
  return (
    <PlaygroundShell
      presets={[
        { id: 'p05', label: 'p=0.50', state: { prob: 0.5, text: '0.5' } },
        { id: 'p25', label: 'p=0.25', state: { prob: 0.25, text: '0.25' } },
        { id: 'p1',  label: 'p=0.10', state: { prob: 0.1,  text: '0.1' } },
        { id: 'p01', label: 'p=0.01', state: { prob: 0.01, text: '0.01' } },
      ]}
      initialState={{ prob: 0.25, text: '0.25' }}
      derivePayload={s => ({ prob: s.prob })}
      computeSteps={payload => algoFn(payload)}
      extraToolbar={({ state, setState, ctrl }) => (
        <TextInput
          value={state.text}
          placeholder="输入概率 p∈(0,1]，例如 0.25"
          onChange={v => setState(s => ({ ...s, text: v }))}
          onSubmit={() => {
            const v = parseFloat(state.text)
            if (!isNaN(v) && v > 0 && v <= 1) {
              setState(s => ({ ...s, prob: v }))
              ctrl.reset()
            }
          }}
          submitLabel="应用"
        />
      )}
      renderViz={({ current }) => (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, minHeight: 420 }}>
          <VizCard>
            <SelfInfoViz current={current} />
          </VizCard>
          <FormulaPanel lines={LINES} highlightLine={current.highlightLine} />
        </div>
      )}
    />
  )
}

function SelfInfoViz({ current }) {
  const { p, info } = current
  // 曲线：0.01..1 上的 -log2(p)
  const W = 380, H = 260
  const pad = 40
  const pts = []
  for (let x = 0.01; x <= 1; x += 0.02) {
    pts.push([x, -Math.log2(x)])
  }
  const sx = x => pad + x * (W - 2 * pad)
  const maxY = 7
  const sy = y => H - pad - (y / maxY) * (H - 2 * pad)
  const pathD = pts.map(([x, y], i) => `${i === 0 ? 'M' : 'L'} ${sx(x)} ${sy(y)}`).join(' ')
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', maxHeight: 320 }}>
      <defs>
        <linearGradient id="selfinfo-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#06b6d4" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>
      {/* 坐标轴 */}
      <line x1={pad} y1={H - pad} x2={W - pad} y2={H - pad} stroke="var(--glass-border-strong)" strokeWidth="1.5" />
      <line x1={pad} y1={pad} x2={pad} y2={H - pad} stroke="var(--glass-border-strong)" strokeWidth="1.5" />
      <text x={W/2} y={H - 8} textAnchor="middle" fontSize="11" fill="var(--text-tertiary)" fontFamily="var(--font-mono)">p(x)</text>
      <text x={12} y={H/2} textAnchor="middle" fontSize="11" fill="var(--text-tertiary)" fontFamily="var(--font-mono)" transform={`rotate(-90, 12, ${H/2})`}>I(x) 比特</text>
      {/* 曲线 */}
      <path d={pathD} fill="none" stroke="url(#selfinfo-g)" strokeWidth="2.5" style={{ filter: 'drop-shadow(0 0 6px rgba(6,182,212,0.4))' }} />
      {/* 曲线上当前点 */}
      <circle cx={sx(p)} cy={sy(Math.min(info, maxY))} r="7" fill="var(--accent)" stroke="white" strokeWidth="2" style={{ filter: 'drop-shadow(0 0 8px var(--accent))' }} />
      <line x1={sx(p)} y1={sy(Math.min(info, maxY))} x2={sx(p)} y2={H - pad} stroke="var(--accent)" strokeDasharray="3 3" strokeWidth="1" opacity="0.6" />
      <line x1={pad} y1={sy(Math.min(info, maxY))} x2={sx(p)} y2={sy(Math.min(info, maxY))} stroke="var(--accent)" strokeDasharray="3 3" strokeWidth="1" opacity="0.6" />
      {/* 数值标签 */}
      <text x={sx(p) + 10} y={sy(Math.min(info, maxY)) - 10} fontSize="12" fill="var(--accent-light)" fontFamily="var(--font-mono)" fontWeight="700">
        I = {info.toFixed(3)} bit
      </text>
      <text x={sx(p)} y={H - pad + 18} fontSize="11" fill="var(--text-secondary)" fontFamily="var(--font-mono)" textAnchor="middle">
        p = {p.toFixed(3)}
      </text>
      {/* 刻度 */}
      {[0.1, 0.25, 0.5, 0.75, 1].map(v => (
        <g key={v}>
          <line x1={sx(v)} y1={H - pad} x2={sx(v)} y2={H - pad + 3} stroke="var(--text-tertiary)" />
          <text x={sx(v)} y={H - pad + 14} fontSize="9" fill="var(--text-tertiary)" fontFamily="var(--font-mono)" textAnchor="middle">{v}</text>
        </g>
      ))}
      {[1, 2, 3, 4, 5, 6].map(v => (
        <g key={v}>
          <line x1={pad - 3} y1={sy(v)} x2={pad} y2={sy(v)} stroke="var(--text-tertiary)" />
          <text x={pad - 6} y={sy(v) + 3} fontSize="9" fill="var(--text-tertiary)" fontFamily="var(--font-mono)" textAnchor="end">{v}</text>
        </g>
      ))}
    </svg>
  )
}
