/**
 * STYLE ENGINE — Motor de variación determinístico por seed
 *
 * PRINCIPIO CLAVE:
 *   Claude genera solo el TEXTO (copy, narración).
 *   Este módulo genera todos los ESTILOS VISUALES usando el seed del jobId.
 *
 *   Resultado:
 *   ✓ Cada video es visualmente único (seed diferente por jobId)
 *   ✓ Reproducible (mismo seed → mismo video)
 *   ✓ Sin sesgos de Claude (no le pedimos que "elija" estilos)
 *   ✓ Garantiza variedad real entre escenas (reglas anti-repetición)
 *
 * Basado en el mismo patrón de: Canva AI, Captions, Runway.
 */

import {
  MOTION_PROFILES,
  INTRO_PROFILES,
  CONTENT_PROFILES,
  CTA_PROFILES,
} from './motion-profiles'
import type { GeneratedStyle } from '../remotion/BrandVideoComposition'

// ─── LCG Seeded Random (Linear Congruential Generator) ───────────────────────
// Determinístico, rápido, suficiente para selección de perfiles.

class SeededRandom {
  private state: number

  constructor(seed: number) {
    // Asegurar que el seed sea un entero positivo no-cero
    this.state = (Math.abs(seed) || 1) >>> 0
  }

  /** Devuelve un float en [0, 1) */
  next(): number {
    // Algoritmo de Knuth / Numerical Recipes
    this.state = (Math.imul(this.state, 1664525) + 1013904223) >>> 0
    return this.state / 0x100000000
  }

  /** Entero en [0, n) */
  int(n: number): number {
    return Math.floor(this.next() * n)
  }
}

// ─── Fisher-Yates shuffle con seed ───────────────────────────────────────────

function shuffleWithSeed<T>(arr: T[], seed: number): T[] {
  const rng    = new SeededRandom(seed)
  const result = [...arr]
  for (let i = result.length - 1; i > 0; i--) {
    const j        = rng.int(i + 1)
    ;[result[i], result[j]] = [result[j]!, result[i]!]
  }
  return result
}

// ─── Tipos internos ───────────────────────────────────────────────────────────

type SceneType = 'intro' | 'content' | 'cta'

interface StyleEngineOptions {
  seed:                number
  sceneTypes:          SceneType[]
  hasMultipleImages:   boolean   // si hay ≥2 imágenes de referencia (necesario para carousel)
}

// ─── Reglas de asignación de textY por posición de escena ────────────────────
// El textY varía radicalmente entre escenas para que el texto "salte" de posición.

const TEXT_Y_BY_SLOT: Record<number, number[]> = {
  0: [15, 20, 78, 14],        // intro: dramático (arriba o abajo)
  1: [48, 55, 35, 65],        // 1er content: zona media
  2: [72, 80, 30, 58],        // 2do content: zona baja o alta
  3: [25, 40, 68, 15],        // 3er content: varía
  4: [50, 38, 72, 45],        // cta: centro o baja
}

// ─── Motor principal ──────────────────────────────────────────────────────────

