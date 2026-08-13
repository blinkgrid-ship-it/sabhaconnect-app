/**
 * Attribution primitives for the "never uncited" guardrail
 * (GHS_MVP_Brief.md §5, GHS_ProductArchitecture.md §8).
 *
 * These are small on purpose. Citation should be quiet and permanent, not a
 * badge of compliance — but it is never optional, so both components require
 * their source rather than accepting an undefined one.
 */

/**
 * The translation badge. Shows which translations are on screen and carries
 * their attribution — wired from the mirrored data, never hard-coded (§13.2).
 */
export function TranslationBadge({
  labels,
  detail,
  className = '',
}: {
  labels: string[]
  detail?: string
  className?: string
}): JSX.Element {
  return (
    <span
      title={detail}
      className={`inline-flex items-center gap-1.5 rounded-full border border-lamp/30 px-3 py-1 font-overline text-overline uppercase text-lamp ${className}`}
    >
      {labels.map((label, i) => (
        <span key={label} className="whitespace-nowrap">
          {i > 0 ? <span className="mr-1.5 text-lamp/45">&middot;</span> : null}
          {label}
        </span>
      ))}
    </span>
  )
}

/**
 * A source link. `href` and `label` are both required — an artifact or feed
 * item without a source must not be renderable.
 */
export function SourceLink({
  href,
  label,
  className = '',
}: {
  href: string
  label: string
  className?: string
}): JSX.Element {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-1 text-[0.78125rem] text-ink-muted underline decoration-rule underline-offset-4 transition hover:text-cedar hover:decoration-cedar ${className}`}
    >
      from {label}
      <svg
        aria-hidden="true"
        viewBox="0 0 12 12"
        className="h-2.5 w-2.5 fill-none stroke-current stroke-[1.5]"
      >
        <path d="M4.5 2h5.5v5.5M10 2 3 9" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span className="sr-only">(opens in a new tab)</span>
    </a>
  )
}
