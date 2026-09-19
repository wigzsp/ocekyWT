import { Eye, EyeOff, Save } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { addProductImage, createProduct, getProductImages, reorderProductImages, removeProductImage, updateProduct } from '../../lib/products'
import { removeStorageFile, uploadProductImage } from '../../lib/storage'
import type { AdminProduct, ProductBadge, ProductImage, ProductPayload, ProductStatus } from '../../types/database'
import { ImageUploader } from './ImageUploader'
import { useToast } from '../ui/Toast'

type FormState = {
  title: string; description: string; price: string; currency: string; gold: string; rank: string; nations: string; vehicles: string; premiumVehicles: string; battleCount: string; badge: string; status: ProductStatus; funpayUrl: string; costUsd: string; costRub: string; salePrice: string; platformFee: string
}

const emptyForm: FormState = { title: '', description: '', price: '', currency: 'RUB', gold: '0', rank: '', nations: '', vehicles: '', premiumVehicles: '', battleCount: '', badge: '', status: 'available', funpayUrl: '', costUsd: '', costRub: '', salePrice: '', platformFee: '' }
const formFromProduct = (product: AdminProduct): FormState => ({ title: product.title, description: product.description ?? '', price: String(product.price), currency: product.currency, gold: String(product.gold), rank: product.rank?.toString() ?? '', nations: product.nations.join(', '), vehicles: product.vehicles.join('\n'), premiumVehicles: product.premium_vehicles.join('\n'), battleCount: product.battle_count?.toString() ?? '', badge: product.badge ?? '', status: product.status, funpayUrl: product.funpay_url, costUsd: product.cost_usd?.toString() ?? '', costRub: product.cost_rub?.toString() ?? '', salePrice: product.sale_price?.toString() ?? '', platformFee: product.platform_fee?.toString() ?? '' })
const splitValues = (value: string) => value.split(/[\n,]/).map((item) => item.trim()).filter(Boolean)
const optionalNumber = (value: string) => value.trim() === '' ? null : Number(value)

function createPayload(state: FormState): ProductPayload {
  const price = Number(state.price); const gold = Number(state.gold); const rank = optionalNumber(state.rank); const battleCount = optionalNumber(state.battleCount)
  if (!state.title.trim() || state.title.trim().length < 2) throw new Error('Укажите название не короче 2 символов.')
  if (!Number.isFinite(price) || price < 0) throw new Error('Цена должна быть числом от 0 и выше.')
  if (!Number.isInteger(gold) || gold < 0) throw new Error('GE должно быть целым числом от 0 и выше.')
  if (rank !== null && (!Number.isInteger(rank) || rank < 1 || rank > 8)) throw new Error('Ранг — целое число от 1 до 8.')
  if (battleCount !== null && (!Number.isInteger(battleCount) || battleCount < 0)) throw new Error('Количество боёв должно быть целым числом от 0 и выше.')
  let url: URL
  try { url = new URL(state.funpayUrl) } catch { throw new Error('Укажите корректный URL объявления FunPay.') }
  if (url.protocol !== 'https:') throw new Error('Ссылка FunPay должна использовать HTTPS.')
  const costUsd = optionalNumber(state.costUsd); const costRub = optionalNumber(state.costRub); const salePrice = optionalNumber(state.salePrice); const platformFee = optionalNumber(state.platformFee)
  for (const [label, value] of [['Себестоимость USD', costUsd], ['Себестоимость RUB', costRub], ['Цена продажи', salePrice], ['Комиссия', platformFee]] as const) if (value !== null && (!Number.isFinite(value) || value < 0)) throw new Error(`${label}: укажите число от 0 и выше.`)
  if (platformFee !== null && platformFee > 100) throw new Error('Комиссия не может быть больше 100%.')
  return { title: state.title.trim(), description: state.description.trim() || null, price, currency: state.currency, gold, rank, nations: splitValues(state.nations), vehicles: splitValues(state.vehicles), premium_vehicles: splitValues(state.premiumVehicles), battle_count: battleCount, badge: (state.badge || null) as ProductBadge, status: state.status, funpay_url: url.toString(), cost_usd: costUsd, cost_rub: costRub, sale_price: salePrice, platform_fee: platformFee }
}

