import { useState, useMemo } from 'react'
import StepController, { useStepController } from '../StepController'
import VizCard from './VizCard'
import { Toolbar, ToolbarBtn } from './shared'

const SCENARIOS = [
  { id: 'dirty',         label: '脏读' },
  { id: 'nonrepeatable', label: '不可重复读' },
  { id: 'phantom',       label: '幻读' },
]

const LEVELS = [
  { id: 'read-uncommitted', short: 'RU' },
  { id: 'read-committed',   short: 'RC' },
  { id: 'repeatable-read',  short: 'RR' },
  { id: 'serializable',     short: 'S'  },
]

export default function TransactionPlayground({ algoFn }) {
  const [scenario, setScenario] = useState('dirty')
  const [level, setLevel] = useState('read-uncommitted')

  const steps = useMemo(() => algoFn(scenario, level), [algoFn, scenario, level])
  const ctrl = useStepController(steps)
  const current = steps[ctrl.step]
  if (!current) return null

  const { rows, drafts, log, focusTxn, levelName, committed } = current

  return (
    <div>
      <Toolbar>
        <span style={{ fontSize: 11, color: 'var(--text-tertiary)', fontWeight: 700, marginRight: 4 }}>场景</span>
        {SCENARIOS.map(s => (
          <ToolbarBtn key={s.id} active={scenario === s.id} onClick={() => { setScenario(s.id); ctrl.reset() }}>
            {s.label}
          </ToolbarBtn>
        ))}
        <div style={{ width: 12 }} />
        <span style={{ fontSize: 11, color: 'var(--text-tertiary)', fontWeight: 700, marginRight: 4 }}>隔离</span>
        {LEVELS.map(l => (
          <ToolbarBtn key={l.id} active={level === l.id} onClick={() => { setLevel(l.id); ctrl.reset() }}>
            {l.short}
          </ToolbarBtn>
        ))}
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 11, color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>{levelName}</span>
      </Toolbar>

      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12,
        marginBottom: 12,
      }}>
        <TxnColumn name="T1" focusTxn={focusTxn} draft={drafts.T1} />
        <TxnColumn name="T2" focusTxn={focusTxn} draft={drafts.T2} />
      </div>

      <VizCard borderRadius={10} padding={14} marginBottom={12} noInner overflowX="hidden">
        <div style={{ fontSize: 11, color: 'var(--text-tertiary)', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8 }}>
          已提交版本（physical）
        </div>
        <table style={{ borderCollapse: 'collapse', width: '100%', fontFamily: 'var(--font-mono)', fontSize: 13 }}>
          <thead>
            <tr style={{ color: 'var(--text-tertiary)' }}>
              <th style={th}>id</th><th style={th}>balance</th>
            </tr>
          </thead>
          <tbody>
            {(committed || rows).map(r => (
              <tr key={r.id}>
                <td style={td}>{r.id}</td>
                <td style={td}>{r.balance}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </VizCard>

      <VizCard
        borderRadius={10}
        padding={14}
        noInner
        overflowX="hidden"
        style={{ maxHeight: 180, overflowY: 'auto' }}
      >
        <div style={{ fontSize: 11, color: 'var(--text-tertiary)', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8 }}>
          事件时间线
        </div>
        {log.length === 0 && <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>—</div>}
        <ol style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {log.map((e, i) => (
            <li key={i} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              fontFamily: 'var(--font-mono)', fontSize: 12,
              padding: '4px 8px',
              borderRadius: 6,
              background: i === log.length - 1 ? 'var(--accent-soft)' : 'transparent',
            }}>
              <span style={{
                width: 24, textAlign: 'center', borderRadius: 4,
                background: e.txn === 'T1' ? '#a855f7' : '#06b6d4',
                color: 'white', fontSize: 10, fontWeight: 800,
                padding: '1px 0',
              }}>{e.txn}</span>
              <span>{e.op}</span>
            </li>
          ))}
        </ol>
      </VizCard>

      <StepController total={steps.length}
        ctrl={ctrl}
        description={current.description} />
    </div>
  )
}

function TxnColumn({ name, focusTxn, draft }) {
  const isFocus = focusTxn === name
  const color = name === 'T1' ? '#a855f7' : '#06b6d4'
  return (
    <div style={{
      padding: 14,
      borderRadius: 12,
      background: isFocus ? `${color}14` : 'var(--surface)',
      border: `1px solid ${isFocus ? color + '88' : 'var(--border)'}`,
      transition: 'all 0.2s',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <span style={{
          width: 26, height: 22, borderRadius: 6,
          background: color, color: 'white',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 12, fontWeight: 800,
        }}>{name}</span>
        <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
          {draft ? '未提交 draft' : '空闲 / 已提交'}
        </span>
      </div>
      {draft ? (
        <table style={{ borderCollapse: 'collapse', width: '100%', fontFamily: 'var(--font-mono)', fontSize: 12 }}>
          <tbody>
            {draft.map(r => (
              <tr key={r.id}>
                <td style={{ ...tdSmall, color: 'var(--text-tertiary)' }}>id={r.id}</td>
                <td style={{ ...tdSmall, color }}>{r.balance}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>—</div>
      )}
    </div>
  )
}

const th = { textAlign: 'left', padding: '4px 8px', borderBottom: '1px solid var(--border)', fontWeight: 700, fontSize: 11 }
const td = { padding: '4px 8px', borderBottom: '1px solid var(--border)' }
const tdSmall = { padding: '3px 6px', borderBottom: '1px solid var(--border)' }
