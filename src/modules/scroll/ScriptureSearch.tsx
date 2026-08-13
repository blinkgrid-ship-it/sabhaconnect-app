import { useEffect, useRef, useState } from 'react'
import { api } from '@/services/api'
import { parseReference } from '@/lib/reference'
import { useLang } from '@/context/AppContext'
import type { Book, VerseHit } from '@/types/models'

/**
 * Scripture search. The placeholder is "e.g. 3:5" (GHS_MVP_Brief.md §3.2), so a
 * bare chapter:verse resolves against the book already open; anything else falls
 * through to a text search.
 *
 * Text search is debounced and only runs from three characters — it walks the
 * mirrored verse data, and firing it on every keystroke would make typing feel
 * heavy on a phone.
 */
export function ScriptureSearch({
  books,
  currentBookId,
  onNavigate,
}: {
  books: Book[]
  currentBookId: string
  onNavigate: (bookId: string, chapter: number, verseRef: string | null) => void
}): JSX.Element {
  const { showMl } = useLang()
  const [query, setQuery] = useState('')
  const [hits, setHits] = useState<VerseHit[] | null>(null)
  const [searching, setSearching] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const boxRef = useRef<HTMLDivElement>(null)

  // Close the results panel on an outside click or Escape.
  useEffect(() => {
    function onPointerDown(e: MouseEvent): void {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setHits(null)
    }
    function onKey(e: KeyboardEvent): void {
      if (e.key === 'Escape') setHits(null)
    }
    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [])

  // Debounced free-text search.
  useEffect(() => {
    const parsed = parseReference(query, books, currentBookId)
    if (!parsed || parsed.kind !== 'text' || parsed.query.length < 3) {
      setHits(null)
      setSearching(false)
      return
    }

    setSearching(true)
    let cancelled = false
    const timer = setTimeout(() => {
      void api
        .searchScripture(parsed.query)
        .then((results) => {
          if (!cancelled) setHits(results)
        })
        .finally(() => {
          if (!cancelled) setSearching(false)
        })
    }, 280)

    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [query, books, currentBookId])

  function submit(e: React.FormEvent): void {
    e.preventDefault()
    const parsed = parseReference(query, books, currentBookId)
    if (!parsed) return

    if (parsed.kind === 'reference') {
      const book = books.find((b) => b.id === parsed.bookId)
      if (book && !book.bundled) {
        setMessage(`${book.name.en} is not available in this build.`)
        return
      }
      setMessage(null)
      onNavigate(
        parsed.bookId,
        parsed.chapter,
        parsed.verse ? `${parsed.bookId}.${parsed.chapter}.${parsed.verse}` : null,
      )
      setQuery('')
      setHits(null)
      return
    }

    // Free text: jump straight to the first hit.
    if (hits && hits.length > 0) selectHit(hits[0]!)
  }

  function selectHit(hit: VerseHit): void {
    setMessage(null)
    onNavigate(hit.bookId, hit.chapter, hit.ref)
    setQuery('')
    setHits(null)
  }

  return (
    <div ref={boxRef} className="relative w-full sm:w-72">
      <form onSubmit={submit} role="search">
        <label htmlFor="scripture-search" className="sr-only">
          Search scripture
        </label>
        <div className="relative">
          <svg
            aria-hidden="true"
            viewBox="0 0 16 16"
            className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 fill-none stroke-lamp/50 stroke-[1.5]"
          >
            <circle cx="7" cy="7" r="4.5" />
            <path d="m10.5 10.5 3 3" strokeLinecap="round" />
          </svg>
          <input
            id="scripture-search"
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setMessage(null)
            }}
            placeholder="e.g. 3:5"
            autoComplete="off"
            className="w-full rounded-card border border-white/15 bg-white/[0.07] py-2 pl-9 pr-3 text-ui text-white placeholder:text-lamp/40 transition focus:border-brass focus:bg-white/[0.12]"
          />
        </div>
      </form>

      {message ? (
        <p
          role="status"
          className="absolute left-0 right-0 top-full z-40 mt-2 rounded-card border border-rule bg-vellum px-4 py-3 text-[0.8125rem] text-ink-muted shadow-shell"
        >
          {message}
        </p>
      ) : null}

      {hits !== null && !message ? (
        <div className="absolute left-0 right-0 top-full z-40 mt-2 max-h-80 overflow-y-auto rounded-card border border-rule bg-vellum shadow-shell">
          {searching ? (
            <p className="px-4 py-3 text-[0.8125rem] text-ink-faint">Searching…</p>
          ) : hits.length === 0 ? (
            <p className="px-4 py-3 text-[0.8125rem] text-ink-faint">Nothing found.</p>
          ) : (
            <ul>
              {hits.map((hit) => (
                <li key={hit.ref}>
                  <button
                    type="button"
                    onClick={() => selectHit(hit)}
                    className="ghs-divider block w-full px-4 py-3 text-left transition first:border-t-0 hover:bg-parchment"
                  >
                    <span className="ghs-overline">
                      {hit.bookName.en} {hit.chapter}:{hit.num}
                    </span>
                    <span
                      lang="en"
                      className="mt-1 block line-clamp-2 font-display text-[0.9375rem] text-ink"
                    >
                      {hit.text.en}
                    </span>
                    {showMl && hit.text.ml ? (
                      <span lang="ml" className="mt-1 block line-clamp-2 text-[0.9375rem] text-ink-muted">
                        {hit.text.ml}
                      </span>
                    ) : null}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  )
}

export default ScriptureSearch
