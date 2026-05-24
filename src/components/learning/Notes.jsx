import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { getSupabase, hasSupabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'

const LOCAL_NOTE_KEY = (slug) => `algoviz-note-${slug}`

export default function Notes({ slug }) {
  const { user, enabled: authEnabled } = useAuth()
  const userId = user?.id
  const [tab, setTab] = useState('mine') // 'mine' | 'public'
  const [content, setContent] = useState('')
  const [isPublic, setIsPublic] = useState(false)
  const [noteId, setNoteId] = useState(null)
  const [mode, setMode] = useState('edit') // 'edit' | 'preview'
  const [savedAt, setSavedAt] = useState(0)
  const [publicNotes, setPublicNotes] = useState([])
  const [loadingPublic, setLoadingPublic] = useState(false)
  const debounceRef = useRef(null)

  // 加载我的笔记：先 localStorage 兜底，登录后拉云端覆盖
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LOCAL_NOTE_KEY(slug))
      if (raw) {
        const parsed = JSON.parse(raw)
        setContent(parsed.content || '')
        setIsPublic(!!parsed.is_public)
      } else {
        setContent('')
        setIsPublic(false)
      }
    } catch { /* ignore */ }
    setNoteId(null)
  }, [slug])

  useEffect(() => {
    if (!hasSupabase || !userId) return
    let cancelled = false
    ;(async () => {
      const client = await getSupabase()
      if (!client) return
      const { data } = await client
        .from('notes').select('id, content, is_public, updated_at')
        .eq('user_id', userId).eq('slug', slug)
        .order('updated_at', { ascending: false }).limit(1).maybeSingle()
      if (cancelled || !data) return
      setNoteId(data.id)
      setContent(data.content || '')
      setIsPublic(!!data.is_public)
    })()
    return () => { cancelled = true }
  }, [slug, userId])

  // 加载公开笔记
  useEffect(() => {
    if (tab !== 'public' || !hasSupabase) return
    let cancelled = false
    setLoadingPublic(true)
    ;(async () => {
      const client = await getSupabase()
      if (!client) return
      const { data } = await client
        .from('notes').select('id, content, updated_at, user_id')
        .eq('slug', slug).eq('is_public', true)
        .order('updated_at', { ascending: false }).limit(20)
      if (cancelled) return
      setPublicNotes(data || [])
      setLoadingPublic(false)
    })()
    return () => { cancelled = true }
  }, [tab, slug])

  // 本地实时镜像（防止刷新丢笔记）
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_NOTE_KEY(slug), JSON.stringify({ content, is_public: isPublic }))
    } catch { /* ignore */ }
  }, [content, isPublic, slug])

  // 云端防抖保存
  const saveCloud = useCallback(() => {
    if (!hasSupabase || !userId) return
    getSupabase().then(client => {
      if (!client) return null
      const payload = {
        user_id: userId,
        slug,
        content,
        is_public: isPublic,
        updated_at: new Date().toISOString(),
      }
      return noteId
        ? client.from('notes').update(payload).eq('id', noteId)
        : client.from('notes').insert(payload).select('id').single()
    }).then(res => {
      if (res?.data?.id) setNoteId(res.data.id)
      setSavedAt(Date.now())
    })
  }, [content, isPublic, noteId, slug, userId])

  useEffect(() => {
    if (!hasSupabase || !userId) return
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(saveCloud, 1000)
    return () => clearTimeout(debounceRef.current)
  }, [content, isPublic, saveCloud, userId])

  const wordCount = useMemo(() => content.trim().length, [content])

  return (
    <section style={{
      marginTop: 32,
      borderRadius: 20,
      background: 'var(--glass-bg-mid)',
      border: '1px solid var(--glass-border-strong)',
      backdropFilter: 'blur(40px) saturate(180%)',
      WebkitBackdropFilter: 'blur(40px) saturate(180%)',
      boxShadow: '0 12px 40px rgba(0,0,0,0.10), inset 0 1px 1px rgba(255,255,255,0.16)',
      overflow: 'hidden',
    }}>
      <header style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '14px 18px',
        borderBottom: '1px solid var(--glass-border)',
        flexWrap: 'wrap',
      }}>
        <div style={{
          width: 32, height: 32, borderRadius: 10,
          background: 'linear-gradient(135deg, #a855f7, #ec4899)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 16, color: 'white',
          boxShadow: '0 4px 12px rgba(168,85,247,0.4)',
        }}>📝</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)' }}>学习笔记</div>
          <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
            {authEnabled && user ? '已云端同步' : authEnabled ? '登录后可云端同步' : '本地保存 · 单机模式'}
          </div>
        </div>
        <div role="tablist" style={{ display: 'flex', gap: 4, padding: 3, borderRadius: 8, background: 'var(--surface)', border: '1px solid var(--border)' }}>
          {(authEnabled ? ['mine', 'public'] : ['mine']).map(t => (
            <button key={t} role="tab" aria-selected={tab === t}
              onClick={() => setTab(t)}
              style={{
                padding: '5px 12px',
                borderRadius: 6,
                border: 'none',
                cursor: 'pointer',
                background: tab === t ? 'var(--accent-soft)' : 'transparent',
                color: tab === t ? 'var(--text-primary)' : 'var(--text-secondary)',
                fontSize: 12, fontWeight: 700,
              }}>
              {t === 'mine' ? '我的' : '公开笔记'}
            </button>
          ))}
        </div>
      </header>

      {tab === 'mine' && (
        <div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '8px 18px',
            borderBottom: '1px solid var(--glass-border)',
            flexWrap: 'wrap',
          }}>
            <div role="tablist" style={{ display: 'flex', gap: 4, padding: 3, borderRadius: 8, background: 'var(--surface)', border: '1px solid var(--border)' }}>
              {['edit', 'preview'].map(m => (
                <button key={m} onClick={() => setMode(m)}
                  style={{
                    padding: '4px 10px', borderRadius: 6, border: 'none', cursor: 'pointer',
                    background: mode === m ? 'var(--accent-soft)' : 'transparent',
                    color: mode === m ? 'var(--text-primary)' : 'var(--text-secondary)',
                    fontSize: 11, fontWeight: 700,
                  }}>
                  {m === 'edit' ? '编辑' : '预览'}
                </button>
              ))}
            </div>
            <span style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--text-tertiary)' }}>
              <span>{wordCount} 字</span>
              {authEnabled && user && isPublic && <span style={{ color: '#22c55e', fontWeight: 700 }}>· 公开</span>}
              {savedAt > 0 && <span>· 已保存</span>}
            </span>
            {authEnabled && user && (
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-secondary)', cursor: 'pointer' }}>
                <input type="checkbox" checked={isPublic}
                  onChange={e => setIsPublic(e.target.checked)} />
                公开分享给他人
              </label>
            )}
          </div>

          <div style={{ padding: 18, minHeight: 220 }}>
            {mode === 'edit' ? (
              <textarea value={content} onChange={e => setContent(e.target.value)}
                placeholder={`支持 Markdown · 例如：\n# 核心要点\n- 时间复杂度推导\n- 易错点\n\n\`\`\`js\n// 你自己的实现思路\n\`\`\``}
                style={{
                  width: '100%', minHeight: 240, resize: 'vertical',
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 10,
                  padding: 14,
                  fontFamily: 'var(--font-mono)',
                  fontSize: 13,
                  lineHeight: 1.6,
                  color: 'var(--text-primary)',
                  outline: 'none',
                }} />
            ) : (
              <NoteRenderer content={content} />
            )}
          </div>
        </div>
      )}

      {tab === 'public' && (
        <div style={{ padding: 18 }}>
          {!hasSupabase && (
            <Hint>当前为单机模式，未启用公开笔记。配置 Supabase 后即可浏览其他同学的笔记。</Hint>
          )}
          {hasSupabase && loadingPublic && (
            <div style={{ color: 'var(--text-tertiary)', fontSize: 13 }}>加载中…</div>
          )}
          {hasSupabase && !loadingPublic && publicNotes.length === 0 && (
            <Hint>暂时还没有人公开过这道算法的笔记。把你的笔记设为「公开」做第一个吧！</Hint>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {publicNotes.map(n => (
              <article key={n.id} style={{
                padding: 14,
                borderRadius: 12,
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid var(--glass-border)',
              }}>
                <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 8, fontFamily: 'var(--font-mono)' }}>
                  匿名学习者 · {new Date(n.updated_at).toLocaleString()}
                </div>
                <NoteRenderer content={n.content} />
              </article>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}

function NoteRenderer({ content }) {
  if (!content?.trim()) {
    return <div style={{ color: 'var(--text-tertiary)', fontSize: 13 }}>（空）</div>
  }
  return (
    <div className="markdown-body" style={{
      fontSize: 14,
      lineHeight: 1.75,
      color: 'var(--text-primary)',
    }}>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  )
}

function Hint({ children }) {
  return (
    <div style={{
      padding: '12px 14px',
      borderRadius: 10,
      background: 'var(--surface)',
      border: '1px dashed var(--border-strong)',
      color: 'var(--text-secondary)',
      fontSize: 13,
      lineHeight: 1.55,
    }}>{children}</div>
  )
}
