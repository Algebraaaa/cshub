import { Link } from 'react-router-dom'
import { listIeltsMistakes } from '../../../services/storage/mistakeStore.js'
import { getSessions, getWritingProgress, getSpeakingHistory, getCompletedSets } from '../storage/ieltsStore.js'
import { getWritingLadder, getReason } from '../core/index.js'
import { IeltsCard, Badge, EmptyState } from './ui.jsx'
import { dueSummary, KIND_LABELS } from '../storage/spacedRepetition.js'

const ENTRY_CARDS = [
  { to: '/ielts/reading', icon: '📖', title: '阅读复盘', desc: '一篇文章：判题、逐题讲解、定位句与同义替换。' },
  { to: '/ielts/listening', icon: '🎧', title: '听力复盘', desc: '一个 Part：信号词、改口干扰、写下你的反思。' },
  { to: '/ielts/sets', icon: '📊', title: '整套报告', desc: '三篇/四个 Part 归套，用时、正确率、分数段趋势可导出。' },
  { to: '/ielts/mistakes', icon: '🗂️', title: '错题库与画像', desc: '错因统计、题型画像、今日复习与复练清单。' },
  { to: '/ielts/writing', icon: '✍️', title: '写作训练', desc: '分步解锁：开头、overview、主体到限时全套。' },
  { to: '/ielts/speaking', icon: '🗣️', title: '口语训练', desc: 'Part 1/2/3 出题、计时、像聊天一样的反馈。' },
  { to: '/ielts/vocab', icon: '📒', title: '词块库', desc: 'Task 1/2 表达、替换、信号词，可收藏导入。' },
]

function TopReasons({ mistakes }) {
  const counts = {}
  for (const m of mistakes) counts[m.reasonId] = (counts[m.reasonId] || 0) + 1
  const top = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5)
  if (!top.length) return <p className="text-xs text-fg-faint">完成一次复盘后出现错因摘要。</p>
  return (
    <div className="flex flex-wrap gap-2">
      {top.map(([id, n]) => (
        <Link key={id} to="/ielts/mistakes">
          <Badge tone={getReason(id)?.source === 'rule' ? 'rule' : 'model'}>
            {getReason(id)?.label || id} × {n}
          </Badge>
        </Link>
      ))}
    </div>
  )
}

export default function IeltsDashboard() {
  const mistakes = listIeltsMistakes()
  const sessions = getSessions()
  const progress = getWritingProgress()
  const speaking = getSpeakingHistory()
  const ladder = getWritingLadder()
  const sets = getCompletedSets()
  const due = dueSummary()

  return (
    <div className="space-y-4">
      <IeltsCard>
        <h2 className="text-lg font-bold text-fg">雅思复盘与刻意练习</h2>
        <p className="mt-1 max-w-3xl text-sm text-fg-muted">
          这里不做新题，只解决做完题之后的事：确定性判对错 → 只依据你的原文逐题讲解为什么错 →
          归因进错题库 → 按弱点刻意练习。模型用你自己的 key；没有 key 时判题、错题、统计、计时全部可用，讲解给醒目标注的模拟反馈。
        </p>
      </IeltsCard>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {ENTRY_CARDS.map((c) => (
          <Link key={c.to} to={c.to}>
            <IeltsCard className="h-full transition-transform hover:-translate-y-0.5">
              <div className="text-2xl">{c.icon}</div>
              <div className="mt-1 font-bold text-fg">{c.title}</div>
              <p className="mt-0.5 text-xs text-fg-muted">{c.desc}</p>
            </IeltsCard>
          </Link>
        ))}
      </div>

      <IeltsCard>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="text-sm font-bold text-fg">今日复习</div>
          <Link to="/ielts/mistakes" className="text-xs text-accent underline">去复习</Link>
        </div>
        {due.due === 0 ? (
          <p className="mt-1 text-xs text-fg-muted">今天没有到期内容。新错题、收藏词块、加入替换库的表达会自动按 1→2→4→7→15→30→60 天排期。</p>
        ) : (
          <div className="mt-2 flex flex-wrap gap-2">
            {Object.entries(due.byKind).filter(([, n]) => n > 0).map(([kind, n]) => (
              <Link key={kind} to={kind === 'mistake' ? '/ielts/mistakes' : '/ielts/vocab'}
                className="rounded-full bg-accent-soft px-3 py-1 text-xs text-accent">
                {KIND_LABELS[kind] || kind} {n}
              </Link>
            ))}
          </div>
        )}
      </IeltsCard>

      {sets.length ? (
        <IeltsCard>
          <div className="mb-2 text-sm font-bold text-fg">整套估算分数段</div>
          <ul className="space-y-1 text-xs text-fg-muted">
            {sets.map((set) => (
              <li key={set.key} className="flex flex-wrap items-center justify-between gap-2">
                <span>{set.label}</span>
                <span className="font-mono text-sm font-bold text-fg">band {set.band}（raw ≈ {set.raw}/40）</span>
              </li>
            ))}
          </ul>
        </IeltsCard>
      ) : null}

      <div className="grid gap-3 lg:grid-cols-3">
        <IeltsCard>
          <div className="mb-2 flex items-center justify-between">
            <div className="text-sm font-bold text-fg">最近复盘</div>
            <Link className="text-xs text-accent underline" to="/ielts/sets">整套报告</Link>
          </div>
          {sessions.length === 0 ? <EmptyState>还没有复盘记录</EmptyState> : (
            <ul className="space-y-1.5 text-xs">
              {sessions.slice(0, 5).map((s) => (
                <li key={s.id} className="flex items-center justify-between gap-2">
                  <span className="min-w-0 truncate text-fg-muted">
                    <Badge tone="muted">{s.module === 'reading' ? '阅读' : '听力'}</Badge> {s.sourceLabel}
                  </span>
                  <span className="font-mono text-fg">{s.correct}/{s.total}</span>
                </li>
              ))}
            </ul>
          )}
        </IeltsCard>

        <IeltsCard>
          <div className="mb-2 text-sm font-bold text-fg">弱点画像摘要</div>
          <TopReasons mistakes={mistakes} />
          <p className="mt-2 text-[11px] text-fg-faint">共 {mistakes.length} 道错题，全部按数据统计，不写空泛鼓励。</p>
        </IeltsCard>

        <IeltsCard>
          <div className="mb-2 flex items-center justify-between">
            <div className="text-sm font-bold text-fg">写作训练进度</div>
            <Link className="text-xs text-accent underline" to="/ielts/writing">继续训练</Link>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {ladder.map((it) => (
              <span key={it.id} title={it.title}
                className={`rounded px-1.5 py-0.5 text-[11px] ${progress.completed.includes(it.id)
                  ? 'bg-success/15 text-success'
                  : 'bg-surface text-fg-faint'}`}>
                {progress.completed.includes(it.id) ? '✓ ' : ''}{it.id}
              </span>
            ))}
          </div>
          <div className="mt-3 text-xs text-fg-muted">口语最近练习：{speaking.length
            ? new Date(speaking[0].at).toLocaleDateString()
            : '还没有'}</div>
        </IeltsCard>
      </div>
    </div>
  )
}
