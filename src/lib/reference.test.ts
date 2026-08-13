import { describe, expect, it } from 'vitest'
import catalogue from '@/data/bible/catalogue.json'
import { formatRef, parseReference, resolveBook } from './reference'
import type { Book } from '@/types/models'

const BOOKS = catalogue as Book[]

describe('resolveBook', () => {
  it('matches an exact English name', () => {
    expect(resolveBook('Genesis', BOOKS)?.id).toBe('GEN')
  })

  it('matches a Malayalam name', () => {
    const genesis = BOOKS.find((b) => b.id === 'GEN')!
    expect(resolveBook(genesis.name.ml, BOOKS)?.id).toBe('GEN')
  })

  it('matches a USFM code', () => {
    expect(resolveBook('jhn', BOOKS)?.id).toBe('JHN')
  })

  it('is case and punctuation insensitive', () => {
    expect(resolveBook('  genesis  ', BOOKS)?.id).toBe('GEN')
    expect(resolveBook('1 John', BOOKS)?.id).toBe('1JN')
    expect(resolveBook('1John', BOOKS)?.id).toBe('1JN')
  })

  it('prefers an exact match over a prefix match', () => {
    // "John" must not resolve to "1 John" just because the prefix matches.
    expect(resolveBook('John', BOOKS)?.id).toBe('JHN')
  })

  it('returns null for nonsense', () => {
    expect(resolveBook('qqqzzz', BOOKS)).toBeNull()
    expect(resolveBook('', BOOKS)).toBeNull()
  })
})

describe('parseReference', () => {
  it('resolves a bare chapter:verse against the open book', () => {
    expect(parseReference('3:5', BOOKS, 'JHN')).toEqual({
      kind: 'reference',
      bookId: 'JHN',
      chapter: 3,
      verse: 5,
    })
  })

  it('accepts a full stop as the separator', () => {
    expect(parseReference('3.5', BOOKS, 'JHN')).toMatchObject({ chapter: 3, verse: 5 })
  })

  it('resolves a bare chapter against the open book', () => {
    expect(parseReference('7', BOOKS, 'GEN')).toEqual({
      kind: 'reference',
      bookId: 'GEN',
      chapter: 7,
      verse: null,
    })
  })

  it('resolves a named book with chapter and verse', () => {
    expect(parseReference('John 3:16', BOOKS, 'GEN')).toEqual({
      kind: 'reference',
      bookId: 'JHN',
      chapter: 3,
      verse: 16,
    })
  })

  it('resolves a book whose name starts with a numeral', () => {
    expect(parseReference('1 John 2:1', BOOKS, 'GEN')).toEqual({
      kind: 'reference',
      bookId: '1JN',
      chapter: 2,
      verse: 1,
    })
  })

  it('opens chapter 1 for a bare book name', () => {
    expect(parseReference('Genesis', BOOKS, null)).toEqual({
      kind: 'reference',
      bookId: 'GEN',
      chapter: 1,
      verse: null,
    })
  })

  it('clamps a chapter beyond the end of the book rather than failing', () => {
    // Genesis has 50 chapters; asking for 99 should still land in Genesis.
    expect(parseReference('Genesis 99', BOOKS, null)).toEqual({
      kind: 'reference',
      bookId: 'GEN',
      chapter: 50,
      verse: null,
    })
  })

  it('falls through to text search for prose', () => {
    expect(parseReference('let there be light', BOOKS, 'GEN')).toEqual({
      kind: 'text',
      query: 'let there be light',
    })
  })

  it('returns null for empty input', () => {
    expect(parseReference('   ', BOOKS, 'GEN')).toBeNull()
  })

  it('treats a bare number as text when no book is open', () => {
    expect(parseReference('3:5', BOOKS, null)).toEqual({ kind: 'text', query: '3:5' })
  })

  it('never throws on hostile input', () => {
    const inputs = ['::::', '999999999999:1', '-1:-1', '\\', '<script>', '1:', ':1', '.'.repeat(200)]
    for (const input of inputs) {
      expect(() => parseReference(input, BOOKS, 'GEN')).not.toThrow()
    }
  })
})

describe('formatRef', () => {
  it('renders an English reference', () => {
    expect(formatRef('GEN.1.3', BOOKS)).toBe('Genesis 1:3')
  })

  it('renders a chapter-only reference', () => {
    expect(formatRef('GEN.1', BOOKS)).toBe('Genesis 1')
  })

  it('renders a Malayalam reference', () => {
    const genesis = BOOKS.find((b) => b.id === 'GEN')!
    expect(formatRef('GEN.1.3', BOOKS, 'ml')).toBe(`${genesis.name.ml} 1:3`)
  })
})
