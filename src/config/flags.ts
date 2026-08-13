/**
 * Runtime configuration.
 *
 * The point of this file is that the demo and the real backend co-exist behind
 * one flag (GHS_ProductArchitecture.md §11) — so the cutover is a config
 * change, not a branch. With no .env at all you get the offline demo, which is
 * what the pastor meeting needs (GHS_MVP_Brief.md §6).
 */

export type DataSource = 'demo' | 'supabase'
export type ArtifactSource = 'cache' | 'live'

interface RawEnv {
  VITE_DATA_SOURCE?: string
  VITE_SUPABASE_URL?: string
  VITE_SUPABASE_ANON_KEY?: string
  VITE_ARTIFACT_SOURCE?: string
  VITE_DEFAULT_CHURCH_ID?: string
}

function readEnv(): RawEnv {
  // import.meta.env is statically replaced by Vite; guard so the same module
  // can be imported by plain Node tooling and tests.
  try {
    return (import.meta.env ?? {}) as RawEnv
  } catch {
    return {}
  }
}

const env = readEnv()

function pick<T extends string>(value: string | undefined, allowed: readonly T[], fallback: T): T {
  const v = (value ?? '').trim().toLowerCase()
  return (allowed as readonly string[]).includes(v) ? (v as T) : fallback
}

const requestedSource = pick<DataSource>(env.VITE_DATA_SOURCE, ['demo', 'supabase'], 'demo')

export const supabaseUrl = (env.VITE_SUPABASE_URL ?? '').trim()
export const supabaseAnonKey = (env.VITE_SUPABASE_ANON_KEY ?? '').trim()

const supabaseConfigured = supabaseUrl.length > 0 && supabaseAnonKey.length > 0

/**
 * The effective data source.
 *
 * Asking for supabase without credentials falls back to demo rather than
 * throwing. A misconfigured .env must never be able to blank the screen in
 * front of the pastor — degrading to the offline bundle is always the safer
 * failure.
 */
export const dataSource: DataSource = requestedSource === 'supabase' && supabaseConfigured ? 'supabase' : 'demo'

/** True when supabase was asked for but could not be used. Surfaced in the UI. */
export const supabaseFellBack = requestedSource === 'supabase' && !supabaseConfigured

export const artifactSource: ArtifactSource = pick<ArtifactSource>(
  env.VITE_ARTIFACT_SOURCE,
  ['cache', 'live'],
  'cache',
)

export const defaultChurchId = (env.VITE_DEFAULT_CHURCH_ID ?? '').trim() || 'ghs'

/** Whether this build is the honest demo (mock data) rather than production. */
export const isDemo = dataSource === 'demo'
