import { useState } from 'react'
import { Clapperboard, Sparkles } from 'lucide-react'
import { useDemo } from '../../demo/DemoContext'
import { api } from '../../services/api'
import { GuardrailNote } from '../../app/ui'
import type { VideoProject } from '../../types/models'

const TOPICS = ['Creation (Genesis 1)', 'Named by God: Jacob', 'Named by God: Hagar', 'The Good Samaritan', 'Psalm 23']
const STYLES = ['Cinematic landscape', 'Typography only', 'Documentary', 'Animated'] as const
const LENGTHS = ['60 seconds', '3 minutes', '10 minutes'] as const

function posterVariant(id: string): 0 | 1 | 2 {
  const sum = [...id].reduce((acc, ch) => acc + ch.charCodeAt(0), 0)
  return (sum % 3) as 0 | 1 | 2
}

/** Poster art is always generated typography/landscape shapes — never a photo or likeness of a person. */
function PosterFrame({ title, variant }: { title: string; variant: 0 | 1 | 2 }) {
  if (variant === 0) {
    return (
      <svg viewBox="0 0 320 180" className="h-full w-full">
        <defs>
          <linearGradient id={`sky-${title}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-spirit)" />
            <stop offset="100%" stopColor="var(--color-paper)" />
          </linearGradient>
        </defs>
        <rect width="320" height="180" fill={`url(#sky-${title})`} />
        <circle cx="160" cy="110" r="34" fill="var(--color-gold)" opacity="0.85" />
        <path d="M0,150 L70,95 L130,140 L190,90 L250,135 L320,100 L320,180 L0,180 Z" fill="var(--color-mist)" />
        <path d="M0,170 L90,130 L170,165 L240,125 L320,160 L320,180 L0,180 Z" fill="var(--color-cloud)" opacity="0.9" />
        <text x="160" y="45" textAnchor="middle" fill="var(--color-paper)" style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 600 }}>
          {title}
        </text>
      </svg>
    )
  }
  if (variant === 1) {
    return (
      <svg viewBox="0 0 320 180" className="h-full w-full">
        <rect width="320" height="180" fill="var(--color-ink)" />
        {[...Array(24)].map((_, i) => (
          <circle key={i} cx={(i * 53 + 17) % 320} cy={(i * 37 + 11) % 140} r={i % 5 === 0 ? 1.6 : 0.9} fill="var(--color-gold)" opacity="0.8" />
        ))}
        <circle cx="250" cy="45" r="22" fill="var(--color-plum)" />
        <circle cx="242" cy="40" r="20" fill="var(--color-ink)" />
        <text x="160" y="150" textAnchor="middle" fill="var(--color-paper)" style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 600 }}>
          {title}
        </text>
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 320 180" className="h-full w-full">
      <rect width="320" height="180" fill="var(--color-cloud)" />
      <rect x="0" y="86" width="320" height="4" fill="var(--color-gold)" />
      <text x="24" y="80" fill="var(--color-ink)" style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 700 }}>
        {title}
      </text>
      <text x="24" y="112" fill="var(--color-ink)" opacity="0.5" style={{ fontFamily: 'var(--font-sans)', fontSize: 12, letterSpacing: 2 }}>
        SCRIPTURE FILM
      </text>
    </svg>
  )
}

function PendingBadge() {
  return (
    <span className="inline-flex items-center rounded-full border border-plum/40 bg-plum/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-plum">
      Staff preview
    </span>
  )
}

function GalleryCard({ project, isStaffPreview }: { project: VideoProject; isStaffPreview: boolean }) {
  return (
    <div className="card overflow-hidden">
      <div className="aspect-video w-full">
        <PosterFrame title={project.title} variant={posterVariant(project.id)} />
      </div>
      <div className="flex items-center justify-between gap-2 p-3">
        <p className="text-sm font-medium text-ink">{project.title}</p>
        {isStaffPreview && <PendingBadge />}
      </div>
    </div>
  )
}

