/**
 * GHS brand tokens — the theme sheet, expressed as Tailwind.
 *
 * Every colour resolves to a CSS custom property rather than a literal, so a
 * per-tenant theme record can repaint the whole product at runtime without a
 * rebuild — the white-label requirement in GHS_ProductArchitecture.md §4.
 * The literal values live in src/config/theme.ts.
 *
 * Channels are stored space-separated ("7 59 44") so Tailwind's <alpha-value>
 * placeholder keeps working — e.g. bg-sanctuary/40.
 *
 * The discipline the palette encodes:
 *   deep sanctuary teal carries chrome and authority;
 *   warm parchment carries reading;
 *   brass is reserved for the active state, overlines and verse numbers.
 */

/** @param {string} name */
const token = (name) => `rgb(var(--ghs-${name}) / <alpha-value>)`

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // -- chrome: teals ------------------------------------------------
        sanctuary: token('sanctuary'), // darkest; header, dark cards
        vespers: token('vespers'), // secondary bar
        cedar: token('cedar'), // interactive teal, left rules

        // -- accent: brass ------------------------------------------------
        brass: {
          DEFAULT: token('brass'),
          ink: token('brass-ink'), // brass text on light ground
        },
        lamp: token('lamp'), // brass at reading weight; on-dark accents

        // -- reading surfaces ---------------------------------------------
        cream: token('cream'), // the ground the shell sits on
        parchment: token('parchment'), // page inside the shell
        vellum: token('vellum'), // cards

        // -- lines & type -------------------------------------------------
        rule: token('rule'),
        ink: {
          DEFAULT: token('ink'),
          muted: token('ink-muted'),
          faint: token('ink-faint'),
        },
      },

      fontFamily: {
        // Scripture, display, card titles.
        display: ['Newsreader', 'Spectral', 'Georgia', 'Cambria', 'serif'],
        // Controls, metadata, comments.
        body: ['DM Sans', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        // Section labels, verse numbers, counters.
        overline: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'monospace'],
        // Malayalam, always paired with the serif English.
        malayalam: ['Noto Serif Malayalam', 'Noto Sans Malayalam', 'Manjari', 'serif'],
      },

      fontSize: {
        // The interface size from the sheet: DM Sans 13.5 / 500.
        ui: ['0.84375rem', { lineHeight: '1.5', fontWeight: '500' }],
        // The overline: JetBrains Mono 9.5 / 0.16em.
        overline: ['0.59375rem', { lineHeight: '1.4', letterSpacing: '0.16em' }],
        // Scripture: Newsreader 32 / 1.42.
        verse: ['2rem', { lineHeight: '1.42' }],
      },

      borderRadius: {
        // Radii 10 / 12 / 16 / 99.
        sm: '0.625rem',
        DEFAULT: '0.75rem',
        card: '0.75rem',
        shell: '1rem',
        full: '99px',
      },

      boxShadow: {
        // Shadows are near-absent by design: depth comes from parchment on
        // cream and a single hairline border, not from blur.
        hairline: '0 0 0 1px rgb(var(--ghs-rule) / 1)',
        card: '0 1px 1px rgb(var(--ghs-ink) / 0.015)',
        shell: '0 1px 2px rgb(var(--ghs-ink) / 0.03), 0 18px 48px -32px rgb(var(--ghs-ink) / 0.18)',
      },

      letterSpacing: {
        overline: '0.16em',
      },

      lineHeight: {
        // Malayalam gets 1.75 wherever it appears.
        malayalam: '1.75',
        reading: '1.62',
      },

      maxWidth: {
        reading: '34rem',
      },

      keyframes: {
        'fade-rise': {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },

      animation: {
        // The gentle entrance. Overridden under prefers-reduced-motion.
        'fade-rise': 'fade-rise 0.45s cubic-bezier(0.22, 1, 0.36, 1) both',
        'fade-in': 'fade-in 0.35s ease-out both',
      },
    },
  },
  plugins: [],
}
