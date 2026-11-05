// 阅读/听力复盘工作台：粘贴录入 → 自动拆题（可手改）→ 确定性判题
// → 逐题讲解（模型/模拟）→ 错因确认 → 小结 → 存入错题库。
import { useMemo, useState } from 'react'
import {
  parseNumberedEntries, parseAnswerBlock, QUESTION_TYPES, getReason,
} from '../core/index.js'
import { judgeReview, aggregateReasons, estimateBand, persistMistakes, persistSession } from '../storage/reviewSession.js'
import { useIeltsSettings } from '../hooks/useIeltsData.js'
import { IeltsCard, IeltsButton, Badge, Banner, Field, inputClass, EmptyState } from './ui.jsx'
import Timer from './Timer.jsx'
import QuestionExplain from './QuestionExplain.jsx'

const ERROR_LABEL = {
  EMPTY: '未作答', WORD_LIMIT: '超字数', PLURAL: '单复数', SPELLING: '拼写疑似错误',
  WRONG_LABEL_SET: '判断题标签用错', MISMATCH: '答案不一致',
}

const SAMPLE = {
  reading: {
    sourceLabel: '原创示例 · 城市蜜蜂（非真题）',
    passage: `Urban bees have become a common sight in recent years. In 2019, the city council planted wildflowers along twenty kilometres of main roads. The following summer, researchers counted three times as many bee species in those streets. Some critics argue that roadside flowers attract bees into heavy traffic, where many are killed by vehicles. However, a later study found that the insects prefer quieter side streets and only use the road corridors to travel between parks. Most of the plants chosen are native species, which require less water than imported garden flowers.`,
    questions: `1. When did the council plant wildflowers?
2. Bees using the road corridors are mostly killed by traffic.
3. Native plants need more water than imported flowers.
4. What did researchers count in the streets the following summer?`,
    keys: `1. 2019
2. FALSE
3. FALSE
4. bee species`,
    answers: `1. 2019
2. TRUE
3. NOT GIVEN
4. bees`,
    types: { 2: 'tfng', 3: 'tfng' },
  },
  listening: {
    sourceLabel: '原创示例 · 周末课程报名（非真题）',
    transcript: `W: Hi, I am calling about the weekend photography course, please.
M: Sure. The next one starts on the fifteenth — sorry, the sixteenth of November, because the tutor is away on Saturday.
W: The sixteenth then. And how much is it?
M: It is forty-five pounds for the day. Actually, that includes lunch and all materials, so you do not need to bring anything.
W: Great. Do I need to book in advance?
M: Yes, please call back before Friday to reserve a place, as groups are limited to twelve people.`,
    questions: `1. Which date does the photography course start?
2. What is the price of the course?
3. What is the maximum group size?
4. What must callers do before Friday?`,
    keys: `1. 16 November
2. 45 pounds
3. 12
4. reserve a place`,
    answers: `1. 15 November
2. 45
3. twenty
4. book in advance`,
    types: { 1: 'gap', 2: 'gap', 3: 'gap', 4: 'gap' },
  },
}

function TextArea({ label, value, onChange, rows = 5, placeholder, hint }) {
  return (
    <Field label={label} hint={hint}>
      <textarea className={inputClass} rows={rows} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
    </Field>
  )
}

