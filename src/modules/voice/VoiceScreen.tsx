import { useRef, useState } from 'react'
import { ChevronDown, Mic, Pause, Play, Search } from 'lucide-react'
import { useDemo } from '../../demo/DemoContext'
import { api } from '../../services/api'
import { Bilingual, GuardrailNote, LangToggle, type LangMode } from '../../app/ui'
import { SILENT_CLIP_DATA_URL } from './silentClip'
import type { Sermon } from '../../types/models'

function formatTime(t: number): string {
  if (!Number.isFinite(t)) return '0:00'
  const m = Math.floor(t / 60)
  const s = Math.floor(t % 60)
    .toString()
    .padStart(2, '0')
  return `${m}:${s}`
}

function AudioPlayer({ src }: { src: string }) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)

  function togglePlay() {
    const audio = audioRef.current
    if (!audio) return
    if (isPlaying) audio.pause()
    else audio.play()
  }

  return (
    <div className="flex items-center gap-3 rounded-lg border border-mist bg-cloud px-4 py-3">
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <audio
        ref={audioRef}
        src={src}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
        onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
      />
      <button
        type="button"
        onClick={togglePlay}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-spirit text-paper transition-colors hover:bg-spirit/90"
        aria-label={isPlaying ? 'Pause' : 'Play'}
      >
        {isPlaying ? <Pause className="h-4 w-4" aria-hidden="true" /> : <Play className="ml-0.5 h-4 w-4" aria-hidden="true" />}
      </button>
      <div className="flex-1">
        <input
          type="range"
          min={0}
          max={duration || 0}
          step={0.01}
          value={currentTime}
          onChange={(e) => {
            const t = Number(e.target.value)
            if (audioRef.current) audioRef.current.currentTime = t
            setCurrentTime(t)
          }}
          className="w-full accent-spirit"
        />
        <div className="mt-1 flex justify-between text-[10px] text-ink/50">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>
    </div>
  )
}

function SermonCard({ sermon, lang, expanded, onToggle }: { sermon: Sermon; lang: LangMode; expanded: boolean; onToggle: () => void }) {
  return (
    <div className="card p-4">
      <button type="button" onClick={onToggle} className="flex w-full items-start justify-between gap-3 text-left">
        <div>
          <p className="font-display text-base text-ink">
            <Bilingual text={sermon.title} lang={lang} />
          </p>
          <p className="mt-1 text-xs text-ink/50">
            {sermon.speaker} &middot; {sermon.date}
          </p>
        </div>
        <ChevronDown className={`h-4 w-4 shrink-0 text-ink/40 transition-transform ${expanded ? 'rotate-180' : ''}`} aria-hidden="true" />
      </button>
      {expanded && (
        <div className="animate-fade-in mt-3 border-t border-mist pt-3 text-sm leading-relaxed text-ink/80">
          <Bilingual text={sermon.transcript} lang={lang} />
        </div>
      )}
    </div>
  )
}

export function VoiceScreen() {
  const { churchId, role } = useDemo()
  const [lang, setLang] = useState<LangMode>('both')
  const [featuredId, setFeaturedId] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [expandedSermonId, setExpandedSermonId] = useState<string | null>(null)

  const devotionals = [...api.getDevotionals(churchId, role)].sort((a, b) => (a.day < b.day ? -1 : 1))
  const featured = devotionals.find((d) => d.id === featuredId) ?? devotionals[devotionals.length - 1]

  const sermons = api.getSermons(churchId)
  const q = query.trim().toLowerCase()
  const filteredSermons = q
    ? sermons.filter(
        (s) => s.title.en.toLowerCase().includes(q) || s.title.ml.includes(q) || s.speaker.toLowerCase().includes(q),
      )
    : sermons

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl text-ink">The Voice</h1>
          <p className="font-ml text-sm text-ink/60">ശബ്ദം</p>
        </div>
        <LangToggle lang={lang} onChange={setLang} />
      </div>

      {/* Today's audio */}
      <section className="card mt-6 p-6">
        <h2 className="font-display text-lg text-ink">Today's Audio</h2>
        {featured ? (
          <div className="mt-3">
            {role !== 'member' && featured.status !== 'approved' && (
              <span className="mb-2 inline-block rounded-full border border-plum/40 bg-plum/10 px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide text-plum">
                Staff preview — {featured.status.replace('_', ' ')}
              </span>
            )}
            <p className="font-display text-xl text-ink">
              <Bilingual text={featured.title} lang={lang} />
            </p>
            {featured.narratorName && (
              <div className="mt-1 flex items-center gap-1.5 text-xs text-ink/60">
                <Mic className="h-3.5 w-3.5 shrink-0 text-spirit" aria-hidden="true" />
                Narrated by {featured.narratorName}
              </div>
            )}
            <div className="mt-4">
              <AudioPlayer src={SILENT_CLIP_DATA_URL} />
            </div>
            <GuardrailNote className="mt-2">
              A bundled sample clip stands in for the real recording here — never a live, synthesized voice
              reading in the pastor's place.
            </GuardrailNote>
          </div>
        ) : (
          <p className="mt-2 text-sm text-ink/50">Nothing published yet — check back soon.</p>
        )}
      </section>

      {/* Podcast list */}
      <section className="card mt-4 p-6">
        <h2 className="font-display text-lg text-ink">This Week's Episodes</h2>
        <div className="mt-3 space-y-2">
          {devotionals.length === 0 && <p className="text-sm text-ink/50">No episodes yet.</p>}
          {devotionals.map((d) => {
            const isFeatured = featured?.id === d.id
            const pending = role !== 'member' && d.status !== 'approved'
            return (
              <button
                key={d.id}
                type="button"
                onClick={() => setFeaturedId(d.id)}
                className={[
                  'flex w-full items-center justify-between gap-3 rounded-lg border px-3 py-2 text-left text-sm transition-colors',
                  isFeatured ? 'border-spirit bg-spirit/10' : 'border-mist bg-cloud hover:bg-mist/40',
                ].join(' ')}
              >
                <span className="flex items-center gap-2">
                  <Play className="h-3.5 w-3.5 shrink-0 text-spirit" aria-hidden="true" />
                  <span className="text-ink">{d.title.en}</span>
                  {pending && <span className="text-[10px] font-medium uppercase tracking-wide text-plum">pending</span>}
                </span>
                <span className="shrink-0 text-xs text-ink/40">{d.day}</span>
              </button>
            )
          })}
        </div>
      </section>

      {/* Sermon archive */}
      <section className="card mt-4 p-6">
        <h2 className="font-display text-lg text-ink">Sermon Archive</h2>
        <div className="mt-3 flex items-center gap-2 rounded-lg border border-mist bg-paper px-3 py-2">
          <Search className="h-4 w-4 shrink-0 text-ink/40" aria-hidden="true" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search sermons by title or speaker..."
            className="w-full bg-transparent text-sm text-ink placeholder:text-ink/30 focus:outline-none"
          />
        </div>
        <div className="mt-3 space-y-3">
          {filteredSermons.length === 0 ? (
            <p className="text-sm text-ink/50">No sermons match "{query}".</p>
          ) : (
            filteredSermons.map((s) => (
              <SermonCard
                key={s.id}
                sermon={s}
                lang={lang}
                expanded={expandedSermonId === s.id}
                onToggle={() => setExpandedSermonId((cur) => (cur === s.id ? null : s.id))}
              />
            ))
          )}
        </div>
      </section>
    </div>
  )
}
