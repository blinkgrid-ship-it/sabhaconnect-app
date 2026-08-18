import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, Menu, Search } from 'lucide-react'
import { api } from '../../services/api'
import { GuardrailNote, LangToggle, useLangPreference, type LangMode } from '../../app/ui'
import type { Book, Verse } from '../../types/models'

type ReaderMode = 'scroll' | 'column'
type Testament = 'old' | 'new'

function ModeToggle({ mode, onChange }: { mode: ReaderMode; onChange: (mode: ReaderMode) => void }) {
  return (
    <div className="inline-flex rounded-lg border border-mist bg-cloud p-0.5 text-xs">
      {(['scroll', 'column'] as ReaderMode[]).map((m) => (
        <button
          key={m}
          type="button"
          onClick={() => onChange(m)}
          className={[
            'min-h-11 rounded-md px-2.5 py-1 font-medium capitalize transition-colors sm:min-h-0',
            mode === m ? 'bg-spirit text-paper' : 'text-ink/60 hover:text-ink',
          ].join(' ')}
        >
          {m}
        </button>
      ))}
    </div>
  )
}

function TranslationBadge() {
  return (
    <span
      title="World English Bible (public domain) · Malayalam rendered in the Old Version register, bundled for this offline preview"
      className="inline-flex shrink-0 items-center gap-1 rounded-full border border-mist bg-cloud px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide text-ink/60"
    >
      WEB &middot; Malayalam OV
    </span>
  )
}

function BookRail({
  books,
  testament,
  onTestament,
  activeBookId,
  onSelectBook,
  open,
  onClose,
}: {
  books: Book[]
  testament: Testament
  onTestament: (t: Testament) => void
  activeBookId: string
  onSelectBook: (id: string) => void
  open: boolean
  onClose: () => void
}) {
  const filtered = books.filter((b) => b.testament === testament)

  return (
    <>
      {open && <div className="fixed inset-0 z-40 bg-ink/30 md:hidden" onClick={onClose} aria-hidden="true" />}
      <aside
        className={[
          'fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] overflow-y-auto bg-paper p-4 shadow-soft transition-transform',
          'md:static md:z-auto md:w-52 md:max-w-none md:translate-x-0 md:shrink-0 md:bg-transparent md:p-0 md:shadow-none',
          open ? 'translate-x-0' : '-translate-x-full',
        ].join(' ')}
      >
        <div className="inline-flex rounded-lg border border-mist bg-cloud p-0.5 text-xs">
          {(['old', 'new'] as Testament[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => onTestament(t)}
              className={[
                'min-h-11 rounded-md px-3 py-1 font-medium transition-colors sm:min-h-0',
                testament === t ? 'bg-spirit text-paper' : 'text-ink/60 hover:text-ink',
              ].join(' ')}
            >
              {t === 'old' ? 'Old' : 'New'}
            </button>
          ))}
        </div>
        <ul className="mt-3 max-h-[70vh] space-y-0.5 overflow-y-auto pr-1 md:max-h-[32rem]">
          {filtered.map((b) => {
            const active = b.id === activeBookId
            return (
              <li key={b.id}>
                <button
                  type="button"
                  onClick={() => {
                    onSelectBook(b.id)
                    onClose()
                  }}
                  className={[
                    'flex min-h-11 w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-sm transition-colors sm:min-h-0',
                    active ? 'font-semibold text-gold' : 'text-ink/70 hover:bg-cloud hover:text-ink',
                  ].join(' ')}
                >
                  <span>{b.name.en}</span>
                  <span className="text-[10px] text-ink/30">{b.chapterCount}</span>
                </button>
              </li>
            )
          })}
        </ul>
      </aside>
    </>
  )
}

