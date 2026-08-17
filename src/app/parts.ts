import type { Localized, Role } from '../types/models'

export interface Part {
  key: string
  path: string
  label: Localized
  /** Roles allowed to see this part. Omit for "all roles". */
  roles?: Role[]
}

export const parts: Part[] = [
  { key: 'today', path: '/', label: { en: 'Today', ml: 'ഇന്ന്' } },
  { key: 'feed', path: '/feed', label: { en: 'Good News Feed', ml: 'സന്തോഷവാർത്ത' } },
  { key: 'sermons', path: '/sermons', label: { en: 'The Voice', ml: 'ശബ്ദം' } },
  { key: 'devotionals', path: '/devotionals', label: { en: 'The Word', ml: 'വചനം' } },
  { key: 'questions', path: '/questions', label: { en: 'Questions', ml: 'ചോദ്യങ്ങൾ' } },
  { key: 'reflections', path: '/reflections', label: { en: 'Reflections', ml: 'പ്രതിഫലനങ്ങൾ' } },
  // Prayer Rooms, Prayer Wall, Small Groups, Pastoral Care, and Giving all
  // live as tabs inside The Assembly — see src/modules/assembly.
  { key: 'prayer', path: '/assembly', label: { en: 'The Assembly', ml: 'സഭ' } },
  { key: 'video', path: '/video', label: { en: 'The Screen', ml: 'സ്ക്രീൻ' } },
  { key: 'artifacts', path: '/library', label: { en: 'Library', ml: 'ലൈബ്രറി' } },
  { key: 'bible', path: '/bible', label: { en: 'The Scroll', ml: 'ചുരുൾ' } },
  {
    key: 'reminders',
    path: '/reminders',
    label: { en: 'What Falls Through', ml: 'ശ്രദ്ധിക്കപ്പെടാത്തവ' },
    roles: ['pastor', 'admin'],
  },
  {
    key: 'review',
    path: '/review',
    label: { en: 'Content Studio', ml: 'അവലോകന ക്യൂ' },
    roles: ['reviewer', 'pastor', 'admin'],
  },
  {
    key: 'admin',
    path: '/admin',
    label: { en: 'Admin', ml: 'അഡ്മിൻ' },
    roles: ['admin'],
  },
]