export function ProductForm({ product: initialProduct, initialImages = [] }: { product?: AdminProduct; initialImages?: ProductImage[] }) {
  const [form, setForm] = useState<FormState>(initialProduct ? formFromProduct(initialProduct) : emptyForm)
  const [images, setImages] = useState<ProductImage[]>(initialImages)
  const [mainUrl, setMainUrl] = useState<string | null>(initialProduct?.main_image_url ?? null)
  const [mainFile, setMainFile] = useState<File | null>(null)
  const [additionalFiles, setAdditionalFiles] = useState<File[]>([])
  const [showFinancial, setShowFinancial] = useState(false)
  const [saving, setSaving] = useState(false)
  const { showToast } = useToast(); const navigate = useNavigate()
  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm((current) => ({ ...current, [key]: value }))
  const deleteExisting = async (image: ProductImage) => {
    try { await removeProductImage(image.id); await removeStorageFile(image.image_url); setImages((current) => current.filter((item) => item.id !== image.id)); showToast('Изображение удалено.', 'success') }
    catch (reason) { showToast(reason instanceof Error ? reason.message : 'Не удалось удалить изображение.', 'error') }
  }
  const reorderExisting = async (nextImages: ProductImage[]) => {
    setImages(nextImages)
    try { await reorderProductImages(nextImages); showToast('Порядок изображений сохранён.', 'success') }
    catch (reason) { setImages(images); showToast(reason instanceof Error ? reason.message : 'Не удалось изменить порядок.', 'error') }
  }
  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setSaving(true)
    let savedProduct: AdminProduct | null = null
    try {
      const payload = createPayload(form)
      savedProduct = initialProduct ? await updateProduct(initialProduct.id, payload) : await createProduct(payload)
      if (mainFile) { const uploadedMainUrl = await uploadProductImage(savedProduct.id, mainFile, 'main'); await updateProduct(savedProduct.id, { main_image_url: uploadedMainUrl }); setMainUrl(uploadedMainUrl) }
      for (let index = 0; index < additionalFiles.length; index += 1) { const imageUrl = await uploadProductImage(savedProduct.id, additionalFiles[index], 'additional', images.length + index); await addProductImage(savedProduct.id, imageUrl, images.length + index) }
      showToast(initialProduct ? 'Товар обновлён.' : 'Товар создан.', 'success')
      if (!initialProduct) navigate(`/admin/products/${savedProduct.id}/edit`, { replace: true })
      else { setMainFile(null); setAdditionalFiles([]); setImages(await getProductImages(savedProduct.id)) }
    } catch (reason) { showToast(`${savedProduct ? 'Товар сохранён, но ' : ''}${reason instanceof Error ? reason.message : 'не удалось сохранить товар.'}`, 'error'); if (!initialProduct && savedProduct) navigate(`/admin/products/${savedProduct.id}/edit`, { replace: true }) }
    finally { setSaving(false) }
  }
  return <form onSubmit={submit} className="space-y-7"><section className="panel rounded-xl p-5 sm:p-6"><h2 className="text-lg font-bold">Основная информация</h2><div className="mt-5 grid gap-4 md:grid-cols-2"><Field label="Название" required className="md:col-span-2"><input value={form.title} onChange={(event) => update('title', event.target.value)} className="field" required maxLength={160} /></Field><Field label="Цена" required><input value={form.price} onChange={(event) => update('price', event.target.value)} className="field" inputMode="decimal" type="number" min="0" step="0.01" required /></Field><Field label="Валюта"><select value={form.currency} onChange={(event) => update('currency', event.target.value)} className="field"><option value="RUB">RUB</option><option value="USD">USD</option><option value="EUR">EUR</option></select></Field><Field label="Количество GE" required><input value={form.gold} onChange={(event) => update('gold', event.target.value)} className="field" type="number" min="0" step="1" required /></Field><Field label="Ранг"><input value={form.rank} onChange={(event) => update('rank', event.target.value)} className="field" type="number" min="1" max="8" step="1" placeholder="1–8" /></Field><Field label="Нации"><input value={form.nations} onChange={(event) => update('nations', event.target.value)} className="field" placeholder="СССР, Германия" /><Hint>Через запятую</Hint></Field><Field label="Количество боёв"><input value={form.battleCount} onChange={(event) => update('battleCount', event.target.value)} className="field" type="number" min="0" step="1" /></Field><Field label="Бейдж"><select value={form.badge} onChange={(event) => update('badge', event.target.value)} className="field"><option value="">Без бейджа</option><option value="NEW">NEW</option><option value="SALE">SALE</option><option value="TOP">TOP</option></select></Field><Field label="Статус"><select value={form.status} onChange={(event) => update('status', event.target.value as ProductStatus)} className="field"><option value="available">В наличии</option><option value="sold">Продано</option><option value="hidden">Скрыто</option></select></Field><Field label="Ссылка на FunPay" required className="md:col-span-2"><input value={form.funpayUrl} onChange={(event) => update('funpayUrl', event.target.value)} className="field" placeholder="https://funpay.com/..." type="url" required /></Field><Field label="Описание" className="md:col-span-2"><textarea value={form.description} onChange={(event) => update('description', event.target.value)} className="field min-h-32 resize-y" maxLength={5000} /></Field></div></section>
    <section className="panel rounded-xl p-5 sm:p-6"><h2 className="text-lg font-bold">Техника</h2><div className="mt-5 grid gap-4 md:grid-cols-2"><Field label="Основная техника"><textarea value={form.vehicles} onChange={(event) => update('vehicles', event.target.value)} className="field min-h-32 resize-y" placeholder={'T-34-85\nPanther A'} /><Hint>Одна единица с новой строки или через запятую</Hint></Field><Field label="Премиумная техника"><textarea value={form.premiumVehicles} onChange={(event) => update('premiumVehicles', event.target.value)} className="field min-h-32 resize-y" placeholder={'Например, M1 KVT'} /><Hint>Одна единица с новой строки или через запятую</Hint></Field></div></section>
    <section className="panel rounded-xl p-5 sm:p-6"><ImageUploader mainUrl={mainUrl} existingImages={images} mainFile={mainFile} additionalFiles={additionalFiles} setMainFile={setMainFile} setAdditionalFiles={setAdditionalFiles} onDeleteExisting={deleteExisting} onReorderExisting={reorderExisting} disabled={saving} /></section>
    <section className="panel rounded-xl p-5 sm:p-6"><button type="button" onClick={() => setShowFinancial((current) => !current)} className="flex w-full items-center justify-between text-left"><span><span className="block text-lg font-bold">Внутренняя финансовая информация</span><span className="mt-1 block text-sm text-slate-500">Видна только администраторам и никогда не передаётся в публичный каталог.</span></span>{showFinancial ? <EyeOff className="h-5 w-5 text-ice" /> : <Eye className="h-5 w-5 text-slate-400" />}</button>{showFinancial && <div className="mt-5 grid gap-4 md:grid-cols-2"><Field label="Себестоимость, USD"><input value={form.costUsd} onChange={(event) => update('costUsd', event.target.value)} className="field" type="number" min="0" step="0.01" /></Field><Field label="Себестоимость, RUB"><input value={form.costRub} onChange={(event) => update('costRub', event.target.value)} className="field" type="number" min="0" step="0.01" /></Field><Field label="Цена продажи (внутренняя)"><input value={form.salePrice} onChange={(event) => update('salePrice', event.target.value)} className="field" type="number" min="0" step="0.01" /><Hint>Если пусто, прибыль считается от публичной цены.</Hint></Field><Field label="Комиссия площадки, %"><input value={form.platformFee} onChange={(event) => update('platformFee', event.target.value)} className="field" type="number" min="0" max="100" step="0.01" /><Hint>Ставка вводится вручную — не предполагается автоматически.</Hint></Field>{initialProduct?.profit !== null && initialProduct?.profit !== undefined && <p className="md:col-span-2 rounded bg-slate-800 p-3 text-sm text-slate-300">Текущая рассчитанная прибыль: <strong className="text-ice">{initialProduct.profit.toLocaleString('ru-RU')} ₽</strong></p>}</div>}</section>
    <div className="flex justify-end"><button className="btn-primary" disabled={saving}><Save className="h-4 w-4" />{saving ? 'Сохранение…' : initialProduct ? 'Сохранить изменения' : 'Создать товар'}</button></div>
  </form>
}
function Field({ label, children, required, className = '' }: { label: string; children: React.ReactNode; required?: boolean; className?: string }) { return <label className={`block ${className}`}><span className="label">{label}{required && <span className="ml-1 text-rose-300">*</span>}</span>{children}</label> }
function Hint({ children }: { children: React.ReactNode }) { return <span className="mt-1 block text-xs text-slate-500">{children}</span> }
