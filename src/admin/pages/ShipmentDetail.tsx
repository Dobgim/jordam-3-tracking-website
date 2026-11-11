import { useCallback, useEffect, useState, type FormEvent, type ReactNode } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { brand } from '../../data/site'
import { errorMessage, store } from '../../lib/store'
import { STATUSES, dimensionsText, type EventInput, type Party, type Shipment, type ShipmentEvent, type Status } from '../../lib/types'
import { Button, Card, ErrorBox, Field, Input, ProgressBar, Select, Spinner, StatusBadge, fmtDate, fmtDateTime, fmtMoney, fromLocalInput, toLocalInput, useUI } from '../ui'

function Info({ rows }: { rows: [string, ReactNode][] }) {
  return (
    <dl className="grid grid-cols-[130px_1fr] gap-x-3 gap-y-2 text-[14px]">
      {rows.map(([k, v]) => (
        <div key={k} className="contents">
          <dt className="text-muted">{k}</dt>
          <dd className="break-words text-[#222]">{v || '—'}</dd>
        </div>
      ))}
    </dl>
  )
}

const partyRows = (p: Party): [string, ReactNode][] => [
  ['Name', p.name],
  ['Email', p.email && <a key="e" href={`mailto:${p.email}`} className="text-blue hover:underline">{p.email}</a>],
  ['Phone', p.phone && <a key="p" href={`tel:${p.phone}`} className="text-blue hover:underline">{p.phone}</a>],
  ['Address', p.address],
]

const blankEvent = (s: Shipment): EventInput => ({ date: new Date().toISOString(), status: s.status, location: s.current_location, note: '' })

