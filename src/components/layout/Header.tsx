import { Menu, ShieldCheck, X } from 'lucide-react'
import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'

const funpayProfileUrl = import.meta.env.VITE_FUNPAY_PROFILE_URL || 'https://funpay.com/users/21503962/'

const linkStyle = ({ isActive }: { isActive: boolean }) =>
  `text-sm transition hover:text-white ${isActive ? 'text-white' : 'text-slate-400'}`

export function Header() {
  const [open, setOpen] = useState(false)
  return <header className="sticky top-0 z-30 border-b border-slate-800/90 bg-ink/90 backdrop-blur">
    <div className="shell flex h-16 items-center justify-between gap-5">
      <Link to="/" className="text-lg font-black tracking-tight text-white" aria-label="ocekyWT — на главную">oceky<span className="text-ice">WT</span></Link>
      <nav className="hidden items-center gap-7 md:flex" aria-label="Основная навигация">
        <NavLink to="/" end className={linkStyle}>Главная</NavLink>
        <NavLink to="/catalog" className={linkStyle}>Каталог</NavLink>
        <NavLink to="/admin" className={linkStyle}><span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5" />Админ</span></NavLink>
      </nav>
      <a href={funpayProfileUrl} target="_blank" rel="noreferrer" className="btn-secondary hidden py-2 md:inline-flex">FunPay</a>
      <button onClick={() => setOpen((value) => !value)} className="rounded-md p-2 text-slate-200 hover:bg-slate-800 md:hidden" aria-label={open ? 'Закрыть меню' : 'Открыть меню'} aria-expanded={open}>
        {open ? <X /> : <Menu />}
      </button>
    </div>
    {open && <nav className="shell flex flex-col gap-1 border-t border-slate-800 py-3 md:hidden" aria-label="Мобильная навигация">
      <NavLink onClick={() => setOpen(false)} to="/" end className={`${linkStyle} rounded px-2 py-2`}>Главная</NavLink>
      <NavLink onClick={() => setOpen(false)} to="/catalog" className={`${linkStyle} rounded px-2 py-2`}>Каталог</NavLink>
      <NavLink onClick={() => setOpen(false)} to="/admin" className={`${linkStyle} rounded px-2 py-2`}>Админ-панель</NavLink>
      <a href={funpayProfileUrl} target="_blank" rel="noreferrer" className="rounded px-2 py-2 text-sm text-slate-400 hover:text-white">Перейти на FunPay</a>
    </nav>}
  </header>
}
