import { useState } from 'react'
import { VOCAB, VOCAB_CATEGORIES } from '../data/vocabulary.js'
import {
  getCustomVocab, saveCustomVocab, getVocabFavorites, saveVocabFavorites,
  getParaphrases, deleteParaphrase,
} from '../storage/ieltsStore.js'
import { IeltsCard, IeltsButton, Badge, EmptyState, inputClass } from './ui.jsx'
import { ensureMany, ensureItem, removeItem, itemKey, getSrMap } from '../storage/spacedRepetition.js'
import GradeButtons, { dueLabel, srItem } from './ReviewGrade.jsx'

function parseVocabImport(text, category) {
  const raw = String(text || '').trim()
  if (!raw) return []
  try {
    const json = JSON.parse(raw)
    const arr = Array.isArray(json) ? json : (json.entries || [])
    return arr.filter((e) => e.en).map((e) => ({
      id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      category: e.category || category || 'custom',
      en: e.en, zh: e.zh || '', example: e.example || '', collocation: e.collocation || '', builtin: false,
    }))
  } catch {
    // Markdown/文本：每个条目一段，形如 "take into account | 考虑到 | 例句 | 搭配"
    return raw.split(/\r?\n/).map((line) => {
      const parts = line.split('|').map((s) => s.trim())
      if (!parts[0] || !parts[0].includes(' ')) return null
      return {
        id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        category, en: parts[0], zh: parts[1] || '', example: parts[2] || '',
        collocation: parts[3] || '', builtin: false,
      }
    }).filter(Boolean)
  }
}

