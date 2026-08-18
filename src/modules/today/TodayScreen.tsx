import { useState } from 'react'
import { ExternalLink, Landmark, Lock, Send } from 'lucide-react'
import { useDemo } from '../../demo/DemoContext'
import { api } from '../../services/api'
import { Bilingual, GuardrailNote, LangToggle, SourceTag, useLangPreference, type LangMode } from '../../app/ui'
import type { Reflection, Role, User } from '../../types/models'

/** Stable per-calendar-day pick from a list — rotates daily without a "publish date" field. */
function dateSeedIndex(length: number, date = new Date()): number {
  if (length <= 0) return 0
  const key = date.toISOString().slice(0, 10)
  let hash = 0
  for (const ch of key) hash = (hash * 31 + ch.charCodeAt(0)) % 997
  return hash % length
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span className="mb-2 inline-block rounded-full border border-plum/40 bg-plum/10 px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide text-plum">
      Staff preview — {status.replace('_', ' ')}
    </span>
  )
}

function CommentThread({ targetId, role, currentUser }: { targetId: string; role: Role; currentUser: User }) {
  const [, setTick] = useState(0)
  const [draft, setDraft] = useState('')
  const [justPosted, setJustPosted] = useState(false)

  const comments = api.listComments(targetId, role)
  const allowed = api.canComment(currentUser)

  function submit() {
    const body = draft.trim()
    if (!body) return
    api.addComment(currentUser, targetId, body)
    setDraft('')
    setJustPosted(true)
    setTick((t) => t + 1)
  }

  return (
    <div className="mt-4 border-t border-mist pt-3">
      <p className="text-xs font-medium uppercase tracking-wide text-ink/40">
        Comments{comments.length > 0 ? ` (${comments.length})` : ''}
      </p>
      <div className="mt-2 space-y-2">
        {comments.length === 0 && <p className="text-xs text-ink/40">No comments yet.</p>}
        {comments.map((c) => (
          <div key={c.id} className="rounded-lg bg-cloud px-3 py-2 text-sm text-ink/80">
            {c.status !== 'approved' && (
              <span className="mr-1.5 text-[10px] font-medium uppercase tracking-wide text-plum">pending</span>
            )}
            {c.body}
          </div>
        ))}
      </div>

      {allowed ? (
        <div className="mt-2">
          <div className="flex gap-2">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && submit()}
              placeholder="Add a comment..."
              className="min-h-11 min-w-0 flex-1 rounded-lg border border-mist bg-paper px-3 py-1.5 text-sm text-ink placeholder:text-ink/30 focus:border-spirit focus:outline-none sm:min-h-0"
            />
            <button
              type="button"
              onClick={submit}
              className="inline-flex min-h-11 shrink-0 items-center gap-1 rounded-lg bg-spirit px-3 py-1.5 text-xs font-medium text-paper transition-colors hover:bg-spirit/90 sm:min-h-0"
            >
              <Send className="h-3.5 w-3.5" aria-hidden="true" /> Post
            </button>
          </div>
          {justPosted && <p className="mt-1.5 text-xs text-ink/40">Thanks — your comment is awaiting review before it's shown publicly.</p>}
        </div>
      ) : (
        <p className="mt-2 flex items-center gap-1.5 text-xs text-ink/40">
          <Lock className="h-3 w-3 shrink-0" aria-hidden="true" /> Comments are limited to selected members.
        </p>
      )}
    </div>
  )
}

function ReflectionCard({ reflection, lang, role, currentUser }: { reflection: Reflection; lang: LangMode; role: Role; currentUser: User }) {
  return (
    <div className="card p-5">
      <span
        className={`text-[10px] font-medium uppercase tracking-wide ${reflection.isPastor ? 'text-gold' : 'text-ink/40'}`}
      >
        {reflection.isPastor ? "Pastor's Reflection" : 'Community Reflection'}
      </span>
      <p className="mt-1 text-sm font-medium text-ink">{reflection.author}</p>
      <p className="mt-2 text-sm leading-relaxed text-ink/80">
        <Bilingual text={reflection.body} lang={lang} />
      </p>
      <CommentThread targetId={reflection.id} role={role} currentUser={currentUser} />
    </div>
  )
}

function ArtifactOfTheDay() {
  const artifacts = api.getArtifacts()
  const artifact = artifacts[dateSeedIndex(artifacts.length)]
  if (!artifact) return null

  return (
    <section className="card p-6">
      <div className="flex items-center gap-2">
        <Landmark className="h-5 w-5 text-spirit" aria-hidden="true" />
        <h2 className="font-display text-lg text-ink">Artifact of the Day</h2>
      </div>
      <p className="mt-3 font-display text-xl text-ink">{artifact.name}</p>
      <p className="mt-1 text-sm leading-relaxed text-ink/75">{artifact.blurb}</p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <SourceTag>{artifact.bibleRefs.join(', ')}</SourceTag>
        <a
          href={artifact.sourceUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 text-xs font-medium text-spirit hover:underline"
        >
          <ExternalLink className="h-3 w-3" aria-hidden="true" /> Source: Wikipedia
        </a>
      </div>
    </section>
  )
}

export function TodayScreen() {
  const { church, churchId, role, currentUser } = useDemo()
  const [lang, setLang] = useLangPreference()

  const questions = [...api.getQuestions(churchId, role)].sort((a, b) => (a.day < b.day ? 1 : -1))
  const question = questions[0]

  const reflections = api.getReflections(churchId)
  const pastorReflection = reflections.find((r) => r.isPastor)
  const communityReflections = reflections.filter((r) => !r.isPastor)

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl text-ink">Today</h1>
          <p className="font-ml text-sm text-ink/60">ഇന്ന്</p>
        </div>
        <LangToggle lang={lang} onChange={setLang} />
      </div>
      <p className="mt-1 text-sm text-ink/50">
        {church.name.en} &middot;{' '}
        {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
      </p>

      {/* Question of the day */}
      <section className="card mt-6 p-4 sm:p-6">
        <h2 className="font-display text-lg text-ink">Question of the Day</h2>
        {question ? (
          <div className="mt-2">
            {role !== 'member' && question.status !== 'approved' && <StatusBadge status={question.status} />}
            <p className="text-base text-ink/90">
              <Bilingual text={question.prompt} lang={lang} />
            </p>
          </div>
        ) : (
          <p className="mt-2 text-sm text-ink/50">No question published yet.</p>
        )}
      </section>

      {/* Reflections */}
      <section className="mt-4">
        <h2 className="font-display text-lg text-ink">Reflections</h2>
        <div className="mt-3 space-y-3">
          {pastorReflection && (
            <ReflectionCard reflection={pastorReflection} lang={lang} role={role} currentUser={currentUser} />
          )}
          {communityReflections.length === 0 && !pastorReflection ? (
            <p className="text-sm text-ink/50">No reflections shared yet.</p>
          ) : (
            communityReflections.map((r) => (
              <ReflectionCard key={r.id} reflection={r} lang={lang} role={role} currentUser={currentUser} />
            ))
          )}
        </div>
        <GuardrailNote className="mt-3">
          Comments are gated by account, not by content — switching the demo user shows the gate itself, not a
          filter on what's said.
        </GuardrailNote>
      </section>

      {/* Artifact of the day */}
      <div className="mt-4">
        <ArtifactOfTheDay />
      </div>
    </div>
  )
}
