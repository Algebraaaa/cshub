// ─────────────────────────────────────────────────────────────
// Supabase 客户端（可选）
// 未配置 VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY 时返回 null，
// 上层逻辑会自动降级为纯 localStorage 模式（不破坏单机使用）。
// ─────────────────────────────────────────────────────────────
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

export const hasSupabase = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY)

let client = null
let clientPromise = null

export async function getSupabase() {
  if (!hasSupabase) return null
  if (client) return client
  if (!clientPromise) {
    clientPromise = import('@supabase/supabase-js').then(({ createClient }) => {
      client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      })
      return client
    })
  }
  return clientPromise
}

if (!hasSupabase && typeof window !== 'undefined') {
  // 仅在浏览器侧打印一次轻提示，方便开发联调
  const w = /** @type {any} */ (window)  // 挂一个一次性标志，非标准 window 属性
  if (!w.__cshub_supabase_warned) {
    w.__cshub_supabase_warned = true
    console.info(
      '[CS Hub] Supabase 未配置（VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY 未设置）。\n' +
      '当前以单机模式运行，进度仅保存在 localStorage。'
    )
  }
}
