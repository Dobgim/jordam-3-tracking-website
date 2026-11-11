// Shipment data model shared by the admin dashboard, the data stores and the public Track page.

export const STATUSES = [
  'Pending',
  'Processing',
  'Picked Up',
  'In Transit',
  'Customs Clearance',
  'Out for Delivery',
  'Delivered',
  'On Hold',
  'Delayed',
  'Returned',
  'Cancelled',
] as const
export type Status = (typeof STATUSES)[number]

/** Default progress (%) suggested when a status is picked. The admin can still override it. */
export const STATUS_PROGRESS: Record<Status, number> = {
  Pending: 0,
  Processing: 10,
  'Picked Up': 25,
  'In Transit': 50,
  'Customs Clearance': 65,
  'Out for Delivery': 85,
  Delivered: 100,
  'On Hold': -1,
  Delayed: -1,
  Returned: -1,
  Cancelled: -1,
}

/** Tailwind classes for the status badge. */
export const STATUS_STYLE: Record<Status, string> = {
  Pending: 'bg-slate-100 text-slate-700 ring-slate-300',
  Processing: 'bg-sky-50 text-sky-700 ring-sky-200',
  'Picked Up': 'bg-indigo-50 text-indigo-700 ring-indigo-200',
  'In Transit': 'bg-blue-50 text-[#005EA2] ring-blue-200',
  'Customs Clearance': 'bg-violet-50 text-violet-700 ring-violet-200',
  'Out for Delivery': 'bg-cyan-50 text-cyan-800 ring-cyan-200',
  Delivered: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  'On Hold': 'bg-amber-50 text-amber-800 ring-amber-200',
  Delayed: 'bg-orange-50 text-orange-700 ring-orange-200',
  Returned: 'bg-fuchsia-50 text-fuchsia-700 ring-fuchsia-200',
  Cancelled: 'bg-red-50 text-[#E42313] ring-red-200',
}

export const SERVICE_LEVELS = ['Standard', 'Express', 'Priority', 'Economy', 'Same Day'] as const
export const PAYMENT_STATUSES = ['Unpaid', 'Pending', 'Paid', 'Refunded'] as const
export const PAYMENT_METHODS = ['', 'Bank Transfer', 'Card', 'Cash', 'PayPal', 'Wire', 'Other'] as const
export const CURRENCIES = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'NGN', 'GHS', 'XAF', 'ZAR', 'AED'] as const

export const DEFAULT_TYPES = ['Air Freight', 'Ocean Freight', 'Road Freight', 'Rail Freight', 'Express Parcel', 'Warehousing']

export interface Party {
  name: string
  email: string
  phone: string
  address: string
}

export const emptyParty = (): Party => ({ name: '', email: '', phone: '', address: '' })

/** Everything the admin edits. Dates are 'YYYY-MM-DD' strings ('' = not set). */
export interface ShipmentInput {
  tracking_number: string // '' = generate automatically
  status: Status
  shipment_type: string
  service_level: string
  origin: string
  destination: string
  current_location: string
  progress: number
  sender: Party
  receiver: Party
  description: string
  quantity: number
  weight_kg: number | null
  length_cm: number | null
  width_cm: number | null
  height_cm: number | null
  declared_value: number | null
  shipping_cost: number | null
  currency: string
  payment_status: string
  payment_method: string
  carrier: string
  vehicle_ref: string
  pickup_date: string
  departure_date: string
  estimated_delivery: string
  delivered_date: string
  public_note: string
  internal_note: string
}

export interface Shipment extends ShipmentInput {
  id: string
  created_at: string
  updated_at: string
}

export interface ShipmentEvent {
  id: string
  shipment_id: string
  date: string // ISO timestamp
  status: Status
  location: string
  note: string
}

export type EventInput = Omit<ShipmentEvent, 'id' | 'shipment_id'>

export interface ShipmentType {
  id: string
  name: string
  count?: number
}

/** What a visitor sees on /track — no emails, phones, costs or internal notes. */
export interface PublicShipment {
  tracking_number: string
  status: Status
  shipment_type: string
  service_level: string
  origin: string
  destination: string
  current_location: string
  progress: number
  sender_name: string
  receiver_name: string
  description: string
  quantity: number
  weight_kg: number | null
  dimensions: string
  pickup_date: string
  departure_date: string
  estimated_delivery: string
  delivered_date: string
  public_note: string
  updated_at: string
  events: Omit<ShipmentEvent, 'id' | 'shipment_id'>[]
}

export const emptyShipment = (): ShipmentInput => ({
  tracking_number: '',
  status: 'Pending',
  shipment_type: DEFAULT_TYPES[0],
  service_level: 'Standard',
  origin: '',
  destination: '',
  current_location: '',
  progress: 0,
  sender: emptyParty(),
  receiver: emptyParty(),
  description: '',
  quantity: 1,
  weight_kg: null,
  length_cm: null,
  width_cm: null,
  height_cm: null,
  declared_value: null,
  shipping_cost: null,
  currency: 'USD',
  payment_status: 'Unpaid',
  payment_method: '',
  carrier: '',
  vehicle_ref: '',
  pickup_date: '',
  departure_date: '',
  estimated_delivery: '',
  delivered_date: '',
  public_note: '',
  internal_note: '',
})

export function dimensionsText(s: Pick<ShipmentInput, 'length_cm' | 'width_cm' | 'height_cm'>): string {
  const parts = [s.length_cm, s.width_cm, s.height_cm]
  return parts.every((p) => p != null && p > 0) ? `${parts.join(' × ')} cm` : ''
}

export function toPublic(s: Shipment, events: ShipmentEvent[]): PublicShipment {
  return {
    tracking_number: s.tracking_number,
    status: s.status,
    shipment_type: s.shipment_type,
    service_level: s.service_level,
    origin: s.origin,
    destination: s.destination,
    current_location: s.current_location,
    progress: s.progress,
    sender_name: s.sender.name,
    receiver_name: s.receiver.name,
    description: s.description,
    quantity: s.quantity,
    weight_kg: s.weight_kg,
    dimensions: dimensionsText(s),
    pickup_date: s.pickup_date,
    departure_date: s.departure_date,
    estimated_delivery: s.estimated_delivery,
    delivered_date: s.delivered_date,
    public_note: s.public_note,
    updated_at: s.updated_at,
    events: [...events].sort((a, b) => b.date.localeCompare(a.date)).map(({ date, status, location, note }) => ({ date, status, location, note })),
  }
}

/** TJ-<year>-<7 random letters/digits>, same format as the other Jordans site. */
export function newTrackingNumber(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const rand = crypto.getRandomValues(new Uint32Array(7))
  return `TJ-${new Date().getFullYear()}-${Array.from(rand, (n) => chars[n % chars.length]).join('')}`
}

export const normalizeTracking = (s: string) => s.toUpperCase().replace(/\s+/g, '')
