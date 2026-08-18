import { useState } from 'react'
import type { ReactNode } from 'react'
import { DoorOpen, HeartHandshake, Lock, LogOut, MessageCircle, Users, Wallet } from 'lucide-react'
import { useDemo } from '../../demo/DemoContext'
import { api } from '../../services/api'
import { Bilingual, GuardrailNote, LangToggle, useLangPreference, type LangMode } from '../../app/ui'
import type { PrayerRequest } from '../../types/models'

type TabKey = 'rooms' | 'wall' | 'groups' | 'care' | 'giving'

const TABS: { key: TabKey; label: string; icon: typeof DoorOpen }[] = [
  { key: 'rooms', label: 'Prayer Rooms', icon: DoorOpen },
  { key: 'wall', label: 'Prayer Wall', icon: HeartHandshake },
  { key: 'groups', label: 'Small Groups', icon: Users },
  { key: 'care', label: 'Pastoral Care', icon: MessageCircle },
  { key: 'giving', label: 'Giving', icon: Wallet },
]

function TabBar({ tab, onChange }: { tab: TabKey; onChange: (t: TabKey) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {TABS.map((t) => {
        const Icon = t.icon
        const active = tab === t.key
        return (
          <button
            key={t.key}
            type="button"
            onClick={() => onChange(t.key)}
            className={[
              'inline-flex min-h-11 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors sm:min-h-0',
              active ? 'border-spirit bg-spirit text-paper' : 'border-mist bg-cloud text-ink/60 hover:text-ink',
            ].join(' ')}
          >
            <Icon className="h-3.5 w-3.5" aria-hidden="true" />
            {t.label}
          </button>
        )
      })}
    </div>
  )
}

function NotEnabled({ children }: { children: ReactNode }) {
  return (
    <div className="card flex items-start gap-3 p-6">
      <Lock className="mt-0.5 h-5 w-5 shrink-0 text-plum" aria-hidden="true" />
      <p className="text-sm text-ink/70">{children}</p>
    </div>
  )
}

function PrayerRoomsTab({
  churchId,
  role,
  enteredRoomId,
  onEnter,
}: {
  churchId: string
  role: ReturnType<typeof useDemo>['role']
  enteredRoomId: string | null
  onEnter: (roomId: string) => void
}) {
  const rooms = api.getPrayerRooms(churchId)
  const requests = api.getPrayerRequests(churchId, role)

  return (
    <div className="mt-4">
      <GuardrailNote className="mb-3">Prayer is always free here — no sign-in tier or payment ever gates it.</GuardrailNote>
      <div className="grid gap-3 sm:grid-cols-2">
      {rooms.map((room) => {
        const count = requests.filter((r) => r.roomId === room.id).length
        const isEntered = enteredRoomId === room.id
        return (
          <div key={room.id} className="card p-4">
            <p className="font-display text-lg text-ink">{room.name.en}</p>
            <p className="font-ml text-sm text-ink/60">{room.name.ml}</p>
            <p className="mt-2 text-xs text-ink/50">{count} request{count === 1 ? '' : 's'} shared here</p>
            <button
              type="button"
              onClick={() => onEnter(room.id)}
              className={[
                'mt-3 inline-flex min-h-11 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors sm:min-h-0',
                isEntered ? 'bg-spirit/20 text-spirit' : 'bg-spirit text-paper hover:bg-spirit/90',
              ].join(' ')}
            >
              <DoorOpen className="h-3.5 w-3.5" aria-hidden="true" />
              {isEntered ? "You're in this room" : 'Enter room'}
            </button>
          </div>
        )
      })}
      </div>
    </div>
  )
}

function PrayerRequestCard({
  request,
  lang,
  role,
  onPray,
}: {
  request: PrayerRequest
  lang: LangMode
  role: ReturnType<typeof useDemo>['role']
  onPray: () => void
}) {
  return (
    <div className="card p-4">
      <div className="flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1 text-xs font-medium text-ink/60">
          {request.isAnonymous && <Lock className="h-3 w-3" aria-hidden="true" />}
          {request.requesterName}
        </span>
        <span className="text-[10px] uppercase tracking-wide text-ink/40">{new Date(request.createdAt).toLocaleDateString()}</span>
      </div>
      {role !== 'member' && request.status !== 'approved' && (
        <span className="mt-2 inline-block rounded-full border border-plum/40 bg-plum/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-plum">
          Staff preview — {request.status.replace('_', ' ')}
        </span>
      )}
      <p className="mt-2 text-sm leading-relaxed text-ink/80">
        <Bilingual text={request.body} lang={lang} />
      </p>
      <button
        type="button"
        onClick={onPray}
        className="mt-3 inline-flex min-h-11 items-center gap-1.5 rounded-full border border-spirit/40 px-3 py-1 text-xs font-medium text-spirit transition-colors hover:bg-spirit/10 sm:min-h-0"
      >
        <HeartHandshake className="h-3.5 w-3.5" aria-hidden="true" /> I prayed &middot; {request.prayerCount}
      </button>
    </div>
  )
}

