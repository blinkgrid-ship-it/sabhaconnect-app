import { NavLink, Navigate, Route, Routes } from 'react-router-dom'
import { useDemo } from '../demo/DemoContext'
import { Guarded, isPartAccessible } from './Guarded'
import { Placeholder } from './Placeholder'
import { parts } from './parts'
import type { Role } from '../types/models'

const ROLES: Role[] = ['member', 'reviewer', 'pastor', 'admin']

export function AppShell() {
  const { church, churches, role, setRole, churchId, setChurchId, currentUser } = useDemo()

  return (
    <div className="min-h-screen bg-paper">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-mist bg-spirit px-6 py-4">
        <div>
          <p className="font-display text-xl tracking-wide text-paper">{church.name.en}</p>
          <p className="font-ml text-xs text-paper/70">{church.name.ml}</p>
        </div>

        <div className="flex items-center gap-3 rounded-lg border border-paper/20 bg-ink/15 px-3 py-2 text-xs text-paper">
          <span className="font-medium uppercase tracking-widest text-gold">Demo</span>

          <label className="flex items-center gap-1">
            Role
            <select
              className="rounded border border-paper/30 bg-spirit px-1 py-0.5 text-paper"
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

          <label className="flex items-center gap-1">
            Church
            <select
              className="rounded border border-paper/30 bg-spirit px-1 py-0.5 text-paper"
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

          <span className="text-paper/70">as {currentUser.name}</span>
        </div>
      </header>

      <div className="flex">
        <nav className="w-56 shrink-0 border-r border-mist p-4">
          <ul className="space-y-1">
            {parts.map((part) => {
              const allowed = isPartAccessible(part.key, church, role)
              return (
                <li key={part.key}>
                  <NavLink
                    to={part.path}
                    className={({ isActive }) =>
                      [
                        'flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors',
                        allowed ? 'text-ink hover:bg-cloud' : 'text-ink/35 hover:bg-cloud/50',
                        isActive && allowed ? 'bg-cloud font-medium' : '',
                      ].join(' ')
                    }
                  >
                    <span>{part.label.en}</span>
                    {!allowed && (
                      <span className="text-[10px] font-medium uppercase tracking-wide text-plum">
                        locked
                      </span>
                    )}
                  </NavLink>
                </li>
              )
            })}
          </ul>
        </nav>

        <main className="flex-1 p-6">
          <Routes>
            <Route path="/" element={<Navigate to={parts[0].path} replace />} />
            {parts.map((part) => (
              <Route
                key={part.key}
                path={part.path}
                element={
                  <Guarded partKey={part.key}>
                    <Placeholder titleEn={part.label.en} titleMl={part.label.ml} />
                  </Guarded>
                }
              />
            ))}
            <Route path="*" element={<Navigate to={parts[0].path} replace />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}
