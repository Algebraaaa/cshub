import { useMemo } from 'react'
import PlaygroundShell from '../playgrounds/PlaygroundShell'
import VizCard from '../playgrounds/VizCard'

// 4-step sequence, compare vanilla RNN vs LSTM cell
const SEQ_PRESETS = {
  rnn: {
    label: '标准 RNN',
    type: 'rnn',
    x: [0.2, 0.8, -0.4, 0.6], // input sequence
    W_h: [[0.6, -0.2], [-0.3, 0.5]], // hidden -> hidden
    W_x: [[0.4], [0.3]],           // input -> hidden
    h0: [0.0, 0.0],
  },
  lstm: {
    label: 'LSTM 单元',
    type: 'lstm',
    x: [0.3, 0.7, -0.2, 0.5],
    params: {
      Wf: { h: [0.7, 0.3], x: 0.5, b: 0.1 }, // forget gate weights
      Wi: { h: [0.2, 0.6], x: 0.4, b: -0.1 }, // input gate
      Wo: { h: [0.4, 0.4], x: 0.3, b: 0.0 },  // output gate
      Wc: { h: [0.5, 0.5], x: 0.6, b: 0.0 },  // candidate cell
    },
    h0: [0.0, 0.0],
    c0: [0.0, 0.0],
  },
  compare: {
    label: 'RNN vs LSTM',
    type: 'compare',
    x: [0.5, -0.3, 0.8, 0.1],
    rnn: {
      W_h: [[0.7, -0.3], [-0.3, 0.7]],
      W_x: [[0.5], [0.5]],
      h0: [0.0, 0.0],
    },
    lstm: {
      params: {
        Wf: { h: [0.7, 0.3], x: 0.5, b: 0.1 },
        Wi: { h: [0.2, 0.6], x: 0.4, b: -0.1 },
        Wo: { h: [0.4, 0.4], x: 0.3, b: 0.0 },
        Wc: { h: [0.5, 0.5], x: 0.6, b: 0.0 },
      },
      h0: [0.0, 0.0],
      c0: [0.0, 0.0],
    },
  },
}

function sigmoid(x) { return 1 / (1 + Math.exp(-x)) }
function tanh(x) { return Math.tanh(x) }

// RNN forward: h_t = tanh(W_h @ h_{t-1} + W_x @ x_t)
function runRNN(p) {
  const H = p.W_h.length
  const hist = []
  let h = p.h0.slice()
  for (let t = 0; t < p.x.length; t++) {
    const xt = p.x[t]
    const raw = [0, 0]
    for (let i = 0; i < H; i++) {
      let s = 0
      for (let j = 0; j < H; j++) s += p.W_h[i][j] * h[j]
      s += p.W_x[i][0] * xt
      raw[i] = s
    }
    const h_next = raw.map(r => tanh(r))
    hist.push({ t, x: xt, h_prev: h.slice(), raw: raw.slice(), h: h_next.slice() })
    h = h_next
  }
  return hist
}

// LSTM forward
function runLSTM(p) {
  const H = 2
  const hist = []
  let h = p.h0.slice()
  let c = p.c0.slice()
  for (let t = 0; t < p.x.length; t++) {
    const xt = p.x[t]
    // Forget gate: sigmoid(Wf_h @ h + Wf_x * x + bf)
    const fg = [0, 0], ig = [0, 0], og = [0, 0], ct = [0, 0]
    for (let i = 0; i < H; i++) {
      let fs = 0, is_ = 0, os = 0, cs = 0
      for (let j = 0; j < H; j++) {
        fs += p.params.Wf.h[j] * h[j]
        is_ += p.params.Wi.h[j] * h[j]
        os += p.params.Wo.h[j] * h[j]
        cs += p.params.Wc.h[j] * h[j]
      }
      fs += p.params.Wf.x * xt + p.params.Wf.b
      is_ += p.params.Wi.x * xt + p.params.Wi.b
      os += p.params.Wo.x * xt + p.params.Wo.b
      cs += p.params.Wc.x * xt + p.params.Wc.b
      fg[i] = sigmoid(fs)
      ig[i] = sigmoid(is_)
      og[i] = sigmoid(os)
      ct[i] = tanh(cs)
    }
    const c_next = [fg[0] * c[0] + ig[0] * ct[0], fg[1] * c[1] + ig[1] * ct[1]]
    const h_next = [og[0] * tanh(c_next[0]), og[1] * tanh(c_next[1])]
    hist.push({
      t, x: xt, h_prev: h.slice(), c_prev: c.slice(),
      fg: fg.slice(), ig: ig.slice(), og: og.slice(), ct: ct.slice(),
      c: c_next.slice(), h: h_next.slice(),
    })
    h = h_next; c = c_next
  }
  return hist
}

