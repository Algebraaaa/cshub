import { useState } from 'react'
import { runTemplate } from '../llm/runner.js'
import { SPEAKING_TOPICS } from '../data/speakingTopics.js'
import {
  getCustomSpeakingTopics, saveCustomSpeakingTopics, addSpeakingHistory,
} from '../storage/ieltsStore.js'
import { useIeltsSettings } from '../hooks/useIeltsData.js'
import { IeltsCard, IeltsButton, Badge, Banner, EmptyState, inputClass } from './ui.jsx'
import Timer from './Timer.jsx'

const speechOk = typeof window !== 'undefined' && 'speechSynthesis' in window && typeof SpeechSynthesisUtterance !== 'undefined'

// 浏览器自带朗读；第三方 TTS（用户自带 key）预留在此：接入时把 speak 换成
// 对 /api/ielts/tts 或服务商 audio 接口的调用即可，UI 无需改动。
function speak(text) {
  if (!speechOk || !text) return
  const u = new SpeechSynthesisUtterance(text)
  u.lang = 'en-GB'
  u.rate = 0.95
  window.speechSynthesis.cancel()
  window.speechSynthesis.speak(u)
}

function parseTopicImport(text) {
  const cleaned = String(text || '').trim()
  if (!cleaned) return []
  try {
    const json = JSON.parse(cleaned)
    const arr = Array.isArray(json) ? json : (json.topics || [])
    return arr.map((t, i) => ({
      id: `custom-${Date.now()}-${i}`,
      topic: t.topic || t.title || '',
      part1Question: t.part1 || t.part1Question || '',
      part2Cue: { question: t.part2 || t.part2Question || '', bullets: t.bullets || t.cuePoints || [] },
      part3Questions: t.part3 || t.part3Questions || [],
      builtin: false,
    })).filter((t) => t.topic)
  } catch {
    // 纯文本：每个非空行作为一个话题名
    return cleaned.split(/\r?\n/).map((line, i) => ({
      id: `custom-${Date.now()}-${i}`,
      topic: line.replace(/^[-*\d.\s]+/, '').trim(),
      part1Question: '', part2Cue: { question: '', bullets: [] }, part3Questions: [], builtin: false,
    })).filter((t) => t.topic)
  }
}