interface QueuedItem {
  id: string
  topic: string
  style: (typeof STYLES)[number]
  length: (typeof LENGTHS)[number]
}

export function TheScreenScreen() {
  const { churchId, role } = useDemo()
  const projects = api.getVideoProjects(churchId, role)

  const [topic, setTopic] = useState(TOPICS[0])
  const [style, setStyle] = useState<(typeof STYLES)[number]>(STYLES[0])
  const [length, setLength] = useState<(typeof LENGTHS)[number]>(LENGTHS[0])
  const [queued, setQueued] = useState<QueuedItem[]>([])

  function submit(e: React.FormEvent) {
    e.preventDefault()
    setQueued((cur) => [{ id: `mock-${Date.now()}`, topic, style, length }, ...cur])
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div>
        <h1 className="font-display text-2xl text-ink">The Screen</h1>
        <p className="font-ml text-sm text-ink/60">സ്ക്രീൻ</p>
      </div>
      <GuardrailNote className="mt-2">
        Every poster is generated from typography and abstract scenery — never a photo or likeness of a real
        person.
      </GuardrailNote>

      <section className="mt-6">
        <h2 className="font-display text-lg text-ink">Gallery</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.length === 0 ? (
            <p className="text-sm text-ink/50">Nothing published yet.</p>
          ) : (
            projects.map((p) => (
              <GalleryCard key={p.id} project={p} isStaffPreview={role !== 'member' && p.status !== 'approved'} />
            ))
          )}
        </div>
      </section>

      <section className="card mt-6 p-6">
        <div className="flex items-center gap-2">
          <Clapperboard className="h-5 w-5 text-spirit" aria-hidden="true" />
          <h2 className="font-display text-lg text-ink">Create a Scripture Film</h2>
        </div>
        <p className="mt-1 text-sm text-ink/60">
          This is a front-end preview — nothing here triggers real video generation. Production is quoted
          separately.
        </p>

        <form onSubmit={submit} className="mt-4 grid gap-3 sm:grid-cols-3">
          <label className="text-xs font-medium uppercase tracking-wide text-ink/50">
            Topic
            <select
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="mt-1 w-full rounded-md border border-mist bg-paper px-2 py-1.5 text-sm text-ink focus:border-spirit focus:outline-none"
            >
              {TOPICS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs font-medium uppercase tracking-wide text-ink/50">
            Style
            <select
              value={style}
              onChange={(e) => setStyle(e.target.value as (typeof STYLES)[number])}
              className="mt-1 w-full rounded-md border border-mist bg-paper px-2 py-1.5 text-sm text-ink focus:border-spirit focus:outline-none"
            >
              {STYLES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs font-medium uppercase tracking-wide text-ink/50">
            Length
            <select
              value={length}
              onChange={(e) => setLength(e.target.value as (typeof LENGTHS)[number])}
              className="mt-1 w-full rounded-md border border-mist bg-paper px-2 py-1.5 text-sm text-ink focus:border-spirit focus:outline-none"
            >
              {LENGTHS.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </label>
          <button
            type="submit"
            className="inline-flex w-fit items-center gap-1.5 rounded-lg bg-gold px-4 py-1.5 text-sm font-medium text-ink transition-colors hover:bg-gold/90 sm:col-span-3"
          >
            <Sparkles className="h-4 w-4" aria-hidden="true" /> Queue preview
          </button>
        </form>

        {queued.length > 0 && (
          <div className="mt-4 space-y-2 border-t border-mist pt-4">
            {queued.map((q) => (
              <div key={q.id} className="flex items-center justify-between rounded-lg border border-mist bg-cloud px-3 py-2 text-sm">
                <span className="text-ink">
                  {q.topic} &middot; {q.style} &middot; {q.length}
                </span>
                <span className="text-[10px] font-medium uppercase tracking-wide text-plum">Preview only</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
