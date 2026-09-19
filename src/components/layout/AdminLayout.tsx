import { BarChart3, LayoutDashboard, LogOut, Menu, PackagePlus, PackageSearch, X } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../ui/Toast'

const adminLinks = [
  { to: '/admin', label: 'Обзор', icon: LayoutDashboard, end: true },
  { to: '/admin/products', label: 'Товары', icon: PackageSearch },
  { to: '/admin/products/new', label: 'Новый товар', icon: PackagePlus },
  { to: '/admin/analytics', label: 'Аналитика', icon: BarChart3 },
]

export function AdminLayout({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { user, signOut } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const logOut = async () => {
    try { await signOut(); showToast('Сессия администратора завершена.', 'success'); navigate('/admin/login') }
    catch { showToast('Не удалось завершить сессию.', 'error') }
  }
  const navigation = <nav className="space-y-1" aria-label="Навигация админ-панели">
    {adminLinks.map(({ to, label, icon: Icon, end }) => <NavLink key={to} to={to} end={end} onClick={() => setMobileOpen(false)} className={({ isActive }) => `flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition ${isActive ? 'bg-ice/15 text-ice' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}><Icon className="h-4 w-4" />{label}</NavLink>)}
  </nav>
  return <div className="min-h-screen bg-ink lg:flex">
    <aside className="hidden w-64 shrink-0 border-r border-slate-800 bg-[#0a0f14] p-5 lg:flex lg:flex-col">
      <NavLink to="/" className="mb-10 text-lg font-black text-white">oceky<span className="text-ice">WT</span><span className="ml-2 text-xs font-medium text-slate-500">ADMIN</span></NavLink>
      {navigation}
      <div className="mt-auto border-t border-slate-800 pt-4"><p className="truncate text-xs text-slate-500">{user?.email}</p><button onClick={logOut} className="mt-3 flex items-center gap-2 text-sm text-slate-400 hover:text-white"><LogOut className="h-4 w-4" />Выйти</button></div>
    </aside>
    <div className="min-w-0 flex-1">
      <header className="flex h-16 items-center justify-between border-b border-slate-800 px-4 lg:hidden"><span className="font-black">oceky<span className="text-ice">WT</span> <span className="text-xs font-medium text-slate-500">ADMIN</span></span><button onClick={() => setMobileOpen((value) => !value)} className="rounded p-2 hover:bg-slate-800" aria-label="Открыть меню">{mobileOpen ? <X /> : <Menu />}</button></header>
      {mobileOpen && <div className="border-b border-slate-800 bg-[#0a0f14] p-4 lg:hidden">{navigation}<button onClick={logOut} className="mt-4 flex items-center gap-2 text-sm text-slate-400"><LogOut className="h-4 w-4" />Выйти</button></div>}
      <main className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-10">{children}</main>
    </div>
  </div>
}
