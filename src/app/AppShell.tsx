import { lazy, Suspense, useState } from 'react'
import type { ComponentType } from 'react'
import { Menu, X } from 'lucide-react'
import { NavLink, Navigate, Route, Routes } from 'react-router-dom'
import { useDemo } from '../demo/DemoContext'
import { Guarded, isPartAccessible } from './Guarded'
import { Placeholder } from './Placeholder'
import { ScreenSkeleton } from './Skeleton'
import { parts } from './parts'
import type { Role } from '../types/models'

const ROLES: Role[] = ['member', 'reviewer', 'pastor', 'admin']

// Lazy so the first paint ships only the shell + whichever route is active,
// not every screen in the app.
const SCREENS: Record<string, ComponentType> = {
  today: lazy(() => import('../modules/today/TodayScreen').then((m) => ({ default: m.TodayScreen }))),
  feed: lazy(() => import('../modules/feed/GoodNewsFeed').then((m) => ({ default: m.GoodNewsFeed }))),
  devotionals: lazy(() => import('../modules/word/WordScreen').then((m) => ({ default: m.WordScreen }))),
  review: lazy(() => import('../modules/admin/ContentStudio').then((m) => ({ default: m.ContentStudio }))),
  sermons: lazy(() => import('../modules/voice/VoiceScreen').then((m) => ({ default: m.VoiceScreen }))),
  prayer: lazy(() => import('../modules/assembly/AssemblyScreen').then((m) => ({ default: m.AssemblyScreen }))),
  reminders: lazy(() => import('../modules/reminders/WhatFallsThroughScreen').then((m) => ({ default: m.WhatFallsThroughScreen }))),
  video: lazy(() => import('../modules/screen/TheScreenScreen').then((m) => ({ default: m.TheScreenScreen }))),
  bible: lazy(() => import('../modules/scroll/ScrollScreen').then((m) => ({ default: m.ScrollScreen }))),
  library: lazy(() => import('../modules/library/LibraryScreen').then((m) => ({ default: m.LibraryScreen }))),
}

/** The Role / Church / As selectors — shared between the desktop header and the mobile drawer. */
function DemoSwitcher({ stacked }: { stacked?: boolean }) {
  const { churches, role, setRole, churchId, setChurchId, currentUser, userCandidates, setUserId } = useDemo()

  return (
    <div
      className={[
        'text-xs',
        stacked
          ? 'flex flex-col gap-3 text-ink/80'
          : 'flex items-center gap-3 rounded-lg border border-paper/20 bg-ink/15 px-3 py-2 text-paper',
      ].join(' ')}
    >
      <span className={`font-medium uppercase tracking-widest ${stacked ? 'text-gold' : 'text-gold'}`}>Demo</span>

      <label className={stacked ? 'flex flex-col gap-1' : 'flex items-center gap-1'}>
        Role
        <select
          className={[
            'min-h-11 rounded border px-1 py-0.5 sm:min-h-0',
            stacked ? 'border-mist bg-paper text-ink' : 'border-paper/30 bg-spirit text-paper',
          ].join(' ')}
          value={role}
          onChange={(e) => setRole(e.target.value as Role)}
        >
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </label>

      <label className={stacked ? 'flex flex-col gap-1' : 'flex items-center gap-1'}>
        Church
        <select
          className={[
            'min-h-11 rounded border px-1 py-0.5 sm:min-h-0',
            stacked ? 'border-mist bg-paper text-ink' : 'border-paper/30 bg-spirit text-paper',
          ].join(' ')}
          value={churchId}
          onChange={(e) => setChurchId(e.target.value)}
        >
          {churches.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name.en}
            </option>
          ))}
        </select>
      </label>

      {userCandidates.length > 1 ? (
        <label className={stacked ? 'flex flex-col gap-1' : 'flex items-center gap-1'}>
          As
          <select
            className={[
              'min-h-11 rounded border px-1 py-0.5 sm:min-h-0',
              stacked ? 'border-mist bg-paper text-ink' : 'border-paper/30 bg-spirit text-paper',
            ].join(' ')}
            value={currentUser.id}
            onChange={(e) => setUserId(e.target.value)}
          >
            {userCandidates.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
                {!u.canComment ? ' (muted)' : ''}
              </option>
            ))}
          </select>
        </label>
      ) : (
        <span className={stacked ? 'text-ink/60' : 'text-paper/70'}>as {currentUser.name}</span>
      )}
    </div>
  )
}

