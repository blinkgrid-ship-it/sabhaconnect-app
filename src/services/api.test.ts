import { beforeEach, describe, expect, it } from 'vitest'
import { api } from './api'
import { SEED_CHURCH } from './seed/church'
import * as persistence from './persistence'

/**
 * The seam's behaviour. These are the contract tests both implementations must
 * satisfy — the demo one today, the Supabase one when it goes live.
 */

const CHURCH = SEED_CHURCH.id
const COMMENTER = 'u-mary' // on the allow-list
const READER = 'u-john' // deliberately not on the allow-list

beforeEach(async () => {
  await api.resetDemoState(CHURCH)
  persistence.__resetMemory()
})

describe('tenant', () => {
  it('loads the church with its theme and allow-list', async () => {
    const church = await api.getChurch(CHURCH)
    expect(church.id).toBe(CHURCH)
    expect(church.commenterIds).toContain(COMMENTER)
    expect(church.commenterIds).not.toContain(READER)
    expect(church.theme.parchment).toBeTruthy()
    expect(church.theme.sanctuary).toBeTruthy()
  })

  it('rejects an unknown church rather than returning empty data', async () => {
    await expect(api.getChurch('does-not-exist')).rejects.toThrow(/unknown church/i)
  })

  it('enables both headline surfaces for the demo tenant', async () => {
    const church = await api.getChurch(CHURCH)
    expect(church.enabledComponents).toEqual(expect.arrayContaining(['today', 'scroll']))
  })
})

describe('scripture', () => {
  it('lists all 66 books', async () => {
    expect((await api.listBooks()).length).toBe(66)
  })

  it('filters by testament', async () => {
    expect((await api.listBooks('OT')).length).toBe(39)
    expect((await api.listBooks('NT')).length).toBe(27)
  })

  it('returns verses with both languages on a shared key', async () => {
    const verses = await api.getChapter('GEN', 1)
    expect(verses.length).toBe(31)
    expect(verses[0]).toMatchObject({ ref: 'GEN.1.1', num: 1 })
    expect(verses[0]?.text.en).toBeTruthy()
    expect(verses[0]?.text.ml).toBeTruthy()
  })

  it('is case-insensitive about the book id', async () => {
    expect((await api.getChapter('gen', 1)).length).toBe(31)
  })

  it('returns empty for a chapter that does not exist', async () => {
    await expect(api.getChapter('GEN', 999)).resolves.toEqual([])
    await expect(api.getChapter('GEN', -1)).resolves.toEqual([])
  })

  it('finds verses by English text', async () => {
    const hits = await api.searchScripture('let there be light')
    expect(hits.length).toBeGreaterThan(0)
    expect(hits[0]?.bookId).toBe('GEN')
    expect(hits[0]?.text.en.toLowerCase()).toContain('let there be light')
  })

  it('finds verses by Malayalam text', async () => {
    const hits = await api.searchScripture('ആദിയിൽ')
    expect(hits.length).toBeGreaterThan(0)
    expect(hits[0]?.text.ml).toContain('ആദിയിൽ')
  })

  it('ignores a query too short to be meaningful', async () => {
    await expect(api.searchScripture('a')).resolves.toEqual([])
    await expect(api.searchScripture('')).resolves.toEqual([])
  })

  it('respects the result limit', async () => {
    const hits = await api.searchScripture('the', 5)
    expect(hits.length).toBeLessThanOrEqual(5)
  })
})

