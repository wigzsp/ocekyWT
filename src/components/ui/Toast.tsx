import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'
import { CheckCircle2, Info, X, XCircle } from 'lucide-react'

type ToastKind = 'success' | 'error' | 'info'
type ToastItem = { id: number; message: string; kind: ToastKind }
type ToastContextValue = { showToast: (message: string, kind?: ToastKind) => void }

const ToastContext = createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([])
  const showToast = useCallback((message: string, kind: ToastKind = 'info') => {
    const id = Date.now() + Math.random()
    setItems((current) => [...current, { id, message, kind }])
    window.setTimeout(() => setItems((current) => current.filter((item) => item.id !== id)), 4500)
  }, [])

  const icon = { success: CheckCircle2, error: XCircle, info: Info }
  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <section aria-live="polite" aria-label="Уведомления" className="fixed bottom-4 right-4 z-[100] flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-2">
        {items.map((item) => {
          const Icon = icon[item.kind]
          const tone = item.kind === 'error' ? 'border-rose-400/50' : item.kind === 'success' ? 'border-emerald-400/50' : 'border-ice/50'
          return <div key={item.id} className={`panel flex items-start gap-3 rounded-lg border ${tone} p-3 text-sm`}>
            <Icon className="mt-0.5 h-4 w-4 shrink-0 text-ice" aria-hidden="true" />
            <p className="flex-1 text-slate-100">{item.message}</p>
            <button onClick={() => setItems((current) => current.filter((toast) => toast.id !== item.id))} aria-label="Закрыть уведомление" className="text-slate-400 hover:text-white"><X className="h-4 w-4" /></button>
          </div>
        })}
      </section>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const value = useContext(ToastContext)
  if (!value) throw new Error('useToast должен использоваться внутри ToastProvider')
  return value
}
