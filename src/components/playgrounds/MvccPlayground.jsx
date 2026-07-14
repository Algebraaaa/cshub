import PlaygroundShell from './PlaygroundShell'
import { ToolbarBtn } from './shared'

const SCENARIOS = [
  { id: 'snapshot',       label: '快照隔离' },
  { id: 'write-conflict', label: '写冲突' },
  { id: 'vacuum',         label: 'VACUUM 清理' },
]

const GREEN  = '#22c55e'
const YELLOW = '#eab308'
const RED    = '#ef4444'
const BLUE   = '#3b82f6'

function statusColor(status) {
  if (status === 'committed') return GREEN
  if (status === 'aborted')   return RED
  return YELLOW // active
}

function statusLabel(status) {
  if (status === 'committed') return '已提交'
  if (status === 'aborted')   return '已中止'
  return '活跃'
}

function opColor(op) {
  if (!op) return 'var(--text-tertiary)'
  if (op.includes('COMMIT')) return GREEN
  if (op.includes('ABORT') || op.includes('ROLLBACK')) return RED
  if (op.includes('UPDATE') || op.includes('CLEAN') || op.includes('INSERT')) return YELLOW
  if (op.includes('READ')) return BLUE
  return 'var(--text-secondary)'
}

export default function MvccPlayground({ algoFn }) {
  return (
    <PlaygroundShell
      initialState={{ scenario: 'snapshot' }}
      derivePayload={state => state.scenario}
      computeSteps={scenario => algoFn(scenario)}
      extraToolbar={({ state, setState, ctrl }) => (
        <>
          <span style={{ fontSize: 11, color: 'var(--text-tertiary)', fontWeight: 700, marginRight: 4 }}>场景</span>
          {SCENARIOS.map(s => (
            <ToolbarBtn
              key={s.id}
              active={state.scenario === s.id}
              onClick={() => { setState({ scenario: s.id }); ctrl.reset() }}
            >
              {s.label}
            </ToolbarBtn>
          ))}
        </>
      )}
      toolbarRight={({ current }) => (
        current?.phase
          ? <span style={{
              fontSize: 11,
              color: 'var(--text-tertiary)',
              fontFamily: 'var(--font-mono)',
              padding: '3px 8px',
              borderRadius: 6,
              background: 'var(--surface)',
              border: '1px solid var(--border)',
            }}>
              {current.phase}
            </span>
          : null
      )}
      renderViz={({ current }) => {
        const { versions, txns, log, activeTxn, highlight } = current
        // 按 rowId 分组版本
        const rowIds = [...new Set(versions.map(v => v.rowId))]
        return (
          <>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
        {/* 左列：版本链 */}
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 10,
          padding: 14,
        }}>
          <div style={{
            fontSize: 11, color: 'var(--text-tertiary)', fontWeight: 700,
            letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 10,
          }}>
            版本链（Version Chain）
          </div>
          {rowIds.length === 0 && (
            <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>暂无数据</div>
          )}
          {rowIds.map(rowId => {
            const rowVersions = versions.filter(v => v.rowId === rowId)
            return (
              <div key={rowId} style={{ marginBottom: 14 }}>
                <div style={{
                  fontSize: 12, fontWeight: 700,
                  color: 'var(--text-secondary)',
                  marginBottom: 6,
                  fontFamily: 'var(--font-mono)',
                }}>
                  行 {rowId}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {rowVersions.map((v, i) => {
                    const isHighlighted = highlight.rowIds.includes(rowId)
                    const isCurrent = v.xmax === null
                    const borderColor = v.isVisible
                      ? GREEN
                      : (isCurrent ? BLUE : 'var(--border)')
                    const bg = v.isVisible
                      ? `${GREEN}18`
                      : (isCurrent ? `${BLUE}12` : 'var(--surface)')
                    return (
                      <div key={i} style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        padding: '7px 10px',
                        borderRadius: 8,
                        border: `1.5px solid ${isHighlighted ? (v.isVisible ? GREEN : borderColor) : borderColor}`,
                        background: bg,
                        transition: 'all 0.25s',
                        opacity: (!isCurrent && !v.isVisible) ? 0.55 : 1,
                      }}>
                        <div style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: 13,
                          fontWeight: 700,
                          color: v.isVisible ? GREEN : (isCurrent ? BLUE : 'var(--text-secondary)'),
                          minWidth: 28,
                        }}>
                          {v.value}
                        </div>
                        <div style={{ fontSize: 10, color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>
                          xmin={v.xmin} / xmax={v.xmax ?? 'null'}
                        </div>
                        <div style={{ flex: 1 }} />
                        {v.isVisible && (
                          <span style={{
                            fontSize: 10, fontWeight: 700, color: GREEN,
                            background: `${GREEN}20`, padding: '2px 6px', borderRadius: 4,
                          }}>可见</span>
                        )}
                        {!v.isVisible && isCurrent && (
                          <span style={{
                            fontSize: 10, fontWeight: 700, color: BLUE,
                            background: `${BLUE}20`, padding: '2px 6px', borderRadius: 4,
                          }}>当前版本</span>
                        )}
                        {!v.isVisible && !isCurrent && (
                          <span style={{
                            fontSize: 10, color: 'var(--text-tertiary)',
                            background: 'var(--surface)', padding: '2px 6px', borderRadius: 4,
                            border: '1px solid var(--border)',
                          }}>旧版本</span>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
          {/* 图例 */}
          <div style={{ display: 'flex', gap: 10, marginTop: 8, flexWrap: 'wrap' }}>
            {[
              { color: GREEN, label: '对当前读事务可见' },
              { color: BLUE, label: '当前版本' },
              { color: 'var(--border)', label: '旧版本/不可见' },
            ].map(({ color, label }) => (
              <span key={label} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: 'var(--text-tertiary)' }}>
                <span style={{ width: 8, height: 8, borderRadius: 2, background: color, display: 'inline-block' }} />
                {label}
              </span>
            ))}
          </div>
        </div>

        {/* 右列：事务状态 */}
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 10,
          padding: 14,
        }}>
          <div style={{
            fontSize: 11, color: 'var(--text-tertiary)', fontWeight: 700,
            letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 10,
          }}>
            事务状态（Transactions）
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {txns.map(t => {
              const isActive = t.id === (activeTxn !== null ? Number(activeTxn) : -1)
              const color = statusColor(t.status)
              return (
                <div key={t.id} style={{
                  padding: '9px 12px',
                  borderRadius: 8,
                  border: `1.5px solid ${isActive ? color + 'aa' : 'var(--border)'}`,
                  background: isActive ? `${color}12` : 'var(--surface)',
                  transition: 'all 0.25s',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 800,
                      fontSize: 13,
                      color: 'var(--text-primary)',
                    }}>
                      {t.label}
                    </span>
                    <span style={{
                      fontSize: 10, fontWeight: 700,
                      color: color,
                      background: `${color}20`,
                      padding: '2px 7px', borderRadius: 10,
                    }}>
                      {statusLabel(t.status)}
                    </span>
                    <span style={{
                      fontSize: 10, color: 'var(--text-tertiary)',
                      fontFamily: 'var(--font-mono)',
                    }}>
                      xid={t.id}
                    </span>
                  </div>
                  <div style={{
                    fontSize: 11, color: 'var(--text-tertiary)',
                    fontFamily: 'var(--font-mono)',
                  }}>
                    snapshot: [{t.snapshot.join(', ') || ''}]
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* 底部：操作日志 */}
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 10,
        padding: 14,
        marginBottom: 12,
        maxHeight: 200,
        overflowY: 'auto',
      }}>
        <div style={{
          fontSize: 11, color: 'var(--text-tertiary)', fontWeight: 700,
          letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8,
        }}>
          操作日志
        </div>
        {log.length === 0 && (
          <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>—</div>
        )}
        <ol style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {log.map((e, i) => (
            <li key={i} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              fontFamily: 'var(--font-mono)', fontSize: 12,
              padding: '4px 8px', borderRadius: 6,
              background: i === log.length - 1 ? 'var(--accent-soft)' : 'transparent',
            }}>
              <span style={{
                minWidth: 52, textAlign: 'center', borderRadius: 4,
                background: e.txn === 'T1' ? '#a855f7'
                  : e.txn === 'T2' ? '#06b6d4'
                  : e.txn === 'T3' ? '#f97316'
                  : '#6b7280',
                color: 'white', fontSize: 10, fontWeight: 800,
                padding: '1px 4px',
              }}>
                {e.txn}
              </span>
              <span style={{ color: opColor(e.op) }}>{e.op}</span>
              {e.desc && (
                <span style={{ color: 'var(--text-tertiary)', fontSize: 11 }}>— {e.desc}</span>
              )}
            </li>
          ))}
        </ol>
      </div>
          </>
        )
      }}
    />
  )
}
