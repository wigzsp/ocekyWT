import type { AdminProduct, CatalogFilters, CatalogResult, ProductImage, ProductPayload, PublicProduct, PublicStats } from '../types/database'
import { friendlyError, getSupabase } from './supabase'

const PAGE_SIZE = 12

function numeric(value: string) {
  if (value.trim() === '') return undefined

  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : undefined
}

export async function getCatalog(filters: CatalogFilters, page = 0): Promise<CatalogResult> {
  const supabase = getSupabase()

  let query = supabase
    .from('catalog_products')
    .select('*', { count: 'exact' })

  const search = filters.search.trim().toLowerCase().replace(/[%,()]/g, ' ')

  if (search) {
    query = query.ilike('search_text', `%${search}%`)
  }

  const minPrice = numeric(filters.minPrice)
  const maxPrice = numeric(filters.maxPrice)
  const minGold = numeric(filters.minGold)
  const rank = numeric(filters.rank)

  if (minPrice !== undefined) {
    query = query.gte('price', minPrice)
  }

  if (maxPrice !== undefined) {
    query = query.lte('price', maxPrice)
  }

  if (minGold !== undefined) {
    query = query.gte('gold', minGold)
  }

  if (rank !== undefined) {
    query = query.eq('rank', rank)
  }

  if (filters.nation) {
    query = query.contains('nations', [filters.nation])
  }

  if (filters.status) {
    query = query.eq('status', filters.status)
  }

  if (filters.premiumOnly) {
    query = query.not('premium_vehicles', 'eq', '{}')
  }

  if (filters.sort === 'price_asc') {
    query = query.order('price', { ascending: true })
  } else if (filters.sort === 'price_desc') {
    query = query.order('price', { ascending: false })
  } else {
    query = query.order('created_at', { ascending: false })
  }

  const from = page * PAGE_SIZE

  const { data, error, count } = await query.range(
    from,
    from + PAGE_SIZE - 1
  )

  if (error) {
    throw new Error(friendlyError(error, 'Не удалось загрузить каталог.'))
  }

  return {
    products: (data ?? []) as PublicProduct[],
    total: count ?? 0,
  }
}

export async function getLatestProducts(limit = 3) {
  const { data, error } = await getSupabase()
    .from('catalog_products')
    .select('*')
    .eq('status', 'available')
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) throw new Error(friendlyError(error, 'Не удалось загрузить новые товары.'))
  return (data ?? []) as PublicProduct[]
}

export async function getPublicProduct(id: string) {
  const { data, error } = await getSupabase().from('catalog_products').select('*').eq('id', id).maybeSingle()
  if (error) throw new Error(friendlyError(error, 'Не удалось загрузить товар.'))
  return data as PublicProduct | null
}

export async function getProductImages(productId: string) {
  const { data, error } = await getSupabase()
    .from('product_images')
    .select('*')
    .eq('product_id', productId)
    .order('sort_order', { ascending: true })
  if (error) throw new Error(friendlyError(error, 'Не удалось загрузить изображения.'))
  return (data ?? []) as ProductImage[]
}

export async function getPublicStats(): Promise<PublicStats> {
  const { data, error } = await getSupabase().rpc('public_catalog_stats')
  if (error) throw new Error(friendlyError(error, 'Не удалось загрузить статистику.'))
  const stats = Array.isArray(data) ? data[0] : data
  return { available_count: Number(stats?.available_count ?? 0), sold_count: Number(stats?.sold_count ?? 0), catalog_gold: Number(stats?.catalog_gold ?? 0) }
}

export async function getAdminProducts() {
  const { data, error } = await getSupabase().from('products').select('*').order('created_at', { ascending: false })
  if (error) throw new Error(friendlyError(error, 'Не удалось загрузить товары.'))
  return (data ?? []) as AdminProduct[]
}

export async function getAdminProduct(id: string) {
  const { data, error } = await getSupabase().from('products').select('*').eq('id', id).maybeSingle()
  if (error) throw new Error(friendlyError(error, 'Не удалось загрузить товар.'))
  return data as AdminProduct | null
}

export async function createProduct(payload: ProductPayload) {
  const { data, error } = await getSupabase().from('products').insert(payload).select().single()
  if (error) throw new Error(friendlyError(error, 'Не удалось создать товар.'))
  return data as AdminProduct
}

export async function updateProduct(id: string, payload: Partial<ProductPayload>) {
  const { data, error } = await getSupabase().from('products').update(payload).eq('id', id).select().single()
  if (error) throw new Error(friendlyError(error, 'Не удалось обновить товар.'))
  return data as AdminProduct
}

export async function deleteProduct(id: string) {
  const { error } = await getSupabase().from('products').delete().eq('id', id)
  if (error) throw new Error(friendlyError(error, 'Не удалось удалить товар.'))
}

export async function addProductImage(productId: string, imageUrl: string, sortOrder: number) {
  const { error } = await getSupabase().from('product_images').insert({ product_id: productId, image_url: imageUrl, sort_order: sortOrder })
  if (error) throw new Error(friendlyError(error, 'Не удалось сохранить изображение.'))
}

export async function removeProductImage(id: string) {
  const { error } = await getSupabase().from('product_images').delete().eq('id', id)
  if (error) throw new Error(friendlyError(error, 'Не удалось удалить изображение.'))
}

export async function reorderProductImages(images: ProductImage[]) {
  const results = await Promise.all(images.map((image, index) =>
    getSupabase().from('product_images').update({ sort_order: index }).eq('id', image.id),
  ))
  const failed = results.find((result) => result.error)
  if (failed?.error) throw new Error(friendlyError(failed.error, 'Не удалось изменить порядок изображений.'))
}

export { PAGE_SIZE }
