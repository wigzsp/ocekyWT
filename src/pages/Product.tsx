import { ArrowLeft, CalendarDays, Gem, Globe2, Shield, ShoppingCart, Swords } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { useCallback, useEffect, useState } from 'react'
import { ProductGallery } from '../components/products/ProductGallery'
import { ProductBadgeLabel, StatusBadge } from '../components/products/StatusBadge'
import { ErrorState, LoadingCard } from '../components/ui/States'
import { usePageMeta } from '../hooks/usePageMeta'
import { getProductImages, getPublicProduct } from '../lib/products'
import { friendlyError, isSupabaseConfigured } from '../lib/supabase'
import type { ProductImage, PublicProduct } from '../types/database'

export default function Product() {
  const { id = '' } = useParams()
  const [product, setProduct] = useState<PublicProduct | null>(null)
  const [images, setImages] = useState<ProductImage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const load = useCallback(async () => {
    if (!isSupabaseConfigured) { setError('Supabase ещё не настроен.'); setLoading(false); return }
    setLoading(true); setError(null)
    try { const [nextProduct, nextImages] = await Promise.all([getPublicProduct(id), getProductImages(id)]); setProduct(nextProduct); setImages(nextImages) }
    catch (reason) { setError(friendlyError(reason, 'Не удалось загрузить товар.')) }
    finally { setLoading(false) }
  }, [id])
  useEffect(() => { void load() }, [load])
  usePageMeta(product ? `ocekyWT | ${product.title}` : 'Товар | ocekyWT', product?.description?.slice(0, 160) || undefined)
  if (loading) return <div className="shell grid gap-8 py-12 lg:grid-cols-2"><LoadingCard className="aspect-[4/3]" /><div className="space-y-4"><LoadingCard className="h-10 w-2/3" /><LoadingCard className="h-24" /><LoadingCard className="h-16" /></div></div>
  if (error) return <div className="shell py-14"><ErrorState message={error} retry={load} /></div>
  if (!product) return <div className="shell py-14"><section className="panel rounded-xl px-6 py-16 text-center"><Shield className="mx-auto h-10 w-10 text-slate-500" /><h1 className="mt-4 text-2xl font-bold">Товар не найден</h1><p className="mt-2 text-slate-400">Возможно, он был скрыт или ссылка устарела.</p><Link to="/catalog" className="btn-primary mt-6">Вернуться в каталог</Link></section></div>
  const sold = product.status === 'sold'
  return <div className="shell py-8 sm:py-12"><Link to="/catalog" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-ice"><ArrowLeft className="h-4 w-4" />Каталог</Link><div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(340px,.95fr)]"><ProductGallery title={product.title} mainUrl={product.main_image_url} images={images} />
    <section><div className="flex flex-wrap items-center gap-2"><ProductBadgeLabel badge={product.badge} /><StatusBadge status={product.status} /></div><h1 className="mt-4 text-3xl font-black leading-tight text-white sm:text-4xl">{product.title}</h1><p className="mt-5 text-3xl font-black text-white">{product.price.toLocaleString('ru-RU', { maximumFractionDigits: 0 })} <span className="text-base text-slate-400">{product.currency}</span></p><dl className="mt-7 grid grid-cols-2 gap-3"><Fact icon={Gem} label="Golden Eagles" value={`${product.gold.toLocaleString('ru-RU')} GE`} /><Fact icon={Shield} label="Ранг" value={product.rank ? String(product.rank) : 'Не указан'} /><Fact icon={Globe2} label="Нации" value={product.nations.length ? product.nations.join(', ') : 'Не указаны'} /><Fact icon={Swords} label="Боёв" value={product.battle_count?.toLocaleString('ru-RU') ?? 'Не указано'} /></dl>
      <div className="mt-7">{sold ? <div className="rounded-lg border border-rose-400/30 bg-rose-400/10 p-4"><p className="font-bold tracking-wide text-rose-100">ПРОДАНО</p><p className="mt-1 text-sm text-rose-100/70">Этот лот сохранён в каталоге как архив. Переход к покупке отключён.</p></div> : <a href={product.funpay_url} target="_blank" rel="noreferrer" className="btn-primary w-full py-3"><ShoppingCart className="h-4 w-4" />Купить на FunPay</a>}</div><p className="mt-3 flex items-center gap-2 text-xs text-slate-500"><CalendarDays className="h-3.5 w-3.5" />Добавлено {new Intl.DateTimeFormat('ru-RU', { dateStyle: 'long' }).format(new Date(product.created_at))}</p>
    </section></div>
    <div className="mt-12 grid gap-8 lg:grid-cols-2"><section><h2 className="text-xl font-bold text-white">Описание</h2><p className="mt-4 whitespace-pre-wrap leading-7 text-slate-300">{product.description || 'Администратор пока не добавил описание для этого товара.'}</p></section><section className="space-y-6"><TagSection title="Основная техника" tags={product.vehicles} /><TagSection title="Премиумная техника" tags={product.premium_vehicles} /></section></div>
  </div>
}

function Fact({ icon: Icon, label, value }: { icon: typeof Gem; label: string; value: string }) { return <div className="rounded-lg border border-slate-700 bg-panel p-3"><dt className="flex items-center gap-1.5 text-xs text-slate-500"><Icon className="h-3.5 w-3.5" />{label}</dt><dd className="mt-1 break-words text-sm font-semibold text-slate-200">{value}</dd></div> }
function TagSection({ title, tags }: { title: string; tags: string[] }) { return <section><h2 className="text-xl font-bold text-white">{title}</h2>{tags.length ? <div className="mt-3 flex flex-wrap gap-2">{tags.map((tag) => <span key={tag} className="rounded border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-sm text-slate-300">{tag}</span>)}</div> : <p className="mt-3 text-sm text-slate-500">Не указана</p>}</section> }
