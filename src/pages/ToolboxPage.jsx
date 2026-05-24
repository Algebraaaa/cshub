import { useMemo, useState } from 'react'
import { renderLimitedMarkdown } from '../utils/safeHtml'
import GuideLayout from '../components/guide/GuideLayout'
import { ErrorBox } from '../components/guide/GuideComponents'

const META = {
  icon: '🛠️',
  tag: '开发者工具箱',
  title: 'CS 实用工具箱',
  subtitle: '12 个最常用的轻量级工具，纯本地运行，数据不过服务器。',
  gradientFrom: '#ff7e5f',
  gradientTo: '#feb47b',
  stats: [
    { icon: '⚡', label: '纯本地运行' },
    { icon: '🔒', label: '数据不离开浏览器' },
    { icon: '🧰', label: '12 个工具' },
    { icon: '📋', label: '一键复制结果' },
  ],
}

const SECTIONS = [
  { icon: '📝', title: '文本与数据', content: <TextTools /> },
  { icon: '🔐', title: '编码与解析', content: <EncodingTools /> },
  { icon: '⏱️', title: '时间与生成', content: <TimeTools /> },
  { icon: '💻', title: '开发辅助',   content: <DevTools /> },
]

export default function ToolboxPage() {
  return <GuideLayout meta={META} sections={SECTIONS} />
}

// ─── Section 1: 文本与数据 ─────────────────────────────────────────────

function TextTools() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
      <JsonFormatter />
      <RegexTester />
      <TextDiff />
    </div>
  )
}

// ─── Section 2: 编码与解析 ─────────────────────────────────────────────

function EncodingTools() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
      <Base64Tool />
      <UrlTool />
      <JwtTool />
    </div>
  )
}

// ─── Section 3: 时间与生成 ─────────────────────────────────────────────

function TimeTools() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
      <TimestampTool />
      <CronTool />
      <UuidTool />
    </div>
  )
}

// ─── Section 4: 开发辅助 ───────────────────────────────────────────────

function DevTools() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
      <BaseConvTool />
      <ColorTool />
      <MarkdownTool />
    </div>
  )
}

// ─── 1. JSON 格式化 ────────────────────────────────────────────────────

function JsonFormatter() {
  const [input, setInput] = useState('{"name":"Alice","skills":["JS","Go"],"age":24}')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')

  const format = () => {
    try { setOutput(JSON.stringify(JSON.parse(input), null, 2)); setError('') }
    catch (e) { setError('无效的 JSON：' + e.message); setOutput('') }
  }
  const minify = () => {
    try { setOutput(JSON.stringify(JSON.parse(input))); setError('') }
    catch (e) { setError('无效的 JSON：' + e.message); setOutput('') }
  }

  return (
    <ToolPanel
      title="JSON 格式化 / 压缩"
      hint="粘贴 JSON，一键 Pretty 或 Minify。常用于接口调试、配置审查。"
    >
      <div style={btnRow}>
        <button onClick={format} style={btnPrimary}>格式化</button>
        <button onClick={minify} style={btnSecondary}>压缩</button>
        <button onClick={() => { setInput(''); setOutput(''); setError('') }} style={btnGhost}>清空</button>
        <CopyBtn text={output} />
      </div>
      <ErrorBox>{error}</ErrorBox>
      <TwoColTextarea
        leftValue={input} leftPlaceholder="在此粘贴 JSON 字符串..." onLeftChange={setInput}
        rightValue={output} rightPlaceholder="结果显示在这里..."
      />
    </ToolPanel>
  )
}

// ─── 2. 正则测试器 ────────────────────────────────────────────────────

