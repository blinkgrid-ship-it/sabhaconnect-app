import Bilingual from '@/components/Bilingual'
import CommentThread from './CommentThread'
import type { Reflection } from '@/types/models'

/**
 * A reflection post.
 *
 * The left cedar rule is the theme sheet's attribution mark: it appears on
 * anything a person said, and never on app chrome. Every reflection carries it,
 * because every reflection was written by somebody.
 *
 * The pastor's is the anchor of the page (GHS_MVP_Brief.md §3.1), so it reads
 * at scripture size and carries the comment thread; community reflections sit
 * quieter beneath it.
 */
export function ReflectionCard({
  reflection,
  withComments = false,
}: {
  reflection: Reflection
  withComments?: boolean
}): JSX.Element {
  const isPastor = reflection.isPastor

  return (
    <article className="ghs-card ghs-attributed animate-fade-rise px-6 py-6 sm:px-8 sm:py-7">
      <header className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h3 className="flex flex-wrap items-baseline gap-2.5">
          <span className="font-display text-[1.0625rem] font-medium text-ink">
            {reflection.authorName}
          </span>
          {isPastor ? <span className="ghs-overline">Pastor&rsquo;s reflection</span> : null}
        </h3>
        <time dateTime={reflection.createdAt} className="text-[0.78125rem] text-ink-faint">
          {new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' }).format(
            new Date(reflection.createdAt),
          )}
        </time>
      </header>

      <Bilingual
        value={reflection.body}
        as="div"
        className={[
          'mt-3.5 max-w-reading font-display leading-reading',
          isPastor ? 'text-[1.0625rem] text-ink' : 'text-[1rem] text-ink-muted',
        ].join(' ')}
      />

      {withComments ? <CommentThread targetId={reflection.id} /> : null}
    </article>
  )
}

export default ReflectionCard
