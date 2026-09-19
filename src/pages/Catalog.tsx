import { Search, SlidersHorizontal } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { CatalogFilters } from '../components/products/CatalogFilters'
import { ProductCard } from '../components/products/ProductCard'
import { EmptyState, ErrorState, LoadingCard } from '../components/ui/States'
import { useDebounce } from '../hooks/useDebounce'
import { usePageMeta } from '../hooks/usePageMeta'
import { getCatalog, PAGE_SIZE } from '../lib/products'
import { friendlyError, isSupabaseConfigured } from '../lib/supabase'
import { EMPTY_FILTERS, type CatalogFilters as Filters, type PublicProduct } from '../types/database'

export default function Catalog() {
  usePageMeta('Каталог | ocekyWT')
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS)
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search)
  const [products, setProducts] = useState<PublicProduct[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const activeFilters = useMemo(() => ({ ...filters, search: debouncedSearch }), [filters, debouncedSearch])

  useEffect(() => { setPage(0) }, [debouncedSearch, filters.minPrice, filters.maxPrice, filters.minGold, filters.rank, filters.nation, filters.status, filters.premiumOnly, filters.sort])
  const load = useCallback(async () => {
    if (!isSupabaseConfigured) { setError('Supabase ещё не настроен. Создайте .env по примеру и перезапустите приложение.'); setLoading(false); return }
    setLoading(true); setError(null)
    try { const result = await getCatalog(activeFilters, page); setProducts(result.products); setTotal(result.total) }
    catch (reason) { setError(friendlyError(reason, 'Не удалось загрузить каталог.')) }
    finally { setLoading(false) }
  }, [activeFilters, page])
  useEffect(() => { void load() }, [load])
  const setAllFilters = (next: Filters) => { setFilters(next); if (!next.search) setSearch('') }
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE))
  return <div className="shell py-10 sm:py-14"><p className="eyebrow">inventory</p><h1 className="mt-2 text-4xl font-black text-white">Каталог аккаунтов</h1><p className="mt-3 max-w-2xl text-slate-400">Фильтруйте по цене, GE, рангу, нации и технике. Проданные позиции остаются в каталоге с соответствующим статусом.</p>
    <div className="mt-8 grid gap-5 lg:grid-cols-[260px_minmax(0,1fr)]"><CatalogFilters filters={filters} setFilters={setAllFilters} mobileOpen={filtersOpen} onMobileOpen={() => setFiltersOpen(true)} onMobileClose={() => setFiltersOpen(false)} />
      <section><div className="mb-5 flex flex-col gap-3 sm:flex-row"><label className="relative flex-1"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" /><input value={search} onChange={(event) => setSearch(event.target.value)} className="field m-0 pl-10" placeholder="Поиск по названию, технике, описанию" aria-label="Поиск по каталогу" /></label><label className="flex items-center gap-2 text-sm text-slate-400"><SlidersHorizontal className="h-4 w-4" /><span className="sr-only">Сортировка</span><select value={filters.sort} onChange={(event) => setFilters({ ...filters, sort: event.target.value as Filters['sort'] })} className="field m-0 w-full sm:w-44"><option value="newest">Сначала новые</option><option value="price_asc">Сначала дешёвые</option><option value="price_desc">Сначала дорогие</option></select></label></div>
        <p className="mb-5 text-sm text-slate-500">{loading ? 'Обновление каталога…' : `Найдено: ${total}`}</p>
        {loading ? <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{Array.from({ length: 6 }, (_, index) => <LoadingCard key={index} className="h-[370px]" />)}</div> : error ? <ErrorState message={error} retry={load} /> : products.length ? <><div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{products.map((product) => <ProductCard key={product.id} product={product} />)}</div>{pageCount > 1 && <nav className="mt-8 flex items-center justify-center gap-3" aria-label="Страницы каталога"><button className="btn-secondary" disabled={page === 0} onClick={() => setPage((current) => current - 1)}>Назад</button><span className="text-sm text-slate-400">Страница {page + 1} из {pageCount}</span><button className="btn-secondary" disabled={page >= pageCount - 1} onClick={() => setPage((current) => current + 1)}>Вперёд</button></nav>}</> : <EmptyState title="Ничего не найдено" description="Измените условия фильтрации или сбросьте их, чтобы увидеть все доступные позиции." action={<button className="btn-primary" onClick={() => { setFilters(EMPTY_FILTERS); setSearch('') }}>Сбросить фильтры</button>} />}</section>
    </div>
  </div>
}