function NavList({ church, role, onNavigate }: { church: ReturnType<typeof useDemo>['church']; role: Role; onNavigate?: () => void }) {
  return (
    <ul className="space-y-1">
      {parts.map((part) => {
        const allowed = isPartAccessible(part.key, church, role)
        return (
          <li key={part.key}>
            <NavLink
              to={part.path}
              onClick={onNavigate}
              className={({ isActive }) =>
                [
                  'flex min-h-11 items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors',
                  allowed ? 'text-ink hover:bg-cloud' : 'text-ink/35 hover:bg-cloud/50',
                  isActive && allowed ? 'bg-cloud font-medium' : '',
                ].join(' ')
              }
            >
              <span>{part.label.en}</span>
              {!allowed && (
                <span className="text-[10px] font-medium uppercase tracking-wide text-plum">locked</span>
              )}
            </NavLink>
          </li>
        )
      })}
    </ul>
  )
}

export function AppShell() {
  const { church, role } = useDemo()
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <div className="min-h-screen bg-paper">
      <header className="flex items-center justify-between gap-3 border-b border-mist bg-spirit px-4 py-3 sm:px-6 sm:py-4">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open menu"
            className="flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-lg text-paper hover:bg-paper/10 md:hidden"
          >
            <Menu className="h-5 w-5" aria-hidden="true" />
          </button>
          <div className="min-w-0">
            <p className="truncate font-display text-lg tracking-wide text-paper sm:text-xl">{church.name.en}</p>
            <p className="font-ml truncate text-xs text-paper/70">{church.name.ml}</p>
          </div>
        </div>

        <div className="hidden md:block">
          <DemoSwitcher />
        </div>
      </header>

      <div className="flex">
        {/* Fixed rail on md+ */}
        <nav className="hidden w-56 shrink-0 border-r border-mist p-4 md:block">
          <NavList church={church} role={role} />
        </nav>

        {/* Mobile drawer: nav + demo switcher, since the header switcher is hidden below md */}
        {drawerOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div className="absolute inset-0 bg-ink/40" onClick={() => setDrawerOpen(false)} aria-hidden="true" />
            <div className="absolute inset-y-0 left-0 w-72 max-w-[85vw] overflow-y-auto bg-paper p-4 shadow-soft">
              <div className="flex items-center justify-between">
                <p className="font-display text-lg text-ink">Menu</p>
                <button
                  type="button"
                  onClick={() => setDrawerOpen(false)}
                  aria-label="Close menu"
                  className="flex min-h-11 min-w-11 items-center justify-center rounded-lg text-ink/60 hover:bg-cloud"
                >
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>

              <div className="mt-4 rounded-lg border border-mist bg-cloud p-3">
                <DemoSwitcher stacked />
              </div>

              <div className="mt-4">
                <NavList church={church} role={role} onNavigate={() => setDrawerOpen(false)} />
              </div>
            </div>
          </div>
        )}

        <main className="min-w-0 flex-1 p-4 sm:p-6">
          <Suspense fallback={<ScreenSkeleton />}>
            <Routes>
              {parts.map((part) => {
                const Screen = SCREENS[part.key]
                return (
                  <Route
                    key={part.key}
                    path={part.path}
                    element={
                      <Guarded partKey={part.key}>
                        {Screen ? <Screen /> : <Placeholder titleEn={part.label.en} titleMl={part.label.ml} />}
                      </Guarded>
                    }
                  />
                )
              })}
              <Route path="*" element={<Navigate to={parts[0].path} replace />} />
            </Routes>
          </Suspense>
        </main>
      </div>
    </div>
  )
}
