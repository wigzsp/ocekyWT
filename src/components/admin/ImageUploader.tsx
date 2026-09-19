import { GripVertical, ImagePlus, Trash2, UploadCloud } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type { ProductImage } from '../../types/database'
import { validateImage } from '../../lib/storage'

export function ImageUploader({ mainUrl, existingImages, mainFile, additionalFiles, setMainFile, setAdditionalFiles, onDeleteExisting, onReorderExisting, disabled }: {
  mainUrl: string | null
  existingImages: ProductImage[]
  mainFile: File | null
  additionalFiles: File[]
  setMainFile: (file: File | null) => void
  setAdditionalFiles: (files: File[]) => void
  onDeleteExisting: (image: ProductImage) => void
  onReorderExisting: (images: ProductImage[]) => void
  disabled?: boolean
}) {
  const mainInput = useRef<HTMLInputElement>(null)
  const extraInput = useRef<HTMLInputElement>(null)
  const [draggedExisting, setDraggedExisting] = useState<string | null>(null)
  const [draggedNew, setDraggedNew] = useState<number | null>(null)
  const assignMain = (file?: File) => { if (!file) return; try { validateImage(file); setMainFile(file) } catch (error) { window.alert(error instanceof Error ? error.message : 'Неверный файл.') } }
  const addFiles = (files: FileList | File[]) => {
    const valid: File[] = []
    for (const file of Array.from(files)) { try { validateImage(file); valid.push(file) } catch (error) { window.alert(`${file.name}: ${error instanceof Error ? error.message : 'Неверный файл.'}`) } }
    setAdditionalFiles([...additionalFiles, ...valid].slice(0, 12))
  }
  const swap = <T,>(items: T[], from: number, to: number) => { const next = [...items]; const [item] = next.splice(from, 1); next.splice(to, 0, item); return next }
  return <div className="space-y-5">
    <div><span className="label">Главное изображение</span><button type="button" disabled={disabled} onClick={() => mainInput.current?.click()} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); assignMain(event.dataTransfer.files[0]) }} className="mt-2 flex min-h-44 w-full items-center justify-center overflow-hidden rounded-lg border border-dashed border-slate-600 bg-ink p-3 text-center transition hover:border-ice disabled:opacity-50">
      {mainFile ? <FilePreview file={mainFile} alt="Предпросмотр главного изображения" className="max-h-64 w-full object-contain" /> : mainUrl ? <img src={mainUrl} alt="Предпросмотр главного изображения" className="max-h-64 w-full object-contain" /> : <span className="text-sm text-slate-500"><UploadCloud className="mx-auto mb-2 h-7 w-7" />Перетащите JPG, PNG или WEBP сюда<br />или нажмите для выбора (до 8 МБ)</span>}
    </button><input ref={mainInput} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={(event) => assignMain(event.target.files?.[0])} />{mainFile && <button type="button" onClick={() => setMainFile(null)} className="mt-2 text-xs text-slate-400 hover:text-rose-300">Отменить замену изображения</button>}</div>
    <div><div className="flex flex-wrap items-center justify-between gap-2"><span className="label">Дополнительные изображения</span><button type="button" disabled={disabled} onClick={() => extraInput.current?.click()} className="btn-secondary py-2 text-xs"><ImagePlus className="h-3.5 w-3.5" />Добавить</button></div><p className="mt-1 text-xs text-slate-500">Перетаскивайте карточки для изменения порядка. Максимум 12 файлов за раз.</p><input ref={extraInput} type="file" accept="image/jpeg,image/png,image/webp" multiple hidden onChange={(event) => { if (event.target.files) addFiles(event.target.files); event.currentTarget.value = '' }} />
      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">{existingImages.map((image, index) => <div key={image.id} draggable={!disabled} onDragStart={() => setDraggedExisting(image.id)} onDragOver={(event) => event.preventDefault()} onDrop={() => { const from = existingImages.findIndex((item) => item.id === draggedExisting); if (from >= 0 && from !== index) onReorderExisting(swap(existingImages, from, index)); setDraggedExisting(null) }} className="group relative aspect-video overflow-hidden rounded border border-slate-700 bg-steel"><img src={image.image_url} alt={`Дополнительное изображение ${index + 1}`} className="h-full w-full object-cover" /><span className="absolute left-1 top-1 rounded bg-ink/80 p-1 text-slate-300"><GripVertical className="h-3 w-3" /></span><button type="button" disabled={disabled} onClick={() => onDeleteExisting(image)} aria-label="Удалить изображение" className="absolute right-1 top-1 rounded bg-ink/80 p-1.5 text-rose-200 opacity-100 sm:opacity-0 sm:group-hover:opacity-100"><Trash2 className="h-3.5 w-3.5" /></button></div>)}
        {additionalFiles.map((file, index) => <div key={`${file.name}-${index}`} draggable={!disabled} onDragStart={() => setDraggedNew(index)} onDragOver={(event) => event.preventDefault()} onDrop={() => { if (draggedNew !== null && draggedNew !== index) setAdditionalFiles(swap(additionalFiles, draggedNew, index)); setDraggedNew(null) }} className="group relative aspect-video overflow-hidden rounded border border-dashed border-ice/60 bg-steel"><FilePreview file={file} alt={`Новое изображение ${index + 1}`} className="h-full w-full object-cover" /><span className="absolute bottom-1 left-1 rounded bg-ice px-1.5 py-0.5 text-[10px] font-bold text-ink">НОВОЕ</span><button type="button" disabled={disabled} onClick={() => setAdditionalFiles(additionalFiles.filter((_, fileIndex) => fileIndex !== index))} aria-label="Убрать новое изображение" className="absolute right-1 top-1 rounded bg-ink/80 p-1.5 text-rose-200"><Trash2 className="h-3.5 w-3.5" /></button></div>)}</div>
    </div>
  </div>
}

function FilePreview({ file, alt, className }: { file: File; alt: string; className: string }) {
  const [url, setUrl] = useState('')
  useEffect(() => { const nextUrl = URL.createObjectURL(file); setUrl(nextUrl); return () => URL.revokeObjectURL(nextUrl) }, [file])
  return url ? <img src={url} alt={alt} className={className} /> : null
}
