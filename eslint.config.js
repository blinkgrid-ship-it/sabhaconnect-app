import js from '@eslint/js'
import globals from 'globals'
import tsPlugin from '@typescript-eslint/eslint-plugin'
import tsParser from '@typescript-eslint/parser'
import reactHooks from 'eslint-plugin-react-hooks'

/**
 * The rule that keeps the architecture true (GHS_ProductArchitecture.md §1, §8):
 *
 *   "screens never import seed.ts or persistence.ts directly — only api."
 *
 * If a screen reaches past the seam, the demo → production migration stops
 * being a drop-in body swap and starts being a rewrite. So it is a lint error,
 * not a convention.
 */
const SEAM_VIOLATION =
  'Screens must read through the api seam only. ' +
  "Import from '@/services/api' instead of touching the data layer directly " +
  '(GHS_ProductArchitecture.md §1).'

const dataLayerPatterns = [
  { group: ['**/services/seed', '**/services/seed/**', '@/services/seed', '@/services/seed/**'], message: SEAM_VIOLATION },
  { group: ['**/services/persistence', '@/services/persistence'], message: SEAM_VIOLATION },
  { group: ['**/services/demoApi', '@/services/demoApi'], message: SEAM_VIOLATION },
  { group: ['**/services/supabaseApi', '@/services/supabaseApi'], message: SEAM_VIOLATION },
  { group: ['**/services/supabaseClient', '@/services/supabaseClient'], message: SEAM_VIOLATION },
  { group: ['**/data/**', '@/data/**'], message: SEAM_VIOLATION },
  { group: ['@supabase/supabase-js'], message: SEAM_VIOLATION },
]

export default [
  { ignores: ['dist/**', 'coverage/**', 'node_modules/**', 'playwright-report/**', 'test-results/**'] },

  js.configs.recommended,

  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: { ...globals.browser, ...globals.es2021 },
      parser: tsParser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      'react-hooks': reactHooks,
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      'no-undef': 'off', // TypeScript already does this, and does it better.
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-explicit-any': 'error',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      eqeqeq: ['error', 'smart'],
    },
  },

  // ---------------------------------------------------------------------
  // The seam guardrail. Applies to every screen and shared component.
  // ---------------------------------------------------------------------
  {
    files: ['src/modules/**/*.{ts,tsx}', 'src/components/**/*.{ts,tsx}', 'src/context/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': ['error', { patterns: dataLayerPatterns }],
    },
  },

  // The seam implementation itself is of course allowed to touch the data layer.
  {
    files: ['src/services/**/*.ts', 'src/test/**/*.{ts,tsx}', 'src/**/*.{test,spec}.{ts,tsx}'],
    rules: {
      'no-restricted-imports': 'off',
      'no-console': 'off',
    },
  },

  {
    files: ['*.config.{js,ts}', 'scripts/**/*.mjs', 'e2e/**/*.ts'],
    languageOptions: {
      globals: { ...globals.node },
    },
    rules: {
      'no-console': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
]
