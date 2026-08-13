import { useApp } from '@/context/AppContext'

/**
 * Switch which member is reading.
 *
 * This exists so the comment gate can be *watched* rather than described
 * (GHS_ProductArchitecture.md §14.2): switching to a reader who is not on the
 * allow-list replaces the comment box with the limited-comments notice, live,
 * in the meeting.
 *
 * It is a demo affordance — in production identity comes from real auth and
 * this control does not ship.
 *
 * A native <select> under a styled chip, rather than a custom listbox: the
 * chip carries the avatar and the caret, while the select keeps keyboard
 * behaviour, screen-reader semantics and the platform picker on mobile.
 */
export function DemoUserSwitcher(): JSX.Element | null {
  const { users, currentUser, setCurrentUserId, church, isDemoBuild } = useApp()

  if (!isDemoBuild || users.length === 0 || !church) return null

  return (
    <div className="flex items-center gap-2.5">
      <span className="ghs-overline-dark hidden lg:inline">Reading as</span>

      <div className="relative flex items-center gap-2 rounded-full bg-white/[0.06] py-1 pl-1 pr-2">
        <span
          aria-hidden="true"
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-cedar font-overline text-[0.5625rem] tracking-normal text-lamp"
        >
          {currentUser?.initials ?? '—'}
        </span>

        <label htmlFor="reading-as" className="sr-only">
          Reading as (demo)
        </label>
        <select
          id="reading-as"
          value={currentUser?.id ?? ''}
          onChange={(e) => setCurrentUserId(e.target.value)}
          className="max-w-[8.5rem] cursor-pointer appearance-none truncate bg-transparent pr-4 text-ui text-white focus:outline-none sm:max-w-[11rem]"
        >
          {users.map((u) => (
            <option key={u.id} value={u.id} className="bg-sanctuary text-white">
              {u.name}
              {church.commenterIds.includes(u.id) ? '' : ' — reader only'}
            </option>
          ))}
        </select>

        <svg
          aria-hidden="true"
          viewBox="0 0 10 6"
          className="pointer-events-none absolute right-2.5 h-1.5 w-2.5 fill-none stroke-lamp/70 stroke-[1.5]"
        >
          <path d="M1 1l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  )
}

export default DemoUserSwitcher
