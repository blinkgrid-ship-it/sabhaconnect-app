// The ONLY way screens touch data. Reads seed data + localStorage today;
// swap this module's internals for real network calls later and no screen
// has to change, since every screen only ever imports `api` and the types
// in src/types/models.ts — never seed.ts or localStorage directly.

import { seed, type Db } from '../data/seed'
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

// ---- Bible --------------------------------------------------------------

function getBooks(): Book[] {
  return db.books.slice()
}

function getVersesByRef(prefix: string): Verse[] {
  return db.verses.filter((v) => v.ref.startsWith(prefix))
}

function getLexiconForRef(ref: string): LexiconEntry[] {
  return db.lexicon.filter((entry) => entry.verseRef === ref)
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
  getBooks,
  getVersesByRef,
  getLexiconForRef,
  getJournalEntry,
  saveJournalEntry,
  listComments,
  addComment,
  setReviewStatus,
  createDraft,
  prayForRequest,
  submitPrayerRequest,
  markReminderDone,
}

export type { ReviewableKind, DraftableKind }