function PrayerWallTab({
  churchId,
  role,
  lang,
  enteredRoomId,
  onLeave,
}: {
  churchId: string
  role: ReturnType<typeof useDemo>['role']
  lang: LangMode
  enteredRoomId: string | null
  onLeave: () => void
}) {
  const [, setTick] = useState(0)
  const rooms = api.getPrayerRooms(churchId)
  const room = rooms.find((r) => r.id === enteredRoomId)
  const requests = api
    .getPrayerRequests(churchId, role)
    .filter((r) => !enteredRoomId || r.roomId === enteredRoomId)

  function pray(id: string) {
    api.prayForRequest(id)
    setTick((t) => t + 1)
  }

  return (
    <div className="mt-4">
      {room ? (
        <div className="mb-3 flex items-center justify-between rounded-lg border border-spirit/30 bg-spirit/5 px-3 py-2 text-sm text-ink/70">
          <span>
            Praying in <strong>{room.name.en}</strong>
          </span>
          <button type="button" onClick={onLeave} className="inline-flex min-h-11 items-center gap-1 text-xs text-ink/50 hover:text-ink sm:min-h-0">
            <LogOut className="h-3.5 w-3.5" aria-hidden="true" /> Leave room
          </button>
        </div>
      ) : (
        <p className="mb-3 text-xs text-ink/50">Showing requests from every room. Enter a room to focus on one.</p>
      )}
      <GuardrailNote className="mb-3">
        Anonymous requests stay anonymous here — only a lock badge shows, never a name.
      </GuardrailNote>
      <div className="space-y-3">
        {requests.length === 0 ? (
          <p className="text-sm text-ink/50">No requests here yet.</p>
        ) : (
          requests.map((r) => <PrayerRequestCard key={r.id} request={r} lang={lang} role={role} onPray={() => pray(r.id)} />)
        )}
      </div>
    </div>
  )
}

function SmallGroupsTab({ churchId }: { churchId: string }) {
  const groups = api.getSmallGroups(churchId)
  return (
    <div className="mt-4 grid gap-3 sm:grid-cols-2">
      {groups.length === 0 ? (
        <p className="text-sm text-ink/50">No small groups listed yet.</p>
      ) : (
        groups.map((g) => (
          <div key={g.id} className="card p-4">
            <p className="font-display text-lg text-ink">{g.name.en}</p>
            <p className="font-ml text-sm text-ink/60">{g.name.ml}</p>
            <dl className="mt-2 space-y-1 text-xs text-ink/60">
              <div>
                <dt className="inline font-medium text-ink/70">Leader: </dt>
                <dd className="inline">{g.leaderName}</dd>
              </div>
              <div>
                <dt className="inline font-medium text-ink/70">Meets: </dt>
                <dd className="inline">
                  {g.meetingDay}s, {g.meetingTime}
                </dd>
              </div>
              <div>
                <dt className="inline font-medium text-ink/70">Where: </dt>
                <dd className="inline">{g.location}</dd>
              </div>
              <div>
                <dt className="inline font-medium text-ink/70">Members: </dt>
                <dd className="inline">{g.memberCount}</dd>
              </div>
            </dl>
          </div>
        ))
      )}
    </div>
  )
}

