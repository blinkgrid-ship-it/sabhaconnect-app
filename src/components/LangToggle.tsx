import { useApp } from '@/context/AppContext'
import type { LangMode } from '@/types/models'

const OPTIONS: { mode: LangMode; label: string; title: string }[] = [
  { mode: 'both', label: 'Both', title: 'English and Malayalam, aligned line by line' },
  { mode: 'en', label: 'EN', title: 'English only' },
  { mode: 'ml', label: 'ML', title: 'Malayalam only' },
]

/**
 * The Both / EN / ML affordance. The same control appears on both surfaces —
 * a reader's language choice belongs to the reader, not to the page, so it is
 * held in context and persisted.
 *
 * The active option is brass. Nothing else in this control is.
 */
export function LangToggle({ className = '' }: { className?: string }): JSX.Element {
  const { langMode, setLangMode } = useApp()

  return (
    <div
      role="radiogroup"
      aria-label="Reading language"
      className={`inline-flex items-center gap-1 rounded-full bg-white/[0.06] p-1 ${className}`}
    >
      {OPTIONS.map(({ mode, label, title }) => {
        const active = langMode === mode
        return (
          <button
            key={mode}
            type="button"
            role="radio"
            aria-checked={active}
            title={title}
            onClick={() => setLangMode(mode)}
            className={[
              'rounded-full px-3 py-1 text-ui transition',
              active ? 'ghs-pill-active' : 'ghs-pill-idle-dark',
            ].join(' ')}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}

export default LangToggle
