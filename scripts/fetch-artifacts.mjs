/**
 * fetch-artifacts.mjs — cache the curated artifact list for offline use.
 *
 * GHS_ProductArchitecture.md §14.3: "of the day" picks from a curated list of
 * places and objects, then fetches that article from Wikipedia's public REST
 * summary endpoint for a blurb and image, and caches the result. The demo runs
 * entirely from that cache so the meeting works offline; flipping
 * VITE_ARTIFACT_SOURCE=live uses the same seam with no screen change.
 *
 * Guardrails enforced here, not just intended:
 *   - `kind` must be place | object | inscription | structure. Never a person.
 *   - `sourceUrl` must be non-empty (CI-checked, §8).
 *   - Images are written with imageReview.status = "pending". The UI renders a
 *     placeholder until a human has actually looked at the image and confirmed
 *     it depicts no person. "Never unreviewed" applies to media too.
 *
 * The script is resumable and polite: summaries and images are cached on disk,
 * output is written after every entry, and a rate-limited request backs off
 * rather than retrying hard. An image that cannot be fetched is skipped — the
 * card has a designed placeholder, so a missing photo is a cosmetic loss, and
 * it is not worth blocking a build on somebody else's rate limiter.
 *
 * Run:  npm run seed:artifacts
 */

import { existsSync } from 'node:fs'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const CURATED = path.join(ROOT, 'scripts', 'curated-artifacts.json')
const CACHE = path.join(ROOT, 'scripts', '.cache', 'summaries')
const OUT_JSON = path.join(ROOT, 'src', 'data', 'artifacts', 'artifacts.json')
const OUT_IMAGES = path.join(ROOT, 'public', 'artifacts')

const ALLOWED_KINDS = new Set(['place', 'object', 'inscription', 'structure'])
const UA = 'vintage-script-seed/1.0 (GHS demo; curated biblical artifact list)'

/** Wikipedia sometimes asks for a 10-minute wait. Not worth it for a thumbnail. */
const MAX_BACKOFF_MS = 90_000

const SUMMARY = (title) =>
  `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title.replace(/ /g, '_'))}`

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

/**
 * Be a well-behaved client: space requests out, and back off when asked —
 * but give up rather than sleep for ten minutes.
 * @returns {Promise<Response | null>} null when rate limiting outlasted us
 */
async function politeFetch(url, { retries = 3 } = {}) {
  for (let attempt = 0; ; attempt++) {
    let res
    try {
      res = await fetch(url, { headers: { 'User-Agent': UA, Accept: 'application/json' } })
    } catch (err) {
      if (attempt >= retries) throw err
      await sleep(1500 * 2 ** attempt)
      continue
    }

    if (res.status !== 429 && res.status !== 503) return res
    if (attempt >= retries) return null

    const retryAfter = Number(res.headers.get('retry-after'))
    const suggested = Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter * 1000 : 1500 * 2 ** attempt
    const waitMs = Math.min(suggested, MAX_BACKOFF_MS)
    process.stdout.write(`(${res.status}, waiting ${Math.round(waitMs / 1000)}s) `)
    await sleep(waitMs)
  }
}

