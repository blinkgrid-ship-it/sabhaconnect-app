import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { api, activeDataSource } from '@/services/api'
import { applyTheme } from '@/config/theme'
import { defaultChurchId, supabaseFellBack } from '@/config/flags'
import type { Church, LangMode, User } from '@/types/models'

/**
 * Tenant + demo-user + language context.
 *
 * The demo-user switcher is the mechanism that lets the pastor *watch* the
 * comment gate work in the meeting (GHS_ProductArchitecture.md §14.2) rather
 * than take our word for it: switch to a reader who is not on the allow-list
 * and the comment box is replaced by the limited-comments notice.
 */

interface AppState {
  church: Church | null
  users: User[]
  currentUser: User | null
  setCurrentUserId: (id: string) => void
  langMode: LangMode
  setLangMode: (mode: LangMode) => void
  loading: boolean
  error: string | null
  /** True when this build is the offline demo rather than a live backend. */
  isDemoBuild: boolean
  /** True when supabase was requested but could not be used. */
  configFellBack: boolean
}

const AppContext = createContext<AppState | null>(null)

const LANG_STORAGE_KEY = 'ghs:langMode'

function readStoredLang(): LangMode {
  try {
    const stored = window.localStorage.getItem(LANG_STORAGE_KEY)
    if (stored === 'both' || stored === 'en' || stored === 'ml') return stored
  } catch {
    /* storage unavailable — the default is fine */
  }
  return 'both'
}

export function AppProvider({ children }: { children: ReactNode }): JSX.Element {
  const [church, setChurch] = useState<Church | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [currentUserId, setCurrentUserIdState] = useState<string>('')
  const [langMode, setLangModeState] = useState<LangMode>(readStoredLang)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function boot(): Promise<void> {
      try {
        const [loadedChurch, loadedUsers, defaultUser] = await Promise.all([
          api.getChurch(defaultChurchId),
          api.listDemoUsers(defaultChurchId),
          api.getDefaultUserId(),
        ])
        if (cancelled) return

        setChurch(loadedChurch)
        setUsers(loadedUsers)
        setCurrentUserIdState(defaultUser || (loadedUsers[0]?.id ?? ''))
        applyTheme(loadedChurch.theme)
        setError(null)
      } catch (err) {
        if (cancelled) return
        setError(err instanceof Error ? err.message : 'Could not load this church.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void boot()
    return () => {
      cancelled = true
    }
  }, [])

  const setLangMode = useCallback((mode: LangMode) => {
    setLangModeState(mode)
    try {
      window.localStorage.setItem(LANG_STORAGE_KEY, mode)
    } catch {
      /* storage unavailable — the choice still applies for this session */
    }
  }, [])

  const setCurrentUserId = useCallback((id: string) => {
    setCurrentUserIdState(id)
  }, [])

  const currentUser = useMemo(
    () => users.find((u) => u.id === currentUserId) ?? null,
    [users, currentUserId],
  )

  const value = useMemo<AppState>(
    () => ({
      church,
      users,
      currentUser,
      setCurrentUserId,
      langMode,
      setLangMode,
      loading,
      error,
      isDemoBuild: activeDataSource === 'demo',
      configFellBack: supabaseFellBack,
    }),
    [church, users, currentUser, setCurrentUserId, langMode, setLangMode, loading, error],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp(): AppState {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used inside <AppProvider>.')
  return ctx
}

/** Convenience for the many components that only need the language mode. */
export function useLang(): { langMode: LangMode; showEn: boolean; showMl: boolean } {
  const { langMode } = useApp()
  return {
    langMode,
    showEn: langMode === 'both' || langMode === 'en',
    showMl: langMode === 'both' || langMode === 'ml',
  }
}
