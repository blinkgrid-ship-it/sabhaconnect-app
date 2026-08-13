import { defineConfig, devices } from '@playwright/test'

/**
 * E2E covers the two headline pages in both languages and both reading modes —
 * the "verify pass" in GHS_MVP_Brief.md §7.4 — plus the guardrails that are only
 * observable in a real browser (the comment gate, attribution always on screen).
 *
 * Mobile Chrome is a first-class project, not an afterthought: the pastor may
 * well be handed a phone in the meeting.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  /**
   * Capped deliberately. Every navigation pulls a book chunk (Psalms is ~560 KB)
   * from a single preview server, and Playwright's default worker count
   * saturates it badly enough that assertions time out on a working app. Two
   * workers is faster in wall-clock than the default plus retries.
   */
  workers: process.env.CI ? 1 : 2,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : [['list']],
  timeout: 60_000,
  expect: { timeout: 15_000 },
  use: {
    baseURL: 'http://127.0.0.1:4173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    navigationTimeout: 30_000,
    actionTimeout: 15_000,
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
  ],
  webServer: {
    /**
     * `--host 127.0.0.1` is load-bearing: left to itself, `vite preview` binds
     * only to the IPv6 loopback (::1), and Playwright's IPv4 health check
     * against 127.0.0.1 then times out rather than failing with anything
     * informative.
     */
    command: 'npm run e2e:serve',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
})
