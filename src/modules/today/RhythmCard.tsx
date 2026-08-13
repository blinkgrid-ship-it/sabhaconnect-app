import type { ReadingRhythm } from '@/lib/rhythm'

/**
 * The reading rhythm — a sanctuary-teal card among the parchment ones, so the
 * companion column has one point of weight.
 *
 * The number is computed from recorded reading days (see lib/rhythm.ts), not
 * stored, so it can never disagree with the squares beside it.
 */
export function RhythmCard({ rhythm }: { rhythm: ReadingRhythm }): JSX.Element {
  const { streakDays, week } = rhythm

  return (
    <section
      aria-labelledby="rhythm-heading"
      className="rounded-card bg-sanctuary px-6 py-5 text-white animate-fade-rise"
    >
      <h2 id="rhythm-heading" className="ghs-overline-dark">
        Your rhythm
      </h2>

      <p className="mt-3 flex items-baseline gap-2.5">
        <span className="font-display text-[2.5rem] font-medium leading-none text-lamp tabular-nums">
          {streakDays}
        </span>
        <span className="text-ui text-white/70">
          {streakDays === 1 ? 'day unbroken' : 'days unbroken'}
        </span>
      </p>

      <ol className="mt-5 grid grid-cols-7 gap-1.5" aria-label="This week">
        {week.map((day) => (
          <li key={day.date} className="flex flex-col items-center gap-1.5">
            <span
              title={`${day.date}${day.read ? ' — read' : ''}`}
              className={[
                'h-7 w-full rounded-[0.3rem] transition',
                day.read
                  ? 'bg-lamp'
                  : day.isFuture
                    ? 'bg-white/[0.07]'
                    : 'bg-white/[0.16]',
                day.isToday ? 'ring-1 ring-brass ring-offset-2 ring-offset-sanctuary' : '',
              ].join(' ')}
            >
              <span className="sr-only">
                {day.date}
                {day.read ? ', read' : day.isFuture ? ', still to come' : ', not read'}
              </span>
            </span>
            <span
              aria-hidden="true"
              className={`font-overline text-[0.5625rem] tracking-normal ${
                day.isToday ? 'text-lamp' : 'text-white/40'
              }`}
            >
              {day.label}
            </span>
          </li>
        ))}
      </ol>
    </section>
  )
}

export default RhythmCard
