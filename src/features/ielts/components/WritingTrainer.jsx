import { useState } from 'react'
import { getWritingLadder, canStart } from '../core/index.js'
import { runTemplate } from '../llm/runner.js'
import { WRITING_KNOWLEDGE, searchKnowledge } from '../data/writingKnowledge.js'
import { WRITING_TASKS, tasksForStep } from '../data/writingTasks.js'
import {
  getWritingProgress, recordWritingAttempt, getKnowledgeNotes,
} from '../storage/ieltsStore.js'
import { useIeltsSettings } from '../hooks/useIeltsData.js'
import { IeltsCard, IeltsButton, Badge, Banner, EmptyState, inputClass } from './ui.jsx'
import Timer from './Timer.jsx'

const STEP_AREA = {
  't1-intro': 'task1-dynamic', 't1-overview': 'task1-dynamic', 't1-body': 'task1-dynamic',
  'mock-t1': 'task1-dynamic', 't2-intro': 'task2', 't2-conclusion': 'task2',
  't2-outline': 'task2', 't2-body': 'task2', 'mock-t2': 'task2',
  'mock-full': 'task2', translation: 'general',
}

function TaskDataView({ task }) {
  const d = task.data
  if (!d) return null
  if (d.type === 'table') {
    return (
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-xs">
          <caption className="pb-1 text-fg-faint">{d.caption}</caption>
          <thead><tr>{d.columns.map((c) => <th key={c} className="border border-border-strong px-2 py-1 text-fg">{c}</th>)}</tr></thead>
          <tbody>{d.rows.map((row, i) => (
            <tr key={i}>{row.map((cell, j) => <td key={j} className="border border-border-soft px-2 py-1 text-fg-muted">{cell}</td>)}</tr>
          ))}</tbody>
        </table>
      </div>
    )
  }
  if (d.type === 'pies') {
    return (
      <div className="grid gap-3 sm:grid-cols-2">
        {d.pies.map((pie) => (
          <div key={pie.year}>
            <div className="mb-1 text-xs font-bold text-fg">{pie.year}</div>
            <ul className="space-y-0.5 text-xs text-fg-muted">
              {pie.slices.map(([name, pct]) => (
                <li key={name} className="flex justify-between gap-2">
                  <span>{name}</span>
                  <span className="font-mono">
                    <span className="mr-1 inline-block h-2 rounded bg-accent align-middle" style={{ width: pct * 2 }} />
                    {pct}%
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    )
  }
  if (d.type === 'process') {
    return (
      <ol className="space-y-1.5 text-xs text-fg-muted">
        {d.stages.map(([name, desc], i) => (
          <li key={name}><b className="text-fg">{i + 1}. {name}：</b>{desc}</li>
        ))}
      </ol>
    )
  }
  if (d.type === 'map') {
    return (
      <ul className="space-y-1.5 text-xs text-fg-muted">
        {d.changes.map(([area, desc]) => <li key={area}><b className="text-fg">{area}：</b>{desc}</li>)}
      </ul>
    )
  }
  return null
}

function KnowledgePanel({ stepId }) {
  const [q, setQ] = useState('')
  const area = STEP_AREA[stepId]
  const custom = getKnowledgeNotes().map((n) => ({ ...n, builtin: false }))
  const all = [...WRITING_KNOWLEDGE, ...custom]
  const scoped = all.filter((c) => c.area === area)
  const shown = searchKnowledge(scoped, q)
  const [open, setOpen] = useState(null)
  return (
    <IeltsCard>
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <div className="text-sm font-bold text-fg">知识卡片</div>
        <input className={`${inputClass} max-w-xs py-1 text-xs`} placeholder="检索知识卡片…" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      <div className="space-y-2">
        {shown.map((c) => (
          <details key={c.id} className="rounded-lg border border-border-soft" open={open === c.id}>
            <summary className="cursor-pointer list-none px-3 py-2 text-xs font-semibold text-fg" onClick={() => setOpen(open === c.id ? null : c.id)}>
              {c.title}{!c.builtin ? <Badge tone="model">我的笔记</Badge> : null}
            </summary>
            <p className="whitespace-pre-line px-3 pb-2 text-xs leading-relaxed text-fg-muted">{c.body}</p>
          </details>
        ))}
        {shown.length === 0 ? <p className="text-xs text-fg-faint">该步骤暂无匹配卡片，可在设置页导入自己的笔记。</p> : null}
      </div>
    </IeltsCard>
  )
}

function FeedbackView({ res }) {
  if (!res) return null
  if (res.status && res.status !== 'ok' && res.status !== 'mock') {
    return <Banner tone="danger">反馈生成失败：{res.reason}</Banner>
  }
  const d = res.data
  return (
    <div className="space-y-2 rounded-xl border border-border-strong p-3 text-sm">
      {res.simulated ? <Badge tone="mock">模拟反馈 · 非真实模型反馈</Badge> : null}
      <p><b className="text-fg">任务回应/构思：</b><span className="text-fg-muted">{d.taskResponse}</span></p>
      <p><b className="text-fg">衔接：</b><span className="text-fg-muted">{d.coherence}</span></p>
      {d.issues?.length ? (
        <div>
          <div className="text-xs font-bold text-fg">最值得改的 {d.issues.length} 处：</div>
          <ol className="mt-1 list-decimal space-y-1 pl-5 text-xs text-fg-muted">
            {d.issues.map((it, i) => (
              <li key={i}><b className="text-fg">原句：</b>{it.quote}<br /><b className="text-fg">改法：</b>{it.suggestion}<br /><b className="text-fg">原因：</b>{it.reason}</li>
            ))}
          </ol>
        </div>
      ) : null}
      {d.expressions?.length ? (
        <div className="text-xs"><b className="text-fg">考场可用表达：</b>{d.expressions.join('；')}</div>
      ) : null}
      {d.wordCountNote ? <Banner tone="warn">{d.wordCountNote}</Banner> : null}
      {d.estimatedBand ? <Banner tone="info">{d.estimatedBand}（估算，非官方成绩）</Banner> : null}
    </div>
  )
}

export default function WritingTrainer() {
  const [settings] = useIeltsSettings()
  const [version, setVersion] = useState(0)
  const progress = getWritingProgress()
  const ladder = getWritingLadder()
  const firstUnlocked = ladder.find((it) => canStart({ completed: progress.completed }, it.id))
  const [selected, setSelected] = useState(firstUnlocked?.id || 't1-intro')
  const item = ladder.find((it) => it.id === selected)
  const tasks = tasksForStep(selected)
  const [taskId, setTaskId] = useState(tasks[0]?.id || 'custom')
  const [customPrompt, setCustomPrompt] = useState('')
  const [text, setText] = useState('')
  const [res, setRes] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [outlineMinutes, setOutlineMinutes] = useState(10)

  const task = WRITING_TASKS.find((t) => t.id === taskId) || tasks[0]
  const locked = !canStart({ completed: progress.completed }, selected)
  const words = text.trim().split(/\s+/).filter(Boolean).length

  function selectStep(id) {
    setSelected(id)
    setRes(null)
    setText('')
    const ts = tasksForStep(id)
    setTaskId(ts[0]?.id || 'custom')
  }

  const promptText = taskId === 'custom' ? customPrompt : (task?.prompt || '')

  async function submit() {
    if (!text.trim()) return
    setSubmitting(true)
    const result = await runTemplate('writing-feedback', {
      stepId: selected,
      prompt: promptText,
      text,
      knowledge: knowledgeForStep(selected),
      targetBand: settings.targetBand,
      strictness: settings.strictness,
    }, settings)
    setRes(result)
    if (result.status === 'ok' || result.status === 'mock') {
      recordWritingAttempt(selected, {
        taskId, taskTitle: taskId === 'custom' ? '自贴题' : task?.title,
        text, feedback: result.data, simulated: result.simulated,
      })
      setVersion((v) => v + 1)
    }
    setSubmitting(false)
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[260px_1fr]">
      <IeltsCard className="h-fit">
        <div className="mb-2 text-sm font-bold text-fg">训练路径</div>
        <div className="space-y-3">
          {['task1', 'task2', 'integrated', 'foundation'].map((track) => (
            <div key={track}>
              <div className="mb-1 text-[11px] font-bold uppercase tracking-wide text-fg-faint">
                {{ task1: 'Task 1', task2: 'Task 2', integrated: '全套', foundation: '基础' }[track]}
              </div>
              <div className="space-y-1">
                {ladder.filter((it) => it.track === track).map((it) => {
                  const done = progress.completed.includes(it.id)
                  const enabled = canStart({ completed: progress.completed }, it.id)
                  return (
                    <button key={it.id} type="button" disabled={!enabled} onClick={() => enabled && selectStep(it.id)}
                      className={`flex w-full items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-left text-xs ${
                        selected === it.id ? 'bg-accent-soft text-accent border border-accent-border' : 'text-fg-muted'
                      } ${enabled ? '' : 'cursor-not-allowed opacity-50'}`}>
                      <span>{done ? '✓ ' : enabled ? '' : '🔒 '}{it.title}</span>
                      {it.timed ? <span className="font-mono text-[10px]">{it.defaultMinutes}m</span> : null}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </IeltsCard>

      <div className="space-y-4" key={version}>
        {locked ? (
          <IeltsCard><Banner tone="warn">该步骤尚未解锁。请先完成前置步骤（每步至少提交一次并拿到反馈）。</Banner></IeltsCard>
        ) : selected === 'translation' ? (
          <TranslationTrainer settings={settings} onDone={() => setVersion((v) => v + 1)} />
        ) : (
          <>
            <IeltsCard>
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="text-base font-bold text-fg">{item?.title}</div>
                  <div className="text-xs text-fg-faint">至少提交一次并拿到反馈后解锁下一步</div>
                </div>
                {item?.timed ? (
                  <div className="flex items-center gap-2">
                    {selected === 't2-outline' ? (
                      <label className="flex items-center gap-1 text-[11px] text-fg-faint">
                        限时
                        <input type="number" min="1" max="30" value={outlineMinutes}
                          className="w-14 rounded border border-border-strong bg-bg px-1 py-0.5 text-fg"
                          onChange={(e) => setOutlineMinutes(Number(e.target.value) || 10)} />
                        分钟（可调）
                      </label>
                    ) : null}
                    <Timer minutes={selected === 't2-outline' ? outlineMinutes : item.defaultMinutes} />
                  </div>
                ) : null}
              </div>
              {tasks.length ? (
                <div className="space-y-2">
                  <select className={inputClass} value={taskId} onChange={(e) => setTaskId(e.target.value)} aria-label="选择题目">
                    {tasks.map((t) => <option key={t.id} value={t.id}>{t.title}</option>)}
                    <option value="custom">我自己贴题</option>
                  </select>
                  {taskId === 'custom' ? (
                    <textarea className={inputClass} rows={3} value={customPrompt} onChange={(e) => setCustomPrompt(e.target.value)} placeholder="粘贴题目要求…" />
                  ) : (
                    <div className="space-y-2 rounded-lg border border-border-soft p-3">
                      <p className="text-xs leading-relaxed text-fg-muted">{task?.prompt}</p>
                      <TaskDataView task={task} />
                      <span className="text-[10px] text-fg-faint">原创示例，非真题</span>
                    </div>
                  )}
                </div>
              ) : null}
              <div className="mt-3">
                <textarea className={inputClass} rows={selected === 't2-outline' ? 8 : 12}
                  value={text} onChange={(e) => setText(e.target.value)}
                  placeholder={selected === 't2-outline'
                    ? '立场；开头一句、结尾一句；两个主体段中心论点，每段两个分论点，并写清论证方式（举例/因果/对比）。'
                    : '把你的写作贴在这里…'} />
                <div className="mt-1 flex items-center justify-between text-[11px] text-fg-faint">
                  <span>词数：{words}</span>
                  <div className="flex gap-2">
                    <IeltsButton onClick={submit} disabled={submitting}>{submitting ? '反馈中…' : '提交并获取反馈'}</IeltsButton>
                  </div>
                </div>
              </div>
              {res ? <div className="mt-3"><FeedbackView res={res} /></div> : null}
            </IeltsCard>
            <KnowledgePanel stepId={selected} />
            <Attempts stepId={selected} progress={progress} />
          </>
        )}
      </div>
    </div>
  )
}

function knowledgeForStep(stepId) {
  const area = STEP_AREA[stepId]
  return WRITING_KNOWLEDGE.filter((c) => c.area === area).map((c) => `## ${c.title}\n${c.body}`).join('\n\n').slice(0, 6000)
}

function Attempts({ stepId, progress }) {
  const list = progress.attempts[stepId] || []
  if (!list.length) return null
  return (
    <IeltsCard>
      <div className="mb-2 text-sm font-bold text-fg">历史提交（{list.length}）</div>
      <ul className="space-y-1 text-xs text-fg-muted">
        {list.slice(0, 5).map((a, i) => (
          <li key={i}>{new Date(a.at).toLocaleString()} · {a.taskTitle}{a.simulated ? ' · 模拟反馈' : ''}</li>
        ))}
      </ul>
    </IeltsCard>
  )
}

function TranslationTrainer({ settings, onDone }) {
  const [challenge, setChallenge] = useState(null)
  const [answer, setAnswer] = useState('')
  const [fb, setFb] = useState(null)

  async function next() {
    const res = await runTemplate('translation-challenge', { level: settings.targetBand }, settings)
    if (res.data) setChallenge(res.data)
    setFb(null); setAnswer('')
  }
  async function check() {
    const res = await runTemplate('translation-feedback', {
      chinese: challenge.chinese, referenceEnglish: challenge.referenceEnglish, userTranslation: answer,
    }, settings)
    setFb(res)
    if (res.status === 'ok' || res.status === 'mock') {
      recordWritingAttempt('translation', { taskTitle: challenge.chinese, text: answer, feedback: res.data, simulated: res.simulated })
      onDone()
    }
  }

  return (
    <IeltsCard>
      <div className="mb-2 text-sm font-bold text-fg">中译英句型（随时可练）</div>
      {!challenge ? <EmptyState>点击开始：模型出中文句子，侧重从句、介词搭配与常用句型。无 key 时给原创模拟题。</EmptyState> : (
        <div className="space-y-2">
          <p className="text-base text-fg">{challenge.chinese}</p>
          <p className="text-xs text-fg-faint">训练点：{challenge.focus}</p>
          <textarea className={inputClass} rows={3} value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="把你的英文翻译写在这里…" />
        </div>
      )}
      <div className="mt-3 flex gap-2">
        <IeltsButton onClick={next}>{challenge ? '换一题' : '开始出题'}</IeltsButton>
        {challenge ? <IeltsButton variant="ghost" onClick={check} disabled={!answer.trim()}>针对性纠错</IeltsButton> : null}
      </div>
      {fb?.data ? (
        <div className="mt-3 space-y-2 text-xs">
          {fb.simulated ? <Badge tone="mock">模拟反馈</Badge> : null}
          <p className="text-fg-muted">更自然的说法：{fb.data.better}</p>
          {fb.data.issues?.length ? <ul className="list-disc pl-5 text-fg-muted">
            {fb.data.issues.map((it, i) => <li key={i}>{it.quote} → {it.suggestion}（{it.reason}）</li>)}
          </ul> : null}
        </div>
      ) : null}
    </IeltsCard>
  )
}
