import catalogueJson from '@/data/bible/catalogue.json'
import translationsJson from '@/data/bible/translations.json'
import type { Book, Locale, TranslationInfo, Verse } from '@/types/models'

/**
 * Access to the mirrored verse data (see scripts/fetch-bible.mjs).
 *
 * The full catalogue of 66 books is loaded eagerly — it is small, and the left
 * rail needs all of it. Verse text is loaded per book on demand, so opening the
 * app does not pay for ~700 KB of scripture the reader may never look at.
 * Everything is bundled rather than fetched, so it works with no network
 * (GHS_MVP_Brief.md §3.2).
 */

export const BOOKS: Book[] = (catalogueJson as Book[])
  .slice()
  .sort((a, b) => a.order - b.order)

export const TRANSLATIONS = translationsJson as Record<Locale, TranslationInfo>

interface BookData {
  bookId: string
  chapters: Record<string, Verse[]>
}

/**
 * Every mirrored book, discovered at build time and code-split one chunk per
 * book. `import.meta.glob` keeps this correct as books are added — there is no
 * hand-maintained list to fall out of step with what is actually on disk.
 *
 * Lazy on purpose: the full Bible is ~9 MB, and a reader opening Genesis must
 * not pay for the other 65 books.
 */
const modules = import.meta.glob<{ default: BookData }>('../../data/bible/books/*.json')

const LOADERS: Record<string, () => Promise<{ default: BookData }>> = Object.fromEntries(
  Object.entries(modules).map(([filePath, loader]) => {
    const id = (filePath.split('/').pop() ?? '').replace(/\.json$/, '').toUpperCase()
    return [id, loader]
  }),
)

const cache = new Map<string, BookData>()
const inflight = new Map<string, Promise<BookData | null>>()

export function isBundled(bookId: string): boolean {
  return bookId in LOADERS
}

/** Resolves to null for a book outside the demo bundle — not an error. */
export async function loadBook(bookId: string): Promise<BookData | null> {
  const id = bookId.toUpperCase()

  const cached = cache.get(id)
  if (cached) return cached

  const loader = LOADERS[id]
  if (!loader) return null

  // De-duplicate concurrent loads of the same book.
  const existing = inflight.get(id)
  if (existing) return existing

  const promise = loader()
    .then((mod) => {
      const data = mod.default
      cache.set(id, data)
      return data
    })
    .finally(() => {
      inflight.delete(id)
    })

  inflight.set(id, promise)
  return promise
}

export function findBook(bookId: string): Book | undefined {
  const id = bookId.toUpperCase()
  return BOOKS.find((b) => b.id === id)
}

/** Test seam only. */
export function __clearBookCache(): void {
  cache.clear()
  inflight.clear()
}
