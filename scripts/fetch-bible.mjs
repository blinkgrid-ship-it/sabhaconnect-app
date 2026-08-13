/**
 * fetch-bible.mjs — mirror openly-licensed verse data into this repository.
 *
 * Why this exists (GHS_ProductArchitecture.md §13.2): there is no free, no-key
 * API carrying both English and Malayalam. The commercial-safe path is openly
 * licensed verse data, mirrored into our own storage so a paid product never
 * depends on somebody else's CDN at runtime.
 *
 *   English   — World English Bible (engwebp). Public domain.
 *   Malayalam — Indian Revised Version, IRV (mal). Redistributable, attributed.
 *
 * Source: ebible.org USFM archives. USFM is used rather than the pre-made JSON
 * datasets because USFM delimits footnotes explicitly (\f ... \f*), so they can
 * be removed cleanly. The popular JSON mirrors inline footnote prose directly
 * into the verse text, which is unusable on a reading surface.
 *
 * Output (all committed, so the demo runs offline in the meeting):
 *   src/data/bible/catalogue.json      all 66 books: names EN/ML, chapter counts
 *   src/data/bible/translations.json   attribution, derived from ebible metadata
 *   src/data/bible/books/GEN.json      merged EN+ML verses
 *   src/data/bible/books/JHN.json      merged EN+ML verses
 *
 * Run:  npm run seed:bible
 */

import { createHash } from 'node:crypto'
import { inflateRawSync } from 'node:zlib'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const CACHE = path.join(ROOT, 'scripts', '.cache')
const OUT = path.join(ROOT, 'src', 'data', 'bible')

const TRANSLATIONS_CSV = 'https://ebible.org/Scriptures/translations.csv'
const usfmZipUrl = (id) => `https://ebible.org/Scriptures/${id}_usfm.zip`

/** The two editions we mirror. `lang` is the key used in Verse.text. */
const EDITIONS = [
  { lang: 'en', ebibleId: 'engwebp' },
  { lang: 'ml', ebibleId: 'mal' },
]

/**
 * Canonical 66-book order with USFM codes. Drives the Old/New rail ordering;
 * anything outside this list (deuterocanon) is ignored.
 */
const CANON = [
  ['GEN', 'OT'], ['EXO', 'OT'], ['LEV', 'OT'], ['NUM', 'OT'], ['DEU', 'OT'],
  ['JOS', 'OT'], ['JDG', 'OT'], ['RUT', 'OT'], ['1SA', 'OT'], ['2SA', 'OT'],
  ['1KI', 'OT'], ['2KI', 'OT'], ['1CH', 'OT'], ['2CH', 'OT'], ['EZR', 'OT'],
  ['NEH', 'OT'], ['EST', 'OT'], ['JOB', 'OT'], ['PSA', 'OT'], ['PRO', 'OT'],
  ['ECC', 'OT'], ['SNG', 'OT'], ['ISA', 'OT'], ['JER', 'OT'], ['LAM', 'OT'],
  ['EZK', 'OT'], ['DAN', 'OT'], ['HOS', 'OT'], ['JOL', 'OT'], ['AMO', 'OT'],
  ['OBA', 'OT'], ['JON', 'OT'], ['MIC', 'OT'], ['NAM', 'OT'], ['HAB', 'OT'],
  ['ZEP', 'OT'], ['HAG', 'OT'], ['ZEC', 'OT'], ['MAL', 'OT'],
  ['MAT', 'NT'], ['MRK', 'NT'], ['LUK', 'NT'], ['JHN', 'NT'], ['ACT', 'NT'],
  ['ROM', 'NT'], ['1CO', 'NT'], ['2CO', 'NT'], ['GAL', 'NT'], ['EPH', 'NT'],
  ['PHP', 'NT'], ['COL', 'NT'], ['1TH', 'NT'], ['2TH', 'NT'], ['1TI', 'NT'],
  ['2TI', 'NT'], ['TIT', 'NT'], ['PHM', 'NT'], ['HEB', 'NT'], ['JAS', 'NT'],
  ['1PE', 'NT'], ['2PE', 'NT'], ['1JN', 'NT'], ['2JN', 'NT'], ['3JN', 'NT'],
  ['JUD', 'NT'], ['REV', 'NT'],
]
const TESTAMENT = new Map(CANON)
const ORDER = new Map(CANON.map(([id], i) => [id, i]))

/**
 * Books whose full text we mirror.
 *
 * The architecture doc suggested bundling only a couple of books for the demo
 * (§13.3), but the whole Bible is ~9 MB of openly-licensed JSON and every book
 * is a separate lazily-loaded chunk — so a reader only ever downloads the book
 * they open. Bundling everything costs nothing at runtime and removes the
 * "not in this demo" dead end from 64 of the 66 books.
 *
 * Narrow this to a subset (e.g. ['GEN', 'JHN']) if repository size ever matters
 * more than completeness.
 */