function RegexTester() {
  const [pattern, setPattern] = useState('\\b\\w+@\\w+\\.\\w+\\b')
  const [flags, setFlags] = useState('g')
  const [text, setText] = useState('联系：alice@example.com 或 bob@dev.io')
  const result = useMemo(() => {
    try {
      const re = new RegExp(pattern, flags)
      const matches = []
      if (flags.includes('g')) {
        let m
        while ((m = re.exec(text)) !== null) {
          matches.push({ value: m[0], index: m.index, groups: m.slice(1) })
          if (m.index === re.lastIndex) re.lastIndex++
        }
      } else {
        const m = re.exec(text)
        if (m) matches.push({ value: m[0], index: m.index, groups: m.slice(1) })
      }
      return { matches, error: null }
    } catch (e) {
      return { matches: [], error: e.message }
    }
  }, [pattern, flags, text])

  const highlighted = useMemo(() => {
    if (result.error || result.matches.length === 0) return text
    const parts = []
    let cursor = 0
    for (const m of result.matches) {
      if (m.index > cursor) parts.push({ text: text.slice(cursor, m.index), match: false })
      parts.push({ text: m.value, match: true })
      cursor = m.index + m.value.length
    }
    if (cursor < text.length) parts.push({ text: text.slice(cursor), match: false })
    return parts
  }, [text, result])

  return (
    <ToolPanel
      title="正则表达式测试器"
      hint="实时高亮匹配 + 列出所有命中。flags: g 全局、i 忽略大小写、m 多行。"
    >
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <input
          value={pattern} onChange={e => setPattern(e.target.value)}
          placeholder="正则模式"
          style={{ ...inputStyle, flex: 1, fontFamily: 'var(--font-mono)' }}
        />
        <input
          value={flags} onChange={e => setFlags(e.target.value)}
          placeholder="flags"
          style={{ ...inputStyle, width: 80, fontFamily: 'var(--font-mono)' }}
        />
      </div>
      <textarea
        value={text} onChange={e => setText(e.target.value)}
        style={{ ...textareaStyle, height: 100, marginBottom: 12 }}
        placeholder="在此输入要匹配的文本..."
      />
      <ErrorBox>{result.error}</ErrorBox>
      <div style={{
        padding: 'var(--space-3) var(--space-4)',
        background: 'var(--surface-2)',
        border: '1px solid var(--border)',
        borderRadius: 8,
        fontFamily: 'var(--font-mono)',
        fontSize: 'var(--fs-sm)',
        lineHeight: 'var(--lh-loose)',
        marginBottom: 10,
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-all',
      }}>
        {Array.isArray(highlighted) ? highlighted.map((p, i) => (
          p.match
            ? <mark key={i} style={{ background: 'rgba(251,191,36,0.35)', color: 'var(--text-primary)', padding: '0 2px', borderRadius: 3 }}>{p.text}</mark>
            : <span key={i}>{p.text}</span>
        )) : highlighted}
      </div>
      <div style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-tertiary)' }}>
        共 <strong style={{ color: 'var(--accent-light)' }}>{result.matches.length}</strong> 个匹配
      </div>
    </ToolPanel>
  )
}

// ─── 3. 文本 diff ─────────────────────────────────────────────────────

function TextDiff() {
  const [a, setA] = useState('line one\nline two\nline three\nline four')
  const [b, setB] = useState('line one\nLine 2 (changed)\nline three\nline four\nline five')
  const diff = useMemo(() => simpleLineDiff(a, b), [a, b])

  return (
    <ToolPanel
      title="文本对比 (Diff)"
      hint="按行对比两段文本，删除/新增高亮显示。基于最长公共子序列。"
    >
      <div className="tool-twocol" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
        <textarea value={a} onChange={e => setA(e.target.value)} style={{ ...textareaStyle, height: 120 }} placeholder="左侧（原文）" />
        <textarea value={b} onChange={e => setB(e.target.value)} style={{ ...textareaStyle, height: 120 }} placeholder="右侧（修改后）" />
      </div>
      <div style={{
        padding: 'var(--space-3) var(--space-4)',
        background: 'var(--surface-2)',
        border: '1px solid var(--border)',
        borderRadius: 8,
        fontFamily: 'var(--font-mono)',
        fontSize: 'var(--fs-sm)',
        lineHeight: 'var(--lh-normal)',
      }}>
        {diff.map((d, i) => {
          const bg = d.op === '+' ? 'rgba(34,197,94,0.10)' : d.op === '-' ? 'rgba(248,113,113,0.10)' : 'transparent'
          const color = d.op === '+' ? '#86efac' : d.op === '-' ? '#fca5a5' : 'var(--text-secondary)'
          const prefix = d.op === ' ' ? ' ' : d.op
          return (
            <div key={i} style={{ background: bg, padding: '2px 8px', whiteSpace: 'pre-wrap' }}>
              <span style={{ color, marginRight: 8, fontWeight: 700 }}>{prefix}</span>
              <span style={{ color }}>{d.line}</span>
            </div>
          )
        })}
      </div>
    </ToolPanel>
  )
}

