import { Check, EyeOff, ShoppingBag } from 'lucide-react'
import type { ProductBadge, ProductStatus } from '../../types/database'

export function StatusBadge({ status }: { status: ProductStatus }) {
  const map = {
    available: { label: 'В наличии', className: 'border-sky-400/30 bg-sky-400/10 text-sky-200', icon: Check },
    sold: { label: 'Продано', className: 'border-rose-400/30 bg-rose-400/10 text-rose-200', icon: ShoppingBag },
    hidden: { label: 'Скрыто', className: 'border-slate-500/30 bg-slate-500/10 text-slate-300', icon: EyeOff },
  }[status]
  const Icon = map.icon
  return <span className={`inline-flex items-center gap-1 rounded border px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${map.className}`}><Icon className="h-3 w-3" />{map.label}</span>
}

export function ProductBadgeLabel({ badge }: { badge: ProductBadge }) {
  if (!badge) return null
  const tone = badge === 'SALE' ? 'bg-rose-500 text-white' : badge === 'TOP' ? 'bg-amber-300 text-slate-950' : 'bg-ice text-slate-950'
  return <span className={`rounded px-2 py-1 text-[10px] font-black tracking-wider ${tone}`}>{badge}</span>
}
