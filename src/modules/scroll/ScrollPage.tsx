import { useCallback, useEffect, useMemo, useState } from 'react'
import { api } from '@/services/api'
import { useAsync } from '@/lib/useAsync'
import { useLang } from '@/context/AppContext'
import { TranslationBadge } from '@/components/Attribution'
import BookRail from './BookRail'
import ScrollReader from './ScrollReader'
import ColumnReader from './ColumnReader'
import ScriptureSearch from './ScriptureSearch'
import type { Book, Locale, TranslationInfo, Verse } from '@/types/models'

/**
 * The Scroll — the bilingual Bible reader (GHS_MVP_Brief.md §3.2).
 *
 * Book rail on the left, reader filling the rest, a vespers sub-header holding
 * search, the translation badge and the mode toggle. Below `lg` the rail becomes
 * a slide-over sheet — a 66-book list cannot share a phone screen with an
 * immersive reader, and the reader is the point.
 *
 * The whole surface reads through `api.*` only.
 */

type ReadingMode = 'scroll' | 'column'

const MODE_KEY = 'ghs:readingMode'

function readStoredMode(): ReadingMode {
  try {
    const stored = window.localStorage.getItem(MODE_KEY)
    if (stored === 'scroll' || stored === 'column') return stored
  } catch {
    /* storage unavailable */
  }
  return 'scroll'
}