// ─── 4. Base64 ────────────────────────────────────────────────────────

function Base64Tool() {
  const [input, setInput] = useState('Hello, 世界')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')

  const encode = () => {
    try { setOutput(btoa(unescape(encodeURIComponent(input)))); setError('') }
    catch (e) { setError('编码失败：' + e.message); setOutput('') }
  }
  const decode = () => {
    try { setOutput(decodeURIComponent(escape(atob(input)))); setError('') }
    catch (e) { setError('不是合法的 Base64：' + e.message); setOutput('') }
  }

  return (
    <ToolPanel
      title="Base64 编解码"
      hint="支持中文。常用于 API token、图片 data URL、JWT payload 等场景。"
    >
      <div style={btnRow}>
        <button onClick={encode} style={btnPrimary}>编码</button>
        <button onClick={decode} style={btnSecondary}>解码</button>
        <button onClick={() => { setInput(''); setOutput(''); setError('') }} style={btnGhost}>清空</button>
        <CopyBtn text={output} />
      </div>
      <ErrorBox>{error}</ErrorBox>
      <TwoColTextarea
        leftValue={input} leftPlaceholder="原文 / Base64..." onLeftChange={setInput}
        rightValue={output} rightPlaceholder="结果..."
      />
    </ToolPanel>
  )
}

// ─── 5. URL 编解码 ────────────────────────────────────────────────────

function UrlTool() {
  const [input, setInput] = useState('https://example.com/搜索?q=你好 世界&lang=zh-CN')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')

  const encode = () => {
    try { setOutput(encodeURIComponent(input)); setError('') }
    catch (e) { setError(e.message) }
  }
  const decode = () => {
    try { setOutput(decodeURIComponent(input)); setError('') }
    catch (e) { setError('包含非法的 % 编码：' + e.message) }
  }
  const parseQuery = () => {
    try {
      const idx = input.indexOf('?')
      const qs = idx >= 0 ? input.slice(idx + 1) : input
      const params = new URLSearchParams(qs)
      const out = [...params.entries()].map(([k, v]) => `${k} = ${v}`).join('\n')
      setOutput(out || '(无 query 参数)')
      setError('')
    } catch (e) { setError(e.message) }
  }

  return (
    <ToolPanel
      title="URL 编解码 + Query 解析"
      hint="encodeURIComponent / 反向；以及把 ?a=1&b=2 拆成键值对。"
    >
      <div style={btnRow}>
        <button onClick={encode} style={btnPrimary}>编码</button>
        <button onClick={decode} style={btnSecondary}>解码</button>
        <button onClick={parseQuery} style={btnSecondary}>解析 Query</button>
        <CopyBtn text={output} />
      </div>
      <ErrorBox>{error}</ErrorBox>
      <TwoColTextarea
        leftValue={input} leftPlaceholder="完整 URL 或字符串..." onLeftChange={setInput}
        rightValue={output} rightPlaceholder="结果..."
      />
    </ToolPanel>
  )
}

// ─── 6. JWT 解析 ──────────────────────────────────────────────────────