function PastoralCareTab({ churchId }: { churchId: string }) {
  const pastor = api.findUser(churchId, 'pastor')
  const [note, setNote] = useState('')
  const [sent, setSent] = useState(false)

  if (!pastor) return <NotEnabled>No pastoral contact is set up for this church yet.</NotEnabled>

  if (sent) {
    return (
      <div className="card animate-fade-in mt-4 p-6">
        <p className="font-display text-lg text-ink">Sent to {pastor.name}</p>
        <p className="mt-1 text-sm text-ink/70">They'll reach out to you directly — usually within a day or two.</p>
        <GuardrailNote className="mt-2">This is never answered by a chatbot — a real person on staff sees it.</GuardrailNote>
      </div>
    )
  }

  return (
    <div className="card mt-4 p-4 sm:p-6">
      <p className="text-sm text-ink/80">
        Need to talk to someone? This goes straight to <strong>{pastor.name}</strong>, never an automated reply.
      </p>
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        rows={4}
        placeholder="Share as much or as little as you'd like..."
        className="mt-3 w-full rounded-lg border border-mist bg-paper p-3 text-sm text-ink placeholder:text-ink/30 focus:border-spirit focus:outline-none"
      />
      <button
        type="button"
        disabled={!note.trim()}
        onClick={() => setSent(true)}
        className="mt-3 min-h-11 rounded-lg bg-spirit px-4 py-1.5 text-sm font-medium text-paper transition-colors hover:bg-spirit/90 disabled:cursor-not-allowed disabled:opacity-40 sm:min-h-0"
      >
        Send to {pastor.name}
      </button>
      <GuardrailNote className="mt-3">
        This app never preaches or counsels on its own — every request routes to a named human.
      </GuardrailNote>
    </div>
  )
}

function GivingTab({ churchId, enabled }: { churchId: string; enabled: boolean }) {
  if (!enabled) return <NotEnabled>Giving isn't set up for this church yet.</NotEnabled>

  const funds = api.getGivingFunds(churchId)
  return (
    <div className="mt-4 space-y-3">
      <GuardrailNote>UI only — nothing here is ever charged to your account. No payment is processed.</GuardrailNote>
      {funds.map((fund) => {
        const pct = fund.goalAmount ? Math.min(100, Math.round((fund.raisedAmount / fund.goalAmount) * 100)) : null
        return (
          <div key={fund.id} className="card p-4">
            <p className="font-display text-lg text-ink">{fund.name.en}</p>
            {fund.description && <p className="mt-1 text-sm text-ink/70">{fund.description.en}</p>}
            <div className="mt-3">
              <div className="h-2 overflow-hidden rounded-full bg-mist">
                <div className="h-full rounded-full bg-gold" style={{ width: `${pct ?? 0}%` }} />
              </div>
              <p className="mt-1 text-xs text-ink/50">
                ${fund.raisedAmount.toLocaleString()} raised{fund.goalAmount ? ` of $${fund.goalAmount.toLocaleString()} goal` : ''}
              </p>
            </div>
            <button
              type="button"
              disabled
              title="Preview only — no payment is processed"
              className="mt-3 min-h-11 cursor-not-allowed rounded-lg border border-mist bg-cloud px-4 py-1.5 text-sm font-medium text-ink/40 sm:min-h-0"
            >
              Give (preview only)
            </button>
          </div>
        )
      })}
    </div>
  )
}

export function AssemblyScreen() {
  const { church, churchId, role } = useDemo()
  const [lang, setLang] = useLangPreference()
  const [tab, setTab] = useState<TabKey>('rooms')
  const [enteredRoomId, setEnteredRoomId] = useState<string | null>(null)

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl text-ink">The Assembly</h1>
          <p className="font-ml text-sm text-ink/60">സഭ</p>
        </div>
        <LangToggle lang={lang} onChange={setLang} />
      </div>

      <div className="mt-4">
        <TabBar tab={tab} onChange={setTab} />
      </div>

      {tab === 'rooms' && (
        <PrayerRoomsTab
          churchId={churchId}
          role={role}
          enteredRoomId={enteredRoomId}
          onEnter={(roomId) => {
            setEnteredRoomId(roomId)
            setTab('wall')
          }}
        />
      )}
      {tab === 'wall' && (
        <PrayerWallTab
          churchId={churchId}
          role={role}
          lang={lang}
          enteredRoomId={enteredRoomId}
          onLeave={() => setEnteredRoomId(null)}
        />
      )}
      {tab === 'groups' &&
        (church.components.includes('groups') ? (
          <SmallGroupsTab churchId={churchId} />
        ) : (
          <div className="mt-4">
            <NotEnabled>Small Groups isn't enabled for {church.name.en}.</NotEnabled>
          </div>
        ))}
      {tab === 'care' && <PastoralCareTab churchId={churchId} />}
      {tab === 'giving' && (
        <div className="mt-0">
          <GivingTab churchId={churchId} enabled={church.components.includes('giving')} />
        </div>
      )}
    </div>
  )
}
