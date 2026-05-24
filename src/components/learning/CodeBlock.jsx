import { useState, useEffect, useLayoutEffect, useRef } from 'react'
import { escapeHtml } from '../../utils/safeHtml'
const CPP_TYPES = /\b(vector|string|pair|map|unordered_map|set|unordered_set|queue|stack|priority_queue|deque|list|array|tuple|shared_ptr|unique_ptr|weak_ptr|size_t|INT_MAX|INT_MIN|greater|less)\b/g

const PY_KEYWORDS = /\b(def|class|if|elif|else|for|while|return|break|continue|pass|import|from|as|in|is|not|and|or|lambda|with|try|except|finally|raise|yield|async|await|True|False|None|self|cls|global|nonlocal|del|assert)\b/g
const PY_BUILTINS = /\b(print|len|range|enumerate|zip|map|filter|sorted|reversed|sum|min|max|abs|int|str|float|bool|list|dict|set|tuple|deque|heapq|float\b)\b/g

const PS_KEYWORDS = /\b(procedure|function|if|then|else|for|while|do|return|repeat|until|to|from|down|inclusive|begin|end|swap|copy|insert|extractMin|enqueue|dequeue|pop|push|or|and|not)\b/g

const CPP_KEYWORDS = /\b(int|void|bool|char|double|float|long|short|unsigned|signed|auto|const|static|struct|class|public|private|protected|virtual|inline|return|if|else|for|while|do|switch|case|break|continue|default|namespace|using|template|typename|true|false|nullptr|NULL|this|new|delete|throw|try|catch|friend|operator|sizeof|typedef|enum|extern|mutable|explicit|constexpr|noexcept|override|final|union|goto)\b/g

// Tokenize so we don't double-process inside strings/comments
function tokenize(code, rules) {
  const out = []
  let i = 0
  while (i < code.length) {
    let matched = false
    for (const r of rules) {
      r.regex.lastIndex = i
      const m = r.regex.exec(code)
      if (m && m.index === i) {
        out.push({ type: r.type, text: m[0] })
        i += m[0].length
        matched = true
        break
      }
    }
    if (!matched) {
      out.push({ type: 'plain', text: code[i] })
      i++
    }
  }
  // merge adjacent plain runs
  const merged = []
  for (const t of out) {
    if (t.type === 'plain' && merged.length && merged[merged.length - 1].type === 'plain') {
      merged[merged.length - 1].text += t.text
    } else merged.push({ ...t })
  }
  return merged
}

const COLOR = {
  comment: 'var(--syntax-comment)',
  string: 'var(--syntax-string)',
  keyword: 'var(--syntax-keyword)',
  number: 'var(--syntax-number)',
  function: 'var(--syntax-function)',
  type: 'var(--syntax-function)',
  operator: 'var(--syntax-operator)',
}

function renderTokens(tokens) {
  return tokens.map(t => {
    if (t.type === 'plain') return escapeHtml(t.text)
    const color = COLOR[t.type]
    const weight = t.type === 'keyword' || t.type === 'type' ? ';font-weight:500' : ''
    return `<span style="color:${color}${weight}">${escapeHtml(t.text)}</span>`
  }).join('')
}

function highlightCpp(code) {
  const rules = [
    { type: 'comment', regex: /\/\/[^\n]*/y },
    { type: 'comment', regex: /\/\*[\s\S]*?\*\//y },
    { type: 'string',  regex: /"(?:\\.|[^"\\])*"/y },
    { type: 'string',  regex: /'(?:\\.|[^'\\])*'/y },
    { type: 'keyword', regex: CPP_KEYWORDS },
    { type: 'type',    regex: CPP_TYPES },
    { type: 'number',  regex: /\b\d+(?:\.\d+)?\b/y },
    { type: 'function', regex: /[A-Za-z_]\w*(?=\s*\()/y },
  ]
  // sticky requires 'y' flag, we use exec from anchored position
  const adjusted = rules.map(r => ({ ...r, regex: new RegExp(r.regex.source, r.regex.flags.replace(/[gy]/g, '') + 'y') }))
  return renderTokens(tokenize(code, adjusted))
}

