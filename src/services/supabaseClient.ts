import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { supabaseAnonKey, supabaseUrl } from '@/config/flags'

/**
 * The Supabase client, created lazily.
 *
 * Lazily because the demo build must never construct it: a build with no
 * credentials has to boot cleanly and run entirely offline
 * (GHS_MVP_Brief.md §6). Nothing outside src/services may import this — the
 * lint rule in eslint.config.js enforces it.
 */

let client: SupabaseClient | null = null

export function getClient(): SupabaseClient {
  if (client) return client
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY, ' +
        'or leave VITE_DATA_SOURCE=demo to run the offline demo.',
    )
  }
  client = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: true, autoRefreshToken: true },
    global: { headers: { 'x-application': 'ghs-web' } },
  })
  return client
}

/** Test seam only. */
export function __resetClient(): void {
  client = null
}
