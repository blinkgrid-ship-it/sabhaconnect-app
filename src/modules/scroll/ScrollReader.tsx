import { useEffect, useRef } from 'react'
import { useLang } from '@/context/AppContext'
import type { Verse } from '@/types/models'

/**
 * Scroll mode — the signature reading surface (GHS_MVP_Brief.md §3.2).
 *
 * One verse fills the view, behind a large faint chapter numeral, and the
 * reader moves through the chapter a verse at a time. Scroll-snap does the work
 * rather than JavaScript paging, so a trackpad, a thumb, Page Down and a screen
 * reader all behave correctly and the motion stays native.
 *
 * English and Malayalam stay one unit: both lines belong to the same verse, so
 * they move together and are never separated across a boundary.
 */
export function ScrollReader({
  verses,
  chapter,
  activeRef,
  onActiveChange,
}: {
  verses: Verse[]
  chapter: number
  activeRef: string | null
  onActiveChange: (ref: string) => void
}): JSX.Element {
  const { showEn, showMl } = useLang()
  const containerRef = useRef<HTMLDivElement>(null)

  // Report whichever verse is centred, so the header can show the reference.
  useEffect(() => {
    const root = containerRef.current
    if (!root || verses.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        const centred = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        const ref = centred?.target.getAttribute('data-verse-ref')
        if (ref) onActiveChange(ref)
      },
      { root, threshold: [0.5, 0.75] },
    )

    for (const el of root.querySelectorAll('[data-verse-ref]')) observer.observe(el)
    return () => observer.disconnect()
  }, [verses, onActiveChange])

  // Jump to a verse chosen from search or the chapter strip.
  useEffect(() => {
    if (!activeRef || !containerRef.current) return
    const target = containerRef.current.querySelector(`[data-verse-ref="${CSS.escape(activeRef)}"]`)
    target?.scrollIntoView({ block: 'center', behavior: 'auto' })
    // Only on an externally-driven ref change, not on every scroll update.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeRef ? `${activeRef}:jump` : null])

  if (verses.length === 0) return <div />

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      aria-label={`Chapter ${chapter}, verse by verse`}
      className="relative h-full snap-y snap-mandatory overflow-y-auto overscroll-contain scroll-smooth focus:outline-none"
    >
      {/* The large faint chapter numeral, held behind the moving text. */}
      <div
        aria-hidden="true"
        className="pointer-events-none sticky top-0 z-0 flex h-0 items-start justify-center"
      >
        <span className="mt-[7vh] select-none font-display text-[40vh] leading-none text-brass/[0.07] sm:text-[48vh]">
          {chapter}
        </span>
      </div>

      {verses.map((verse, index) => (
        <section
          key={verse.ref}
          data-verse-ref={verse.ref}
          aria-label={`Verse ${verse.num}`}
          className="relative z-10 flex h-full snap-center flex-col items-center justify-center px-6 py-16 sm:px-10"
        >
          <div className="w-full max-w-2xl text-center">
            <p className="mb-6 font-overline text-overline uppercase tabular-nums text-brass-ink">
              {verse.num}
            </p>

            {showEn && verse.text.en ? (
              <p lang="en" className="font-display text-[1.5rem] leading-[1.42] text-ink sm:text-verse">
                {verse.text.en}
              </p>
            ) : null}

            {showMl && verse.text.ml ? (
              <p
                lang="ml"
                className={`text-[1.5rem] text-ink-muted sm:text-verse ${
                  showEn && verse.text.en ? 'mt-6 border-t border-rule pt-6' : ''
                }`}
              >
                {verse.text.ml}
              </p>
            ) : null}
          </div>

          {/* The invitation, on the first verse only. */}
          {index === 0 && verses.length > 1 ? (
            <p className="absolute bottom-9 flex items-center gap-2 font-overline text-overline uppercase text-ink-faint animate-fade-in">
              scroll to begin
              <svg
                aria-hidden="true"
                viewBox="0 0 16 16"
                className="h-3 w-3 animate-bounce fill-none stroke-current stroke-[1.5]"
              >
                <path d="M8 3v10M4 9l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </p>
          ) : null}
        </section>
      ))}
    </div>
  )
}

export default ScrollReader