export default function SpeakingTrainer() {
  const [settings] = useIeltsSettings()
  const [, setVersion] = useState(0)
  const custom = getCustomSpeakingTopics()
  const topics = [...SPEAKING_TOPICS, ...custom]
  const [topicId, setTopicId] = useState(SPEAKING_TOPICS[0].id)
  const [part, setPart] = useState(1)
  const topic = topics.find((t) => t.id === topicId) || topics[0]
  const [answer, setAnswer] = useState('')
  const [res, setRes] = useState(null)
  const [loading, setLoading] = useState(false)
  const [importOpen, setImportOpen] = useState(false)
  const [importText, setImportText] = useState('')

  function currentQuestion() {
    if (part === 1) return topic.part1Question || `Do you like ${topic.topic}?`
    if (part === 2) return topic.part2Cue?.question || `Describe something about ${topic.topic}.`
    return topic.part3Questions?.[0] || `How is ${topic.topic} changing in modern life?`
  }

  async function generateQuestion() {
    const r = await runTemplate('speaking-prompt', {
      part: String(part),
      topic: topic.topic,
      part2Topic: topic.topic,
    }, settings)
    if (r.data) setGenerated(r.data)
  }
  const [generated, setGenerated] = useState(null)

  async function getFeedback() {
    if (!answer.trim()) return
    setLoading(true)
    const r = await runTemplate('speaking-feedback', {
      part: String(part), question: currentQuestion(), answer,
    }, settings)
    setRes(r)
    if (r.status === 'ok' || r.status === 'mock') {
      addSpeakingHistory({ topic: topic.topic, part, question: currentQuestion(), answer, feedback: r.data })
    }
    setLoading(false)
  }

  function doImport() {
    const parsed = parseTopicImport(importText)
    if (!parsed.length) return
    saveCustomSpeakingTopics([...getCustomSpeakingTopics(), ...parsed])
    setImportText(''); setImportOpen(false); setVersion((v) => v + 1)
  }

  const d = res?.data
  const shownQuestion = generated?.question || currentQuestion()

  return (
    <div className="grid gap-4 lg:grid-cols-[260px_1fr]">
      <IeltsCard className="h-fit">
        <div className="mb-2 flex items-center justify-between">
          <div className="text-sm font-bold text-fg">话题</div>
          <IeltsButton variant="ghost" className="px-2 py-1 text-xs" onClick={() => setImportOpen((o) => !o)}>导入本季清单</IeltsButton>
        </div>
        {importOpen ? (
          <div className="mb-2 space-y-2">
            <textarea className={`${inputClass} text-xs`} rows={4} placeholder="纯文本每行一个话题，或 JSON：{topic, part1, part2, bullets:[], part3:[]}"
              value={importText} onChange={(e) => setImportText(e.target.value)} />
            <IeltsButton className="text-xs" onClick={doImport}>导入</IeltsButton>
          </div>
        ) : null}
        <div className="max-h-96 space-y-1 overflow-auto">
          {topics.map((t) => (
            <button key={t.id} type="button" onClick={() => { setTopicId(t.id); setGenerated(null); setRes(null) }}
              className={`w-full rounded-lg px-2 py-1.5 text-left text-xs ${t.id === topicId ? 'bg-accent-soft text-accent border border-accent-border' : 'text-fg-muted'}`}>
              {t.topic}{!t.builtin ? <Badge tone="muted">我的</Badge> : null}
            </button>
          ))}
        </div>
      </IeltsCard>

      <div className="space-y-4">
        <IeltsCard>
          <div className="mb-3 flex flex-wrap gap-2">
            {[1, 2, 3].map((p) => (
              <button key={p} type="button" onClick={() => { setPart(p); setGenerated(null); setRes(null) }}
                className={`rounded-full px-4 py-1.5 text-sm font-semibold ${part === p ? 'bg-accent text-white' : 'bg-surface text-fg-muted'}`}>
                Part {p}
              </button>
            ))}
          </div>
          {part === 3 ? <Banner tone="info">Part 3 追问承接 Part 2 话题“{topic.topic}”，往抽象与社会层面展开。</Banner> : null}
          <div className="mt-3 rounded-xl border border-border-strong p-4">
            <div className="flex items-start justify-between gap-3">
              <p className="text-base font-semibold text-fg">{shownQuestion}</p>
              {speechOk ? (
                <IeltsButton variant="ghost" onClick={() => speak(shownQuestion)}>🔊 朗读考官问题</IeltsButton>
              ) : null}
            </div>
            {part === 2 ? (
              <div className="mt-2">
                <ul className="ml-5 list-disc text-sm text-fg-muted">
                  {(generated?.cueCard?.length ? generated.cueCard : topic.part2Cue?.bullets || []).map((b, i) => <li key={i}>{b}</li>)}
                </ul>
                <div className="mt-3 flex flex-wrap gap-3">
                  <div className="text-xs text-fg-faint">准备</div><Timer minutes={1} />
                  <div className="text-xs text-fg-faint">作答</div><Timer minutes={2} />
                </div>
              </div>
            ) : null}
            {part === 3 && topic.part3Questions?.length && !generated ? (
              <div className="mt-2 space-y-1 text-xs text-fg-muted">
                {topic.part3Questions.map((q, i) => <p key={i}>· {q}</p>)}
              </div>
            ) : null}
            <button type="button" className="mt-2 text-xs text-accent underline" onClick={generateQuestion}>
              {generated ? '换一个模型出题' : '让模型按此话题出题'}
            </button>
          </div>

          <div className="mt-4">
            <label className="mb-1 block text-xs font-semibold text-fg-muted">你的作答（输入法语音转文字或直接打字）</label>
            <textarea className={inputClass} rows={7} value={answer} onChange={(e) => setAnswer(e.target.value)}
              placeholder="像聊天一样自然回答，先追求流利和直接回应问题…" />
            <div className="mt-2 flex items-center gap-2">
              <IeltsButton onClick={getFeedback} disabled={loading}>{loading ? '反馈中…' : '获取反馈'}</IeltsButton>
              {res?.simulated ? <Badge tone="mock">模拟反馈 · 非真实模型反馈</Badge> : null}
            </div>
          </div>
        </IeltsCard>

        {res && (res.status !== 'ok' && res.status !== 'mock') ? (
          <Banner tone="danger">反馈失败：{res.reason}</Banner>
        ) : null}
        {d ? (
          <IeltsCard>
            <div className="space-y-3 text-sm">
              <section>
                <div className="mb-1 text-xs font-bold text-fg">你想说的意思，母语者常这么说：</div>
                <ul className="space-y-1">
                  {d.chunks?.map((c, i) => (
                    <li key={i} className="rounded-lg bg-surface px-2 py-1 text-xs">
                      <b className="text-fg">{c.native}</b> <span className="text-fg-muted">— {c.meaning}</span>
                    </li>
                  ))}
                </ul>
              </section>
              <section>
                <div className="mb-1 text-xs font-bold text-fg">自然示范（一两句，不是范文背诵）：</div>
                <ul className="list-disc space-y-1 pl-5 text-fg-muted">
                  {d.modelLines?.map((l, i) => <li key={i}>{l}</li>)}
                </ul>
              </section>
              {d.grammarFixes?.length ? (
                <section>
                  <div className="mb-1 text-xs font-bold text-fg">语法（只改影响理解的，最多 2 处）：</div>
                  <ul className="space-y-1 text-xs text-fg-muted">
                    {d.grammarFixes.map((g, i) => <li key={i}>{g.quote} → {g.fix}（{g.reason}）</li>)}
                  </ul>
                </section>
              ) : null}
              <section>
                <div className="mb-1 text-xs font-bold text-fg">交流感：</div>
                <p className="text-xs text-fg-muted">{d.interaction}</p>
              </section>
              <section className="rounded-lg border border-accent-border p-2 text-xs">
                <div className="mb-1 font-bold text-fg">文字估算（非官方成绩）：</div>
                <div className="grid gap-1 sm:grid-cols-3">
                  <span>流利与连贯：{d.estimates?.fc || '—'}</span>
                  <span>词汇：{d.estimates?.lr || '—'}</span>
                  <span>语法：{d.estimates?.gra || '—'}</span>
                </div>
                <p className="mt-1 text-fg-faint">发音、连读、语调：仅凭文字无法评估，不给分数。</p>
              </section>
            </div>
          </IeltsCard>
        ) : <EmptyState>作答后获取反馈：词块、自然示范、关键语法与三项文字估算。</EmptyState>}
      </div>
    </div>
  )
}
