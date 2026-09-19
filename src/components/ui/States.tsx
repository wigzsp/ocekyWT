import { AlertTriangle, Inbox, WifiOff } from 'lucide-react'
import type { ReactNode } from 'react'

export function LoadingCard({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-slate-800/70 ${className}`} />
}

export function EmptyState({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return <section className="panel rounded-xl px-6 py-14 text-center">
    <Inbox className="mx-auto h-9 w-9 text-slate-500" aria-hidden="true" />
    <h2 className="mt-4 text-lg font-semibold">{title}</h2>
    <p className="mx-auto mt-2 max-w-md text-sm text-slate-400">{description}</p>
    {action && <div className="mt-5">{action}</div>}
  </section>
}

export function ErrorState({ message, retry }: { message: string; retry?: () => void }) {
  const offline = typeof navigator !== 'undefined' && !navigator.onLine
  return <section role="alert" className="panel rounded-xl border-rose-400/30 px-6 py-10 text-center">
    {offline ? <WifiOff className="mx-auto h-8 w-8 text-rose-300" /> : <AlertTriangle className="mx-auto h-8 w-8 text-rose-300" />}
    <h2 className="mt-3 font-semibold">Не удалось загрузить данные</h2>
    <p className="mx-auto mt-2 max-w-lg text-sm text-slate-400">{offline ? 'Проверьте подключение к интернету и попробуйте ещё раз.' : message}</p>
    {retry && <button className="btn-secondary mt-5" onClick={retry}>Повторить</button>}
  </section>
}
