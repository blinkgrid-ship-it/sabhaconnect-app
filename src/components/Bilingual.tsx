import { useLang } from '@/context/AppContext'
import type { Bilingual as BilingualText } from '@/types/models'

/**
 * Renders a bilingual value according to the reader's language choice.
 *
 * In `both` mode English leads and Malayalam answers, and the pair is the
 * atomic unit — which is what "aligned line-by-line" means in practice
 * (GHS_MVP_Brief.md §3.2).
 *
 * Sizing is not set here. The `:lang(ml)` rule in index.css sizes Malayalam at
 * 0.72em of whatever the English is, with 1.75 leading, so a caller sets the
 * English size once and the ratio from the theme sheet holds automatically.
 * Each line carries its own `lang` attribute, which is what drives that rule
 * and also lets a screen reader switch voice.
 */
export function Bilingual({
  value,
  className = '',
  enClassName = '',
  mlClassName = '',
  as: Tag = 'div',
}: {
  value: BilingualText
  className?: string
  enClassName?: string
  mlClassName?: string
  as?: 'div' | 'p' | 'span' | 'h1' | 'h2' | 'h3'
}): JSX.Element | null {
  const { showEn, showMl } = useLang()

  const en = value.en?.trim() ?? ''
  const ml = value.ml?.trim() ?? ''

  // If the reader asked for one language and this item does not have it, show
  // the other rather than an empty block. A handful of verses genuinely exist
  // in only one of the two translations.
  const wantEn = showEn && en
  const wantMl = showMl && ml
  const renderEn = wantEn || (!wantMl && en) ? en : ''
  const renderMl = wantMl || (!wantEn && ml) ? ml : ''

  if (!renderEn && !renderMl) return null

  return (
    <Tag className={className}>
      {renderEn ? (
        <span lang="en" className={`block ${enClassName}`}>
          {renderEn}
        </span>
      ) : null}
      {renderMl ? (
        <span lang="ml" className={`block ${renderEn ? 'mt-3' : ''} ${mlClassName}`}>
          {renderMl}
        </span>
      ) : null}
    </Tag>
  )
}

export default Bilingual
