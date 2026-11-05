import { useState } from 'react'
import { listIeltsMistakes, updateIeltsMistake, deleteIeltsMistake } from '../../../services/storage/mistakeStore.js'
import { reasonsForModule, getReason } from '../core/index.js'
import { getParaphrases, hasSavedPassages, stripSavedPassages } from '../storage/ieltsStore.js'
import { removeItem } from '../storage/spacedRepetition.js'
import ReviewToday from './ReviewToday.jsx'
import { IeltsCard, Badge, IeltsButton, EmptyState, Banner, inputClass } from './ui.jsx'

const TYPE_LABEL = {
  gap: '填空', tfng: 'TFNG 判断', ynng: 'YNNG 判断', mcq: '单选',
  'mcq-multi': '多选', matching: '匹配',
}

function monthOf(ts) {
  const d = new Date(ts)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function Profile({ mistakes }) {
  const byReason = {}
  const byType = {}
  const byMonth = {}
  for (const m of mistakes) {
    byReason[m.reasonId] = (byReason[m.reasonId] || 0) + 1
    byType[m.questionType] = (byType[m.questionType] || 0) + 1
    const mk = monthOf(m.createdAt)
    byMonth[mk] = byMonth[mk] || {}
    byMonth[mk][m.reasonId] = (byMonth[mk][m.reasonId] || 0) + 1
  }
  const topReasons = Object.entries(byReason).sort((a, b) => b[1] - a[1])
  const topTypes = Object.entries(byType).sort((a, b) => b[1] - a[1])
  const paraphrases = getParaphrases()
  const recurring = {}
  for (const p of paraphrases) {
    const key = `${p.questionPhrase}|${p.passagePhrase}`
    recurring[key] = (recurring[key] || 0) + 1
  }
  const topRecurring = Object.entries(recurring).filter(([, n]) => n > 1).sort((a, b) => b[1] - a[1]).slice(0, 5)
  const months = Object.keys(byMonth).sort()

  if (!mistakes.length) return <EmptyState>还没有错题数据。完成一次阅读或听力复盘后，弱点画像会出现在这里。</EmptyState>

  return (
    <div className="grid gap-3 md:grid-cols-3">
      <IeltsCard>
        <div className="mb-2 text-sm font-bold text-fg">错因分布（按数据）</div>
                        <ul className="space-y-1 text-xs text-fg-muted">
          {topReasons.map(([id, n]) => (
            <li key={id} className="flex items-center justify-between gap-2">
              <span>{getReason(id)?.label || id}</span>
              <span className="font-mono font-bold text-fg">{n}</span>
            </li>
          ))}
        </ul>
      </IeltsCard>
      <IeltsCard>
        <div className="mb-2 text-sm font-bold text-fg">最常错题型</div>
        <ul className="space-y-1 text-xs text-fg-muted">
          {topTypes.map(([t, n]) => (
            <li key={t} className="flex items-center justify-between gap-2">
              <span>{TYPE_LABEL[t] || t}</span><span className="font-mono font-bold text-fg">{n}</span>
            </li>
          ))}
        </ul>
        <div className="mt-3 text-[11px] text-fg-faint">共 {mistakes.length} 道错题</div>
      </IeltsCard>
      <IeltsCard>
        <div className="mb-2 text-sm font-bold text-fg">趋势与反复出现的替换</div>
        <div className="space-y-1 text-xs text-fg-muted">
          {months.map((mk) => (
            <div key={mk}>{mk}：{Object.entries(byMonth[mk]).map(([id, n]) => `${getReason(id)?.label || id}×${n}`).join('，')}</div>
          ))}
        </div>
        {topRecurring.length ? (
          <ul className="mt-2 space-y-1 text-xs text-fg-muted">
            {topRecurring.map(([key, n]) => {
              const [q, p] = key.split('|')
              return <li key={key}>{q} ↔ {p} <span className="font-mono">×{n}</span></li>
            })}
          </ul>
        ) : <p className="mt-2 text-[11px] text-fg-faint">在复盘中把同义替换收进"我的替换库"后，这里统计反复出现的替换。</p>}
      </IeltsCard>
    </div>
  )
}

function Repractice({ mistakes }) {
  const [revealed, setRevealed] = useState({})
  if (!mistakes.length) return null
  return (
    <IeltsCard>
      <div className="mb-2 text-sm font-bold text-fg">复练清单（先做，再展开答案与定位范围）</div>
      <ol className="space-y-2">
        {mistakes.slice(0, 20).map((m, i) => (
          <li key={m.id} className="rounded-lg border border-border-soft p-2 text-sm">
            <div className="flex items-start gap-2">
              <span className="font-mono text-xs text-fg-faint">{i + 1}.</span>
              <div className="min-w-0 flex-1">
                <div className="text-fg">{m.questionSummary || '（题干缺失）'}</div>
                <button type="button" className="mt-1 text-xs text-accent underline"
                  onClick={() => setRevealed((r) => ({ ...r, [m.id]: !r[m.id] }))}>
                  {revealed[m.id] ? '收起答案' : '查看答案与定位范围'}
                </button>
                {revealed[m.id] ? (
                  <div className="mt-1 text-xs text-fg-muted">
                    <div>正确答案：<b className="text-fg">{m.keyAnswer}</b>（你的答案：{m.userAnswer || '未作答'}）</div>
                    {m.locationQuote ? <div className="mt-1 rounded bg-surface p-1.5">定位范围：{m.locationQuote}</div> : null}
                  </div>
                ) : null}
              </div>
            </div>
          </li>
        ))}
      </ol>
    </IeltsCard>
  )
}

export default function MistakesDashboard() {
  const [, setVersion] = useState(0)
  const mistakes = listIeltsMistakes()
  const [moduleFilter, setModuleFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [reasonFilter, setReasonFilter] = useState('all')
  const [sourceFilter, setSourceFilter] = useState('all')
  const [days, setDays] = useState('all')

  const sources = [...new Set(mistakes.map((m) => m.sourceLabel).filter(Boolean))]
  const reasonIds = [...new Set(mistakes.map((m) => m.reasonId))]

  const filtered = mistakes.filter((m) => {
    if (moduleFilter !== 'all' && m.module !== moduleFilter) return false
    if (typeFilter !== 'all' && m.questionType !== typeFilter) return false
    if (reasonFilter !== 'all' && m.reasonId !== reasonFilter) return false
    if (sourceFilter !== 'all' && m.sourceLabel !== sourceFilter) return false
    if (days !== 'all' && Date.now() - m.createdAt > Number(days) * 86400000) return false
    return true
  })

  function changeReason(id, reasonId) {
    const def = getReason(reasonId)
    updateIeltsMistake(id, { reasonId, reasonSource: def?.source === 'rule' ? 'rule' : 'model' })
    setVersion((v) => v + 1)
  }
  function remove(id) {
    deleteIeltsMistake(id)
    removeItem('mistake', id)
    setVersion((v) => v + 1)
  }

  const savedFull = hasSavedPassages()
  function stripTexts() {
    stripSavedPassages()
    setVersion((v) => v + 1)
  }
  return (
    <div className="space-y-4">
      {savedFull ? (
        <Banner tone="warn">
          有会话保存了整篇原文/文稿。
          <button type="button" className="ml-2 underline" onClick={stripTexts}>一键删除全部全文</button>
          （错题库里的定位句保留）
        </Banner>
      ) : null}
      <Profile mistakes={mistakes} />

      <IeltsCard>
        <div className="mb-3 text-sm font-bold text-fg">筛选</div>
        <div className="grid gap-2 sm:grid-cols-5">
          <select className={inputClass} value={moduleFilter} onChange={(e) => setModuleFilter(e.target.value)} aria-label="按模块筛选">
            <option value="all">全部模块</option><option value="reading">阅读</option><option value="listening">听力</option>
          </select>
          <select className={inputClass} value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} aria-label="按题型筛选">
            <option value="all">全部题型</option>
            {Object.entries(TYPE_LABEL).map(([id, label]) => <option key={id} value={id}>{label}</option>)}
          </select>
          <select className={inputClass} value={reasonFilter} onChange={(e) => setReasonFilter(e.target.value)} aria-label="按错因筛选">
            <option value="all">全部错因</option>
            {reasonIds.map((id) => <option key={id} value={id}>{getReason(id)?.label || id}</option>)}
          </select>
          <select className={inputClass} value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value)} aria-label="按来源筛选">
            <option value="all">全部来源</option>
            {sources.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select className={inputClass} value={days} onChange={(e) => setDays(e.target.value)} aria-label="按时间筛选">
            <option value="all">全部时间</option><option value="7">近 7 天</option>
            <option value="30">近 30 天</option><option value="90">近 90 天</option>
          </select>
        </div>
      </IeltsCard>

      <ReviewToday mistakes={mistakes} refresh={() => setVersion((v) => v + 1)} />
      <Repractice mistakes={filtered} />

      {filtered.length === 0 ? <EmptyState>没有符合筛选条件的错题。</EmptyState> : (
        <div className="space-y-3">
          {filtered.map((m) => (
            <IeltsCard key={m.id}>
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <Badge tone="muted">{m.module === 'reading' ? '阅读' : '听力'}</Badge>
                    <Badge tone="muted">{TYPE_LABEL[m.questionType] || m.questionType}</Badge>
                    <Badge tone={m.reasonSource === 'rule' ? 'rule' : 'model'}>
                      {m.reasonSource === 'rule' ? '规则判定' : '模型建议'}
                    </Badge>
                    {m.sourceLabel ? <span className="text-[11px] text-fg-faint">{m.sourceLabel}</span> : null}
                  </div>
                  <div className="text-sm text-fg">{m.questionSummary || '（题干缺失）'}</div>
                  <div className="mt-1 text-xs text-fg-muted">
                    答案册：<b className="text-fg">{m.keyAnswer}</b> · 你：<b className="text-danger">{m.userAnswer || '未作答'}</b>
                  </div>
                  {m.locationQuote ? <div className="mt-2 rounded border border-success/30 bg-success/5 p-2 text-xs text-fg-muted">定位句：{m.locationQuote}</div> : null}
                  {m.explanation ? <p className="mt-2 text-xs text-fg-muted">{m.explanation}</p> : null}
                  {m.reflection ? <p className="mt-2 rounded bg-surface p-2 text-xs text-fg-muted">我的反思：{m.reflection}</p> : null}
                </div>
                <IeltsButton variant="ghost" onClick={() => remove(m.id)}>删除</IeltsButton>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-[11px] text-fg-faint">错因：</span>
                <select className={`${inputClass} max-w-xs py-1 text-xs`} value={m.reasonId}
                  onChange={(e) => changeReason(m.id, e.target.value)}>
                  {reasonsForModule(m.module).map((r) => (
                    <option key={r.id} value={r.id}>{r.label}{r.source === 'rule' ? '（规则）' : ''}</option>
                  ))}
                </select>
              </div>
            </IeltsCard>
          ))}
        </div>
      )}
    </div>
  )
}