function computeSteps({ presetKey }) {
  const preset = SEQ_PRESETS[presetKey]
  const steps = []

  if (preset.type === 'rnn') {
    const hist = runRNN(preset)
    steps.push({
      description: `RNN: 序列长度=${preset.x.length}, 隐藏维度=2。h_t = tanh(W_h · h_{t-1} + W_x · x_t)。初始 h0 = [0, 0]。`,
      preset, hist, step: -1, line: 1,
    })
    for (let i = 0; i < hist.length; i++) {
      const s = hist[i]
      steps.push({
        description: `t=${s.t}: 输入 x = ${s.x.toFixed(2)}. h_{t-1}=[${s.h_prev.map(v => v.toFixed(2)).join(', ')}] → raw=[${s.raw.map(v => v.toFixed(2)).join(', ')}] → tanh → h_t=[${s.h.map(v => v.toFixed(2)).join(', ')}]`,
        preset, hist, step: i, line: 2 + i,
      })
    }
    steps.push({
      description: `RNN 前向完成。最终 h = [${hist[hist.length - 1].h.map(v => v.toFixed(3)).join(', ')}]。观察: 梯度需通过每步的 tanh 反向传播 (可能消失)。`,
      preset, hist, step: hist.length - 1, line: 7,
    })
  } else if (preset.type === 'lstm') {
    const hist = runLSTM(preset)
    steps.push({
      description: `LSTM: 序列长度=${preset.x.length}。门控: 遗忘(红)f_t=σ, 输入(蓝)i_t=σ, 输出(绿)o_t=σ, 候选 c̃_t=tanh。c_t = f_t⊙c_{t-1} + i_t⊙c̃_t, h_t = o_t⊙tanh(c_t)。`,
      preset, hist, step: -1, line: 1,
    })
    for (let i = 0; i < hist.length; i++) {
      const s = hist[i]
      steps.push({
        description: `t=${s.t}: x=${s.x.toFixed(2)}. 遗忘门 f=[${s.fg.map(v => v.toFixed(2)).join(', ')}] · c_prev → 保留信息。输入门 i=[${s.ig.map(v => v.toFixed(2)).join(', ')}] · c̃ → 写入新信息。c = [${s.c.map(v => v.toFixed(2)).join(', ')}]. 输出门 o=[${s.og.map(v => v.toFixed(2)).join(', ')}] → h=[${s.h.map(v => v.toFixed(2)).join(', ')}]`,
        preset, hist, step: i, line: 2 + i,
      })
    }
    steps.push({
      description: `LSTM 前向完成。最终 c = [${hist[hist.length - 1].c.map(v => v.toFixed(3)).join(', ')}], h = [${hist[hist.length - 1].h.map(v => v.toFixed(3)).join(', ')}]。细胞状态 c 作为"记忆线"稳定传递, 缓解梯度消失。`,
      preset, hist, step: hist.length - 1, line: 7,
    })
  } else {
    // compare mode
    const rnnHist = runRNN(preset.rnn)
    const lstmHist = runLSTM(preset.lstm)
    steps.push({
      description: `对比 RNN 与 LSTM: 相同输入 x = [${preset.x.map(v => v.toFixed(1)).join(', ')}]。RNN 无门控, LSTM 通过门控选择性保留/遗忘信息。`,
      preset, rnnHist, lstmHist, step: -1, line: 1,
    })
    for (let i = 0; i < rnnHist.length; i++) {
      steps.push({
        description: `t=${i}: RNN h=[${rnnHist[i].h.map(v => v.toFixed(2)).join(', ')}] vs LSTM h=[${lstmHist[i].h.map(v => v.toFixed(2)).join(', ')}], c=[${lstmHist[i].c.map(v => v.toFixed(2)).join(', ')}]`,
        preset, rnnHist, lstmHist, step: i, line: 2 + i,
      })
    }
  }

  return steps
}

