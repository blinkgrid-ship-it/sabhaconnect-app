import { describe, expect, it } from 'vitest'
import catalogue from '@/data/bible/catalogue.json'
import type { Verse } from '@/types/models'

/**
 * Integrity of the mirrored verse data — all 66 books, both languages.
 *
 * These guard the properties the reader depends on and cannot recover from on
 * its own: that EN and ML line up by verse number
 * (GHS_ProductArchitecture.md §13.1), and that no footnote prose leaked into
 * the verse text — the defect that ruled out the pre-made JSON mirrors and
 * forced the USFM path.
 */

interface BookData {
  bookId: string
  chapterCount: number
  chapters: Record<string, Verse[]>
}

// Eager here, unlike the app's lazy loader: a data-integrity suite has to look
// at all of it, and 9 MB in a Node process is cheap.
const files = import.meta.glob<{ default: BookData }>('../data/bible/books/*.json', {
  eager: true,
})

const BOOKS = Object.entries(files)
  .map(([path, mod]) => ({
    id: (path.split('/').pop() ?? '').replace(/\.json$/, '').toUpperCase(),
    data: mod.default,
  }))
  .sort((a, b) => a.id.localeCompare(b.id))

const ALL_VERSES = BOOKS.flatMap(({ data }) => Object.values(data.chapters).flat())

/**
 * Verses that genuinely exist in one translation and not the other.
 *
 * These are real textual differences between the WEB and the IRV Malayalam —
 * passages absent from the manuscript tradition one of them follows, plus the
 * Romans 14/16 doxology renumbering. They are listed explicitly rather than
 * tolerated by a threshold, so a *new* gap appearing after a re-seed fails the
 * build instead of hiding inside an allowance.
 */
const KNOWN_SINGLE_LANGUAGE: Record<string, 'en' | 'ml'> = {
  '1SA.30.31': 'en', // present in English only
  'LUK.17.36': 'ml',
  'ACT.8.37': 'ml',
  'ACT.15.34': 'ml',
  'ACT.24.7': 'ml',
  'ROM.14.24': 'en',
  'ROM.14.25': 'en',
  'ROM.14.26': 'en',
  'ROM.16.26': 'ml',
  'ROM.16.27': 'ml',
  '3JN.1.15': 'ml',
  'REV.12.18': 'ml',
}

const isKnownGap = (ref: string): boolean => ref in KNOWN_SINGLE_LANGUAGE

describe('the mirror', () => {
  it('contains all 66 books', () => {
    expect(BOOKS.length).toBe(66)
  })

  it('contains the whole Bible', () => {
    // ~31,100 verses across the two translations' shared numbering.
    expect(ALL_VERSES.length).toBeGreaterThan(31_000)
  })
})

describe('every book', () => {
  it('has the number of chapters the catalogue claims', () => {
    for (const { id, data } of BOOKS) {
      const entry = catalogue.find((b) => b.id === id)
      expect(entry, `${id} is not in the catalogue`).toBeDefined()
      expect(Object.keys(data.chapters).length, `${id} chapter count`).toBe(entry?.chapterCount)
    }
  })

  it('numbers verses in ascending order with no duplicates', () => {
    for (const { id, data } of BOOKS) {
      for (const [chapterKey, verses] of Object.entries(data.chapters)) {
        const nums = verses.map((v) => v.num)
        expect(new Set(nums).size, `${id} ${chapterKey} has duplicates`).toBe(nums.length)
        expect([...nums].sort((a, b) => a - b), `${id} ${chapterKey} out of order`).toEqual(nums)
      }
    }
  })

  it('keys both languages on one shared verse reference', () => {
    for (const { id, data } of BOOKS) {
      for (const [chapterKey, verses] of Object.entries(data.chapters)) {
        for (const verse of verses) {
          expect(verse.ref).toBe(`${id}.${chapterKey}.${verse.num}`)
        }
      }
    }
  })
})

describe('alignment', () => {
  it('has both languages for every verse except the known textual variants', () => {
    const gaps = ALL_VERSES.filter((v) => !v.text.en.trim() || !v.text.ml.trim()).map((v) => v.ref)
    expect(gaps.sort()).toEqual(Object.keys(KNOWN_SINGLE_LANGUAGE).sort())
  })

  it('never leaves a verse empty in both languages', () => {
    const blank = ALL_VERSES.filter((v) => !v.text.en.trim() && !v.text.ml.trim())
    expect(blank.map((v) => v.ref)).toEqual([])
  })

  it('records each known variant in the language it actually survives in', () => {
    for (const [ref, lang] of Object.entries(KNOWN_SINGLE_LANGUAGE)) {
      const verse = ALL_VERSES.find((v) => v.ref === ref)
      expect(verse, `${ref} is missing entirely`).toBeDefined()
      expect(verse?.text[lang].trim(), `${ref} should have ${lang}`).toBeTruthy()
    }
  })
})

