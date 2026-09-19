import { ArrowLeft, Radar } from 'lucide-react'
import { Link } from 'react-router-dom'
import { usePageMeta } from '../hooks/usePageMeta'

export default function NotFound() {
  usePageMeta('Страница не найдена | ocekyWT')
  return <div className="shell grid min-h-[65vh] place-items-center py-14"><section className="text-center"><Radar className="mx-auto h-14 w-14 text-ice" /><p className="mt-5 text-sm font-bold tracking-[.2em] text-slate-500">404</p><h1 className="mt-2 text-3xl font-black">Страница не найдена</h1><p className="mt-3 text-slate-400">Проверьте адрес или вернитесь к каталогу аккаунтов.</p><Link to="/" className="btn-primary mt-7"><ArrowLeft className="h-4 w-4" />На главную</Link></section></div>
}
