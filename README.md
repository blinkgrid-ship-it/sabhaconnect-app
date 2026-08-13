# GHS — Today &amp; The Scroll

A branded, bilingual (English / Malayalam) daily reading home and a full Bible
reader, built to the specification in `GHS_MVP_Brief.md`,
`GHS_ProductArchitecture.md` and `GHS_ArtifactBuildGuide.md`.

Two surfaces are implemented:

- **Today** — question of the day, the pastor's reflection with gated comments,
  the archaeological artifact of the day, and a reading rhythm.
- **The Scroll** — the whole Bible in English and Malayalam, aligned verse by
  verse, in two reading modes.

---

## Quick start

```bash
npm install
```

```bash
npm run dev
```

Opens on <http://localhost:5173>. **No configuration is needed** — with no
`.env` file at all the app runs entirely from bundled data and works with no
network.

Run every check:

```bash
npm run verify
```

That chains `typecheck` → `lint` → 168 unit and integration tests.

---

## What to click

| To see | Do this |
| --- | --- |
| **The comment gate** | On Today, use the **Reading as** dropdown. Pick **John Varghese — reader only**: the comment box is replaced by "Comments are limited to selected members." Switch back to Mary Thomas and it returns. |
| **Bilingual reading** | Toggle **Both / EN / ML** in the header. Malayalam or English drops out everywhere — including the translation badge, which only ever cites what is actually on screen. |
| **Scroll mode** | On The Scroll: one verse fills the view over a faint chapter numeral. Scroll, or press ↓. |
| **Column mode** | Top right of The Scroll. Continuous verse list with thin dividers. |
| **Search** | Type `3:5` (resolves inside the open book), `John 3:16`, `Genesis`, or free text like `let there be light`. |
| **The review pipeline** | Nothing you can click — that is the point. The seed data contains a held reflection and a pending comment; neither ever appears. |
| **Chapter navigation** | The chapter strip above the reader, or ← / → arrow keys. |

---

## Architecture

One idea carries the whole thing (`GHS_ProductArchitecture.md` §1):

```
  [ React screens ]  →  src/services/api.ts  →  ┌ demo: bundled data + localStorage
                            (typed seam)        └ prod: Supabase → Postgres
```

Every screen reads and writes **only** through `api.*`. Production replaces the
bodies of those methods; the signatures and return types do not change, so no
screen is rewritten.

That rule is enforced, not merely documented:

- an ESLint `no-restricted-imports` rule fails the build if a screen imports
  `seed`, `persistence`, `demoApi`, `supabaseApi`, `supabaseClient`, `@/data/**`
  or `@supabase/supabase-js`;
- a test in `src/test/guardrails.test.ts` greps the source for the same thing,
  so it also fails `npm test`;
- both `demoApi` and `supabaseApi` are structurally type-checked against the
  `Api` interface in `api.ts`, so either one drifting from the contract is a
  compile error.

### Layout

```
src/
  types/models.ts        the data contract — source of truth for both sides
  config/                theme tokens, runtime flags
  services/
    api.ts               THE SEAM. Screens import this and nothing else.
    demoApi.ts           bundled data + localStorage
    supabaseApi.ts       Supabase
    persistence.ts       localStorage, degrades to memory
    seed/                sample content, bible catalogue + loader
  data/bible/            66 books, EN + ML, mirrored (see below)
  data/artifacts/        curated artifact cache
  lib/                   pure logic: reference parsing, rhythm maths, useAsync
  components/            shell, header, logo, bilingual text, attribution
  modules/today/         the Today page
  modules/scroll/        The Scroll
supabase/migrations/     schema, RLS policies, constraints
scripts/                 data mirroring and image review
e2e/                     Playwright, desktop + mobile
```

---

## The guardrails

Six product guardrails bind every page (`GHS_MVP_Brief.md` §5). Several are
enforced structurally rather than left to discipline:

| Guardrail | How it is enforced |
| --- | --- |
| Never preach / never counsel | `Question.authorId` and `approvedBy` are required fields; a generated question cannot be represented. A DB constraint also forbids self-approval. |
| Never imitate the pastor | A test greps all source for voice/likeness-cloning identifiers. `consent_records` exists in the schema before any such feature could. |
| Never depict Christ, apostles, or any person | `ArtifactKind` is `place \| object \| inscription \| structure` — there is no `person` member, in TypeScript **and** in the Postgres enum. Images additionally require human review (below). |
| Never uncited | `sourceUrl` is required on `Artifact` and rendered unconditionally; a CHECK constraint enforces it in SQL. Scripture attribution is derived from source metadata, never hard-coded. |
| Never unreviewed | Member-facing reads filter to `approved` in the client **and** in RLS policies. The seed contains unapproved content specifically so the filter is provable. |
| Never paywall scripture or prayer | A test asserts the reading surfaces contain no payment or entitlement code, and that scripture loads with nobody signed in. |

