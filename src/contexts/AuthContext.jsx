import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { getSupabase, hasSupabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(hasSupabase)

  useEffect(() => {
    if (!hasSupabase) {
      setLoading(false)
      return
    }
    let mounted = true
    let subscription = null
    getSupabase().then(async client => {
      if (!client || !mounted) return
      const { data } = await client.auth.getSession()
      if (!mounted) return
      setUser(data.session?.user ?? null)
      setLoading(false)
      const { data: sub } = client.auth.onAuthStateChange((_evt, session) => {
        setUser(session?.user ?? null)
      })
      subscription = sub.subscription
    }).catch(() => {
      if (mounted) setLoading(false)
    })
    return () => {
      mounted = false
      subscription?.unsubscribe?.()
    }
  }, [])

  const signInWithGitHub = useCallback(async () => {
    if (!hasSupabase) return { error: new Error('Supabase 未配置') }
    const client = await getSupabase()
    return client.auth.signInWithOAuth({
      provider: 'github',
      options: { redirectTo: window.location.origin },
    })
  }, [])

  const signOut = useCallback(async () => {
    if (!hasSupabase) return
    const client = await getSupabase()
    await client.auth.signOut()
    setUser(null)
  }, [])

  const value = useMemo(() => ({
    user,
    loading,
    enabled: hasSupabase,
    signInWithGitHub,
    signOut,
  }), [user, loading, signInWithGitHub, signOut])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
