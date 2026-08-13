import { render as rtlRender, screen, waitForElementToBeRemoved } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import type { ReactElement, ReactNode } from 'react'
import { AppProvider } from '@/context/AppContext'

/**
 * Render a component inside the real providers.
 *
 * Deliberately not a mocked context: the comment gate, the language toggle and
 * the theme all read through AppProvider, and testing them against a fake
 * provider would test the fake. The demo api is fast and synchronous enough to
 * use directly.
 */
export function renderWithProviders(
  ui: ReactElement,
  { route = '/' }: { route?: string } = {},
): ReturnType<typeof rtlRender> {
  function Wrapper({ children }: { children: ReactNode }): JSX.Element {
    return (
      <MemoryRouter
        initialEntries={[route]}
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <AppProvider>{children}</AppProvider>
      </MemoryRouter>
    )
  }
  return rtlRender(ui, { wrapper: Wrapper })
}

/** Wait for AppProvider's boot to finish, whatever the screen shows meanwhile. */
export async function settleBoot(): Promise<void> {
  const loading = screen.queryAllByText(/^loading$/i)
  if (loading.length > 0) {
    await waitForElementToBeRemoved(() => screen.queryAllByText(/^loading$/i))
  }
}
