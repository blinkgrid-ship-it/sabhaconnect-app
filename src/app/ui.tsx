import { ShieldCheck } from 'lucide-react'
import { useState } from 'react'
import type { ReactNode } from 'react'
import type { Localized } from '../types/models'

export type LangMode = 'both' | 'en' | 'ml'

const LANG_OPTIONS: { value: LangMode; label: string }[] = [
  { value: 'both', label: 'Both' },
  { value: 'en', label: 'EN' },
  { value: 'ml', label: 'ML' },
]

const LANG_STORAGE_KEY = 'ghs.lang.v1'

function isLangMode(value: string): value is LangMode {
  return value === 'both' || value === 'en' || value === 'ml'
}

function loadStoredLang(): LangMode | null {
  try {
    const raw = localStorage.getItem(LANG_STORAGE_KEY)
    if (raw && isLangMode(raw)) return raw
  } catch {
    // ignore — falls through to the default below
  }
  return null
}

/**
 * The Both/EN/ML toggle's starting value on every screen: a saved device
 * preference wins, otherwise Malayalam — most first-time visitors are
 * Malayalee, so ML is the right default, not English. Every screen still
 * offers Both/EN/ML equally; this only decides where the toggle starts.
 *
 * Once user profiles carry a signed-in `preferredLang` (set at sign-up,
 * alongside future accessibility preferences), that should be checked here
 * *before* the stored device preference — this is the one place that
 * ordering needs to change.
 */
export function useLangPreference(): [LangMode, (lang: LangMode) => void] {
  const [lang, setLangState] = useState<LangMode>(() => loadStoredLang() ?? 'ml')

  function setLang(next: LangMode) {
    setLangState(next)
    try {
      localStorage.setItem(LANG_STORAGE_KEY, next)
    } catch {
      // ignore — preference just won't persist across reloads this session
    }
  }

  return [lang, setLang]
}

export function LangToggle({ lang, onChange }: { lang: LangMode; onChange: (lang: LangMode) => void }) {
  return (
    <div className="inline-flex shrink-0 rounded-lg border border-mist bg-cloud p-0.5 text-xs">
      {LANG_OPTIONS.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={[
            'min-h-11 rounded-md px-2.5 py-1 font-medium transition-colors sm:min-h-0',
            lang === opt.value ? 'bg-spirit text-paper' : 'text-ink/60 hover:text-ink',
          ].join(' ')}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

/** Renders a Localized field per the current lang toggle. */
export function Bilingual({
  text,
  lang,
  className = '',
  mlClassName = '',
}: {
  text: Localized
  lang: LangMode
  className?: string
  mlClassName?: string
}) {
  if (lang === 'en') return <span className={className}>{text.en}</span>
  if (lang === 'ml') return <span className={`font-ml ${mlClassName || className}`}>{text.ml}</span>
  return (
    <span className="block">
      <span className={className}>{text.en}</span>
      <span className={`font-ml mt-1 block text-ink/70 ${mlClassName}`}>{text.ml}</span>
    </span>
  )
}

/** A small pill used everywhere a content item must show where it came from. */
export function SourceTag({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-mist bg-cloud px-2 py-0.5 text-[11px] font-medium text-ink/60">
      {children}
    </span>
  )
}

/** A visible guardrail explanation — used on light surfaces (paper/cloud). */
export function GuardrailNote({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <p className={`flex items-start gap-1.5 text-[11px] leading-relaxed text-ink/50 ${className}`}>
      <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-plum/70" aria-hidden="true" />
      <span>{children}</span>
    </p>
  )
}

/** Same as GuardrailNote, styled for the dark Content Studio surface. */
export function GuardrailNoteDark({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <p className={`flex items-start gap-1.5 text-[11px] leading-relaxed text-paper/50 ${className}`}>
      <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold/70" aria-hidden="true" />
      <span>{children}</span>
    </p>
  )
}
