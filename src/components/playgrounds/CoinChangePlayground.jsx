import PlaygroundShell from './PlaygroundShell'
import { StringField } from './inputs/NumberInput'

const EXAMPLES = [
  { id: 'classic', label: '经典示例', coins: [1, 5, 11],     amount: 15 },
  { id: 'lc322',   label: '力扣 322', coins: [1, 2, 5],      amount: 11 },
  { id: 'none',    label: '无解示例', coins: [2],            amount: 3 },
  { id: 'us',      label: '硬币找零', coins: [1, 5, 10, 25], amount: 30 },
]

const PRESETS = EXAMPLES.map(e => ({
  id: e.id,
  label: e.label,
  state: {
    coins: e.coins,
    amount: e.amount,
    coinsText: e.coins.join(' '),
    amountText: String(e.amount),
  },
}))

const INITIAL = { coins: [1, 5, 11], amount: 15, coinsText: '1 5 11', amountText: '15' }

export default function CoinChangePlayground({ algoFn }) {
  return (
    <PlaygroundShell
      initialState={INITIAL}
      presets={PRESETS}
      derivePayload={s => ({ coins: s.coins, amount: s.amount })}
      computeSteps={p => algoFn(p.coins, p.amount)}
      extraToolbar={({ state, setState, ctrl }) => {
        function apply() {
          const c = state.coinsText.split(/[\s,]+/).map(Number)
            .filter(n => !isNaN(n) && n > 0).sort((a, b) => a - b)
          const a = parseInt(state.amountText, 10)
          if (c.length >= 1 && !isNaN(a) && a >= 1 && a <= 50) {
            setState({ ...state, coins: c, amount: a })
            ctrl.reset()
          }
        }
        return (
          <>
            <StringField state={state} setState={setState} textField="coinsText"
              label="硬币：" width={120} placeholder="1 5 11" onApply={apply} />
            <StringField state={state} setState={setState} textField="amountText"
              label="目标金额：" width={60} placeholder="15" onApply={apply} submitLabel="应用" />
          </>
        )
      }}
      renderViz={({ current, state }) => <CoinChangePanel current={current} coins={state.coins} amount={state.amount} />}
    />
  )
}

function CoinChangePanel({ current, coins, amount }) {
  const { dp, coin: activeCoin, i: activeI, phase } = current || {}
  const INF = amount + 1

  return (
    <>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 16, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 12, color: 'var(--text-secondary)', marginRight: 4 }}>硬币面值：</span>
        {coins.map(c => (
          <div key={c} style={{
            width: 38, height: 38, borderRadius: '50%',
            background: c === activeCoin ? 'var(--accent)' : 'var(--surface-2)',
            border: `2px solid ${c === activeCoin ? 'var(--accent-light)' : 'var(--border)'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 700, fontSize: 13, fontFamily: 'var(--font-mono)',
            color: c === activeCoin ? 'white' : 'var(--text-primary)',
            transition: 'all 0.3s',
            boxShadow: c === activeCoin ? '0 0 12px rgba(139,92,246,0.5)' : 'none',
          }}>
            {c}
          </div>
        ))}
        <span style={{ fontSize: 12, color: 'var(--text-secondary)', marginLeft: 8 }}>
          → 目标：<strong style={{ color: 'var(--text-primary)' }}>{amount}</strong>
        </span>
      </div>

      {dp && (
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 10, padding: '16px', marginBottom: 16, overflowX: 'auto',
        }}>
          <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 10, fontWeight: 600 }}>
            dp 数组（dp[i] = 凑出 i 所需的最少硬币数）
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            {dp.map((val, idx) => {
              const isActive = idx === activeI
              const isDone = phase === 'done' && val < INF
              const isInf = val >= INF
              return (
                <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <div style={{
                    width: 42, height: 42, borderRadius: 8,
                    background: isDone ? 'rgba(16,185,129,0.15)'
                      : isActive ? 'var(--yellow)'
                      : isInf ? 'var(--surface-2)'
                      : val > 0 ? 'rgba(139,92,246,0.15)' : 'rgba(16,185,129,0.1)',
                    border: `2px solid ${
                      isDone ? 'var(--green)'
                      : isActive ? 'var(--yellow)'
                      : isInf ? 'var(--border)'
                      : val > 0 ? 'rgba(139,92,246,0.4)' : 'rgba(16,185,129,0.4)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'var(--font-mono)', fontWeight: 700,
                    fontSize: isInf ? 10 : 13,
                    color: isDone ? 'var(--green)'
                      : isActive ? '#000'
                      : isInf ? 'var(--text-tertiary)' : 'var(--text-primary)',
                    transition: 'all 0.3s',
                    boxShadow: isActive ? '0 0 10px rgba(245,158,11,0.4)' : 'none',
                  }}>
                    {isInf ? '∞' : val}
                  </div>
                  <div style={{
                    fontSize: 10, color: isActive ? 'var(--yellow)' : 'var(--text-tertiary)',
                    fontFamily: 'var(--font-mono)', fontWeight: isActive ? 700 : 400,
                  }}>
                    {idx}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {phase === 'done' && dp && (
        <div style={{
          padding: '12px 16px', marginBottom: 16, borderRadius: 8,
          background: dp[amount] >= INF ? 'rgba(239,68,68,0.1)' : 'var(--green-soft)',
          border: `1px solid ${dp[amount] >= INF ? 'rgba(239,68,68,0.3)' : 'rgba(16,185,129,0.3)'}`,
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <span style={{ color: dp[amount] >= INF ? '#ef4444' : 'var(--green)', fontWeight: 600, fontSize: 14 }}>
            {dp[amount] >= INF ? '❌ 无解' : '✅ 最少硬币数'}
          </span>
          {dp[amount] < INF && (
            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: 24, color: 'var(--text-primary)' }}>
              {dp[amount]}
            </span>
          )}
          <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            {dp[amount] >= INF ? `无法用 [${coins.join(', ')}] 凑出 ${amount}` : `枚硬币凑出 ${amount}`}
          </span>
        </div>
      )}

      <div style={{ display: 'flex', gap: 16, marginBottom: 16, flexWrap: 'wrap', fontSize: 11, color: 'var(--text-secondary)' }}>
        {[
          { color: 'var(--yellow)', label: '当前更新格' },
          { color: 'rgba(139,92,246,0.3)', label: 'dp > 0' },
          { color: 'rgba(16,185,129,0.15)', label: 'dp = 0（已凑出）' },
          { color: 'var(--surface-2)', label: '∞（尚无解）' },
        ].map(({ color, label }) => (
          <span key={label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 11, height: 11, borderRadius: 3, background: color, display: 'inline-block', border: '1px solid var(--border)' }} />
            {label}
          </span>
        ))}
      </div>
    </>
  )
}
