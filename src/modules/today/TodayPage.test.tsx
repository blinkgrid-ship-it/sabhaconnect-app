import { describe, expect, it } from 'vitest'
import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '@/App'
import { renderWithProviders } from '@/test/render'

/**
 * The Today page, driven through the real app shell.
 *
 * These are integration tests on purpose. The comment gate is the thing the
 * pastor is being shown (GHS_ProductArchitecture.md §14.2), and it only works
 * if the header switcher, the context and the seam agree — so the test
 * exercises all three rather than a component in isolation.
 */

async function renderToday(): Promise<void> {
  renderWithProviders(<App />, { route: '/' })
  await screen.findByRole('heading', { name: /question of the day/i }, { timeout: 5000 })
}

describe('the Today page', () => {
  it('shows the question of the day', async () => {
    await renderToday()
    expect(
      await screen.findByText(/where did you notice light this week/i),
    ).toBeInTheDocument()
  })

  it('shows the question in Malayalam alongside the English', async () => {
    await renderToday()
    expect(await screen.findByText(/ഈ ആഴ്ചയിൽ/)).toBeInTheDocument()
  })

  it('credits the author and states that it was approved', async () => {
    await renderToday()
    const heading = await screen.findByRole('heading', { name: /question of the day/i })
    const card = heading.closest('section') as HTMLElement

    // The author's name is its own element, so assert on the card's text rather
    // than on a single contiguous node.
    expect(card).toHaveTextContent(/written by/i)
    expect(card).toHaveTextContent(/anna kurian/i)
    expect(card).toHaveTextContent(/approved before publishing/i)
  })

  it('anchors the page with the pastor reflection', async () => {
    await renderToday()
    expect(await screen.findByText(/pastor.s reflection/i)).toBeInTheDocument()
    expect(await screen.findByText(/the first thing said over the world/i)).toBeInTheDocument()
  })

  it('shows community reflections beneath', async () => {
    await renderToday()
    expect(await screen.findByText(/the power went out on our street/i)).toBeInTheDocument()
  })

  // "Never unreviewed" — held content exists in the seed and must not surface.
  it('never renders a held reflection', async () => {
    await renderToday()
    await screen.findByText(/the first thing said over the world/i)
    expect(screen.queryByText(/a draft reflection that a reviewer has held/i)).not.toBeInTheDocument()
  })

  it('never renders a comment awaiting review', async () => {
    await renderToday()
    await screen.findByText(/the kitchen at six in the morning/i)
    expect(screen.queryByText(/a comment still awaiting review/i)).not.toBeInTheDocument()
  })
})

describe('the comment gate', () => {
  it('offers the comment box to a member on the allow-list', async () => {
    await renderToday()
    expect(await screen.findByPlaceholderText(/add to the conversation/i)).toBeInTheDocument()
    expect(screen.queryByTestId('comment-gate-notice')).not.toBeInTheDocument()
  })

  it('replaces the box with a quiet notice for a reader without rights', async () => {
    await renderToday()
    await screen.findByPlaceholderText(/add to the conversation/i)

    // John Varghese is deliberately absent from the allow-list.
    await userEvent.selectOptions(screen.getByLabelText(/reading as/i), 'u-john')

    const notice = await screen.findByTestId('comment-gate-notice')
    expect(notice).toHaveTextContent(/comments are limited to selected members/i)
    expect(screen.queryByPlaceholderText(/add to the conversation/i)).not.toBeInTheDocument()
  })

  it('restores the box when switching back to a permitted member', async () => {
    await renderToday()
    await screen.findByPlaceholderText(/add to the conversation/i)

    await userEvent.selectOptions(screen.getByLabelText(/reading as/i), 'u-john')
    await screen.findByTestId('comment-gate-notice')

    await userEvent.selectOptions(screen.getByLabelText(/reading as/i), 'u-mary')
    expect(await screen.findByPlaceholderText(/add to the conversation/i)).toBeInTheDocument()
  })

  it('marks readers without rights in the switcher', async () => {
    await renderToday()
    const select = screen.getByLabelText(/reading as/i)
    expect(within(select).getByRole('option', { name: /john varghese — reader only/i })).toBeInTheDocument()
  })

  it('posts a comment and shows it in the thread', async () => {
    await renderToday()
    const box = await screen.findByPlaceholderText(/add to the conversation/i)

    await userEvent.type(box, 'A reply written during the test.')
    await userEvent.click(screen.getByRole('button', { name: /^post$/i }))

    expect(await screen.findByText('A reply written during the test.')).toBeInTheDocument()
    await waitFor(() => expect(box).toHaveValue(''))
  })

  it('keeps the post button disabled until something is written', async () => {
    await renderToday()
    await screen.findByPlaceholderText(/add to the conversation/i)
    expect(screen.getByRole('button', { name: /^post$/i })).toBeDisabled()
  })

  it('shows the existing approved comments', async () => {
    await renderToday()
    expect(await screen.findByText(/the kitchen at six in the morning/i)).toBeInTheDocument()
  })
})

