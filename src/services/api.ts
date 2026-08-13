import { dataSource } from '@/config/flags'
import type { ReadingRhythm } from '@/lib/rhythm'
import type {
  Artifact,
  Book,
  Church,
  Comment,
  Locale,
  Question,
  Reflection,
  ReviewEvent,
  Testament,
  TranslationInfo,
  User,
  Verse,
  VerseHit,
} from '@/types/models'
import * as demo from './demoApi'
import * as supabase from './supabaseApi'

/**
 * THE SEAM.
 *
 * "Every screen reads/writes only through api.*; nothing touches storage
 * directly. That seam is the whole migration plan."
 *   — GHS_ProductArchitecture.md §1
 *
 * Screens import this module and nothing else from src/services. The lint rule
 * in eslint.config.js turns that into an error rather than a convention, so the
 * demo → production cutover stays a body swap instead of a rewrite.
 *
 * One deliberate difference from the signatures sketched in the architecture
 * doc: every method returns a Promise. The doc writes them synchronously
 * (`api.listBooks(testament): Book[]`), but production is HTTP, and a seam that
 * changes from sync to async later would force every caller to change — which
 * is precisely what the seam exists to prevent. So they are async from day one,
 * including the ones the demo could answer instantly.
 */
export interface Api {
  // -- tenant & identity ---------------------------------------------------
  getChurch(churchId: string): Promise<Church>
  listDemoUsers(churchId: string): Promise<User[]>
  getDefaultUserId(): Promise<string>

  // -- scripture (§13.1) ---------------------------------------------------
  listBooks(testament?: Testament): Promise<Book[]>
  getChapter(bookId: string, chapter: number): Promise<Verse[]>
  searchScripture(query: string, limit?: number): Promise<VerseHit[]>
  getTranslations(): Promise<Record<Locale, TranslationInfo>>

  // -- the Today page (§14) ------------------------------------------------
  getTodayQuestion(churchId: string, date?: string): Promise<Question | null>
  getReflections(churchId: string, questionId?: string): Promise<Reflection[]>

  // -- gated comments (§14.2) ---------------------------------------------
  canComment(userId: string, churchId: string): Promise<boolean>
  listComments(targetId: string, churchId?: string): Promise<Comment[]>
  addComment(targetId: string, body: string, userId: string, churchId: string): Promise<Comment>

  // -- artifact of the day (§14.3) ----------------------------------------
  getArtifactOfDay(seed?: string): Promise<Artifact | null>
  listArtifacts(): Promise<Artifact[]>

  // -- reading rhythm ------------------------------------------------------
  recordReadingDay(churchId: string, date?: string): Promise<ReadingRhythm>
  getReadingRhythm(churchId: string, date?: string): Promise<ReadingRhythm>

  // -- review pipeline (§5) ------------------------------------------------
  listReviewEvents(entityId?: string): Promise<ReviewEvent[]>

  // -- demo affordances ----------------------------------------------------
  resetDemoState(churchId?: string): Promise<void>
}

/**
 * Both implementations are structurally checked against `Api` here. If either
 * one drifts from the contract, this file fails to compile — which is the whole
 * point of having a contract.
 */
const demoImpl: Api = demo
const supabaseImpl: Api = supabase

export const api: Api = dataSource === 'supabase' ? supabaseImpl : demoImpl

/** Which implementation is live. Surfaced in the UI so the demo stays honest. */
export const activeDataSource = dataSource

export default api
