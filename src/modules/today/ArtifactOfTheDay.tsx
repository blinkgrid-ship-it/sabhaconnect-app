import { SourceLink } from '@/components/Attribution'
import type { Artifact } from '@/types/models'

/**
 * The archaeological artifact of the day.
 *
 * Three guardrails converge on this card (GHS_ProductArchitecture.md §14.3):
 *
 * - **Never depict.** Places, objects, inscriptions and structures only. The
 *   ArtifactKind union has no `person` member, so this is enforced by the type
 *   system rather than by reviewer attention.
 * - **Never uncited.** `sourceUrl` is required by the model and rendered
 *   unconditionally below — there is no code path that omits it.
 * - **Never unreviewed.** An image renders only once a human has confirmed it
 *   depicts no person. Until then the card shows its placeholder. An unreviewed
 *   image is not shown "just this once".
 */

/** Shown when there is no image, or none a person has cleared yet. */
function Placeholder({ kind }: { kind: Artifact['kind'] }): JSX.Element {
  return (
    <div
      role="img"
      aria-label={`No reviewed image available for this ${kind}`}
      className="flex h-full min-h-[9rem] w-full items-center justify-center bg-parchment"
    >
      <svg viewBox="0 0 24 24" className="h-9 w-9 text-lamp" aria-hidden="true">
        <path
          d="M12 3.5l1.7 4.9 4.8 1.6-4.8 1.6L12 16.5l-1.7-4.9L5.5 10l4.8-1.6L12 3.5z"
          fill="currentColor"
        />
      </svg>
    </div>
  )
}

export function ArtifactOfTheDay({ artifact }: { artifact: Artifact }): JSX.Element {
  const imageApproved = artifact.imageReview.status === 'approved' && Boolean(artifact.imageUrl)

  return (
    <section aria-labelledby="artifact-heading" className="ghs-card overflow-hidden animate-fade-rise">
      <div className="border-b border-rule px-5 py-3.5">
        <h2 id="artifact-heading" className="ghs-overline">
          Artifact of the day
        </h2>
      </div>

      <div className="aspect-[16/9] w-full overflow-hidden bg-parchment">
        {imageApproved ? (
          <img
            src={artifact.imageUrl as string}
            alt={`${artifact.name} — ${artifact.kind} at ${artifact.location}`}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover"
          />
        ) : (
          <Placeholder kind={artifact.kind} />
        )}
      </div>

      <div className="px-5 py-5">
        <h3 className="font-display text-[1.1875rem] font-medium text-ink">{artifact.name}</h3>

        <p className="mt-1 text-[0.78125rem] text-ink-faint">
          <span className="capitalize">{artifact.kind}</span>
          <span aria-hidden="true"> &middot; </span>
          {artifact.location}
          <span aria-hidden="true"> &middot; </span>
          {artifact.period}
        </p>

        <p className="mt-3.5 text-[0.875rem] leading-relaxed text-ink-muted">{artifact.blurb}</p>

        {artifact.bibleRefs.length > 0 ? (
          <p className="mt-4 flex flex-wrap items-center gap-2">
            <span className="ghs-overline text-ink-faint">Mentioned in</span>
            {artifact.bibleRefs.map((ref) => (
              <span key={ref} className="ghs-chip">
                {ref}
              </span>
            ))}
          </p>
        ) : null}

        {/* Attribution. Never conditional. */}
        <p className="mt-4 border-t border-rule pt-3.5">
          <SourceLink href={artifact.sourceUrl} label={artifact.sourceLabel} />
        </p>

        {!imageApproved && artifact.imageUrl ? (
          <p className="mt-2.5 text-[0.78125rem] italic leading-relaxed text-ink-faint">
            The photograph for this entry is awaiting review, so it is not shown.
          </p>
        ) : null}
      </div>
    </section>
  )
}

export default ArtifactOfTheDay