function JwtTool() {
  const [input, setInput] = useState('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkFsaWNlIiwiaWF0IjoxNzMwMDAwMDAwfQ.4Wcc1B5y2W7m8s9HhJK3pq1rPkz5tF2DqRqDqA8s3lQ')
  const result = useMemo(() => {
    if (!input.trim()) return null
    const parts = input.trim().split('.')
    if (parts.length !== 3) return { error: 'JWT 格式应为 header.payload.signature 三段' }
    try {
      const decode = (s) => JSON.parse(atob(s.replace(/-/g, '+').replace(/_/g, '/')))
      return {
        header: decode(parts[0]),
        payload: decode(parts[1]),
        signature: parts[2],
      }
    } catch (e) {
      return { error: 'Base64 解码失败：' + e.message }
    }
  }, [input])

  return (
    <ToolPanel
      title="JWT 解析"
      hint="解码 header 和 payload，不验签。用于查看 token 里的 exp / iat / sub / 自定义字段。"
    >
      <textarea
        value={input} onChange={e => setInput(e.target.value)}
        style={{ ...textareaStyle, height: 100, marginBottom: 12 }}
        placeholder="粘贴 JWT token..."
      />
      {result?.error ? <ErrorBox>{result.error}</ErrorBox> : null}
      {result && !result.error && (
        <div className="tool-twocol" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <ReadOnlyBlock title="Header" content={JSON.stringify(result.header, null, 2)} />
          <ReadOnlyBlock title="Payload" content={JSON.stringify(result.payload, null, 2)} />
        </div>
      )}
    </ToolPanel>
  )
}

// ─── 7. 时间戳 ────────────────────────────────────────────────────────

function TimestampTool() {
  const [ts, setTs] = useState(String(Date.now()))
  const [date, setDate] = useState('')

  const tsToDate = () => {
    const n = parseInt(ts, 10)
    if (isNaN(n)) { setDate('—'); return }
    const d = new Date(ts.length === 10 ? n * 1000 : n)
    setDate(d.toLocaleString('zh-CN', { hour12: false }) + '  /  ' + d.toISOString())
  }
  const dateToTs = () => {
    const d = new Date(date)
    if (isNaN(d.getTime())) { setTs('—'); return }
    setTs(String(d.getTime()))
  }
  const now = () => { const n = Date.now(); setTs(String(n)); setDate(new Date(n).toLocaleString('zh-CN', { hour12: false })) }

  return (
    <ToolPanel
      title="时间戳 ⇄ 日期"
      hint="自动识别秒 / 毫秒级时间戳。支持双向转换。"
    >
      <div style={btnRow}>
        <button onClick={now} style={btnPrimary}>当前时间</button>
        <button onClick={tsToDate} style={btnSecondary}>戳 → 日期</button>
        <button onClick={dateToTs} style={btnSecondary}>日期 → 戳</button>
      </div>
      <div className="tool-twocol" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Field label="时间戳 (ms 或 s)">
          <input value={ts} onChange={e => setTs(e.target.value)} style={{ ...inputStyle, fontFamily: 'var(--font-mono)' }} />
        </Field>
        <Field label="日期">
          <input value={date} onChange={e => setDate(e.target.value)} style={inputStyle} placeholder="2024-01-01 12:00:00" />
        </Field>
      </div>
    </ToolPanel>
  )
}

// ─── 8. Cron 解释 ─────────────────────────────────────────────────────

