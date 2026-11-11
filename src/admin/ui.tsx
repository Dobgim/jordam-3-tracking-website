import { createContext, useCallback, useContext, useEffect, useRef, useState, type ComponentProps, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react'
import { STATUS_STYLE, type Status } from '../lib/types'

/* ── Buttons ───────────────────────────────────────────────────────── */
type Variant = 'primary' | 'secondary' | 'danger' | 'ghost'
const variants: Record<Variant, string> = {
  primary: 'bg-navy text-white hover:bg-navy-dark border-navy',
  secondary: 'bg-white text-navy border-line hover:bg-paper',
  danger: 'bg-white text-red border-red/40 hover:bg-red hover:text-white',
  ghost: 'border-transparent text-navy hover:bg-paper',
}

export function Button({ variant = 'primary', className = '', ...p }: ComponentProps<'button'> & { variant?: Variant }) {
  return (
    <button
      type="button"
      {...p}
      className={`inline-flex items-center justify-center gap-2 rounded-[3px] border px-4 py-2 text-[14px] font-bold whitespace-nowrap transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
    />
  )
}

/* ── Form fields ───────────────────────────────────────────────────── */
export const inputCls =
  'w-full rounded-[3px] border border-[#c4c4c4] bg-white px-3 py-2 text-[14px] text-[#222] outline-none transition-colors placeholder:text-[#999] focus:border-navy focus:ring-2 focus:ring-navy/15 disabled:bg-paper'

export function Field({ label, hint, className = '', children }: { label: string; hint?: string; className?: string; children: ReactNode }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1 block text-[12px] font-bold tracking-[0.3px] text-navy uppercase">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-[12px] text-muted">{hint}</span>}
    </label>
  )
}

export const Input = (p: InputHTMLAttributes<HTMLInputElement>) => <input {...p} className={`${inputCls} ${p.className ?? ''}`} />
export const Textarea = (p: TextareaHTMLAttributes<HTMLTextAreaElement>) => <textarea rows={3} {...p} className={`${inputCls} ${p.className ?? ''}`} />
export function Select({ options, emptyLabel = '—', ...p }: SelectHTMLAttributes<HTMLSelectElement> & { options: readonly string[]; emptyLabel?: string }) {
  return (
    <select {...p} className={`${inputCls} ${p.className ?? ''}`}>
      {options.map((o) => (
        <option key={o} value={o}>
          {o || emptyLabel}
        </option>
      ))}
    </select>
  )
}

/* ── Cards & badges ────────────────────────────────────────────────── */
export function Card({ title, actions, children, className = '' }: { title?: ReactNode; actions?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={`rounded border border-line bg-white ${className}`}>
      {(title || actions) && (
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-3.5">
          <h2 className="text-[15px] font-bold text-navy">{title}</h2>
          {actions}
        </header>
      )}
      <div className="p-5">{children}</div>
    </section>
  )
}

export function StatusBadge({ status }: { status: Status }) {
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[12px] font-bold whitespace-nowrap ring-1 ring-inset ${STATUS_STYLE[status] ?? ''}`}>{status}</span>
}

export function ProgressBar({ value }: { value: number }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-[#e3e8ef]" role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}>
      <div className="h-full rounded-full bg-blue transition-[width] duration-500" style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  )
}

export function Spinner({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 py-16 text-muted">
      <span className="size-5 animate-spin rounded-full border-2 border-navy/20 border-t-navy" />
      {label}
    </div>
  )
}

export function ErrorBox({ children }: { children: ReactNode }) {
  return <div className="rounded border-l-4 border-red bg-red-50 px-4 py-3 text-[14px] text-[#8a1c12]" role="alert">{children}</div>
}

/* ── Dates ─────────────────────────────────────────────────────────── */
export const fmtDate = (d: string) => (d ? new Date(d.length === 10 ? `${d}T00:00:00` : d).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : '—')
export const fmtDateTime = (d: string) => (d ? new Date(d).toLocaleString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—')
export const fmtMoney = (n: number | null, currency: string) => (n == null ? '—' : new Intl.NumberFormat(undefined, { style: 'currency', currency: currency || 'USD' }).format(n))

/** ISO timestamp ↔ value for <input type="datetime-local"> in the admin's own time zone. */
export const toLocalInput = (iso: string) => {
  const d = new Date(iso)
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
}
export const fromLocalInput = (v: string) => new Date(v).toISOString()

/* ── Confirm dialog ────────────────────────────────────────────────── */
interface ConfirmOptions {
  title: string
  message: ReactNode
  confirmLabel?: string
  danger?: boolean
}
type Confirm = (o: ConfirmOptions) => Promise<boolean>

/* ── Toasts ────────────────────────────────────────────────────────── */
type Toast = (message: string, kind?: 'ok' | 'error') => void

const Ctx = createContext<{ confirm: Confirm; toast: Toast } | null>(null)

export function UIProvider({ children }: { children: ReactNode }) {
  const [dialog, setDialog] = useState<(ConfirmOptions & { resolve: (v: boolean) => void }) | null>(null)
  const [toasts, setToasts] = useState<{ id: number; message: string; kind: 'ok' | 'error' }[]>([])
  const confirmBtn = useRef<HTMLButtonElement>(null)

  const confirm = useCallback<Confirm>((o) => new Promise((resolve) => setDialog({ ...o, resolve })), [])
  const toast = useCallback<Toast>((message, kind = 'ok') => {
    const id = Date.now() + Math.random()
    setToasts((t) => [...t, { id, message, kind }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500)
  }, [])

  const close = (v: boolean) => {
    dialog?.resolve(v)
    setDialog(null)
  }

  useEffect(() => {
    if (!dialog) return
    confirmBtn.current?.focus()
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  return (
    <Ctx.Provider value={{ confirm, toast }}>
      {children}
      {dialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => close(false)}>
          <div role="alertdialog" aria-modal="true" aria-labelledby="dlg-title" className="w-full max-w-md overflow-hidden rounded bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className={`border-b-[3px] px-5 py-4 ${dialog.danger ? 'border-red' : 'border-navy'}`}>
              <h2 id="dlg-title" className="text-lg font-bold text-navy">{dialog.title}</h2>
            </div>
            <div className="px-5 py-4 text-[14px] leading-[22px] text-[#333]">{dialog.message}</div>
            <div className="flex justify-end gap-2 bg-paper px-5 py-3">
              <Button variant="secondary" onClick={() => close(false)}>Cancel</Button>
              <Button ref={confirmBtn} variant={dialog.danger ? 'danger' : 'primary'} className={dialog.danger ? '!bg-red !text-white' : ''} onClick={() => close(true)}>
                {dialog.confirmLabel ?? 'Confirm'}
              </Button>
            </div>
          </div>
        </div>
      )}
      <div className="pointer-events-none fixed right-4 bottom-4 z-[60] flex flex-col gap-2" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`pointer-events-auto rounded px-4 py-3 text-[14px] font-bold text-white shadow-lg ${t.kind === 'error' ? 'bg-red' : 'bg-navy'}`}>
            {t.message}
          </div>
        ))}
      </div>
    </Ctx.Provider>
  )
}

export function useUI() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useUI must be used inside UIProvider')
  return ctx
}