const BUNDLED = CANON.map(([id]) => id)

// ---------------------------------------------------------------------------
// Minimal ZIP reader. Node ships DEFLATE but no archive reader, and pulling a
// dependency in for one build-time script isn't worth it.
// ---------------------------------------------------------------------------

/** @returns {Map<string, Buffer>} entry name → uncompressed bytes */
function unzip(buf) {
  const EOCD_SIG = 0x06054b50
  const CDH_SIG = 0x02014b50

  // The EOCD sits at the end, after a comment of unknown length. Scan back.
  let eocd = -1
  for (let i = buf.length - 22; i >= 0 && i > buf.length - 22 - 0xffff; i--) {
    if (buf.readUInt32LE(i) === EOCD_SIG) {
      eocd = i
      break
    }
  }
  if (eocd < 0) throw new Error('not a zip file: no end-of-central-directory record')

  const entryCount = buf.readUInt16LE(eocd + 10)
  let p = buf.readUInt32LE(eocd + 16)
  const files = new Map()

  for (let n = 0; n < entryCount; n++) {
    if (buf.readUInt32LE(p) !== CDH_SIG) throw new Error(`corrupt central directory at ${p}`)
    const method = buf.readUInt16LE(p + 10)
    const compressedSize = buf.readUInt32LE(p + 20)
    const nameLen = buf.readUInt16LE(p + 28)
    const extraLen = buf.readUInt16LE(p + 30)
    const commentLen = buf.readUInt16LE(p + 32)
    const localOffset = buf.readUInt32LE(p + 42)
    const name = buf.toString('utf8', p + 46, p + 46 + nameLen)

    // Re-read the lengths from the local header — the central directory's copy
    // is authoritative for sizes, but the local header's extra field length
    // frequently differs, and that's what positions the data.
    const lhNameLen = buf.readUInt16LE(localOffset + 26)
    const lhExtraLen = buf.readUInt16LE(localOffset + 28)
    const dataStart = localOffset + 30 + lhNameLen + lhExtraLen
    const raw = buf.subarray(dataStart, dataStart + compressedSize)

    if (!name.endsWith('/')) {
      files.set(name, method === 0 ? Buffer.from(raw) : inflateRawSync(raw))
    }

    p += 46 + nameLen + extraLen + commentLen
  }
  return files
}

// ---------------------------------------------------------------------------
// USFM → plain verse text
// ---------------------------------------------------------------------------

/**
 * Strip USFM markup down to readable prose.
 *
 * Order matters: notes must go first, complete with their contents, before any
 * generic marker stripping — otherwise footnote prose survives as body text,
 * which is exactly the defect that ruled out the JSON mirrors.
 */