function CronTool() {
  const [expr, setExpr] = useState('0 9 * * 1-5')
  const result = useMemo(() => explainCron(expr), [expr])

  return (
    <ToolPanel
      title="Cron 表达式解释"
      hint="支持 5 段标准 Cron（分 时 日 月 周）。常用预设：每分钟 * * * * *，每天 9 点 0 9 * * *。"
    >
      <input
        value={expr} onChange={e => setExpr(e.target.value)}
        style={{ ...inputStyle, fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-md)', marginBottom: 12 }}
        placeholder="* * * * *"
      />
      <ErrorBox>{result.error}</ErrorBox>
      {!result.error && (
        <div style={{
          padding: 'var(--space-4)',
          background: 'rgba(155, 109, 255, 0.08)',
          border: '1px solid var(--accent-border)',
          borderRadius: 10,
        }}>
          <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>
            含义
          </div>
          <div style={{ fontSize: 'var(--fs-lg)', color: 'var(--accent-light)', fontWeight: 700 }}>
            {result.zh}
          </div>
          <div style={{ marginTop: 10, fontSize: 'var(--fs-sm)', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
            {result.breakdown.join('  |  ')}
          </div>
        </div>
      )}
    </ToolPanel>
  )
}

// ─── 9. UUID / NanoID 生成 ────────────────────────────────────────────

function UuidTool() {
  const [count, setCount] = useState(5)
  const [kind, setKind] = useState('uuid')
  const [list, setList] = useState([])

  const gen = () => {
    const n = Math.max(1, Math.min(50, count))
    const out = []
    if (kind === 'uuid') {
      for (let i = 0; i < n; i++) out.push(uuidv4())
    } else if (kind === 'short') {
      for (let i = 0; i < n; i++) out.push(nanoId(10))
    } else if (kind === 'numeric') {
      for (let i = 0; i < n; i++) out.push(String(Math.floor(Math.random() * 1e10)).padStart(10, '0'))
    }
    setList(out)
  }

  return (
    <ToolPanel
      title="UUID / NanoID / 数字 ID 生成器"
      hint="UUID v4 用 crypto.getRandomValues 生成；NanoID 是更短的 URL 安全 ID。"
    >
      <div style={btnRow}>
        <select value={kind} onChange={e => setKind(e.target.value)} style={{ ...inputStyle, width: 'auto' }}>
          <option value="uuid">UUID v4 (36 字符)</option>
          <option value="short">NanoID (10 字符)</option>
          <option value="numeric">数字 ID (10 位)</option>
        </select>
        <input
          type="number" min="1" max="50" value={count}
          onChange={e => setCount(parseInt(e.target.value, 10) || 1)}
          style={{ ...inputStyle, width: 80 }}
        />
        <button onClick={gen} style={btnPrimary}>生成</button>
        <CopyBtn text={list.join('\n')} />
      </div>
      <div style={{
        padding: 'var(--space-3) var(--space-4)',
        background: 'var(--surface-2)',
        border: '1px solid var(--border)',
        borderRadius: 8,
        fontFamily: 'var(--font-mono)',
        fontSize: 'var(--fs-sm)',
        lineHeight: 'var(--lh-loose)',
        maxHeight: 200,
        overflowY: 'auto',
        color: list.length ? 'var(--accent-light)' : 'var(--text-tertiary)',
      }}>
        {list.length ? list.join('\n') : '点"生成"按钮…'}
      </div>
    </ToolPanel>
  )
}

// ─── 10. 进制转换 ─────────────────────────────────────────────────────

function BaseConvTool() {
  const [value, setValue] = useState('255')
  const [from, setFrom] = useState(10)
  const all = useMemo(() => {
    try {
      const n = parseInt(value, from)
      if (isNaN(n)) return null
      return {
        2:  n.toString(2),
        8:  n.toString(8),
        10: n.toString(10),
        16: n.toString(16).toUpperCase(),
      }
    } catch { return null }
  }, [value, from])

  return (
    <ToolPanel
      title="进制转换"
      hint="二/八/十/十六进制四向转换。输入合法则其他三栏自动同步。"
    >
      <div style={btnRow}>
        <span style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-tertiary)' }}>输入进制：</span>
        {[2, 8, 10, 16].map(b => (
          <button key={b} onClick={() => setFrom(b)} style={from === b ? btnPrimary : btnGhost}>{b}</button>
        ))}
      </div>
      <input
        value={value} onChange={e => setValue(e.target.value)}
        style={{ ...inputStyle, fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-md)', marginBottom: 12 }}
        placeholder="输入数字"
      />
      {all ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 10 }}>
          <BaseCard label="2 (BIN)" value={all[2]} prefix="0b" />
          <BaseCard label="8 (OCT)" value={all[8]} prefix="0o" />
          <BaseCard label="10 (DEC)" value={all[10]} prefix="" />
          <BaseCard label="16 (HEX)" value={all[16]} prefix="0x" />
        </div>
      ) : <ErrorBox>无法解析为 {from} 进制数</ErrorBox>}
    </ToolPanel>
  )
}