// Draw a single cell with gates
function LSTMCellView({ s, width, height }) {
  const W = width || 340, H = height || 200
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%' }}>
      {/* Cell state line (dark thick horizontal) */}
      <line x1="20" y1={H / 2} x2={W - 20} y2={H / 2} stroke="#1e293b" strokeWidth="6" strokeLinecap="round" />
      <text x={W / 2} y={H / 2 - 8} textAnchor="middle" fontSize="10" fill="#94a3b8" fontFamily="monospace">
        c 细胞状态
      </text>

      {/* Gates (colored circles) */}
      {/* Forget gate (red) */}
      <circle cx="60" cy={H / 2} r="20" fill="rgba(239,68,68,0.25)" stroke="#ef4444" strokeWidth="1.5" />
      <text x="60" y={H / 2 + 4} textAnchor="middle" fontSize="11" fontFamily="monospace" fill="#ef4444">f_t</text>
      <text x="60" y={H / 2 + 35} textAnchor="middle" fontSize="9" fill="#94a3b8">{s.fg.map(v => v.toFixed(2)).join(',')}</text>

      {/* Input gate (blue) */}
      <circle cx="130" cy={H / 2} r="20" fill="rgba(56,189,248,0.25)" stroke="#38bdf8" strokeWidth="1.5" />
      <text x="130" y={H / 2 + 4} textAnchor="middle" fontSize="11" fontFamily="monospace" fill="#38bdf8">i_t</text>
      <text x="130" y={H / 2 + 35} textAnchor="middle" fontSize="9" fill="#94a3b8">{s.ig.map(v => v.toFixed(2)).join(',')}</text>

      {/* Candidate */}
      <circle cx="200" cy={H / 2} r="20" fill="rgba(167,139,250,0.25)" stroke="#a78bfa" strokeWidth="1.5" />
      <text x="200" y={H / 2 + 4} textAnchor="middle" fontSize="10" fontFamily="monospace" fill="#a78bfa">c̃_t</text>
      <text x="200" y={H / 2 + 35} textAnchor="middle" fontSize="9" fill="#94a3b8">{s.ct.map(v => v.toFixed(2)).join(',')}</text>

      {/* Output gate (green) */}
      <circle cx="270" cy={H / 2} r="20" fill="rgba(16,185,129,0.25)" stroke="#10b981" strokeWidth="1.5" />
      <text x="270" y={H / 2 + 4} textAnchor="middle" fontSize="11" fontFamily="monospace" fill="#10b981">o_t</text>
      <text x="270" y={H / 2 + 35} textAnchor="middle" fontSize="9" fill="#94a3b8">{s.og.map(v => v.toFixed(2)).join(',')}</text>

      {/* x input */}
      <rect x={W / 2 - 30} y="10" width="60" height="22" rx="4" fill="var(--surface-2)" stroke="var(--border)" />
      <text x={W / 2} y="26" textAnchor="middle" fontSize="11" fontFamily="monospace" fill="var(--text-primary)">
        x_t = {s.x.toFixed(2)}
      </text>

      {/* h output */}
      <rect x={W / 2 - 40} y={H - 32} width="80" height="22" rx="4" fill="rgba(16,185,129,0.15)" stroke="#10b981" />
      <text x={W / 2} y={H - 16} textAnchor="middle" fontSize="10" fontFamily="monospace" fill="#6ee7b7">
        h_t=[{s.h.map(v => v.toFixed(2)).join(',')}]
      </text>
    </svg>
  )
}