export default function VocabLibrary() {
  const [cat, setCat] = useState('task1')
  const [query, setQuery] = useState('')
  const [, setVersion] = useState(0)
  const [importOpen, setImportOpen] = useState(false)
  const [importText, setImportText] = useState('')
  const [form, setForm] = useState({ en: '', zh: '', example: '', collocation: '' })

  const custom = getCustomVocab()
  const favSet = getVocabFavorites()
  const paraphrases = getParaphrases()
  // 收藏/入库即进入间隔复习；幂等，已排期的不覆盖
  ensureMany('para', paraphrases.map((p2) => p2.id))
  ensureMany('vocab', [...favSet])
  const srMap = getSrMap()

  function bump() { setVersion((v) => v + 1) }
  function toggleFav(id) {
    const next = new Set(favSet)
    if (next.has(id)) { next.delete(id); removeItem('vocab', id) } else { next.add(id); ensureItem('vocab', id) }
    saveVocabFavorites(next)
    bump()
  }
  function addCustom() {
    if (!form.en.trim()) return
    saveCustomVocab([...getCustomVocab(), {
      id: `custom-${Date.now()}`, category: 'custom', builtin: false, ...form,
    }])
    setForm({ en: '', zh: '', example: '', collocation: '' })
    bump()
  }
  function doImport() {
    const parsed = parseVocabImport(importText, cat === 'favorites' ? 'custom' : cat)
    if (parsed.length) saveCustomVocab([...getCustomVocab(), ...parsed])
    setImportText(''); setImportOpen(false); bump()
  }

  if (cat === 'paraphrases') {
    return (
      <div className="space-y-3">
        <CategoryBar value={cat} onChange={setCat} onImport={() => setImportOpen((o) => !o)} />
        <IeltsCard>
          <div className="mb-2 text-sm font-bold text-fg">我的替换库（{paraphrases.length}）</div>
          {paraphrases.length === 0 ? <EmptyState>在阅读/听力复盘里点“收入我的替换库”，同义替换会汇总到这里。</EmptyState> : (
            <ul className="space-y-2">
              {paraphrases.map((p) => (
                <li key={p.id} className="flex flex-wrap items-center gap-2 rounded-lg border border-border-soft p-2 text-sm">
                  <Badge tone="muted">{p.module === 'listening' ? '听力' : '阅读'}</Badge>
                  <span className="rounded bg-surface px-1.5 py-0.5">{p.questionPhrase}</span>
                  <span aria-hidden>↔</span>
                  <span className="rounded bg-surface px-1.5 py-0.5">{p.passagePhrase}</span>
                  {p.sourceLabel ? <span className="text-[11px] text-fg-faint">{p.sourceLabel}</span> : null}
                  <button type="button" className="ml-auto text-xs text-danger underline" onClick={() => { deleteParaphrase(p.id); removeItem('para', p.id); bump() }}>删除</button>
                  {(srItem('para', p.id)?.dueAt <= Date.now()) ? (
                    <div className="w-full">
                      <span className="text-[11px] text-warning">{dueLabel(srItem('para', p.id))}</span>
                      <GradeButtons kind="para" refId={p.id} onGraded={bump} />
                    </div>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </IeltsCard>
      </div>
    )
  }

  let entries = [...VOCAB, ...custom]
  if (cat === 'favorites') entries = entries.filter((e) => favSet.has(e.id))
  else if (cat !== 'all') entries = entries.filter((e) => e.category === cat)
  const q = query.trim().toLowerCase()
  if (q) {
    entries = entries.filter((e) => [e.en, e.zh, e.example, e.collocation].join(' ').toLowerCase().includes(q))
  }

  return (
    <div className="space-y-3">
      <CategoryBar value={cat} onChange={setCat} onImport={() => setImportOpen((o) => !o)} />
      {importOpen ? (
        <IeltsCard>
          <div className="mb-2 text-sm font-bold text-fg">导入（JSON，或每行 `英文 | 中文 | 例句 | 搭配`）</div>
          <textarea className={inputClass} rows={5} value={importText} onChange={(e) => setImportText(e.target.value)} />
          <div className="mt-2"><IeltsButton onClick={doImport}>导入到当前分类</IeltsButton></div>
        </IeltsCard>
      ) : null}
      <IeltsCard>
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <input className={`${inputClass} max-w-xs`} placeholder="搜索英文/中文/例句…" value={query} onChange={(e) => setQuery(e.target.value)} />
          <span className="text-xs text-fg-faint">{entries.length} 条</span>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          {entries.map((e) => (
            <div key={e.id} className="rounded-lg border border-border-soft p-3 text-sm">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-bold text-fg">{e.en} {e.builtin ? null : <Badge tone="model">我的</Badge>}</div>
                  <div className="text-xs text-fg-muted">{e.zh}</div>
                </div>
                <button type="button" aria-label="收藏" onClick={() => toggleFav(e.id)} className="text-lg leading-none">
                  {favSet.has(e.id) ? '★' : '☆'}
                </button>
                {cat === 'favorites' && srMap[itemKey('vocab', e.id)]?.dueAt <= Date.now() ? (
                  <div className="w-full">
                    <span className="text-[11px] text-warning">{dueLabel(srMap[itemKey('vocab', e.id)])}</span>
                    <GradeButtons kind="vocab" refId={e.id} onGraded={bump} />
                  </div>
                ) : null}
              </div>
              {e.example ? <p className="mt-1 text-xs italic text-fg-muted">{e.example}</p> : null}
              {e.collocation ? <p className="mt-0.5 text-[11px] text-fg-faint">搭配：{e.collocation}</p> : null}
            </div>
          ))}
        </div>
        {entries.length === 0 ? <EmptyState>没有匹配条目。</EmptyState> : null}
      </IeltsCard>

      <IeltsCard>
        <div className="mb-2 text-sm font-bold text-fg">添加自定义条目</div>
        <div className="grid gap-2 sm:grid-cols-2">
          <input className={inputClass} placeholder="英文词块" value={form.en} onChange={(e) => setForm({ ...form, en: e.target.value })} />
          <input className={inputClass} placeholder="中文释义" value={form.zh} onChange={(e) => setForm({ ...form, zh: e.target.value })} />
          <input className={inputClass} placeholder="原创例句" value={form.example} onChange={(e) => setForm({ ...form, example: e.target.value })} />
          <input className={inputClass} placeholder="搭配说明" value={form.collocation} onChange={(e) => setForm({ ...form, collocation: e.target.value })} />
        </div>
        <div className="mt-2"><IeltsButton onClick={addCustom}>添加</IeltsButton></div>
      </IeltsCard>
    </div>
  )
}

function CategoryBar({ value, onChange, onImport }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {VOCAB_CATEGORIES.map((c) => (
        <button key={c.id} type="button" onClick={() => onChange(c.id)}
          className={`rounded-full px-3 py-1.5 text-xs font-semibold ${value === c.id ? 'bg-accent text-white' : 'bg-surface text-fg-muted'}`}>
          {c.label}
        </button>
      ))}
      <button type="button" onClick={() => onChange('favorites')}
        className={`rounded-full px-3 py-1.5 text-xs font-semibold ${value === 'favorites' ? 'bg-accent text-white' : 'bg-surface text-fg-muted'}`}>
        ★ 收藏
      </button>
      <button type="button" onClick={() => onChange('paraphrases')}
        className={`rounded-full px-3 py-1.5 text-xs font-semibold ${value === 'paraphrases' ? 'bg-accent text-white' : 'bg-surface text-fg-muted'}`}>
        我的替换库
      </button>
      <IeltsButton variant="ghost" className="ml-auto text-xs" onClick={onImport}>导入</IeltsButton>
    </div>
  )
}