`src/test/guardrails.test.ts` implements the seven checks listed in
`GHS_ProductArchitecture.md` §8.

### Image review — needs your countersignature

The "never depict" guardrail cannot be checked by a type or a regex: somebody
has to look at the picture. All 13 cached artifact photographs were reviewed and
the verdicts recorded in `scripts/review-images.mjs`:

- **10 cleared** — stone, inscription, ruin, map or aerial site photography.
- **3 withheld**, and the card shows its placeholder instead:
  - `jacobs-well` — the crypt interior is lined with icons depicting haloed figures
  - `lachish-reliefs` — the relief carving depicts human figures
  - `merneptah-stele` — the lunette at the top is a figural relief

Those reviews are recorded as `Build review (Claude Code)`. **A human should
countersign them before the demo** — change `REVIEWER` in
`scripts/review-images.mjs` and re-run `node scripts/review-images.mjs`. A
re-seed never silently un-reviews a cleared image, and never auto-clears one.

---

## Data

### Bible — real, openly licensed, mirrored

`GHS_ProductArchitecture.md` §13.2 is correct that no free, no-key API carries
both English and Malayalam. This build follows its recommendation: openly
licensed verse data, mirrored into the repository so a paid product never
depends on someone else's CDN at runtime.

| | Translation | Licence |
| --- | --- | --- |
| English | World English Bible (`engwebp`) | Public domain |
| Malayalam | Indian Revised Version, IRV 2019 (`mal`) | Redistributable, attributed |

**All 66 books, both languages, 31,106 verses.** Each book is a separate lazily
loaded chunk, so opening Genesis does not download the other 65.

```bash
npm run seed:bible
```

Two findings worth carrying back into the architecture document:

1. **The suggested Malayalam source is incomplete.** `wldeh/bible-api`'s
   `ml-IN-irvmal` contains only 8 of 66 books. This build mirrors from
   **ebible.org** instead, which has the complete IRV Malayalam.
2. **USFM, not the JSON mirrors.** The popular pre-built JSON datasets weld
   footnote prose into the verse text — `"In the beginning, God1:1 The Hebrew
   word rendered “God” is…"` — which is unusable on a reading surface. USFM
   delimits notes explicitly (`\f … \f*`), so `scripts/fetch-bible.mjs` parses
   USFM and strips them. A test asserts no marker ever leaks back in.

**Alignment.** Both languages hang off one shared `book.chapter.verse` key, so
there is no fuzzy matching anywhere. 12 verses exist in only one translation —
genuine textual variants such as Acts 8:37 and the Romans 14/16 doxology
renumbering. They are enumerated explicitly in `src/test/bibleData.test.ts`, so
a *new* gap after a re-seed fails the build instead of hiding in an allowance.

### Artifacts

A curated list of biblical places and objects
(`scripts/curated-artifacts.json`), enriched from Wikipedia's public REST
summary endpoint and cached locally so the app works offline. "Of the day" is
date-seeded, so the same day always shows the same artifact.

```bash
npm run seed:artifacts   # resumable; caches summaries and images
```

### Sample content

Question of the day, reflections, comments, the church record, the four demo
users and the comment allow-list are sample content in
`src/services/seed/`. The church display name and subtitle are placeholders —
the source documents never expand "GHS". Change them in
`src/services/seed/church.ts` and the whole product re-brands, header included.

---

## Design system

The theme sheet, as code. Tokens live in `src/config/theme.ts` and are written
onto `:root` as CSS variables at boot, so a per-tenant theme record repaints the
product at runtime with no rebuild (`GHS_ProductArchitecture.md` §4).

| Token | Hex | Role |
| --- | --- | --- |
| Sanctuary | `#073B2C` | header, dark cards |
| Vespers | `#0B3E38` | secondary bar |
| Cedar | `#0F5A52` | interactive teal, attribution rules |
| Brass | `#C9A227` | **the active state only** |
| Brass ink | `#B98A1E` | brass type on light grounds |
| Lamp | `#E7D9A8` | brass at reading weight, on dark |
| Parchment | `#F6F1E7` | the page |
| Vellum | `#FFFDF8` | cards |
| Rule | `#E3DCCB` | hairlines |
| Ink | `#1B2B26` | type |

