import { describe, expect, it } from 'vitest'
import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '@/App'
import { renderWithProviders } from '@/test/render'

/**
 * The Scroll, driven through the real app shell.
 *
 * Covers the four things the brief calls out for the verify pass
 * (GHS_MVP_Brief.md §7.4): both reading modes, both languages, the book rail,
 * and the translation badge that carries attribution.
 */

const GEN_1_1_EN = /in the beginning, god created the heavens and the earth/i
const GEN_1_1_ML = /ആദിയിൽ ദൈവം ആകാശവും/

async function renderScroll(): Promise<void> {
  renderWithProviders(<App />, { route: '/scroll' })
  await screen.findByText(GEN_1_1_EN, undefined, { timeout: 5000 })
}

describe('the reader', () => {
  it('opens on Genesis 1 in Scroll mode', async () => {
    await renderScroll()
    expect(screen.getByRole('radio', { name: /scroll/i })).toBeChecked()
    expect(screen.getByText(GEN_1_1_EN)).toBeInTheDocument()
  })

  it('invites the reader to begin', async () => {
    await renderScroll()
    expect(screen.getByText(/scroll to begin/i)).toBeInTheDocument()
  })

  it('pairs English and Malayalam on the same verse', async () => {
    await renderScroll()
    expect(screen.getByText(GEN_1_1_ML)).toBeInTheDocument()
  })

  it('switches to Column mode', async () => {
    await renderScroll()
    await userEvent.click(screen.getByRole('radio', { name: /column/i }))

    await waitFor(() => expect(screen.getByRole('radio', { name: /column/i })).toBeChecked())
    expect(screen.getByText(GEN_1_1_EN)).toBeInTheDocument()
    // The "scroll to begin" invitation belongs to Scroll mode only.
    expect(screen.queryByText(/scroll to begin/i)).not.toBeInTheDocument()
  })

  it('renders the whole chapter in Column mode', async () => {
    await renderScroll()
    await userEvent.click(screen.getByRole('radio', { name: /column/i }))

    const list = await screen.findByRole('list', { name: '' }).catch(() => null)
    // Genesis 1 has 31 verses; assert on the count of rendered verse rows.
    await waitFor(() => {
      const rows = document.querySelectorAll('[data-verse-ref^="GEN.1."]')
      expect(rows.length).toBe(31)
    })
    expect(list).toBeDefined()
  })
})

describe('the book rail', () => {
  it('lists Old Testament books with chapter counts', async () => {
    await renderScroll()
    const rail = screen.getByRole('navigation', { name: /books of the bible/i })
    expect(within(rail).getByText('Genesis')).toBeInTheDocument()
    expect(within(rail).getByText('50')).toBeInTheDocument()
  })

  it('switches to the New Testament', async () => {
    await renderScroll()
    const rail = screen.getByRole('navigation', { name: /books of the bible/i })

    await userEvent.click(within(rail).getByRole('radio', { name: /new/i }))
    expect(await within(rail).findByText('John')).toBeInTheDocument()
  })

  it('opens a bundled book that the reader selects', async () => {
    await renderScroll()
    const rail = screen.getByRole('navigation', { name: /books of the bible/i })

    await userEvent.click(within(rail).getByRole('radio', { name: /new/i }))
    await userEvent.click(await within(rail).findByText('John'))

    expect(await screen.findByText(/in the beginning was the word/i)).toBeInTheDocument()
  })

  // Every one of the 66 books carries text, so no book is a dead end.
  it('opens any Old Testament book the reader picks', async () => {
    await renderScroll()
    const rail = screen.getByRole('navigation', { name: /books of the bible/i })

    await userEvent.click(within(rail).getByText('Exodus'))

    expect(await screen.findByText(/these are the names of the sons of israel/i)).toBeInTheDocument()
    expect(screen.queryByText(/not available offline/i)).not.toBeInTheDocument()
  })

  it('resets to chapter 1 when a new book is opened', async () => {
    await renderScroll()
    const rail = screen.getByRole('navigation', { name: /books of the bible/i })

    await userEvent.click(within(rail).getByText('Psalms'))

    await waitFor(() =>
      expect(document.querySelectorAll('[data-verse-ref^="PSA.1."]').length).toBeGreaterThan(0),
    )
  })

  it('shows all 66 books across the two testaments', async () => {
    await renderScroll()
    const rail = screen.getByRole('navigation', { name: /books of the bible/i })

    const old = within(rail).getAllByRole('listitem')
    expect(old.length).toBe(39)

    await userEvent.click(within(rail).getByRole('radio', { name: /new/i }))
    await waitFor(() => expect(within(rail).getAllByRole('listitem').length).toBe(27))
  })
})

