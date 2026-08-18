import type { Localized, Role } from '../types/models'

export interface Part {
  key: string
  path: string
  label: Localized
  /** Roles allowed to see this part. Omit for "all roles". */
  roles?: Role[]
}

// The daily Question and community/pastor Reflections aren't top-level
// screens — they live inside Today and The Word (see src/modules/today and
// src/modules/word). Church settings/admin has no surface of its own; it
// either lives inside Content Studio or isn't built. Keeping this list short
// and driven entirely by church.components + role is the point — see
// src/app/Guarded.tsx.
export const parts: Part[] = [
  { key: 'today', path: '/', label: { en: 'Today', ml: 'ഇന്ന്' } },
  { key: 'devotionals', path: '/devotionals', label: { en: 'The Word', ml: 'വചനം' } },
  { key: 'bible', path: '/bible', label: { en: 'The Scroll', ml: 'ചുരുൾ' } },
  { key: 'sermons', path: '/sermons', label: { en: 'The Voice', ml: 'ശബ്ദം' } },
  // Prayer Rooms, Prayer Wall, Small Groups, Pastoral Care, and Giving all
  // live as tabs inside The Assembly — see src/modules/assembly.
  { key: 'prayer', path: '/assembly', label: { en: 'The Assembly', ml: 'സഭ' } },
  { key: 'feed', path: '/feed', label: { en: 'Good News Feed', ml: 'സന്തോഷവാർത്ത' } },
  {
    key: 'reminders',
    path: '/reminders',
    label: { en: 'What Falls Through', ml: 'ശ്രദ്ധിക്കപ്പെടാത്തവ' },
    roles: ['pastor', 'admin'],
  },
  { key: 'video', path: '/share', label: { en: 'Shareable Cards', ml: 'പങ്കിടാവുന്ന കാർഡുകൾ' } },
  { key: 'library', path: '/library', label: { en: 'Library', ml: 'ലൈബ്രറി' } },
  {
    key: 'review',
    path: '/review',
    label: { en: 'Content Studio', ml: 'അവലോകന ക്യൂ' },
    roles: ['reviewer', 'pastor', 'admin'],
  },
]
