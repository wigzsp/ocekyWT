import { ImageOff } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { ProductImage } from '../../types/database'

export function ProductGallery({ title, mainUrl, images }: { title: string; mainUrl: string | null; images: ProductImage[] }) {
  const allImages = [mainUrl, ...images.map((image) => image.image_url)].filter((url): url is string => Boolean(url))
  const [selected, setSelected] = useState(0)
  useEffect(() => setSelected(0), [mainUrl, images.length])
  if (!allImages.length) return <div className="panel flex aspect-[4/3] items-center justify-center rounded-xl bg-steel"><div className="text-center text-slate-500"><ImageOff className="mx-auto h-9 w-9" /><p className="mt-2 text-sm">Изображение пока не добавлено</p></div></div>
  return <section aria-label="Галерея товара">
    <div className="panel aspect-[4/3] overflow-hidden rounded-xl bg-steel"><img src={allImages[selected]} alt={`${title}, изображение ${selected + 1}`} className="h-full w-full object-cover" /></div>
    {allImages.length > 1 && <div className="mt-3 flex gap-2 overflow-x-auto pb-1">{allImages.map((url, index) => <button key={`${url}-${index}`} onClick={() => setSelected(index)} aria-label={`Показать изображение ${index + 1}`} aria-current={selected === index} className={`h-16 w-20 shrink-0 overflow-hidden rounded border ${selected === index ? 'border-ice' : 'border-slate-700 hover:border-slate-500'}`}><img src={url} alt="" className="h-full w-full object-cover" /></button>)}</div>}
  </section>
}
