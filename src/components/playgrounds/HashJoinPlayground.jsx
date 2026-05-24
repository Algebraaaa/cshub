import PlaygroundShell from './PlaygroundShell'

// 哈希联接 Playground · 迁移到 PlaygroundShell 后样板代码归零
// 原 172 行 → 现 ~110 行（去掉 useStepController/Toolbar/preset 切换/StepController 重复）

const PRESETS = [
  {
    id: 'basic',
    label: '基础示例',
    R: [
      { key: 1, label: 'Alice' }, { key: 2, label: 'Bob' },
      { key: 3, label: 'Carol' }, { key: 4, label: 'Dave' },
    ],
    S: [
      { key: 2, label: 'order#A' }, { key: 3, label: 'order#B' },
      { key: 3, label: 'order#C' }, { key: 5, label: 'order#D' },
      { key: 1, label: 'order#E' },
    ],
    m: 5,
  },
  {
    id: 'collision',
    label: '冲突演示',
    R: [
      { key: 1, label: 'p1' }, { key: 6, label: 'p2' },
      { key: 11, label: 'p3' }, { key: 4, label: 'p4' },
    ],
    S: [
      { key: 6, label: 's1' }, { key: 11, label: 's2' },
      { key: 8, label: 's3' }, { key: 1, label: 's4' },
    ],
    m: 5,
  },
]

export default function HashJoinPlayground({ algoFn }) {
  return (
    <PlaygroundShell
      presets={PRESETS}
      computeSteps={(p) => algoFn(p.R, p.S, p.m)}
      toolbarRight={<RightStatus />}
      renderViz={({ current }) => <HashJoinViz current={current} />}
    />
  )
}

function RightStatus() {
  // Shell 不传 current 给 toolbar；如需展示当前规模可改造，暂时只放静态提示
  return <span className="font-mono text-[11px] text-fg-faint">Build → Probe → 输出</span>
}

function HashJoinViz({ current }) {
  const { ht, result, R, S, phase, focusR, focusS, focusBucket } = current
  const phaseColor = phase.startsWith('build') ? '#a855f7'
    : phase.startsWith('probe') ? '#06b6d4'
    : phase === 'match' ? '#22c55e' : '#94a3b8'

  return (
    <>
      <div className="mb-3 grid grid-cols-[1fr_1.4fr_1fr] gap-3">
        <TableCard title="R · Build" data={R} highlight={focusR} accent="#a855f7" />
        <div className="rounded-xl border border-border-soft bg-surface p-3.5">
          <div className="section-eyebrow mb-2">Hash Table (m={ht.length})</div>
          {ht.map((bucket, i) => {
            const isFocus = i === focusBucket
            return (
              <div key={i}
                className={[
                  'mb-0.5 flex items-center gap-1.5 rounded-md px-2 py-1',
                  isFocus ? 'border' : 'border border-transparent',
                ].join(' ')}
                style={isFocus ? { background: `${phaseColor}22`, borderColor: phaseColor } : undefined}>
                <span className="w-6 font-mono text-[11px] text-fg-faint">[{i}]</span>
                {bucket.length === 0 && <span className="text-[11px] text-fg-faint">—</span>}
                {bucket.map((e, j) => (
                  <span key={j}
                    className="rounded border px-1.5 py-px font-mono text-[11px] font-bold"
                    style={{ background: '#a855f722', borderColor: '#a855f755', color: '#a855f7' }}>
                    {e.row.key}:{e.row.label}
                  </span>
                ))}
              </div>
            )
          })}
        </div>
        <TableCard title="S · Probe" data={S} highlight={focusS} accent="#06b6d4" />
      </div>

      <div className="mb-4 rounded-glass-md border border-border-soft bg-surface p-3">
        <div className="section-eyebrow mb-2">输出 ({result.length} 行)</div>
        <div className="flex flex-wrap gap-1.5">
          {result.length === 0 && <span className="text-[12px] text-fg-faint">—</span>}
          {result.map((r, i) => (
            <span key={i}
              className="rounded-full border px-2.5 py-1 font-mono text-[11.5px] font-bold"
              style={{ background: '#22c55e22', color: '#22c55e', borderColor: '#22c55e55' }}>
              {r.r.label} ⋈ {r.s.label}
            </span>
          ))}
        </div>
      </div>
    </>
  )
}

function TableCard({ title, data, highlight, accent }) {
  return (
    <div className="rounded-xl border border-border-soft bg-surface p-3.5">
      <div className="mb-2 text-[11px] font-extrabold uppercase tracking-[0.06em]" style={{ color: accent }}>
        {title}
      </div>
      <table className="w-full border-collapse font-mono text-[12px]">
        <thead>
          <tr className="text-fg-faint">
            <th className="px-1.5 py-1 text-left text-[10px] font-bold">#</th>
            <th className="px-1.5 py-1 text-left text-[10px] font-bold">key</th>
            <th className="px-1.5 py-1 text-left text-[10px] font-bold">val</th>
          </tr>
        </thead>
        <tbody>
          {data.map((r, i) => {
            const focus = i === highlight
            return (
              <tr key={i} className="transition-colors"
                style={focus ? { background: `${accent}22` } : undefined}>
                <td className="px-1.5 py-1 text-fg-faint">{i}</td>
                <td className="px-1.5 py-1" style={{ color: focus ? accent : undefined, fontWeight: focus ? 800 : 500 }}>{r.key}</td>
                <td className="px-1.5 py-1 text-fg-muted">{r.label}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
