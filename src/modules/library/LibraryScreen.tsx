import { useState } from 'react'
import { BookOpen, Download, FileText, Mic, Search } from 'lucide-react'
import { useDemo } from '../../demo/DemoContext'
import { api } from '../../services/api'
import { Bilingual, GuardrailNote, LangToggle, useLangPreference, type LangMode } from '../../app/ui'
import type { Localized, ReviewStatus } from '../../types/models'

type LibraryKind = 'sermon' | 'devotional-audio' | 'resource'

interface LibraryCard {
  id: string
  kind: LibraryKind
  title: Localized
  meta: string
  body?: Localized
  status?: ReviewStatus
  extra?: string
  searchText: string
}

const KIND_LABEL: Record<LibraryKind, string> = {
  sermon: 'Sermon',
  'devotional-audio': 'Devotional Audio',
  resource: 'Resource',
}

const KIND_ICON: Record<LibraryKind, typeof Mic> = {
  sermon: Mic,
  'devotional-audio': Mic,
  resource: FileText,
}

const FILTERS: { value: 'all' | LibraryKind; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'sermon', label: 'Sermons' },
  { value: 'devotional-audio', label: 'Devotional Audio' },
  { value: 'resource', label: 'Resources' },
]

function StaffPreviewBadge({ status }: { status: ReviewStatus }) {
  return (
    <span className="inline-flex items-center rounded-full border border-plum/40 bg-plum/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-plum">
      Staff preview — {status.replace('_', ' ')}
    </span>
  )
}

function LibraryCardView({ item, lang, expanded, onToggle }: { item: LibraryCard; lang: LangMode; expanded: boolean; onToggle: () => void }) {
  const Icon = KIND_ICON[item.kind]
  const isPendingForStaff = item.status && item.status !== 'approved'

  return (
    <div className="card p-4">
      <button type="button" onClick={onToggle} className="flex w-full items-start justify-between gap-3 text-left">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 text-[10px] font-medium uppercase tracking-wide text-spirit">
              <Icon className="h-3 w-3" aria-hidden="true" /> {KIND_LABEL[item.kind]}
            </span>
            {isPendingForStaff && <StaffPreviewBadge status={item.status!} />}
          </div>
          <p className="mt-1 font-display text-base text-ink">
            <Bilingual text={item.title} lang={lang} />
          </p>
          <p className="mt-1 text-xs text-ink/50">{item.meta}</p>
        </div>
        {item.extra && (
          <span className="shrink-0 rounded-full border border-mist bg-cloud px-2 py-0.5 text-[10px] font-medium text-ink/60">
            {item.extra}
          </span>
        )}
      </button>

      {expanded && item.body && (
        <div className="animate-fade-in mt-3 border-t border-mist pt-3 text-sm leading-relaxed text-ink/80">
          <Bilingual text={item.body} lang={lang} />
        </div>
      )}

      {expanded && item.kind === 'resource' && (
        <div className="mt-3 border-t border-mist pt-3">
          <button
            type="button"
            disabled
            title="Demo preview — downloads aren't wired up"
            className="inline-flex min-h-11 cursor-not-allowed items-center gap-1.5 rounded-lg border border-mist bg-cloud px-3 py-1.5 text-xs font-medium text-ink/40 sm:min-h-0"
          >
            <Download className="h-3.5 w-3.5" aria-hidden="true" /> Download {item.extra}
          </button>
          <GuardrailNote className="mt-2">Demo preview — no file actually downloads here.</GuardrailNote>
        </div>
      )}

      {expanded && item.kind === 'devotional-audio' && (
        <GuardrailNote className="mt-3 border-t border-mist pt-3">
          Listen to this narration from The Voice — a real person recorded it, never a synthesized stand-in.
        </GuardrailNote>
      )}
    </div>
  )
}

export function LibraryScreen() {
  const { church, churchId, role } = useDemo()
  const [lang, setLang] = useLangPreference()
  const [filter, setFilter] = useState<'all' | LibraryKind>('all')
  const [query, setQuery] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const sermonCards: LibraryCard[] = api.getSermons(churchId).map((s) => ({
    id: s.id,
    kind: 'sermon',
    title: s.title,
    meta: `${s.speaker} · ${s.date}`,
    body: s.transcript,
    extra: 'Audio + Transcript',
    searchText: `${s.title.en} ${s.title.ml} ${s.speaker}`.toLowerCase(),
  }))

  const devotionalAudioCards: LibraryCard[] = api
    .getDevotionals(churchId, role)
    .filter((d) => d.narratorName)
    .map((d) => ({
      id: d.id,
      kind: 'devotional-audio',
      title: d.title,
      meta: `Narrated by ${d.narratorName} · ${d.day}`,
      body: d.body,
      status: d.status,
      extra: 'Audio',
      searchText: `${d.title.en} ${d.title.ml} ${d.narratorName ?? ''}`.toLowerCase(),
    }))

  const resourceCards: LibraryCard[] = api.getResources(churchId, role).map((r) => ({
    id: r.id,
    kind: 'resource',
    title: r.title,
    meta: r.category,
    body: r.description,
    status: r.status,
    extra: r.fileLabel,
    searchText: `${r.title.en} ${r.title.ml} ${r.category}`.toLowerCase(),
  }))

  const all = [...sermonCards, ...devotionalAudioCards, ...resourceCards]
  const q = query.trim().toLowerCase()

  const items = all
    .filter((item) => filter === 'all' || item.kind === filter)
    .filter((item) => !q || item.searchText.includes(q))

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl text-ink">Library</h1>
          <p className="font-ml text-sm text-ink/60">ലൈബ്രറി</p>
        </div>
        <LangToggle lang={lang} onChange={setLang} />
      </div>
      <GuardrailNote className="mt-2">
        Sermon audio, narrated devotionals, and study resources — read only through {church.name.en}'s reviewed
        catalog. Scripture itself stays in The Word and The Scroll.
      </GuardrailNote>

      <div className="mt-4 flex items-center gap-2 rounded-lg border border-mist bg-paper px-3 py-2">
        <Search className="h-4 w-4 shrink-0 text-ink/40" aria-hidden="true" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search sermons, devotionals, resources..."
          className="w-full bg-transparent text-sm text-ink placeholder:text-ink/30 focus:outline-none"
        />
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => setFilter(f.value)}
            className={[
              'min-h-11 rounded-full border px-3 py-1 text-xs font-medium transition-colors sm:min-h-0',
              filter === f.value ? 'border-spirit bg-spirit text-paper' : 'border-mist bg-cloud text-ink/60 hover:text-ink',
            ].join(' ')}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="mt-4 space-y-3">
        {items.length === 0 ? (
          <p className="rounded-lg border border-dashed border-mist p-4 text-sm text-ink/50">
            {q ? `Nothing matches "${query}".` : 'Nothing in this library yet.'}
          </p>
        ) : (
          items.map((item) => (
            <LibraryCardView
              key={item.id}
              item={item}
              lang={lang}
              expanded={expandedId === item.id}
              onToggle={() => setExpandedId((cur) => (cur === item.id ? null : item.id))}
            />
          ))
        )}
      </div>

      <p className="mt-4 flex items-center justify-center gap-1.5 text-center text-xs text-ink/40">
        <BookOpen className="h-3 w-3 shrink-0" aria-hidden="true" /> Looking to read Scripture? That's under The
        Word and The Scroll.
      </p>
    </div>
  )
}
