import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { ProductForm } from '../components/admin/ProductForm'
import { usePageMeta } from '../hooks/usePageMeta'

export default function AdminProductCreate() { usePageMeta('Новый товар | ocekyWT'); return <><Link to="/admin/products" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-ice"><ArrowLeft className="h-4 w-4" />Все товары</Link><h1 className="mt-5 text-3xl font-black">Создать товар</h1><p className="mt-2 text-sm text-slate-400">Поля со звёздочкой обязательны. Изображения оптимизируются в браузере перед отправкой в Storage.</p><div className="mt-8"><ProductForm /></div></> }
