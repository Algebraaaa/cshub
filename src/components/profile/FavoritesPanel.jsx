import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ALGORITHMS } from '../../data/algorithmMeta'

const FOLDERS_KEY = 'algoviz-folders'
const UNGROUPED = '未分组'

function loadFolders() {
  try {
    const raw = localStorage.getItem(FOLDERS_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch { return {} }
}

function saveFolders(folders) {
  try { localStorage.setItem(FOLDERS_KEY, JSON.stringify(folders)) } catch { /* ignore */ }
}

export default function FavoritesPanel({ favorites }) {
  const [folders, setFolders]       = useState(() => loadFolders())
  const [editingSlug, setEditingSlug] = useState(null)
  const [inputVal, setInputVal]     = useState('')

  useEffect(() => { saveFolders(folders) }, [folders])

  const slugList = useMemo(() => [...favorites].filter(s => ALGORITHMS[s]), [favorites])

  if (slugList.length === 0) {
    return (
      <div style={{
        padding: '16px 20px', borderRadius: 12,
        background: 'var(--surface)', border: '1px dashed var(--border)',
        color: 'var(--text-tertiary)', fontSize: 13, textAlign: 'center',
      }}>
        还没有收藏的算法 · 在算法页点击 ⭐ 即可收藏
      </div>
    )
  }

  // 分组
  const grouped = useMemo(() => {
    const map = {}
    for (const slug of slugList) {
      const folder = folders[slug] || UNGROUPED
      if (!map[folder]) map[folder] = []
      map[folder].push(slug)
    }
    // 把"未分组"放最后
    const sorted = Object.keys(map).sort((a, b) => {
      if (a === UNGROUPED) return 1
      if (b === UNGROUPED) return -1
      return a.localeCompare(b)
    })
    return sorted.map(f => ({ folder: f, slugs: map[f] }))
  }, [slugList, folders])

  const assignFolder = (slug, folderName) => {
    const name = folderName.trim() || UNGROUPED
    setFolders(prev => {
      const next = { ...prev }
      if (name === UNGROUPED) {
        delete next[slug]
      } else {
        next[slug] = name
      }
      return next
    })
    setEditingSlug(null)
  }

  // 所有现有文件夹名（用于快速选择）
  const existingFolders = useMemo(() => {
    const set = new Set(Object.values(folders).filter(Boolean))
    return [...set]
  }, [folders])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {grouped.map(({ folder, slugs }) => (
        <div key={folder}>
          <div style={{
            fontSize: 11, fontWeight: 800, letterSpacing: '0.07em',
            color: 'var(--text-tertiary)', textTransform: 'uppercase',
            marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <span>📁</span>
            <span>{folder}</span>
            <span style={{ fontWeight: 400, letterSpacing: 0 }}>· {slugs.length} 个</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {slugs.map(slug => {
              const algo = ALGORITHMS[slug]
              const isEditing = editingSlug === slug

              return (
                <div key={slug} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 14px', borderRadius: 10,
                  background: 'var(--bg-elev)', border: '1px solid var(--border)',
                }}>
                  <Link to={`/algo/${slug}`} style={{ flex: 1, minWidth: 0, textDecoration: 'none' }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      ⭐ {algo.name}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 1 }}>
                      {algo.nameEn} · {algo.timeComplexity?.average || ''}
                    </div>
                  </Link>

                  {isEditing ? (
                    <div style={{ display: 'flex', gap: 5, alignItems: 'center', flexShrink: 0 }}>
                      <input
                        value={inputVal}
                        onChange={e => setInputVal(e.target.value)}
                        placeholder="文件夹名"
                        autoFocus
                        list={`folder-options-${slug}`}
                        onKeyDown={e => {
                          if (e.key === 'Enter') assignFolder(slug, inputVal)
                          if (e.key === 'Escape') setEditingSlug(null)
                        }}
                        style={{
                          width: 100, padding: '5px 8px', borderRadius: 6,
                          border: '1px solid var(--accent)', background: 'var(--surface)',
                          color: 'var(--text-primary)', fontSize: 12,
                        }}
                      />
                      <datalist id={`folder-options-${slug}`}>
                        {existingFolders.map(f => <option key={f} value={f} />)}
                      </datalist>
                      <button onClick={() => assignFolder(slug, inputVal)} style={{
                        padding: '5px 10px', borderRadius: 6,
                        background: 'var(--accent)', color: 'white',
                        border: 'none', fontSize: 12, cursor: 'pointer',
                      }}>✓</button>
                      <button onClick={() => setEditingSlug(null)} style={{
                        padding: '5px 8px', borderRadius: 6,
                        background: 'var(--surface)', color: 'var(--text-secondary)',
                        border: '1px solid var(--border)', fontSize: 12, cursor: 'pointer',
                      }}>✕</button>
                    </div>
                  ) : (
                    <button onClick={() => { setEditingSlug(slug); setInputVal(folders[slug] || '') }} style={{
                      padding: '4px 10px', borderRadius: 6, flexShrink: 0,
                      background: 'none', color: 'var(--text-tertiary)',
                      border: '1px solid var(--border)', fontSize: 11, cursor: 'pointer',
                    }}>
                      移动
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
