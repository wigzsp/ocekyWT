import { LockKeyhole, LogIn } from 'lucide-react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { isAdmin as checkAdmin, signIn } from '../lib/auth'
import { isSupabaseConfigured } from '../lib/supabase'
import { usePageMeta } from '../hooks/usePageMeta'

export default function AdminLogin() {
  usePageMeta('Вход администратора | ocekyWT')
  const { user, isAdmin, ready, signOut } = useAuth()
  const location = useLocation(); const navigate = useNavigate()
  const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [error, setError] = useState<string | null>(null); const [loading, setLoading] = useState(false)
  if (ready && user && isAdmin) return <Navigate to={(location.state as { from?: string } | null)?.from || '/admin'} replace />
  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setError(null); setLoading(true)
    try {
      const data = await signIn(email, password)
      const permitted = await checkAdmin(data.user)
      if (!permitted) { await signOut(); throw new Error('Этот пользователь не добавлен в admin_users и не имеет доступа к панели.') }
      navigate((location.state as { from?: string } | null)?.from || '/admin', { replace: true })
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Не удалось войти.') }
    finally { setLoading(false) }
  }
  return <main className="grid min-h-screen place-items-center bg-[radial-gradient(circle_at_50%_0%,rgba(51,137,181,.18),transparent_35%),#080b0f] p-4"><section className="panel w-full max-w-md rounded-xl p-6 sm:p-8"><div className="flex items-center gap-3"><div className="rounded-lg bg-ice/15 p-3 text-ice"><LockKeyhole className="h-6 w-6" /></div><div><p className="font-black text-white">oceky<span className="text-ice">WT</span></p><p className="text-xs text-slate-500">Защищённая админ-панель</p></div></div><h1 className="mt-8 text-2xl font-black">Вход</h1><p className="mt-2 text-sm leading-6 text-slate-400">Используйте Email/Password пользователя, который добавлен в таблицу <code className="text-slate-300">admin_users</code>.</p>{!isSupabaseConfigured ? <p role="alert" className="mt-5 rounded border border-rose-400/40 bg-rose-400/10 p-3 text-sm text-rose-100">Supabase не настроен. Добавьте значения в .env.</p> : <form onSubmit={submit} className="mt-6 space-y-4"><label className="block"><span className="label">Email</span><input value={email} onChange={(event) => setEmail(event.target.value)} className="field" type="email" autoComplete="email" required /></label><label className="block"><span className="label">Пароль</span><input value={password} onChange={(event) => setPassword(event.target.value)} className="field" type="password" autoComplete="current-password" required /></label>{error && <p role="alert" className="rounded border border-rose-400/40 bg-rose-400/10 p-3 text-sm text-rose-100">{error}</p>}<button className="btn-primary w-full" disabled={loading}><LogIn className="h-4 w-4" />{loading ? 'Проверка…' : 'Войти'}</button></form>}</section></main>
}