describe('the comment gate', () => {
  it('grants comment rights to a member on the allow-list', async () => {
    await expect(api.canComment(COMMENTER, CHURCH)).resolves.toBe(true)
  })

  it('denies comment rights to a member who is not', async () => {
    await expect(api.canComment(READER, CHURCH)).resolves.toBe(false)
  })

  it('denies comment rights to an unknown user', async () => {
    await expect(api.canComment('nobody', CHURCH)).resolves.toBe(false)
  })

  it('accepts a comment from a permitted member', async () => {
    const before = await api.listComments('r-pastor-1', CHURCH)
    const created = await api.addComment('r-pastor-1', 'A considered reply.', COMMENTER, CHURCH)

    expect(created.authorId).toBe(COMMENTER)
    expect(created.body).toBe('A considered reply.')

    const after = await api.listComments('r-pastor-1', CHURCH)
    expect(after.length).toBe(before.length + 1)
  })

  // The gate is enforced in the seam, not only in the UI: a reader without
  // rights cannot post by calling the seam directly.
  it('refuses a comment from a member without rights', async () => {
    await expect(
      api.addComment('r-pastor-1', 'Trying anyway.', READER, CHURCH),
    ).rejects.toThrow(/limited to selected members/i)
  })

  it('does not persist a refused comment', async () => {
    const before = await api.listComments('r-pastor-1', CHURCH)
    await expect(api.addComment('r-pastor-1', 'Nope.', READER, CHURCH)).rejects.toThrow()
    const after = await api.listComments('r-pastor-1', CHURCH)
    expect(after.length).toBe(before.length)
  })

  it('rejects an empty or whitespace-only comment', async () => {
    await expect(api.addComment('r-pastor-1', '   ', COMMENTER, CHURCH)).rejects.toThrow(/empty/i)
  })

  it('trims surrounding whitespace', async () => {
    const created = await api.addComment('r-pastor-1', '  spaced  ', COMMENTER, CHURCH)
    expect(created.body).toBe('spaced')
  })

  it('returns comments oldest first', async () => {
    const comments = await api.listComments('r-pastor-1', CHURCH)
    const dates = comments.map((c) => c.createdAt)
    expect(dates).toEqual([...dates].sort())
  })

  it('keeps comments scoped to their target', async () => {
    await api.addComment('r-comm-1', 'On another post.', COMMENTER, CHURCH)
    const onPastor = await api.listComments('r-pastor-1', CHURCH)
    expect(onPastor.every((c) => c.targetId === 'r-pastor-1')).toBe(true)
  })
})

describe('the Today page content', () => {
  it('returns the question authored for a given date', async () => {
    const question = await api.getTodayQuestion(CHURCH, '2026-08-13')
    expect(question?.id).toBe('q-2026-08-13')
  })

  it('falls back to a rotation rather than nothing on an unplanned date', async () => {
    const question = await api.getTodayQuestion(CHURCH, '2031-04-02')
    expect(question).not.toBeNull()
    expect(question?.status).toBe('approved')
  })

  it('puts the pastor reflection first', async () => {
    const reflections = await api.getReflections(CHURCH, 'q-2026-08-13')
    expect(reflections[0]?.isPastor).toBe(true)
    expect(reflections.slice(1).every((r) => !r.isPastor)).toBe(true)
  })
})

describe('artifact of the day', () => {
  it('is stable for a given date', async () => {
    const a = await api.getArtifactOfDay('2026-08-13')
    const b = await api.getArtifactOfDay('2026-08-13')
    expect(a?.id).toBe(b?.id)
  })

  it('changes across the week rather than sticking on one entry', async () => {
    const week = await Promise.all(
      ['2026-08-10', '2026-08-11', '2026-08-12', '2026-08-13', '2026-08-14', '2026-08-15'].map((d) =>
        api.getArtifactOfDay(d),
      ),
    )
    expect(new Set(week.map((a) => a?.id)).size).toBeGreaterThan(1)
  })

  it('always resolves to a real artifact', async () => {
    const artifact = await api.getArtifactOfDay('2026-12-25')
    expect(artifact?.name).toBeTruthy()
    expect(artifact?.blurb).toBeTruthy()
  })
})

describe('demo persistence', () => {
  it('keeps a posted comment across reads', async () => {
    await api.addComment('r-pastor-1', 'Durable.', COMMENTER, CHURCH)
    const comments = await api.listComments('r-pastor-1', CHURCH)
    expect(comments.some((c) => c.body === 'Durable.')).toBe(true)
  })

  it('resetDemoState clears comments posted during a session', async () => {
    const before = await api.listComments('r-pastor-1', CHURCH)
    await api.addComment('r-pastor-1', 'Temporary.', COMMENTER, CHURCH)
    await api.resetDemoState(CHURCH)
    const after = await api.listComments('r-pastor-1', CHURCH)
    expect(after.length).toBe(before.length)
  })

  it('survives corrupt stored data rather than throwing', async () => {
    window.localStorage.setItem(`ghs:${CHURCH}:comments`, '{ not json')
    persistence.__resetMemory()
    await expect(api.listComments('r-pastor-1', CHURCH)).resolves.toBeInstanceOf(Array)
  })
})
