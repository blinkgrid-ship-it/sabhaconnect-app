import type { Localized, Role } from '../types/models'

export interface Part {
  key: string
  path: string
  label: Localized
  /** Roles allowed to see this part. Omit for "all roles". */
  roles?: Role[]
}

export const parts: Part[] = [
  { key: 'feed', path: '/feed', label: { en: 'Feed', ml: 'ഫീഡ്' } },
  { key: 'sermons', path: '/sermons', label: { en: 'Sermons', ml: 'പ്രസംഗങ്ങൾ' } },
  { key: 'devotionals', path: '/devotionals', label: { en: 'The Word', ml: 'വചനം' } },
  { key: 'questions', path: '/questions', label: { en: 'Questions', ml: 'ചോദ്യങ്ങൾ' } },
  { key: 'reflections', path: '/reflections', label: { en: 'The Assembly', ml: 'സഭ' } },
  { key: 'prayer', path: '/prayer', label: { en: 'Prayer Room', ml: 'പ്രാർത്ഥനാ മുറി' } },
  { key: 'groups', path: '/groups', label: { en: 'Small Groups', ml: 'ചെറു ഗ്രൂപ്പുകൾ' } },
  { key: 'giving', path: '/giving', label: { en: 'Giving', ml: 'സംഭാവന' } },
  { key: 'video', path: '/video', label: { en: 'Video', ml: 'വീഡിയോ' } },
  { key: 'artifacts', path: '/library', label: { en: 'Library', ml: 'ലൈബ്രറി' } },
  { key: 'bible', path: '/bible', label: { en: 'Bible', ml: 'ബൈബിൾ' } },
  {
    key: 'reminders',
    path: '/reminders',
    label: { en: 'Reminders', ml: 'ഓർമ്മപ്പെടുത്തലുകൾ' },
    roles: ['reviewer', 'pastor', 'admin'],
  },
  {
    key: 'review',
    path: '/review',
    label: { en: 'Review Queue', ml: 'അവലോകന ക്യൂ' },
    roles: ['reviewer', 'pastor', 'admin'],
  },
  {
    key: 'admin',
    path: '/admin',
    label: { en: 'Admin', ml: 'അഡ്മിൻ' },
    roles: ['admin'],
  },
]
