import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useProgress } from '../contexts/ProgressContext'
import { useAchievements } from '../contexts/AchievementsContext'
import { ACHIEVEMENT_LIST, TIER_META } from '../data/achievements'
import { SUBJECT_LIST, getSubjectStats } from '../data/subjects'
import { ALGORITHM_LIST, ALGORITHMS } from '../data/algorithmMeta'
import { getRecentAlgoSlug } from '../services/recents'
import LearningHeatmap from '../components/profile/LearningHeatmap'
import Recommendations from '../components/profile/Recommendations'
import WeeklyReport from '../components/profile/WeeklyReport'
import GoalWidget from '../components/profile/GoalWidget'
import WrongAnswers from '../components/profile/WrongAnswers'
import FavoritesPanel from '../components/profile/FavoritesPanel'

export default function ProfilePage() {
  const { user, enabled } = useAuth()
  const { completed, favorites, quizScores, quizStats, clearAll } = useProgress()
  const { streak, unlocked } = useAchievements()

  const subjectStats = useMemo(
    () => SUBJECT_LIST.map(s => ({ subject: s, stats: getSubjectStats(s.id, completed) })),
    [completed]
  )

  const sortedAch = useMemo(() => {
    return [...ACHIEVEMENT_LIST].sort((a, b) => {
      const ua = unlocked.has(a.id) ? 0 : 1
      const ub = unlocked.has(b.id) ? 0 : 1
      if (ua !== ub) return ua - ub
      return 0
    })
  }, [unlocked])

  const total = ALGORITHM_LIST.length
  const pct = total ? Math.round((completed.size / total) * 100) : 0

  const displayName = user?.user_metadata?.full_name || user?.user_metadata?.user_name || user?.email || '本地访客'
  const avatar = user?.user_metadata?.avatar_url

  const recentSlug = getRecentAlgoSlug()
  const recentAlgo = recentSlug ? ALGORITHMS[recentSlug] : null

  return (
    <div style={{ maxWidth: 1080, margin: '0 auto', padding: '40px 32px 120px' }}>
      <Hero displayName={displayName} avatar={avatar} streak={streak} pct={pct} done={completed.size} total={total} loggedIn={!!user} authEnabled={enabled} />

      <Section title="本周周报">
        <WeeklyReport quizScores={quizScores} streak={streak} completed={completed} />
      </Section>

      <Section title="学习目标">
        <GoalWidget completed={completed} />
      </Section>

      {recentAlgo && (
        <Section title="继续学习">
          <Link to={`/algo/${recentAlgo.slug}`}
            className="flex items-center gap-4 rounded-2xl border border-glass-border bg-surface-mid p-4 backdrop-blur-xl transition-all hover:-translate-y-px">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent-soft text-base font-extrabold text-accent-light">
              CS
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[15px] font-bold text-fg">{recentAlgo.name}</span>
              <span className="block text-[12px] text-fg-faint">{recentAlgo.nameEn} · {recentAlgo.timeComplexity?.average}</span>
            </span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-fg-muted">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </Link>
        </Section>
      )}

      <Section title="推荐与复习">
        <Recommendations completed={completed} quizScores={quizScores} />
      </Section>

      <Section title="学习活动">
        <div className="glass-card">
          <LearningHeatmap quizScores={quizScores} />
        </div>
      </Section>

      <Section title="徽章墙" eyebrow={`${unlocked.size} / ${ACHIEVEMENT_LIST.length}`}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))',
          gap: 12,
        }}>
          {sortedAch.map(a => {
            const got = unlocked.has(a.id)
            const tier = TIER_META[a.tier] || TIER_META.bronze
            return (
              <div key={a.id} style={{
                padding: 14,
                borderRadius: 14,
                background: got ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.02)',
                border: `1px solid ${got ? a.color + '55' : 'var(--glass-border)'}`,
                opacity: got ? 1 : 0.45,
                filter: got ? 'none' : 'grayscale(0.6)',
                transition: 'all 0.2s',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: 12,
                    background: `${a.color}22`, color: a.color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 20, flexShrink: 0,
                  }}>{a.icon}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.name}</div>
                    <span style={{
                      display: 'inline-block', marginTop: 2,
                      fontSize: 9, padding: '1px 6px', borderRadius: 99,
                      background: tier.bg, color: tier.color, fontWeight: 800, letterSpacing: '0.04em',
                    }}>{tier.label}</span>
                  </div>
                </div>
                <div style={{ marginTop: 8, fontSize: 11.5, color: 'var(--text-tertiary)', lineHeight: 1.5 }}>{a.desc}</div>
              </div>
            )
          })}
        </div>
      </Section>

      <Section title="学科进度">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 14,
        }}>
          {subjectStats.map(({ subject, stats }) => {
            const disabled = !subject.available
            return (
              <div key={subject.id} style={{
                padding: 16,
                borderRadius: 14,
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid var(--glass-border)',
                opacity: disabled ? 0.55 : 1,
                display: 'flex', flexDirection: 'column', gap: 10,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 10,
                    background: subject.gradient,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 16, flexShrink: 0,
                  }}>{subject.icon}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)' }}>{subject.name}</div>
                    <div style={{ fontSize: 10.5, color: 'var(--text-tertiary)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {disabled ? '敬请期待' : `${stats.done} / ${stats.total}`}
                    </div>
                  </div>
                  <span style={{ fontSize: 13, color: subject.color, fontWeight: 800, fontFamily: 'var(--font-mono)' }}>{stats.pct}%</span>
                </div>
                <div style={{ height: 5, borderRadius: 99, background: 'var(--surface-3)', overflow: 'hidden' }}>
                  <div style={{ width: `${stats.pct}%`, height: '100%', background: subject.gradient }} />
                </div>
              </div>
            )
          })}
        </div>
      </Section>

      <Section title="收藏夹" eyebrow={`${favorites.size} 个`}>
        <FavoritesPanel favorites={favorites} />
      </Section>

      <Section title="测验统计">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: 12,
        }}>
          <Stat label="收藏" value={favorites.size} color="#fbbf24" />
          <Stat label="已答题" value={Object.keys(quizScores).length} color="#22c55e" />
          <Stat label="题目数" value={quizStats.totalQuestions} color="#38bdf8" />
          <Stat label="正确率" value={Math.round(quizStats.accuracy * 100)} suffix="%" color="#ec4899" />
        </div>
      </Section>

      <Section title="错题本" eyebrow={`${Object.entries(quizScores).filter(([,s]) => s.correct < s.total).length} 个算法`}>
        <WrongAnswers quizScores={quizScores} />
      </Section>

      <div style={{ marginTop: 32, textAlign: 'center' }}>
        <button onClick={() => { if (confirm('确认清空所有进度？此操作不可撤销。')) clearAll() }}
          style={{
            padding: '8px 20px',
            border: '1px solid var(--border)',
            background: 'transparent',
            color: 'var(--text-tertiary)',
            fontSize: 12,
            borderRadius: 99,
            cursor: 'pointer',
          }}>
          清空全部进度
        </button>
      </div>
    </div>
  )
}

