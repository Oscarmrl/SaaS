import type { Step } from 'react-joyride'

export interface TourDef {
  /** Ruta donde corre el tour. */
  path: string
  /** Selector que debe existir en el DOM antes de iniciar (datos async). */
  ready: string
  steps: Step[]
}

const baseStep = { disableBeacon: true } as const

export const TOURS: Record<string, TourDef> = {
  dashboard: {
    path: '/dashboard',
    ready: '[data-tour="quick-actions"]',
    steps: [
      { ...baseStep, target: 'body', placement: 'center',
        title: '¡Bienvenido a BrandAI! 🎉',
        content: 'Te muestro en 30 segundos cómo crear publicidad profesional con IA.' },
      { ...baseStep, target: '[data-tour="new-brand"]',
        title: 'Creá tu marca',
        content: 'Empezá por acá: subí tu logo y datos para que la IA aprenda tu estilo y colores.' },
      { ...baseStep, target: '[data-tour="quick-actions"]',
        title: 'Generá contenido',
        content: 'Accesos rápidos para crear imágenes, banners, captions y videos.' },
      { ...baseStep, target: '[data-tour="nav-generate"]',
        title: 'Generar cuando quieras',
        content: 'Desde acá accedés al generador en cualquier momento.' },
      { ...baseStep, target: '[data-tour="nav-assets"]',
        title: 'Tus assets',
        content: 'Todo lo que generes queda guardado en "Mis assets".' },
      { ...baseStep, target: '[data-tour="credits"]',
        title: 'Tus créditos',
        content: 'Cada generación consume créditos. Acá ves tu saldo y comprás más.' },
      { ...baseStep, target: 'body', placement: 'center',
        title: '¡Listo para empezar! 🚀',
        content: '¿Dudas en cualquier pantalla? Volvé a ver el tour con el botón (?) del menú.' },
    ],
  },

  'brand-new': {
    path: '/brands/new',
    ready: '[data-tour="brand-industry"]',
    steps: [
      { ...baseStep, target: 'body', placement: 'center',
        title: 'Creá tu marca 🎨',
        content: 'La IA usará esto para que cada imagen, video y texto respete tu identidad.' },
      { ...baseStep, target: '[data-tour="brand-industry"]',
        title: 'Elegí tu industria',
        content: 'Según tu tipo de negocio, adaptamos las preguntas para entenderte mejor.' },
      { ...baseStep, target: 'body', placement: 'center',
        title: 'Paso a paso',
        content: 'Respondé las preguntas y, al final, subí tu logo o fotos de referencia. ¡Eso es todo!' },
    ],
  },

  generate: {
    path: '/generate',
    ready: '[data-tour="gen-brand"]',
    steps: [
      { ...baseStep, target: 'body', placement: 'center',
        title: 'Generá contenido ⚡',
        content: 'Acá creás tus piezas publicitarias con IA en segundos.' },
      { ...baseStep, target: '[data-tour="gen-brand"]',
        title: 'Elegí la marca',
        content: 'El contenido se genera respetando la identidad de la marca que elijas.' },
      { ...baseStep, target: '[data-tour="gen-type"]',
        title: 'Tipo de contenido',
        content: 'Imagen, banner, caption o video. Fijate cuántos créditos cuesta cada uno.' },
      { ...baseStep, target: '[data-tour="gen-platform"]',
        title: 'Plataforma',
        content: 'Optimizamos el formato según la red social donde vas a publicar.' },
      { ...baseStep, target: '[data-tour="gen-prompt"]',
        title: 'Describí lo que querés',
        content: 'Sé específico: colores, ambiente, mensaje, temporada. Mientras más detalle, mejor.' },
      { ...baseStep, target: '[data-tour="gen-status"]',
        title: 'Resultado',
        content: 'Acá ves el progreso y, al terminar, podés previsualizar y descargar.' },
    ],
  },

  credits: {
    path: '/credits',
    ready: '[data-tour="credits-packs"]',
    steps: [
      { ...baseStep, target: 'body', placement: 'center',
        title: 'Créditos 💳',
        content: 'Con créditos generás contenido. Te muestro cómo funcionan.' },
      { ...baseStep, target: '[data-tour="credits-balance"]',
        title: 'Tu saldo',
        content: 'Acá ves cuántos créditos tenés disponibles.' },
      { ...baseStep, target: '[data-tour="credits-packs"]',
        title: 'Comprá un pack',
        content: 'Pagás una sola vez y los créditos no expiran: usalos cuando quieras.' },
      { ...baseStep, target: '[data-tour="credits-history"]',
        title: 'Historial',
        content: 'El registro de tus compras y consumos queda siempre acá.' },
    ],
  },
}

/** Devuelve la clave del tour que corresponde a una ruta, o null. */
export function pathToTourKey(pathname: string): string | null {
  const entry = Object.entries(TOURS).find(([, t]) => t.path === pathname)
  return entry ? entry[0] : null
}