export function cleanUsfm(input) {
  let s = input

  // 1. Notes and their entire contents: footnotes, endnotes, cross-references,
  //    figures. `[\s\S]` rather than the s-flag so this stays easy to read.
  s = s.replace(/\\(f|fe|x|fig|ef|ex)\b[\s\S]*?\\\1\*/g, '')
  // Unterminated note at end of a line — drop to end of line rather than leak it.
  s = s.replace(/\\(f|fe|x|fig)\b[^\n]*/g, '')

  // 2. Wordlist entries carry lemma data after a pipe: \w faith|strong="G4102"\w*
  s = s.replace(/\\\+?w\s+([^|\\]*?)(?:\|[^\\]*?)?\\\+?w\*/g, '$1')

  // 3. Remaining paired character markers keep their inner text
  //    (\nd LORD\nd*, \add he\add*, \wj words of Jesus\wj*, \qt, \tl, ...).
  //    Run repeatedly to unwind nesting.
  const paired = /\\\+?([a-z]{1,6}\d?)\s*([^\\]*?)\\\+?\1\*/g
  for (let i = 0; i < 6; i++) {
    const next = s.replace(paired, '$2')
    if (next === s) break
    s = next
  }

  // 4. Anything still marked up is a paragraph/poetry/structural marker with no
  //    reading value inside a verse (\p, \q1, \b, \nb, \m, \li1, closing \x*…).
  s = s.replace(/\\[a-z]{1,6}\d?\*?/gi, ' ')

  // 5. USFM special characters.
  s = s.replace(/~/g, ' ') // non-breaking space
  s = s.replace(/\/\//g, ' ') // discretionary line break

  // 6. Tidy whitespace and the spacing artefacts stripping leaves behind.
  s = s.replace(/\s+/g, ' ')
  s = s.replace(/\s+([,.;:!?»”’])/g, '$1')
  s = s.replace(/([«“‘])\s+/g, '$1')
  return s.trim()
}

/**
 * Parse one USFM book file.
 * @returns {{ id: string, name: string, chapters: Map<number, Map<number, string>> }}
 */
export function parseUsfmBook(text) {
  const lines = text.split(/\r?\n/)

  let id = ''
  let name = ''
  let toc1 = ''
  let heading = ''
  const chapters = new Map()

  let chapter = 0
  let verse = 0
  /** @type {string[]} */
  let buffer = []

  const flush = () => {
    if (chapter > 0 && verse > 0) {
      const cleaned = cleanUsfm(buffer.join(' '))
      if (cleaned) {
        if (!chapters.has(chapter)) chapters.set(chapter, new Map())
        const existing = chapters.get(chapter).get(verse)
        chapters.get(chapter).set(verse, existing ? `${existing} ${cleaned}` : cleaned)
      }
    }
    buffer = []
  }

  for (const line of lines) {
    let m

    if ((m = /^\\id\s+(\S+)/.exec(line))) {
      id = m[1].toUpperCase()
      continue
    }
    // \toc2 is the short book name, \toc1 the long one, \h the running header.
    if ((m = /^\\toc2\s+(.+)/.exec(line))) {
      name = cleanUsfm(m[1])
      continue
    }
    if ((m = /^\\toc1\s+(.+)/.exec(line))) {
      toc1 = cleanUsfm(m[1])
      continue
    }
    if ((m = /^\\h\s+(.+)/.exec(line))) {
      heading = cleanUsfm(m[1])
      continue
    }
    if ((m = /^\\c\s+(\d+)/.exec(line))) {
      flush()
      chapter = Number(m[1])
      verse = 0
      continue
    }
    // Section headings, references and intro material are not verse text.
    if (/^\\(s\d?|ms\d?|mt\d?|r|sr|d|sp|ip|is|iot|io\d?|ie|imt\d?|cl|cp|rem|periph)\b/.test(line)) {
      continue
    }
    if ((m = /^\\v\s+(\d+)(?:[-–]\d+)?\s*([\s\S]*)$/.exec(line))) {
      flush()
      verse = Number(m[1])
      buffer.push(m[2] ?? '')
      continue
    }
    // A continuation line belongs to the verse currently open.
    if (verse > 0) buffer.push(line)
  }
  flush()

  return { id, name: name || heading || toc1 || id, chapters }
}

// ---------------------------------------------------------------------------
// Fetch helpers
// ---------------------------------------------------------------------------

async function download(url, cacheName) {
  await mkdir(CACHE, { recursive: true })
  const cached = path.join(CACHE, cacheName)
  if (existsSync(cached)) {
    console.log(`  cached  ${cacheName}`)
    return readFile(cached)
  }
  console.log(`  GET     ${url}`)
  const res = await fetch(url, { headers: { 'User-Agent': 'vintage-script-seed/1.0' } })
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} for ${url}`)
  const buf = Buffer.from(await res.arrayBuffer())
  await writeFile(cached, buf)
  return buf
}

function parseCsv(text) {
  // ebible's CSV quotes any field containing commas or newlines.
  const rows = []
  let row = []
  let field = ''
  let quoted = false
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (quoted) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"'
          i++
        } else quoted = false
      } else field += c
    } else if (c === '"') quoted = true
    else if (c === ',') {
      row.push(field)
      field = ''
    } else if (c === '\n') {
      row.push(field.replace(/\r$/, ''))
      rows.push(row)
      row = []
      field = ''
    } else field += c
  }
  if (field || row.length) {
    row.push(field.replace(/\r$/, ''))
    rows.push(row)
  }
  const [header, ...body] = rows
  return body
    .filter((r) => r.length === header.length)
    .map((r) => Object.fromEntries(header.map((h, i) => [h, r[i]])))
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log('Mirroring openly-licensed verse data (GHS_ProductArchitecture.md §13.2)\n')

  console.log('translation metadata')
  const csv = parseCsv((await download(TRANSLATIONS_CSV, 'translations.csv')).toString('utf8'))
  const meta = new Map(csv.map((r) => [r.translationId, r]))

  /** @type {Record<string, { id, lang, name, abbrev, copyright, licence, sourceUrl }>} */
  const translations = {}
  /** @type {Map<string, { id, name, chapters }>} */
  const parsed = new Map() // `${lang}:${bookId}`

  for (const { lang, ebibleId } of EDITIONS) {
    const row = meta.get(ebibleId)
    if (!row) throw new Error(`ebible has no translation "${ebibleId}"`)
    if (String(row.Redistributable).toLowerCase() !== 'true') {
      throw new Error(`refusing to mirror "${ebibleId}": not marked redistributable`)
    }

    console.log(`\n${lang} — ${row.shortTitle || row.title}`)
    const zip = await download(usfmZipUrl(ebibleId), `${ebibleId}_usfm.zip`)
    const files = unzip(zip)

    let books = 0
    for (const [name, bytes] of files) {
      if (!/\.usfm$/i.test(name)) continue
      const book = parseUsfmBook(bytes.toString('utf8'))
      if (!TESTAMENT.has(book.id)) continue // deuterocanon / front matter
      parsed.set(`${lang}:${book.id}`, book)
      books++
    }
    console.log(`  parsed  ${books} canonical books`)

    // Attribution is derived from the source metadata, never hard-coded —
    // it is what the translation badge renders (§13.2).
    translations[lang] = {
      id: ebibleId,
      lang,
      name: row.title,
      abbrev: lang === 'en' ? 'WEB' : 'IRV MALAYALAM',
      copyright: row.Copyright || 'public domain',
      licence: /public domain/i.test(row.Copyright || '') ? 'Public domain' : 'Redistributable with attribution',
      sourceUrl: row.publicationURL || `https://ebible.org/${ebibleId}/`,
    }
  }

  // -- catalogue: every canonical book, both names, real chapter counts -------
  const catalogue = []
  for (const [bookId, testament] of CANON) {
    const en = parsed.get(`en:${bookId}`)
    const ml = parsed.get(`ml:${bookId}`)
    if (!en) {
      console.warn(`  ! missing English book ${bookId}`)
      continue
    }
    catalogue.push({
      id: bookId,
      testament,
      order: ORDER.get(bookId),
      name: { en: en.name, ml: ml?.name ?? en.name },
      chapterCount: Math.max(...en.chapters.keys()),
      bundled: BUNDLED.includes(bookId),
    })
  }

  // -- merged verse data for the bundled books -------------------------------
  await mkdir(path.join(OUT, 'books'), { recursive: true })

  let totalVerses = 0
  const mismatches = []

  for (const bookId of BUNDLED) {
    const en = parsed.get(`en:${bookId}`)
    const ml = parsed.get(`ml:${bookId}`)
    if (!en || !ml) throw new Error(`cannot bundle ${bookId}: missing one language`)

    const chapters = {}
    const chapterNums = [...en.chapters.keys()].sort((a, b) => a - b)

    for (const c of chapterNums) {
      const enV = en.chapters.get(c) ?? new Map()
      const mlV = ml.chapters.get(c) ?? new Map()
      // Alignment is by shared verse number — no fuzzy matching (§13.1).
      const nums = [...new Set([...enV.keys(), ...mlV.keys()])].sort((a, b) => a - b)

      chapters[c] = nums.map((n) => {
        const e = enV.get(n) ?? ''
        const m = mlV.get(n) ?? ''
        if (!e || !m) mismatches.push(`${bookId}.${c}.${n} missing ${!e ? 'en' : 'ml'}`)
        return { ref: `${bookId}.${c}.${n}`, num: n, text: { en: e, ml: m } }
      })
      totalVerses += nums.length
    }

    const entry = catalogue.find((b) => b.id === bookId)
    const payload = {
      bookId,
      name: entry.name,
      testament: entry.testament,
      chapterCount: entry.chapterCount,
      chapters,
    }
    const file = path.join(OUT, 'books', `${bookId}.json`)
    await writeFile(file, JSON.stringify(payload), 'utf8')
    const kb = (JSON.stringify(payload).length / 1024).toFixed(0)
    console.log(`\nbundled ${bookId}  ${chapterNums.length} chapters  ${kb} KB`)
  }

  await writeFile(path.join(OUT, 'catalogue.json'), JSON.stringify(catalogue, null, 2), 'utf8')
  await writeFile(path.join(OUT, 'translations.json'), JSON.stringify(translations, null, 2), 'utf8')

  // A checksum of what we mirrored, so a future re-run can prove it is the same
  // text rather than silently drifting under the product.
  const stamp = createHash('sha256')
    .update(JSON.stringify({ catalogue, translations }))
    .digest('hex')
    .slice(0, 16)

  console.log(`\ncatalogue     ${catalogue.length} books`)
  console.log(`bundled verses ${totalVerses}`)
  console.log(`alignment gaps ${mismatches.length}`)
  if (mismatches.length) {
    for (const m of mismatches.slice(0, 20)) console.log(`  - ${m}`)
    if (mismatches.length > 20) console.log(`  ... and ${mismatches.length - 20} more`)
  }
  console.log(`digest        ${stamp}`)
  console.log('\nDone.')
}

// Only run when invoked directly, so the parser can be unit-tested.
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((err) => {
    console.error('\nSeed failed:', err.message)
    process.exit(1)
  })
}