function Hero({ displayName, avatar, streak, pct, done, total, loggedIn, authEnabled }) {
  return (
    <div style={{
      padding: 28,
      borderRadius: 24,
      background: 'var(--glass-bg-mid)',
      backdropFilter: 'blur(40px) saturate(200%)',
      WebkitBackdropFilter: 'blur(40px) saturate(200%)',
      border: '1px solid var(--glass-border-strong)',
      boxShadow: '0 16px 48px rgba(0,0,0,0.14), inset 0 1px 1px rgba(255,255,255,0.18)',
      display: 'flex',
      alignItems: 'center',
      gap: 20,
      flexWrap: 'wrap',
    }}>
      <div style={{
        width: 76, height: 76, borderRadius: '50%',
        background: avatar ? `center/cover no-repeat url(${avatar})` : 'linear-gradient(135deg, #a855f7, #38bdf8)',
        color: 'white', fontSize: 30, fontWeight: 800,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 8px 24px rgba(168,85,247,0.35)',
        flexShrink: 0,
      }}>
        {!avatar && (displayName.charAt(0).toUpperCase())}
      </div>
      <div style={{ flex: 1, minWidth: 220 }}>
        <Link to="/" style={{ fontSize: 11, color: 'var(--text-tertiary)', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          ← 返回首页
        </Link>
        <h1 style={{ fontSize: 28, fontWeight: 800, margin: '4px 0 6px' }}>{displayName}</h1>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
          {loggedIn ? '已登录 · 跨设备同步中' : (authEnabled ? '未登录 · 进度仅保存在本地' : '单机模式 · 配置 Supabase 启用云同步')}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 12 }}>
        <StatPill icon="🔥" label="连续" value={streak.currentStreak} unit="天" color="#f97316" />
        <StatPill icon="🏆" label="最长" value={streak.longestStreak} unit="天" color="#fbbf24" />
        <StatPill icon="✓" label="已学" value={done} unit={`/${total}`} color="#a855f7" extra={`${pct}%`} />
      </div>
    </div>
  )
}

function StatPill({ icon, label, value, unit, color, extra }) {
  return (
    <div style={{
      minWidth: 96,
      padding: '10px 14px',
      borderRadius: 14,
      background: 'rgba(255,255,255,0.04)',
      border: `1px solid ${color}33`,
      textAlign: 'center',
    }}>
      <div style={{ fontSize: 18, marginBottom: 2 }}>{icon}</div>
      <div style={{ fontSize: 10, color: 'var(--text-tertiary)', fontWeight: 700, letterSpacing: '0.06em' }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 3, marginTop: 2 }}>
        <span style={{ fontSize: 20, fontWeight: 800, fontFamily: 'var(--font-mono)', color }}>{value}</span>
        <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{unit}</span>
      </div>
      {extra && <div style={{ fontSize: 10, color: 'var(--text-tertiary)', marginTop: 2, fontFamily: 'var(--font-mono)' }}>{extra}</div>}
    </div>
  )
}

function Section({ title, eyebrow, children }) {
  return (
    <section style={{ marginTop: 28 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, marginBottom: 14 }}>
        <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>{title}</h2>
        {eyebrow && <span style={{ fontSize: 12, color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{eyebrow}</span>}
      </div>
      {children}
    </section>
  )
}

function Stat({ label, value, suffix = '', color }) {
  return (
    <div style={{
      padding: '14px 16px',
      borderRadius: 14,
      background: 'rgba(255,255,255,0.04)',
      border: '1px solid var(--glass-border)',
      borderLeft: `3px solid ${color}`,
    }}>
      <div style={{ fontSize: 11, color: 'var(--text-tertiary)', fontWeight: 700, letterSpacing: '0.06em' }}>{label}</div>
      <div style={{ marginTop: 4, fontSize: 24, fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--text-primary)' }}>{value}<span style={{ fontSize: 13, color: 'var(--text-tertiary)', marginLeft: 4 }}>{suffix}</span></div>
    </div>
  )
}
