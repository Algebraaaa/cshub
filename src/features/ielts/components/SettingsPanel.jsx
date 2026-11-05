import { useRef, useState } from 'react'
import {
  DEFAULT_SETTINGS, PROVIDER_PRESETS, getSettings, saveSettings,
  exportIeltsData, importIeltsData, clearIeltsData,
  getKnowledgeNotes, saveKnowledgeNotes,
} from '../storage/ieltsStore.js'
import { buildReproPack, getCallLogs, clearCallLogs } from '../llm/callLog.js'
import { TEMPLATES } from '../llm/templates.js'
import { KNOWLEDGE_AREAS } from '../data/writingKnowledge.js'
import { IeltsCard, IeltsButton, Banner, Field, inputClass } from './ui.jsx'

function parseNotes(text, area) {
  const raw = String(text || '').trim()
  if (!raw) return []
  try {
    const json = JSON.parse(raw)
    const arr = Array.isArray(json) ? json : (json.cards || [])
    return arr.filter((c) => c.title && c.body).map((c, i) => ({
      id: `note-${Date.now()}-${i}`, area: c.area || area, title: c.title, body: c.body, builtin: false,
    }))
  } catch {
    // Markdown：## 标题 切卡，正文到下一个 ## 为止
    const chunks = raw.split(/^##\s+/m).map((s) => s.trim()).filter(Boolean)
    return chunks.map((chunk, i) => {
      const nl = chunk.indexOf('\n')
      const title = nl < 0 ? chunk : chunk.slice(0, nl).trim()
      const body = nl < 0 ? '' : chunk.slice(nl + 1).trim()
      return { id: `note-${Date.now()}-${i}`, area, title, body: body || chunk, builtin: false }
    }).filter((c) => c.title)
  }
}

export default function SettingsPanel() {
  const [settings, setSettings] = useState(getSettings())
  const [noteArea, setNoteArea] = useState('task2')
  const [noteText, setNoteText] = useState('')
  const [msg, setMsg] = useState('')
  const fileRef = useRef(null)

  function update(patch) {
    const next = { ...settings, ...patch }
    setSettings(next)
    saveSettings(next)
  }
  function pickProvider(provider) {
    const preset = PROVIDER_PRESETS[provider]
    update({ provider, baseUrl: preset.baseUrl, model: preset.model || settings.model })
  }
  function downloadJson(payload, name) {
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = name
    a.click()
    URL.revokeObjectURL(url)
  }
  function downloadExport() {
    downloadJson(exportIeltsData(), `cshub-ielts-data-${new Date().toISOString().slice(0, 10)}.json`)
  }
  function downloadReproPack() {
    downloadJson(buildReproPack(TEMPLATES), `cshub-ielts-llm-repro-${new Date().toISOString().slice(0, 10)}.json`)
  }
  function onImportFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        importIeltsData(JSON.parse(String(reader.result)))
        setMsg('导入完成，刷新页面后全部生效。')
      } catch {
        setMsg('导入失败：文件不是本系统导出的 JSON。')
      }
    }
    reader.readAsText(file)
  }
  function importNotes() {
    const parsed = parseNotes(noteText, noteArea)
    if (!parsed.length) return
    saveKnowledgeNotes([...getKnowledgeNotes(), ...parsed])
    setNoteText('')
    setMsg(`已导入 ${parsed.length} 张知识卡片，可在写作训练页检索。`)
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <IeltsCard>
        <div className="mb-3 text-sm font-bold text-fg">目标与反馈</div>
        <div className="space-y-3">
          <Field label="目标分">
            <select className={inputClass} value={settings.targetBand} onChange={(e) => update({ targetBand: e.target.value })}>
              <option value="6.0">6.0</option>
              <option value="6.5">6.5</option>
              <option value="7.0+">7.0+</option>
            </select>
          </Field>
          <Field label="反馈严格度（只影响措辞与详略，不影响判题）">
            <select className={inputClass} value={settings.strictness} onChange={(e) => update({ strictness: e.target.value })}>
              <option value="gentle">温和</option>
              <option value="standard">标准</option>
              <option value="strict">严格</option>
            </select>
          </Field>
        </div>
      </IeltsCard>

      <IeltsCard>
        <div className="mb-3 text-sm font-bold text-fg">模型服务商（自带 key）</div>
        <div className="space-y-3">
          <Field label="服务商">
            <select className={inputClass} value={settings.provider} onChange={(e) => pickProvider(e.target.value)}>
              {Object.entries(PROVIDER_PRESETS).map(([id, p]) => <option key={id} value={id}>{p.label}</option>)}
            </select>
          </Field>
          <Field label="接口地址（OpenAI 兼容 chat/completions）">
            <input className={inputClass} value={settings.baseUrl} onChange={(e) => update({ baseUrl: e.target.value })} placeholder="https://api.deepseek.com/chat/completions" />
          </Field>
          <Field label="模型名">
            <input className={inputClass} value={settings.model} onChange={(e) => update({ model: e.target.value })} placeholder="deepseek-chat" />
          </Field>
          <Field label="API key（只保存在本浏览器 localStorage）">
            <input className={inputClass} type="password" value={settings.apiKey} onChange={(e) => update({ apiKey: e.target.value })} placeholder="sk-..." autoComplete="off" />
          </Field>
          <Banner tone="info">
            key 不进仓库、不进构建产物；直连模式下请求从你的浏览器直接发给服务商。每次发送前页面都会展示将发送的内容。
            若服务商不允许浏览器直连，可改用同源中转 /api/ielts/llm（只转发、不保存，模板白名单 + 长度/超时限制）。
          </Banner>
          {!settings.apiKey ? <Banner tone="warn">未配置 key：判题、错题库、统计、词块库、计时照常可用；讲解类功能使用醒目标注的模拟反馈。</Banner> : null}
        </div>
      </IeltsCard>

      <IeltsCard>
        <div className="mb-3 text-sm font-bold text-fg">导入自己的写作笔记（Markdown 或 JSON）</div>
        <div className="space-y-2">
          <select className={inputClass} value={noteArea} onChange={(e) => setNoteArea(e.target.value)}>
            {KNOWLEDGE_AREAS.map((a) => <option key={a.id} value={a.id}>{a.label}</option>)}
          </select>
          <textarea className={inputClass} rows={6} value={noteText} onChange={(e) => setNoteText(e.target.value)}
            placeholder={'Markdown：每张卡以 ## 标题 开始；或 JSON：[{title, body, area}]'} />
          <IeltsButton onClick={importNotes}>导入卡片</IeltsButton>
        </div>
      </IeltsCard>

      <IeltsCard>
        <div className="mb-3 text-sm font-bold text-fg">数据</div>
        <div className="space-y-2 text-xs text-fg-muted">
          <p>所有个人数据本期只保存在本浏览器。导出默认不含 API key。</p>
          <p>模型调用会记录脱敏日志（模板 id/版本、状态、证据校验、字段名、长度、短哈希，不含 key 与正文），可导出复现包配合 <code>npm run ielts:check-templates</code> 做质量回归。</p>
          <div className="flex flex-wrap gap-2">
            <IeltsButton variant="ghost" onClick={downloadExport}>导出全部数据</IeltsButton>
            <IeltsButton variant="ghost" onClick={downloadReproPack} disabled={getCallLogs().length === 0}>
              导出模型复现包（{getCallLogs().length}）
            </IeltsButton>
            <IeltsButton variant="ghost" onClick={() => {
              if (window.confirm('清空本地脱敏模型调用日志？不影响其他数据。')) {
                clearCallLogs(); setMsg('已清空调用日志。')
              }
            }}>清空调用日志</IeltsButton>
            <IeltsButton variant="ghost" onClick={() => fileRef.current?.click()}>导入数据</IeltsButton>
            <input ref={fileRef} type="file" accept="application/json" className="hidden" onChange={onImportFile} />
            <IeltsButton variant="ghost" onClick={() => {
              if (window.confirm('确定清空全部雅思个人数据（错题、会话、进度、笔记、设置）？算法课后题不受影响。')) {
                clearIeltsData()
                setSettings(DEFAULT_SETTINGS)
                setMsg('已清空。')
              }
            }}>清空雅思数据</IeltsButton>
          </div>
          <Banner tone="warn">仓库不内置任何官方/剑桥真题、音频或文稿；示例均为原创并标注“非真题”，请只使用你自己有权使用的材料。</Banner>
        </div>
      </IeltsCard>

      {msg ? <div className="lg:col-span-2"><Banner tone="ok">{msg}</Banner></div> : null}
    </div>
  )
}
