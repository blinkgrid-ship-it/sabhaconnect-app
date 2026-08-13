import type { ThemeTokens } from '@/types/models'

/**
 * The default GHS theme — the theme sheet, as data.
 *
 * Tokens are written onto :root as CSS custom properties at boot, and every
 * Tailwind colour resolves through them (see tailwind.config.js). That is what
 * makes per-tenant white-labelling a data change rather than a rebuild
 * (GHS_ProductArchitecture.md §4).
 *
 * Values are `r g b` channel triplets, not hex, so Tailwind's <alpha-value>
 * placeholder keeps working — `bg-sanctuary/60` resolves correctly.
 *
 * The hex equivalents, for cross-checking against the theme sheet:
 *   sanctuary #073B2C · vespers #0B3E38 · cedar    #0F5A52
 *   brass     #C9A227 · brass-ink #B98A1E · lamp   #E7D9A8
 *   parchment #F6F1E7 · vellum  #FFFDF8 · rule     #E3DCCB
 *   ink       #1B2B26
 *
 * Three tokens are derived rather than given on the sheet, because a framed
 * shell and body copy need grounds the ten named colours do not cover:
 *   cream     #EDE7DA — the ground the parchment shell sits on
 *   ink-muted #5A6862 — body copy and metadata
 *   ink-faint #8A948E — timestamps and quiet labels
 */
export const GHS_THEME: ThemeTokens = {
  // -- chrome ---------------------------------------------------------------
  sanctuary: '7 59 44', // #073B2C
  vespers: '11 62 56', // #0B3E38
  cedar: '15 90 82', // #0F5A52

  // -- accent ---------------------------------------------------------------
  brass: '201 162 39', // #C9A227
  'brass-ink': '185 138 30', // #B98A1E
  lamp: '231 217 168', // #E7D9A8

  // -- reading surfaces -----------------------------------------------------
  cream: '237 231 218', // #EDE7DA (derived)
  parchment: '246 241 231', // #F6F1E7
  vellum: '255 253 248', // #FFFDF8

  // -- lines and type -------------------------------------------------------
  rule: '227 220 203', // #E3DCCB
  ink: '27 43 38', // #1B2B26
  'ink-muted': '90 104 98', // #5A6862 (derived)
  'ink-faint': '138 148 142', // #8A948E (derived)
}

/**
 * Write a theme onto an element as CSS variables.
 * Defaults to :root; the element parameter exists so tests can scope it.
 */
export function applyTheme(
  theme: ThemeTokens,
  el: HTMLElement | null = document.documentElement,
): void {
  if (!el) return
  for (const [token, value] of Object.entries(theme)) {
    el.style.setProperty(`--ghs-${token}`, value)
  }
}
