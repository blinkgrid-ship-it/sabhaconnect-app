import artifactsJson from '@/data/artifacts/artifacts.json'
import { artifactSource } from '@/config/flags'
import type {
  Artifact,
  Book,
  Church,
  Comment,
  Locale,
  Question,
  Reflection,
  ReviewEvent,
  TranslationInfo,
  User,
  Verse,
  VerseHit,
} from '@/types/models'
import { MEMBER_VISIBLE_STATUS } from '@/types/models'
import { buildRhythm, seedHistory, toIsoDate, type ReadingRhythm } from '@/lib/rhythm'
import * as persistence from './persistence'
import { BOOKS, TRANSLATIONS, findBook, isBundled, loadBook } from './seed/bible'
import { DEFAULT_USER_ID, SEED_CHURCH, SEED_USERS } from './seed/church'
import {
  SEED_COMMENTS,
  SEED_QUESTIONS,
  SEED_REFLECTIONS,
  SEED_REVIEW_EVENTS,
} from './seed/content'

/**
 * The demo implementation of the seam.
 *
 * Two things here are load-bearing beyond "it returns mock data":
 *
 * 1. Every member-facing read filters to `approved`. The screens filter too;
 *    this is the second layer (GHS_ProductArchitecture.md §5, "defense in
 *    depth"). If a screen forgets, members still never see unreviewed content.
 * 2. The return types are exactly the production types, so replacing these
 *    bodies with HTTP calls rewrites no screen (§1).
 */

const KEY_COMMENTS = 'comments'
const KEY_EVENTS = 'reviewEvents'
const KEY_READS = 'readDates'

/** Simulated latency, so loading states are real code paths rather than theory. */
const LATENCY_MS = 90

function settle<T>(value: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), LATENCY_MS))
}

/** The single place "what may a member see" is decided. */
function visibleToMembers<T extends { status: string }>(items: T[]): T[] {
  return items.filter((i) => i.status === MEMBER_VISIBLE_STATUS)
}

// ---------------------------------------------------------------------------
// Tenant & identity
// ---------------------------------------------------------------------------

export async function getChurch(churchId: string): Promise<Church> {
  if (churchId !== SEED_CHURCH.id) {
    throw new Error(`Unknown church "${churchId}".`)
  }
  return settle(SEED_CHURCH)
}

export async function listDemoUsers(churchId: string): Promise<User[]> {
  return settle(SEED_USERS.filter((u) => u.churchId === churchId))
}

export async function getDefaultUserId(): Promise<string> {
  return settle(DEFAULT_USER_ID)
}

// ---------------------------------------------------------------------------
// Scripture — GHS_ProductArchitecture.md §13.1
// ---------------------------------------------------------------------------

export async function listBooks(testament?: 'OT' | 'NT'): Promise<Book[]> {
  const books = testament ? BOOKS.filter((b) => b.testament === testament) : BOOKS
  return settle(books)
}

export async function getTranslations(): Promise<Record<Locale, TranslationInfo>> {
  return settle(TRANSLATIONS)
}

export async function getChapter(bookId: string, chapter: number): Promise<Verse[]> {
  const data = await loadBook(bookId)
  if (!data) return []
  return data.chapters[String(chapter)] ?? []
}

/**
 * Text search across the bundled books.
 *
 * Reference lookups ("John 3:16") are handled by the caller via
 * lib/reference.ts — this is the free-text half only.
 */
export async function searchScripture(query: string, limit = 40): Promise<VerseHit[]> {
  const needle = query.trim().toLowerCase()
  if (needle.length < 2) return []

  const hits: VerseHit[] = []

  for (const book of BOOKS) {
    if (!isBundled(book.id)) continue
    const data = await loadBook(book.id)
    if (!data) continue

    for (const [chapterKey, verses] of Object.entries(data.chapters)) {
      for (const verse of verses) {
        const inEn = verse.text.en.toLowerCase().includes(needle)
        const inMl = verse.text.ml.toLowerCase().includes(needle)
        if (!inEn && !inMl) continue
        hits.push({
          ...verse,
          bookId: book.id,
          bookName: book.name,
          chapter: Number(chapterKey),
        })
        if (hits.length >= limit) return hits
      }
    }
  }
  return hits
}

// ---------------------------------------------------------------------------
// The Today page — GHS_ProductArchitecture.md §14
// ---------------------------------------------------------------------------

/** Stable, date-seeded index into a list. Same day → same pick, no randomness. */
export function seededIndex(seed: string, length: number): number {
  if (length <= 0) return 0
  let h = 2166136261
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return Math.abs(h) % length
}

function today(): string {
  return new Date().toISOString().slice(0, 10)
}

export async function getTodayQuestion(churchId: string, date = today()): Promise<Question | null> {
  const approved = visibleToMembers(SEED_QUESTIONS.filter((q) => q.churchId === churchId))
  if (approved.length === 0) return settle(null)

  const exact = approved.find((q) => q.date === date)
  if (exact) return settle(exact)

  // No question authored for this exact date. Rotate deterministically rather
  // than showing an empty page — the demo must never look broken on a date
  // nobody anticipated.
  return settle(approved[seededIndex(date, approved.length)] ?? null)
}

