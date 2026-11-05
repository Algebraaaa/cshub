// 今日复习：错题按错因分组的间隔复习清单。
import { useState } from 'react'
import { dueItems } from '../storage/spacedRepetition.js'
import { getReason } from '../core/index.js'
import GradeButtons from './ReviewGrade.jsx'
import { IeltsCard, Badge, EmptyState } from './ui.jsx'

function DueMistake({ m, onGraded }) {
  const [revealed, setRevealed] = useState(false)
  return (
    <li className="rounded-lg border border-border-soft p-2">
      <div className="flex flex-wrap items-center gap-2 text-[11px]">
        <Badge tone="muted">{m.module === 'reading' ? '阅读' : '听力'}</Badge>
        <span className="font-semibold text-fg">{getReason(m.reasonId)?.label || m.reasonId}</span>
        {m.sourceLabel ? <span className="text-fg-faint">{m.sourceLabel}</span> : null}
      </div>
      <div className="mt-1 text-sm text-fg">{m.questionSummary || '（题干缺失）'}</div>
      <button type="button" className="mt-1 text-xs text-accent underline" onClick={() => setRevealed((v) => !v)}>
        {revealed ? '收起答案与定位句' : '先回忆，再对答案'}
      </button>
      {revealed && (
        <div className="mt-1 text-xs text-fg-muted">
          <div>正确答案：<b className="text-fg">{m.keyAnswer}</b>（你的答案：{m.userAnswer || '未作答'}）</div>
          {m.locationQuote ? <div className="mt-1 rounded bg-surface p-1.5">定位句：{m.locationQuote}</div> : null}
        </div>
      )}
      <GradeButtons kind="mistake" refId={m.id} onGraded={onGraded} />
    </li>
  )
}

export default function ReviewToday({ mistakes, refresh }) {
  const [, setTick] = useState(0)
  const dueIds = new Set(dueItems().filter((i) => i.kind === 'mistake').map((i) => i.refId))
  const due = mistakes.filter((m) => dueIds.has(m.id))
  if (due.length === 0) {
    return (
      <IeltsCard>
        <div className="text-sm font-bold text-fg">今日错题复习</div>
        <EmptyState>今天没有到期的错题间隔复习 🎉 新错题入库后会从“今天”开始排期（1→2→4→7→15→30→60 天）。</EmptyState>
      </IeltsCard>
    )
  }
  const byReason = {}
  for (const m of due) (byReason[m.reasonId] ||= []).push(m)
  return (
    <IeltsCard>
      <div className="mb-2 flex items-center justify-between">
        <div className="text-sm font-bold text-fg">今日错题复习（{due.length}）</div>
        <span className="text-[11px] text-fg-faint">按错因分组 · 先回忆再自评</span>
      </div>
      <div className="space-y-3">
        {Object.entries(byReason).map(([reasonId, list]) => (
          <div key={reasonId}>
            <div className="mb-1 text-xs font-semibold text-fg-muted">
              {getReason(reasonId)?.label || reasonId}（{list.length}）
            </div>
            <ol className="space-y-2">
              {list.map((m) => (
                <DueMistake key={m.id} m={m} onGraded={() => { setTick((t) => t + 1); refresh?.() }} />
              ))}
            </ol>
          </div>
        ))}
      </div>
    </IeltsCard>
  )
}