/** Fetch a page summary, caching the response so re-runs cost nothing. */
async function getSummary(entry) {
  const cached = path.join(CACHE, `${entry.id}.json`)
  if (existsSync(cached)) {
    return { data: JSON.parse(await readFile(cached, 'utf8')), fromCache: true }
  }

  await sleep(400)
  const res = await politeFetch(SUMMARY(entry.title))
  if (!res) throw new Error(`rate limited fetching "${entry.title}" — re-run to resume`)
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} for "${entry.title}"`)

  const data = await res.json()
  await writeFile(cached, JSON.stringify(data), 'utf8')
  return { data, fromCache: false }
}

/** Download the image unless we already have it. Returns a public path or null. */
async function getImage(entry, summary) {
  const remote = summary?.originalimage?.source ?? summary?.thumbnail?.source
  if (!remote) return null

  const matched = remote.match(/\.(jpe?g|png|webp)(?:$|\?)/i)?.[1]?.toLowerCase() ?? 'jpg'
  const ext = matched === 'jpeg' ? 'jpg' : matched
  const file = `${entry.id}.${ext}`
  const dest = path.join(OUT_IMAGES, file)
  const publicPath = `/artifacts/${file}`

  if (existsSync(dest)) return publicPath

  await sleep(400)
  const res = await politeFetch(remote)
  if (!res || !res.ok) return null

  await writeFile(dest, Buffer.from(await res.arrayBuffer()))
  return publicPath
}

/** Trim Wikipedia's extract to a card-sized blurb without cutting mid-sentence. */
function toBlurb(extract, limit = 340) {
  const text = (extract ?? '').replace(/\s+/g, ' ').trim()
  if (text.length <= limit) return text
  const cut = text.slice(0, limit)
  const lastStop = Math.max(cut.lastIndexOf('. '), cut.lastIndexOf('? '), cut.lastIndexOf('! '))
  return lastStop > limit * 0.5 ? cut.slice(0, lastStop + 1) : `${cut.trimEnd()}…`
}

async function main() {
  const curated = JSON.parse(await readFile(CURATED, 'utf8'))

  await mkdir(CACHE, { recursive: true })
  await mkdir(path.dirname(OUT_JSON), { recursive: true })
  await mkdir(OUT_IMAGES, { recursive: true })

  // Preserve any human image review already recorded, so re-running the seed
  // never silently un-reviews an image that a person signed off on.
  let previous = {}
  try {
    const existing = JSON.parse(await readFile(OUT_JSON, 'utf8'))
    previous = Object.fromEntries(existing.map((a) => [a.id, a]))
  } catch {
    /* first run */
  }

  const out = []
  let images = 0

  for (const entry of curated.artifacts) {
    if (!ALLOWED_KINDS.has(entry.kind)) {
      throw new Error(
        `"${entry.id}" has kind "${entry.kind}". The curated list is places and objects only ` +
          `— never a person (GHS_ProductArchitecture.md §14.3).`,
      )
    }

    process.stdout.write(`  ${entry.id.padEnd(24)}`)

    const { data: summary, fromCache } = await getSummary(entry)

    const sourceUrl =
      summary?.content_urls?.desktop?.page ??
      `https://en.wikipedia.org/wiki/${encodeURIComponent(entry.title.replace(/ /g, '_'))}`
    if (!sourceUrl) throw new Error(`"${entry.id}" resolved no sourceUrl; attribution is required (§8)`)

    const imageUrl = await getImage(entry, summary)
    if (imageUrl) images++

    const prior = previous[entry.id]
    // Only carry a prior approval forward if it was approving *this* image.
    const imageReview =
      prior?.imageReview?.status === 'approved' && prior.imageUrl === imageUrl
        ? prior.imageReview
        : {
            status: 'pending',
            reviewedBy: '',
            reviewedAt: '',
            note: 'Awaiting human confirmation that the image depicts no person.',
          }

    out.push({
      id: entry.id,
      name: summary.titles?.normalized ?? entry.title,
      kind: entry.kind,
      blurb: toBlurb(summary.extract),
      imageUrl,
      imageReview,
      sourceUrl,
      sourceLabel: 'Wikipedia',
      bibleRefs: entry.bibleRefs,
      location: entry.location,
      period: entry.period,
    })

    // Write after every entry so an interrupted run still leaves usable data.
    const sorted = [...out].sort((a, b) => a.id.localeCompare(b.id))
    await writeFile(OUT_JSON, JSON.stringify(sorted, null, 2), 'utf8')

    console.log(`${fromCache ? 'cached' : 'ok'}${imageUrl ? '  + image' : '  (no image)'}`)
  }

  const pending = out.filter((a) => a.imageUrl && a.imageReview.status !== 'approved').length
  console.log(`\n${out.length} artifacts cached, ${images} with images.`)
  if (pending) {
    console.log(
      `${pending} image(s) awaiting human review — the card shows its placeholder until\n` +
        `a person confirms no depiction of any individual, then flips imageReview.status.`,
    )
  }
}

main().catch((err) => {
  console.error('\nArtifact seed failed:', err.message)
  process.exit(1)
})
