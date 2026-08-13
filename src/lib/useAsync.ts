import { useCallback, useEffect, useRef, useState } from 'react'

export interface AsyncState<T> {
  data: T | null
  loading: boolean
  error: string | null
  reload: () => void
}

/**
 * Run an async read and track its state.
 *
 * Two things this handles that a naive useEffect does not, and both matter for
 * a demo that must not visibly glitch:
 *
 * - **Out-of-order results.** Switching book or chapter quickly fires several
 *   reads; only the newest may write to state, or the reader sees the wrong
 *   chapter settle in after the right one.
 * - **Unmount.** No state updates after teardown.
 *
 * `deps` is the dependency list for the fetcher, exactly like useEffect.
 */
export function useAsync<T>(fetcher: () => Promise<T>, deps: unknown[]): AsyncState<T> {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [nonce, setNonce] = useState(0)

  // Monotonic token: a result is only accepted if it is from the latest call.
  const latest = useRef(0)
  const mounted = useRef(true)

  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
    }
  }, [])

  // The fetcher is intentionally not a dependency — callers pass an inline
  // closure, and `deps` is the explicit contract for when to re-run.
  const run = useRef(fetcher)
  run.current = fetcher

  useEffect(() => {
    const token = ++latest.current
    setLoading(true)
    setError(null)

    run
      .current()
      .then((result) => {
        if (!mounted.current || token !== latest.current) return
        setData(result)
      })
      .catch((err: unknown) => {
        if (!mounted.current || token !== latest.current) return
        setError(err instanceof Error ? err.message : 'Something went wrong.')
      })
      .finally(() => {
        if (!mounted.current || token !== latest.current) return
        setLoading(false)
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, nonce])

  const reload = useCallback(() => setNonce((n) => n + 1), [])

  return { data, loading, error, reload }
}
