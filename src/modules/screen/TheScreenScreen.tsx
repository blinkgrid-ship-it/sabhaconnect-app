import { useEffect, useRef, useState } from 'react'
import { Copy, MessageCircle } from 'lucide-react'
import { useDemo } from '../../demo/DemoContext'
import { api } from '../../services/api'
import { GuardrailNote, LangToggle, useLangPreference, type LangMode } from '../../app/ui'
import type { Localized, Verse } from '../../types/models'

// Literal hex values (not the CSS custom properties from src/index.css) —
// these cards are rasterized to an offscreen <canvas> for the "copy image"
// action, which has no access to the page's stylesheet/CSS variables.
const TOKENS = {
  ink: '#1f2a37',
  spirit: '#1f6f5c',
  gold: '#b7791f',
  plum: '#6b5b95',
  paper: '#faf7f0',
  cloud: '#f2ede1',
  mist: '#e5ddca',
}

const CARD_W = 720
const CARD_H = 900

interface CardSpec {
  id: string
  kindLabel: string
  quote: Localized
  attribution: string
  variant: 0 | 1 | 2
  /** Set only as a last-resort fallback when the grid can't be padded to an even count. */
  spanFull?: boolean
}

/** Stable per-calendar-day pick from a list — matches the pattern in Today/The Word. */
function dateSeedIndex(length: number, date = new Date()): number {
  if (length <= 0) return 0
  const key = date.toISOString().slice(0, 10)
  let hash = 0
  for (const ch of key) hash = (hash * 31 + ch.charCodeAt(0)) % 997
  return hash % length
}

/** A second, distinct date-seeded verse — used to pad the grid to an even count. Scripture is
 *  never gated by approval, so it's always safe filler (see guardrail #6, never paywalled). */
function pickSecondaryVerse(verses: Verse[], usedRefs: Set<string>): Verse | undefined {
  if (verses.length === 0) return undefined
  const start = dateSeedIndex(verses.length)
  for (let offset = 1; offset <= verses.length; offset++) {
    const candidate = verses[(start + offset) % verses.length]
    if (!usedRefs.has(candidate.ref)) return candidate
  }
  return undefined
}

function truncate(text: string, max: number): string {
  if (text.length <= max) return text
  const cut = text.slice(0, max)
  const lastSpace = cut.lastIndexOf(' ')
  return `${cut.slice(0, lastSpace > 0 ? lastSpace : max)}…`
}

function wrapCanvasText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(/\s+/).filter(Boolean)
  const lines: string[] = []
  let line = ''
  for (const word of words) {
    const test = line ? `${line} ${word}` : word
    if (line && ctx.measureText(test).width > maxWidth) {
      lines.push(line)
      line = word
    } else {
      line = test
    }
  }
  if (line) lines.push(line)
  return lines
}