function highlightPython(code) {
  const rules = [
    { type: 'comment', regex: /#[^\n]*/y },
    { type: 'string',  regex: /[fr]?"""[\s\S]*?"""/y },
    { type: 'string',  regex: /[fr]?'''[\s\S]*?'''/y },
    { type: 'string',  regex: /[fr]?"(?:\\.|[^"\\])*"/y },
    { type: 'string',  regex: /[fr]?'(?:\\.|[^'\\])*'/y },
    { type: 'keyword', regex: PY_KEYWORDS },
    { type: 'type',    regex: PY_BUILTINS },
    { type: 'number',  regex: /\b\d+(?:\.\d+)?\b/y },
    { type: 'function', regex: /[A-Za-z_]\w*(?=\s*\()/y },
  ]
  const adjusted = rules.map(r => ({ ...r, regex: new RegExp(r.regex.source, r.regex.flags.replace(/[gy]/g, '') + 'y') }))
  return renderTokens(tokenize(code, adjusted))
}

function highlightPseudo(code) {
  const rules = [
    { type: 'comment', regex: /\/\/[^\n]*/y },
    { type: 'comment', regex: /#[^\n]*/y },
    { type: 'keyword', regex: PS_KEYWORDS },
    { type: 'operator', regex: /[←≤≥≠×⌊⌋∞∅]/y },
    { type: 'number', regex: /\b\d+\b/y },
  ]
  const adjusted = rules.map(r => ({ ...r, regex: new RegExp(r.regex.source, r.regex.flags.replace(/[gy]/g, '') + 'y') }))
  return renderTokens(tokenize(code, adjusted))
}

const JAVA_KEYWORDS = /\b(public|private|protected|static|final|abstract|class|interface|extends|implements|new|return|if|else|for|while|do|switch|case|break|continue|default|import|package|void|int|long|double|float|boolean|char|byte|short|null|true|false|this|super|throw|throws|try|catch|finally|instanceof|enum|synchronized|volatile|transient|native|strictfp|assert)\b/g
const JAVA_TYPES = /\b(String|Integer|Long|Double|Boolean|List|ArrayList|LinkedList|Map|HashMap|TreeMap|Set|HashSet|TreeSet|Queue|Deque|ArrayDeque|PriorityQueue|Stack|Arrays|Collections|Math|System|Object|StringBuilder|Iterator|Comparable|Comparator)\b/g

function highlightJava(code) {
  const rules = [
    { type: 'comment', regex: /\/\/[^\n]*/y },
    { type: 'comment', regex: /\/\*[\s\S]*?\*\//y },
    { type: 'string',  regex: /"(?:\\.|[^"\\])*"/y },
    { type: 'string',  regex: /'(?:\\.|[^'\\])*'/y },
    { type: 'keyword', regex: JAVA_KEYWORDS },
    { type: 'type',    regex: JAVA_TYPES },
    { type: 'number',  regex: /\b\d+(?:\.\d+)?[LlFfDd]?\b/y },
    { type: 'function', regex: /[A-Za-z_]\w*(?=\s*\()/y },
  ]
  const adjusted = rules.map(r => ({ ...r, regex: new RegExp(r.regex.source, r.regex.flags.replace(/[gy]/g, '') + 'y') }))
  return renderTokens(tokenize(code, adjusted))
}

const HIGHLIGHTERS = {
  cpp: highlightCpp,
  python: highlightPython,
  pseudo: highlightPseudo,
  java: highlightJava,
  js: highlightCpp, // legacy fallback
}

export default function CodeBlock({ code, lang = 'cpp', title, highlightLine, noAutoScroll = false, fill = false, maxHeight }) {
  const lineRefs = useRef({})
  const [copied, setCopied] = useState(false)
  // isFirstEffectRef handles the initial mount (incl. Strict Mode's double-invoke).
  // prevHighlightRef handles the later null→value transition when StepData first loads.
  // Without these, navigating to a new algo would auto-scroll <main> down to the
  // highlighted line, dragging the page off the top.
  const isFirstEffectRef = useRef(true)
  const prevHighlightRef = useRef(undefined)
  useLayoutEffect(() => { isFirstEffectRef.current = true }, [])

  useEffect(() => {
    const prev = prevHighlightRef.current
    prevHighlightRef.current = highlightLine
    if (isFirstEffectRef.current) { isFirstEffectRef.current = false; return }
    if (prev == null) return  // first non-null highlightLine after mount — not user-driven
    if (!noAutoScroll && highlightLine != null && lineRefs.current[highlightLine]) {
      lineRefs.current[highlightLine].scrollIntoView({ block: 'nearest', behavior: 'smooth' })
    }
  }, [highlightLine, noAutoScroll])

  if (!code) return null
  const lines = code.split('\n')
  const highlight = HIGHLIGHTERS[lang] || highlightPseudo

  function copy() {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div style={{
      background: 'var(--code-bg)',
      border: '1px solid var(--code-border)',
      borderRadius: 10,
      overflow: 'hidden',
      display: fill ? 'flex' : undefined,
      flexDirection: fill ? 'column' : undefined,
      height: fill ? '100%' : undefined,
      minHeight: fill ? 0 : undefined,
    }}>
      <div style={{
        display: 'flex', alignItems: 'center',
        padding: '8px 14px',
        borderBottom: '1px solid var(--border)',
        background: 'var(--surface)',
      }}>
        <div style={{ display: 'flex', gap: 6 }}>
          <Dot color="#ff5f57"/><Dot color="#febc2e"/><Dot color="#28c840"/>
        </div>
        <span style={{
          marginLeft: 14, fontSize: 11,
          color: 'var(--text-tertiary)',
          fontFamily: 'var(--font-mono)',
          fontWeight: 500,
        }}>
          {title || `code.${lang}`}
        </span>
        <button onClick={copy} style={{
          marginLeft: 'auto',
          padding: '3px 10px',
          fontSize: 11,
          color: copied ? 'var(--green)' : 'var(--text-tertiary)',
          background: 'transparent',
          border: '1px solid var(--border)',
          borderRadius: 4,
          fontWeight: 500,
        }}>
          {copied ? '✓ 已复制' : '复制'}
        </button>
      </div>
      <pre style={{
        margin: 0,
        padding: '16px 0',
        fontFamily: 'var(--font-mono)',
        fontSize: 13,
        lineHeight: 1.7,
        overflow: 'auto',
        flex: fill ? '1 1 auto' : undefined,
        minHeight: fill ? 0 : undefined,
        maxHeight,
      }}>
        <code style={{ display: 'block' }}>
          {lines.map((line, i) => {
            const lineNum = i + 1
            const isHl = highlightLine === lineNum
            return (
              <div key={i} ref={el => { lineRefs.current[lineNum] = el }}
                style={{
                  display: 'flex', paddingRight: 16,
                  background: isHl ? 'rgba(139,92,246,0.13)' : 'transparent',
                  borderLeft: isHl ? '2px solid var(--accent)' : '2px solid transparent',
                  transition: 'background 0.2s, border-color 0.2s',
                }}>
                <span style={{
                  width: 44, textAlign: 'right', paddingRight: 16,
                  color: isHl ? 'var(--accent-light)' : 'var(--text-tertiary)',
                  userSelect: 'none', opacity: isHl ? 1 : 0.5, flexShrink: 0,
                  fontWeight: isHl ? 700 : 400,
                }}>{lineNum}</span>
                <span style={{ color: isHl ? 'var(--text-primary)' : 'var(--text-primary)' }}
                  dangerouslySetInnerHTML={{ __html: highlight(line) || '&nbsp;' }} />
              </div>
            )
          })}
        </code>
      </pre>
    </div>
  )
}

function Dot({ color }) {
  return <span style={{ width: 11, height: 11, borderRadius: '50%', background: color, display: 'inline-block' }} />
}
