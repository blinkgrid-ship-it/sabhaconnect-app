import { GHS_THEME } from '@/config/theme'
import type { Church, User } from '@/types/models'

/**
 * Demo tenant + demo users.
 *
 * NOTE FOR THE FOUNDER: the church display name and subtitle below are
 * placeholders — the source documents never expand "GHS". Change them in this
 * one file and the whole product re-brands, including the header wordmark.
 */
export const SEED_CHURCH: Church = {
  id: 'ghs',
  name: { en: 'GHS', ml: 'ജി.എച്ച്.എസ്.' },
  subtitle: { en: 'Daily Word & Scripture', ml: 'ദൈനംദിന വചനവും തിരുവെഴുത്തും' },
  parentChurchId: null,
  theme: GHS_THEME,
  /**
   * The comment allow-list (GHS_ProductArchitecture.md §14.2). Note that
   * `u-john` is deliberately absent — switching to him is how the pastor
   * watches the gate work in the meeting.
   */
  commenterIds: ['u-nibin', 'u-mary', 'u-anna'],
  enabledComponents: ['today', 'scroll'],
}

export const SEED_USERS: User[] = [
  { id: 'u-nibin', churchId: 'ghs', name: 'Pastor Nibin', role: 'pastor', initials: 'PN' },
  { id: 'u-mary', churchId: 'ghs', name: 'Mary Thomas', role: 'member', initials: 'MT' },
  { id: 'u-john', churchId: 'ghs', name: 'John Varghese', role: 'member', initials: 'JV' },
  { id: 'u-anna', churchId: 'ghs', name: 'Anna Kurian', role: 'reviewer', initials: 'AK' },
]

/** Who the demo boots as. A commenter, so the page looks alive on first load. */
export const DEFAULT_USER_ID = 'u-mary'