export default function ReviewWorkbench({ module }) {
  const [settings] = useIeltsSettings()
  const sample = SAMPLE[module]
  const [sourceLabel, setSourceLabel] = useState('')
  const [sourceText, setSourceText] = useState('')
  const [questionsText, setQuestionsText] = useState('')
  const [keysText, setKeysText] = useState('')
  const [answersText, setAnswersText] = useState('')
  const [defaultType, setDefaultType] = useState(module === 'reading' ? 'gap' : 'gap')
  const [durationSec, setDurationSec] = useState('')
  const [saveFullText, setSaveFullText] = useState(false)
  const [hintTypes, setHintTypes] = useState({})
  const [items, setItems] = useState([])
  const [rows, setRows] = useState([])
  const [approved, setApproved] = useState(false)
  const [summary, setSummary] = useState(null)
  const [persisted, setPersisted] = useState(false)

  const sourceWord = module === 'reading' ? '原文' : '听力文稿'

  function loadSample() {
    setSourceLabel(sample.sourceLabel)
    setSourceText(sample.passage || sample.transcript)
    setQuestionsText(sample.questions)
    setKeysText(sample.keys)
    setAnswersText(sample.answers)
    setDefaultType('gap')
    setHintTypes(sample.types || {})
  }

  function parseBlocks() {
    const qEntries = parseNumberedEntries(questionsText)
    const keyMap = parseAnswerBlock(keysText)
    const userMap = parseAnswerBlock(answersText)
    const numbers = qEntries.length
      ? qEntries.map((e) => e.number)
      : [...new Set([...Object.keys(keyMap), ...Object.keys(userMap)].map(Number))].sort((a, b) => a - b)
    const qByNumber = new Map(qEntries.map((e) => [e.number, e.content]))
    const parsed = numbers.map((n) => ({
      qid: `q${n}`,
      number: n,
      question: qByNumber.get(n) || `第 ${n} 题`,
      questionType: hintTypes[n] || defaultType,
      instruction: (hintTypes[n] || defaultType) === 'gap' ? 'NO MORE THAN TWO WORDS AND/OR A NUMBER' : '',
      key: keyMap[n] || '',
      user: userMap[n] || '',
      reflection: '',
    }))
    setItems(parsed)
    setHintTypes({})
    setRows([])
    setSummary(null)
    setPersisted(false)
  }

  function updateItem(i, patch) {
    setItems((list) => list.map((it, idx) => (idx === i ? { ...it, ...patch } : it)))
  }

  function runJudging() {
    const judged = judgeReview(items).map((r) => ({ ...r }))
    setRows(judged)
    setSummary(null)
  }

  function setReason(i, reasonId, source) {
    setRows((list) => list.map((r, idx) => (idx === i ? { ...r, reasonId, reasonSource: reasonId ? source : 'model' } : r)))
  }

  const stats = useMemo(() => {
    if (!rows.length) return null
    const correct = rows.filter((r) => r.correct).length
    return { correct, total: rows.length, reasonStats: aggregateReasons(rows), estimate: estimateBand(module, correct, rows.length, true) }
  }, [rows, module])

  async function generateSummary() {
    const { runTemplate } = await import('../llm/runner.js')
    const questions = rows.filter((r) => !r.correct).map((r) => ({
      question: r.question, reasonId: r.reasonId, errors: r.errors,
    }))
    const res = await runTemplate('session-summary', {
      module,
      correctCount: stats.correct,
      totalCount: stats.total,
      reasonStats: stats.reasonStats,
      questions,
    }, settings)
    setSummary({ ...res.data, simulated: res.simulated, reasonText: res.reason })
  }

  function saveToMistakes() {
    const created = persistMistakes(module, rows, { sourceLabel })
    const id = `rs-${Date.now()}`
    persistSession({
      id, module, sourceLabel: sourceLabel || '未标注来源',
      durationSec: Number(durationSec) || null,
      createdAt: Date.now(),
      total: stats.total, correct: stats.correct,
      reasonStats: stats.reasonStats,
      passage: saveFullText ? sourceText : null,
      mistakeIds: created.map((m) => m.id),
    })
    setPersisted(true)
  }

  return (
    <div className="space-y-4">
      <IeltsCard>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div className="text-sm font-semibold text-fg">
            1. 粘贴材料{module === 'reading' ? '与计时做题' : ''}
          </div>
          <div className="flex gap-2">
            <IeltsButton variant="ghost" onClick={loadSample}>载入原创示例</IeltsButton>
          </div>
        </div>
        {module === 'reading' ? (
          <div className="mb-4">
            <Timer minutes={20} />
          </div>
        ) : null}
        <Banner tone="info">
          请只使用你自己有权使用的材料。{sourceWord}默认不长期保存，只保留复盘需要的定位句；示例素材均为原创，非真题。
        </Banner>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <Field label="来源标签（可选）">
            <input className={inputClass} value={sourceLabel} placeholder="如：剑 18 Test 2 Passage 3" onChange={(e) => setSourceLabel(e.target.value)} />
          </Field>
          <Field label={`实际用时（分钟，可选）`}>
            <input className={inputClass} type="number" min="0" value={durationSec} onChange={(e) => setDurationSec(e.target.value)} />
          </Field>
        </div>
        <div className="mt-3">
          <TextArea label={sourceWord} rows={7} value={sourceText} onChange={setSourceText} />
        </div>
        <label className="mt-2 flex items-center gap-2 text-xs text-fg-muted">
          <input type="checkbox" checked={saveFullText} onChange={(e) => setSaveFullText(e.target.checked)} />
          长期保存整篇{sourceWord}（默认关闭，可随时在错题库一键删除）
        </label>
      </IeltsCard>

      <IeltsCard>
        <div className="mb-3 text-sm font-semibold text-fg">2. 粘贴题目、答案册和你的答案（整段自动拆题）</div>
        <div className="mb-3 grid gap-3 md:grid-cols-3">
          <TextArea label="题目（可带题号）" rows={6} value={questionsText} onChange={setQuestionsText} placeholder="1. 题干…&#10;2. 题干…" />
          <TextArea label="答案册答案" rows={6} value={keysText} onChange={setKeysText} placeholder="1. B&#10;2. FALSE" />
          <TextArea label="我的答案" rows={6} value={answersText} onChange={setAnswersText} placeholder="1. C&#10;2. TRUE" />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Field label="本组题型（拆题后可逐题改）">
            <select className={`${inputClass} w-64`} value={defaultType} onChange={(e) => setDefaultType(e.target.value)}>
              {QUESTION_TYPES.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
            </select>
          </Field>
          <IeltsButton onClick={parseBlocks} disabled={!keysText.trim() && !questionsText.trim()}>自动拆题</IeltsButton>
        </div>
      </IeltsCard>

      {items.length > 0 ? (
        <IeltsCard>
          <div className="mb-3 flex items-center justify-between">
            <div className="text-sm font-semibold text-fg">3. 核对拆题结果（可直接修改）</div>
            <IeltsButton onClick={runJudging}>开始确定性判题</IeltsButton>
          </div>
          <div className="space-y-3">
            {items.map((it, i) => (
              <div key={it.qid} className="rounded-lg border border-border-soft p-3">
                <div className="grid gap-2 md:grid-cols-[60px_1fr_180px]">
                  <span className="text-sm font-bold text-fg">#{it.number}</span>
                  <input className={inputClass} value={it.question} onChange={(e) => updateItem(i, { question: e.target.value })} aria-label={`第 ${it.number} 题题干`} />
                  <select className={inputClass} value={it.questionType} onChange={(e) => updateItem(i, {
                    questionType: e.target.value,
                    instruction: e.target.value === 'gap' ? 'NO MORE THAN TWO WORDS AND/OR A NUMBER' : '',
                  })} aria-label={`第 ${it.number} 题题型`}>
                    {QUESTION_TYPES.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
                  </select>
                </div>
                <div className="mt-2 grid gap-2 md:grid-cols-2">
                  <input className={inputClass} value={it.key} onChange={(e) => updateItem(i, { key: e.target.value })} aria-label={`第 ${it.number} 题答案册`} placeholder="答案册" />
                  <input className={inputClass} value={it.user} onChange={(e) => updateItem(i, { user: e.target.value })} aria-label={`第 ${it.number} 题我的答案`} placeholder="我的答案" />
                </div>
                {it.questionType === 'gap' ? (
                  <input className={`${inputClass} mt-2`} value={it.instruction} onChange={(e) => updateItem(i, { instruction: e.target.value })} aria-label={`第 ${it.number} 题字数要求`} />
                ) : null}
              </div>
            ))}
          </div>
        </IeltsCard>
      ) : null}

      {rows.length && stats ? (
        <IeltsCard>
          <div className="mb-3 text-sm font-semibold text-fg">4. 判题结果与逐题讲解</div>
          <div className="mb-4 flex flex-wrap items-center gap-3 text-sm">
            <span className="font-bold text-fg">答对 {stats.correct} / {stats.total}</span>
            <span className="text-fg-faint">·</span>
            <span className="text-xs text-fg-muted">{stats.estimate.label}：raw ≈ {stats.estimate.raw} → band {stats.estimate.band}</span>
          </div>
          <div className="space-y-3">
            {rows.map((r, i) => (
              <RowCard key={r.qid} module={module} row={r} sourceText={sourceText} sourceLabel={sourceLabel}
                settings={settings} approved={approved} onApprove={() => setApproved(true)}
                onReason={(id, src) => setReason(i, id, src)}
                onReflection={(text) => setRows((list) => list.map((x, idx) => (idx === i ? { ...x, reflection: text } : x)))} />
            ))}
          </div>

          <div className="mt-5 rounded-xl border border-border-strong p-4">
            <div className="mb-2 text-sm font-semibold text-fg">5. 本篇/本 Part 小结</div>
            <ReasonStats stats={stats.reasonStats} wrongCount={stats.total - stats.correct} />
            <div className="mt-3 flex flex-wrap gap-2">
              <IeltsButton onClick={generateSummary}>{summary ? '重新生成小结' : '生成本篇小结'}</IeltsButton>
              <IeltsButton variant="ghost" onClick={saveToMistakes}>把错题存入错题库</IeltsButton>
              {persisted ? <Badge tone="rule">已存入错题库</Badge> : null}
            </div>
            {summary ? (
              <div className="mt-3 space-y-2 text-sm">
                {summary.simulated ? <Badge tone="mock">模拟反馈 · 非真实讲解</Badge> : null}
                {summary.reasonText && !summary.problems ? <Banner tone="danger">小结生成失败：{summary.reasonText}</Banner> : null}
                {Array.isArray(summary.problems) ? (
                  <ul className="list-disc space-y-1 pl-5 text-fg-muted">
                    {summary.problems.map((p, i) => <li key={i}><b className="text-fg">{getReason(p.reasonId)?.label || p.reasonId}：</b>{p.detail}</li>)}
                  </ul>
                ) : null}
                {Array.isArray(summary.nextTips) ? (
                  <ul className="list-disc space-y-1 pl-5 text-fg-muted">
                    {summary.nextTips.map((t, i) => <li key={i}>{t}</li>)}
                  </ul>
                ) : null}
              </div>
            ) : <EmptyState>判题完成后可生成本篇小结</EmptyState>}
          </div>
        </IeltsCard>
      ) : null}
    </div>
  )
}

function ReasonStats({ stats, wrongCount }) {
  const entries = Object.entries(stats)
  if (!wrongCount) return <p className="text-xs text-fg-faint">本篇没有错题。</p>
  const unclassified = wrongCount - entries.reduce((sum, [, count]) => sum + count, 0)
  return (
    <div className="flex flex-wrap gap-2">
      {unclassified > 0 && <Badge tone="rule">待归因：{unclassified}</Badge>}
      {entries.map(([id, n]) => {
        const reason = getReason(id)
        return <Badge key={id} tone={reason?.source === 'rule' ? 'rule' : 'model'}>{reason?.label || id} × {n}</Badge>
      })}
    </div>
  )
}

function RowCard({ module, row, sourceText, sourceLabel, settings, approved, onApprove, onReason, onReflection }) {
  const [open, setOpen] = useState(!row.correct)
  return (
    <div className={`rounded-lg border p-3 ${row.correct ? 'border-success/40 bg-success/5' : 'border-danger/40 bg-danger/5'}`}>
      <div className="flex flex-wrap items-start gap-2">
        <span className={`mt-0.5 rounded px-1.5 py-0.5 text-[11px] font-bold ${row.correct ? 'bg-success/20 text-success' : 'bg-danger/20 text-danger'}`}>
          {row.correct ? '正确' : '错误'}
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-medium text-fg">{row.question}</div>
          <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-fg-muted">
            <span>答案册：<b className="text-fg">{row.key || '（未填）'}</b></span>
            <span>你的答案：<b className="text-fg">{row.user || '（未作答）'}</b></span>
            {!row.correct && row.errors[0] ? <Badge tone="rule">{ERROR_LABEL[row.errors[0]] || row.errors[0]}</Badge> : null}
          </div>
        </div>
        <button type="button" className="text-xs text-accent underline" onClick={() => setOpen((o) => !o)}>
          {open ? '收起' : (row.correct ? '查看讲解' : '展开讲解')}
        </button>
      </div>
      {open ? (
        <div>
          {module === 'listening' && !row.correct ? (
            <div className="mt-2">
              <label className="mb-1 block text-[11px] font-semibold text-fg-muted">我的反思（可语音转文字，支持中文）</label>
              <textarea className={inputClass} rows={2} value={row.reflection || ''} placeholder="如：听成了 fifteen / 没反应过来他改口了 / 这个词不认识"
                onChange={(e) => onReflection(e.target.value)} />
            </div>
          ) : null}
          <QuestionExplain module={module} row={{ ...row, onReason }} sourceText={sourceText} sourceLabel={sourceLabel}
            settings={settings} approved={approved} onApprove={onApprove} />
        </div>
      ) : null}
    </div>
  )
}