export function generateStylesForScenes(opts: StyleEngineOptions): GeneratedStyle[] {
  const { seed, sceneTypes, hasMultipleImages } = opts

  // Seeds derivados — cada categoría usa una familia diferente para máxima entropía
  const introSeed   = seed
  const contentSeed = (seed * 31 + 7)  & 0xffffffff
  const ctaSeed     = (seed * 53 + 13) & 0xffffffff
  const textYSeed   = (seed * 79 + 19) & 0xffffffff

  const introShuffled   = shuffleWithSeed(INTRO_PROFILES,   introSeed)
  const contentShuffled = shuffleWithSeed(CONTENT_PROFILES, contentSeed)
  const ctaShuffled     = shuffleWithSeed(CTA_PROFILES,     ctaSeed)

  const rngTextY = new SeededRandom(textYSeed)

  // Estado de anti-repetición
  const usedLayouts  = new Set<string>()
  const usedAnims    = new Set<string>()
  const usedBgTreats: string[] = []

  // ── Iteradores: arrancan en un offset derivado del seed ──────────────────
  // Antes empezaban siempre en 0 → escena 0 siempre tomaba el primer perfil
  // del shuffle. Con seed-based startIdx, dos seeds diferentes producen
  // primeras escenas radicalmente distintas.
  const rngStart = new SeededRandom((seed ^ 0xDEADBEEF) >>> 0)
  let introIdx   = rngStart.int(introShuffled.length)
  let contentIdx = rngStart.int(contentShuffled.length)
  let ctaIdx     = rngStart.int(ctaShuffled.length)

  return sceneTypes.map((type, i) => {

    // ── 1. Seleccionar pool según tipo de escena ─────────────────────────────
    let pool:  string[]
    let pidx:  number
    if (type === 'intro') {
      pool = introShuffled;  pidx = introIdx++
    } else if (type === 'cta') {
      pool = ctaShuffled;    pidx = ctaIdx++
    } else {
      pool = contentShuffled; pidx = contentIdx++
    }

    // ── 2. Buscar perfil sin conflictos ──────────────────────────────────────
    //    Intenta hasta pool.length candidatos; si no, relaja restricciones.
    let chosen:  string | undefined
    let relaxed = false

    for (let attempt = 0; attempt < pool.length; attempt++) {
      const name    = pool[(pidx + attempt) % pool.length]!
      const profile = MOTION_PROFILES[name]!
      const prevBg  = usedBgTreats[usedBgTreats.length - 1]

      // CTA siempre usa hero layout (carousel/split no son ideales para CTA)
      const candidateLayout = type === 'cta' ? 'hero' : profile.sceneLayout

      // Reglas de exclusión
      const layoutOk = !usedLayouts.has(candidateLayout)
      const animOk   = !usedAnims.has(profile.textAnim)
      const bgOk     = profile.bgTreat !== prevBg

      if (layoutOk && animOk && bgOk) {
        chosen = name
        break
      }

      // Relajar progresivamente: con 3-5 escenas y pools de 11-17 perfiles,
      // esperar a la mitad del pool deja muy pocas opciones reales.
      // Relajar bgTreat tras 2 intentos garantiza variedad real de layouts/anims.
      if (attempt >= 2) relaxed = true
      if (relaxed && layoutOk && animOk) {
        chosen = name
        break
      }
    }

    // Fallback: índice derivado del seed (no siempre el primer del pool)
    if (!chosen) {
      const fallbackOffset = Math.abs(seed >> 4) + i * 7
      chosen = pool[(pidx + fallbackOffset) % pool.length]!
      console.warn(`[StyleEngine] scene ${i}: seed-based fallback ("${chosen}")`)
    }

    // ── 3. Clonar perfil + aplicar ajustes por escena ────────────────────────
    const profile: GeneratedStyle = { ...MOTION_PROFILES[chosen]! }

    // CTA: garantizar hero layout (sin override de textAnim — el perfil define la animación)
    if (type === 'cta') {
      profile.sceneLayout = 'hero'
      profile.fontWeight = Math.max(profile.fontWeight, 700)
    }

    // Carousel requiere ≥2 imágenes — si no hay, degradar a hero
    if (profile.sceneLayout === 'carousel' && !hasMultipleImages) {
      profile.sceneLayout = 'hero'
      // Forzar un bgTreat que no sea carousel-dependiente
      if (profile.bgTreat === 'minimal') profile.bgTreat = 'dark'
    }

    // ── 4. Variación de align: alterna entre escenas + offset por seed ───────
    //    Antes era 100% predecible (escena 0 siempre center, escena 1 siempre left).
    //    El offset del seed rompe ese patrón sin perder la alternancia.
    const rngAlign = new SeededRandom((seed + i * 9999) >>> 0)
    profile.align = (i + rngAlign.int(2)) % 2 === 0 ? 'center' : 'left'

    // ── 5. textY único por slot ───────────────────────────────────────────────
    const slotOptions = TEXT_Y_BY_SLOT[Math.min(i, 4)] ?? [50]
    const slotPick    = rngTextY.int(slotOptions.length)
    profile.textY     = slotOptions[slotPick]!

    // ── 6. Micro-variaciones procedurales basadas en seed ────────────────────
    //    Pequeñas variaciones en parámetros numéricos para que incluso el mismo perfil
    //    se vea ligeramente diferente entre generaciones.
    const rng = new SeededRandom(seed + i * 1337)

    // Variar fontScale ±0.08 alrededor del valor del perfil
    profile.fontScale    = Math.max(0.72, Math.min(1.28, profile.fontScale + (rng.next() - 0.5) * 0.16))

    // Variar overlayAlpha ±0.08
    profile.overlayAlpha = Math.max(0.25, Math.min(0.82, profile.overlayAlpha + (rng.next() - 0.5) * 0.16))

    // Variar kbRange ±0.025
    profile.kbRange      = Math.max(0.04, Math.min(0.15, profile.kbRange + (rng.next() - 0.5) * 0.05))

    // Alternar kbDir por escena (el perfil define el "preferido", pero se mezcla)
    if (rng.next() < 0.35) {
      profile.kbDir = profile.kbDir === 'in' ? 'out' : 'in'
    }

    // Variar springStiffness ±15%
    profile.springStiffness = Math.round(
      Math.max(20, Math.min(300, profile.springStiffness * (0.85 + rng.next() * 0.30)))
    )

    // ── 7. Registrar para anti-repetición ────────────────────────────────────
    usedLayouts.add(profile.sceneLayout)
    usedAnims.add(profile.textAnim)
    usedBgTreats.push(profile.bgTreat)

    return profile
  })
}

// ─── Helper: inferir tipos de escena desde los campos layout de scenes ────────

export function inferSceneTypes(
  scenes: Array<{ layout?: string }>,
): SceneType[] {
  return scenes.map((s, i) => {
    if (s.layout === 'intro')   return 'intro'
    if (s.layout === 'cta')     return 'cta'
    if (s.layout === 'content') return 'content'
    // Fallback por posición
    if (i === 0)                return 'intro'
    if (i === scenes.length - 1) return 'cta'
    return 'content'
  })
}

// ─── Utilidad: log del resumen de estilos generados ──────────────────────────

export function logStyleSummary(styles: GeneratedStyle[]): void {
  const summary = styles.map((s, i) =>
    `  [${i}] ${s.sceneLayout.padEnd(9)} | ${s.textAnim.padEnd(12)} | bg:${s.bgTreat.padEnd(10)} | acc:${s.accentType.padEnd(13)} | textY:${s.textY} | align:${s.align}`
  ).join('\n')
  console.log(`[StyleEngine] Generated ${styles.length} styles:\n${summary}`)
}
