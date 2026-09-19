import { Filter, RotateCcw, SlidersHorizontal, X } from 'lucide-react'
import type { CatalogFilters as Filters } from '../../types/database'
import { EMPTY_FILTERS } from '../../types/database'

const nations = ['СССР', 'США', 'Германия', 'Великобритания', 'Япония', 'Китай', 'Италия', 'Франция', 'Швеция', 'Израиль']

function Inputs({ filters, setFilters }: { filters: Filters; setFilters: (filters: Filters) => void }) {
  const update = (key: keyof Filters, value: string | boolean) => setFilters({ ...filters, [key]: value })
  return <div className="space-y-4">
    <label className="block"><span className="label">Цена, ₽</span><div className="mt-1 grid grid-cols-2 gap-2"><input value={filters.minPrice} onChange={(event) => update('minPrice', event.target.value)} inputMode="decimal" min="0" type="number" className="field" placeholder="От" aria-label="Минимальная цена" /><input value={filters.maxPrice} onChange={(event) => update('maxPrice', event.target.value)} inputMode="decimal" min="0" type="number" className="field" placeholder="До" aria-label="Максимальная цена" /></div></label>
    <label className="block"><span className="label">Минимум GE</span><input value={filters.minGold} onChange={(event) => update('minGold', event.target.value)} inputMode="numeric" min="0" type="number" className="field" placeholder="Например, 1000" /></label>
    <label className="block"><span className="label">Ранг</span><select value={filters.rank} onChange={(event) => update('rank', event.target.value)} className="field"><option value="">Любой</option>{[1, 2, 3, 4, 5, 6, 7, 8].map((rank) => <option key={rank} value={rank}>{rank}</option>)}</select></label>
    <label className="block"><span className="label">Нация</span><select value={filters.nation} onChange={(event) => update('nation', event.target.value)} className="field"><option value="">Все нации</option>{nations.map((nation) => <option key={nation}>{nation}</option>)}</select></label>
    <label className="block"><span className="label">Статус</span><select value={filters.status} onChange={(event) => update('status', event.target.value as Filters['status'])} className="field"><option value="">Все видимые</option><option value="available">В наличии</option><option value="sold">Продано</option></select></label>
    <label className="flex cursor-pointer items-center gap-3 rounded-md border border-slate-700 p-3 text-sm text-slate-300"><input type="checkbox" checked={filters.premiumOnly} onChange={(event) => update('premiumOnly', event.target.checked)} className="h-4 w-4 accent-sky-300" />Только премиумная техника</label>
  </div>
}

export function CatalogFilters({ filters, setFilters, mobileOpen, onMobileClose, onMobileOpen }: {
  filters: Filters
  setFilters: (filters: Filters) => void
  mobileOpen: boolean
  onMobileClose: () => void
  onMobileOpen: () => void
}) {
  const reset = () => setFilters(EMPTY_FILTERS)
  return <>
    <button onClick={onMobileOpen} className="btn-secondary w-full lg:hidden"><SlidersHorizontal className="h-4 w-4" />Фильтры</button>
    <aside className="panel hidden rounded-xl p-5 lg:block"><div className="mb-5 flex items-center justify-between"><h2 className="flex items-center gap-2 font-semibold"><Filter className="h-4 w-4 text-ice" />Фильтры</h2><button onClick={reset} className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-ice"><RotateCcw className="h-3.5 w-3.5" />Сбросить</button></div><Inputs filters={filters} setFilters={setFilters} /></aside>
    {mobileOpen && <div className="fixed inset-0 z-50 bg-black/70 p-3 lg:hidden" role="presentation" onMouseDown={onMobileClose}><section role="dialog" aria-modal="true" aria-label="Фильтры каталога" onMouseDown={(event) => event.stopPropagation()} className="panel mx-auto flex h-full max-w-lg flex-col rounded-xl"><div className="flex items-center justify-between border-b border-slate-700 p-4"><h2 className="flex items-center gap-2 font-semibold"><Filter className="h-4 w-4 text-ice" />Фильтры</h2><button onClick={onMobileClose} className="rounded p-2 hover:bg-slate-800" aria-label="Закрыть фильтры"><X className="h-5 w-5" /></button></div><div className="flex-1 overflow-y-auto p-4"><Inputs filters={filters} setFilters={setFilters} /></div><div className="flex gap-3 border-t border-slate-700 p-4"><button className="btn-secondary flex-1" onClick={reset}>Сбросить</button><button className="btn-primary flex-1" onClick={onMobileClose}>Показать</button></div></section></div>}
  </>
}
