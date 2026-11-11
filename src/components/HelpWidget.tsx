import { useEffect, useState } from 'react'
import { brand } from '../data/site'
import { ChatIcon, MailIcon, TruckIcon, WhatsAppIcon } from './Icons'
import TrackForm from './TrackForm'

declare global {
  interface Window {
    smartsupp?: (...args: unknown[]) => void
    _smartsupp?: Record<string, unknown>
  }
}

/** Loads the Smartsupp live-chat script once, with its own bubble hidden (the widget opens it). */
function useSmartsupp(key: string) {
  useEffect(() => {
    if (!key || window.smartsupp) return
    window._smartsupp = { key, hideWidget: true }
    const queue: unknown[][] = []
    const fn = (...args: unknown[]) => void queue.push(args)
    ;(fn as unknown as { _: unknown[][] })._ = queue
    window.smartsupp = fn
    const s = document.createElement('script')
    s.async = true
    s.src = 'https://www.smartsuppchat.com/loader.js?'
    document.body.appendChild(s)
  }, [key])
}

const option = 'flex w-full items-center gap-3.5 border-b border-line bg-white px-5 py-[15px] text-left transition-colors hover:bg-paper'

function Option({ title, sub }: { title: string; sub: string }) {
  return (
    <div>
      <strong className="block text-[14px] leading-tight font-bold text-navy">{title}</strong>
      <span className="text-xs text-muted">{sub}</span>
    </div>
  )
}

export default function HelpWidget() {
  const [open, setOpen] = useState(false)
  useSmartsupp(brand.smartsuppKey)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const openChat = () => {
    setOpen(false)
    window.smartsupp?.('chat:show')
    window.smartsupp?.('chat:open')
  }

  return (
    <>
      {open && <div className="fixed inset-0 z-[99997]" onClick={() => setOpen(false)} />}

      {open && (
        <div
          role="menu"
          className="fixed right-3 bottom-24 z-[99999] flex w-[calc(100vw-24px)] max-w-[320px] animate-pop-up flex-col overflow-hidden rounded border border-line bg-white shadow-[0_20px_60px_rgba(0,75,135,0.15)] md:right-[18px] md:bottom-[92px] md:w-[320px]"
        >
          <div className="relative overflow-hidden bg-navy px-5 pt-5 pb-[18px] after:absolute after:top-0 after:right-[26px] after:h-full after:w-[5px] after:-skew-x-12 after:bg-red after:content-['']">
            <strong className="block text-[17px] font-bold text-white">{brand.name} Support</strong>
            <span className="mt-1 flex items-center gap-1.5 text-xs text-white/75">
              <span className="size-[7px] shrink-0 rounded-full bg-[#4ade80]" />
              Online &mdash; we usually reply instantly
            </span>
          </div>

          <TrackForm variant="widget" onSubmitted={() => setOpen(false)} />

          {brand.smartsuppKey && (
            <button type="button" role="menuitem" onClick={openChat} className={option}>
              <ChatIcon className="size-[22px] shrink-0" />
              <Option title="Live Chat" sub="Chat with an operator now" />
            </button>
          )}
          <a
            role="menuitem"
            href={`https://wa.me/${brand.whatsapp}?text=${encodeURIComponent(`Hello ${brand.name}!`)}`}
            target="_blank"
            rel="noopener"
            onClick={() => setOpen(false)}
            className={option}
          >
            <WhatsAppIcon className="size-[22px] shrink-0" />
            <Option title="WhatsApp" sub="Message us any time" />
          </a>
          <a role="menuitem" href={`mailto:${brand.email}`} onClick={() => setOpen(false)} className={option}>
            <MailIcon className="size-[22px] shrink-0" />
            <Option title="Email Us" sub="We reply within a few hours" />
          </a>
          <div className="border-t border-line bg-paper px-5 pt-2.5 pb-3 text-center text-[11px] text-muted">
            {brand.name} &middot; American Land &amp; Express
          </div>
        </div>
      )}

      <button
        type="button"
        aria-haspopup="true"
        aria-expanded={open}
        aria-label={`Contact ${brand.name}`}
        onClick={() => setOpen((o) => !o)}
        className="group fixed right-3.5 bottom-4 z-[99998] animate-slide-in active:scale-[0.97] md:right-[18px] md:bottom-6"
      >
        <span className="relative z-[1] flex items-center gap-[9px] py-2.5 pr-5 pl-4 text-left text-white md:py-3 md:pr-6 md:pl-5 before:absolute before:inset-0 before:-z-10 before:origin-[0_35%] before:-skew-x-12 before:bg-navy before:shadow-[0_6px_18px_rgba(0,40,80,0.35)] before:transition-colors before:content-[''] group-hover:before:bg-navy-dark after:absolute after:top-0 after:-right-[9px] after:h-full after:w-[5px] after:origin-[0_35%] after:-skew-x-12 after:bg-red after:content-['']">
          <TruckIcon className="size-[22px] shrink-0" />
          <span>
            <span className="block text-[13px] leading-none font-bold tracking-[0.4px] whitespace-nowrap">TRACK &amp; HELP</span>
            <span className="mt-[3px] flex items-center gap-[5px] text-[9px] leading-none whitespace-nowrap text-white/65">
              <span className="size-1.5 shrink-0 rounded-full bg-[#4ade80]" />
              Support online
            </span>
          </span>
        </span>
      </button>
    </>
  )
}
