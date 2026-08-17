import { useState } from 'react'
import { Sparkles } from 'lucide-react'
import { useDemo } from '../../demo/DemoContext'
import { api } from '../../services/api'
import { Bilingual, GuardrailNote, LangToggle, SourceTag, type LangMode } from '../../app/ui'
import type { FeedItem } from '../../types/models'

function PendingBadge() {
  return (
    <span className="inline-flex items-center rounded-full border border-plum/40 bg-plum/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-plum">
      Staff preview
    </span>
  )
}

function FeedCard({ item, lang, isStaffPreview }: { item: FeedItem; lang: LangMode; isStaffPreview: boolean }) {
  return (
    <div className="card animate-fade-in flex flex-col p-5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] font-medium uppercase tracking-wide text-spirit">{item.category}</span>
        {isStaffPreview && <PendingBadge />}
      </div>
      <p className="mt-2 font-display text-lg text-ink">
        <Bilingual text={item.title} lang={lang} />
      </p>
      <p className="mt-2 text-sm leading-relaxed text-ink/75">
        <Bilingual text={item.body} lang={lang} />
      </p>
      <div className="mt-4">
        <SourceTag>Source: {item.source}</SourceTag>
      </div>
    </div>
  )
}

function HeroCard({ item, lang, isStaffPreview }: { item: FeedItem; lang: LangMode; isStaffPreview: boolean }) {
  return (
    <div className="card animate-fade-in border-l-4 border-l-gold p-6">
      <div className="flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1 rounded-full bg-gold/15 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-gold">
          <Sparkles className="h-3 w-3" aria-hidden="true" /> Daily
        </span>
        {isStaffPreview && <PendingBadge />}
      </div>
      <p className="mt-3 font-display text-2xl text-ink">
        <Bilingual text={item.title} lang={lang} />
      </p>
      <p className="mt-2 text-base leading-relaxed text-ink/80">
        <Bilingual text={item.body} lang={lang} />
      </p>
      <div className="mt-4">
        <SourceTag>Source: {item.source}</SourceTag>
      </div>
    </div>
  )
}

export function GoodNewsFeed() {
  const { church, churchId, role } = useDemo()
  const [lang, setLang] = useState<LangMode>('both')
  const [category, setCategory] = useState<string>('all')

  const items = api.getFeedItems(churchId, role)
  const categories = Array.from(new Set(items.map((i) => i.category)))

  const hero = items.find((i) => i.category === 'testimony') ?? items[0]
  const rest = items
    .filter((i) => i.id !== hero?.id)
    .filter((i) => category === 'all' || i.category === category)

  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl text-ink">Good News Feed</h1>
          <p className="font-ml text-sm text-ink/60">സന്തോഷവാർത്ത</p>
        </div>
        <LangToggle lang={lang} onChange={setLang} />
      </div>
      <GuardrailNote className="mt-2">
        Every story here is shared with attribution and reviewed by a person before it's public.{' '}
        {church.name.en}.
      </GuardrailNote>

      {hero && (
        <div className="mt-6">
          <HeroCard item={hero} lang={lang} isStaffPreview={role !== 'member' && hero.status !== 'approved'} />
        </div>
      )}

      {categories.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setCategory('all')}
            className={[
              'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
              category === 'all' ? 'border-spirit bg-spirit text-paper' : 'border-mist bg-cloud text-ink/60 hover:text-ink',
            ].join(' ')}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={[
                'rounded-full border px-3 py-1 text-xs font-medium capitalize transition-colors',
                category === cat ? 'border-spirit bg-spirit text-paper' : 'border-mist bg-cloud text-ink/60 hover:text-ink',
              ].join(' ')}
            >
              {cat.replace('-', ' ')}
            </button>
          ))}
        </div>
      )}

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {rest.length === 0 ? (
          <p className="text-sm text-ink/50">Nothing else in this category yet.</p>
        ) : (
          rest.map((item) => (
            <FeedCard key={item.id} item={item} lang={lang} isStaffPreview={role !== 'member' && item.status !== 'approved'} />
          ))
        )}
      </div>
    </div>
  )
}
