import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { User } from '@supabase/supabase-js'
import { isAdmin as checkAdmin, signOut as requestSignOut } from '../lib/auth'
import { getSupabase, isSupabaseConfigured } from '../lib/supabase'

type AuthContextValue = {
  user: User | null
  isAdmin: boolean
  ready: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [admin, setAdmin] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!isSupabaseConfigured) { setReady(true); return }
    let alive = true
    const applySession = async (nextUser: User | null) => {
      const nextAdmin = await checkAdmin(nextUser)
      if (alive) { setUser(nextUser); setAdmin(nextAdmin); setReady(true) }
    }
    const supabase = getSupabase()
    void supabase.auth.getSession().then(({ data }) => applySession(data.session?.user ?? null))
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => { void applySession(session?.user ?? null) })
    return () => { alive = false; listener.subscription.unsubscribe() }
  }, [])

  const signOut = async () => { await requestSignOut(); setUser(null); setAdmin(false) }
  return <AuthContext.Provider value={{ user, isAdmin: admin, ready, signOut }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const value = useContext(AuthContext)
  if (!value) throw new Error('useAuth должен использоваться внутри AuthProvider')
  return value
}
