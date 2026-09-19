import { ArrowLeft } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { useCallback, useEffect, useState } from 'react'
import { ProductForm } from '../components/admin/ProductForm'
import { ErrorState, LoadingCard } from '../components/ui/States'
import { usePageMeta } from '../hooks/usePageMeta'
import { getAdminProduct, getProductImages } from '../lib/products'
import { friendlyError } from '../lib/supabase'
import type { AdminProduct, ProductImage } from '../types/database'

export default function AdminProductEdit() {
  const { id = '' } = useParams(); const [product, setProduct] = useState<AdminProduct | null>(null); const [images, setImages] = useState<ProductImage[]>([]); const [loading, setLoading] = useState(true); const [error, setError] = useState<string | null>(null)
  usePageMeta(product ? `Редактирование: ${product.title} | ocekyWT` : 'Редактирование товара | ocekyWT')
  const load = useCallback(async () => { setLoading(true); setError(null); try { const [nextProduct, nextImages] = await Promise.all([getAdminProduct(id), getProductImages(id)]); setProduct(nextProduct); setImages(nextImages) } catch (reason) { setError(friendlyError(reason, 'Не удалось загрузить товар.')) } finally { setLoading(false) } }, [id])
  useEffect(() => { void load() }, [load])
  return <><Link to="/admin/products" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-ice"><ArrowLeft className="h-4 w-4" />Все товары</Link>{loading ? <div className="mt-8 space-y-5"><LoadingCard className="h-10 w-1/3" /><LoadingCard className="h-96" /></div> : error ? <div className="mt-8"><ErrorState message={error} retry={load} /></div> : !product ? <section className="panel mt-8 rounded-xl p-8 text-center"><h1 className="text-xl font-bold">Товар не найден</h1><Link to="/admin/products" className="btn-primary mt-5">К товарам</Link></section> : <><h1 className="mt-5 text-3xl font-black">Редактировать товар</h1><p className="mt-2 text-sm text-slate-400">Изменения статуса и изображений применяются сразу после сохранения.</p><div className="mt-8"><ProductForm product={product} initialImages={images} /></div></>}</>
}
