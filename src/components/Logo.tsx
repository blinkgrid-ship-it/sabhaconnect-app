/**
 * The GHS mark.
 *
 * An open scroll: two rollers with lines of text between them. It reads at
 * 20px in a header and still reads as a scroll, which a letterform badge does
 * not — and it points at the product's signature surface rather than at its
 * initials.
 *
 * Drawn in currentColor so the badge decides the colour, keeping the mark
 * usable on lamp, parchment or sanctuary grounds without a second asset.
 */
export function ScrollMark({ className = '' }: { className?: string }): JSX.Element {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      {/* rollers */}
      <rect x="3.5" y="3" width="17" height="2.9" rx="1.45" fill="currentColor" />
      <rect x="3.5" y="18.1" width="17" height="2.9" rx="1.45" fill="currentColor" />
      {/* lines of text */}
      <g
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        fill="none"
        opacity="0.9"
      >
        <path d="M7.4 9.4h9.2" />
        <path d="M7.4 12.6h9.2" />
        <path d="M7.4 15.8h5.6" />
      </g>
    </svg>
  )
}

/**
 * The badge — a lamp-coloured rounded square holding the mark. Radius 10,
 * matching the smallest radius on the theme sheet.
 */
export function LogoBadge({ className = '' }: { className?: string }): JSX.Element {
  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-sm bg-lamp text-sanctuary ${className}`}
    >
      <ScrollMark className="h-[62%] w-[62%]" />
    </span>
  )
}

/**
 * Badge plus wordmark, as it appears in the header.
 * `onDark` swaps the type colours for the sanctuary bar.
 */
export function Logo({
  onDark = true,
  name = 'GHS',
  subtitle = 'Daily Word & Scripture',
  className = '',
}: {
  onDark?: boolean
  name?: string
  subtitle?: string
  className?: string
}): JSX.Element {
  return (
    <span className={`flex min-w-0 items-center gap-2.5 ${className}`}>
      <LogoBadge className="h-9 w-9" />
      <span className="flex min-w-0 flex-col leading-none">
        <span
          className={`font-display text-[1.375rem] font-medium leading-none tracking-tight ${
            onDark ? 'text-white' : 'text-ink'
          }`}
        >
          {name}
        </span>
        <span
          className={`mt-[0.3rem] font-overline text-overline uppercase ${
            onDark ? 'text-lamp/65' : 'text-ink-faint'
          }`}
        >
          {subtitle}
        </span>
      </span>
    </span>
  )
}

export default Logo
