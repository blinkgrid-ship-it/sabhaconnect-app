// Maps a book id to a dynamic import of its verse/lexicon chunk, so opening
// a book only ever downloads that book's text. Add an entry here as more
// books get bundled; an unregistered book resolves to empty (matching the
// existing "not loaded in this preview" behavior).

import type { LexiconEntry, Verse } from '../../types/models'

export interface ChapterModule {
  verses: Verse[]
  lexicon: LexiconEntry[]
}

const loaders: Record<string, () => Promise<ChapterModule>> = {
  genesis: () => import('./genesis'),
}

const cache = new Map<string, Promise<ChapterModule>>()

/** Loads (and caches) the verse/lexicon chunk for a book id. Empty module if unregistered. */
export function loadBookData(bookId: string): Promise<ChapterModule> {
  const cached = cache.get(bookId)
  if (cached) return cached

  const loader = loaders[bookId]
  const promise = loader ? loader() : Promise.resolve({ verses: [], lexicon: [] })
  cache.set(bookId, promise)
  return promise
}

export function registeredBookIds(): string[] {
  return Object.keys(loaders)
}