/** Abstract, typography-only backdrops — landscapes/shapes/light, never a photo or a person. */
function paintBackground(ctx: CanvasRenderingContext2D, variant: 0 | 1 | 2) {
  if (variant === 0) {
    const sky = ctx.createLinearGradient(0, 0, 0, CARD_H)
    sky.addColorStop(0, TOKENS.spirit)
    sky.addColorStop(1, TOKENS.ink)
    ctx.fillStyle = sky
    ctx.fillRect(0, 0, CARD_W, CARD_H)
    ctx.fillStyle = TOKENS.gold
    ctx.globalAlpha = 0.85
    ctx.beginPath()
    ctx.arc(CARD_W / 2, 210, 76, 0, Math.PI * 2)
    ctx.fill()
    ctx.globalAlpha = 1
    ctx.fillStyle = TOKENS.mist
    ctx.beginPath()
    ctx.moveTo(0, 340)
    ctx.lineTo(160, 260)
    ctx.lineTo(300, 320)
    ctx.lineTo(430, 240)
    ctx.lineTo(570, 310)
    ctx.lineTo(CARD_W, 250)
    ctx.lineTo(CARD_W, 420)
    ctx.lineTo(0, 420)
    ctx.closePath()
    ctx.globalAlpha = 0.35
    ctx.fill()
    ctx.globalAlpha = 1
    return
  }
  if (variant === 1) {
    ctx.fillStyle = TOKENS.ink
    ctx.fillRect(0, 0, CARD_W, CARD_H)
    ctx.fillStyle = TOKENS.gold
    for (let i = 0; i < 60; i++) {
      const x = (i * 119 + 37) % CARD_W
      const y = (i * 83 + 21) % (CARD_H * 0.55)
      const r = i % 5 === 0 ? 3.2 : 1.6
      ctx.globalAlpha = i % 3 === 0 ? 0.9 : 0.5
      ctx.beginPath()
      ctx.arc(x, y, r, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.globalAlpha = 1
    ctx.fillStyle = TOKENS.plum
    ctx.beginPath()
    ctx.arc(CARD_W - 130, 130, 54, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = TOKENS.ink
    ctx.beginPath()
    ctx.arc(CARD_W - 150, 116, 48, 0, Math.PI * 2)
    ctx.fill()
    return
  }
  ctx.fillStyle = TOKENS.cloud
  ctx.fillRect(0, 0, CARD_W, CARD_H)
  ctx.fillStyle = TOKENS.gold
  ctx.fillRect(0, 300, CARD_W, 10)
  ctx.strokeStyle = TOKENS.mist
  ctx.lineWidth = 2
  for (let i = 0; i < 6; i++) {
    ctx.beginPath()
    ctx.moveTo(0, 400 + i * 70)
    ctx.lineTo(CARD_W, 380 + i * 70)
    ctx.stroke()
  }
}

function drawCard(canvas: HTMLCanvasElement, spec: CardSpec, lang: LangMode, churchNameEn: string) {
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  canvas.width = CARD_W
  canvas.height = CARD_H

  paintBackground(ctx, spec.variant)

  // Frosted panel so quote text stays legible over any background.
  const panelTop = 300
  ctx.fillStyle = TOKENS.ink
  ctx.globalAlpha = 0.58
  ctx.fillRect(0, panelTop, CARD_W, CARD_H - panelTop)
  ctx.globalAlpha = 1

  // Kind label pill.
  ctx.font = '600 22px Inter, ui-sans-serif, system-ui, sans-serif'
  ctx.fillStyle = TOKENS.gold
  ctx.textBaseline = 'alphabetic'
  ctx.fillText(spec.kindLabel.toUpperCase(), 48, panelTop + 56)

  const showEn = lang !== 'ml'
  const showMl = lang !== 'en'
  const maxWidth = CARD_W - 96
  let y = panelTop + 110

  if (showEn) {
    ctx.font = '600 34px Spectral, ui-serif, Georgia, serif'
    ctx.fillStyle = TOKENS.paper
    const lines = wrapCanvasText(ctx, `"${spec.quote.en}"`, maxWidth)
    for (const line of lines.slice(0, 6)) {
      ctx.fillText(line, 48, y)
      y += 44
    }
    y += showMl ? 16 : 0
  }

  if (showMl) {
    ctx.font = '500 26px "Noto Sans Malayalam", ui-sans-serif, system-ui, sans-serif'
    ctx.fillStyle = showEn ? 'rgba(250,247,240,0.82)' : TOKENS.paper
    const lines = wrapCanvasText(ctx, `"${spec.quote.ml}"`, maxWidth)
    for (const line of lines.slice(0, 6)) {
      ctx.fillText(line, 48, y)
      y += 38
    }
  }

  // Attribution + church name, pinned near the bottom of the panel.
  ctx.font = '500 20px Inter, ui-sans-serif, system-ui, sans-serif'
  ctx.fillStyle = 'rgba(250,247,240,0.7)'
  ctx.fillText(`— ${spec.attribution}`, 48, CARD_H - 76)
  ctx.font = '600 18px Inter, ui-sans-serif, system-ui, sans-serif'
  ctx.fillStyle = TOKENS.gold
  ctx.fillText(churchNameEn, 48, CARD_H - 42)
}

function shareTextFor(spec: CardSpec, lang: LangMode, churchNameEn: string): string {
  const lines: string[] = []
  if (lang !== 'ml') lines.push(`"${spec.quote.en}"`)
  if (lang !== 'en') lines.push(`"${spec.quote.ml}"`)
  lines.push(`— ${spec.attribution}, ${churchNameEn}`)
  return lines.join('\n\n')
}

async function copyCardImage(canvas: HTMLCanvasElement, fallbackText: string): Promise<'image' | 'text' | 'failed'> {
  try {
    const blob: Blob | null = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'))
    if (!blob) throw new Error('no blob')
    await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
    return 'image'
  } catch {
    try {
      await navigator.clipboard.writeText(fallbackText)
      return 'text'
    } catch {
      return 'failed'
    }
  }
}

const COPY_MESSAGE: Record<'image' | 'text' | 'failed', string> = {
  image: 'Card image copied — paste it anywhere.',
  text: 'Clipboard image isn\'t supported here — copied the card text instead.',
  failed: "Couldn't access the clipboard in this browser.",
}

function ShareCard({ spec, lang, churchNameEn }: { spec: CardSpec; lang: LangMode; churchNameEn: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [status, setStatus] = useState<string | null>(null)

  useEffect(() => {
    if (canvasRef.current) drawCard(canvasRef.current, spec, lang, churchNameEn)
  }, [spec, lang, churchNameEn])

  const shareText = shareTextFor(spec, lang, churchNameEn)

  function shareToWhatsApp() {
    window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank', 'noopener,noreferrer')
  }

  async function copyImage() {
    if (!canvasRef.current) return
    const result = await copyCardImage(canvasRef.current, shareText)
    setStatus(COPY_MESSAGE[result])
    window.setTimeout(() => setStatus(null), 4000)
  }

  return (
    <div className="card overflow-hidden">
      <canvas
        ref={canvasRef}
        role="img"
        aria-label={`${spec.kindLabel}: ${spec.quote.en} — ${spec.attribution}`}
        className="aspect-[4/5] w-full"
      />
      <div className="flex flex-wrap items-center gap-2 p-3">
        <button
          type="button"
          onClick={shareToWhatsApp}
          className="inline-flex min-h-11 items-center gap-1.5 rounded-lg bg-spirit px-3 py-1.5 text-xs font-medium text-paper transition-colors hover:bg-spirit/90 sm:min-h-0"
        >
          <MessageCircle className="h-3.5 w-3.5" aria-hidden="true" /> Share to WhatsApp
        </button>
        <button
          type="button"
          onClick={copyImage}
          className="inline-flex min-h-11 items-center gap-1.5 rounded-lg border border-mist bg-cloud px-3 py-1.5 text-xs font-medium text-ink/70 transition-colors hover:text-ink sm:min-h-0"
        >
          <Copy className="h-3.5 w-3.5" aria-hidden="true" /> Copy image/link
        </button>
        {status && <p className="w-full text-xs text-ink/50">{status}</p>}
      </div>
    </div>
  )
}

export function TheScreenScreen() {
  const { church, churchId, role } = useDemo()
  const [lang, setLang] = useLangPreference()
  const [verses, setVerses] = useState<Verse[] | null>(null)

  useEffect(() => {
    let cancelled = false
    api.getVersesByRef('Genesis 1').then((vs) => {
      if (!cancelled) setVerses(vs)
    })
    return () => {
      cancelled = true
    }
  }, [])

  const approvedQuestions = api.getQuestions(churchId, role).filter((q) => q.status === 'approved')
  const approvedDevotionals = api.getDevotionals(churchId, role).filter((d) => d.status === 'approved')
  const approvedFeed = api.getFeedItems(churchId, role).filter((f) => f.status === 'approved')

  const question = [...approvedQuestions].sort((a, b) => (a.day < b.day ? 1 : -1))[0]
  const devotional = [...approvedDevotionals].sort((a, b) => (a.day < b.day ? 1 : -1))[0]
  const feedItem = approvedFeed.find((f) => f.category === 'testimony') ?? approvedFeed[0]
  const verse = verses && verses.length > 0 ? verses[dateSeedIndex(verses.length)] : undefined

  const specs: CardSpec[] = []
  if (question) {
    specs.push({
      id: question.id,
      kindLabel: "Today's Question",
      quote: question.prompt,
      attribution: 'Question of the Day',
      variant: 0,
    })
  }
  if (devotional) {
    specs.push({
      id: devotional.id,
      kindLabel: 'Devotional',
      quote: { en: truncate(devotional.body.en, 180), ml: truncate(devotional.body.ml, 160) },
      attribution: truncate(devotional.title.en, 46),
      variant: 1,
    })
  }
  if (feedItem) {
    specs.push({
      id: feedItem.id,
      kindLabel: 'Good News',
      quote: { en: truncate(feedItem.body.en, 180), ml: truncate(feedItem.body.ml, 160) },
      attribution: truncate(feedItem.title.en, 46),
      variant: 2,
    })
  }
  if (verse) {
    specs.push({
      id: verse.ref,
      kindLabel: 'Scripture',
      quote: verse.text,
      attribution: `${verse.ref} · WEB / Malayalam OV`,
      variant: 0,
    })
  }

  // Never leave a single card orphaned on its own row: pad odd counts with one
  // more scripture card first (scripture is inexhaustible and never gated by
  // review status), and only as a last resort — e.g. verses haven't loaded yet
  // — make the final card span the row so it doesn't read as a stray half-tile.
  if (specs.length % 2 === 1 && verses) {
    const usedRefs = new Set(specs.map((s) => s.id))
    const extraVerse = pickSecondaryVerse(verses, usedRefs)
    if (extraVerse) {
      specs.push({
        id: extraVerse.ref,
        kindLabel: 'Scripture',
        quote: extraVerse.text,
        attribution: `${extraVerse.ref} · WEB / Malayalam OV`,
        variant: (specs.length % 3) as 0 | 1 | 2,
      })
    }
  }
  if (specs.length % 2 === 1) {
    specs[specs.length - 1] = { ...specs[specs.length - 1], spanFull: true }
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl text-ink">Shareable Cards</h1>
          <p className="font-ml text-sm text-ink/60">പങ്കിടാവുന്ന കാർഡുകൾ</p>
        </div>
        <LangToggle lang={lang} onChange={setLang} />
      </div>
      <GuardrailNote className="mt-2">
        Auto-generated from approved content only — a card never shows anything pending review, even in staff
        view. Backgrounds are always typography and abstract scenery, never a photo or likeness of a person.
      </GuardrailNote>
      <p className="mt-1 text-xs text-ink/40">
        Demo preview — WhatsApp opens with the text prefilled; "Copy image/link" copies straight to your
        clipboard. Nothing is sent automatically.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {specs.length === 0 ? (
          <p className="text-sm text-ink/50">Nothing approved yet to turn into a card — check back soon.</p>
        ) : (
          specs.map((spec) => (
            <div key={spec.id} className={spec.spanFull ? 'sm:col-span-2' : ''}>
              <ShareCard spec={spec} lang={lang} churchNameEn={church.name.en} />
            </div>
          ))
        )}
      </div>
    </div>
  )
}
