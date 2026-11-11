import { createClient, type PostgrestError } from '@supabase/supabase-js'
import { emptyParty, type EventInput, type Party, type PublicShipment, type Shipment, type ShipmentEvent, type ShipmentInput } from '../types'
import { StoreError, type Store } from './types'

type Row = Record<string, unknown>

const DATE_FIELDS = ['pickup_date', 'departure_date', 'estimated_delivery', 'delivered_date'] as const

/** Turns database errors into messages an admin can act on. */
function fail(error: PostgrestError | Error | null, fallback = 'Something went wrong. Please try again.'): never {
  const e = error as PostgrestError | null
  if (e?.code === '23505') throw new StoreError('That tracking number or name is already used.')
  if (e?.code === '23503' || e?.code === '23001') throw new StoreError('This shipment type is still used by shipments. Change those shipments first.')
  if (e?.code === '23514') throw new StoreError('Some values are not allowed. Check the tracking number format and that numbers are not negative.')
  if (e?.code === '42501' || e?.code === 'PGRST301') throw new StoreError('Your account is not allowed to do this. Is it listed in the admins table?')
  throw new StoreError(e?.message || fallback)
}

const party = (v: unknown): Party => ({ ...emptyParty(), ...((v as Partial<Party>) ?? {}) })

function fromRow(r: Row): Shipment {
  const s = { ...r, sender: party(r.sender), receiver: party(r.receiver) } as unknown as Shipment
  for (const f of DATE_FIELDS) s[f] = (r[f] as string | null) ?? ''
  return s
}

function toRow(input: ShipmentInput): Row {
  const row: Row = { ...input }
  // never send server-managed columns, even if a full Shipment was passed in
  delete row.id
  delete row.created_at
  delete row.updated_at
  for (const f of DATE_FIELDS) row[f] = input[f] || null
  return row
}

export function createSupabaseStore(url: string, anonKey: string): Store {
  const sb = createClient(url, anonKey)

  const requireAdmin = async () => {
    const { data, error } = await sb.rpc('is_admin')
    if (error) fail(error)
    return data === true
  }

  return {
    mode: 'supabase',

    async currentUser() {
      const { data } = await sb.auth.getSession()
      const email = data.session?.user.email
      if (!email) return null
      return (await requireAdmin()) ? { email } : null
    },
    async signIn(email, password) {
      const { data, error } = await sb.auth.signInWithPassword({ email, password })
      if (error) throw new StoreError(error.message === 'Invalid login credentials' ? 'Wrong email or password.' : error.message)
      if (!(await requireAdmin())) {
        await sb.auth.signOut()
        throw new StoreError('This account is not an admin. Add it to the admins table first (see README).')
      }
      return { email: data.user.email ?? email }
    },
    async signOut() {
      await sb.auth.signOut()
    },

    async listShipments() {
      const { data, error } = await sb.from('shipments').select('*').order('updated_at', { ascending: false })
      if (error) fail(error)
      return (data as Row[]).map(fromRow)
    },
    async getShipment(id) {
      const { data, error } = await sb.from('shipments').select('*').eq('id', id).maybeSingle()
      if (error) fail(error)
      return data ? fromRow(data as Row) : null
    },
    async createShipment(input) {
      const { data, error } = await sb.from('shipments').insert(toRow(input)).select().single()
      if (error) fail(error)
      return fromRow(data as Row)
    },
    async updateShipment(id, input) {
      const { data, error } = await sb.from('shipments').update(toRow(input)).eq('id', id).select().single()
      if (error) fail(error)
      return fromRow(data as Row)
    },
    async deleteShipment(id) {
      const { error } = await sb.from('shipments').delete().eq('id', id)
      if (error) fail(error)
    },

    async listEvents(shipmentId) {
      const { data, error } = await sb.from('shipment_events').select('*').eq('shipment_id', shipmentId).order('date', { ascending: false })
      if (error) fail(error)
      return data as ShipmentEvent[]
    },
    async addEvent(shipmentId, input: EventInput) {
      const { data, error } = await sb.from('shipment_events').insert({ ...input, shipment_id: shipmentId }).select().single()
      if (error) fail(error)
      return data as ShipmentEvent
    },
    async updateEvent(id, input) {
      const { data, error } = await sb.from('shipment_events').update(input).eq('id', id).select().single()
      if (error) fail(error)
      return data as ShipmentEvent
    },
    async deleteEvent(id) {
      const { error } = await sb.from('shipment_events').delete().eq('id', id)
      if (error) fail(error)
    },

    async listTypes() {
      const [types, ships] = await Promise.all([sb.from('shipment_types').select('id,name').order('name'), sb.from('shipments').select('shipment_type')])
      if (types.error) fail(types.error)
      if (ships.error) fail(ships.error)
      const counts = new Map<string, number>()
      for (const s of ships.data as { shipment_type: string }[]) counts.set(s.shipment_type, (counts.get(s.shipment_type) ?? 0) + 1)
      return (types.data as { id: string; name: string }[]).map((t) => ({ ...t, count: counts.get(t.name) ?? 0 }))
    },
    async addType(name) {
      const { data, error } = await sb.from('shipment_types').insert({ name: name.trim() }).select('id,name').single()
      if (error) fail(error)
      return data as { id: string; name: string }
    },
    async renameType(id, name) {
      const { error } = await sb.from('shipment_types').update({ name: name.trim() }).eq('id', id)
      if (error) fail(error)
    },
    async deleteType(id) {
      const { error } = await sb.from('shipment_types').delete().eq('id', id)
      if (error) fail(error)
    },

    async track(trackingNumber) {
      const { data, error } = await sb.rpc('track_shipment', { p_code: trackingNumber })
      if (error) fail(error, 'Tracking is unavailable right now. Please try again shortly.')
      return (data as PublicShipment | null) ?? null
    },
  }
}
