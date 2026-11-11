import { useEffect, useState, type ReactNode } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import PageBanner from '../components/PageBanner'
import TrackForm from '../components/TrackForm'
import { brand } from '../data/site'
import { errorMessage, store } from '../lib/store'
import { STATUS_STYLE, type PublicShipment } from '../lib/types'

const fmtDate = (d: string) => (d ? new Date(d.length === 10 ? `${d}T00:00:00` : d).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : '—')
const fmtDateTime = (d: string) => new Date(d).toLocaleString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })

type State = { kind: 'idle' } | { kind: 'loading' } | { kind: 'found'; s: PublicShipment } | { kind: 'missing' } | { kind: 'error'; message: string }

function Detail({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <dt className="text-[11px] font-bold tracking-[1px] text-muted uppercase">{label}</dt>
      <dd className="mt-0.5 text-[14px] text-[#222]">{children || '—'}</dd>
    </div>
  )
}

function Result({ s }: { s: PublicShipment }) {
  return (
    <div className="mt-8 w-full max-w-[1000px] overflow-hidden rounded border border-line bg-white">
      <div className="relative flex flex-wrap items-center justify-between gap-3 overflow-hidden bg-navy px-6 py-5 text-white after:absolute after:top-0 after:right-10 after:h-full after:w-[5px] after:-skew-x-12 after:bg-red after:content-['']">
        <div>
          <div className="text-[11px] font-bold tracking-[2px] text-white/60">TRACKING NUMBER</div>
          <div className="text-xl font-bold">{s.tracking_number}</div>
        </div>
        <span className={`mr-10 rounded-full px-3 py-1 text-[13px] font-bold ring-1 ring-inset ${STATUS_STYLE[s.status] ?? 'bg-white text-navy'}`}>{s.status}</span>
      </div>

      <div className="border-b border-line px-6 py-5">
        <div className="flex flex-wrap items-center justify-between gap-2 text-[14px]">
          <span><strong className="text-navy">{s.origin}</strong> <span className="text-muted">→</span> <strong className="text-navy">{s.destination}</strong></span>
          <span className="text-muted">{s.progress}% complete</span>
        </div>
        <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-[#e3e8ef]">
          <div className="h-full rounded-full bg-blue" style={{ width: `${s.progress}%` }} />
        </div>
        {s.current_location && <p className="mt-3 text-[14px] text-[#333]">Current location: <strong>{s.current_location}</strong></p>}
        {s.public_note && <p className="mt-3 border-l-4 border-alert-edge bg-alert px-4 py-2.5 text-[14px] text-[#333]">{s.public_note}</p>}
      </div>

      <div className="grid gap-0 md:grid-cols-[1fr_1.2fr]">
        <dl className="grid grid-cols-2 gap-x-4 gap-y-4 border-b border-line px-6 py-5 md:border-r md:border-b-0">
          <Detail label="Shipment type">{s.shipment_type}</Detail>
          <Detail label="Service">{s.service_level}</Detail>
          <Detail label="Sender">{s.sender_name}</Detail>
          <Detail label="Receiver">{s.receiver_name}</Detail>
          <Detail label="Contents">{s.description}</Detail>
          <Detail label="Pieces">{s.quantity}</Detail>
          <Detail label="Weight">{s.weight_kg != null ? `${s.weight_kg} kg` : ''}</Detail>
          <Detail label="Dimensions">{s.dimensions}</Detail>
          <Detail label="Pickup date">{s.pickup_date && fmtDate(s.pickup_date)}</Detail>
          <Detail label="Departure date">{s.departure_date && fmtDate(s.departure_date)}</Detail>
          <Detail label="Estimated delivery">{s.estimated_delivery && fmtDate(s.estimated_delivery)}</Detail>
          <Detail label="Delivered">{s.delivered_date && fmtDate(s.delivered_date)}</Detail>
        </dl>

        <div className="px-6 py-5">
          <h2 className="mb-4 text-[16px] font-bold text-navy">Shipment history</h2>
          {s.events.length === 0 ? (
            <p className="text-[14px] text-muted">No updates yet.</p>
          ) : (
            <ol className="relative ml-1.5 border-l-2 border-line">
              {s.events.map((e, i) => (
                <li key={`${e.date}-${i}`} className="relative mb-4 pl-5 last:mb-0">
                  <span className={`absolute top-1 -left-[8px] size-3.5 rounded-full border-2 border-white ${i === 0 ? 'bg-blue ring-2 ring-blue/30' : 'bg-[#b8c4d4]'}`} />
                  <div className="text-[14px] font-bold text-navy">{e.status}</div>
                  <div className="text-[13px] text-[#333]">
                    {e.note}
                    {e.location && <span className="text-muted">{e.note ? ' — ' : ''}{e.location}</span>}
                  </div>
                  <div className="text-[12px] text-muted">{fmtDateTime(e.date)}</div>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>
    </div>
  )
}

export default function Track() {
  const [params] = useSearchParams()
  const code = params.get('code')?.trim() ?? ''
  const [state, setState] = useState<State>({ kind: 'idle' })
  const [lastCode, setLastCode] = useState('')

  // Reset to "loading" as soon as the code changes (during render, not in an effect).
  if (code !== lastCode) {
    setLastCode(code)
    setState(code ? { kind: 'loading' } : { kind: 'idle' })
  }

  useEffect(() => {
    document.title = `Track a Shipment | ${brand.name}`
  }, [])

  useEffect(() => {
    if (!code) return
    let live = true
    store.track(code).then(
      (s) => live && setState(s ? { kind: 'found', s } : { kind: 'missing' }),
      (e) => live && setState({ kind: 'error', message: errorMessage(e) }),
    )
    return () => {
      live = false
    }
  }, [code])

  return (
    <>
      <PageBanner image="/img/img-cargo-hero.jpg" title="Track a Shipment">
        Enter your tracking number to see the latest status of your freight.
      </PageBanner>
      <section className="bg-paper px-5 pt-14 pb-16 md:px-10">
        <div className="mx-auto flex max-w-[1175px] flex-col items-start">
          <TrackForm key={code} variant="hero" initial={code} />
          {state.kind === 'idle' && <p className="mt-3.5 text-[14px] text-muted">You can find your tracking number on your booking confirmation email.</p>}
          {state.kind === 'loading' && <p className="mt-8 text-[14px] text-muted">Looking up {code}…</p>}
          {state.kind === 'found' && <Result s={state.s} />}
          {(state.kind === 'missing' || state.kind === 'error') && (
            <div className="mt-8 w-full max-w-[760px] border-l-[15px] border-alert-edge bg-alert px-[30px] py-5 text-[14px] leading-[22px] text-[#333]">
              {state.kind === 'missing' ? (
                <>
                  <strong>No shipment found for “{code}”.</strong> Check the number and try again, or{' '}
                </>
              ) : (
                <>
                  <strong>{state.message}</strong> If this keeps happening,{' '}
                </>
              )}
              <Link to="/contact" className="text-blue underline">contact our support team</Link> for help.
            </div>
          )}
        </div>
      </section>
    </>
  )
}
