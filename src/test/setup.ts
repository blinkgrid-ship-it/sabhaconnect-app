import '@testing-library/jest-dom/vitest'
import { afterEach, beforeEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'

/**
 * jsdom does not implement several browser APIs the reading surfaces rely on.
 * They are stubbed rather than mocked away, so components under test exercise
 * the same code paths they do in a browser.
 */

class MockIntersectionObserver implements IntersectionObserver {
  readonly root = null
  readonly rootMargin = ''
  readonly thresholds: readonly number[] = []
  constructor(_callback: IntersectionObserverCallback) {}
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
  takeRecords(): IntersectionObserverEntry[] {
    return []
  }
}

/**
 * jsdom does not always expose a usable Storage — depending on the document
 * origin it can be missing or partial. The app is written to survive that (see
 * services/persistence.ts), but the tests need a real one to assert against,
 * so install a minimal in-memory implementation when the environment's is not
 * complete.
 */
function ensureLocalStorage(): void {
  const existing = window.localStorage as Storage | undefined
  if (existing && typeof existing.clear === 'function') return

  const store = new Map<string, string>()
  const polyfill: Storage = {
    get length() {
      return store.size
    },
    key: (i: number) => [...store.keys()][i] ?? null,
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, String(v)),
    removeItem: (k: string) => void store.delete(k),
    clear: () => store.clear(),
  }
  Object.defineProperty(window, 'localStorage', {
    value: polyfill,
    configurable: true,
    writable: true,
  })
}

beforeEach(() => {
  vi.stubGlobal('IntersectionObserver', MockIntersectionObserver)
  ensureLocalStorage()

  if (!Element.prototype.scrollIntoView) {
    Element.prototype.scrollIntoView = function scrollIntoView(): void {}
  }

  // jsdom has no CSS.escape in older versions; the readers use it for lookups.
  if (typeof CSS === 'undefined') {
    vi.stubGlobal('CSS', { escape: (s: string) => s.replace(/["\\]/g, '\\$&') })
  } else if (!CSS.escape) {
    CSS.escape = (s: string) => s.replace(/["\\]/g, '\\$&')
  }

  window.localStorage.clear()
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})
