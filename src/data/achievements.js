// ─────────────────────────────────────────────────────────────
// 徽章定义：纯客户端规则评估。
// check({ completed, favorites, quizScores, streak, subjectStats }) → boolean
// subjectStats: { algo: { total, done, pct }, os: ..., ... }
// ─────────────────────────────────────────────────────────────
export const ACHIEVEMENTS = {
  // ─── 起步 ──
  'first-step': {
    id: 'first-step',
    name: '初学乍练',
    desc: '完成第一个算法',
    icon: '🌱',
    color: '#22c55e',
    tier: 'bronze',
    check: ({ completed }) => completed.size >= 1,
  },
  'rookie-5': {
    id: 'rookie-5',
    name: '新手村毕业',
    desc: '完成 5 个算法',
    icon: '🎓',
    color: '#38bdf8',
    tier: 'bronze',
    check: ({ completed }) => completed.size >= 5,
  },
  'apprentice-15': {
    id: 'apprentice-15',
    name: '初窥门径',
    desc: '完成 15 个算法',
    icon: '⚔️',
    color: '#a855f7',
    tier: 'silver',
    check: ({ completed }) => completed.size >= 15,
  },
  'expert-30': {
    id: 'expert-30',
    name: '小有所成',
    desc: '完成 30 个算法',
    icon: '🏅',
    color: '#f59e0b',
    tier: 'silver',
    check: ({ completed }) => completed.size >= 30,
  },
  'master-all': {
    id: 'master-all',
    name: '全数据库',
    desc: '完成所有算法（含未来上线的也是）',
    icon: '👑',
    color: '#ec4899',
    tier: 'gold',
    check: ({ completed, totalAlgorithms }) => totalAlgorithms > 0 && completed.size >= totalAlgorithms,
  },

  // ─── 学科广度 ──
  'subject-3': {
    id: 'subject-3',
    name: '跨学科生',
    desc: '3 个学科各完成至少 1 题',
    icon: '🧭',
    color: '#0ea5e9',
    tier: 'silver',
    check: ({ subjectStats }) => Object.values(subjectStats).filter(s => s.done > 0).length >= 3,
  },
  'algo-half': {
    id: 'algo-half',
    name: '算法达半',
    desc: '算法学科完成度 ≥ 50%',
    icon: '🧮',
    color: '#a855f7',
    tier: 'silver',
    check: ({ subjectStats }) => (subjectStats.algo?.pct || 0) >= 50,
  },

  // ─── 测验类 ──
  'quiz-first': {
    id: 'quiz-first',
    name: '提笔即来',
    desc: '完成第一次课后测验',
    icon: '✏️',
    color: '#22c55e',
    tier: 'bronze',
    check: ({ quizScores }) => Object.keys(quizScores || {}).length >= 1,
  },
  'quiz-perfect-5': {
    id: 'quiz-perfect-5',
    name: '满分专业户',
    desc: '5 次测验拿到满分',
    icon: '💯',
    color: '#ec4899',
    tier: 'gold',
    check: ({ quizScores }) => Object.values(quizScores || {}).filter(s => s && s.total > 0 && s.correct === s.total).length >= 5,
  },

  // ─── 收藏类 ──
  'collector': {
    id: 'collector',
    name: '收藏家',
    desc: '收藏 5 个算法',
    icon: '⭐',
    color: '#fbbf24',
    tier: 'bronze',
    check: ({ favorites }) => favorites.size >= 5,
  },

  // ─── 打卡类 ──
  'streak-3': {
    id: 'streak-3',
    name: '三日坚持',
    desc: '连续学习 3 天',
    icon: '🔥',
    color: '#f97316',
    tier: 'bronze',
    check: ({ streak }) => (streak?.currentStreak || 0) >= 3,
  },
  'streak-7': {
    id: 'streak-7',
    name: '七日不辍',
    desc: '连续学习 7 天',
    icon: '🔥',
    color: '#ef4444',
    tier: 'silver',
    check: ({ streak }) => (streak?.currentStreak || streak?.longestStreak || 0) >= 7,
  },
  'streak-30': {
    id: 'streak-30',
    name: '月历常客',
    desc: '历史最长连续 ≥ 30 天',
    icon: '🌟',
    color: '#ec4899',
    tier: 'gold',
    check: ({ streak }) => (streak?.longestStreak || 0) >= 30,
  },
}

export const ACHIEVEMENT_LIST = Object.values(ACHIEVEMENTS)

export const TIER_META = {
  bronze: { label: '青铜', color: '#cd7f32', bg: 'rgba(205,127,50,0.16)' },
  silver: { label: '白银', color: '#9ca3af', bg: 'rgba(156,163,175,0.16)' },
  gold:   { label: '黄金', color: '#fbbf24', bg: 'rgba(251,191,36,0.18)' },
}

export function evaluateAchievements(state) {
  const unlocked = new Set()
  for (const a of ACHIEVEMENT_LIST) {
    try {
      if (a.check(state)) unlocked.add(a.id)
    } catch { /* ignore */ }
  }
  return unlocked
}
