/**
 * Reading-rhythm arithmetic.
 *
 * Kept pure and separate from the seam so the streak is genuinely *computed*
 * from recorded reading days rather than being a decorative number. Date maths
 * around week boundaries and month ends is exactly the kind of thing that looks
 * right in a mockup and is wrong in February, so it is unit-tested.
 *
 * All dates are ISO `YYYY-MM-DD` strings in local time. Local, not UTC:
 * "did I read today" is a question about the reader's day, and a UTC boundary
 * would roll the streak over at the wrong hour in India.
 */

export interface RhythmDay {
  date: string
  /** Single-letter weekday label, e.g. "M". */
  label: string
  read: boolean
  isToday: boolean
  isFuture: boolean
}

export interface ReadingRhythm {
  streakDays: number
  /** Seven days, Monday first, for the week containing `today`. */
  week: RhythmDay[]
}

const DAY_MS = 86_400_000

/** Local-time ISO date, unlike toISOString() which converts to UTC first. */
export function toIsoDate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function parseIsoDate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y ?? 1970, (m ?? 1) - 1, d ?? 1)
}

export function addDays(iso: string, days: number): string {
  const date = parseIsoDate(iso)
  // Going through setDate rather than millisecond arithmetic keeps this correct
  // across daylight-saving transitions.
  date.setDate(date.getDate() + days)
  return toIsoDate(date)
}

/** Monday of the week containing `iso`. */
export function startOfWeek(iso: string): string {
  const date = parseIsoDate(iso)
  const dow = date.getDay() // 0 = Sunday
  const offset = dow === 0 ? -6 : 1 - dow
  return addDays(iso, offset)
}

/**
 * Consecutive days read, counting back from today.
 *
 * A reader who has not opened the app yet today but read yesterday still has
 * their streak: it is broken by a missed *completed* day, not by the current
 * day being unfinished. Counting otherwise would show every streak as zero
 * every morning.
 */
export function computeStreak(readDates: Iterable<string>, today: string): number {
  const read = readDates instanceof Set ? readDates : new Set(readDates)
  if (read.size === 0) return 0

  const startedToday = read.has(today)
  let cursor = startedToday ? today : addDays(today, -1)
  let streak = 0

  while (read.has(cursor)) {
    streak++
    cursor = addDays(cursor, -1)
  }
  return streak
}

const LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

export function buildRhythm(readDates: Iterable<string>, today: string): ReadingRhythm {
  const read = readDates instanceof Set ? readDates : new Set(readDates)
  const monday = startOfWeek(today)
  const todayMs = parseIsoDate(today).getTime()

  const week: RhythmDay[] = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(monday, i)
    return {
      date,
      label: LABELS[i] ?? '',
      read: read.has(date),
      isToday: date === today,
      isFuture: parseIsoDate(date).getTime() > todayMs,
    }
  })

  return { streakDays: computeStreak(read, today), week }
}

/**
 * A plausible starting history for the demo, so the card is populated the first
 * time it is opened instead of reading "1 day". Sample data, exactly like the
 * reflections — and from here on the streak advances for real.
 */
export function seedHistory(today: string, days = 14): string[] {
  return Array.from({ length: days }, (_, i) => addDays(today, -i))
}

/** Millisecond span between two ISO dates. Exposed for tests. */
export function daysBetween(a: string, b: string): number {
  return Math.round((parseIsoDate(b).getTime() - parseIsoDate(a).getTime()) / DAY_MS)
}