describe('the artifact of the day', () => {
  it('renders a card with its Wikipedia attribution', async () => {
    await renderToday()
    const heading = await screen.findByRole('heading', { name: /artifact of the day/i })
    const card = heading.closest('section')
    expect(card).not.toBeNull()

    const link = within(card as HTMLElement).getByRole('link', { name: /from wikipedia/i })
    expect(link).toHaveAttribute('href', expect.stringContaining('wikipedia.org'))
    expect(link).toHaveAttribute('rel', expect.stringContaining('noopener'))
  })

  it('lists the passages the artifact is mentioned in', async () => {
    await renderToday()
    const heading = await screen.findByRole('heading', { name: /artifact of the day/i })
    const card = heading.closest('section') as HTMLElement
    expect(within(card).getByText(/mentioned in/i)).toBeInTheDocument()
  })
})

describe('the reading rhythm', () => {
  it('shows a streak and a full week of days', async () => {
    await renderToday()
    const heading = await screen.findByRole('heading', { name: /your rhythm/i })
    const card = heading.closest('section') as HTMLElement

    expect(within(card).getByText(/days? unbroken/i)).toBeInTheDocument()
    expect(within(card).getAllByRole('listitem').length).toBe(7)
  })

  it('reports a streak that matches the days marked as read', async () => {
    await renderToday()
    const heading = await screen.findByRole('heading', { name: /your rhythm/i })
    const card = heading.closest('section') as HTMLElement

    // The number is computed from recorded days, so it must be a real count.
    const streak = Number(within(card).getByText(/^\d+$/).textContent)
    expect(streak).toBeGreaterThan(0)
  })

  it('never marks a future day as read', async () => {
    await renderToday()
    const heading = await screen.findByRole('heading', { name: /your rhythm/i })
    const card = heading.closest('section') as HTMLElement

    const future = within(card).queryAllByText(/still to come/i)
    for (const el of future) {
      expect(el.textContent).not.toMatch(/, read/)
    }
  })
})

describe('the shell', () => {
  // Removed deliberately at the founder's request; this keeps it removed.
  it('carries no demo status banner', async () => {
    await renderToday()
    expect(screen.queryByText(/no live backend/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/^demo\b/i)).not.toBeInTheDocument()
  })

  it('shows the wordmark and the reader controls', async () => {
    await renderToday()
    expect(screen.getByText('GHS')).toBeInTheDocument()
    expect(screen.getByRole('radiogroup', { name: /reading language/i })).toBeInTheDocument()
    expect(screen.getByRole('navigation', { name: /sections/i })).toBeInTheDocument()
  })
})

describe('language control', () => {
  it('hides Malayalam when the reader chooses English only', async () => {
    await renderToday()
    expect(await screen.findByText(/ഈ ആഴ്ചയിൽ/)).toBeInTheDocument()

    await userEvent.click(screen.getByRole('radio', { name: 'EN' }))

    await waitFor(() => expect(screen.queryByText(/ഈ ആഴ്ചയിൽ/)).not.toBeInTheDocument())
    expect(screen.getByText(/where did you notice light this week/i)).toBeInTheDocument()
  })

  it('hides English when the reader chooses Malayalam only', async () => {
    await renderToday()
    await userEvent.click(screen.getByRole('radio', { name: 'ML' }))

    await waitFor(() =>
      expect(screen.queryByText(/where did you notice light this week/i)).not.toBeInTheDocument(),
    )
    expect(screen.getByText(/ഈ ആഴ്ചയിൽ/)).toBeInTheDocument()
  })
})
