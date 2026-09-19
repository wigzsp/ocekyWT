import { AlertTriangle, X } from 'lucide-react'

export function ConfirmDialog({ open, title, description, confirmLabel = 'Удалить', busy, onCancel, onConfirm }: {
  open: boolean
  title: string
  description: string
  confirmLabel?: string
  busy?: boolean
  onCancel: () => void
  onConfirm: () => void
}) {
  if (!open) return null
  return <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4" role="presentation" onMouseDown={onCancel}>
    <section role="dialog" aria-modal="true" aria-labelledby="confirm-title" onMouseDown={(event) => event.stopPropagation()} className="panel w-full max-w-md rounded-xl p-6">
      <div className="flex items-start justify-between gap-4"><AlertTriangle className="h-6 w-6 text-amber-300" /><button aria-label="Закрыть" onClick={onCancel} className="text-slate-400 hover:text-white"><X className="h-5 w-5" /></button></div>
      <h2 id="confirm-title" className="mt-4 text-lg font-semibold">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-slate-400">{description}</p>
      <div className="mt-6 flex justify-end gap-3"><button className="btn-secondary" onClick={onCancel} disabled={busy}>Отмена</button><button className="btn-danger" onClick={onConfirm} disabled={busy}>{busy ? 'Удаление…' : confirmLabel}</button></div>
    </section>
  </div>
}