export async function getReflections(churchId: string, questionId?: string): Promise<Reflection[]> {
  let items = SEED_REFLECTIONS.filter((r) => r.churchId === churchId)
  if (questionId) items = items.filter((r) => r.questionId === questionId)

  const visible = visibleToMembers(items)
  // The pastor's reflection is the anchor of the page (§3.1), so it leads
  // regardless of when it was written.
  return settle(
    visible.sort((a, b) => {
      if (a.isPastor !== b.isPastor) return a.isPastor ? -1 : 1
      return a.createdAt.localeCompare(b.createdAt)
    }),
  )
}

// -- gated comments (§14.2) -------------------------------------------------

function storedComments(churchId: string): Comment[] {
  return persistence.read<Comment[]>(churchId, KEY_COMMENTS, SEED_COMMENTS)
}

/**
 * The gate. Commenting is limited to an allow-list of selected followers;
 * everyone else reads.
 */
export async function canComment(userId: string, churchId: string): Promise<boolean> {
  const church = await getChurch(churchId)
  return church.commenterIds.includes(userId)
}

export async function listComments(targetId: string, churchId = SEED_CHURCH.id): Promise<Comment[]> {
  const all = storedComments(churchId).filter((c) => c.targetId === targetId)
  return settle(visibleToMembers(all).sort((a, b) => a.createdAt.localeCompare(b.createdAt)))
}

export async function addComment(
  targetId: string,
  body: string,
  userId: string,
  churchId = SEED_CHURCH.id,
): Promise<Comment> {
  const trimmed = body.trim()
  if (!trimmed) throw new Error('A comment cannot be empty.')

  // The gate is enforced here, not only in the UI. A reader without rights
  // cannot post by calling the seam directly.
  if (!(await canComment(userId, churchId))) {
    throw new Error('Comments are limited to selected members.')
  }

  const author = SEED_USERS.find((u) => u.id === userId)
  if (!author) throw new Error(`Unknown user "${userId}".`)

  const comment: Comment = {
    id: `c-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    targetId,
    churchId,
    authorId: author.id,
    authorName: author.name,
    authorInitials: author.initials,
    body: trimmed,
    createdAt: new Date().toISOString(),
    // Approved on arrival in the demo; a church that wants moderation flips
    // this to 'pending_review' and the same list query hides it (§14.2).
    status: 'approved',
  }

  persistence.write(churchId, KEY_COMMENTS, [...storedComments(churchId), comment])
  return settle(comment)
}

// -- artifact of the day (§14.3) --------------------------------------------

const ARTIFACTS = artifactsJson as Artifact[]

/**
 * Fetch a curated artifact live from Wikipedia's public REST summary endpoint.
 * Only reached when VITE_ARTIFACT_SOURCE=live; the demo runs from the cache so
 * the meeting works offline.
 */
async function fetchLive(artifact: Artifact): Promise<Artifact> {
  const title = artifact.sourceUrl.split('/wiki/')[1]
  if (!title) return artifact
  try {
    const res = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${title}`, {
      headers: { Accept: 'application/json' },
    })
    if (!res.ok) return artifact
    const data: { extract?: string } = await res.json()
    // Only the blurb is taken live. The image stays the locally cached, reviewed
    // one — a live image is an unreviewed image, and that would break
    // "never unreviewed" and risk depicting a person.
    return data.extract ? { ...artifact, blurb: data.extract } : artifact
  } catch {
    return artifact // offline: the cached copy is already correct
  }
}

export async function getArtifactOfDay(seed = today()): Promise<Artifact | null> {
  if (ARTIFACTS.length === 0) return null
  const artifact = ARTIFACTS[seededIndex(seed, ARTIFACTS.length)] ?? null
  if (!artifact) return null
  return artifactSource === 'live' ? fetchLive(artifact) : settle(artifact)
}

export async function listArtifacts(): Promise<Artifact[]> {
  return settle(ARTIFACTS)
}

// -- reading rhythm ---------------------------------------------------------

/**
 * Record that the reader opened Today, and return their rhythm.
 *
 * The streak is computed from recorded days rather than stored as a number, so
 * it cannot drift out of step with the squares beside it. The first call seeds
 * a plausible history (sample data, like the reflections); every call after
 * that advances it for real.
 */
export async function recordReadingDay(
  churchId = SEED_CHURCH.id,
  date = toIsoDate(new Date()),
): Promise<ReadingRhythm> {
  const stored = persistence.read<string[] | null>(churchId, KEY_READS, null)
  const dates = new Set(stored ?? seedHistory(date))
  dates.add(date)

  persistence.write(churchId, KEY_READS, [...dates].sort())
  return settle(buildRhythm(dates, date))
}

export async function getReadingRhythm(
  churchId = SEED_CHURCH.id,
  date = toIsoDate(new Date()),
): Promise<ReadingRhythm> {
  const stored = persistence.read<string[] | null>(churchId, KEY_READS, null)
  return settle(buildRhythm(stored ?? seedHistory(date), date))
}

// -- review pipeline --------------------------------------------------------

export async function listReviewEvents(entityId?: string): Promise<ReviewEvent[]> {
  const stored = persistence.read<ReviewEvent[]>(SEED_CHURCH.id, KEY_EVENTS, SEED_REVIEW_EVENTS)
  return settle(entityId ? stored.filter((e) => e.entityId === entityId) : stored)
}

/** Reset demo-local state (comments posted during a meeting, etc.). */
export async function resetDemoState(churchId = SEED_CHURCH.id): Promise<void> {
  persistence.clear(churchId, [KEY_COMMENTS, KEY_EVENTS, KEY_READS])
}

export { findBook }
