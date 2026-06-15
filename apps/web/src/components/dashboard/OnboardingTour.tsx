'use client'

import { useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import { usePathname } from 'next/navigation'
import type { CallBackProps } from 'react-joyride'
import { useUser } from '@/contexts/UserContext'
import { useTour } from '@/contexts/TourContext'
import { TOURS, pathToTourKey } from '@/lib/tours'

// react-joyride es client-only (usa DOM/portales): import dinámico sin SSR.
const Joyride = dynamic(() => import('react-joyride'), { ssr: false })

export function OnboardingTour() {
  const { hasSeenTour, markTourSeen } = useUser()
  const { activeTour, startTour, endTour } = useTour()
  const pathname = usePathname()
  const autoTried = useRef<Record<string, boolean>>({})

  // Auto-arranque: la primera vez que el usuario entra a una página con tour
  // (y no lo vio), esperamos a que el target esté en el DOM (datos async) y lo lanzamos.
  useEffect(() => {
    if (activeTour) return
    const key = pathToTourKey(pathname)
    if (!key || hasSeenTour(key) || autoTried.current[key]) return

    const def = TOURS[key]
    let tries = 0
    const id = window.setInterval(() => {
      tries += 1
      if (document.querySelector(def.ready)) {
        clearInterval(id)
        autoTried.current[key] = true
        startTour(key)
      } else if (tries > 25) {
        clearInterval(id) // ~5s: no marcamos visto, puede salir en otra visita
      }
    }, 200)
    return () => clearInterval(id)
  }, [pathname, activeTour, hasSeenTour, startTour])

  function handleCallback(data: CallBackProps) {
    const { status } = data
    if (status === 'finished' || status === 'skipped') {
      if (activeTour) void markTourSeen(activeTour)
      endTour()
    }
  }

  const def = activeTour ? TOURS[activeTour] : null
  const runHere = !!def && def.path === pathname

  return (
    <Joyride
      steps={def?.steps ?? []}
      run={runHere}
      continuous
      showProgress
      showSkipButton
      disableScrollParentFix
      scrollToFirstStep
      callback={handleCallback}
      locale={{ back: 'Atrás', close: 'Cerrar', last: '¡Listo!', next: 'Siguiente', skip: 'Omitir' }}
      styles={{
        options: {
          primaryColor: '#7C3AED',
          backgroundColor: '#FFFFFF',
          arrowColor: '#FFFFFF',
          textColor: '#09090B',
          overlayColor: 'rgba(9,9,11,0.55)',
          zIndex: 10000,
        },
        tooltip: { borderRadius: 14, padding: 20 },
        tooltipTitle: { fontSize: 16, fontWeight: 700, letterSpacing: '-0.01em' },
        tooltipContent: { fontSize: 13, lineHeight: 1.55, color: '#52525B' },
        buttonNext: { borderRadius: 8, fontSize: 13, fontWeight: 600, padding: '8px 14px' },
        buttonBack: { color: '#71717A', fontSize: 13 },
        buttonSkip: { color: '#A1A1AA', fontSize: 13 },
        spotlight: { borderRadius: 10 },
      }}
    />
  )
}
