import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { api } from '../services/api'
import type { Church, Role, User } from '../types/models'

const STORAGE_KEY = 'ghs.demo.selection.v1'

interface DemoSelection {
  churchId: string
  role: Role
}

interface DemoContextValue {
  churchId: string
  role: Role
  currentUser: User
  church: Church
  churches: Church[]
  setChurchId: (churchId: string) => void
  setRole: (role: Role) => void
}

const DemoContext = createContext<DemoContextValue | undefined>(undefined)

function loadSelection(): DemoSelection | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw) as DemoSelection
  } catch {
    // ignore malformed storage
  }
  return null
}

export function DemoProvider({ children }: { children: ReactNode }) {
  const churches = useMemo(() => api.getChurches(), [])
  const stored = loadSelection()

  const [churchId, setChurchId] = useState(stored?.churchId ?? churches[0].id)
  const [role, setRole] = useState<Role>(stored?.role ?? 'member')

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ churchId, role }))
  }, [churchId, role])

  const church = api.getChurch(churchId) ?? churches[0]
  // Every seeded church has all four roles, so this is always defined in the demo.
  const currentUser = (api.findUser(church.id, role) ?? api.getUsers(church.id)[0]) as User

  const value: DemoContextValue = {
    churchId: church.id,
    role,
    currentUser,
    church,
    churches,
    setChurchId,
    setRole,
  }

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>
}

export function useDemo(): DemoContextValue {
  const ctx = useContext(DemoContext)
  if (!ctx) throw new Error('useDemo must be used within a DemoProvider')
  return ctx
}
