import { createDemoStore } from './demo'
import { createSupabaseStore } from './supabase'
import type { Store } from './types'

export { StoreError } from './types'
export type { AdminUser, Store } from './types'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

/**
 * Supabase when VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set (see .env.example),
 * otherwise the in-browser demo store.
 */
export const store: Store = url && key ? createSupabaseStore(url, key) : createDemoStore()

export const errorMessage = (e: unknown) => (e instanceof Error ? e.message : 'Something went wrong. Please try again.')
