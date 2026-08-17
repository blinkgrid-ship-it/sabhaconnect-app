import { useState } from 'react'
import { BookOpen, Mic, MessageCircle } from 'lucide-react'
import { useDemo } from '../../demo/DemoContext'
import { api } from '../../services/api'
import { Bilingual, GuardrailNote, LangToggle, type LangMode } from '../../app/ui'
import type { LexiconEntry } from '../../types/models'

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function formatDay(day: string): string {
  return new Date(`${day}T00:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

/** Keyed by refId so switching days loads that day's own private entry, not the previous day's. */
function JournalBox({ refId, userId }: { refId: string; userId: string }) {
  const existing = api.getJournalEntry(userId, refId)
  const [text, setText] = useState(existing?.body ?? '')
  const [savedAt, setSavedAt] = useState<string | null>(existing?.updatedAt ?? null)

  function save() {
    const entry = api.saveJournalEntry(userId, refId, text)
    setSavedAt(entry.updatedAt)
  }

  return (
    <div className="mt-4">
      <label className="block text-xs font-medium uppercase tracking-wide text-ink/50">
        Your reflection — private, just for you
      </label>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={4}
        placeholder="Write what this stirs up in you..."
        className="mt-1 w-full rounded-lg border border-mist bg-paper p-3 text-sm text-ink placeholder:text-ink/30 focus:border-spirit focus:outline-none"
      />
      <div className="mt-2 flex items-center gap-3">
        <button
          type="button"
          onClick={save}
          className="rounded-lg bg-spirit px-4 py-1.5 text-sm font-medium text-paper transition-colors hover:bg-spirit/90"
        >
          Save
        </button>
        {savedAt && <span className="text-xs text-ink/40">Saved privately — not shared with anyone.</span>}
      </div>
    </div>
  )
}

/** Splits verse text and wraps any word with a lexicon entry in a tappable button. */
function HighlightedVerseText({
  text,
  entries,
  openRootId,
  onToggleRoot,
}: {
  text: string
  entries: LexiconEntry[]
  openRootId: string | null
  onToggleRoot: (id: string) => void
}) {
  if (entries.length === 0) return <>{text}</>

  const pattern = new RegExp(`\\b(${entries.map((e) => escapeRegExp(e.word)).join('|')})\\b`, 'gi')
  const parts = text.split(pattern)

  return (
    <>
      {parts.map((part, i) => {
        const entry = entries.find((e) => e.word.toLowerCase() === part.toLowerCase())
        if (!entry) return <span key={i}>{part}</span>
        const isOpen = openRootId === entry.id
        return (
          <button
            key={i}
            type="button"
            onClick={() => onToggleRoot(entry.id)}
            className={[
              'rounded px-0.5 font-semibold underline decoration-gold decoration-2 underline-offset-4 transition-colors',
              isOpen ? 'bg-gold/25 text-ink' : 'text-ink hover:bg-gold/10',
            ].join(' ')}
          >
            {part}
          </button>
        )
      })}
    </>
  )
}

function RootCard({ entry, lang }: { entry: LexiconEntry; lang: LangMode }) {
  return (
    <div className="card animate-fade-in mt-2 border-l-4 border-l-gold p-4">
      <div className="flex items-baseline gap-3">
        <span dir="rtl" className="font-display text-3xl text-ink">
          {entry.original}
        </span>
        <span className="font-display text-lg italic text-spirit">{entry.transliteration}</span>
        <span className="text-[11px] uppercase tracking-wide text-ink/40">{entry.language}</span>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-ink/80">
        <Bilingual text={entry.meaning} lang={lang} />
      </p>
      <p className="mt-3 flex items-center gap-1.5 border-t border-mist pt-2 text-[11px] text-ink/50">
        <BookOpen className="h-3 w-3 shrink-0" aria-hidden="true" />
        {entry.citation}
      </p>
    </div>
  )
}

export function WordScreen() {
  const { church, churchId, role, currentUser } = useDemo()
  const [lang, setLang] = useState<LangMode>('both')
  const [openRootId, setOpenRootId] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const verses = api.getVersesByRef('Genesis 1')

  // Ascending by day, for the week strip. A newly approved devotional simply
  // appears in this list the moment a member reloads it — no matter which
  // pending day a reviewer happened to approve.
  const devotionals = [...api.getDevotionals(churchId, role)].sort((a, b) => (a.day < b.day ? -1 : 1))
  const selected = devotionals.find((d) => d.id === selectedId) ?? devotionals[devotionals.length - 1]

  const questions = [...api.getQuestions(churchId, role)].sort((a, b) => (a.day < b.day ? -1 : 1))
  const selectedQuestion = questions.find((q) => q.day === selected?.day) ?? questions[questions.length - 1]

  const pastor = api.findUser(churchId, 'pastor')

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl text-ink">The Word</h1>
          <p className="font-ml text-sm text-ink/60">വചനം</p>
        </div>
        <LangToggle lang={lang} onChange={setLang} />
      </div>

      {/* Today's Passage */}
      <section className="card mt-6 p-6">
        <div className="flex items-baseline justify-between">
          <h2 className="font-display text-lg text-ink">Today's Passage — Genesis 1</h2>
        </div>
        <GuardrailNote className="mt-1">
          Scripture is always free to read here — no sign-in, no paywall. Tap an underlined word to see its
          original-language root.
        </GuardrailNote>

        <div className="mt-4 max-h-[28rem] overflow-y-auto pr-1">
          {verses.map((verse) => {
            const entries = api.getLexiconForRef(verse.ref)
            const showEn = lang !== 'ml'
            const showMl = lang !== 'en'
            return (
              <div key={verse.ref} className="mb-3">
                {showEn && (
                  <p className="leading-relaxed text-ink">
                    <sup className="mr-1 font-display text-xs font-semibold text-gold">{verse.num}</sup>
                    <HighlightedVerseText
                      text={verse.text.en}
                      entries={entries}
                      openRootId={openRootId}
                      onToggleRoot={(id) => setOpenRootId((cur) => (cur === id ? null : id))}
                    />
                  </p>
                )}
                {showMl && (
                  <p className={`font-ml leading-relaxed text-ink/80 ${showEn ? 'mt-1' : ''}`}>
                    {!showEn && <sup className="mr-1 font-display text-xs font-semibold text-gold">{verse.num}</sup>}
                    {verse.text.ml}
                  </p>
                )}
                {entries.map((entry) => (openRootId === entry.id ? <RootCard key={entry.id} entry={entry} lang={lang} /> : null))}
              </div>
            )
          })}
        </div>
      </section>

      {/* This Week's Study */}
      <section className="card mt-4 p-6">
        <h2 className="font-display text-lg text-ink">This Week's Study</h2>
        {devotionals.length === 0 ? (
          <p className="mt-2 text-sm text-ink/50">No study has been published yet — check back soon.</p>
        ) : (
          <>
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
              {devotionals.map((d) => {
                const isSelected = selected?.id === d.id
                const pending = role !== 'member' && d.status !== 'approved'
                return (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => setSelectedId(d.id)}
                    className={[
                      'shrink-0 rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                      isSelected ? 'border-spirit bg-spirit text-paper' : 'border-mist bg-cloud text-ink/60 hover:text-ink',
                    ].join(' ')}
                  >
                    {formatDay(d.day)}
                    {pending && <span className="ml-1 text-gold">●</span>}
                  </button>
                )
              })}
            </div>

            {selected && (
              <div className="mt-4">
                {role !== 'member' && selected.status !== 'approved' && (
                  <span className="mb-2 inline-block rounded-full border border-plum/40 bg-plum/10 px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide text-plum">
                    Staff preview — {selected.status.replace('_', ' ')}
                  </span>
                )}
                <p className="font-display text-xl text-ink">
                  <Bilingual text={selected.title} lang={lang} />
                </p>
                <p className="mt-2 text-sm leading-relaxed text-ink/80">
                  <Bilingual text={selected.body} lang={lang} />
                </p>
                {selected.narratorName && (
                  <div className="mt-3 flex items-center gap-1.5 text-xs text-ink/60">
                    <Mic className="h-3.5 w-3.5 shrink-0 text-spirit" aria-hidden="true" />
                    Narrated by {selected.narratorName}
                  </div>
                )}
                <GuardrailNote className="mt-2">
                  A real voice from our team, recorded by a person — never a synthesized voice standing in for the
                  pastor.
                </GuardrailNote>
              </div>
            )}
          </>
        )}
      </section>

      {/* Today's Question + Journal */}
      <section className="card mt-4 p-6">
        <h2 className="font-display text-lg text-ink">Question for This Day</h2>
        {selectedQuestion ? (
          <p className="mt-2 text-base text-ink/90">
            <Bilingual text={selectedQuestion.prompt} lang={lang} />
          </p>
        ) : (
          <p className="mt-2 text-sm text-ink/50">No question published yet.</p>
        )}

        {selected && <JournalBox key={selected.id} refId={selected.id} userId={currentUser.id} />}
      </section>

      {/* Pastoral care guardrail */}
      {pastor && (
        <section className="card mt-4 flex items-start gap-3 p-4">
          <MessageCircle className="mt-0.5 h-5 w-5 shrink-0 text-spirit" aria-hidden="true" />
          <div>
            <p className="text-sm text-ink/80">
              Need to talk to someone, not just read something? Message <strong>{pastor.name}</strong> directly.
            </p>
            <GuardrailNote className="mt-1">
              This app never preaches or counsels on its own — care always routes to a named human, never a
              chatbot.
            </GuardrailNote>
          </div>
        </section>
      )}

      <p className="mt-3 text-center text-xs text-ink/40">{church.name.en}</p>
    </div>
  )
}
