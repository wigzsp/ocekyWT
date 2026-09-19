import { friendlyError, getSupabase } from './supabase'

const BUCKET = 'product-images'
const MAX_FILE_SIZE = 8 * 1024 * 1024
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export function validateImage(file: File) {
  if (!ACCEPTED_TYPES.includes(file.type)) throw new Error('Поддерживаются только JPG, PNG и WEBP.')
  if (file.size > MAX_FILE_SIZE) throw new Error('Размер одного изображения не должен превышать 8 МБ.')
}

/** Re-encodes browser-supported images to compact WebP before upload. */
export async function optimizeImage(file: File): Promise<File> {
  validateImage(file)
  const bitmap = await createImageBitmap(file)
  const largestSide = Math.max(bitmap.width, bitmap.height)
  const scale = Math.min(1, 2200 / largestSide)
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(bitmap.width * scale))
  canvas.height = Math.max(1, Math.round(bitmap.height * scale))
  canvas.getContext('2d')?.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  bitmap.close()
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/webp', 0.84))
  if (!blob) throw new Error('Браузер не смог оптимизировать изображение.')
  return new File([blob], file.name.replace(/\.[^.]+$/, '') + '.webp', { type: 'image/webp' })
}

export async function uploadProductImage(productId: string, file: File, kind: 'main' | 'additional', index = 0) {
  const optimized = await optimizeImage(file)
  const path = kind === 'main'
    ? `${productId}/main.webp`
    : `${productId}/image-${Date.now()}-${index}.webp`
  const { error } = await getSupabase().storage.from(BUCKET).upload(path, optimized, {
    cacheControl: '3600',
    contentType: 'image/webp',
    upsert: kind === 'main',
  })
  if (error) throw new Error(friendlyError(error, 'Не удалось загрузить изображение.'))
  const publicUrl = getSupabase().storage.from(BUCKET).getPublicUrl(path).data.publicUrl
  // main.webp is safely overwritten at a stable path; the query avoids a stale browser cache.
  return kind === 'main' ? `${publicUrl}?v=${Date.now()}` : publicUrl
}

function pathFromPublicUrl(url: string) {
  const marker = `/storage/v1/object/public/${BUCKET}/`
  const index = url.indexOf(marker)
  return index === -1 ? null : decodeURIComponent(url.slice(index + marker.length).split('?')[0])
}

export async function removeStorageFile(publicUrl: string | null | undefined) {
  if (!publicUrl) return
  const path = pathFromPublicUrl(publicUrl)
  if (!path) return
  const { error } = await getSupabase().storage.from(BUCKET).remove([path])
  if (error) throw new Error(friendlyError(error, 'Не удалось удалить файл из хранилища.'))
}

export async function removeProductFolder(productId: string) {
  const storage = getSupabase().storage.from(BUCKET)
  const { data, error } = await storage.list(productId, { limit: 100 })
  if (error) throw new Error(friendlyError(error, 'Не удалось прочитать файлы товара.'))
  if (!data?.length) return
  const { error: removeError } = await storage.remove(data.map((file) => `${productId}/${file.name}`))
  if (removeError) throw new Error(friendlyError(removeError, 'Не удалось удалить файлы товара.'))
}
