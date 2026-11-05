// 单题讲解：发送前预览 → runTemplate → 证据校验状态 → 错因修改 → 单题追问。
import { useState } from 'react'
import { runTemplate, buildMessages } from '../llm/runner.js'
import { getTemplate } from '../llm/templates.js'
import { reasonsForModule } from '../core/index.js'
import { addParaphrase } from '../storage/ieltsStore.js'
import { Badge, Banner, IeltsButton } from './ui.jsx'

const TEMPLATE_BY_MODULE = { reading: 'reading-explain', listening: 'listening-explain' }

function SendPreview({ template, variables, onCancel, onConfirm }) {
  const messages = buildMessages(template, variables)
  const chars = messages.reduce((a, m) => a + m.content.length, 0)
  return (
    <div className="mt-3 rounded-lg border border-warning/50 bg-warning/5 p-3">
      <div className="mb-2 text-xs font-semibold text-warning">
        将发送 {chars} 字符到模型服务商（原文/文稿、题目、答案册与你的答案）
      </div>
      <details className="mb-2 text-[11px] text-fg-muted">
        <summary className="cursor-pointer">查看将发送的完整内容</summary>
        {messages.map((m, i) => (
          <pre key={i} className="mt-2 max-h-48 overflow-auto whitespace-pre-wrap rounded bg-bg p-2 font-sans">
            <b>[{m.role}]</b>{'\n'}{m.content}
          </pre>
        ))}
      </details>
      <div className="flex gap-2">
        <IeltsButton onClick={onConfirm}>确认发送并生成讲解</IeltsButton>
        <IeltsButton variant="ghost" onClick={onCancel}>取消</IeltsButton>
      </div>
    </div>
  )
}

