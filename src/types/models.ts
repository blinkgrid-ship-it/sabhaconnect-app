// Shared data shapes for the GHS demo. This is the contract screens are
// written against; a real backend can replace src/services/api.ts without
// any of these shapes (or any screen) changing.

export interface Localized {
  en: string
  ml: string
}

export interface Church {
  id: string
  name: Localized
  slug: string
  theme?: {
    primary?: string
    accent?: string
  }
  parentChurchId?: string
  /** Feature/part keys enabled for this tenant. See src/app/parts.ts. */
  components: string[]
}

export type Role = 'member' | 'reviewer' | 'pastor' | 'admin'

export interface User {
  id: string
  name: string
  churchId: string
  role: Role
  canComment: boolean
}

export type ReviewStatus =
  | 'draft'
  | 'pending_review'
  | 'approved'
  | 'held'
  | 'removed'

export interface Sermon {
  id: string
  churchId: string
  title: Localized
  speaker: string
  date: string
  transcript: Localized
}

export interface Devotional {
  id: string
  churchId: string
  title: Localized
  body: Localized
  day: string
  sourceSermonId?: string
  narratorName?: string
  status: ReviewStatus
}

export interface Question {
  id: string
  churchId: string
  prompt: Localized
  day: string
  status: ReviewStatus
}

export interface Reflection {
  id: string
  churchId: string
  author: string
  body: Localized
  isPastor: boolean
}

export interface Comment {
  id: string
  targetId: string
  authorId: string
  body: string
  createdAt: string
  status: ReviewStatus
}

export interface FeedItem {
  id: string
  churchId: string
  title: Localized
  body: Localized
  source: string
  category: string
  status: ReviewStatus
}

export interface PrayerRoom {
  id: string
  churchId: string
  name: Localized
  description?: Localized
}

export interface PrayerRequest {
  id: string
  churchId: string
  roomId: string
  requesterName: string
  isAnonymous: boolean
  body: Localized
  prayerCount: number
  status: ReviewStatus
  createdAt: string
}

export interface SmallGroup {
  id: string
  churchId: string
  name: Localized
  leaderName: string
  meetingDay: string
  meetingTime: string
  location: string
  memberCount: number
}

export interface GivingFund {
  id: string
  churchId: string
  name: Localized
  description?: Localized
  goalAmount?: number
  raisedAmount: number
}

export interface Reminder {
  id: string
  churchId: string
  kind: string
  person: string
  summary: string
  firedOn: string
  done: boolean
  private: boolean
}

export interface VideoProject {
  id: string
  churchId: string
  title: string
  posterUrl: string
  status: ReviewStatus
}

export interface Artifact {
  id: string
  name: string
  blurb: string
  imageUrl: string
  sourceUrl: string
  bibleRefs: string[]
}

export interface Verse {
  ref: string
  num: number
  text: Localized
}

export interface Book {
  id: string
  name: Localized
  testament: 'old' | 'new'
  chapterCount: number
}
