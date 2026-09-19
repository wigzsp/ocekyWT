import type { User } from '@supabase/supabase-js'
import { getSupabase, friendlyError } from './supabase'

export async function signIn(email: string, password: string) {
  const { data, error } = await getSupabase().auth.signInWithPassword({ email, password })
  if (error) throw new Error(friendlyError(error, 'Не удалось войти.'))
  return data
}

export async function signOut() {
  const { error } = await getSupabase().auth.signOut()
  if (error) throw new Error(friendlyError(error, 'Не удалось завершить сессию.'))
}

export async function isAdmin(user: User | null) {
  if (!user) return false
  const { data, error } = await getSupabase().rpc('is_admin')
  if (error) return false
  return data === true
}