function BaseCard({ label, value, prefix }) {
  return (
    <div style={{
      padding: 'var(--space-3) var(--space-4)',
      background: 'var(--surface-2)',
      border: '1px solid var(--border)',
      borderRadius: 8,
    }}>
      <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-tertiary)', letterSpacing: 1, marginBottom: 4 }}>{label}</div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-md)', color: 'var(--accent-light)', wordBreak: 'break-all' }}>
        <span style={{ color: 'var(--text-tertiary)' }}>{prefix}</span>{value}
      </div>
    </div>
  )
}

// ─── 11. 颜色转换 ─────────────────────────────────────────────────────

function ColorTool() {
  const [hex, setHex] = useState('#8b5cf6')
  const parsed = useMemo(() => parseHex(hex), [hex])

  return (
    <ToolPanel
      title="颜色转换 HEX ⇄ RGB ⇄ HSL"
      hint="设计稿和代码之间的颜色翻译。输入支持 #RGB 或 #RRGGBB。"
    >
      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <Field label="HEX">
            <input value={hex} onChange={e => setHex(e.target.value)} style={{ ...inputStyle, fontFamily: 'var(--font-mono)' }} placeholder="#8b5cf6" />
          </Field>
          {parsed && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 10, marginTop: 12 }}>
              <BaseCard label="RGB" value={`${parsed.r}, ${parsed.g}, ${parsed.b}`} prefix="rgb(" />
              <BaseCard label="HSL" value={`${parsed.h}°, ${parsed.s}%, ${parsed.l}%`} prefix="hsl(" />
            </div>
          )}
          {!parsed && <ErrorBox>不是合法的 HEX 颜色</ErrorBox>}
        </div>
        <div style={{
          width: 120, height: 120, borderRadius: 'var(--r-md)',
          background: parsed ? hex : 'var(--surface-2)',
          border: '2px solid var(--border)',
          flexShrink: 0,
        }} />
      </div>
    </ToolPanel>
  )
}

// ─── 12. Markdown 预览 ────────────────────────────────────────────────

function MarkdownTool() {
  const [src, setSrc] = useState('# Hello\n\n**粗体** 和 *斜体*\n\n- 列表项 1\n- 列表项 2\n\n`内联代码` 以及 [链接](https://example.com)')
  const html = useMemo(() => renderLimitedMarkdown(src), [src])

  return (
    <ToolPanel
      title="Markdown 实时预览"
      hint="支持标题、粗体、斜体、行内代码、链接、列表。轻量版本，不引入 marked。"
    >
      <div className="tool-twocol" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <textarea
          value={src} onChange={e => setSrc(e.target.value)}
          style={{ ...textareaStyle, height: 240 }}
          placeholder="在此输入 Markdown..."
        />
        <div
          style={{
            ...textareaStyle, height: 240, background: 'var(--bg-elev)',
            overflow: 'auto', padding: 'var(--space-4)',
            fontFamily: 'var(--font-sans)',
            color: 'var(--text-primary)',
          }}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    </ToolPanel>
  )
}

// ─── 公共组件 ────────────────────────────────────────────────────────

function ToolPanel({ title, hint, children }) {
  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--r-md)',
      padding: 'var(--space-5)',
    }}>
      <div style={{ marginBottom: 'var(--space-4)' }}>
        <div style={{ fontSize: 'var(--fs-lg)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>{title}</div>
        {hint && <div style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-tertiary)', lineHeight: 'var(--lh-normal)' }}>{hint}</div>}
      </div>
      {children}
    </div>
  )
}

