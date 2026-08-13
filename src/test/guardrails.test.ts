import { readFileSync, readdirSync, statSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import artifacts from '@/data/artifacts/artifacts.json'
import translations from '@/data/bible/translations.json'
import catalogue from '@/data/bible/catalogue.json'
import { REVIEW_TRANSITIONS, type Artifact, type ReviewStatus } from '@/types/models'
import { SEED_COMMENTS, SEED_QUESTIONS, SEED_REFLECTIONS } from '@/services/seed/content'
import { api } from '@/services/api'
import { SEED_CHURCH } from '@/services/seed/church'

/**
 * GUARDRAILS AS CODE — GHS_ProductArchitecture.md §8.
 *
 * These are the product's promises expressed as failing builds. Each `it` below
 * maps to one bullet in §8 or one guardrail in GHS_MVP_Brief.md §5. If one of
 * these ever goes red, the fix is the code, not the test.
 */

const SRC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry)
    if (statSync(full).isDirectory()) {
      if (entry === 'data' || entry === 'node_modules') continue
      walk(full, out)
    } else if (/\.(ts|tsx)$/.test(entry) && !/\.(test|spec)\.tsx?$/.test(entry)) {
      out.push(full)
    }
  }
  return out
}

const sourceFiles = walk(SRC)

/** Files that make up the data layer and are allowed to reach past the seam. */
function isServiceFile(file: string): boolean {
  return file.includes(`${path.sep}services${path.sep}`) || file.includes(`${path.sep}test${path.sep}`)
}

// ---------------------------------------------------------------------------

