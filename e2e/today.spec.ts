import { expect, test } from '@playwright/test'

/**
 * The Today page in a real browser.
 *
 * This is the "verify pass" from GHS_MVP_Brief.md §7.4 for the first surface:
 * click it in both languages, confirm each guardrail is visibly honoured.
 * Runs at desktop and phone sizes — the pastor may be handed either.
 */

test.beforeEach(async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: /question of the day/i })).toBeVisible()
})

test('shows the question, the pastor reflection and the artifact', async ({ page }) => {
  await expect(page.getByText(/where did you notice light this week/i)).toBeVisible()
  await expect(page.getByText(/pastor.s reflection/i)).toBeVisible()
  await expect(page.getByRole('heading', { name: /artifact of the day/i })).toBeVisible()
})

test('carries no demo status banner', async ({ page }) => {
  await expect(page.getByText(/no live backend/i)).toHaveCount(0)
})

test('shows the reading rhythm', async ({ page }) => {
  const card = page.locator('section').filter({ hasText: /your rhythm/i })
  await expect(card).toBeVisible()
  await expect(card.getByText(/days? unbroken/i)).toBeVisible()
  await expect(card.getByRole('listitem')).toHaveCount(7)
})

test('pairs English with Malayalam', async ({ page }) => {
  await expect(page.getByText(/ഈ ആഴ്ചയിൽ/)).toBeVisible()
})

test.describe('the comment gate', () => {
  test('a selected follower gets the comment box', async ({ page }) => {
    await expect(page.getByPlaceholder(/add to the conversation/i)).toBeVisible()
  })

  test('a reader without rights gets the notice instead', async ({ page }) => {
    await page.getByLabel(/reading as/i).selectOption('u-john')

    await expect(page.getByTestId('comment-gate-notice')).toHaveText(
      /comments are limited to selected members/i,
    )
    await expect(page.getByPlaceholder(/add to the conversation/i)).toHaveCount(0)
  })

  test('a posted comment appears in the thread', async ({ page }) => {
    const box = page.getByPlaceholder(/add to the conversation/i)
    await box.fill('Written during the end-to-end run.')
    await page.getByRole('button', { name: /^post$/i }).click()

    await expect(page.getByText('Written during the end-to-end run.')).toBeVisible()
    await expect(box).toHaveValue('')
  })
})

test.describe('guardrails are visible, not just claimed', () => {
  test('the artifact card always carries its source', async ({ page }) => {
    const card = page.locator('section').filter({ hasText: /artifact of the day/i })
    const link = card.getByRole('link', { name: /from wikipedia/i })

    await expect(link).toBeVisible()
    await expect(link).toHaveAttribute('href', /wikipedia\.org/)
  })

  test('the question names its author and approval', async ({ page }) => {
    await expect(page.getByText(/approved before publishing/i)).toBeVisible()
  })

  test('held and unreviewed content never renders', async ({ page }) => {
    await expect(page.getByText(/a draft reflection that a reviewer has held/i)).toHaveCount(0)
    await expect(page.getByText(/a comment still awaiting review/i)).toHaveCount(0)
  })
})

test.describe('language', () => {
  test('English only hides the Malayalam lines', async ({ page }) => {
    await page.getByRole('radio', { name: 'EN', exact: true }).click()

    await expect(page.getByText(/ഈ ആഴ്ചയിൽ/)).toHaveCount(0)
    await expect(page.getByText(/where did you notice light this week/i)).toBeVisible()
  })

  test('Malayalam only hides the English lines', async ({ page }) => {
    await page.getByRole('radio', { name: 'ML', exact: true }).click()

    await expect(page.getByText(/where did you notice light this week/i)).toHaveCount(0)
    await expect(page.getByText(/ഈ ആഴ്ചയിൽ/)).toBeVisible()
  })

  test('the choice survives a reload', async ({ page }) => {
    await page.getByRole('radio', { name: 'ML', exact: true }).click()
    await page.reload()

    await expect(page.getByRole('radio', { name: 'ML', exact: true })).toBeChecked()
  })
})

test('the page never scrolls sideways', async ({ page }) => {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  )
  expect(overflow).toBeLessThanOrEqual(1)
})

test('the page reports no console errors', async ({ page }) => {
  const errors: string[] = []
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text())
  })

  await page.reload()
  await expect(page.getByRole('heading', { name: /question of the day/i })).toBeVisible()
  expect(errors).toEqual([])
})