export default function ShipmentDetail() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const { confirm, toast } = useUI()
  const [s, setS] = useState<Shipment | null | undefined>(undefined)
  const [events, setEvents] = useState<ShipmentEvent[]>([])
  const [error, setError] = useState('')
  const [draft, setDraft] = useState<EventInput | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    try {
      const [ship, evs] = await Promise.all([store.getShipment(id), store.listEvents(id)])
      setS(ship)
      setEvents(evs)
    } catch (e) {
      setError(errorMessage(e))
    }
  }, [id])

  useEffect(() => {
    load()
  }, [load])

  if (error) return <ErrorBox>{error}</ErrorBox>
  if (s === undefined) return <Spinner />
  if (s === null)
    return (
      <ErrorBox>
        Shipment not found. <Link to="/admin/shipments" className="underline">Back to shipments</Link>
      </ErrorBox>
    )

  const publicUrl = `${window.location.origin}/track?code=${encodeURIComponent(s.tracking_number)}`

  const remove = async () => {
    const ok = await confirm({ title: 'Delete shipment', message: <>Delete <strong>{s.tracking_number}</strong> and its tracking history? This cannot be undone.</>, confirmLabel: 'Delete', danger: true })
    if (!ok) return
    try {
      await store.deleteShipment(s.id)
      toast(`Deleted ${s.tracking_number}`)
      navigate('/admin/shipments')
    } catch (e) {
      toast(errorMessage(e), 'error')
    }
  }

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl)
      toast('Tracking link copied')
    } catch {
      toast(publicUrl)
    }
  }

  const saveEvent = async (e: FormEvent) => {
    e.preventDefault()
    if (!draft) return
    setBusy(true)
    try {
      if (editingId) await store.updateEvent(editingId, draft)
      else await store.addEvent(s.id, draft)
      toast(editingId ? 'Update saved' : 'Tracking update added')
      setDraft(null)
      setEditingId(null)
      await load()
    } catch (err) {
      toast(errorMessage(err), 'error')
    } finally {
      setBusy(false)
    }
  }

  const deleteEvent = async (ev: ShipmentEvent) => {
    const ok = await confirm({ title: 'Delete tracking update', message: <>Remove “{ev.note || ev.status}” from {fmtDateTime(ev.date)}?</>, confirmLabel: 'Delete', danger: true })
    if (!ok) return
    try {
      await store.deleteEvent(ev.id)
      setEvents((all) => all.filter((x) => x.id !== ev.id))
      toast('Update deleted')
    } catch (e) {
      toast(errorMessage(e), 'error')
    }
  }

  const eventForm = draft && (
    <form onSubmit={saveEvent} className="mb-5 grid gap-3 rounded border border-blue/30 bg-[#f4f8fc] p-4 sm:grid-cols-2 print:hidden">
      <Field label="Date & time">
        <Input type="datetime-local" required value={toLocalInput(draft.date)} onChange={(e) => e.target.value && setDraft({ ...draft, date: fromLocalInput(e.target.value) })} />
      </Field>
      <Field label="Status">
        <Select value={draft.status} onChange={(e) => setDraft({ ...draft, status: e.target.value as Status })} options={STATUSES} />
      </Field>
      <Field label="Location">
        <Input value={draft.location} onChange={(e) => setDraft({ ...draft, location: e.target.value })} placeholder="e.g. Chicago sorting hub" />
      </Field>
      <Field label="Note">
        <Input value={draft.note} onChange={(e) => setDraft({ ...draft, note: e.target.value })} placeholder="e.g. Departed facility" />
      </Field>
      <div className="flex items-center gap-2 sm:col-span-2">
        <Button type="submit" disabled={busy}>{busy ? 'Saving…' : editingId ? 'Save update' : 'Add update'}</Button>
        <Button variant="secondary" onClick={() => { setDraft(null); setEditingId(null) }}>Cancel</Button>
        {!editingId && <span className="text-[12px] text-muted">The newest update also sets the shipment's status and location.</span>}
      </div>
    </form>
  )

  return (
    <div className="space-y-5">
      {/* Print-only letterhead */}
      <div className="hidden items-center justify-between border-b-[3px] border-red pb-3 print:flex">
        <img src={brand.logo} alt={brand.name} className="h-12" />
        <div className="text-right text-[12px]">{brand.name} · {brand.email}<br />Printed {new Date().toLocaleString()}</div>
      </div>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link to="/admin/shipments" className="text-[13px] font-bold text-blue hover:underline print:hidden">← All shipments</Link>
          <h1 className="flex flex-wrap items-center gap-3 text-2xl font-bold text-navy">
            {s.tracking_number} <StatusBadge status={s.status} />
          </h1>
          <p className="text-[13px] text-muted">
            {s.shipment_type} · {s.service_level} · created {fmtDateTime(s.created_at)} · updated {fmtDateTime(s.updated_at)}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 print:hidden">
          <Button variant="secondary" onClick={copyLink}>Copy tracking link</Button>
          <a href={publicUrl} target="_blank" rel="noopener"><Button variant="secondary">View as customer</Button></a>
          <Button variant="secondary" onClick={() => window.print()}>Print</Button>
          <Link to={`/admin/shipments/${s.id}/edit`}><Button>Edit</Button></Link>
          <Button variant="danger" onClick={remove}>Delete</Button>
        </div>
      </div>

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-2 text-[14px]">
          <span><strong className="text-navy">{s.origin}</strong> → <strong className="text-navy">{s.destination}</strong></span>
          <span className="text-muted">Now: <strong className="text-[#222]">{s.current_location || '—'}</strong> · {s.progress}%</span>
        </div>
        <div className="mt-3"><ProgressBar value={s.progress} /></div>
      </Card>

      <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3 print:grid-cols-2">
        <Card title="Sender"><Info rows={partyRows(s.sender)} /></Card>
        <Card title="Receiver"><Info rows={partyRows(s.receiver)} /></Card>
        <Card title="Package">
          <Info rows={[
            ['Description', s.description],
            ['Quantity', s.quantity],
            ['Weight', s.weight_kg != null ? `${s.weight_kg} kg` : ''],
            ['Dimensions', dimensionsText(s)],
            ['Declared value', s.declared_value != null ? fmtMoney(s.declared_value, s.currency) : ''],
          ]} />
        </Card>
        <Card title="Transport">
          <Info rows={[['Carrier', s.carrier], ['Vehicle / vessel', s.vehicle_ref], ['Origin', s.origin], ['Destination', s.destination]]} />
        </Card>
        <Card title="Dates">
          <Info rows={[['Pickup', fmtDate(s.pickup_date)], ['Departure', fmtDate(s.departure_date)], ['Estimated delivery', fmtDate(s.estimated_delivery)], ['Delivered', fmtDate(s.delivered_date)]]} />
        </Card>
        <Card title="Payment">
          <Info rows={[['Shipping cost', fmtMoney(s.shipping_cost, s.currency)], ['Status', s.payment_status], ['Method', s.payment_method]]} />
        </Card>
      </div>

      {(s.public_note || s.internal_note) && (
        <div className="grid gap-5 md:grid-cols-2">
          {s.public_note && <Card title="Message for the customer"><p className="text-[14px] whitespace-pre-wrap">{s.public_note}</p></Card>}
          {s.internal_note && <Card title="Internal note" className="print:hidden"><p className="text-[14px] whitespace-pre-wrap">{s.internal_note}</p></Card>}
        </div>
      )}

      <Card
        title={`Tracking history (${events.length})`}
        actions={!draft && <Button className="print:hidden" onClick={() => { setEditingId(null); setDraft(blankEvent(s)) }}>+ Add tracking update</Button>}
      >
        {!editingId && eventForm}
        {events.length === 0 ? (
          <p className="text-muted">No tracking updates yet.</p>
        ) : (
          <ol className="relative ml-2 border-l-2 border-line">
            {events.map((ev, i) => (
              <li key={ev.id} className="relative mb-5 pl-6 last:mb-0">
                <span className={`absolute top-1 -left-[9px] size-4 rounded-full border-[3px] border-white ${i === 0 ? 'bg-blue ring-2 ring-blue/30' : 'bg-[#b8c4d4]'}`} />
                {editingId === ev.id ? (
                  eventForm
                ) : (
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <StatusBadge status={ev.status} />
                        <span className="text-[13px] text-muted">{fmtDateTime(ev.date)}</span>
                      </div>
                      <div className="mt-1 text-[14px] text-[#222]">
                        {ev.note}
                        {ev.location && <span className="text-muted"> — {ev.location}</span>}
                      </div>
                    </div>
                    <div className="flex gap-1 print:hidden">
                      <Button variant="ghost" className="!px-2 !py-1 !text-[13px]" onClick={() => { setEditingId(ev.id); setDraft({ date: ev.date, status: ev.status, location: ev.location, note: ev.note }) }}>Edit</Button>
                      <Button variant="ghost" className="!px-2 !py-1 !text-[13px] !text-red" onClick={() => deleteEvent(ev)}>Delete</Button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ol>
        )}
      </Card>
    </div>
  )
}
