import { ArrowRight, Crosshair, Gem, ListFilter, ShieldCheck, ShoppingCart } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { ProductCard } from '../components/products/ProductCard'
import { EmptyState, ErrorState, LoadingCard } from '../components/ui/States'
import { getLatestProducts, getPublicStats } from '../lib/products'
import { friendlyError, isSupabaseConfigured } from '../lib/supabase'
import type { PublicProduct, PublicStats } from '../types/database'
import { usePageMeta } from '../hooks/usePageMeta'

const funpayProfileUrl = import.meta.env.VITE_FUNPAY_PROFILE_URL || 'https://funpay.com/users/21503962/'

export default function Home() {
  usePageMeta('ocekyWT | War Thunder Accounts')
  const [products, setProducts] = useState<PublicProduct[]>([])
  const [stats, setStats] = useState<PublicStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const load = async () => {
    if (!isSupabaseConfigured) { setError('Supabase ещё не настроен. Создайте .env по примеру и перезапустите приложение.'); setLoading(false); return }
    setLoading(true); setError(null)
    try { const [nextProducts, nextStats] = await Promise.all([getLatestProducts(), getPublicStats()]); setProducts(nextProducts); setStats(nextStats) }
    catch (reason) { setError(friendlyError(reason, 'Не удалось загрузить витрину.')) }
    finally { setLoading(false) }
  }
  useEffect(() => { void load() }, [])
  const format = (value: number) => value.toLocaleString('ru-RU')
  return <>
    <section className="overflow-hidden border-b border-slate-800 bg-[radial-gradient(circle_at_75%_15%,rgba(42,116,155,.2),transparent_28%),linear-gradient(130deg,#080b0f_0%,#0d161e_100%)]">
      <div className="shell grid min-h-[530px] items-center gap-12 py-20 lg:grid-cols-[1.3fr_.7fr] lg:py-28">
        <div><p className="eyebrow">war thunder accounts</p><h1 className="mt-5 max-w-3xl text-5xl font-black tracking-tight text-white sm:text-6xl lg:text-7xl">oceky<span className="text-ice">WT</span></h1><p className="mt-2 text-xl font-semibold tracking-[.12em] text-slate-300 sm:text-2xl">WAR THUNDER ACCOUNTS</p><p className="mt-7 max-w-xl text-base leading-7 text-slate-400">Аккаунты с понятными характеристиками: техника, ранг, GE и скриншоты. Выбирайте здесь, покупайте через FunPay.</p><div className="mt-9 flex flex-col gap-3 sm:flex-row"><Link to="/catalog" className="btn-primary">Смотреть аккаунты <ArrowRight className="h-4 w-4" /></Link><a href={funpayProfileUrl} target="_blank" rel="noreferrer" className="btn-secondary">Перейти на FunPay <ShoppingCart className="h-4 w-4" /></a></div></div>
        <div className="relative hidden min-h-72 lg:block"><div className="absolute inset-5 rounded-full border border-ice/15" /><div className="absolute inset-14 rounded-full border border-slate-600/40" /><Crosshair className="absolute left-1/2 top-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2 text-ice/80" strokeWidth={0.8} aria-hidden="true" /><span className="absolute bottom-8 left-8 text-xs tracking-[.2em] text-slate-500">OCEKY / FIELD UNIT</span></div>
      </div>
    </section>
    <section className="shell grid gap-3 py-8 sm:grid-cols-3">
      {loading ? [1, 2, 3].map((item) => <LoadingCard key={item} className="h-28" />) : stats && <>
        <article className="panel rounded-lg p-5"><p className="text-xs font-bold uppercase tracking-wider text-slate-500">Аккаунтов в продаже</p><p className="mt-2 text-3xl font-black text-white">{format(stats.available_count)}</p></article>
        <article className="panel rounded-lg p-5"><p className="text-xs font-bold uppercase tracking-wider text-slate-500">Проданных аккаунтов</p><p className="mt-2 text-3xl font-black text-white">{format(stats.sold_count)}</p></article>
        <article className="panel rounded-lg p-5"><p className="text-xs font-bold uppercase tracking-wider text-slate-500">GE в каталоге</p><p className="mt-2 text-3xl font-black text-white">{format(stats.catalog_gold)}</p></article>
      </>}
    </section>
    <section className="shell py-14"><div className="flex flex-wrap items-end justify-between gap-5"><div><p className="eyebrow">fresh inventory</p><h2 className="mt-2 text-3xl font-black text-white">Последние поступления</h2></div><Link to="/catalog" className="btn-secondary">Весь каталог <ArrowRight className="h-4 w-4" /></Link></div>
      <div className="mt-8">{loading ? <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{[1, 2, 3].map((item) => <LoadingCard key={item} className="h-[370px]" />)}</div> : error ? <ErrorState message={error} retry={load} /> : products.length ? <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{products.map((product) => <ProductCard key={product.id} product={product} />)}</div> : <EmptyState title="Поступлений пока нет" description="Как только доступные аккаунты появятся в каталоге, они будут показаны здесь." action={<Link to="/catalog" className="btn-primary">Открыть каталог</Link>} />}</div>
    </section>
    <section className="border-y border-slate-800 bg-panel/45"><div className="shell py-16"><p className="eyebrow">clear by design</p><h2 className="mt-2 text-3xl font-black text-white">Почему ocekyWT</h2><div className="mt-9 grid gap-5 md:grid-cols-3"><Feature icon={ListFilter} title="Подробные характеристики" text="Ранг, GE, нации и техника собраны в карточке товара — без поиска по переписке." /><Feature icon={Gem} title="Скриншоты техники" text="Для каждого лота можно добавить галерею изображений и проверить состав до перехода к покупке." /><Feature icon={ShieldCheck} title="Прямая покупка через FunPay" text="Витрина направляет к конкретному объявлению на FunPay. Оплата не обрабатывается на этом сайте." /></div></div></section>
  </>
}

function Feature({ icon: Icon, title, text }: { icon: typeof ListFilter; title: string; text: string }) {
  return <article className="panel rounded-xl p-6"><Icon className="h-6 w-6 text-ice" aria-hidden="true" /><h3 className="mt-5 font-bold text-white">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-400">{text}</p></article>
}
