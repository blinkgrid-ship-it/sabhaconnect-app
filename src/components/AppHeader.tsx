import { NavLink } from 'react-router-dom'
import { useApp } from '@/context/AppContext'
import Logo from './Logo'
import LangToggle from './LangToggle'
import DemoUserSwitcher from './DemoUserSwitcher'

/**
 * The sanctuary-teal header: logo and wordmark left, the two surfaces centred,
 * the reader's controls right.
 *
 * On narrow screens the navigation wraps to its own row rather than collapsing
 * into a hamburger — there are two destinations, and hiding two links behind a
 * menu costs more than it saves.
 */

const NAV = [
  { to: '/', label: 'Today', end: true },
  { to: '/scroll', label: 'The Scroll', end: false },
]

export function AppHeader(): JSX.Element {
  const { church } = useApp()

  return (
    <header className="relative z-30 shrink-0 bg-sanctuary text-white">
      <div className="flex flex-wrap items-center gap-x-5 gap-y-3 px-4 py-3 sm:px-6">
        <NavLink to="/" aria-label="Go to Today" className="rounded-sm">
          <Logo
            name={church?.name.en ?? 'GHS'}
            subtitle={church?.subtitle.en ?? 'Daily Word & Scripture'}
          />
        </NavLink>

        <nav
          aria-label="Sections"
          className="order-3 mx-auto flex shrink-0 items-center gap-1 rounded-full bg-white/[0.06] p-1 sm:order-none"
        >
          {NAV.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                [
                  'rounded-full px-4 py-1.5 text-ui transition',
                  isActive ? 'ghs-pill-active' : 'ghs-pill-idle-dark',
                ].join(' ')
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-3">
          <DemoUserSwitcher />
          <LangToggle />
        </div>
      </div>
    </header>
  )
}

export default AppHeader
