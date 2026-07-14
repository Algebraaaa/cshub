import PlaygroundShell from './PlaygroundShell'
import VizCard from './VizCard'
import { TextInput } from './shared'

const LEGEND = [
  { color: '#ef4444', label: '符号位 sign (1 bit)' },
  { color: '#3b82f6', label: '阶码 exponent (8 bits)' },
  { color: '#22c55e', label: '尾数 mantissa (23 bits)' },
  { color: '#fbbf24', label: '当前步骤焦点' },
]

const PRESETS = [
  { label: '13.625', value: 13.625 },
  { label: '−0.15625', value: -0.15625 },
  { label: '0.1（不精确！）', value: 0.1 },
  { label: '1.0', value: 1.0 },
  { label: '0', value: 0 },
  { label: '∞', value: Infinity },
  { label: 'NaN', value: NaN },
]

export default function IEEE754Playground({ algoFn }) {
  return (
    <PlaygroundShell
      initialState={{ value: 13.625, text: '13.625' }}
      presets={PRESETS.map(p => ({ id: p.label, label: p.label, state: { value: p.value, text: String(p.value) } }))}
      derivePayload={state => ({ value: state.value })}
      computeSteps={({ value }) => algoFn({ value })}
      legend={LEGEND}
      extraToolbar={({ state, setState, ctrl }) => {
        function apply() {
          const v = state.text.toLowerCase().trim()
          const parsed = v === 'inf' || v === '+inf' || v === 'infinity'
            ? Infinity
            : v === '-inf' || v === '-infinity'
              ? -Infinity
              : v === 'nan'
                ? NaN
                : Number(state.text)
          setState(s => ({ ...s, value: parsed }))
          ctrl.reset()
        }
        return (
          <>
            <span style={{ fontSize: 12.5, color: 'var(--text-tertiary)' }}>自定义</span>
            <TextInput value={state.text} onChange={v => setState(s => ({ ...s, text: v }))}
              placeholder="13.625" onSubmit={apply} width={140} />
          </>
        )
      }}
      renderViz={({ current }) => (
        <VizCard borderRadius={10} padding="24px 20px" minHeight={320} noInner>
          <IEEE754Viz step={current} />
        </VizCard>
      )}
    />
  )
}

function IEEE754Viz({ step }) {
  if (!step) return null
  const { value, sign, exponentBits, mantissaBits, biasedExp, unbiasedExp, normalizedSig, special, phase, binaryRep } = step

  const focus = {
    sign: phase === 'sign',
    exp: phase === 'bias' || phase === 'normalize',
    mantissa: phase === 'mantissa' || phase === 'normalize',
  }

  return (
    <div>
      {/* Input value */}
      <div style={{ textAlign: 'center', marginBottom: 18 }}>
        <div style={{ fontSize: 11, color: 'var(--text-tertiary)', letterSpacing: 1 }}>输入值</div>
        <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--accent-light)', fontFamily: 'var(--font-mono)' }}>
          {Number.isNaN(value) ? 'NaN' : value === Infinity ? '+∞' : value === -Infinity ? '−∞' : value}
        </div>
        {binaryRep && (
          <div style={{ marginTop: 6, fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
            二进制：{binaryRep}
          </div>
        )}
        {normalizedSig && (
          <div style={{ marginTop: 4, fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
            规格化：{normalizedSig}
          </div>
        )}
      </div>

      {/* 32-bit binary breakdown */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
        <div style={{ display: 'flex', gap: 2 }}>
          {/* Sign bit */}
          <BitGroup label="S" subtitle="符号" bits={String(sign)} color="#ef4444" highlight={focus.sign} />
          {/* Exponent 8 bits */}
          <BitGroup label="E" subtitle={`阶码 (${unbiasedExp >= 0 ? '+' : ''}${unbiasedExp} + 127 = ${biasedExp})`} bits={exponentBits} color="#3b82f6" highlight={focus.exp} />
          {/* Mantissa 23 bits */}
          <BitGroup label="M" subtitle="尾数 (隐含 1.)" bits={mantissaBits} color="#22c55e" highlight={focus.mantissa} />
        </div>

        {/* Bit count summary */}
        <div style={{ marginTop: 10, fontSize: 11, color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>
          1 (S) + 8 (E) + 23 (M) = 32 bits（IEEE 754 单精度 / float）
        </div>

        {special && (
          <div style={{
            marginTop: 14, padding: '8px 14px', borderRadius: 8,
            background: 'rgba(251, 191, 36, 0.10)', border: '1px solid rgba(251, 191, 36, 0.35)',
            fontSize: 12, color: '#fbbf24', fontFamily: 'var(--font-mono)',
          }}>
            特殊值：{special.toUpperCase()}
          </div>
        )}
      </div>
    </div>
  )
}

function BitGroup({ label, subtitle, bits, color, highlight }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '8px 6px',
      borderRadius: 8,
      background: highlight ? `${color}18` : 'transparent',
      border: highlight ? `2px solid ${color}` : '1px solid transparent',
      transition: 'all 0.2s',
    }}>
      <div style={{ display: 'flex', gap: 1 }}>
        {bits.split('').map((b, i) => (
          <div key={i} style={{
            width: 16, height: 24,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: b === '1' ? `${color}33` : 'var(--surface-2)',
            border: `1px solid ${b === '1' ? color : 'var(--border)'}`,
            borderRadius: 3,
            fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700,
            color: b === '1' ? color : 'var(--text-tertiary)',
          }}>
            {b}
          </div>
        ))}
      </div>
      <div style={{ marginTop: 6, fontSize: 11, fontWeight: 700, color, letterSpacing: 0.5 }}>{label}</div>
      <div style={{ fontSize: 10, color: 'var(--text-tertiary)', whiteSpace: 'nowrap' }}>{subtitle}</div>
    </div>
  )
}
