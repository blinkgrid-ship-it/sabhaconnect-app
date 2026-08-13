import { useMemo, useState } from 'react'
import { useLang } from '@/context/AppContext'
import type { Book, Testament } from '@/types/models'

/**
 * Old / New testament toggle plus the book list with chapter counts.
 * The active book is brass — the one active state on this panel.
 *
 * All 66 books carry text, so there is nothing to mark as unavailable. The
 * `unbundled` count below only appears if a build ever ships a subset again;
 * it is cheaper to keep the affordance honest than to rediscover it later.
 */
export function BookRail({
  books,
  activeBookId,
  onSelect,
}: {
  books: Book[]
  activeBookId: string
  onSelect: (bookId: string) => void
}): JSX.Element {
  const { showEn, showMl } = useLang()

  const activeBook = books.find((b) => b.id === activeBookId)
  const [testament, setTestament] = useState<Testament>(activeBook?.testament ?? 'OT')

  const visible = useMemo(
    () => books.filter((b) => b.testament === testament).sort((a, b) => a.order - b.order),
    [books, testament],
  )

  const unbundled = books.filter((b) => !b.bundled).length

  return (
    <nav aria-label="Books of the Bible" className="flex h-full min-h-0 flex-col">
      <div
        role="radiogroup"
        aria-label="Testament"
        className="flex shrink-0 gap-1 rounded-full bg-parchment p-1"
      >
        {(['OT', 'NT'] as const).map((t) => {
          const active = testament === t
          return (
            <button
              key={t}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => setTestament(t)}
              className={[
                'flex-1 rounded-full px-3 py-1.5 text-ui transition',
                active ? 'ghs-pill-active' : 'ghs-pill-idle',
              ].join(' ')}
            >
              {t === 'OT' ? 'Old' : 'New'}
            </button>
          )
        })}
      </div>

      <ul className="mt-3 min-h-0 flex-1 overflow-y-auto pr-1">
        {visible.map((book) => {
          const active = book.id === activeBookId
          return (
            <li key={book.id}>
              <button
                type="button"
                onClick={() => onSelect(book.id)}
                aria-current={active ? 'true' : undefined}
                className={[
                  'flex w-full items-baseline justify-between gap-3 rounded-sm px-3 py-2 text-left transition',
                  active ? 'bg-brass/[0.14]' : 'hover:bg-parchment',
                ].join(' ')}
              >
                <span className="min-w-0">
                  {showEn ? (
                    <span
                      lang="en"
                      className={[
                        'block truncate font-display text-[0.9375rem]',
                        active ? 'font-semibold text-brass-ink' : 'text-ink',
                      ].join(' ')}
                    >
                      {book.name.en}
                    </span>
                  ) : null}
                  {showMl ? (
                    <span
                      lang="ml"
                      className={[
                        'block truncate text-[0.9375rem]',
                        active ? 'text-brass-ink' : 'text-ink-muted',
                      ].join(' ')}
                    >
                      {book.name.ml}
                    </span>
                  ) : null}
                </span>

                <span
                  className={`shrink-0 font-overline text-[0.625rem] tracking-normal tabular-nums ${
                    active ? 'text-brass-ink' : 'text-ink-faint'
                  }`}
                >
                  {book.chapterCount}
                </span>
              </button>
            </li>
          )
        })}
      </ul>

      <p className="mt-3 shrink-0 border-t border-rule pt-3 font-overline text-[0.5625rem] uppercase tracking-overline text-ink-faint">
        {unbundled === 0
          ? `${books.length} books · both languages`
          : `${books.length - unbundled} of ${books.length} books available offline`}
      </p>
    </nav>
  )
}

export default BookRail
