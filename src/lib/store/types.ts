import type { EventInput, PublicShipment, Shipment, ShipmentEvent, ShipmentInput, ShipmentType } from '../types'

export interface AdminUser {
  email: string
}

/** Everything the admin dashboard and Track page need from storage. */
export interface Store {
  mode: 'supabase' | 'demo'

  // auth
  currentUser(): Promise<AdminUser | null>
  signIn(email: string, password: string): Promise<AdminUser>
  signOut(): Promise<void>

  // shipments
  listShipments(): Promise<Shipment[]>
  getShipment(id: string): Promise<Shipment | null>
  createShipment(input: ShipmentInput): Promise<Shipment>
  updateShipment(id: string, input: ShipmentInput): Promise<Shipment>
  deleteShipment(id: string): Promise<void>

  // tracking history
  listEvents(shipmentId: string): Promise<ShipmentEvent[]>
  /** Adding an update also moves the shipment to that status/location when it is the newest entry. */
  addEvent(shipmentId: string, input: EventInput): Promise<ShipmentEvent>
  updateEvent(id: string, input: EventInput): Promise<ShipmentEvent>
  deleteEvent(id: string): Promise<void>

  // shipment types
  listTypes(): Promise<ShipmentType[]>
  addType(name: string): Promise<ShipmentType>
  /** Renaming also renames it on every shipment that uses it. */
  renameType(id: string, name: string): Promise<void>
  /** Fails while shipments still use the type. */
  deleteType(id: string): Promise<void>

  // public
  track(trackingNumber: string): Promise<PublicShipment | null>
}

export class StoreError extends Error {}
