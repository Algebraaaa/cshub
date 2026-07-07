import { getSupabase, hasSupabase } from '../../lib/supabase'

// ─────────────────────────────────────────────────────────────
// RemoteStore · Supabase 适配层（Adapter）
//
// 把 user_progress / user_quiz_scores 两张表的拉取 / upsert / 删除 /
// realtime 订阅封装为单一接口。当 hasSupabase=false 时所有方法变成
// no-op / 返回 null，调用方无需关心 Supabase 是否配置。
//
// 为方便测试，全部函数都是无状态纯函数 + 一个标志位 enabled。
// ─────────────────────────────────────────────────────────────

export const enabled = hasSupabase

export async function fetchProgress(userId) {
  if (!enabled) return null
  let progRes, quizRes
  try {
    const client = await getSupabase()
    ;[progRes, quizRes] = await Promise.all([
      client.from('user_progress').select('slug, completed, favorited, updated_at').eq('user_id', userId),
      client.from('user_quiz_scores').select('slug, attempted, correct, total, last_at').eq('user_id', userId),
    ])
  } catch (err) {
    console.warn('[RemoteStore] fetchProgress 网络异常，跳过本次同步：', err)
    return null
  }
  // 任一表读取失败都按"拉取失败"处理（返回 null → 跳过合并），
  // 否则半空的远端快照会让合并结果把远端更高的测验分数覆盖掉。
  if (progRes.error || quizRes.error) {
    console.warn('[RemoteStore] fetchProgress 查询失败：', progRes.error || quizRes.error)
    return null
  }
  const favorites = new Set()
  const completed = new Set()
  // rows 保留每行完整状态 + updated_at 时间戳，供 SyncService 做 LWW 合并
  // （favorited=false 的行本身就是"取消收藏"的证据，不能丢）
  const rows = {}
  for (const row of progRes.data || []) {
    if (row.favorited) favorites.add(row.slug)
    if (row.completed) completed.add(row.slug)
    rows[row.slug] = {
      favorited: !!row.favorited,
      completed: !!row.completed,
      at: row.updated_at ? new Date(row.updated_at).getTime() : 0,
    }
  }
  const quizScores = {}
  for (const row of quizRes.data || []) {
    quizScores[row.slug] = {
      attempted: row.attempted || 0,
      correct: row.correct || 0,
      total: row.total || 0,
      lastAt: row.last_at ? new Date(row.last_at).getTime() : 0,
    }
  }
  return { favorites, completed, quizScores, rows }
}

export async function pushProgressRow(userId, slug, payload) {
  if (!enabled) return
  const client = await getSupabase()
  return client.from('user_progress').upsert({
    user_id: userId,
    slug,
    completed: payload.completed,
    favorited: payload.favorited,
    // LWW：updated_at 用真实修改时刻（payload.at），而非推送时刻——
    // 防抖/重试的延迟不应改变"谁更新"的裁决
    updated_at: new Date(payload.at || Date.now()).toISOString(),
  }, { onConflict: 'user_id,slug' })
}

export async function pushQuizRow(userId, slug, score) {
  if (!enabled) return
  const client = await getSupabase()
  return client.from('user_quiz_scores').upsert({
    user_id: userId,
    slug,
    attempted: score.attempted,
    correct: score.correct,
    total: score.total,
    last_at: new Date(score.lastAt || Date.now()).toISOString(),
  }, { onConflict: 'user_id,slug' })
}

export async function clearAll(userId) {
  if (!enabled) return
  const client = await getSupabase()
  await Promise.allSettled([
    client.from('user_progress').delete().eq('user_id', userId),
    client.from('user_quiz_scores').delete().eq('user_id', userId),
  ])
}

// 订阅指定 user 的 realtime 变更。handler 收到 patch 形态：
//   { progress: { slug, favorited, completed }, event: 'DELETE'|'UPSERT' }
//   { quiz: { slug, attempted, correct, total, lastAt } }
export function subscribeRealtime(userId, handler) {
  if (!enabled || !userId) return () => {}
  let cancelled = false
  let channel = null
  getSupabase().then(client => {
    if (!client || cancelled) return
    channel = client.channel(`progress-${userId}`)
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'user_progress', filter: `user_id=eq.${userId}` },
        (payload) => {
          const row = payload.new || payload.old
          if (!row?.slug) return
          handler({
            progress: {
              slug: row.slug,
              favorited: row.favorited,
              completed: row.completed,
              at: row.updated_at ? new Date(row.updated_at).getTime() : Date.now(),
            },
            event: payload.eventType === 'DELETE' ? 'DELETE' : 'UPSERT',
          })
        })
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'user_quiz_scores', filter: `user_id=eq.${userId}` },
        (payload) => {
          const row = payload.new
          if (!row?.slug) return
          handler({
            quiz: {
              slug: row.slug,
              attempted: row.attempted || 0,
              correct: row.correct || 0,
              total: row.total || 0,
              lastAt: row.last_at ? new Date(row.last_at).getTime() : Date.now(),
            },
          })
        })
      .subscribe()
  })
  return () => {
    cancelled = true
    if (!channel) return
    getSupabase().then(client => {
      if (client && channel) client.removeChannel(channel)
    }).catch(() => {})
  }
}
