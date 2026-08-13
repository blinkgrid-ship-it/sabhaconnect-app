import { describe, expect, it } from 'vitest'
import {
  addDays,
  buildRhythm,
  computeStreak,
  daysBetween,
  seedHistory,
  startOfWeek,
  toIsoDate,
} from './rhythm'

/**
 * Date arithmetic looks right in a mockup and is wrong in February, so the
 * streak logic is tested against the boundaries that actually break it: month
 * ends, year ends, leap days, and Sunday-versus-Monday week starts.
 */

describe('addDays', () => {
  it('moves forward within a month', () => {
    expect(addDays('2026-08-13', 3)).toBe('2026-08-16')
  })

  it('crosses a month boundary', () => {
    expect(addDays('2026-08-31', 1)).toBe('2026-09-01')
  })

  it('crosses a year boundary in both directions', () => {
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01')
    expect(addDays('2027-01-01', -1)).toBe('2026-12-31')
  })

  it('handles a leap day', () => {
    expect(addDays('2028-02-28', 1)).toBe('2028-02-29')
    expect(addDays('2028-02-29', 1)).toBe('2028-03-01')
  })

  it('skips 29 February in a non-leap year', () => {
    expect(addDays('2026-02-28', 1)).toBe('2026-03-01')
  })
})

describe('startOfWeek', () => {
  it('returns the Monday of a midweek date', () => {
    // 2026-08-13 is a Thursday.
    expect(startOfWeek('2026-08-13')).toBe('2026-08-10')
  })

  it('returns the same day when given a Monday', () => {
    expect(startOfWeek('2026-08-10')).toBe('2026-08-10')
  })

  it('treats Sunday as the end of the week, not the start', () => {
    // 2026-08-16 is a Sunday; its week began on the 10th.
    expect(startOfWeek('2026-08-16')).toBe('2026-08-10')
  })
})

describe('computeStreak', () => {
  it('is zero with no history', () => {
    expect(computeStreak([], '2026-08-13')).toBe(0)
  })

  it('counts consecutive days ending today', () => {
    const dates = ['2026-08-11', '2026-08-12', '2026-08-13']
    expect(computeStreak(dates, '2026-08-13')).toBe(3)
  })

  // A reader who has not opened the app yet today still has their streak: it
  // breaks on a missed completed day, not on today being unfinished.
  it('survives today not being read yet', () => {
    const dates = ['2026-08-11', '2026-08-12']
    expect(computeStreak(dates, '2026-08-13')).toBe(2)
  })

  it('stops at the first missed day', () => {
    const dates = ['2026-08-09', '2026-08-11', '2026-08-12', '2026-08-13']
    expect(computeStreak(dates, '2026-08-13')).toBe(3)
  })

  it('is zero when the last reading day is too long ago', () => {
    expect(computeStreak(['2026-08-01'], '2026-08-13')).toBe(0)
  })

  it('counts a single day', () => {
    expect(computeStreak(['2026-08-13'], '2026-08-13')).toBe(1)
  })

  it('counts across a month boundary', () => {
    const dates = ['2026-07-30', '2026-07-31', '2026-08-01']
    expect(computeStreak(dates, '2026-08-01')).toBe(3)
  })

  it('ignores duplicates', () => {
    expect(computeStreak(['2026-08-13', '2026-08-13'], '2026-08-13')).toBe(1)
  })
})

describe('buildRhythm', () => {
  const today = '2026-08-13' // Thursday

  it('returns exactly seven days, Monday first', () => {
    const { week } = buildRhythm([], today)
    expect(week.length).toBe(7)
    expect(week[0]?.date).toBe('2026-08-10')
    expect(week[6]?.date).toBe('2026-08-16')
    expect(week.map((d) => d.label)).toEqual(['M', 'T', 'W', 'T', 'F', 'S', 'S'])
  })

  it('marks today', () => {
    const { week } = buildRhythm([], today)
    expect(week.filter((d) => d.isToday).map((d) => d.date)).toEqual([today])
  })

  it('marks days after today as future, and today is not one of them', () => {
    const { week } = buildRhythm([], today)
    expect(week.filter((d) => d.isFuture).map((d) => d.date)).toEqual([
      '2026-08-14',
      '2026-08-15',
      '2026-08-16',
    ])
  })

  it('marks the days that were read', () => {
    const { week } = buildRhythm(['2026-08-10', '2026-08-13'], today)
    expect(week.filter((d) => d.read).map((d) => d.date)).toEqual(['2026-08-10', '2026-08-13'])
  })

  it('agrees with computeStreak', () => {
    const dates = seedHistory(today, 5)
    expect(buildRhythm(dates, today).streakDays).toBe(computeStreak(dates, today))
  })

  it('handles a week that straddles two months', () => {
    // 2026-09-02 is a Wednesday; its Monday is 2026-08-31.
    const { week } = buildRhythm([], '2026-09-02')
    expect(week[0]?.date).toBe('2026-08-31')
    expect(week[2]?.date).toBe('2026-09-02')
  })
})

describe('seedHistory', () => {
  it('produces an unbroken run ending today', () => {
    const dates = seedHistory('2026-08-13', 14)
    expect(dates.length).toBe(14)
    expect(dates).toContain('2026-08-13')
    expect(computeStreak(dates, '2026-08-13')).toBe(14)
  })

  it('spans exactly the requested number of days', () => {
    const dates = seedHistory('2026-08-13', 14).sort()
    expect(daysBetween(dates[0]!, dates[dates.length - 1]!)).toBe(13)
  })
})

describe('toIsoDate', () => {
  // Local, not UTC: "did I read today" is a question about the reader's day,
  // and a UTC boundary would roll the streak over at the wrong hour in India.
  it('uses local calendar fields rather than converting to UTC', () => {
    const late = new Date(2026, 7, 13, 23, 45)
    expect(toIsoDate(late)).toBe('2026-08-13')
  })

  it('pads single-digit months and days', () => {
    expect(toIsoDate(new Date(2026, 0, 5))).toBe('2026-01-05')
  })
})