export function ScrollPage(): JSX.Element {
  const { langMode, showEn, showMl } = useLang()

  const [bookId, setBookId] = useState('GEN')
  const [chapter, setChapter] = useState(1)
  const [mode, setModeState] = useState<ReadingMode>(readStoredMode)
  const [activeRef, setActiveRef] = useState<string | null>(null)
  const [railOpen, setRailOpen] = useState(false)

  const setMode = useCallback((next: ReadingMode) => {
    setModeState(next)
    try {
      window.localStorage.setItem(MODE_KEY, next)
    } catch {
      /* storage unavailable — the choice still applies for this session */
    }
  }, [])

  const catalogue = useAsync<{ books: Book[]; translations: Record<Locale, TranslationInfo> }>(
    async () => {
      const [books, translations] = await Promise.all([api.listBooks(), api.getTranslations()])
      return { books, translations }
    },
    [],
  )

  const books = useMemo(() => catalogue.data?.books ?? [], [catalogue.data])
  const book = books.find((b) => b.id === bookId)

  const chapterState = useAsync<Verse[]>(() => api.getChapter(bookId, chapter), [bookId, chapter])
  const verses = chapterState.data ?? []

  const selectBook = useCallback((nextBookId: string) => {
    setBookId(nextBookId)
    setChapter(1)
    setActiveRef(null)
    setRailOpen(false)
  }, [])

  const navigate = useCallback((nextBookId: string, nextChapter: number, verseRef: string | null) => {
    setBookId(nextBookId)
    setChapter(nextChapter)
    setActiveRef(verseRef)
    setRailOpen(false)
  }, [])

  // Left/right arrows move between chapters when the reader has focus.
  useEffect(() => {
    function onKey(e: KeyboardEvent): void {
      const target = e.target as HTMLElement | null
      if (target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return
      if (!book) return
      if (e.key === 'ArrowRight' && chapter < book.chapterCount) setChapter((c) => c + 1)
      if (e.key === 'ArrowLeft' && chapter > 1) setChapter((c) => c - 1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [book, chapter])

  // The badge shows only what is actually on screen (§13.2).
  const translationLabels = useMemo(() => {
    const t = catalogue.data?.translations
    if (!t) return []
    const labels: string[] = []
    if (showEn) labels.push(t.en.abbrev)
    if (showMl) labels.push(t.ml.abbrev)
    return labels
  }, [catalogue.data, showEn, showMl])

  const attributionDetail = useMemo(() => {
    const t = catalogue.data?.translations
    if (!t) return ''
    const parts: string[] = []
    if (showEn) parts.push(`${t.en.name} — ${t.en.copyright}`)
    if (showMl) parts.push(`${t.ml.name} — ${t.ml.copyright}`)
    return parts.join('\n')
  }, [catalogue.data, showEn, showMl])

  const unavailable = book && !book.bundled

  return (
    // Height is pinned to the viewport minus the header and the shell's own
    // padding, so the reader scrolls internally instead of growing the page.
    <div className="flex h-[calc(100dvh-4.25rem)] flex-col overflow-hidden sm:h-[calc(100dvh-6.25rem)] lg:h-[calc(100dvh-7.25rem)]">
      {/* -- sub-header --------------------------------------------------- */}
      <div className="z-20 shrink-0 bg-vespers px-4 py-2.5 sm:px-6">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <button
            type="button"
            onClick={() => setRailOpen(true)}
            className="shrink-0 rounded-full border border-white/15 px-3.5 py-1.5 text-ui text-white transition hover:bg-white/10 lg:hidden"
            aria-expanded={railOpen}
          >
            {book?.name.en ?? 'Books'} {chapter}
          </button>

          <ScriptureSearch books={books} currentBookId={bookId} onNavigate={navigate} />

          {/*
           * One badge, moved by layout rather than duplicated per breakpoint:
           * it wraps to its own full-width line on narrow screens and sits
           * inline from `sm` up. Rendering two copies and hiding one would
           * announce the attribution twice to a screen reader.
           */}
          {translationLabels.length > 0 ? (
            <TranslationBadge
              labels={translationLabels}
              detail={attributionDetail}
              className="order-last basis-full justify-center sm:order-none sm:ml-auto sm:basis-auto"
            />
          ) : null}

          <div
            role="radiogroup"
            aria-label="Reading mode"
            className="ml-auto inline-flex shrink-0 items-center gap-1 rounded-full bg-white/[0.06] p-1 sm:ml-0"
          >
            {(['scroll', 'column'] as const).map((m) => {
              const active = mode === m
              return (
                <button
                  key={m}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setMode(m)}
                  className={[
                    'rounded-full px-3 py-1 text-ui capitalize transition',
                    active ? 'ghs-pill-active' : 'ghs-pill-idle-dark',
                  ].join(' ')}
                >
                  {m}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* -- body --------------------------------------------------------- */}
      <div className="flex min-h-0 flex-1">
        <aside className="hidden w-64 shrink-0 border-r border-rule bg-vellum px-3.5 py-4 lg:block">
          <BookRail books={books} activeBookId={bookId} onSelect={selectBook} />
        </aside>

        {railOpen ? (
          <div className="fixed inset-0 z-40 lg:hidden">
            <button
              type="button"
              aria-label="Close book list"
              onClick={() => setRailOpen(false)}
              className="absolute inset-0 bg-sanctuary/45 backdrop-blur-[2px]"
            />
            <div className="absolute inset-y-0 left-0 flex w-[18rem] max-w-[85vw] flex-col bg-vellum px-3.5 py-4 shadow-shell animate-fade-in">
              <BookRail books={books} activeBookId={bookId} onSelect={selectBook} />
            </div>
          </div>
        ) : null}

        <main className="relative min-w-0 flex-1 bg-parchment">
          {/* Chapter strip */}
          {book ? (
            <div className="absolute inset-x-0 top-0 z-10 flex items-center gap-1.5 overflow-x-auto border-b border-rule bg-parchment/95 px-4 py-2 backdrop-blur sm:px-6">
              <span className="ghs-overline shrink-0 pr-1.5 text-ink-faint">
                {langMode === 'ml' ? book.name.ml : book.name.en}
              </span>
              {Array.from({ length: book.chapterCount }, (_, i) => i + 1).map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => {
                    setChapter(c)
                    setActiveRef(null)
                  }}
                  aria-current={c === chapter ? 'true' : undefined}
                  className={[
                    'shrink-0 rounded-full px-2.5 py-1 font-overline text-[0.625rem] tabular-nums tracking-normal transition',
                    c === chapter ? 'ghs-pill-active' : 'text-ink-muted hover:bg-vellum',
                  ].join(' ')}
                >
                  {c}
                </button>
              ))}
            </div>
          ) : null}

          <div className="h-full pt-[2.6rem]">
            {catalogue.loading || chapterState.loading ? (
              <div className="flex h-full items-center justify-center" aria-busy="true">
                <p className="ghs-overline text-ink-faint">Loading</p>
              </div>
            ) : unavailable ? (
              <div className="flex h-full items-center justify-center px-6">
                <div className="max-w-reading text-center">
                  <p className="ghs-overline text-ink-faint">Not in this build</p>
                  <p className="mt-3 font-display text-2xl text-ink">
                    {book?.name.en} is not available offline here.
                  </p>
                  <button
                    type="button"
                    onClick={() => selectBook('GEN')}
                    className="mt-6 rounded-full border border-rule px-5 py-2 text-ui text-cedar transition hover:bg-vellum"
                  >
                    Open Genesis
                  </button>
                </div>
              </div>
            ) : verses.length === 0 ? (
              <div className="flex h-full items-center justify-center">
                <p className="text-ui text-ink-faint">This chapter is empty.</p>
              </div>
            ) : mode === 'scroll' ? (
              <ScrollReader
                verses={verses}
                chapter={chapter}
                activeRef={activeRef}
                onActiveChange={setActiveRef}
              />
            ) : (
              <ColumnReader verses={verses} activeRef={activeRef} />
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

export default ScrollPage