describe('text cleanliness', () => {
  it('carries no leaked footnote markers', () => {
    // The failure this is written against looks like:
    //   "In the beginning, God1:1 The Hebrew word rendered..."
    // i.e. a chapter:verse marker welded onto a word mid-sentence.
    const leaked = ALL_VERSES.filter(
      (v) => /\w\d+:\d+\s/.test(v.text.en) || /\S\d+:\d+\s/.test(v.text.ml),
    )
    expect(leaked.map((v) => v.ref)).toEqual([])
  })

  it('carries no residual USFM markup', () => {
    const markup = ALL_VERSES.filter((v) => /\\[a-z]/i.test(v.text.en) || /\\[a-z]/i.test(v.text.ml))
    expect(markup.map((v) => v.ref)).toEqual([])
  })

  it('has no doubled whitespace', () => {
    const messy = ALL_VERSES.filter((v) => /\s{2,}/.test(v.text.en) || /\s{2,}/.test(v.text.ml))
    expect(messy.map((v) => v.ref)).toEqual([])
  })

  it('is Malayalam script wherever a Malayalam line exists', () => {
    const malayalam = /[ഀ-ൿ]/
    const wrong = ALL_VERSES.filter(
      (v) => v.text.ml.trim() && !malayalam.test(v.text.ml) && !isKnownGap(v.ref),
    )
    expect(wrong.map((v) => v.ref)).toEqual([])
  })
})

describe('known verses read correctly', () => {
  const verseAt = (ref: string): Verse | undefined => ALL_VERSES.find((v) => v.ref === ref)

  it('Genesis 1:1', () => {
    const verse = verseAt('GEN.1.1')
    expect(verse?.text.en).toBe('In the beginning, God created the heavens and the earth.')
    expect(verse?.text.ml).toContain('ആദിയിൽ')
  })

  it('Genesis 1:3', () => {
    expect(verseAt('GEN.1.3')?.text.en).toContain('Let there be light')
  })

  it('John 3:16', () => {
    const verse = verseAt('JHN.3.16')
    expect(verse?.text.en).toContain('For God so loved the world')
    expect(verse?.text.ml).toContain('ദൈവം')
  })

  it('Psalm 23:1', () => {
    expect(verseAt('PSA.23.1')?.text.en.toLowerCase()).toContain('shepherd')
  })

  it('Revelation 22:21 closes the mirror', () => {
    expect(verseAt('REV.22.21')?.text.en).toBeTruthy()
  })
})

describe('the catalogue', () => {
  it('is in canonical order with no gaps', () => {
    const orders = catalogue.map((b) => b.order)
    expect(orders).toEqual([...orders].sort((a, b) => a - b))
    expect(new Set(orders).size).toBe(catalogue.length)
  })

  it('splits into 39 Old Testament and 27 New Testament books', () => {
    expect(catalogue.filter((b) => b.testament === 'OT').length).toBe(39)
    expect(catalogue.filter((b) => b.testament === 'NT').length).toBe(27)
  })

  it('gives every book a name in both languages and a positive chapter count', () => {
    for (const book of catalogue) {
      expect(book.name.en, `${book.id} has no English name`).toBeTruthy()
      expect(book.name.ml, `${book.id} has no Malayalam name`).toBeTruthy()
      expect(book.chapterCount, `${book.id} has no chapters`).toBeGreaterThan(0)
    }
  })

  it('names the Malayalam books in Malayalam script', () => {
    const malayalam = /[ഀ-ൿ]/
    const wrong = catalogue.filter((b) => !malayalam.test(b.name.ml))
    expect(wrong.map((b) => b.id)).toEqual([])
  })

  it('marks every book as available, and every marked book really is', () => {
    const marked = catalogue.filter((b) => b.bundled).map((b) => b.id).sort()
    const onDisk = BOOKS.map((b) => b.id).sort()
    expect(marked).toEqual(onDisk)
    expect(marked.length).toBe(66)
  })
})
