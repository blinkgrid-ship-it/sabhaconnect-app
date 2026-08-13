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
import { addDays, buildRhythm, toIsoDate, type ReadingRhythm } from '@/lib/rhythm'
import { getClient } from './supabaseClient'
import { BOOKS, TRANSLATIONS, loadBook } from './seed/bible'

/**
 * The production implementation of the seam.
 *
 * Same signatures as demoApi, so switching VITE_DATA_SOURCE rewrites no screen
 * (GHS_ProductArchitecture.md §1). The SQL behind it lives in
 * supabase/migrations/.
 *
 * Two deliberate choices:
 *
 * - Every query still filters to `approved` even though row-level security
 *   already does. Defense in depth (§5) — the client is not the place trust
 *   lives, but it is not an excuse to drop the filter either.
 * - `churchId` is never sent as a filter the client controls for isolation
 *   purposes. RLS keys off the caller's JWT (§4). The explicit `.eq('church_id')`
 *   below narrows *within* what RLS already allows; it is not the security
 *   boundary.
 *
 * Scripture is intentionally NOT read from Supabase. Verse data is immutable,
 * openly licensed and mirrored into the bundle (§13.4 option A), so serving it
 * from the client costs nothing and keeps the reader working offline.
 */

function rethrow(context: string, error: { message: string } | null): void {
  if (error) throw new Error(`${context}: ${error.message}`)
}

// ---------------------------------------------------------------------------
// Tenant & identity
// ---------------------------------------------------------------------------

interface ChurchRow {
  id: string
  name_en: string
  name_ml: string
  subtitle_en: string
  subtitle_ml: string
  parent_church_id: string | null
  theme: Church['theme']
  enabled_components: string[]
}

export async function getChurch(churchId: string): Promise<Church> {
  const db = getClient()

  const { data, error } = await db
    .from('churches')
    .select('id, name_en, name_ml, subtitle_en, subtitle_ml, parent_church_id, theme, enabled_components')
    .eq('id', churchId)
    .single<ChurchRow>()
  rethrow('load church', error)
  if (!data) throw new Error(`Unknown church "${churchId}".`)

  // The allow-list is a membership flag in production (§14.2), not a column on
  // the church — the seam hides that difference from every screen.
  const { data: commenters, error: cErr } = await db
    .from('memberships')
    .select('user_id')
    .eq('church_id', churchId)
    .eq('can_comment', true)
  rethrow('load comment allow-list', cErr)

  return {
    id: data.id,
    name: { en: data.name_en, ml: data.name_ml },
    subtitle: { en: data.subtitle_en, ml: data.subtitle_ml },
    parentChurchId: data.parent_church_id,
    theme: data.theme,
    commenterIds: (commenters ?? []).map((r: { user_id: string }) => r.user_id),
    enabledComponents: data.enabled_components ?? [],
  }
}

export async function listDemoUsers(churchId: string): Promise<User[]> {
  const db = getClient()
  const { data, error } = await db
    .from('memberships')
    .select('user_id, role, display_name, initials')
    .eq('church_id', churchId)
  rethrow('list users', error)

  return (data ?? []).map(
    (r: { user_id: string; role: User['role']; display_name: string; initials: string }) => ({
      id: r.user_id,
      churchId,
      name: r.display_name,
      role: r.role,
      initials: r.initials,
    }),
  )
}

export async function getDefaultUserId(): Promise<string> {
  const { data } = await getClient().auth.getUser()
  return data.user?.id ?? ''
}

// ---------------------------------------------------------------------------
// Scripture — bundled, not queried. See the note at the top of this file.
// ---------------------------------------------------------------------------

export async function listBooks(testament?: 'OT' | 'NT'): Promise<Book[]> {
  return testament ? BOOKS.filter((b) => b.testament === testament) : BOOKS
}

export async function getTranslations(): Promise<Record<Locale, TranslationInfo>> {
  return TRANSLATIONS
}

export async function getChapter(bookId: string, chapter: number): Promise<Verse[]> {
  const data = await loadBook(bookId)
  return data?.chapters[String(chapter)] ?? []
}