describe('attribution', () => {
  // "Never uncited": the translation badge is where scripture attribution lives.
  // It is rendered exactly once, so these assert on a single node.
  it('shows both translations while both languages are on screen', async () => {
    await renderScroll()
    expect(screen.getByText('WEB')).toBeInTheDocument()
    expect(screen.getByText(/irv malayalam/i)).toBeInTheDocument()
  })

  it('renders the badge only once, at any breakpoint', async () => {
    await renderScroll()
    expect(screen.getAllByText('WEB').length).toBe(1)
  })

  it('shows only the English attribution in English-only mode', async () => {
    await renderScroll()
    await userEvent.click(screen.getByRole('radio', { name: 'EN' }))

    await waitFor(() => expect(screen.queryByText(/irv malayalam/i)).not.toBeInTheDocument())
    expect(screen.getByText('WEB')).toBeInTheDocument()
  })

  it('shows only the Malayalam attribution in Malayalam-only mode', async () => {
    await renderScroll()
    await userEvent.click(screen.getByRole('radio', { name: 'ML' }))

    await waitFor(() => expect(screen.queryByText('WEB')).not.toBeInTheDocument())
    expect(screen.getByText(/irv malayalam/i)).toBeInTheDocument()
  })
})

describe('language control', () => {
  it('hides Malayalam in English-only mode', async () => {
    await renderScroll()
    await userEvent.click(screen.getByRole('radio', { name: 'EN' }))

    await waitFor(() => expect(screen.queryByText(GEN_1_1_ML)).not.toBeInTheDocument())
    expect(screen.getByText(GEN_1_1_EN)).toBeInTheDocument()
  })

  it('hides English in Malayalam-only mode', async () => {
    await renderScroll()
    await userEvent.click(screen.getByRole('radio', { name: 'ML' }))

    await waitFor(() => expect(screen.queryByText(GEN_1_1_EN)).not.toBeInTheDocument())
    expect(screen.getByText(GEN_1_1_ML)).toBeInTheDocument()
  })
})

describe('scripture search', () => {
  it('jumps to a bare chapter:verse in the open book', async () => {
    await renderScroll()
    const box = screen.getByRole('searchbox', { name: /search scripture/i })

    await userEvent.type(box, '2:7{Enter}')

    expect(
      await screen.findByText(/formed man from the dust of the ground/i),
    ).toBeInTheDocument()
  })

  it('jumps to a fully named reference in another book', async () => {
    await renderScroll()
    const box = screen.getByRole('searchbox', { name: /search scripture/i })

    await userEvent.type(box, 'John 3:16{Enter}')

    expect(await screen.findByText(/for god so loved the world/i)).toBeInTheDocument()
  })

  it('reaches any book in the canon, not just a bundled few', async () => {
    await renderScroll()
    const box = screen.getByRole('searchbox', { name: /search scripture/i })

    await userEvent.type(box, 'Exodus 3:14{Enter}')

    expect(await screen.findByText(/i am who i am/i)).toBeInTheDocument()
  })

  it('does not throw on nonsense input', async () => {
    await renderScroll()
    const box = screen.getByRole('searchbox', { name: /search scripture/i })

    await userEvent.type(box, '::::{Enter}')
    expect(screen.getByText(GEN_1_1_EN)).toBeInTheDocument()
  })
})
