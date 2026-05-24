import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ALGORITHMS } from '../../data/algorithmMeta'

export const WRONG_Q_KEY = 'algoviz-wrong-questions'

export function loadWrongQuestions() {
  try {
    const raw = localStorage.getItem(WRONG_Q_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch { return {} }
}

export function saveWrongForSlug(slug, wrongIndices) {
  try {
    const current = loadWrongQuestions()
    if (wrongIndices.length === 0) {
      delete current[slug]
    } else {
      current[slug] = wrongIndices
    }
    localStorage.setItem(WRONG_Q_KEY, JSON.stringify(current))
  } catch { /* ignore */ }
}

export default function WrongAnswers({ quizScores }) {
  const wrongData = useMemo(() => loadWrongQuestions(), [quizScores])

  const wrongSlugs = useMemo(() =>
    Object.entries(quizScores)
      .filter(([, s]) => s.correct < s.total)
      .sort((a, b) => (b[1].lastAt || 0) - (a[1].lastAt || 0))
      .map(([slug]) => slug),
    [quizScores]
  )

  if (wrongSlugs.length === 0) {
    return (
      <div style={{
        padding: '16px 20px', borderRadius: 12,
        background: 'var(--surface)', border: '1px dashed var(--border)',
        color: 'var(--text-tertiary)', fontSize: 13, textAlign: 'center',
      }}>
        暂无错题 · 所有已做测验均已全部答对 🎉
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 4 }}>
        共 {wrongSlugs.length} 个算法有错题，点击可直接重做
      </div>
      {wrongSlugs.map(slug => {
        const score = quizScores[slug]
        const algo = ALGORITHMS[slug]
        if (!algo) return null
        const wrongCount = score.total - score.correct
        const wrongIndices = wrongData[slug] || []

        return (
          <Link key={slug} to={`/algo/${slug}#tab=quiz`} style={{ textDecoration: 'none' }}>
            <div style={{
              padding: '12px 16px', borderRadius: 12,
              background: 'var(--bg-elev)', border: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', gap: 14,
              transition: 'all 0.15s',
            }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'var(--red)'
                e.currentTarget.style.transform = 'translateY(-1px)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--border)'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              <div style={{
                width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                background: 'var(--red-soft)', border: '1px solid var(--red)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
              }}>✗</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {algo.name}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>
                  {wrongIndices.length > 0
                    ? `第 ${wrongIndices.map(i => i + 1).join('、')} 题答错 · 点击重做`
                    : `错了 ${wrongCount} / ${score.total} 题 · 点击重做`}
                </div>
              </div>
              <div style={{
                fontSize: 12, fontWeight: 800, fontFamily: 'var(--font-mono)',
                color: 'var(--red)', background: 'var(--red-soft)',
                padding: '3px 10px', borderRadius: 99, flexShrink: 0,
              }}>
                {score.correct}/{score.total}
              </div>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
