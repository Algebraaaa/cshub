import PlaygroundShell from './PlaygroundShell'
import VizCard from './VizCard'
import { NumberField } from './inputs/NumberInput'

const LEGEND = [
  { color: '#3b82f6', label: '底数 base' },
  { color: '#10b981', label: '结果 result' },
  { color: '#f59e0b', label: '当前二进制位' },
  { color: '#a855f7', label: '已处理的位' },
]

export default function FastPowPlayground({ algoFn }) {
  const apply = () => {} // PlaygroundShell handles re-compute via state change

  return (
    <PlaygroundShell
      initialState={{ base: 3, exp: 45, mod: 1000000007, baseText: '3', expText: '45', modText: '1000000007' }}
      computeSteps={s => algoFn({
        base: parseInt(s.baseText) || 3,
        exp: parseInt(s.expText) || 13,
        mod: parseInt(s.modText) || 1000000007,
      })}
      extraToolbar={({ state, setState }) => (
        <>
          <NumberField state={state} setState={setState} field="base" textField="baseText" label="底数" width={60} onApply={apply} />
          <NumberField state={state} setState={setState} field="exp" textField="expText" label="指数" width={60} onApply={apply} />
          <NumberField state={state} setState={setState} field="mod" textField="modText" label="MOD" width={90} onApply={apply} />
        </>
      )}
      renderViz={({ current }) => (
        <VizCard borderRadius={10} padding="24px 20px" minHeight={320} noInner>
          <FastPowViz step={current} />
        </VizCard>
      )}
      legend={LEGEND}
    />
  )
}

function FastPowViz({ step }) {
  if (!step) return null
  const { base, exp, mod, result, currentBase, binaryBits, highlightBit, phase } = step

  return (
    <div>
      {/* Info bar */}
      <div style={{
        display: 'flex', gap: 14, marginBottom: 20, flexWrap: 'wrap', justifyContent: 'center',
        padding: '10px 16px', borderRadius: 10,
        background: 'var(--surface-2)', border: '1px solid var(--border)',
        fontFamily: 'var(--font-mono)', fontSize: 13,
      }}>
        <Pill label="base" value={base} color="#3b82f6" />
        <Pill label="exp" value={exp} color="#a855f7" />
        <Pill label="mod" value={mod} color="#f59e0b" />
      </div>

      {/* Binary representation */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 11, color: 'var(--text-tertiary)', letterSpacing: 1, marginBottom: 10 }}>
          指数二进制：{exp} = {binaryBits.join('')}₂
        </div>
        <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
          {binaryBits.map((bit, i) => {
            const isCurrent = i === highlightBit
            const isPast = highlightBit >= 0 && i > highlightBit
            return (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{
                  width: 40, height: 40,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: isCurrent ? '#f59e0b30' : isPast ? '#a855f720' : 'var(--surface)',
                  border: `2px solid ${isCurrent ? '#f59e0b' : isPast ? '#a855f7' : 'var(--border)'}`,
                  borderRadius: 8,
                  fontSize: 18, fontWeight: 800,
                  color: isCurrent ? '#f59e0b' : isPast ? '#a855f7' : 'var(--text-primary)',
                  fontFamily: 'var(--font-mono)',
                  boxShadow: isCurrent ? '0 0 12px #f59e0b55' : 'none',
                  transition: 'all 0.25s',
                }}>
                  {bit}
                </div>
                <div style={{ fontSize: 9, color: 'var(--text-tertiary)', marginTop: 4 }}>
                  2^{binaryBits.length - 1 - i}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Values */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, maxWidth: 400, margin: '0 auto',
      }}>
        <ValueBox label="result" value={result} color="#10b981" />
        <ValueBox label="currentBase" value={currentBase} color="#3b82f6" />
      </div>

      {/* Formula */}
      {phase !== 'init' && (
        <div style={{
          marginTop: 16, textAlign: 'center', fontSize: 13,
          color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)',
        }}>
          {base}<sup>{exp}</sup> mod {mod} = <strong style={{ color: '#10b981' }}>{result}</strong>
        </div>
      )}
    </div>
  )
}

function ValueBox({ label, value, color }) {
  return (
    <div style={{
      padding: '14px 16px', borderRadius: 10,
      background: 'var(--surface)', border: `1px solid ${color}44`,
      textAlign: 'center',
    }}>
      <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 6, letterSpacing: 0.5 }}>
        {label}
      </div>
      <div style={{
        fontSize: 22, fontWeight: 800, color, fontFamily: 'var(--font-mono)',
      }}>
        {value}
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
