// Demo store: keeps everything in this browser's localStorage. Used when no Supabase
// project is configured, so the dashboard can be tried without a database.
// Nothing here is shared between devices or visitors.

import {
  DEFAULT_TYPES,
  STATUS_PROGRESS,
  normalizeTracking,
  newTrackingNumber,
  toPublic,
  type EventInput,
  type Shipment,
  type ShipmentEvent,
  type ShipmentInput,
  type ShipmentType,
} from '../types'
import { StoreError, type AdminUser, type Store } from './types'

interface DB {
  shipments: Shipment[]
  events: ShipmentEvent[]
  types: ShipmentType[]
  user: AdminUser | null
}

const KEY = 'thejordans-demo-db-v1'

function load(): DB {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw) as DB
  } catch {
    /* storage unavailable or corrupt: start fresh */
  }
  return { shipments: [], events: [], types: DEFAULT_TYPES.map((name) => ({ id: crypto.randomUUID(), name })), user: null }
}

function save(db: DB) {
  try {
    localStorage.setItem(KEY, JSON.stringify(db))
  } catch {
    /* ignore: private mode etc. */
  }
}

const now = () => new Date().toISOString()
const clone = <T,>(v: T): T => structuredClone(v)

function uniqueTracking(db: DB, wanted: string, exceptId?: string): string {
  const taken = (t: string) => db.shipments.some((s) => s.tracking_number === t && s.id !== exceptId)
  if (wanted) {
    const t = normalizeTracking(wanted)
    if (!/^[A-Z0-9-]{4,40}$/.test(t)) throw new StoreError('Tracking number must be 4–40 letters, digits or dashes.')
    if (taken(t)) throw new StoreError(`Tracking number ${t} is already used by another shipment.`)
    return t
  }
  let t = newTrackingNumber()
  while (taken(t)) t = newTrackingNumber()
  return t
}

function pushEvent(db: DB, shipmentId: string, e: EventInput): ShipmentEvent {
  const ev: ShipmentEvent = { id: crypto.randomUUID(), shipment_id: shipmentId, ...e }
  db.events.push(ev)
  return ev
}

export function createDemoStore(): Store {
  return {
    mode: 'demo',

    async currentUser() {
      return load().user
    },
    async signIn(email) {
      const db = load()
      db.user = { email: email || 'demo@thejordans.local' }
      save(db)
      return db.user
    },
    async signOut() {
      const db = load()
      db.user = null
      save(db)
    },

    async listShipments() {
      return clone(load().shipments).sort((a, b) => b.updated_at.localeCompare(a.updated_at))
    },
    async getShipment(id) {
      return clone(load().shipments.find((s) => s.id === id) ?? null)
    },
    async createShipment(input: ShipmentInput) {
      const db = load()
      const s: Shipment = { ...clone(input), id: crypto.randomUUID(), tracking_number: uniqueTracking(db, input.tracking_number), created_at: now(), updated_at: now() }
      db.shipments.push(s)
      pushEvent(db, s.id, { date: now(), status: s.status, location: s.current_location || s.origin, note: 'Shipment created' })
      save(db)
      return clone(s)
    },
    async updateShipment(id, input) {
      const db = load()
      const i = db.shipments.findIndex((s) => s.id === id)
      if (i < 0) throw new StoreError('Shipment not found.')
      const old = db.shipments[i]
      const s: Shipment = { ...old, ...clone(input), tracking_number: uniqueTracking(db, input.tracking_number || old.tracking_number, id), updated_at: now() }
      db.shipments[i] = s
      if (s.status !== old.status) pushEvent(db, id, { date: now(), status: s.status, location: s.current_location, note: `Status updated to ${s.status}` })
      save(db)
      return clone(s)
    },
    async deleteShipment(id) {
      const db = load()
      db.shipments = db.shipments.filter((s) => s.id !== id)
      db.events = db.events.filter((e) => e.shipment_id !== id)
      save(db)
    },

    async listEvents(shipmentId) {
      return clone(load().events.filter((e) => e.shipment_id === shipmentId)).sort((a, b) => b.date.localeCompare(a.date))
    },
    async addEvent(shipmentId, input) {
      const db = load()
      const s = db.shipments.find((x) => x.id === shipmentId)
      if (!s) throw new StoreError('Shipment not found.')
      const ev = pushEvent(db, shipmentId, input)
      const newest = db.events.filter((e) => e.shipment_id === shipmentId).every((e) => e.date <= ev.date)
      if (newest) {
        s.status = ev.status
        if (ev.location) s.current_location = ev.location
        if (STATUS_PROGRESS[ev.status] >= 0) s.progress = STATUS_PROGRESS[ev.status]
        if (ev.status === 'Delivered' && !s.delivered_date) s.delivered_date = ev.date.slice(0, 10)
        s.updated_at = now()
      }
      save(db)
      return clone(ev)
    },
    async updateEvent(id, input) {
      const db = load()
      const ev = db.events.find((e) => e.id === id)
      if (!ev) throw new StoreError('Tracking update not found.')
      Object.assign(ev, input)
      save(db)
      return clone(ev)
    },
    async deleteEvent(id) {
      const db = load()
      db.events = db.events.filter((e) => e.id !== id)
      save(db)
    },

    async listTypes() {
      const db = load()
      return db.types.map((t) => ({ ...t, count: db.shipments.filter((s) => s.shipment_type === t.name).length })).sort((a, b) => a.name.localeCompare(b.name))
    },
    async addType(name) {
      const db = load()
      const n = name.trim()
      if (!n) throw new StoreError('Enter a name.')
      if (db.types.some((t) => t.name.toLowerCase() === n.toLowerCase())) throw new StoreError(`“${n}” already exists.`)
      const t = { id: crypto.randomUUID(), name: n }
      db.types.push(t)
      save(db)
      return t
    },
    async renameType(id, name) {
      const db = load()
      const n = name.trim()
      const t = db.types.find((x) => x.id === id)
      if (!t) throw new StoreError('Type not found.')
      if (!n) throw new StoreError('Enter a name.')
      if (db.types.some((x) => x.id !== id && x.name.toLowerCase() === n.toLowerCase())) throw new StoreError(`“${n}” already exists.`)
      db.shipments.forEach((s) => s.shipment_type === t.name && (s.shipment_type = n))
      t.name = n
      save(db)
    },
    async deleteType(id) {
      const db = load()
      const t = db.types.find((x) => x.id === id)
      if (!t) return
      const used = db.shipments.filter((s) => s.shipment_type === t.name).length
      if (used) throw new StoreError(`“${t.name}” is used by ${used} shipment${used > 1 ? 's' : ''}. Change those shipments first.`)
      db.types = db.types.filter((x) => x.id !== id)
      save(db)
    },

    async track(trackingNumber) {
      const db = load()
      const s = db.shipments.find((x) => x.tracking_number === normalizeTracking(trackingNumber))
      return s ? toPublic(s, db.events.filter((e) => e.shipment_id === s.id)) : null
    },
  }
}
