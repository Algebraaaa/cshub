import { useState } from 'react'
import { getSessions } from '../storage/ieltsStore.js'
import { groupSets, bandTrend, buildMarkdown, buildPrintHtml } from '../storage/setReports.js'
import { getReason } from '../core/index.js'
import { IeltsCard, Badge, EmptyState, IeltsButton } from './ui.jsx'

function downloadText(filename, text, type = 'text/markdown') {
  const blob = new Blob([text], { type: `${type};charset=utf-8` })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function safeOpenPrint(html) {
  const w = window.open('', '_blank')
  if (!w) {
    window.alert('浏览器拦截了打印窗口，请允许弹窗后重试')
    return
  }
  w.document.open()
  w.document.write(html)
  w.document.close()
}

const MOD_LABEL = { reading: '阅读', listening: '听力' }

function TrendChips({ parts }) {
  const min = Math.min(...parts.map((p) => p.band))
  const max = Math.max(...parts.map((p) => p.band))
  const improving = parts.length > 1 && max > min
  return (
    <div className="flex flex-wrap items-center gap-1 text-xs">
      {parts.map((p, i) => (
        <span key={p.sessionId || i} className="flex items-center gap-1">
          <span className="rounded bg-surface px-1.5 py-0.5">P{i + 1}: <b>{p.band}</b></span>
          {i < parts.length - 1 && <span className="text-fg-faint">→</span>}
        </span>
      ))}
      {improving && <Badge tone="rule">呈上升</Badge>}
    </div>
  )
}

function SetCard({ set }) {
  const sameLabelSets = groupSets(getSessions()).filter(
    (x) => x.module === set.module && x.sourceLabel === set.sourceLabel,
  )
  const trend = bandTrend(sameLabelSets)

  function makeReport() {
    const reasonLabels = new Map()
    for (const id of Object.keys(set.reasonTotals)) {
      reasonLabels.set(id, getReason(id)?.label || id)
    }
    return buildMarkdown(set, { reasonLabels })
  }

  function exportMd() {
    const safe = set.sourceLabel.replace(/[\\/:*?"<>|\s]+/g, '_')
    downloadText(`ielts-${set.module}-${safe}.md`, makeReport())
  }
  function printReport() {
    safeOpenPrint(buildPrintHtml(makeReport(), `${set.sourceLabel} 整套复盘`))
  }

  return (
    <IeltsCard>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <div className="flex flex-wrap items-center gap-2 font-bold text-fg">
            <Badge tone="muted">{MOD_LABEL[set.module]}</Badge>
            {set.sourceLabel}
            {set.complete
              ? <Badge tone="rule">已录齐 {set.recordedParts}/{set.expectedParts}</Badge>
              : <Badge tone="warn">部分 {set.recordedParts}/{set.expectedParts}</Badge>}
          </div>
          <div className="mt-1 text-xs text-fg-muted">
            {set.totalCorrect}/{set.totalQuestions} 正确 · 折算 raw {set.raw}/40 ·
            整套估算 <b className="text-sm text-fg">{set.band}</b> ·
            用时 {Math.round(set.totalDurationSec / 60)} 分钟
          </div>
        </div>
        <div className="flex gap-2">
          <IeltsButton variant="ghost" className="text-xs" onClick={exportMd}>导出 Markdown</IeltsButton>
          <IeltsButton variant="ghost" className="text-xs" onClick={printReport}>打印 / PDF</IeltsButton>
        </div>
      </div>

      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[460px] text-xs">
          <thead>
            <tr className="text-fg-faint">
              <th className="p-1 text-left">部分</th>
              <th className="p-1 text-left">日期</th>
              <th className="p-1 text-right">正确</th>
              <th className="p-1 text-right">正确率</th>
              <th className="p-1 text-right">折算 raw</th>
              <th className="p-1 text-right">估算 band</th>
              <th className="p-1 text-right">用时</th>
            </tr>
          </thead>
          <tbody>
            {set.parts.map((p, i) => (
              <tr key={p.sessionId || i} className="border-t border-border-soft/60">
                <td className="p-1">{MOD_LABEL[set.module]} {p.index}</td>
                <td className="p-1">{p.createdAt ? new Date(p.createdAt).toLocaleDateString() : '—'}</td>
                <td className="p-1 text-right font-mono">{p.correct}/{p.total}</td>
                <td className="p-1 text-right font-mono">{Math.round(p.accuracy * 100)}%</td>
                <td className="p-1 text-right font-mono">{p.raw}</td>
                <td className="p-1 text-right font-mono font-bold">{p.band}</td>
                <td className="p-1 text-right">{p.durationSec ? `${Math.round(p.durationSec / 60)} 分` : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-3">
        <TrendChips parts={set.parts} />
      </div>

      {trend.length > 1 && (
        <div className="mt-2 text-xs text-fg-muted">
          同套题历史趋势：
          {trend.map((t, i) => (
            <span key={i}>
              {i > 0 && ' → '}<b className="text-fg">{t.band}</b>
              <span className="text-fg-faint">（{new Date(t.at).toLocaleDateString()}）</span>
            </span>
          ))}
        </div>
      )}

      {Object.keys(set.reasonTotals).length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5 text-xs">
          {Object.entries(set.reasonTotals).sort((a, b) => b[1] - a[1]).map(([id, n]) => (
            <Badge key={id} tone={getReason(id)?.source === 'rule' ? 'rule' : 'model'}>
              {getReason(id)?.label || id} × {n}
            </Badge>
          ))}
        </div>
      )}
      <p className="mt-2 text-[11px] text-fg-faint">
        分数段按官方锚点近似换算，仅供趋势参考，非官方成绩；官方以整套 40 题为准。
      </p>
    </IeltsCard>
  )
}

export default function FullSetView() {
  const [filter, setFilter] = useState('all')
  const [, setTick] = useState(0)
  const sessions = getSessions()
  let sets = groupSets(sessions)
  if (filter !== 'all') {
    sets = sets.filter((s) => (filter === 'complete' ? s.complete : !s.complete))
  }

  return (
    <div className="space-y-3">
      <IeltsCard>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <div className="font-bold text-fg">整套视图</div>
            <p className="mt-0.5 text-xs text-fg-muted">
              同一来源标签下，听力 4 个 Part、阅读 3 篇自动归为一套；在复盘时给各部分填相同标签即可。
            </p>
          </div>
          <div className="flex gap-1">
            {[['all', '全部'], ['complete', '已录齐'], ['partial', '部分']].map(([k, label]) => (
              <button key={k} type="button" onClick={() => { setFilter(k); setTick((n) => n + 1) }}
                className={`rounded-full px-3 py-1 text-xs ${filter === k ? 'bg-accent text-white' : 'bg-surface text-fg-muted'}`}>
                {label}
              </button>
            ))}
          </div>
        </div>
      </IeltsCard>

      {sets.length === 0 && (
        <IeltsCard><EmptyState>
          还没有可归套的复盘。在阅读/听力复盘的“来源标签”里给同一套题的各部分填同一个名字
          （如“剑18 Test 1”），录齐后这里会出现整套报告。
        </EmptyState></IeltsCard>
      )}
      <div className="space-y-3">{sets.map((s) => <SetCard key={s.key} set={s} />)}</div>
    </div>
  )
}
