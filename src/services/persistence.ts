/**
 * Demo persistence — localStorage, namespaced per tenant.
 *
 * In production this whole file disappears: the api seam's body calls the
 * backend instead. Nothing outside src/services may import it, which the lint
 * rule in eslint.config.js enforces (GHS_ProductArchitecture.md §1, §8).
 *
 * Every operation degrades to an in-memory store rather than throwing.
 * Private browsing, a full quota, or a locked-down browser must never be able
 * to break the page during the meeting.
 */

const PREFIX = 'ghs'

/** Fallback when localStorage is unavailable. Same shape, no durability. */
const memory = new Map<string, string>()

let warned = false

function backing(): Pick<Storage, 'getItem' | 'setItem' | 'removeItem'> | null {
  try {
    const probe = `${PREFIX}:__probe__`
    window.localStorage.setItem(probe, '1')
    window.localStorage.removeItem(probe)
    return window.localStorage
  } catch {
    if (!warned) {
      warned = true
      console.warn('[ghs] localStorage unavailable — demo state will not persist across reloads.')
    }
    return null
  }
}

function key(churchId: string, name: string): string {
  return `${PREFIX}:${churchId}:${name}`
}

export function read<T>(churchId: string, name: string, fallback: T): T {
  const k = key(churchId, name)
  try {
    const raw = backing()?.getItem(k) ?? memory.get(k) ?? null
    if (raw === null) return fallback
    return JSON.parse(raw) as T
  } catch {
    // Corrupt or hand-edited value — prefer the seed over a broken screen.
    return fallback
  }
}

export function write<T>(churchId: string, name: string, value: T): void {
  const k = key(churchId, name)
  const raw = JSON.stringify(value)
  memory.set(k, raw)
  try {
    backing()?.setItem(k, raw)
  } catch {
    // Quota exceeded. The in-memory copy above still holds for this session.
  }
}

/** Reset demo state. Used by the "reset demo" affordance and by tests. */
export function clear(churchId: string, names: string[]): void {
  for (const name of names) {
    const k = key(churchId, name)
    memory.delete(k)
    try {
      backing()?.removeItem(k)
    } catch {
      /* nothing to do */
    }
  }
}

/** Test seam only — drops the in-memory mirror. */
export function __resetMemory(): void {
  memory.clear()
}
