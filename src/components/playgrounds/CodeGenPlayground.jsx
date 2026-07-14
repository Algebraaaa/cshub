import PlaygroundShell from './PlaygroundShell'

const PRESETS = [
  { id: 'arith',  label: 'a=(b+c)*d-2' },
  { id: 'branch', label: 'if x>0' },
  { id: 'loop',   label: 'for i in 0..3' },
]

const sL = { fontSize: 10, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-tertiary)', marginBottom: 8 }

const typeColor = { Assign: '#ef4444', BinOp: '#3b82f6', Var: '#22c55e', Lit: '#eab308', If: '#a855f7', For: '#f97316' }

function AstNode({ node, depth }) {
  if (!node) return null
  const isHL = node.highlight
  const tc = typeColor[node.type] || 'var(--text-primary)'
  return (
    <div style={{ marginLeft: depth * 14 }}>
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 7px', marginBottom: 2, borderRadius: 5, background: isHL ? tc + '25' : 'transparent', border: isHL ? `1.5px solid ${tc}` : '1.5px solid transparent', transition: 'all 0.2s' }}>
        {depth > 0 && <span style={{ color: 'var(--text-tertiary)', fontSize: 10 }}>└</span>}
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: isHL ? tc : 'var(--text-secondary)', fontWeight: isHL ? 700 : 400 }}>
          <span style={{ color: tc, fontWeight: 700 }}>{node.type}</span>
          {node.op && <span style={{ color: 'var(--text-tertiary)' }}> ({node.op})</span>}
          {' '}<span style={{ color: isHL ? tc : 'var(--text-primary)' }}>{node.label}</span>
        </span>
      </div>
      {(node.children || []).map((c, i) => <AstNode key={c.id || i} node={c} depth={depth + 1} />)}
    </div>
  )
}

const phaseColors = { ast: '#a855f7', tac: '#22c55e', asm: '#3b82f6' }
const phaseLabels = { ast: 'AST 遍历', tac: 'TAC 生成', asm: 'ASM 生成' }

export default function CodeGenPlayground({ algoFn }) {
  return (
    <PlaygroundShell
      presets={PRESETS}
      computeSteps={preset => {
        try { return algoFn(preset.id) } catch (e) {
          return [{ phase: 'ast', ast: null, tac: [], asm: [], temps: {}, description: `错误：${e.message}` }]
        }
      }}
      toolbarRight={({ current }) => (
        <span style={{ padding: '3px 10px', borderRadius: 20, background: (phaseColors[current?.phase] || 'var(--accent)') + '22', border: `1px solid ${(phaseColors[current?.phase] || 'var(--accent)')}55`, color: phaseColors[current?.phase] || 'var(--accent)', fontSize: 11, fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
          {phaseLabels[current?.phase] || current?.phase}
        </span>
      )}
      renderViz={({ current }) => {
        const { ast, tac, asm, temps } = current
        return (
          <div style={{ display: 'flex', gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
            {/* 左列：AST */}
            <div style={{ flex: '1 1 200px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: 12, minWidth: 0 }}>
              <div style={sL}>AST（抽象语法树）</div>
              {ast ? <AstNode node={ast} depth={0} /> : <span style={{ color: 'var(--text-tertiary)', fontSize: 12 }}>—</span>}
            </div>

            {/* 中列：TAC */}
            <div style={{ flex: '1 1 200px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: 12, minWidth: 0 }}>
              <div style={sL}>三地址码（TAC）</div>
              {tac.length === 0 ? (
                <span style={{ color: 'var(--text-tertiary)', fontSize: 12 }}>（等待生成…）</span>
              ) : (
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11.5 }}>
                  {tac.map((t, i) => (
                    <div key={t.id} style={{ padding: '3px 6px', marginBottom: 2, borderRadius: 5, background: t.active ? '#22c55e22' : 'transparent', border: t.active ? '1px solid #22c55e55' : '1px solid transparent', color: t.active ? '#22c55e' : 'var(--text-secondary)', fontWeight: t.active ? 700 : 400, transition: 'all 0.2s', display: 'flex', alignItems: 'baseline', gap: 6 }}>
                      <span style={{ color: 'var(--text-tertiary)', fontSize: 10, flexShrink: 0, minWidth: 20 }}>{i + 1}:</span>
                      <span style={{ flex: 1, wordBreak: 'break-all' }}>{t.instr}</span>
                      {t.comment && <span style={{ color: 'var(--text-tertiary)', fontSize: 10, flexShrink: 0 }}>// {t.comment}</span>}
                    </div>
                  ))}
                </div>
              )}
              {Object.keys(temps || {}).length > 0 && (
                <div style={{ marginTop: 10, padding: 8, background: 'var(--surface-2)', borderRadius: 6, fontSize: 10.5, fontFamily: 'var(--font-mono)' }}>
                  <div style={{ ...sL, marginBottom: 4 }}>临时变量</div>
                  {Object.entries(temps || {}).map(([k, v]) => (
                    <div key={k} style={{ color: 'var(--text-secondary)' }}><span style={{ color: '#eab308', fontWeight: 700 }}>{k}</span> = {v}</div>
                  ))}
                </div>
              )}
            </div>

            {/* 右列：ASM */}
            <div style={{ flex: '1 1 200px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: 12, minWidth: 0 }}>
              <div style={sL}>伪汇编（ASM）</div>
              {asm.length === 0 ? (
                <span style={{ color: 'var(--text-tertiary)', fontSize: 12 }}>（等待生成…）</span>
              ) : (
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>
                  {asm.map((a, i) => {
                    const isLabel = a.instr.endsWith(':')
                    return (
                      <div key={a.id} style={{ padding: '2px 6px', marginBottom: 2, borderRadius: 5, marginLeft: isLabel ? 0 : 10, background: a.active ? '#3b82f622' : 'transparent', border: a.active ? '1px solid #3b82f655' : '1px solid transparent', color: a.active ? '#3b82f6' : (isLabel ? '#eab308' : 'var(--text-secondary)'), fontWeight: a.active || isLabel ? 700 : 400, transition: 'all 0.2s', display: 'flex', alignItems: 'baseline', gap: 6 }}>
                        {!isLabel && <span style={{ color: 'var(--text-tertiary)', fontSize: 10, flexShrink: 0, minWidth: 20 }}>{i + 1}:</span>}
                        <span style={{ flex: 1, wordBreak: 'break-all' }}>{a.instr}</span>
                        {a.comment && <span style={{ color: 'var(--text-tertiary)', fontSize: 10, flexShrink: 0 }}>; {a.comment}</span>}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        )
      }}
    />
  )
}
