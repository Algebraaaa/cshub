import { useState, useEffect } from 'react'

const GOAL_KEY = 'algoviz-goal'

function loadGoal() {
  try {
    const raw = localStorage.getItem(GOAL_KEY)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

function saveGoal(goal) {
  try { localStorage.setItem(GOAL_KEY, JSON.stringify(goal)) } catch { /* ignore */ }
}

export default function GoalWidget({ completed }) {
  const [goal, setGoal]       = useState(() => loadGoal())
  const [editing, setEditing] = useState(false)
  const [text, setText]       = useState('')
  const [target, setTarget]   = useState(10)

  useEffect(() => {
    if (goal) saveGoal(goal)
  }, [goal])

  const handleSave = () => {
    if (target < 1) return
    const g = {
      text: text.trim() || `学完 ${target} 个算法`,
      targetCount: target,
      createdAt: Date.now(),
    }
    setGoal(g)
    setEditing(false)
  }

  const handleEdit = () => {
    setText(goal?.text || '')
    setTarget(goal?.targetCount || 10)
    setEditing(true)
  }

  const handleDelete = () => {
    setGoal(null)
    try { localStorage.removeItem(GOAL_KEY) } catch { /* ignore */ }
    setEditing(false)
  }

  const progress = goal ? Math.min(completed.size, goal.targetCount) : 0
  const pct      = goal ? Math.round((progress / goal.targetCount) * 100) : 0
  const done     = pct >= 100

  if (editing || !goal) {
    return (
      <div style={{
        padding: 18, borderRadius: 14,
        background: 'var(--bg-elev)', border: '1px solid var(--border)',
      }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 14 }}>
          {goal ? '修改学习目标' : '设定学习目标'}
        </div>

        <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
          目标描述（留空则自动生成）
        </label>
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder={`例：期末前学完 20 个算法`}
          style={{
            width: '100%', boxSizing: 'border-box',
            padding: '8px 12px', borderRadius: 8,
            border: '1px solid var(--border)', background: 'var(--surface)',
            color: 'var(--text-primary)', fontSize: 13, marginBottom: 12,
          }}
        />

        <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
          目标算法数量
        </label>
        <input
          type="number" min={1} max={500}
          value={target}
          onChange={e => setTarget(Math.max(1, Number(e.target.value)))}
          style={{
            width: 80, padding: '7px 10px', borderRadius: 8,
            border: '1px solid var(--border)', background: 'var(--surface)',
            color: 'var(--text-primary)', fontSize: 13, marginBottom: 16,
          }}
        />

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button onClick={handleSave} style={{
            padding: '8px 18px', borderRadius: 8,
            background: 'var(--accent)', color: 'white',
            border: 'none', fontSize: 12, fontWeight: 700, cursor: 'pointer',
          }}>
            保存目标
          </button>
          {goal && (
            <button onClick={() => setEditing(false)} style={{
              padding: '8px 14px', borderRadius: 8,
              background: 'var(--surface)', color: 'var(--text-secondary)',
              border: '1px solid var(--border)', fontSize: 12, cursor: 'pointer',
            }}>
              取消
            </button>
          )}
          {goal && (
            <button onClick={handleDelete} style={{
              padding: '8px 14px', borderRadius: 8,
              background: 'transparent', color: 'var(--red)',
              border: '1px solid var(--red)', fontSize: 12, cursor: 'pointer',
              marginLeft: 'auto',
            }}>
              删除目标
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div style={{
      padding: '16px 18px', borderRadius: 14,
      background: done ? 'var(--green-soft)' : 'var(--bg-elev)',
      border: `1px solid ${done ? 'var(--green)' : 'var(--border)'}`,
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 10 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.4 }}>
            🎯 {goal.text}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 3 }}>
            已完成 {progress} / {goal.targetCount} 个算法
            {done && <span style={{ color: 'var(--green)', fontWeight: 700, marginLeft: 6 }}>目标达成！🎉</span>}
          </div>
        </div>
        <button onClick={handleEdit} style={{
          fontSize: 11, color: 'var(--text-tertiary)', background: 'none',
          border: '1px solid var(--border)', borderRadius: 6,
          padding: '4px 10px', cursor: 'pointer', flexShrink: 0,
        }}>
          修改
        </button>
      </div>

      {/* 进度条 */}
      <div style={{ height: 8, borderRadius: 99, background: 'var(--surface-3)', overflow: 'hidden' }}>
        <div style={{
          height: '100%', borderRadius: 99,
          width: `${pct}%`,
          background: done
            ? 'linear-gradient(90deg, #22c55e, #16a34a)'
            : 'linear-gradient(90deg, #a855f7, #ec4899)',
          transition: 'width 0.5s cubic-bezier(0.22,1,0.36,1)',
        }} />
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 6 }}>
        <span style={{
          fontSize: 11, fontFamily: 'var(--font-mono)', fontWeight: 800,
          color: done ? 'var(--green)' : 'var(--accent-light)',
        }}>
          {pct}%
        </span>
      </div>
    </div>
  )
}
