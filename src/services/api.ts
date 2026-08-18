// The ONLY way screens touch data. Reads seed data + localStorage today;
// swap this module's internals for real network calls later and no screen
// has to change, since every screen only ever imports `api` and the types
// in src/types/models.ts — never seed.ts or localStorage directly.

import { seed, type Db } from '../data/seed'
import { loadBookData } from '../data/bible/registry'
import type {
  Artifact,
  Book,
  Church,
  Comment,
  Devotional,
  FeedItem,
  GivingFund,
  JournalEntry,
  LexiconEntry,
  PrayerRequest,
  PrayerRoom,
  Question,
  ReviewStatus,
  Reflection,
  Reminder,
  Resource,
  Role,
  Sermon,
  SmallGroup,
  User,
  Verse,
  VideoProject,
} from '../types/models'

const STORAGE_KEY = 'ghs.db.v1'

function load(): Db {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw) as Db
  } catch {
    // fall through to seed
  }
  return structuredClone(seed)
}

let db: Db = load()

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db))
}

function genId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`
}

function byChurch<T extends { churchId: string }>(items: T[], churchId: string): T[] {
  return items.filter((item) => item.churchId === churchId)
}

/** Members only ever see approved content; staff (reviewer/pastor/admin) see the full queue. */
function visible<T extends { status: ReviewStatus }>(items: T[], role: Role): T[] {
  if (role === 'member') return items.filter((item) => item.status === 'approved')
  return items
}

// ---- Churches -------------------------------------------------------------

function getChurches(): Church[] {
  return db.churches.slice()
}

function getChurch(id: string): Church | undefined {
  return db.churches.find((c) => c.id === id)
}

function getChurchBySlug(slug: string): Church | undefined {
  return db.churches.find((c) => c.slug === slug)
}

// ---- Users ------------------------------------------------------------

function getUsers(churchId: string): User[] {
  return byChurch(db.users, churchId)
}

function getUser(id: string): User | undefined {
  return db.users.find((u) => u.id === id)
}

/** Finds the seeded demo user for a given church/role, used by the DEMO switcher. */
function findUser(churchId: string, role: Role): User | undefined {
  return db.users.find((u) => u.churchId === churchId && u.role === role)
}

// ---- Sermons (source material — not moderated) -----------------------

function getSermons(churchId: string): Sermon[] {
  return byChurch(db.sermons, churchId)
}

function getSermon(id: string): Sermon | undefined {
  return db.sermons.find((s) => s.id === id)
}

// ---- Devotionals --------------------------------------------------------

function getDevotionals(churchId: string, role: Role): Devotional[] {
  return visible(byChurch(db.devotionals, churchId), role)
}

function getDevotional(id: string, role: Role): Devotional | undefined {
  const item = db.devotionals.find((d) => d.id === id)
  if (!item) return undefined
  if (role === 'member' && item.status !== 'approved') return undefined
  return item
}

// ---- Questions ------------------------------------------------------------

function getQuestions(churchId: string, role: Role): Question[] {
  return visible(byChurch(db.questions, churchId), role)
}

// ---- Reflections (The Assembly — not status-gated) -------------------

function getReflections(churchId: string): Reflection[] {
  return byChurch(db.reflections, churchId)
}

// ---- Feed -------------------------------------------------------------

function getFeedItems(churchId: string, role: Role): FeedItem[] {
  return visible(byChurch(db.feedItems, churchId), role)
}

// ---- Prayer -------------------------------------------------------------

function getPrayerRooms(churchId: string): PrayerRoom[] {
  return byChurch(db.prayerRooms, churchId)
}

function getPrayerRequests(churchId: string, role: Role): PrayerRequest[] {
  return visible(byChurch(db.prayerRequests, churchId), role)
}

// ---- Small groups -------------------------------------------------------

function getSmallGroups(churchId: string): SmallGroup[] {
  return byChurch(db.smallGroups, churchId)
}

// ---- Giving -------------------------------------------------------------

function getGivingFunds(churchId: string): GivingFund[] {
  return byChurch(db.givingFunds, churchId)
}

// ---- Reminders (pastoral care — staff only) ------------------------------

function getReminders(churchId: string, role: Role): Reminder[] {
  if (role === 'member') return []
  const items = byChurch(db.reminders, churchId)
  if (role === 'reviewer') return items.filter((r) => !r.private)
  return items
}

// ---- Video --------------------------------------------------------------

function getVideoProjects(churchId: string, role: Role): VideoProject[] {
  return visible(byChurch(db.videoProjects, churchId), role)
}

// ---- Artifacts (global library, not tenant-scoped) -----------------------

function getArtifacts(): Artifact[] {
  return db.artifacts.slice()
}

// ---- Resources (Library: sermon/devotional-audio companions + downloads) --

function getResources(churchId: string, role: Role): Resource[] {
  return visible(byChurch(db.resources, churchId), role)
}

// ---- Bible ----------------------------------------------------------------
// Book metadata (titles, chapter counts) stays eager and in-memory above via
// `db.books` — it's tiny and the reader needs it before any book is opened.
// Verse/lexicon text is bulky, so it's dynamically imported per book the
// first time that book is touched (see src/data/bible/registry.ts). That
// makes these four reads async now, matching how a real network-backed API
// would behave once this seam is swapped for one.

function findBookByRef(ref: string): Book | undefined {
  return db.books.find((b) => ref.startsWith(`${b.name.en} `))
}

function listBooks(): Book[] {
  return db.books.slice()
}

async function getVersesByRef(prefix: string): Promise<Verse[]> {
  const book = findBookByRef(prefix) ?? db.books.find((b) => prefix.startsWith(b.name.en))
  if (!book) return []
  const { verses } = await loadBookData(book.id)
  return verses.filter((v) => v.ref.startsWith(prefix))
}

/** All bundled verses for a book/chapter. Empty if that chapter isn't loaded in this preview. */
async function getChapter(bookId: string, chapter: number): Promise<Verse[]> {
  const book = db.books.find((b) => b.id === bookId)
  if (!book) return []
  const { verses } = await loadBookData(bookId)
  return verses.filter((v) => v.ref.startsWith(`${book.name.en} ${chapter}:`))
}

/**
 * Accepts either a reference-shaped query (e.g. "Genesis 1:3", or a bare
 * "1:3"/"3" a screen has already prefixed with the active book's name) and
 * matches it against verse refs first, falling back to a full-text search
 * across both bundled languages. Only searches books already registered for
 * on-demand loading (see src/data/bible/registry.ts) — matching the "only
 * Genesis 1 is bundled in this preview" scope of the demo.
 */
async function searchScripture(query: string): Promise<Verse[]> {
  const q = query.trim()
  if (!q) return []
  const lower = q.toLowerCase()

  const candidateBook = findBookByRef(q)
  const bookIds = candidateBook ? [candidateBook.id] : db.books.map((b) => b.id)
  const chunks = await Promise.all(bookIds.map((id) => loadBookData(id)))
  const verses = chunks.flatMap((c) => c.verses)

  const refMatches = verses.filter((v) => v.ref.toLowerCase().startsWith(lower))
  if (refMatches.length > 0) return refMatches
  return verses.filter((v) => v.text.en.toLowerCase().includes(lower) || v.text.ml.includes(q))
}

async function getLexiconForRef(ref: string): Promise<LexiconEntry[]> {
  const book = findBookByRef(ref)
  if (!book) return []
  const { lexicon } = await loadBookData(book.id)
  return lexicon.filter((entry) => entry.verseRef === ref)
}

// ---- Journal (private per-user reflections) --------------------------------

function getJournalEntry(userId: string, refId: string): JournalEntry | undefined {
  return db.journalEntries.find((entry) => entry.userId === userId && entry.refId === refId)
}

function saveJournalEntry(userId: string, refId: string, body: string): JournalEntry {
  const existing = db.journalEntries.find((entry) => entry.userId === userId && entry.refId === refId)
  if (existing) {
    existing.body = body
    existing.updatedAt = new Date().toISOString()
    persist()
    return existing
  }
  const entry: JournalEntry = {
    id: genId('journal'),
    userId,
    refId,
    body,
    updatedAt: new Date().toISOString(),
  }
  db.journalEntries.push(entry)
  persist()
  return entry
}

// ---- Comments -------------------------------------------------------------

function canComment(user: User): boolean {
  return user.canComment
}

function listComments(targetId: string, role: Role): Comment[] {
  return visible(
    db.comments.filter((c) => c.targetId === targetId),
    role,
  )
}

function addComment(user: User, targetId: string, body: string): Comment | undefined {
  if (!user.canComment) return undefined
  const comment: Comment = {
    id: genId('comment'),
    targetId,
    authorId: user.id,
    body,
    createdAt: new Date().toISOString(),
    status: 'pending_review',
  }
  db.comments.push(comment)
  persist()
  return comment
}

// ---- Review queue mutations -----------------------------------------------

type ReviewableKind =
  | 'devotional'
  | 'question'
  | 'feedItem'
  | 'prayerRequest'
  | 'videoProject'
  | 'comment'

const reviewableCollection: Record<ReviewableKind, keyof Db> = {
  devotional: 'devotionals',
  question: 'questions',
  feedItem: 'feedItems',
  prayerRequest: 'prayerRequests',
  videoProject: 'videoProjects',
  comment: 'comments',
}

function setReviewStatus(kind: ReviewableKind, id: string, status: ReviewStatus): void {
  const collection = db[reviewableCollection[kind]] as Array<{ id: string; status: ReviewStatus }>
  const item = collection.find((i) => i.id === id)
  if (!item) return
  item.status = status
  persist()
}

type DraftableKind = 'devotional' | 'question' | 'feedItem'

type DraftInput<K extends DraftableKind> = K extends 'devotional'
  ? Omit<Devotional, 'id' | 'status'>
  : K extends 'question'
    ? Omit<Question, 'id' | 'status'>
    : Omit<FeedItem, 'id' | 'status'>

type DraftResult<K extends DraftableKind> = K extends 'devotional'
  ? Devotional
  : K extends 'question'
    ? Question
    : FeedItem

function createDraft<K extends DraftableKind>(kind: K, partial: DraftInput<K>): DraftResult<K> {
  const item = { ...partial, id: genId(kind), status: 'pending_review' as const }
  db[reviewableCollection[kind]].push(item as never)
  persist()
  return item as DraftResult<K>
}

// ---- Prayer mutations -------------------------------------------------

function prayForRequest(id: string): void {
  const req = db.prayerRequests.find((r) => r.id === id)
  if (!req) return
  req.prayerCount += 1
  persist()
}

function submitPrayerRequest(
  input: Omit<PrayerRequest, 'id' | 'status' | 'prayerCount' | 'createdAt'>,
): PrayerRequest {
  const request: PrayerRequest = {
    ...input,
    id: genId('preq'),
    status: 'pending_review',
    prayerCount: 0,
    createdAt: new Date().toISOString(),
  }
  db.prayerRequests.push(request)
  persist()
  return request
}

// ---- Reminder mutations -----------------------------------------------

function markReminderDone(id: string): void {
  const reminder = db.reminders.find((r) => r.id === id)
  if (!reminder) return
  reminder.done = true
  persist()
}

export const api = {
  getChurches,
  getChurch,
  getChurchBySlug,
  getUsers,
  getUser,
  findUser,
  getSermons,
  getSermon,
  getDevotionals,
  getDevotional,
  getQuestions,
  getReflections,
  getFeedItems,
  getPrayerRooms,
  getPrayerRequests,
  getSmallGroups,
  getGivingFunds,
  getReminders,
  getVideoProjects,
  getArtifacts,
  getResources,
  listBooks,
  getVersesByRef,
  getChapter,
  searchScripture,
  getLexiconForRef,
  getJournalEntry,
  saveJournalEntry,
  canComment,
  listComments,
  addComment,
  setReviewStatus,
  createDraft,
  prayForRequest,
  submitPrayerRequest,
  markReminderDone,
}

export type { ReviewableKind, DraftableKind }