Three tokens are derived, because a framed shell and body copy need grounds the
ten named colours do not cover: `cream #EDE7DA`, `ink-muted #5A6862`,
`ink-faint #8A948E`.

**Type.** Newsreader for scripture, display and card titles. DM Sans 13.5/500
for interface. JetBrains Mono 9.5/0.16em for overlines, verse numbers and
counters. Noto Serif Malayalam for Malayalam — always **0.72× the English size
with 1.75 leading**, applied by a single `:lang(ml)` rule using `em`, so a
component sets the English size once and the ratio holds.

Radii 10 / 12 / 16 / 99. **Shadows are near-absent**: depth comes from
parchment on cream plus one hairline border.

Two rules worth keeping:

- **Brass is the active state.** If two things on a screen are brass, one is wrong.
- **A left rule marks what a person said** — a reflection, a comment — and never
  app chrome.

Fonts are bundled via `@fontsource`, not fetched from Google Fonts: a display
face that silently falls back mid-meeting would undo the brand.

---

## Configuration

Everything is optional. Copy `.env.example` to `.env` to change any of it.

| Variable | Default | Effect |
| --- | --- | --- |
| `VITE_DATA_SOURCE` | `demo` | `demo` = bundled data + localStorage. `supabase` = live backend. |
| `VITE_SUPABASE_URL` | — | Required only for `supabase`. |
| `VITE_SUPABASE_ANON_KEY` | — | Required only for `supabase`. |
| `VITE_ARTIFACT_SOURCE` | `cache` | `live` fetches artifact blurbs from Wikipedia at runtime. The image always stays the locally reviewed one. |
| `VITE_DEFAULT_CHURCH_ID` | `ghs` | Which tenant to boot as. |

Asking for `supabase` without credentials **falls back to bundled data and says
so in the interface** rather than throwing. A misconfigured `.env` must never be
able to blank the screen in front of the pastor.

### Going live

`supabase/migrations/0001_init.sql` contains the schema, the row-level security
policies and the guardrail constraints. Every row carries `church_id` and
isolation is enforced by RLS keyed off the caller's JWT — not by a `WHERE`
clause in application code. The comment gate is an RLS policy; the UI check only
produces a friendlier message than a policy rejection would.

Apply it, set the two `VITE_SUPABASE_*` values, flip `VITE_DATA_SOURCE`, and no
screen changes.

Authoring and review policies are deliberately **absent** rather than stubbed
permissively — they belong with the Content Studio surface, and an over-broad
policy written "for now" is how the never-unreviewed guarantee gets lost.

---

## Testing

```bash
npm test          # 168 unit + integration tests (Vitest)
npm run test:e2e  # 62 end-to-end tests (Playwright, desktop + mobile)
npm run verify    # typecheck + lint + unit tests
```

E2E needs browsers once:

```bash
npm run test:e2e:install
```

Coverage is deliberately weighted toward the things that would be embarrassing
to get wrong in front of the pastor: the comment gate (in the UI *and* in the
seam), approved-only filtering, verse alignment across all 66 books, footnote
cleanliness, reference parsing including hostile input, streak arithmetic across
month/year/leap boundaries, and both pages in both languages and both reading
modes at desktop and phone sizes — asserting no console errors and no sideways
scroll.

---

## What is not built

The other seven components in `GHS_DemoBuild.md` — **The Word**, **The Voice**,
**What Falls Through**, **The Assembly**, **Good News Feed**, **The Screen** and
**Content Studio** — are not implemented. The agreed scope for this build was the
two headline pages. They slot into `src/modules/<name>/` behind the same seam,
and the tenant component registry already gates them.

## Honest status

This is a **finished-looking demo**: branded, clickable, believable, running on
real openly-licensed scripture and real cached Wikipedia content, with sample
content for everything a person would have authored. It is not production.

There is no real authentication, no live AI, no TTS, no video generation, no
payments and no production reminder engine. The comment gate, the review flow and
the reading rhythm are UI plus local state in this build — each behind a seam
that makes them real without touching a screen.

The status banner that said so on-screen was removed at the founder's request;
this section is now the only place it is recorded.