export async function searchScripture(query: string, limit = 40): Promise<VerseHit[]> {
  const { searchScripture: demoSearch } = await import('./demoApi')
  return demoSearch(query, limit)
}

// ---------------------------------------------------------------------------
// The Today page
// ---------------------------------------------------------------------------

interface QuestionRow {
  id: string
  church_id: string
  date: string
  prompt_en: string
  prompt_ml: string
  scripture_ref: string
  status: Question['status']
  author_id: string
  author_name: string
  approved_by: string
  approved_at: string
}

export async function getTodayQuestion(
  churchId: string,
  date = new Date().toISOString().slice(0, 10),
): Promise<Question | null> {
  const { data, error } = await getClient()
    .from('questions')
    .select('*')
    .eq('church_id', churchId)
    .eq('status', MEMBER_VISIBLE_STATUS)
    .lte('date', date)
    .order('date', { ascending: false })
    .limit(1)
  rethrow('load question of the day', error)

  const row = (data ?? [])[0] as QuestionRow | undefined
  if (!row) return null

  return {
    id: row.id,
    churchId: row.church_id,
    date: row.date,
    prompt: { en: row.prompt_en, ml: row.prompt_ml },
    scriptureRef: row.scripture_ref,
    status: row.status,
    authorId: row.author_id,
    authorName: row.author_name,
    approvedBy: row.approved_by,
    approvedAt: row.approved_at,
  }
}

interface ReflectionRow {
  id: string
  church_id: string
  question_id: string
  author_id: string
  author_name: string
  author_role: Reflection['authorRole']
  is_pastor: boolean
  body_en: string
  body_ml: string
  created_at: string
  status: Reflection['status']
}

export async function getReflections(churchId: string, questionId?: string): Promise<Reflection[]> {
  let q = getClient()
    .from('reflections')
    .select('*')
    .eq('church_id', churchId)
    .eq('status', MEMBER_VISIBLE_STATUS)
  if (questionId) q = q.eq('question_id', questionId)

  const { data, error } = await q
    .order('is_pastor', { ascending: false })
    .order('created_at', { ascending: true })
  rethrow('load reflections', error)

  return (data ?? []).map((r: ReflectionRow) => ({
    id: r.id,
    churchId: r.church_id,
    questionId: r.question_id,
    authorId: r.author_id,
    authorName: r.author_name,
    authorRole: r.author_role,
    isPastor: r.is_pastor,
    body: { en: r.body_en, ml: r.body_ml },
    createdAt: r.created_at,
    status: r.status,
  }))
}

export async function canComment(userId: string, churchId: string): Promise<boolean> {
  const { data, error } = await getClient()
    .from('memberships')
    .select('can_comment')
    .eq('church_id', churchId)
    .eq('user_id', userId)
    .maybeSingle<{ can_comment: boolean }>()
  rethrow('check comment rights', error)
  return data?.can_comment === true
}

interface CommentRow {
  id: string
  target_id: string
  church_id: string
  author_id: string
  author_name: string
  author_initials: string
  body: string
  created_at: string
  status: Comment['status']
}

function toComment(r: CommentRow): Comment {
  return {
    id: r.id,
    targetId: r.target_id,
    churchId: r.church_id,
    authorId: r.author_id,
    authorName: r.author_name,
    authorInitials: r.author_initials,
    body: r.body,
    createdAt: r.created_at,
    status: r.status,
  }
}

export async function listComments(targetId: string): Promise<Comment[]> {
  const { data, error } = await getClient()
    .from('comments')
    .select('*')
    .eq('target_id', targetId)
    .eq('status', MEMBER_VISIBLE_STATUS)
    .order('created_at', { ascending: true })
  rethrow('load comments', error)
  return (data ?? []).map(toComment)
}

