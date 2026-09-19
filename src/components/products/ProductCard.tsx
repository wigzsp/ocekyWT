import { ArrowUpRight, Gem, Shield, ShoppingCart } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { PublicProduct } from '../../types/database'
import { ProductBadgeLabel, StatusBadge } from './StatusBadge'

export function ProductCard({ product }: { product: PublicProduct }) {
  const sold = product.status === 'sold'
  return <article className="group panel overflow-hidden rounded-xl transition duration-200 hover:-translate-y-1 hover:border-slate-500">
    <Link to={`/product/${product.id}`} className="relative block aspect-[16/10] overflow-hidden bg-steel">
      {product.main_image_url ? <img src={product.main_image_url} alt={`Аккаунт ${product.title}`} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]" /> : <div className="flex h-full items-center justify-center bg-[radial-gradient(circle_at_30%_30%,#263b4a,transparent_40%),linear-gradient(135deg,#17232d,#0c1116)]"><Shield className="h-12 w-12 text-ice/70" aria-hidden="true" /></div>}
      <div className="absolute left-3 top-3 flex gap-2"><ProductBadgeLabel badge={product.badge} /></div>
      {sold && <div className="absolute inset-0 grid place-items-center bg-ink/60"><span className="border border-rose-300/60 bg-ink/80 px-3 py-1 text-xs font-bold tracking-[.18em] text-rose-100">ПРОДАНО</span></div>}
    </Link>
    <div className="p-4">
      <div className="flex items-start justify-between gap-3"><h2 className="min-h-12 text-base font-bold leading-6 text-white"><Link to={`/product/${product.id}`} className="hover:text-ice">{product.title}</Link></h2><StatusBadge status={product.status} /></div>
      <div className="mt-3 flex items-end justify-between"><p className="text-xl font-black text-white">{new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 }).format(product.price)} <span className="text-xs font-semibold text-slate-400">{product.currency}</span></p><p className="flex items-center gap-1 text-xs text-amber-200"><Gem className="h-3.5 w-3.5" />{product.gold.toLocaleString('ru-RU')} GE</p></div>
      <div className="mt-3 flex flex-wrap gap-1.5 text-xs text-slate-400"><span className="rounded bg-slate-800 px-2 py-1">Ранг {product.rank ?? '—'}</span>{product.vehicles.slice(0, 2).map((vehicle) => <span key={vehicle} className="max-w-32 truncate rounded bg-slate-800 px-2 py-1">{vehicle}</span>)}{product.vehicles.length > 2 && <span className="rounded bg-slate-800 px-2 py-1">+{product.vehicles.length - 2}</span>}</div>
      <div className="mt-4 grid grid-cols-2 gap-2"><Link to={`/product/${product.id}`} className="btn-secondary py-2 text-xs">Подробнее <ArrowUpRight className="h-3.5 w-3.5" /></Link>{sold ? <button disabled className="btn-secondary py-2 text-xs">Продано</button> : <a href={product.funpay_url} target="_blank" rel="noreferrer" className="btn-primary py-2 text-xs"><ShoppingCart className="h-3.5 w-3.5" />Купить</a>}</div>
    </div>
  </article>
}
