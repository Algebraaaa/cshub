import PlaygroundShell from './PlaygroundShell'
import VizCard from './VizCard'
import { NumberField } from './inputs/NumberInput'

const LEGEND = [
  { color: '#3b82f6', label: '底数矩阵 base' },
  { color: '#10b981', label: '结果矩阵 result' },
  { color: '#f59e0b', label: '当前二进制位' },
  { color: '#a855f7', label: '矩阵乘法中' },
]

export default function MatrixPowPlayground({ algoFn }) {
  const apply = () => {}

  return (
    <PlaygroundShell
      initialState={{ exp: 21, expText: '21' }}
      computeSteps={s => algoFn({
        matrix: [[1, 1], [1, 0]],
        exp: parseInt(s.expText) || 10,
        mod: 1000000007,
      })}
      extraToolbar={({ state, setState }) => (
        <NumberField state={state} setState={setState} field="exp" textField="expText" label="指数" width={70} onApply={apply} />
      )}
      renderViz={({ current }) => (
        <VizCard borderRadius={10} padding="24px 20px" minHeight={360} noInner>
          <MatrixPowViz step={current} />
        </VizCard>
      )}
      legend={LEGEND}
    />
  )
}

function MatrixPowViz({ step }) {
  if (!step) return null
  const { exp, mod, result, currentBase, binaryBits, highlightBit, phase } = step

  return (
    <div>
      {/* Info bar */}
      <div style={{
        display: 'flex', gap: 14, marginBottom: 18, flexWrap: 'wrap', justifyContent: 'center',
        padding: '10px 16px', borderRadius: 10,
        background: 'var(--surface-2)', border: '1px solid var(--border)',
        fontFamily: 'var(--font-mono)', fontSize: 13,
      }}>
        <Pill label="exp" value={exp} color="#a855f7" />
        <Pill label="mod" value={mod} color="#f59e0b" />
        <Pill label="阶段" value={phaseLabel(phase)} color="#3b82f6" />
      </div>

      {/* Binary representation */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 11, color: 'var(--text-tertiary)', letterSpacing: 1, marginBottom: 10, textAlign: 'center' }}>
          指数二进制：{exp} = {binaryBits.join('')}₂
        </div>
        <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
          {binaryBits.map((bit, i) => {
            const isCurrent = i === highlightBit
            const isPast = highlightBit >= 0 && i > highlightBit
            return (
              <div key={i} style={{
                width: 36, height: 36,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: isCurrent ? '#f59e0b30' : isPast ? '#a855f720' : 'var(--surface)',
                border: `2px solid ${isCurrent ? '#f59e0b' : isPast ? '#a855f7' : 'var(--border)'}`,
                borderRadius: 8,
                fontSize: 16, fontWeight: 800,
                color: isCurrent ? '#f59e0b' : isPast ? '#a855f7' : 'var(--text-primary)',
                fontFamily: 'var(--font-mono)',
                boxShadow: isCurrent ? '0 0 10px #f59e0b55' : 'none',
                transition: 'all 0.25s',
              }}>
                {bit}
              </div>
            )
          })}
        </div>
      </div>

      {/* Matrices */}
      <div style={{ display: 'flex', gap: 24, justifyContent: 'center', flexWrap: 'wrap' }}>
        <MatrixBox label="result" matrix={result} color="#10b981" />
        <MatrixBox label="base" matrix={currentBase} color="#3b82f6" />
      </div>

      {/* Fibonacci result */}
      {phase === 'done' && (
        <div style={{
          marginTop: 16, padding: '12px 16px', borderRadius: 10, textAlign: 'center',
          background: 'var(--surface-2)', border: '1px solid #10b98144',
          fontSize: 14, color: '#10b981', fontFamily: 'var(--font-mono)',
        }}>
          Fibonacci 应用：F({exp + 1}) = <strong>{result[0][0]}</strong>，F({exp}) = <strong>{result[0][1]}</strong>
        </div>
      )}
    </div>
  )
}

function MatrixBox({ label, matrix, color }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 8, letterSpacing: 1, fontWeight: 700 }}>
        {label}
      </div>
      <div style={{
        display: 'inline-grid', gridTemplateColumns: '1fr 1fr', gap: 4,
        padding: 12, borderRadius: 10,
        background: 'var(--surface)', border: `1px solid ${color}44`,
      }}>
        {matrix.flat().map((v, i) => (
          <div key={i} style={{
            width: 72, height: 42,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: `${color}12`,
            border: `1px solid ${color}33`,
            borderRadius: 6,
            fontSize: 14, fontWeight: 700,
            color, fontFamily: 'var(--font-mono)',
          }}>
            {v}
          </div>
        ))}
      </div>
    </div>
  )
}

function Pill({ label, value, color }) {
  return (
    <span style={{ display: 'inline-flex', gap: 6, alignItems: 'baseline' }}>
      <span style={{ fontSize: 11, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</span>
      <strong style={{ color, fontWeight: 700, fontSize: 14 }}>{value}</strong>
    </span>
  )
}

function phaseLabel(p) {
  return { init: '初始化', multiply: '矩阵乘法', square: '矩阵平方', done: '完成' }[p] || p
}