export async function addComment(
  targetId: string,
  body: string,
  userId: string,
  churchId: string,
): Promise<Comment> {
  const trimmed = body.trim()
  if (!trimmed) throw new Error('A comment cannot be empty.')

  // The real gate is the RLS policy on `comments` (see the migration) — this
  // check only produces a better message than a policy rejection would.
  if (!(await canComment(userId, churchId))) {
    throw new Error('Comments are limited to selected members.')
  }

  const { data, error } = await getClient()
    .from('comments')
    .insert({ target_id: targetId, church_id: churchId, body: trimmed })
    .select('*')
    .single<CommentRow>()
  rethrow('post comment', error)
  if (!data) throw new Error('The comment was not saved.')
  return toComment(data)
}

// ---------------------------------------------------------------------------
// Artifacts
// ---------------------------------------------------------------------------

interface ArtifactRow {
  id: string
  name: string
  kind: Artifact['kind']
  blurb: string
  image_url: string | null
  image_review: Artifact['imageReview']
  source_url: string
  source_label: string
  bible_refs: string[]
  location: string
  period: string
}

function toArtifact(r: ArtifactRow): Artifact {
  return {
    id: r.id,
    name: r.name,
    kind: r.kind,
    blurb: r.blurb,
    imageUrl: r.image_url,
    imageReview: r.image_review,
    sourceUrl: r.source_url,
    sourceLabel: r.source_label,
    bibleRefs: r.bible_refs ?? [],
    location: r.location,
    period: r.period,
  }
}

export async function listArtifacts(): Promise<Artifact[]> {
  const { data, error } = await getClient().from('artifacts').select('*').order('id')
  rethrow('list artifacts', error)
  return (data ?? []).map(toArtifact)
}

export async function getArtifactOfDay(
  seed = new Date().toISOString().slice(0, 10),
): Promise<Artifact | null> {
  const all = await listArtifacts()
  if (all.length === 0) return null
  const { seededIndex } = await import('./demoApi')
  return all[seededIndex(seed, all.length)] ?? null
}

// ---------------------------------------------------------------------------
// Review pipeline
// ---------------------------------------------------------------------------

interface ReviewEventRow {
  id: string
  entity_type: ReviewEvent['entityType']
  entity_id: string
  from_status: ReviewEvent['from']
  to_status: ReviewEvent['to']
  actor_id: string
  at: string
  note: string | null
}

export async function listReviewEvents(entityId?: string): Promise<ReviewEvent[]> {
  let q = getClient().from('review_events').select('*')
  if (entityId) q = q.eq('entity_id', entityId)
  const { data, error } = await q.order('at', { ascending: false })
  rethrow('load review events', error)

  return (data ?? []).map((r: ReviewEventRow) => ({
    id: r.id,
    entityType: r.entity_type,
    entityId: r.entity_id,
    from: r.from_status,
    to: r.to_status,
    actorId: r.actor_id,
    at: r.at,
    note: r.note ?? undefined,
  }))
}

// ---------------------------------------------------------------------------
// Reading rhythm
// ---------------------------------------------------------------------------

export async function recordReadingDay(
  churchId: string,
  date = toIsoDate(new Date()),
): Promise<ReadingRhythm> {
  const db = getClient()

  // Idempotent: opening Today twice in a day is one reading day.
  const { error } = await db
    .from('reading_days')
    .upsert({ church_id: churchId, date }, { onConflict: 'user_id,church_id,date' })
  rethrow('record reading day', error)

  return getReadingRhythm(churchId, date)
}

export async function getReadingRhythm(
  churchId: string,
  date = toIsoDate(new Date()),
): Promise<ReadingRhythm> {
  // Only the trailing window can affect a streak or this week's squares, so
  // there is no reason to read a member's whole history.
  const since = addDays(date, -400)

  const { data, error } = await getClient()
    .from('reading_days')
    .select('date')
    .eq('church_id', churchId)
    .gte('date', since)
    .lte('date', date)
  rethrow('load reading rhythm', error)

  return buildRhythm((data ?? []).map((r: { date: string }) => r.date), date)
}

/** No-op against a real backend — demo-local state does not exist there. */
export async function resetDemoState(): Promise<void> {
  /* nothing to reset */
}
