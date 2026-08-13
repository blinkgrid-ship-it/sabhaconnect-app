import { useEffect, useRef } from 'react'
import { useLang } from '@/context/AppContext'
import type { Verse } from '@/types/models'

/**
 * Column mode — a continuous verse list with thin dividers
 * (GHS_MVP_Brief.md §3.2). The everyday reading surface: less ceremony than
 * Scroll mode, more of the chapter visible at once.
 *
 * The verse row from the theme sheet: brass number, English leads, Malayalam
 * answers at 0.72× with 1.75 leading. Numbers hang in the margin on wide
 * screens so the text column stays clean; on a phone they sit inline, because
 * a hanging margin at that width would eat the line length.
 */
export function ColumnReader({
  verses,
  activeRef,
}: {
  verses: Verse[]
  activeRef: string | null
}): JSX.Element {
  const { showEn, showMl } = useLang()
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!activeRef || !containerRef.current) return
    const target = containerRef.current.querySelector(`[data-verse-ref="${CSS.escape(activeRef)}"]`)
    target?.scrollIntoView({ block: 'center', behavior: 'smooth' })
  }, [activeRef])

  return (
    <div ref={containerRef} className="h-full overflow-y-auto overscroll-contain">
      <div className="mx-auto max-w-3xl px-5 py-9 sm:px-8 sm:py-12">
        <ol>
          {verses.map((verse) => {
            const highlighted = verse.ref === activeRef
            return (
              <li
                key={verse.ref}
                data-verse-ref={verse.ref}
                className={[
                  'ghs-divider scroll-mt-24 py-4 transition-colors first:border-t-0',
                  'sm:grid sm:grid-cols-[2.25rem_minmax(0,1fr)] sm:gap-x-4',
                  highlighted ? '-mx-3 rounded-sm border-t-transparent bg-brass/[0.10] px-3' : '',
                ].join(' ')}
              >
                <span
                  aria-hidden="true"
                  className="mb-1 block font-overline text-overline tabular-nums text-brass-ink sm:mb-0 sm:pt-1.5 sm:text-right"
                >
                  {verse.num}
                </span>

                <div className="min-w-0">
                  <span className="sr-only">Verse {verse.num}. </span>

                  {showEn && verse.text.en ? (
                    <p lang="en" className="font-display text-[1.0625rem] leading-reading text-ink">
                      {verse.text.en}
                    </p>
                  ) : null}

                  {showMl && verse.text.ml ? (
                    <p
                      lang="ml"
                      className={`text-[1.0625rem] text-ink-muted ${
                        showEn && verse.text.en ? 'mt-2' : ''
                      }`}
                    >
                      {verse.text.ml}
                    </p>
                  ) : null}
                </div>
              </li>
            )
          })}
        </ol>
      </div>
    </div>
  )
}

export default ColumnReader
