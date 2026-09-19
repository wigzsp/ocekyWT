export type ProductStatus = 'available' | 'sold' | 'hidden'
export type ProductBadge = 'NEW' | 'SALE' | 'TOP' | null

export interface ProductImage {
  id: string
  product_id: string
  image_url: string
  sort_order: number
  created_at: string
}

/** Fields intentionally available through the public catalog_products view. */
export interface PublicProduct {
  id: string
  slug: string
  title: string
  description: string | null
  price: number
  currency: string
  gold: number
  rank: number | null
  nations: string[]
  vehicles: string[]
  premium_vehicles: string[]
  battle_count: number | null
  badge: ProductBadge
  status: Exclude<ProductStatus, 'hidden'>
  funpay_url: string
  main_image_url: string | null
  created_at: string
  updated_at: string
  search_text: string
}

/** Full row returned only after an administrator has passed Supabase RLS. */
export interface AdminProduct extends Omit<PublicProduct, 'status'> {
  status: ProductStatus
  cost_usd: number | null
  cost_rub: number | null
  sale_price: number | null
  platform_fee: number | null
  profit: number | null
}

export interface ProductPayload {
  title: string
  description: string | null
  price: number
  currency: string
  gold: number
  rank: number | null
  nations: string[]
  vehicles: string[]
  premium_vehicles: string[]
  battle_count: number | null
  badge: ProductBadge
  status: ProductStatus
  funpay_url: string
  main_image_url?: string | null
  cost_usd: number | null
  cost_rub: number | null
  sale_price: number | null
  platform_fee: number | null
}

export interface CatalogFilters {
  search: string
  minPrice: string
  maxPrice: string
  minGold: string
  rank: string
  nation: string
  status: '' | 'available' | 'sold'
  premiumOnly: boolean
  sort: 'newest' | 'price_asc' | 'price_desc'
}

export interface CatalogResult {
  products: PublicProduct[]
  total: number
}

export interface PublicStats {
  available_count: number
  sold_count: number
  catalog_gold: number
}

export const EMPTY_FILTERS: CatalogFilters = {
  search: '',
  minPrice: '',
  maxPrice: '',
  minGold: '',
  rank: '',
  nation: '',
  status: '',
  premiumOnly: false,
  sort: 'newest',
}
