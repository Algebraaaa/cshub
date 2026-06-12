import PlaygroundShell from './PlaygroundShell'
import VizCard from './VizCard'
import { NumberField } from './inputs/NumberInput'

const LEGEND = [
  { color: '#10b981', label: '质数' },
  { color: '#ef4444', label: '合数' },
  { color: '#f59e0b', label: '当前 i' },
  { color: '#a855f7', label: '正在标记的合数 i×p' },
  { color: '#3b82f6', label: '当前质因子 p' },
]

export default function SievePlayground({ algoFn }) {
  const apply = () => {}

  return (
    <PlaygroundShell
      initialState={{ n: 30, nText: '30' }}
      computeSteps={s => algoFn(parseInt(s.nText) || 30)}
      extraToolbar={({ state, setState }) => (
        <NumberField state={state} setState={setState} field="n" textField="nText" label="N" width={70} onApply={apply} />
      )}
      renderViz={({ current }) => (
        <VizCard borderRadius={10} padding="24px 20px" minHeight={340} noInner>
          <SieveViz step={current} />
        </VizCard>
      )}
      legend={LEGEND}
    />
  )
}

function SieveViz({ step }) {
  if (!step) return null
  const { n, isPrime, primes, current, currentPrime, composite, highlightIdx, phase } = step

  // Build grid
  const cols = Math.min(n - 1, 15)
  const cells = []
  for (let i = 2; i <= n; i++) cells.push(i)

  return (
    <div>
      {/* Info bar */}
      <div style={{
        display: 'flex', gap: 14, marginBottom: 18, flexWrap: 'wrap', justifyContent: 'center',
        padding: '10px 16px', borderRadius: 10,
        background: 'var(--surface-2)', border: '1px solid var(--border)',
        fontFamily: 'var(--font-mono)', fontSize: 13,
      }}>
        <Pill label="i" value={current >= 0 ? current : '—'} color="#f59e0b" />
        <Pill label="p" value={currentPrime >= 0 ? currentPrime : '—'} color="#3b82f6" />
        <Pill label="i×p" value={composite >= 0 ? composite : '—'} color="#a855f7" />
        <Pill label="质数数" value={primes.length} color="#10b981" />
      </div>

      {/* Number grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gap: 5,
        marginBottom: 20,
      }}>
        {cells.map(num => {
          const isCurI = num === current
          const isMarked = num === highlightIdx
          const isP = isPrime[num]

          let bg, border, color, shadow
          if (isMarked) {
            bg = '#a855f730'; border = '2px solid #a855f7'; color = '#a855f7'; shadow = '0 0 10px #a855f755'
          } else if (isCurI) {
            bg = '#f59e0b30'; border = '2px solid #f59e0b'; color = '#f59e0b'; shadow = '0 0 10px #f59e0b55'
          } else if (phase !== 'init' && isP) {
            bg = '#10b98118'; border = '1px solid #10b98166'; color = '#10b981'; shadow = 'none'
          } else if (phase !== 'init' && !isP) {
            bg = '#ef444412'; border = '1px solid #ef444444'; color = '#ef4444'; shadow = 'none'
          } else {
            bg = 'var(--surface)'; border = '1px solid var(--border)'; color = 'var(--text-secondary)'; shadow = 'none'
          }

          return (
            <div key={num} style={{
              width: '100%', aspectRatio: '1',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: bg, border, borderRadius: 8,
              fontSize: Math.min(14, 180 / cols), fontWeight: 700,
              color, fontFamily: 'var(--font-mono)',
              boxShadow: shadow, transition: 'all 0.2s',
            }}>
              {num}
            </div>
          )
        })}
      </div>

      {/* Primes list */}
      <div style={{
        padding: '10px 14px', borderRadius: 10,
        background: 'var(--surface-2)', border: '1px solid var(--border)',
      }}>
        <div style={{ fontSize: 11, color: '#10b981', fontWeight: 700, letterSpacing: 1, marginBottom: 8 }}>
          PRIMES（{primes.length} 个）
        </div>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {primes.length === 0 && (
            <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>（空）</span>
          )}
          {primes.map((p, i) => (
            <span key={i} style={{
              padding: '3px 10px', borderRadius: 6, fontSize: 12,
              background: '#10b98118', border: '1px solid #10b98144',
              color: '#10b981', fontWeight: 700, fontFamily: 'var(--font-mono)',
            }}>
              {p}
            </span>
          ))}
        </div>
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