describe('never uncited — artifacts', () => {
  const all = artifacts as Artifact[]

  it('ships a non-empty curated list', () => {
    expect(all.length).toBeGreaterThan(0)
  })

  // §8: "every Artifact has a non-empty sourceUrl (Wikipedia attribution)".
  it('every artifact carries a non-empty sourceUrl and sourceLabel', () => {
    for (const artifact of all) {
      expect(artifact.sourceUrl, `${artifact.id} has no sourceUrl`).toBeTruthy()
      expect(artifact.sourceUrl).toMatch(/^https?:\/\//)
      expect(artifact.sourceLabel, `${artifact.id} has no sourceLabel`).toBeTruthy()
    }
  })

  it('every artifact returned by the seam carries attribution', async () => {
    // The rotation is date-seeded; walk a full year so every entry the pastor
    // could land on is exercised, not just today's.
    const days = Array.from({ length: 366 }, (_, day) =>
      new Date(Date.UTC(2026, 0, 1 + day)).toISOString().slice(0, 10),
    )
    const rotated = await Promise.all(days.map((seed) => api.getArtifactOfDay(seed)))

    for (const artifact of rotated) {
      expect(artifact).not.toBeNull()
      expect(artifact?.sourceUrl).toMatch(/^https?:\/\//)
      expect(artifact?.sourceLabel).toBeTruthy()
    }
    // And the rotation genuinely covers the list rather than favouring a few.
    expect(new Set(rotated.map((a) => a?.id)).size).toBe(all.length)
  })
})

describe('never depict — artifacts are places and objects only', () => {
  const all = artifacts as Artifact[]
  const ALLOWED = ['place', 'object', 'inscription', 'structure']

  // §14.3: the curated list contains places and objects only, never a person.
  it('no artifact has a kind outside the allowed set', () => {
    for (const artifact of all) {
      expect(ALLOWED, `${artifact.id} has kind "${artifact.kind}"`).toContain(artifact.kind)
    }
  })

  it('an image is only shown once a human has reviewed it', () => {
    for (const artifact of all) {
      if (artifact.imageReview.status === 'approved') {
        // An approval must name a reviewer and a date — an anonymous approval
        // is not an approval.
        expect(artifact.imageReview.reviewedBy, `${artifact.id}`).toBeTruthy()
        expect(artifact.imageReview.reviewedAt, `${artifact.id}`).toBeTruthy()
        expect(artifact.imageUrl, `${artifact.id} approved but has no image`).toBeTruthy()
      }
    }
  })

  it('records a reason for every withheld image', () => {
    const withheld = all.filter((a) => a.imageUrl && a.imageReview.status !== 'approved')
    for (const artifact of withheld) {
      expect(artifact.imageReview.note, `${artifact.id} withheld without a reason`).toBeTruthy()
    }
  })
})

describe('never uncited — scripture', () => {
  // §8: "every scripture translation shown carries an attribution string".
  it('both translations carry a name, abbreviation and copyright', () => {
    for (const lang of ['en', 'ml'] as const) {
      const t = translations[lang]
      expect(t, `no translation metadata for ${lang}`).toBeTruthy()
      expect(t.name).toBeTruthy()
      expect(t.abbrev).toBeTruthy()
      expect(t.copyright).toBeTruthy()
      expect(t.sourceUrl).toMatch(/^https?:\/\//)
    }
  })

  it('exposes attribution through the seam, not a hard-coded string', async () => {
    const fromApi = await api.getTranslations()
    expect(fromApi.en.abbrev).toBe(translations.en.abbrev)
    expect(fromApi.ml.abbrev).toBe(translations.ml.abbrev)
  })
})

describe('never unreviewed', () => {
  // §5 + §8: member-facing content queries return only `approved`.
  it('the seed deliberately contains unapproved content to prove the filter', () => {
    const unapproved = [...SEED_REFLECTIONS, ...SEED_COMMENTS].filter((i) => i.status !== 'approved')
    expect(unapproved.length).toBeGreaterThan(0)
  })

  it('getReflections never returns unapproved content', async () => {
    const reflections = await api.getReflections(SEED_CHURCH.id)
    expect(reflections.length).toBeGreaterThan(0)
    for (const r of reflections) expect(r.status).toBe('approved')
    expect(reflections.map((r) => r.id)).not.toContain('r-held')
  })

  it('listComments never returns unapproved content', async () => {
    const comments = await api.listComments('r-pastor-1', SEED_CHURCH.id)
    expect(comments.length).toBeGreaterThan(0)
    for (const c of comments) expect(c.status).toBe('approved')
    expect(comments.map((c) => c.id)).not.toContain('c-pending')
  })

  it('getTodayQuestion never returns unapproved content', async () => {
    for (const q of SEED_QUESTIONS) {
      const result = await api.getTodayQuestion(SEED_CHURCH.id, q.date)
      expect(result?.status).toBe('approved')
    }
  })

  it('the review state machine has no path out of removed', () => {
    expect(REVIEW_TRANSITIONS.removed).toEqual([])
  })

  it('nothing transitions straight from draft to approved', () => {
    const fromDraft = REVIEW_TRANSITIONS.draft as readonly ReviewStatus[]
    expect(fromDraft).not.toContain('approved')
  })
})

describe('never preach / never counsel — content is authored and approved', () => {
  it('every seeded question names a human author and a human approver', () => {
    for (const q of SEED_QUESTIONS) {
      expect(q.authorId, `${q.id} has no author`).toBeTruthy()
      expect(q.authorName, `${q.id} has no author name`).toBeTruthy()
      expect(q.approvedBy, `${q.id} has no approver`).toBeTruthy()
      expect(q.approvedBy).not.toBe(q.authorId) // an author cannot approve their own
    }
  })
})

describe('never imitate the pastor', () => {
  // §8: "no model field or endpoint enables voice/likeness cloning".
  it('no source file references voice or likeness cloning', () => {
    const banned = /\b(voiceClone|cloneVoice|voice_clone|likenessClone|synthesizeVoice|ttsClone)\b/
    for (const file of sourceFiles) {
      const contents = readFileSync(file, 'utf8')
      expect(banned.test(contents), `${path.relative(SRC, file)} references voice cloning`).toBe(false)
    }
  })
})

describe('the seam holds — GHS_ProductArchitecture.md §1', () => {
  // §8: "screens may not import seed/persistence/data layer directly".
  // The lint rule enforces this too; this test means it also fails `npm test`,
  // where a developer is more likely to be looking.
  it('no screen or component imports the data layer directly', () => {
    const forbidden =
      /from\s+['"](?:@\/|\.{1,2}\/).*?(services\/(seed|persistence|demoApi|supabaseApi|supabaseClient)|data\/)/
    const offenders: string[] = []

    for (const file of sourceFiles) {
      if (isServiceFile(file)) continue
      const contents = readFileSync(file, 'utf8')
      if (forbidden.test(contents)) offenders.push(path.relative(SRC, file))
    }
    expect(offenders, 'these files reach past the api seam').toEqual([])
  })

  it('no screen imports the supabase sdk directly', () => {
    const offenders: string[] = []
    for (const file of sourceFiles) {
      if (isServiceFile(file)) continue
      if (readFileSync(file, 'utf8').includes('@supabase/supabase-js')) {
        offenders.push(path.relative(SRC, file))
      }
    }
    expect(offenders).toEqual([])
  })
})

describe('never paywall scripture or prayer', () => {
  it('the reading surfaces carry no payment or entitlement gate', () => {
    const paywall = /\b(paywall|subscribe|upgradePlan|requiresPayment|stripe|checkout)\b/i
    const readingSurfaces = sourceFiles.filter((f) => f.includes(`modules${path.sep}scroll`))
    expect(readingSurfaces.length).toBeGreaterThan(0)
    for (const file of readingSurfaces) {
      expect(paywall.test(readFileSync(file, 'utf8')), path.relative(SRC, file)).toBe(false)
    }
  })

  it('scripture is available without any user being signed in', async () => {
    const verses = await api.getChapter('GEN', 1)
    expect(verses.length).toBeGreaterThan(0)
  })
})

describe('the catalogue is honest about what is available', () => {
  it('lists the full 66-book canon', () => {
    expect(catalogue.length).toBe(66)
  })

  // The rail marks books as available; every one of those marks must be true,
  // or the reader hits a dead end the interface promised it would not.
  it('every book it marks as available really opens', async () => {
    const marked = catalogue.filter((b) => b.bundled)
    expect(marked.length).toBe(66)

    const opened = await Promise.all(
      marked.map(async (b) => ({ id: b.id, verses: (await api.getChapter(b.id, 1)).length })),
    )
    const empty = opened.filter((r) => r.verses === 0).map((r) => r.id)
    expect(empty, 'these books are marked available but have no chapter 1').toEqual([])
  })

  it('every book opens at its last chapter too', async () => {
    const sample = catalogue.filter((b) => b.chapterCount > 1)
    const opened = await Promise.all(
      sample.map(async (b) => ({
        id: b.id,
        verses: (await api.getChapter(b.id, b.chapterCount)).length,
      })),
    )
    expect(opened.filter((r) => r.verses === 0).map((r) => r.id)).toEqual([])
  })

  it('returns an empty chapter rather than throwing for a chapter past the end', async () => {
    await expect(api.getChapter('GEN', 999)).resolves.toEqual([])
  })

  it('returns an empty chapter rather than throwing for an unknown book', async () => {
    await expect(api.getChapter('NOPE', 1)).resolves.toEqual([])
  })
})
