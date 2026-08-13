import { expect, test } from '@playwright/test'

/**
 * The Scroll in a real browser — GHS_MVP_Brief.md §7.4: both reading modes,
 * both languages, and the translation badge that carries attribution.
 *
 * Scroll mode is scroll-snap driven, so it can only really be verified here
 * rather than in jsdom.
 */

const GEN_1_1_EN = /in the beginning, god created the heavens and the earth/i
const GEN_1_1_ML = /ആദിയിൽ ദൈവം ആകാശവും/

test.beforeEach(async ({ page }) => {
  await page.goto('/scroll')
  await expect(page.getByText(GEN_1_1_EN)).toBeVisible()
})

test('opens on Genesis 1 in Scroll mode with the invitation', async ({ page }) => {
  await expect(page.getByRole('radio', { name: /scroll/i })).toBeChecked()
  await expect(page.getByText(/scroll to begin/i)).toBeVisible()
})

test('shows English and Malayalam on the same verse', async ({ page }) => {
  await expect(page.getByText(GEN_1_1_EN)).toBeVisible()
  await expect(page.getByText(GEN_1_1_ML)).toBeVisible()
})

test('scroll-snap advances one verse at a time', async ({ page }) => {
  const reader = page.locator('[aria-label="Chapter 1, verse by verse"]')
  await expect(reader).toBeVisible()

  const before = await reader.evaluate((el) => el.scrollTop)
  await reader.evaluate((el) => el.scrollBy({ top: el.clientHeight, behavior: 'instant' as const }))
  await page.waitForTimeout(400)
  const after = await reader.evaluate((el) => el.scrollTop)

  expect(after).toBeGreaterThan(before)
  await expect(page.getByText(/the earth was formless and empty/i)).toBeVisible()
})

test('switches to Column mode and back', async ({ page }) => {
  await page.getByRole('radio', { name: /column/i }).click()
  await expect(page.getByRole('radio', { name: /column/i })).toBeChecked()
  await expect(page.getByText(/scroll to begin/i)).toHaveCount(0)
  await expect(page.getByText(GEN_1_1_EN)).toBeVisible()

  await page.getByRole('radio', { name: /scroll/i }).click()
  await expect(page.getByText(/scroll to begin/i)).toBeVisible()
})

test('the reading mode survives a reload', async ({ page }) => {
  await page.getByRole('radio', { name: /column/i }).click()
  await page.reload()
  await expect(page.getByRole('radio', { name: /column/i })).toBeChecked()
})

test.describe('attribution — never uncited', () => {
  // Exactly one badge exists at any breakpoint, so these assert on a single
  // node rather than reaching for .first() and hoping it is the visible copy.
  test('shows both translations when both languages are on screen', async ({ page }) => {
    await expect(page.getByText('WEB', { exact: true })).toBeVisible()
    await expect(page.getByText(/irv malayalam/i)).toBeVisible()
  })

  test('drops the Malayalam attribution in English-only mode', async ({ page }) => {
    await page.getByRole('radio', { name: 'EN', exact: true }).click()
    await expect(page.getByText(/irv malayalam/i)).toHaveCount(0)
    await expect(page.getByText('WEB', { exact: true })).toBeVisible()
  })

  test('drops the English attribution in Malayalam-only mode', async ({ page }) => {
    await page.getByRole('radio', { name: 'ML', exact: true }).click()
    await expect(page.getByText('WEB', { exact: true })).toHaveCount(0)
    await expect(page.getByText(/irv malayalam/i)).toBeVisible()
  })
})

test.describe('the book rail', () => {
  test('opens John from the New Testament', async ({ page }, testInfo) => {
    if (testInfo.project.name === 'mobile') {
      await page.getByRole('button', { name: /genesis 1/i }).click()
    }
    const rail = page.getByRole('navigation', { name: /books of the bible/i }).last()

    await rail.getByRole('radio', { name: /new/i }).click()
    await rail.getByText('John', { exact: true }).click()

    await expect(page.getByText(/in the beginning was the word/i)).toBeVisible()
  })

  // All 66 books carry text, so no book in the rail is a dead end.
  test('opens any book without hitting a dead end', async ({ page }, testInfo) => {
    if (testInfo.project.name === 'mobile') {
      await page.getByRole('button', { name: /genesis 1/i }).click()
    }
    const rail = page.getByRole('navigation', { name: /books of the bible/i }).last()

    await rail.getByText('Exodus', { exact: true }).click()

    await expect(page.getByText(/these are the names of the sons of israel/i)).toBeVisible()
    await expect(page.getByText(/not available offline/i)).toHaveCount(0)
  })

  test('lists 39 Old Testament and 27 New Testament books', async ({ page }, testInfo) => {
    if (testInfo.project.name === 'mobile') {
      await page.getByRole('button', { name: /genesis 1/i }).click()
    }
    const rail = page.getByRole('navigation', { name: /books of the bible/i }).last()

    await expect(rail.getByRole('listitem')).toHaveCount(39)
    await rail.getByRole('radio', { name: /new/i }).click()
    await expect(rail.getByRole('listitem')).toHaveCount(27)
  })
})

test.describe('scripture search', () => {
  test('a bare chapter:verse resolves in the open book', async ({ page }) => {
    await page.getByRole('searchbox', { name: /search scripture/i }).fill('2:7')
    await page.getByRole('searchbox', { name: /search scripture/i }).press('Enter')

    await expect(page.getByText(/formed man from the dust of the ground/i)).toBeVisible()
  })

  test('a named reference jumps across books', async ({ page }) => {
    await page.getByRole('searchbox', { name: /search scripture/i }).fill('John 3:16')
    await page.getByRole('searchbox', { name: /search scripture/i }).press('Enter')

    await expect(page.getByText(/for god so loved the world/i)).toBeVisible()
  })

  test('free text finds a verse', async ({ page }) => {
    await page.getByRole('searchbox', { name: /search scripture/i }).fill('let there be light')
    await expect(page.getByRole('button', { name: /genesis 1:3/i }).first()).toBeVisible()
  })
})

test('never scrolls sideways', async ({ page }) => {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  )
  expect(overflow).toBeLessThanOrEqual(1)
})

test('reports no console errors', async ({ page }) => {
  const errors: string[] = []
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text())
  })

  await page.reload()
  await expect(page.getByText(GEN_1_1_EN)).toBeVisible()
  expect(errors).toEqual([])
})
