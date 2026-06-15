'use client'

import { createContext, useContext, useState, useCallback } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { TOURS, pathToTourKey } from '@/lib/tours'

interface TourValue {
  activeTour: string | null
  startTour: (key: string) => void
  startCurrentTour: () => void
  endTour: () => void
}

const TourContext = createContext<TourValue>({
  activeTour: null,
  startTour: () => {},
  startCurrentTour: () => {},
  endTour: () => {},
})

export const useTour = () => useContext(TourContext)

export function TourProvider({ children }: { children: React.ReactNode }) {
  const [activeTour, setActiveTour] = useState<string | null>(null)
  const router   = useRouter()
  const pathname = usePathname()

  const startTour = useCallback((key: string) => {
    const def = TOURS[key]
    if (!def) return
    if (def.path !== pathname) router.push(def.path) // navega si el tour vive en otra página
    setActiveTour(key)
  }, [pathname, router])

  // Botón de ayuda (?): repite el tour de la página actual (o el del dashboard).
  const startCurrentTour = useCallback(() => {
    startTour(pathToTourKey(pathname) ?? 'dashboard')
  }, [pathname, startTour])

  const endTour = useCallback(() => setActiveTour(null), [])

  return (
    <TourContext.Provider value={{ activeTour, startTour, startCurrentTour, endTour }}>
      {children}
    </TourContext.Provider>
  )
}
