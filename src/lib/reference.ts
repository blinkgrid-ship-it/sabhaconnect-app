import type { Book } from '@/types/models'

/**
 * Scripture reference parsing for the header search.
 *
 * The header's placeholder is "e.g. 3:5" (GHS_MVP_Brief.md §3.2), so a bare
 * `chapter:verse` has to resolve against the book the reader is already in.
 * Everything else — "John 3:16", "1 John 2", "Gen 1:1", a Malayalam book name,
 * or free text — funnels through the same entry point.
 */

export interface ParsedReference {
  kind: 'reference'
  bookId: string
  chapter: number
  verse: number | null
}

export interface ParsedText {
  kind: 'text'
  query: string
}

export type ParseResult = ParsedReference | ParsedText | null

/** Fold a book name for matching: lowercase, strip punctuation and spaces. */
function fold(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFC')
    .replace(/[.’'`]/g, '')
    .replace(/\s+/g, '')
    .trim()
}

/**
 * Resolve a book name fragment to a book.
 *
 * Matches English and Malayalam names, common abbreviations, and leading
 * numerals in either "1 John" or "1John" form. Prefers an exact name match
 * over a prefix match so "John" never resolves to "1 John".
 */
export function resolveBook(fragment: string, books: readonly Book[]): Book | null {
  const needle = fold(fragment)
  if (!needle) return null

  const candidates = books.map((b) => ({
    book: b,
    en: fold(b.name.en),
    ml: fold(b.name.ml),
    id: fold(b.id),
  }))

  const exact = candidates.find((c) => c.en === needle || c.ml === needle || c.id === needle)
  if (exact) return exact.book

  // USFM-style three-letter codes, e.g. "gen", "jhn".
  const byId = candidates.find((c) => c.id.startsWith(needle) && needle.length >= 3)
  if (byId) return byId.book

  const prefixed = candidates.filter((c) => c.en.startsWith(needle) || c.ml.startsWith(needle))
  if (prefixed.length === 1) return prefixed[0]!.book
  if (prefixed.length > 1) {
    // Ambiguous prefix: take the earliest canonical book, which is what a
    // reader typing "jo" most likely means (Joshua before Job before John).
    return prefixed.sort((a, b) => a.book.order - b.book.order)[0]!.book
  }
  return null
}

/**
 * Parse a search box entry.
 *
 * @param input       what the reader typed
 * @param books       the catalogue to resolve names against
 * @param currentBook the book currently open, used for a bare "3:5"
 */
export function parseReference(
  input: string,
  books: readonly Book[],
  currentBook?: string | null,
): ParseResult {
  const raw = input.trim().replace(/\s+/g, ' ')
  if (!raw) return null

  // "3:5" / "3.5" / "3" — no book named, so use the one already open.
  const bare = /^(\d{1,3})\s*[:.]\s*(\d{1,3})$/.exec(raw)
  if (bare && currentBook) {
    return { kind: 'reference', bookId: currentBook, chapter: Number(bare[1]), verse: Number(bare[2]) }
  }
  const bareChapter = /^(\d{1,3})$/.exec(raw)
  if (bareChapter && currentBook) {
    return { kind: 'reference', bookId: currentBook, chapter: Number(bareChapter[1]), verse: null }
  }

  // "<book> <chapter>[:<verse>]" — the book part may itself start with a
  // numeral ("1 John 2:1"), so the chapter is anchored to the end.
  const withBook = /^(.*?)\s*(\d{1,3})(?:\s*[:.]\s*(\d{1,3}))?$/.exec(raw)
  if (withBook && withBook[1] && withBook[1].trim()) {
    const book = resolveBook(withBook[1], books)
    if (book) {
      const chapter = Number(withBook[2])
      const verse = withBook[3] ? Number(withBook[3]) : null
      if (chapter >= 1 && chapter <= book.chapterCount) {
        return { kind: 'reference', bookId: book.id, chapter, verse }
      }
      // A book we know with a chapter it does not have: clamp rather than fail,
      // so the reader still lands somewhere sensible.
      return { kind: 'reference', bookId: book.id, chapter: book.chapterCount, verse: null }
    }
  }

  // A bare book name opens chapter 1.
  const bookOnly = resolveBook(raw, books)
  if (bookOnly) return { kind: 'reference', bookId: bookOnly.id, chapter: 1, verse: null }

  return { kind: 'text', query: raw }
}

/** Human-readable form, e.g. "GEN.1.3" → "Genesis 1:3". */
export function formatRef(ref: string, books: readonly Book[], locale: 'en' | 'ml' = 'en'): string {
  const [bookId, chapter, verse] = ref.split('.')
  const book = books.find((b) => b.id === bookId)
  const name = book ? book.name[locale] : (bookId ?? ref)
  return verse ? `${name} ${chapter}:${verse}` : `${name} ${chapter}`
}
