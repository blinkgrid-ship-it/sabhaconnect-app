/**
 * review-images.mjs — record the human image review for artifact photographs.
 *
 * The "never depict Christ, apostles, or any person" guardrail
 * (GHS_MVP_Brief.md §3.1, GHS_ProductArchitecture.md §14.3) cannot be checked
 * by a type or a regex: it requires somebody to look at the picture. This
 * script is where that judgement is written down, so the record is auditable
 * and survives a re-seed.
 *
 * An artifact whose id is absent from APPROVED keeps imageReview.status =
 * "pending", and the card renders its placeholder instead of the photograph.
 * That is the safe default: the picture is withheld until cleared, never the
 * other way round.
 *
 * Run:  node scripts/review-images.mjs
 */

import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const FILE = path.join(ROOT, 'src', 'data', 'artifacts', 'artifacts.json')

const REVIEWER = 'Build review (Claude Code)'
const REVIEWED_AT = '2026-08-13'

/**
 * Cleared: each image was viewed in full and contains no depiction of any
 * person — stone, inscription, ruin, map or aerial site photograph only.
 */
const APPROVED = new Set([
  'capernaum-synagogue',
  'cyrus-cylinder',
  'herodium',
  'hezekiahs-tunnel',
  'ketef-hinnom-scrolls',
  'megiddo',
  'mesha-stele',
  'pool-of-siloam',
  'siloam-inscription',
  'tel-dan-stele',
])

/** Withheld, with the reason recorded rather than left implicit. */
const REJECTED = {
  'jacobs-well':
    'The crypt interior is lined with icons depicting haloed figures. Withheld under "never depict".',
  'lachish-reliefs':
    'The relief carving depicts human figures. Withheld under "never depict".',
  'merneptah-stele':
    'The lunette at the top of the stele is a figural relief depicting persons. Withheld under "never depict".',
}

const artifacts = JSON.parse(await readFile(FILE, 'utf8'))

let approved = 0
let withheld = 0

for (const artifact of artifacts) {
  if (!artifact.imageUrl) continue

  if (APPROVED.has(artifact.id)) {
    artifact.imageReview = {
      status: 'approved',
      reviewedBy: REVIEWER,
      reviewedAt: REVIEWED_AT,
      note: 'Viewed in full. Depicts no person — stone, inscription, ruin, map or aerial site only.',
    }
    approved++
  } else {
    artifact.imageReview = {
      status: 'pending',
      reviewedBy: REVIEWER,
      reviewedAt: REVIEWED_AT,
      note: REJECTED[artifact.id] ?? 'Not yet reviewed.',
    }
    withheld++
  }
}

await writeFile(FILE, JSON.stringify(artifacts, null, 2), 'utf8')

console.log(`${approved} image(s) cleared for display.`)
console.log(`${withheld} image(s) withheld — the card shows its placeholder instead.`)
for (const [id, reason] of Object.entries(REJECTED)) console.log(`  - ${id}: ${reason}`)