function SearchBox({ activeBookNameEn, onJump }: { activeBookNameEn: string; onJump: (verse: Verse) => void }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Verse[] | null>(null)
  const [searching, setSearching] = useState(false)

  async function runSearch() {
    const trimmed = query.trim()
    if (!trimmed) {
      setResults(null)
      return
    }
    const isBareRef = /^\d+(:\d+)?$/.test(trimmed)
    const fullQuery = isBareRef && activeBookNameEn ? `${activeBookNameEn} ${trimmed}` : trimmed
    setSearching(true)
    const found = await api.searchScripture(fullQuery)
    setSearching(false)
    setResults(found)
  }

  return (
    <div className="relative min-w-0 flex-1 sm:flex-none">
      <div className="flex min-h-11 items-center gap-2 rounded-lg border border-mist bg-paper px-3 py-1.5 sm:min-h-0">
        <Search className="h-4 w-4 shrink-0 text-ink/40" aria-hidden="true" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && runSearch()}
          placeholder="e.g. 3:5"
          className="w-full min-w-0 bg-transparent text-sm text-ink placeholder:text-ink/30 focus:outline-none sm:w-48"
        />
      </div>
      {searching && (
        <div className="absolute z-10 mt-1 w-64 max-w-[calc(100vw-2rem)] rounded-lg border border-mist bg-paper p-2 text-xs text-ink/50 shadow-soft">
          Searching...
        </div>
      )}
      {!searching && results && (
        <div className="animate-fade-in absolute z-10 mt-1 w-72 max-w-[calc(100vw-2rem)] rounded-lg border border-mist bg-paper p-2 shadow-soft">
          {results.length === 0 ? (
            <p className="p-2 text-xs text-ink/50">No verses match — only Genesis 1 is loaded in this preview.</p>
          ) : (
            results.slice(0, 8).map((v) => (
              <button
                key={v.ref}
                type="button"
                onClick={() => {
                  onJump(v)
                  setResults(null)
                  setQuery('')
                }}
                className="block min-h-11 w-full rounded-md px-2 py-1.5 text-left text-xs hover:bg-cloud sm:min-h-0"
              >
                <span className="font-medium text-spirit">{v.ref}</span>{' '}
                <span className="text-ink/60">{v.text.en.slice(0, 60)}...</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}

function ScrollReader({ book, chapter, verses, lang }: { book: Book | undefined; chapter: number; verses: Verse[]; lang: LangMode }) {
  return (
    <div className="h-[60vh] snap-y snap-mandatory overflow-y-auto scroll-smooth rounded-xl border border-mist bg-cloud sm:h-[34rem]">
      <div className="relative flex h-[60vh] snap-start flex-col items-center justify-center sm:h-[34rem]">
        <span aria-hidden="true" className="pointer-events-none absolute select-none font-display text-7xl leading-none text-ink/5 sm:text-[11rem]">
          {chapter}
        </span>
        <p className="relative font-display text-xl text-ink sm:text-2xl">
          {book?.name.en} {chapter}
        </p>
        <p className="font-ml relative text-sm text-ink/50">{book?.name.ml}</p>
        <p className="relative mt-6 animate-bounce text-xs uppercase tracking-widest text-ink/40">↓ scroll to begin</p>
      </div>
      {verses.map((v) => (
        <div key={v.ref} id={`verse-${v.ref}`} className="relative flex h-[60vh] snap-start flex-col items-center justify-center px-6 text-center sm:h-[34rem] sm:px-10">
          <span aria-hidden="true" className="pointer-events-none absolute select-none font-display text-6xl leading-none text-ink/5 sm:text-[9rem]">
            {v.num}
          </span>
          <div className="relative max-w-lg">
            {lang !== 'ml' && <p className="font-display text-lg leading-snug text-ink sm:text-2xl">{v.text.en}</p>}
            {lang !== 'en' && (
              <p className={`font-ml text-base leading-snug text-ink/80 sm:text-xl ${lang === 'both' ? 'mt-3' : ''}`}>{v.text.ml}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

function ColumnReader({ verses, lang }: { verses: Verse[]; lang: LangMode }) {
  return (
    <div className="max-h-[70vh] divide-y divide-mist overflow-y-auto rounded-xl border border-mist bg-cloud sm:max-h-[34rem]">
      {verses.map((v) => (
        <div key={v.ref} id={`verse-${v.ref}`} className="p-4">
          <div className="flex gap-3">
            <span className="mt-0.5 font-display text-xs font-semibold text-gold">{v.num}</span>
            <div className="min-w-0 flex-1">
              {lang !== 'ml' && <p className="leading-relaxed text-ink">{v.text.en}</p>}
              {lang !== 'en' && (
                <p className={`font-ml leading-relaxed text-ink/80 ${lang === 'both' ? 'mt-1' : ''}`}>{v.text.ml}</p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function ChapterSkeleton() {
  return (
    <div className="card animate-pulse space-y-3 p-6" aria-hidden="true">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="h-3 w-full rounded bg-mist" />
      ))}
    </div>
  )
}

export function ScrollScreen() {
  const books = api.listBooks()
  const [testament, setTestament] = useState<Testament>('old')
  const [activeBookId, setActiveBookId] = useState('genesis')
  const [chapter, setChapter] = useState(1)
  const [mode, setMode] = useState<ReaderMode>('scroll')
  const [lang, setLang] = useLangPreference()
  const [pendingScroll, setPendingScroll] = useState<string | null>(null)
  const [railOpen, setRailOpen] = useState(false)
  const [verses, setVerses] = useState<Verse[] | null>(null)

  const activeBook = books.find((b) => b.id === activeBookId)

  useEffect(() => {
    let cancelled = false
    setVerses(null)
    api.getChapter(activeBookId, chapter).then((vs) => {
      if (!cancelled) setVerses(vs)
    })
    return () => {
      cancelled = true
    }
  }, [activeBookId, chapter])

  useEffect(() => {
    if (!pendingScroll || verses === null) return
    const el = document.getElementById(`verse-${pendingScroll}`)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      setPendingScroll(null)
    }
  }, [pendingScroll, verses])

  function selectBook(id: string) {
    setActiveBookId(id)
    setChapter(1)
  }

  function jumpTo(verse: Verse) {
    const match = books.find((b) => verse.ref.startsWith(`${b.name.en} `))
    if (!match) return
    const rest = verse.ref.slice(match.name.en.length + 1)
    const chapNum = Number.parseInt(rest.split(':')[0], 10)
    setActiveBookId(match.id)
    setTestament(match.testament)
    if (!Number.isNaN(chapNum)) setChapter(chapNum)
    setPendingScroll(verse.ref)
  }

  return (
    <div className="flex gap-6">
      <BookRail
        books={books}
        testament={testament}
        onTestament={setTestament}
        activeBookId={activeBookId}
        onSelectBook={selectBook}
        open={railOpen}
        onClose={() => setRailOpen(false)}
      />

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-3 sm:flex-none">
            <button
              type="button"
              onClick={() => setRailOpen(true)}
              className="inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-lg border border-mist bg-cloud px-3 text-sm font-medium text-ink/70 md:hidden"
            >
              <Menu className="h-4 w-4" aria-hidden="true" />
              Books
            </button>
            <SearchBox activeBookNameEn={activeBook?.name.en ?? ''} onJump={jumpTo} />
            <TranslationBadge />
          </div>
          <div className="flex items-center gap-2">
            <LangToggle lang={lang} onChange={setLang} />
            <ModeToggle mode={mode} onChange={setMode} />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h1 className="font-display text-xl text-ink sm:text-2xl">
              {activeBook?.name.en} {chapter}
            </h1>
            <p className="font-ml text-sm text-ink/60">{activeBook?.name.ml}</p>
          </div>
          <div className="flex items-center gap-1 text-xs text-ink/50">
            <button
              type="button"
              onClick={() => setChapter((c) => Math.max(1, c - 1))}
              className="flex min-h-11 min-w-11 items-center justify-center rounded hover:bg-cloud sm:min-h-0 sm:min-w-0 sm:p-1"
              aria-label="Previous chapter"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            </button>
            <span className="whitespace-nowrap">
              Chapter {chapter} of {activeBook?.chapterCount ?? '?'}
            </span>
            <button
              type="button"
              onClick={() => setChapter((c) => Math.min(activeBook?.chapterCount ?? c, c + 1))}
              className="flex min-h-11 min-w-11 items-center justify-center rounded hover:bg-cloud sm:min-h-0 sm:min-w-0 sm:p-1"
              aria-label="Next chapter"
            >
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="mt-3">
          {verses === null ? (
            <ChapterSkeleton />
          ) : verses.length === 0 ? (
            <div className="card p-8 text-center text-sm text-ink/50">
              This chapter hasn't been loaded in this preview — only Genesis 1 is bundled for now.
            </div>
          ) : mode === 'scroll' ? (
            <ScrollReader book={activeBook} chapter={chapter} verses={verses} lang={lang} />
          ) : (
            <ColumnReader verses={verses} lang={lang} />
          )}
        </div>

        <GuardrailNote className="mt-3">Scripture is always free to read here — no sign-in, no paywall, ever.</GuardrailNote>
      </div>
    </div>
  )
}
