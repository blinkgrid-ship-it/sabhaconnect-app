import { Navigate, Route, Routes } from 'react-router-dom'
import AppHeader from '@/components/AppHeader'
import Guarded from '@/components/Guarded'
import { useApp } from '@/context/AppContext'
import TodayPage from '@/modules/today/TodayPage'
import ScrollPage from '@/modules/scroll/ScrollPage'

/**
 * The app shell: a rounded parchment panel on a cream ground, with the
 * sanctuary-teal header across its top. The frame is the reason the palette
 * needs both grounds — depth here comes from parchment sitting on cream and a
 * single hairline, not from shadow.
 *
 * Every surface renders inside <Guarded> with the tenant context available
 * (GHS_ArtifactBuildGuide.md §7): entitlement is checked against the tenant's
 * component registry, and a screen that throws fails inside its own box.
 */

/**
 * Shown only when Supabase was asked for and could not be used. This is a
 * misconfiguration warning, not a status label — a build that silently reads
 * demo data while the operator believes it is live would be worse than ugly.
 */
function ConfigNotice(): JSX.Element | null {
  const { configFellBack } = useApp()
  if (!configFellBack) return null

  return (
    <p
      role="status"
      className="shrink-0 bg-lamp px-4 py-1.5 text-center font-overline text-overline uppercase text-brass-ink"
    >
      Supabase was requested but is not configured — reading bundled data instead
    </p>
  )
}

export function App(): JSX.Element {
  const { error } = useApp()

  if (error) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-cream px-6">
        <div role="alert" className="ghs-card max-w-reading p-10 text-center">
          <p className="ghs-overline">This church could not be loaded</p>
          <p className="mt-3 font-display text-xl text-ink">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-dvh bg-cream sm:p-4 lg:p-6">
      <div
        className="mx-auto flex min-h-dvh max-w-[112rem] flex-col overflow-hidden border-rule
          bg-parchment shadow-shell sm:min-h-[calc(100dvh-2rem)] sm:rounded-shell sm:border
          lg:min-h-[calc(100dvh-3rem)]"
      >
        <AppHeader />
        <ConfigNotice />

        <div className="flex min-h-0 flex-1 flex-col">
          <Routes>
            <Route
              path="/"
              element={
                <Guarded component="today" name="Today">
                  <TodayPage />
                </Guarded>
              }
            />
            <Route
              path="/scroll"
              element={
                <Guarded component="scroll" name="The Scroll">
                  <ScrollPage />
                </Guarded>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>
    </div>
  )
}

export default App
