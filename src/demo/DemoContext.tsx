import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { api } from '../services/api'
import type { Church, Role, User } from '../types/models'

const STORAGE_KEY = 'ghs.demo.selection.v1'

interface DemoSelection {
  churchId: string
  role: Role
  userId: string | null
}

interface DemoContextValue {
  churchId: string
  role: Role
  currentUser: User
  /** Every user sharing the current church + role — usually one, but this is how the
   *  canComment gate demo (Neha vs. Blessy) becomes reachable from the DEMO switcher. */
  userCandidates: User[]
  church: Church
  churches: Church[]
  setChurchId: (churchId: string) => void
  setRole: (role: Role) => void
  setUserId: (userId: string) => void
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
  const [userId, setUserId] = useState<string | null>(stored?.userId ?? null)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ churchId, role, userId }))
  }, [churchId, role, userId])

  const church = api.getChurch(churchId) ?? churches[0]
  const userCandidates = api.getUsers(church.id).filter((u) => u.role === role)
  // Falls back to the first candidate whenever the stored userId doesn't belong to the
  // current church/role (e.g. right after switching either one).
  const currentUser = (userCandidates.find((u) => u.id === userId) ?? userCandidates[0] ?? api.getUsers(church.id)[0]) as User

  const value: DemoContextValue = {
    churchId: church.id,
    role,
    currentUser,
    userCandidates,
    church,
    churches,
    setChurchId,
    setRole,
    setUserId,
  }

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>
}

export function useDemo(): DemoContextValue {
  const ctx = useContext(DemoContext)
  if (!ctx) throw new Error('useDemo must be used within a DemoProvider')
  return ctx
}