export default function QuestionExplain({ module, row, sourceText, sourceLabel, settings, approved, onApprove }) {
  const [state, setState] = useState({ status: 'idle' })
  const [asking, setAsking] = useState(false)
  const [followQ, setFollowQ] = useState('')
  const [followups, setFollowups] = useState([])
  const [preview, setPreview] = useState(false)
  const [savedPhrase, setSavedPhrase] = useState(false)

  const reasons = reasonsForModule(module)
  const hasKey = Boolean(settings.apiKey)
  const templateId = TEMPLATE_BY_MODULE[module]
  const template = getTemplate(templateId)

  const variables = {
    passage: sourceText,
    transcript: sourceText,
    question: row.question,
    questionType: row.questionType,
    keyAnswer: row.key,
    userAnswer: row.user,
    judge: { correct: row.correct, errors: row.errors },
    reflection: row.reflection || '',
    sourceLabel,
  }

  async function generate() {
    setState({ status: 'loading' })
    const res = await runTemplate(templateId, variables, settings)
    setState({
      status: res.status,
      data: res.data,
      evidenceOk: res.evidenceOk,
      simulated: res.simulated,
      reasonText: res.reason,
    })
    if (res.data?.suggestedReasonId && !row.reasonId) {
      row.onReason?.(res.data.suggestedReasonId, 'model')
    }
  }

  function askOrGenerate() {
    if (!hasKey || approved) { generate(); return }
    setPreview(true)
  }

  async function sendFollowup() {
    const q = followQ.trim()
    if (!q) return
    setFollowQ('')
    setFollowups((f) => [...f, { q, loading: true }])
    const res = await runTemplate('reading-followup', {
      passage: sourceText,
      transcript: sourceText,
      question: row.question,
      keyAnswer: row.key,
      userQuestion: q,
    }, settings)
    setFollowups((f) => f.map((x, i) => (i === f.length - 1
      ? { q, a: res.data?.answer || res.reason || '生成失败，请重试', simulated: res.simulated, loading: false }
      : x)))
  }

  const data = state.data

  return (
    <div className="mt-2 border-t border-border-soft pt-3">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <select
          aria-label="错因归类"
          className="rounded-md border border-border-strong bg-bg px-2 py-1 text-xs text-fg"
          value={row.reasonId}
          onChange={(e) => row.onReason?.(e.target.value, 'manual')}
        >
          <option value="">选择错因…</option>
          {reasons.map((r) => (
            <option key={r.id} value={r.id}>
              {r.label}{r.source === 'rule' ? '（规则可判定）' : ''}{r.inferred ? '（推断）' : ''}
            </option>
          ))}
        </select>
        <Badge tone={row.reasonSource === 'rule' ? 'rule' : 'model'}>
          {row.reasonSource === 'rule' ? '规则判定' : '模型建议（可改）'}
        </Badge>
        {state.simulated ? <Badge tone="mock">模拟反馈 · 非真实讲解</Badge> : null}
        {!hasKey ? <span className="text-[11px] text-fg-faint">未配置 key，当前为模拟反馈</span> : null}
      </div>

      {state.status === 'idle' ? (
        <IeltsButton onClick={askOrGenerate}>{row.correct ? '查看本题讲解' : '生成讲解'}</IeltsButton>
      ) : null}

      {preview ? (
        <SendPreview
          template={template}
          variables={variables}
          onCancel={() => setPreview(false)}
          onConfirm={() => { setPreview(false); onApprove(); generate() }}
        />
      ) : null}

      {state.status === 'loading' ? <p className="text-xs text-fg-faint">讲解生成中…</p> : null}
      {['invalid-output', 'http-error', 'missing-vars'].includes(state.status) ? (
        <Banner tone="danger" className="mt-2">
          讲解失败：{state.reasonText}
          <button type="button" className="ml-2 underline" onClick={generate}>重试</button>
        </Banner>
      ) : null}

      {data ? (
        <div className="space-y-2 text-[13px]">
          {!state.evidenceOk ? (
            <Banner tone="danger">
              讲解不可靠：定位句没有通过逐字校验（不是原文连续子串）。
              <button type="button" className="ml-2 underline" onClick={generate}>重试</button>
            </Banner>
          ) : null}
          {data.locationQuote ? (
            <div className="rounded-lg border border-success/40 bg-success/5 p-2">
              <div className="mb-1 text-[11px] font-semibold text-success">定位句（逐字来自原文）</div>
              <p className="leading-relaxed text-fg">{data.locationQuote}</p>
            </div>
          ) : (
            <Banner tone="warn">模型没有在原文中找到可靠定位句，此处不作为可靠结论展示。</Banner>
          )}
          {Array.isArray(data.paraphrases) && data.paraphrases.length > 0 ? (
            <div>
              <div className="mb-1 text-[11px] font-semibold text-fg-muted">同义替换对照</div>
              <ul className="space-y-1">
                {data.paraphrases.map((p, i) => (
                  <li key={i} className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="rounded bg-surface px-1.5 py-0.5">{p.questionPhrase}</span>
                    <span aria-hidden>↔</span>
                    <span className="rounded bg-surface px-1.5 py-0.5">{p.passagePhrase}</span>
                    <button
                      type="button"
                      className="text-accent underline"
                      onClick={() => { addParaphrase({ module, sourceLabel, questionPhrase: p.questionPhrase, passagePhrase: p.passagePhrase }); setSavedPhrase(true) }}
                    >{savedPhrase ? '已收入替换库' : '收入我的替换库'}</button>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {data.whyKeyCorrect ? <p><b className="text-fg">为什么答案册对：</b><span className="text-fg-muted">{data.whyKeyCorrect}</span></p> : null}
          {data.whyUserWrong ? <p><b className="text-fg">为什么你错了：</b><span className="text-fg-muted">{data.whyUserWrong}</span></p> : null}
          {data.tfngNote ? <Banner tone="info">{data.tfngNote}</Banner> : null}
          {data.signalWords?.length ? <p className="text-xs text-fg-muted"><b>信号词：</b>{data.signalWords.join('、')}</p> : null}
          {data.correction ? <p className="text-xs text-fg-muted">{data.correction}</p> : null}
          {data.advice ? <p className="text-xs text-fg-muted"><b>建议：</b>{data.advice}</p> : null}
          {data.suggestedReasonId && !row.reasonId ? (
            <button type="button" className="text-xs text-accent underline" onClick={() => row.onReason?.(data.suggestedReasonId, 'model')}>
              采用建议错因：{reasons.find((r) => r.id === data.suggestedReasonId)?.label}
            </button>
          ) : null}
        </div>
      ) : null}

      <div className="mt-3">
        <button type="button" className="text-xs text-accent underline" onClick={() => setAsking((a) => !a)}>
          {asking ? '收起追问' : '就这道题继续追问'}
        </button>
        {asking ? (
          <div className="mt-2 flex gap-2">
            <input
              className="min-w-0 flex-1 rounded-md border border-border-strong bg-bg px-2 py-1 text-xs text-fg"
              placeholder="例如：干扰项 C 为什么不对？"
              value={followQ}
              onChange={(e) => setFollowQ(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') sendFollowup() }}
            />
            <IeltsButton onClick={sendFollowup}>追问</IeltsButton>
          </div>
        ) : null}
        {followups.map((f, i) => (
          <div key={i} className="mt-2 rounded-lg bg-surface p-2 text-xs">
            <div className="font-semibold text-fg">Q：{f.q}</div>
            <div className="mt-1 text-fg-muted">
              {f.loading ? '…' : f.a}
              {f.simulated ? <Badge tone="mock">模拟</Badge> : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