function RNNCellView({ s, width }) {
  const W = width || 340, H = 160
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%' }}>
      {/* Input */}
      <rect x={W / 2 - 30} y="10" width="60" height="22" rx="4" fill="var(--surface-2)" stroke="var(--border)" />
      <text x={W / 2} y="26" textAnchor="middle" fontSize="11" fontFamily="monospace">x_t = {s.x.toFixed(2)}</text>

      {/* Central cell */}
      <circle cx={W / 2} cy={H / 2} r="28" fill="rgba(56,189,248,0.2)" stroke="#38bdf8" strokeWidth="2" />
      <text x={W / 2} y={H / 2 + 4} textAnchor="middle" fontSize="11" fontFamily="monospace" fill="#7dd3fc">tanh</text>

      {/* h output */}
      <rect x={W / 2 - 50} y={H - 32} width="100" height="22" rx="4" fill="rgba(139,92,246,0.15)" stroke="#8b5cf6" />
      <text x={W / 2} y={H - 16} textAnchor="middle" fontSize="10" fontFamily="monospace" fill="#c4b5fd">
        h_t=[{s.h.map(v => v.toFixed(2)).join(',')}]
      </text>

      {/* Recurrent arrow */}
      <path d={`M ${W / 2 + 30} ${H / 2} Q ${W / 2 + 60} ${H / 2} ${W / 2 + 60} ${H * 0.65}`}
        fill="none" stroke="#64748b" strokeWidth="1.5" strokeDasharray="4,3" />
      <text x={W / 2 + 64} y={H * 0.6} fontSize="9" fill="#94a3b8" fontFamily="monospace">h</text>

      {/* Labels */}
      <text x={W / 2 - 60} y={H / 2 + 4} fontSize="9" fill="#94a3b8" fontFamily="monospace">
        raw=[{s.raw.map(v => v.toFixed(2)).join(',')}]
      </text>
    </svg>
  )
}