function TwoColTextarea({ leftValue, leftPlaceholder, onLeftChange, rightValue, rightPlaceholder }) {
  return (
    <div className="tool-twocol" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
      <textarea value={leftValue} onChange={e => onLeftChange(e.target.value)} placeholder={leftPlaceholder} style={textareaStyle} />
      <textarea readOnly value={rightValue} placeholder={rightPlaceholder} style={{ ...textareaStyle, background: 'var(--bg-elev)' }} />
    </div>
  )
}

function ReadOnlyBlock({ title, content }) {
  return (
    <div>
      <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-tertiary)', letterSpacing: 1, marginBottom: 6 }}>{title}</div>
      <pre style={{
        margin: 0, padding: 'var(--space-3)',
        background: 'var(--surface-2)',
        border: '1px solid var(--border)',
        borderRadius: 8,
        fontFamily: 'var(--font-mono)',
        fontSize: 'var(--fs-sm)',
        color: 'var(--accent-light)',
        overflow: 'auto', maxHeight: 220,
        whiteSpace: 'pre-wrap',
      }}>{content}</pre>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div>
      <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-tertiary)', letterSpacing: 1, marginBottom: 6 }}>{label}</div>
      {children}
    </div>
  )
}

function CopyBtn({ text }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      onClick={() => {
        if (!text) return
        navigator.clipboard?.writeText(text).then(() => {
          setCopied(true)
          setTimeout(() => setCopied(false), 1200)
        })
      }}
      style={{ ...btnGhost, marginLeft: 'auto' }}
    >
      {copied ? '✓ 已复制' : '📋 复制'}
    </button>
  )
}

// ─── 工具函数 ────────────────────────────────────────────────────────

function simpleLineDiff(a, b) {
  // Longest Common Subsequence on lines, then build a diff.
  const al = a.split('\n')
  const bl = b.split('\n')
  const m = al.length, n = bl.length
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0))
  for (let i = m - 1; i >= 0; i--) {
    for (let j = n - 1; j >= 0; j--) {
      dp[i][j] = al[i] === bl[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1])
    }
  }
  const out = []
  let i = 0, j = 0
  while (i < m && j < n) {
    if (al[i] === bl[j]) { out.push({ op: ' ', line: al[i] }); i++; j++ }
    else if (dp[i + 1][j] >= dp[i][j + 1]) { out.push({ op: '-', line: al[i] }); i++ }
    else { out.push({ op: '+', line: bl[j] }); j++ }
  }
  while (i < m) { out.push({ op: '-', line: al[i++] }) }
  while (j < n) { out.push({ op: '+', line: bl[j++] }) }
  return out
}

function explainCron(expr) {
  const parts = expr.trim().split(/\s+/)
  if (parts.length !== 5) return { error: 'Cron 应为 5 段：分 时 日 月 周' }
  const [min, hour, day, month, dow] = parts

  const fmt = (v, name, max) => {
    if (v === '*') return `每${name}`
    if (/^\*\/\d+$/.test(v)) return `每 ${v.slice(2)} ${name}`
    if (/^\d+-\d+$/.test(v)) return `${name} ${v.replace('-', '~')}`
    if (/^\d+(,\d+)+$/.test(v)) return `${name} ${v.split(',').join('、')}`
    if (/^\d+$/.test(v)) {
      const n = parseInt(v, 10)
      if (max && (n < 0 || n > max)) return null
      return `${name} ${v}`
    }
    return null
  }
  const m = fmt(min, '分', 59)
  const h = fmt(hour, '时', 23)
  const d = fmt(day, '日', 31)
  const mo = fmt(month, '月', 12)
  const w = fmt(dow, '周', 6)
  if ([m, h, d, mo, w].some(x => x === null)) return { error: '格式无法识别（仅支持 * / */N / N-N / N,N / 单数字）' }

  // Heuristic Chinese rendering for common patterns
  let zh
  if (min === '*' && hour === '*') zh = '每分钟'
  else if (hour === '*' && day === '*' && month === '*' && dow === '*') zh = `每小时的第 ${min} 分钟`
  else if (day === '*' && month === '*' && dow === '*') zh = `每天 ${pad(hour)}:${pad(min)}`
  else if (day === '*' && month === '*') zh = `周${zhDow(dow)} ${pad(hour)}:${pad(min)}`
  else if (month === '*' && dow === '*') zh = `每月 ${day} 日 ${pad(hour)}:${pad(min)}`
  else zh = `${m}、${h}、${d}、${mo}、${w}`
  return { error: null, zh, breakdown: [m, h, d, mo, w] }
}

