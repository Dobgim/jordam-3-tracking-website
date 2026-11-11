import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { errorMessage, store } from '../../lib/store'
import {
  CURRENCIES,
  PAYMENT_METHODS,
  PAYMENT_STATUSES,
  SERVICE_LEVELS,
  STATUSES,
  STATUS_PROGRESS,
  emptyShipment,
  newTrackingNumber,
  type Party,
  type ShipmentInput,
  type Status,
} from '../../lib/types'
import { Button, Card, ErrorBox, Field, Input, Select, Spinner, Textarea, useUI } from '../ui'

type NumKey = 'weight_kg' | 'length_cm' | 'width_cm' | 'height_cm' | 'declared_value' | 'shipping_cost'

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Card title={title}>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{children}</div>
    </Card>
  )
}

export default function ShipmentForm() {
  const { id } = useParams()
  const editing = Boolean(id)
  const navigate = useNavigate()
  const { toast } = useUI()

  const [form, setForm] = useState<ShipmentInput | null>(editing ? null : emptyShipment())
  const [types, setTypes] = useState<string[]>([])
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [dirty, setDirty] = useState(false)

  useEffect(() => {
    store.listTypes().then(
      (t) => {
        const names = t.map((x) => x.name)
        setTypes(names)
        if (!editing) setForm((f) => (f && !names.includes(f.shipment_type) ? { ...f, shipment_type: names[0] ?? '' } : f))
      },
      (e) => setError(errorMessage(e)),
    )
    if (id)
      store.getShipment(id).then(
        (s) => (s ? setForm(s) : setError('Shipment not found.')),
        (e) => setError(errorMessage(e)),
      )
  }, [id, editing])

  // Warn before leaving with unsaved changes.
  useEffect(() => {
    if (!dirty) return
    const h = (e: BeforeUnloadEvent) => e.preventDefault()
    window.addEventListener('beforeunload', h)
    return () => window.removeEventListener('beforeunload', h)
  }, [dirty])

  if (error && !form) return <ErrorBox>{error}</ErrorBox>
  if (!form) return <Spinner />

  const set = <K extends keyof ShipmentInput>(k: K, v: ShipmentInput[K]) => {
    setForm({ ...form, [k]: v })
    setDirty(true)
  }
  const setParty = (who: 'sender' | 'receiver', k: keyof Party, v: string) => set(who, { ...form[who], [k]: v })
  const setNum = (k: NumKey, v: string) => set(k, v === '' ? null : Math.max(0, Number(v)))
  const setStatus = (s: Status) => {
    const p = STATUS_PROGRESS[s]
    const today = new Date().toISOString().slice(0, 10)
    setForm({ ...form, status: s, progress: p >= 0 ? p : form.progress, delivered_date: s === 'Delivered' && !form.delivered_date ? today : form.delivered_date })
    setDirty(true)
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const saved = id ? await store.updateShipment(id, form) : await store.createShipment(form)
      setDirty(false)
      toast(id ? 'Shipment saved' : `Shipment ${saved.tracking_number} created`)
      navigate(`/admin/shipments/${saved.id}`)
    } catch (err) {
      setError(errorMessage(err))
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } finally {
      setSaving(false)
    }
  }

  const typeOptions = types.includes(form.shipment_type) || !form.shipment_type ? types : [form.shipment_type, ...types]
  const num = (k: NumKey) => (form[k] ?? '') as number | ''

  return (
    <form onSubmit={submit} className="space-y-5 pb-24">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link to={id ? `/admin/shipments/${id}` : '/admin/shipments'} className="text-[13px] font-bold text-blue hover:underline">← Back</Link>
          <h1 className="text-2xl font-bold text-navy">{editing ? `Edit ${form.tracking_number}` : 'New Shipment'}</h1>
        </div>
      </div>

      {error && <ErrorBox>{error}</ErrorBox>}

      <Section title="Shipment">
        <Field label="Tracking number" hint={editing ? undefined : 'Leave blank to generate one automatically.'} className="lg:col-span-2">
          <div className="flex gap-2">
            <Input value={form.tracking_number} onChange={(e) => set('tracking_number', e.target.value.toUpperCase())} placeholder="TJ-2026-XXXXXXX" pattern="[A-Za-z0-9\- ]{4,40}" />
            <Button variant="secondary" onClick={() => set('tracking_number', newTrackingNumber())}>Generate</Button>
          </div>
        </Field>
        <Field label="Shipment type">
          <Select value={form.shipment_type} onChange={(e) => set('shipment_type', e.target.value)} options={typeOptions} required />
        </Field>
        <Field label="Service level">
          <Select value={form.service_level} onChange={(e) => set('service_level', e.target.value)} options={SERVICE_LEVELS} />
        </Field>
        <Field label="Status" hint="Changing it adds an entry to the tracking history.">
          <Select value={form.status} onChange={(e) => setStatus(e.target.value as Status)} options={STATUSES} />
        </Field>
        <Field label={`Progress: ${form.progress}%`} className="lg:col-span-3">
          <input type="range" min={0} max={100} step={5} value={form.progress} onChange={(e) => set('progress', Number(e.target.value))} className="mt-2 w-full accent-[#004B87]" />
        </Field>
      </Section>

      <Section title="Route">
        <Field label="Origin *" className="lg:col-span-2">
          <Input required value={form.origin} onChange={(e) => set('origin', e.target.value)} placeholder="City, Country" maxLength={200} />
        </Field>
        <Field label="Destination *" className="lg:col-span-2">
          <Input required value={form.destination} onChange={(e) => set('destination', e.target.value)} placeholder="City, Country" maxLength={200} />
        </Field>
        <Field label="Current location" className="lg:col-span-2">
          <Input value={form.current_location} onChange={(e) => set('current_location', e.target.value)} placeholder="Where the shipment is now" />
        </Field>
        <Field label="Carrier">
          <Input value={form.carrier} onChange={(e) => set('carrier', e.target.value)} placeholder="e.g. Jordans Fleet" />
        </Field>
        <Field label="Vehicle / vessel / flight">
          <Input value={form.vehicle_ref} onChange={(e) => set('vehicle_ref', e.target.value)} placeholder="e.g. Truck 14, MV Atlas" />
        </Field>
      </Section>

      {(['sender', 'receiver'] as const).map((who) => (
        <Section key={who} title={who === 'sender' ? 'Sender' : 'Receiver'}>
          <Field label="Full name"><Input value={form[who].name} onChange={(e) => setParty(who, 'name', e.target.value)} /></Field>
          <Field label="Email"><Input type="email" value={form[who].email} onChange={(e) => setParty(who, 'email', e.target.value)} /></Field>
          <Field label="Phone"><Input type="tel" value={form[who].phone} onChange={(e) => setParty(who, 'phone', e.target.value)} /></Field>
          <Field label="Address"><Input value={form[who].address} onChange={(e) => setParty(who, 'address', e.target.value)} /></Field>
        </Section>
      ))}

      <Section title="Package">
        <Field label="Description" className="lg:col-span-2">
          <Input value={form.description} onChange={(e) => set('description', e.target.value)} placeholder="e.g. 4 pallets of auto parts" />
        </Field>
        <Field label="Quantity (pieces)">
          <Input type="number" min={0} step={1} value={form.quantity} onChange={(e) => set('quantity', Math.max(0, Math.floor(Number(e.target.value))))} />
        </Field>
        <Field label="Weight (kg)">
          <Input type="number" min={0} step="any" value={num('weight_kg')} onChange={(e) => setNum('weight_kg', e.target.value)} />
        </Field>
        <Field label="Length (cm)"><Input type="number" min={0} step="any" value={num('length_cm')} onChange={(e) => setNum('length_cm', e.target.value)} /></Field>
        <Field label="Width (cm)"><Input type="number" min={0} step="any" value={num('width_cm')} onChange={(e) => setNum('width_cm', e.target.value)} /></Field>
        <Field label="Height (cm)"><Input type="number" min={0} step="any" value={num('height_cm')} onChange={(e) => setNum('height_cm', e.target.value)} /></Field>
        <Field label="Declared value">
          <Input type="number" min={0} step="any" value={num('declared_value')} onChange={(e) => setNum('declared_value', e.target.value)} />
        </Field>
      </Section>

      <Section title="Payment">
        <Field label="Shipping cost"><Input type="number" min={0} step="any" value={num('shipping_cost')} onChange={(e) => setNum('shipping_cost', e.target.value)} /></Field>
        <Field label="Currency"><Select value={form.currency} onChange={(e) => set('currency', e.target.value)} options={CURRENCIES} /></Field>
        <Field label="Payment status"><Select value={form.payment_status} onChange={(e) => set('payment_status', e.target.value)} options={PAYMENT_STATUSES} /></Field>
        <Field label="Payment method"><Select value={form.payment_method} onChange={(e) => set('payment_method', e.target.value)} options={PAYMENT_METHODS} /></Field>
      </Section>

      <Section title="Dates">
        <Field label="Pickup date"><Input type="date" value={form.pickup_date} onChange={(e) => set('pickup_date', e.target.value)} /></Field>
        <Field label="Departure date"><Input type="date" value={form.departure_date} onChange={(e) => set('departure_date', e.target.value)} /></Field>
        <Field label="Estimated delivery"><Input type="date" value={form.estimated_delivery} onChange={(e) => set('estimated_delivery', e.target.value)} /></Field>
        <Field label="Delivered on"><Input type="date" value={form.delivered_date} onChange={(e) => set('delivered_date', e.target.value)} /></Field>
      </Section>

      <Card title="Notes">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Message for the customer" hint="Shown on the public tracking page.">
            <Textarea value={form.public_note} onChange={(e) => set('public_note', e.target.value)} />
          </Field>
          <Field label="Internal note" hint="Only visible to admins.">
            <Textarea value={form.internal_note} onChange={(e) => set('internal_note', e.target.value)} />
          </Field>
        </div>
      </Card>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-white/95 px-4 py-3 backdrop-blur lg:left-64">
        <div className="flex items-center justify-end gap-2">
          {dirty && <span className="mr-auto text-[13px] text-muted">Unsaved changes</span>}
          <Link to={id ? `/admin/shipments/${id}` : '/admin/shipments'}><Button variant="secondary">Cancel</Button></Link>
          <Button type="submit" disabled={saving}>{saving ? 'Saving…' : editing ? 'Save changes' : 'Create shipment'}</Button>
        </div>
      </div>
    </form>
  )
}