function renderViz({ current }) {
  const { preset, step } = current

  if (preset.type === 'rnn') {
    const hist = current.hist
    const cur = step >= 0 ? hist[step] : null
    return (
      <VizCard>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
          {/* Unrolled sequence */}
          <div style={{ display: 'flex', gap: 4, alignItems: 'center', width: '100%', overflowX: 'auto' }}>
            {hist.map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{
                  padding: '8px 6px', borderRadius: 8, minWidth: 72, textAlign: 'center',
                  background: i === step ? 'rgba(251,191,36,0.2)' : 'var(--surface)',
                  border: `1px solid ${i === step ? '#fbbf24' : 'var(--border)'}`,
                  fontSize: 10, fontFamily: 'monospace',
                }}>
                  <div style={{ color: 'var(--text-tertiary)' }}>t={i}</div>
                  <div style={{ color: 'var(--text-secondary)' }}>x={s.x.toFixed(1)}</div>
                  <div style={{ color: '#8b5cf6', fontSize: 9 }}>h=[{s.h.map(v => v.toFixed(1)).join(',')}]</div>
                </div>
                {i < hist.length - 1 && <div style={{ width: 8, height: 2, background: 'var(--border)' }} />}
              </div>
            ))}
          </div>

          {/* Current cell detail */}
          {cur && (
            <div style={{ width: '100%', maxWidth: 360 }}>
              <RNNCellView s={cur} />
            </div>
          )}

          {/* h state over time */}
          <div style={{ display: 'flex', gap: 12, width: '100%', maxWidth: 500, justifyContent: 'center' }}>
            {[0, 1].map(dim => (
              <div key={dim} style={{ flex: 1, fontSize: 11, fontFamily: 'monospace' }}>
                <div style={{ color: 'var(--text-tertiary)', marginBottom: 4 }}>h[{dim}] 随时间:</div>
                <div style={{ display: 'flex', gap: 2, alignItems: 'flex-end', height: 60 }}>
                  {hist.map((s, i) => {
                    const v = s.h[dim]
                    const h = Math.max(4, Math.abs(v) * 40)
                    return (
                      <div key={i} style={{
                        width: 20, height: h,
                        background: i === step ? '#fbbf24' : (v >= 0 ? '#8b5cf6' : '#f472b6'),
                        opacity: i === step ? 1 : 0.7, borderRadius: 3, alignSelf: v >= 0 ? 'flex-end' : 'flex-start',
                      }} title={`h[${dim}][${i}] = ${v.toFixed(3)}`} />
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </VizCard>
    )
  }

  if (preset.type === 'lstm') {
    const hist = current.hist
    const cur = step >= 0 ? hist[step] : null
    return (
      <VizCard>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
          {/* Unrolled sequence - cell state */}
          <div style={{ display: 'flex', gap: 4, alignItems: 'center', width: '100%', overflowX: 'auto' }}>
            {hist.map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{
                  padding: '8px 6px', borderRadius: 8, minWidth: 80, textAlign: 'center',
                  background: i === step ? 'rgba(251,191,36,0.2)' : 'var(--surface)',
                  border: `1px solid ${i === step ? '#fbbf24' : 'var(--border)'}`,
                  fontSize: 9, fontFamily: 'monospace',
                }}>
                  <div style={{ color: 'var(--text-tertiary)' }}>t={i} x={s.x.toFixed(1)}</div>
                  <div style={{ color: '#ef4444', fontSize: 9 }}>f=[{s.fg.map(v => v.toFixed(1)).join(',')}]</div>
                  <div style={{ color: '#38bdf8', fontSize: 9 }}>i=[{s.ig.map(v => v.toFixed(1)).join(',')}]</div>
                  <div style={{ color: '#10b981', fontSize: 9 }}>c=[{s.c.map(v => v.toFixed(1)).join(',')}]</div>
                  <div style={{ color: '#8b5cf6', fontSize: 9 }}>h=[{s.h.map(v => v.toFixed(1)).join(',')}]</div>
                </div>
                {i < hist.length - 1 && <div style={{ width: 8, height: 2, background: '#1e293b' }} />}
              </div>
            ))}
          </div>

          {cur && (
            <div style={{ width: '100%', maxWidth: 400 }}>
              <LSTMCellView s={cur} />
            </div>
          )}

          {/* Gate values over time */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, width: '100%', maxWidth: 500 }}>
            {[
              { k: 'fg', label: '遗忘 f', color: '#ef4444' },
              { k: 'ig', label: '输入 i', color: '#38bdf8' },
              { k: 'og', label: '输出 o', color: '#10b981' },
              { k: 'c', label: '细胞 c', color: '#fbbf24' },
            ].map(g => (
              <div key={g.k} style={{ fontSize: 10, fontFamily: 'monospace' }}>
                <div style={{ color: g.color, marginBottom: 3, fontWeight: 600 }}>{g.label} (单元 0 / 1)</div>
                <div style={{ display: 'flex', gap: 2 }}>
                  {hist.map((s, i) => {
                    const v = s[g.k][0]
                    return (
                      <div key={i} style={{
                        width: 12, height: Math.max(2, Math.abs(v) * 40),
                        background: i === step ? '#fbbf24' : g.color,
                        opacity: i === step ? 1 : 0.7, borderRadius: 2,
                      }} />
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </VizCard>
    )
  }

  // compare
  const rnnHist = current.rnnHist
  const lstmHist = current.lstmHist
  const curR = step >= 0 ? rnnHist[step] : null
  const curL = step >= 0 ? lstmHist[step] : null
  return (
    <VizCard>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, width: '100%' }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#8b5cf6', marginBottom: 6, textAlign: 'center' }}>RNN (无门控)</div>
          {curR && <RNNCellView s={curR} />}
        </div>
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#10b981', marginBottom: 6, textAlign: 'center' }}>LSTM (门控)</div>
          {curL && <LSTMCellView s={curL} />}
        </div>
        {/* h comparison bars */}
        <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 24, justifyContent: 'center' }}>
          {[0, 1].map(dim => (
            <div key={dim} style={{ fontSize: 10, fontFamily: 'monospace' }}>
              <div style={{ color: 'var(--text-tertiary)', marginBottom: 4, textAlign: 'center' }}>h[{dim}]</div>
              <div style={{ display: 'flex', gap: 4 }}>
                {rnnHist.map((_, i) => (
                  <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <div style={{
                      width: 14, height: Math.max(3, Math.abs(rnnHist[i].h[dim]) * 40),
                      background: i === step ? '#fbbf24' : '#8b5cf6', borderRadius: 2,
                    }} title="RNN" />
                    <div style={{
                      width: 14, height: Math.max(3, Math.abs(lstmHist[i].h[dim]) * 40),
                      background: i === step ? '#fbbf24' : '#10b981', borderRadius: 2,
                    }} title="LSTM" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </VizCard>
  )
}

export default function RNNLSTMPlayground() {
  const presets = useMemo(() => Object.entries(SEQ_PRESETS).map(([id, p]) => ({ id, label: p.label, state: { presetKey: id } })), [])
  return (
    <PlaygroundShell
      initialState={{ presetKey: 'rnn' }}
      presets={presets}
      computeSteps={computeSteps}
      legend={[
        { color: '#ef4444', label: '遗忘门 f_t' },
        { color: '#38bdf8', label: '输入门 i_t' },
        { color: '#10b981', label: '输出门 o_t' },
        { color: '#a78bfa', label: '候选 c̃_t' },
        { color: '#1e293b', label: '细胞状态 c (记忆线)' },
        { color: '#fbbf24', label: '当前时间步' },
      ]}
      renderViz={renderViz}
    />
  )
}
