import { useState } from 'react'
import type { ReactNode } from 'react'
import { CheckCircle2, PauseCircle, XCircle } from 'lucide-react'
import { useDemo } from '../../demo/DemoContext'
import { api } from '../../services/api'
import { GuardrailNoteDark } from '../../app/ui'
import type { DraftableKind, ReviewableKind } from '../../services/api'
import type { ReviewStatus } from '../../types/models'

const KIND_LABEL: Record<ReviewableKind, string> = {
  devotional: 'Devotional',
  question: 'Question',
  feedItem: 'Feed Item',
  prayerRequest: 'Prayer Request',
  videoProject: 'Video',
  comment: 'Comment',
}

function StatusPill({ status }: { status: ReviewStatus }) {
  const label = status.replace('_', ' ')
  const cls =
    status === 'pending_review'
      ? 'border-gold/50 text-gold'
      : status === 'draft'
        ? 'border-paper/30 text-paper/60'
        : 'border-paper/30 text-paper/60'
  return (
    <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${cls}`}>
      {label}
    </span>
  )
}

function QueueRow({
  kind,
  status,
  title,
  source,
  onApprove,
  onHold,
  onRemove,
}: {
  kind: ReviewableKind
  status: ReviewStatus
  title: ReactNode
  source: ReactNode
  onApprove: () => void
  onHold: () => void
  onRemove: () => void
}) {
  return (
    <div className="rounded-lg border border-paper/15 bg-paper/5 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <span className="text-[10px] font-medium uppercase tracking-wide text-gold">{KIND_LABEL[kind]}</span>
          <p className="mt-0.5 truncate font-display text-base text-paper">{title}</p>
          <p className="mt-1 text-xs text-paper/60">{source}</p>
        </div>
        <StatusPill status={status} />
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onApprove}
          className="inline-flex items-center gap-1 rounded-md bg-spirit px-3 py-1.5 text-xs font-medium text-paper transition-colors hover:bg-spirit/90"
        >
          <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" /> Approve
        </button>
        <button
          type="button"
          onClick={onHold}
          className="inline-flex items-center gap-1 rounded-md border border-gold/50 px-3 py-1.5 text-xs font-medium text-gold transition-colors hover:bg-gold/10"
        >
          <PauseCircle className="h-3.5 w-3.5" aria-hidden="true" /> Hold
        </button>
        <button
          type="button"
          onClick={onRemove}
          className="inline-flex items-center gap-1 rounded-md border border-plum/50 px-3 py-1.5 text-xs font-medium text-plum transition-colors hover:bg-plum/10"
        >
          <XCircle className="h-3.5 w-3.5" aria-hidden="true" /> Remove
        </button>
      </div>
    </div>
  )
}

function EmptyRow() {
  return <p className="rounded-lg border border-dashed border-paper/15 p-4 text-sm text-paper/40">Nothing waiting here.</p>
}

function ComposeForm({ churchId, onCreated }: { churchId: string; onCreated: () => void }) {
  const [kind, setKind] = useState<DraftableKind>('devotional')
  const [titleEn, setTitleEn] = useState('')
  const [titleMl, setTitleMl] = useState('')
  const [bodyEn, setBodyEn] = useState('')
  const [bodyMl, setBodyMl] = useState('')
  const [day, setDay] = useState('')
  const [sourceSermonId, setSourceSermonId] = useState('')
  const [narratorName, setNarratorName] = useState('')
  const [source, setSource] = useState('')
  const [category, setCategory] = useState('')

  const sermons = api.getSermons(churchId)

  function reset() {
    setTitleEn('')
    setTitleMl('')
    setBodyEn('')
    setBodyMl('')
    setDay('')
    setSourceSermonId('')
    setNarratorName('')
    setSource('')
    setCategory('')
  }

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (kind === 'devotional') {
      api.createDraft('devotional', {
        churchId,
        title: { en: titleEn, ml: titleMl },
        body: { en: bodyEn, ml: bodyMl },
        day,
        sourceSermonId: sourceSermonId || undefined,
        narratorName: narratorName || undefined,
      })
    } else if (kind === 'question') {
      api.createDraft('question', {
        churchId,
        prompt: { en: titleEn, ml: titleMl },
        day,
        sourceSermonId: sourceSermonId || undefined,
      })
    } else {
      api.createDraft('feedItem', {
        churchId,
        title: { en: titleEn, ml: titleMl },
        body: { en: bodyEn, ml: bodyMl },
        source,
        category,
      })
    }
    reset()
    onCreated()
  }

  const inputCls =
    'mt-1 w-full rounded-md border border-paper/20 bg-paper/5 px-3 py-1.5 text-sm text-paper placeholder:text-paper/30 focus:border-gold focus:outline-none'
  const labelCls = 'text-xs font-medium uppercase tracking-wide text-paper/50'

  return (
    <form onSubmit={submit} className="space-y-3">
      <div>
        <label className={labelCls}>Kind</label>
        <select
          value={kind}
          onChange={(e) => setKind(e.target.value as DraftableKind)}
          className={inputCls}
        >
          <option value="devotional">Devotional</option>
          <option value="question">Question</option>
          <option value="feedItem">Feed Item</option>
        </select>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className={labelCls}>{kind === 'question' ? 'Prompt (EN)' : 'Title (EN)'}</label>
          <input value={titleEn} onChange={(e) => setTitleEn(e.target.value)} required className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>{kind === 'question' ? 'Prompt (ML)' : 'Title (ML)'}</label>
          <input value={titleMl} onChange={(e) => setTitleMl(e.target.value)} required className={`font-ml ${inputCls}`} />
        </div>
      </div>

      {kind !== 'question' && (
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className={labelCls}>Body (EN)</label>
            <textarea value={bodyEn} onChange={(e) => setBodyEn(e.target.value)} required rows={2} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Body (ML)</label>
            <textarea value={bodyMl} onChange={(e) => setBodyMl(e.target.value)} required rows={2} className={`font-ml ${inputCls}`} />
          </div>
        </div>
      )}

      {kind !== 'feedItem' && (
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className={labelCls}>Day</label>
            <input type="date" value={day} onChange={(e) => setDay(e.target.value)} required className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Drafted from sermon</label>
            <select value={sourceSermonId} onChange={(e) => setSourceSermonId(e.target.value)} className={inputCls}>
              <option value="">No linked sermon</option>
              {sermons.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title.en}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {kind === 'devotional' && (
        <div>
          <label className={labelCls}>Narrator name</label>
          <input value={narratorName} onChange={(e) => setNarratorName(e.target.value)} className={inputCls} placeholder="A real person's name" />
        </div>
      )}

      {kind === 'feedItem' && (
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className={labelCls}>Source</label>
            <input value={source} onChange={(e) => setSource(e.target.value)} required className={inputCls} placeholder="e.g. member-submission" />
          </div>
          <div>
            <label className={labelCls}>Category</label>
            <input value={category} onChange={(e) => setCategory(e.target.value)} required className={inputCls} placeholder="e.g. testimony" />
          </div>
        </div>
      )}

      <button
        type="submit"
        className="rounded-md bg-gold px-4 py-1.5 text-sm font-medium text-ink transition-colors hover:bg-gold/90"
      >
        Create draft
      </button>
      <GuardrailNoteDark>New drafts enter pending review — nothing here reaches a member until a reviewer approves it.</GuardrailNoteDark>
    </form>
  )
}

export function ContentStudio() {
  const { churchId, role } = useDemo()
  const [, setTick] = useState(0)
  const refresh = () => setTick((t) => t + 1)

  const queueStatuses: ReviewStatus[] = ['draft', 'pending_review']

  const devotionals = api.getDevotionals(churchId, role).filter((d) => queueStatuses.includes(d.status))
  const questions = api.getQuestions(churchId, role).filter((q) => queueStatuses.includes(q.status))
  const feedItems = api.getFeedItems(churchId, role).filter((f) => queueStatuses.includes(f.status))

  function sermonSource(sourceSermonId: string | undefined) {
    if (!sourceSermonId) return 'No linked sermon'
    const sermon = api.getSermon(sourceSermonId)
    return sermon ? `Drafted from: ${sermon.title.en}` : 'No linked sermon'
  }

  function act(kind: ReviewableKind, id: string, status: ReviewStatus) {
    api.setReviewStatus(kind, id, status)
    refresh()
  }

  return (
    <div className="rounded-xl bg-ink p-6 text-paper shadow-soft">
      <header>
        <h1 className="font-display text-2xl text-paper">Content Studio</h1>
        <p className="mt-1 text-sm text-paper/60">
          Nothing reaches a member unreviewed. Approve, hold, or remove what's waiting below.
        </p>
      </header>

      <section className="mt-6">
        <h2 className="font-display text-lg text-paper">Devotionals</h2>
        <div className="mt-3 space-y-3">
          {devotionals.length === 0 ? (
            <EmptyRow />
          ) : (
            devotionals.map((d) => (
              <QueueRow
                key={d.id}
                kind="devotional"
                status={d.status}
                title={`${d.title.en} — ${d.title.ml}`}
                source={sermonSource(d.sourceSermonId)}
                onApprove={() => act('devotional', d.id, 'approved')}
                onHold={() => act('devotional', d.id, 'held')}
                onRemove={() => act('devotional', d.id, 'removed')}
              />
            ))
          )}
        </div>
      </section>

      <section className="mt-6">
        <h2 className="font-display text-lg text-paper">Questions</h2>
        <div className="mt-3 space-y-3">
          {questions.length === 0 ? (
            <EmptyRow />
          ) : (
            questions.map((q) => (
              <QueueRow
                key={q.id}
                kind="question"
                status={q.status}
                title={`${q.prompt.en} — ${q.prompt.ml}`}
                source={sermonSource(q.sourceSermonId)}
                onApprove={() => act('question', q.id, 'approved')}
                onHold={() => act('question', q.id, 'held')}
                onRemove={() => act('question', q.id, 'removed')}
              />
            ))
          )}
        </div>
      </section>

      <section className="mt-6">
        <h2 className="font-display text-lg text-paper">Feed Items</h2>
        <div className="mt-3 space-y-3">
          {feedItems.length === 0 ? (
            <EmptyRow />
          ) : (
            feedItems.map((f) => (
              <QueueRow
                key={f.id}
                kind="feedItem"
                status={f.status}
                title={`${f.title.en} — ${f.title.ml}`}
                source={`Source: ${f.source}`}
                onApprove={() => act('feedItem', f.id, 'approved')}
                onHold={() => act('feedItem', f.id, 'held')}
                onRemove={() => act('feedItem', f.id, 'removed')}
              />
            ))
          )}
        </div>
      </section>

      <section className="mt-8 border-t border-paper/10 pt-6">
        <h2 className="font-display text-lg text-paper">Compose a Draft</h2>
        <div className="mt-3">
          <ComposeForm churchId={churchId} onCreated={refresh} />
        </div>
      </section>
    </div>
  )
}