function pad(s) {
  if (/^\d+$/.test(s)) return s.padStart(2, '0')
  return s
}
function zhDow(v) {
  const map = { 0: '日', 1: '一', 2: '二', 3: '三', 4: '四', 5: '五', 6: '六' }
  if (/^\d+$/.test(v)) return map[v] || v
  if (/^\d+-\d+$/.test(v)) {
    const [a, b] = v.split('-')
    return `${map[a]}~${map[b]}`
  }
  return v
}

function uuidv4() {
  if (crypto?.randomUUID) return crypto.randomUUID()
  const bytes = new Uint8Array(16)
  crypto.getRandomValues(bytes)
  bytes[6] = (bytes[6] & 0x0f) | 0x40
  bytes[8] = (bytes[8] & 0x3f) | 0x80
  const hex = [...bytes].map(b => b.toString(16).padStart(2, '0')).join('')
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
}

function nanoId(len = 10) {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  const bytes = new Uint8Array(len)
  crypto.getRandomValues(bytes)
  let out = ''
  for (let i = 0; i < len; i++) out += alphabet[bytes[i] % alphabet.length]
  return out
}

function parseHex(hex) {
  let s = hex.trim().replace(/^#/, '')
  if (s.length === 3) s = s.split('').map(c => c + c).join('')
  if (!/^[0-9a-fA-F]{6}$/.test(s)) return null
  const r = parseInt(s.slice(0, 2), 16)
  const g = parseInt(s.slice(2, 4), 16)
  const b = parseInt(s.slice(4, 6), 16)
  // RGB → HSL
  const rn = r / 255, gn = g / 255, bn = b / 255
  const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn)
  const l = (max + min) / 2
  let h = 0, sat = 0
  if (max !== min) {
    const d = max - min
    sat = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case rn: h = (gn - bn) / d + (gn < bn ? 6 : 0); break
      case gn: h = (bn - rn) / d + 2; break
      case bn: h = (rn - gn) / d + 4; break
    }
    h *= 60
  }
  return { r, g, b, h: Math.round(h), s: Math.round(sat * 100), l: Math.round(l * 100) }
}

// ─── 样式 ────────────────────────────────────────────────────────────

const btnRow = { display: 'flex', gap: 8, marginBottom: 12, alignItems: 'center', flexWrap: 'wrap' }

const btnBase = {
  padding: '8px 16px',
  borderRadius: 8,
  fontSize: 'var(--fs-sm)',
  fontWeight: 600,
  cursor: 'pointer',
  border: 'none',
  transition: 'all 0.15s',
}
const btnPrimary = { ...btnBase, background: 'var(--accent)', color: '#fff' }
const btnSecondary = { ...btnBase, background: 'var(--accent-soft)', color: 'var(--accent-light)', border: '1px solid var(--accent-border)' }
const btnGhost = { ...btnBase, background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border)' }

const inputStyle = {
  width: '100%',
  padding: '8px 12px',
  background: 'var(--bg)',
  border: '1px solid var(--border)',
  borderRadius: 8,
  color: 'var(--text-primary)',
  fontSize: 'var(--fs-md)',
}

const textareaStyle = {
  width: '100%',
  minHeight: 160,
  padding: 'var(--space-4)',
  borderRadius: 10,
  border: '1px solid var(--border)',
  background: 'var(--bg)',
  color: 'var(--text-primary)',
  fontFamily: 'var(--font-mono)',
  fontSize: 'var(--fs-sm)',
  lineHeight: 'var(--lh-normal)',
  resize: 'vertical',
}
