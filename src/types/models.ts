/**
 * The data contract. Source of truth for both sides of the seam
 * (GHS_ProductArchitecture.md §3): the demo data layer and, later, the real
 * backend both satisfy exactly these types, so no screen is rewritten.
 *
 * Several guardrails are enforced here at the type level rather than left to
 * discipline — see ArtifactKind and WordRoot below.
 */

// ---------------------------------------------------------------------------
// Language
// ---------------------------------------------------------------------------

/** The two locales the product ships content in today. */
export type Locale = 'en' | 'ml'

/** What the reader has chosen to see. `both` stacks EN over ML, aligned. */
export type LangMode = 'both' | 'en' | 'ml'

/** Any piece of content that exists in both languages. */
export interface Bilingual {
  en: string
  ml: string
}

// ---------------------------------------------------------------------------
// Review pipeline — GHS_ProductArchitecture.md §5
// ---------------------------------------------------------------------------

/**
 * The review state machine. Nothing reaches a member without passing through
 * `approved`; this is the technical form of the "never unreviewed" guardrail.
 */
export type ReviewStatus = 'draft' | 'pending_review' | 'approved' | 'held' | 'removed'

/** The only status a member-facing query may ever return. */
export const MEMBER_VISIBLE_STATUS: ReviewStatus = 'approved'

/** Allowed transitions. A move not listed here is a bug, not a policy choice. */
export const REVIEW_TRANSITIONS: Readonly<Record<ReviewStatus, readonly ReviewStatus[]>> = {
  draft: ['pending_review'],
  pending_review: ['approved', 'held', 'draft'],
  approved: ['held', 'removed'],
  held: ['pending_review', 'removed'],
  removed: [],
} as const

/** The audit trail that proves "never unreviewed" after the fact (§5). */
export interface ReviewEvent {
  id: string
  entityType: 'question' | 'reflection' | 'comment' | 'feedItem'
  entityId: string
  from: ReviewStatus
  to: ReviewStatus
  actorId: string
  at: string
  note?: string
}

// ---------------------------------------------------------------------------
// Tenancy — GHS_ProductArchitecture.md §4
// ---------------------------------------------------------------------------

export type Role = 'member' | 'author' | 'reviewer' | 'admin' | 'pastor'

/**
 * Brand tokens as data, not build config, so one build serves many branded
 * tenants (§4). Values are `r g b` channel triplets to keep Tailwind's
 * alpha modifiers working.
 */
export interface ThemeTokens {
  /** Deep teal — chrome and authority. */
  sanctuary: string
  vespers: string
  cedar: string
  /** Reserved for the active state, overlines and verse numbers. */
  brass: string
  'brass-ink': string
  lamp: string
  /** Warm reading surfaces: cream ground, parchment page, vellum cards. */
  cream: string
  parchment: string
  vellum: string
  rule: string
  ink: string
  'ink-muted': string
  'ink-faint': string
}

/** Tenant = Church. Root ministry plus nested partner churches. */
export interface Church {
  id: string
  name: Bilingual
  subtitle: Bilingual
  parentChurchId: string | null
  theme: ThemeTokens
  /**
   * The comment allow-list (§14.2). In production this becomes a `canComment`
   * flag on membership; the seam signature does not change either way.
   */
  commenterIds: string[]
  /** Per-tenant component registry — also the entitlement mechanism (§4). */
  enabledComponents: string[]
}

export interface User {
  id: string
  churchId: string
  name: string
  role: Role
  initials: string
}

// ---------------------------------------------------------------------------
// Scripture — GHS_ProductArchitecture.md §13
// ---------------------------------------------------------------------------

export type Testament = 'OT' | 'NT'

export interface Book {
  id: string
  name: Bilingual
  testament: Testament
  chapterCount: number
  order: number
  /** Whether this book's text ships in the offline demo bundle (§13.3). */
  bundled: boolean
}

/**
 * A verse. Both languages hang off one shared `book.chapter.verse` key, which
 * is what makes line-by-line alignment trivial and robust (§13.1) — there is
 * no fuzzy matching anywhere in the reader.
 */
export interface Verse {
  ref: string
  num: number
  text: Bilingual
}

export interface VerseHit extends Verse {
  bookId: string
  bookName: Bilingual
  chapter: number
}

/**
 * Translation attribution. This is what the translation badge renders, and it
 * is derived from the mirrored source metadata rather than hard-coded (§13.2)
 * — the "never uncited" guardrail for scripture.
 */
export interface TranslationInfo {
  id: string
  lang: Locale
  name: string
  abbrev: string
  copyright: string
  licence: string
  sourceUrl: string
}

// ---------------------------------------------------------------------------
// The Today page — GHS_ProductArchitecture.md §14
// ---------------------------------------------------------------------------

/**
 * The question of the day. Human-authored and human-approved, never generated
 * — hence `authorId` and `approvedBy` are required, not optional. A generated
 * question could not be represented by this type.
 */
export interface Question {
  id: string
  churchId: string
  /** ISO date, `YYYY-MM-DD`. */
  date: string
  prompt: Bilingual
  scriptureRef: string
  status: ReviewStatus
  authorId: string
  authorName: string
  approvedBy: string
  approvedAt: string
}

export interface Reflection {
  id: string
  churchId: string
  questionId: string
  authorId: string
  authorName: string
  authorRole: Role
  /** The pastor's reflection is the anchor of the page (§3.1). */
  isPastor: boolean
  body: Bilingual
  createdAt: string
  status: ReviewStatus
}

export interface Comment {
  id: string
  targetId: string
  churchId: string
  authorId: string
  authorName: string
  authorInitials: string
  body: string
  createdAt: string
  status: ReviewStatus
}

/**
 * What kind of thing an artifact is.
 *
 * This union is a guardrail expressed as a type: places, objects, inscriptions
 * and structures only. There is deliberately no `person` member, so "never
 * depict Christ, apostles, or any living person" (§14.3) cannot be violated by
 * adding a record — it would not compile.
 */
export type ArtifactKind = 'place' | 'object' | 'inscription' | 'structure'

/** Human sign-off on the cached image. "Never unreviewed" applies to media too. */
export interface ImageReview {
  status: 'approved' | 'pending'
  reviewedBy: string
  reviewedAt: string
  /** What the reviewer confirmed — recorded, not assumed. */
  note: string
}

export interface Artifact {
  id: string
  name: string
  kind: ArtifactKind
  blurb: string
  /** Locally cached; null when no image has passed review. */
  imageUrl: string | null
  imageReview: ImageReview
  /** Required, always rendered. CI-checked (§8). */
  sourceUrl: string
  sourceLabel: string
  bibleRefs: string[]
  location: string
  period: string
}

// ---------------------------------------------------------------------------
// The Word (adjacent surface; the type-level guardrail from §8 lives here)
// ---------------------------------------------------------------------------

export interface WordRoot {
  id: string
  lemma: string
  transliteration: string
  gloss: Bilingual
  /** Required by §8 at the type level — an uncited root cannot be constructed. */
  lexiconCitation: string
}
