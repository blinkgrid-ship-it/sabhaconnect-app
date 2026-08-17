import { useState } from 'react'
import { CheckCircle2, Flower2, Gift, HeartHandshake, PartyPopper, Stethoscope, UserMinus, UserPlus } from 'lucide-react'
import { useDemo } from '../../demo/DemoContext'
import { api } from '../../services/api'
import { GuardrailNote } from '../../app/ui'
import type { Reminder, ReminderKind } from '../../types/models'

const KIND_META: Record<ReminderKind, { label: string; icon: typeof UserPlus }> = {
  first_time_visitor: { label: 'Visitor follow-up', icon: UserPlus },
  prayer_follow_up: { label: 'Prayer follow-up', icon: HeartHandshake },
  hospital_or_illness: { label: 'Surgery / illness follow-up', icon: Stethoscope },
  bereavement: { label: 'Bereavement', icon: Flower2 },
  birthday: { label: 'Birthday', icon: Gift },
  anniversary: { label: 'Anniversary', icon: PartyPopper },
  stopped_attending: { label: 'Stopped attending', icon: UserMinus },
}

function ReminderCard({
  reminder,
  staff,
  assignedTo,
  onAssign,
  onMarkDone,
}: {
  reminder: Reminder
  staff: { id: string; name: string }[]
  assignedTo: string
  onAssign: (name: string) => void
  onMarkDone: () => void
}) {
  const meta = KIND_META[reminder.kind]
  const Icon = meta.icon

  return (
    <div className={`card p-4 ${reminder.done ? 'opacity-60' : ''}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-spirit/10 text-spirit">
            <Icon className="h-4 w-4" aria-hidden="true" />
          </div>
          <div>
            <span className="text-[10px] font-medium uppercase tracking-wide text-ink/40">{meta.label}</span>
            <p className="font-display text-base text-ink">{reminder.person}</p>
          </div>
        </div>
        {reminder.private && (
          <span className="shrink-0 rounded-full border border-plum/40 bg-plum/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-plum">
            Private
          </span>
        )}
      </div>

      <p className="mt-2 text-sm leading-relaxed text-ink/80">{reminder.summary}</p>
      <p className="mt-2 text-xs text-ink/40">Fired {reminder.firedOn}</p>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onMarkDone}
          disabled={reminder.done}
          className="inline-flex items-center gap-1.5 rounded-md bg-spirit px-3 py-1.5 text-xs font-medium text-paper transition-colors hover:bg-spirit/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
          {reminder.done ? 'Done' : 'Mark done'}
        </button>

        <select
          value={assignedTo}
          onChange={(e) => onAssign(e.target.value)}
          className="rounded-md border border-mist bg-cloud px-2 py-1.5 text-xs text-ink focus:border-spirit focus:outline-none"
        >
          <option value="">Assign to...</option>
          {staff.map((s) => (
            <option key={s.id} value={s.name}>
              {s.name}
            </option>
          ))}
        </select>
        {assignedTo && <span className="text-xs text-ink/50">Assigned to {assignedTo}</span>}
      </div>
    </div>
  )
}

export function WhatFallsThroughScreen() {
  const { church, churchId } = useDemo()
  const [, setTick] = useState(0)
  const [filter, setFilter] = useState<ReminderKind | 'all'>('all')
  // Assignment has no backing model field — it's intentionally local-only,
  // not written through api.*, and resets if you leave this screen.
  const [assignments, setAssignments] = useState<Record<string, string>>({})

  const staff = api.getUsers(churchId).filter((u) => u.role !== 'member')
  const reminders = api.getReminders(churchId, 'admin') // this screen is pastor/admin-only; see full private list

  const kinds = Array.from(new Set(reminders.map((r) => r.kind)))
  const filtered = filter === 'all' ? reminders : reminders.filter((r) => r.kind === filter)
  const active = filtered.filter((r) => !r.done)
  const done = filtered.filter((r) => r.done)

  function markDone(id: string) {
    api.markReminderDone(id)
    setTick((t) => t + 1)
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div>
        <h1 className="font-display text-2xl text-ink">What Falls Through</h1>
        <p className="font-ml text-sm text-ink/60">ശ്രദ്ധിക്കപ്പെടാത്തവ</p>
        <p className="mt-1 text-sm text-ink/60">
          The follow-ups a busy week could otherwise lose, for {church.name.en}.
        </p>
      </div>
      <GuardrailNote className="mt-2">
        Visible to pastoral staff only — private matters about specific people never reach the review queue or
        members.
      </GuardrailNote>

      {kinds.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={[
              'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
              filter === 'all' ? 'border-spirit bg-spirit text-paper' : 'border-mist bg-cloud text-ink/60 hover:text-ink',
            ].join(' ')}
          >
            All
          </button>
          {kinds.map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setFilter(k)}
              className={[
                'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                filter === k ? 'border-spirit bg-spirit text-paper' : 'border-mist bg-cloud text-ink/60 hover:text-ink',
              ].join(' ')}
            >
              {KIND_META[k].label}
            </button>
          ))}
        </div>
      )}

      <div className="mt-4 space-y-3">
        {active.length === 0 ? (
          <p className="text-sm text-ink/50">Nothing waiting right now.</p>
        ) : (
          active.map((r) => (
            <ReminderCard
              key={r.id}
              reminder={r}
              staff={staff}
              assignedTo={assignments[r.id] ?? ''}
              onAssign={(name) => setAssignments((cur) => ({ ...cur, [r.id]: name }))}
              onMarkDone={() => markDone(r.id)}
            />
          ))
        )}
      </div>

      {done.length > 0 && (
        <div className="mt-6">
          <h2 className="text-xs font-medium uppercase tracking-wide text-ink/40">Done this week</h2>
          <div className="mt-2 space-y-3">
            {done.map((r) => (
              <ReminderCard
                key={r.id}
                reminder={r}
                staff={staff}
                assignedTo={assignments[r.id] ?? ''}
                onAssign={(name) => setAssignments((cur) => ({ ...cur, [r.id]: name }))}
                onMarkDone={() => markDone(r.id)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
