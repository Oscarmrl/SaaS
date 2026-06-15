'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase'
import { api } from '@/lib/api-client'
import type { User } from '@supabase/supabase-js'

interface CreditAccount {
  balance: number
  lifetimeCredits: number
}

interface UserContextValue {
  user: User | null
  displayName: string
  firstName: string
  avatarUrl: string | null
  credits: CreditAccount
  loadingCredits: boolean
  refreshCredits: () => Promise<void>
  isAdmin: boolean
  hasSeenTour: (key: string) => boolean
  markTourSeen: (key: string) => Promise<void>
}

const UserContext = createContext<UserContextValue>({
  user: null,
  displayName: '',
  firstName: 'Usuario',
  avatarUrl: null,
  credits: { balance: 0, lifetimeCredits: 0 },
  loadingCredits: true,
  refreshCredits: async () => {},
  isAdmin: false,
  hasSeenTour: () => true,
  markTourSeen: async () => {},
})

export function useUser() {
  return useContext(UserContext)
}

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser]               = useState<User | null>(null)
  const [credits, setCredits]         = useState<CreditAccount>({ balance: 0, lifetimeCredits: 0 })
  const [loadingCredits, setLoading]  = useState(true)
  const [role, setRole]               = useState<string | null>(null)
  const [onboarded, setOnboarded]     = useState<boolean | null>(null)
  const [completedTours, setCompletedTours] = useState<string[]>([])

  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const refreshCredits = useCallback(async () => {
    setLoading(true)
    try {
      const data = await api.get<CreditAccount>('/credits/balance')
      setCredits(data)
    } catch {
      // sin créditos si no está autenticado aún
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (user) refreshCredits()
  }, [user, refreshCredits])

  useEffect(() => {
    if (!user) { setRole(null); setOnboarded(null); setCompletedTours([]); return }
    setCompletedTours((user.user_metadata?.['completed_tours'] as string[] | undefined) ?? [])
    api.get<{ role: string; onboardedAt: string | null }>('/user/me')
      .then((data) => { setRole(data.role); setOnboarded(!!data.onboardedAt) })
      .catch(() => { setRole(null); setOnboarded(null) })
  }, [user])

  const hasSeenTour = useCallback((key: string) => {
    if (completedTours.includes(key)) return true
    if (key === 'dashboard' && onboarded) return true // compat con onboardedAt previo
    return false
  }, [completedTours, onboarded])

  const markTourSeen = useCallback(async (key: string) => {
    setCompletedTours(prev => (prev.includes(key) ? prev : [...prev, key])) // optimista
    if (key === 'dashboard') setOnboarded(true)
    try {
      await api.post('/user/tour-complete', { key })
    } catch {
      // el flag local ya evita repetir en esta sesión
    }
  }, [])

  // Compatibilidad: email/password guarda full_name, Google guarda name o full_name
  const meta        = user?.user_metadata ?? {}
  const displayName = meta.full_name || meta.name || user?.email?.split('@')[0] || 'Usuario'
  const firstName   = displayName.split(' ')[0]
  const avatarUrl   = (meta.avatar_url as string | undefined) ?? null

  return (
    <UserContext.Provider value={{ user, displayName, firstName, avatarUrl, credits, loadingCredits, refreshCredits, isAdmin: role === 'ADMIN', hasSeenTour, markTourSeen }}>
      {children}
    </UserContext.Provider>
  )
}
