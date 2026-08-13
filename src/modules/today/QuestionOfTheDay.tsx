import Bilingual from '@/components/Bilingual'
import type { Question } from '@/types/models'

/**
 * The question of the day.
 *
 * Human-authored and human-approved, never generated (GHS_MVP_Brief.md §3.1).
 * The line at the foot naming the author and the approval is not decoration:
 * it is how "never preach" and "never unreviewed" become visible to a member
 * rather than staying promises in a document.
 */
export function QuestionOfTheDay({ question }: { question: Question }): JSX.Element {
  const readableDate = new Intl.DateTimeFormat('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date(`${question.date}T00:00:00`))

  return (
    <section aria-labelledby="qotd-heading" className="ghs-card animate-fade-rise">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-rule px-6 py-3.5 sm:px-8">
        <h2 id="qotd-heading" className="ghs-overline">
          Question of the day
        </h2>
        <time dateTime={question.date} className="text-[0.78125rem] text-ink-faint">
          {readableDate}
        </time>
      </div>

      <div className="px-6 py-7 sm:px-8 sm:py-9">
        <Bilingual
          value={question.prompt}
          as="p"
          className="max-w-reading font-display text-[1.625rem] leading-[1.32] text-ink sm:text-[1.875rem]"
        />

        <p className="mt-7 flex flex-wrap items-center gap-x-3 gap-y-2">
          <span className="ghs-chip">{question.scriptureRef}</span>
          <span className="text-[0.78125rem] text-ink-faint">
            Written by <span className="text-ink-muted">{question.authorName}</span> &middot;
            approved before publishing
          </span>
        </p>
      </div>
    </section>
  )
}

export default QuestionOfTheDay
