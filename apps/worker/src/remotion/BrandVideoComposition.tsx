import React from 'react'
import {
  AbsoluteFill,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Easing,
  Img,
} from 'remotion'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface VideoScene {
  text:              string
  subtext?:          string
  durationInSeconds: number
  layout?:           'intro' | 'content' | 'cta'
  narration?:        string
}

export interface GeneratedStyle {
  textAnim:        TextAnim
  bgTreat:         BgTreat
  accentType:      AccentType
  sceneLayout:     SceneLayout      // estructura visual de la escena
  align:           'center' | 'left'
  textY:           number           // 10–88 posición vertical (%)
  fontWeight:      number           // 200–900
  tracking:        string           // letter-spacing CSS
  subtextUpper:    boolean
  springStiffness: number           // 20–300
  springDamping:   number           // 5–30
  kbDir:           'in' | 'out'
  overlayAlpha:    number           // 0.25–0.82
  kbRange:         number           // 0.04–0.15
  gradAngle:       number           // 0|45|90|135|180|225|270|315
  paddingH:        number           // 65–105
  accentBright:    number           // −20 a +60
  fontScale:       number           // 0.72–1.28
}

// ─── SceneLayout — estructura visual completa de la escena ───────────────────
export type SceneLayout =
  | 'hero'          // texto + imagen full-bleed (default)
  | 'split'         // panel izquierdo oscuro + imagen derecha
  | 'carousel'      // imágenes ciclan con Ken Burns mientras el texto se muestra
  | 'magazine'      // tipografía enorme que ocupa 80% del frame (editorial)
  | 'overlay'       // historia: imagen full-bleed, texto solo en franja inferior
  | 'photoTop'      // foto domina top 60%, panel blanco con texto sube desde abajo
  | 'bigType'       // tipografía monstruosa atraviesa la pantalla, foto pequeña o ausente
  | 'mosaic'        // grilla 2x2 o 3x2 de fotos con texto encajado en una celda
  | 'diagonalSplit' // división diagonal foto/color, no horizontal/vertical
  | 'circleCrop'    // foto en círculo central + texto orbitando, fondo de color
  | 'verticalBand'  // banda vertical de color con texto, foto al lado
  | 'bento'         // bento grid 3x2 con celdas de tamaños variables (NEW)
  | 'tripleStrip'   // 3 bandas horizontales (color/foto/color) con texto en una (NEW)
  | 'floatingCard'  // tarjeta flotante 3D con tilt sobre fondo de color (NEW)
  | 'typeMask'      // foto recortada DENTRO de la silueta de un texto gigante (NEW)
  | 'zoomFrame'     // foto en marco/ventana centrada + texto alrededor (NEW)

// ─── TextAnim — cómo entra el texto ─────────────────────────────────────────
export type TextAnim =
  | 'punchIn'      // escala 1.6 → 1.0, overshoot
  | 'slideUp'      // sube desde abajo
  | 'slideDown'    // cae desde arriba
  | 'slideLeft'    // entra desde la izquierda
  | 'slideRight'   // entra desde la derecha
  | 'wordByWord'   // palabra a palabra con stagger
  | 'blurReveal'   // desenfocado → nítido
  | 'rotateIn'     // rotación sutil
  | 'zoomIn'       // zoom cinematográfico
  | 'fadeOnly'     // solo opacidad
  | 'typewriter'   // caracteres aparecen uno a uno
  | 'glitch'       // aberración cromática → estabiliza
  | 'letterDrop'   // letras caen en stagger desde arriba
  | 'elastic'      // rebote elástico pronunciado
  | 'scramble'     // caracteres aleatorios → resuelve el texto real
  | 'cascadeUp'    // palabras ascienden en oleada escalonada
  | 'morphReveal'  // texto emerge de un blob desenfocado → nítido
  | 'flipIn'       // volteo horizontal dramático
  | 'splitReveal'  // dos mitades se deslizan juntas desde los lados
  | 'popIn'        // pop explosivo desde escala 0 con spring duro
  | 'marquee'      // texto se desliza horizontalmente como ticker
  | 'maskWipe'     // máscara horizontal/diagonal revela el texto
  | 'swirlIn'      // palabras llegan en espiral con rotación
  | 'shake3D'      // texto entra con vibración + perspectiva 3D
  | 'liquidWipe'   // wipe orgánico con clip-path animado
  | 'verticalize'  // texto rotado 90° desliza desde arriba
  | 'staggerDrop'  // letras caen una a una con bounce físico desigual
  | 'zoomBlur'     // entra desde muy lejos con desenfoque cinematográfico
  | 'breathe'      // pulso sutil continuo, ideal para CTA
  | 'colorCycle'   // texto que cicla por los colores de marca al entrar
  | 'slideArc'     // entrada con trayectoria curva (no recta)
  | 'expandOut'    // letras parten del centro y se expanden hacia afuera
  | 'chromaShift'  // aberración cromática persistente sutil
  | 'glitchTV'     // glitch tipo TV vieja con scanlines y aberración
  | 'paperFold'    // texto se desdobla como hoja de papel
  | 'neonFlicker'  // letras parpadean tipo letrero neón con glow
  | 'slingShot'    // texto rebota como tirachinas desde el borde
  | 'spiralIn'     // texto entra rotando en espiral hacia el centro
  | 'wobbleIn'     // texto entra con bamboleo orgánico tipo gelatina
  | 'splitFlap'    // efecto split-flap display de aeropuerto
  | 'inkBleed'     // tinta que se expande desde un punto, blur orgánico
  | 'colorPour'    // color "se vierte" llenando el texto de abajo hacia arriba (NEW)
  | 'mirrorIn'     // texto aparece junto con su reflejo invertido debajo (NEW)
  | 'shutterReveal'// láminas verticales tipo persiana se abren (NEW)
  | 'pulseRing'    // anillos concéntricos pulsan al fondo + texto fadeIn (NEW)
  | 'magnetSnap'   // letras vienen flotando desordenadas y se "snap" a su posición (NEW)
  | 'curtainDrop'  // cortina cae verticalmente revelando el texto (NEW)
  | 'lensZoom'     // zoom de lente con foco que se aclara (NEW)
  | 'dashStroke'   // letras se dibujan como trazo de bolígrafo con stroke (NEW)
  | 'stampIn'      // sello de goma: impacto seco + squish, sin overshoot elástico
  | 'zoomOut'      // opuesto de zoomIn: parte ENORME y se contrae con rack-focus
  | 'windSweep'    // único skewX: llega inclinado por el viento y se endereza
  | 'scanReveal'   // clip rectangular limpio izq→der (diferente del diagonal maskWipe)
  | 'neonBuild'    // el glow del texto se construye hasta revelar (diferente al flicker)
  | 'accelDrop'    // gravedad pura Easing.in(cubic) + squish al aterrizar, sin rebote
  | 'stretchIn'    // único scaleX: entra comprimido horizontal y se expande
  | 'implode'      // coalesce desde partículas dispersas hacia el centro
  | 'flipReveal'   // rotateY 3D real (diferente a flipIn que usa scaleY)
  | 'textRise'     // clip de abajo hacia arriba — el texto emerge del piso

// ─── BgTreat — tratamiento del fondo ────────────────────────────────────────
export type BgTreat =
  | 'dark'           // overlay negro fuerte
  | 'tint'           // overlay + tinte de color de marca
  | 'panel'          // fondo sólido de marca
  | 'vignette'       // viñeta radial
  | 'split'          // gradiente lateral
  | 'minimal'        // overlay muy ligero
  | 'duotone'        // tinte bicolor sobre foto
  | 'colorBurn'      // alto contraste vivido
  | 'cinematic'      // letterbox ancho + oscuridad total
  | 'glassmorphism'  // glass translúcido + highlight
  | 'paperGrid'      // trama de cuadrícula técnica
  | 'colorBlock'     // bloque sólido de color de marca (sin foto encima)
  | 'colorWash'      // foto teñida con color de marca dominante (poco negro)
  | 'gradientBurst'  // gradiente radial de color de marca explotando desde un punto
  | 'striped'        // franjas diagonales de 2-3 colores de marca
  | 'wavePattern'    // ondas SVG fluidas de color de marca
  | 'spotlight'      // foto con un único spotlight cónico iluminando el área del texto
  | 'dotMatrix'      // patrón de puntos de color que pulsa (NEW)
  | 'meshGradient'   // gradiente mesh multicolor estilo CSS conic-gradient (NEW)
  | 'paperTexture'   // textura de papel suave con tinte de marca (NEW)

// ─── AccentType — elemento decorativo ────────────────────────────────────────
export type AccentType =
  | 'vbar'          // barra vertical izquierda
  | 'hline'         // letterbox cinemático
  | 'bracket'       // bloque grueso izquierdo
  | 'pill'          // etiqueta/tag flotante
  | 'circle'        // anillo decorativo
  | 'diagonal'      // franja diagonal
  | 'grid'          // trama de puntos
  | 'none'          // sin elemento
  | 'cornerBracket' // corchetes en las 4 esquinas
  | 'particles'     // partículas flotantes animadas
  | 'neonBorder'    // borde neón brillante
  | 'filmstrip'     // tira de película decorativa
  | 'tiltCard'      // cards decorativas rotadas detrás del contenido
  | 'badgePop'      // pill badge animado en esquina superior
  | 'arrowMark'     // flecha gruesa que aparece apuntando al texto (NEW)
  | 'noiseTexture'  // grano/ruido sutil sobre toda la escena (NEW)
  | 'colorFrame'    // marco grueso de color de marca alrededor del frame (NEW)
  | 'sticker'       // sticker rotado de marca tipo "NEW" o brand-name (NEW)
  | 'orbitDots'     // puntos en órbita circular alrededor del centro (NEW)

export interface BrandVideoProps {
  scenes:               VideoScene[]
  brandColor:           string
  secondaryColor?:      string
  accentColor?:         string
  brandName?:           string
  logoUrl?:             string
  referenceImageUrls?:  string[]
  seed?:                number
  generatedStyle?:      GeneratedStyle
  sceneStyles?:         GeneratedStyle[]
}

// ─── Tipografía adaptativa ────────────────────────────────────────────────────
// Para layouts con tipografía gigante (bigType, typeMask, magazine, floatingCard)
// el texto largo desbordaba y se solapaba con el subtext.
// fitFontSize calcula el tamaño que CABE dado el ancho disponible.

function fitFontSize(
  text: string,
  maxWidth: number,
  baseSize: number,
  scale: number,
  opts: { minSize?: number; charRatio?: number; maxLines?: number } = {},
): number {
  const minSize  = opts.minSize  ?? 48
  const charRatio = opts.charRatio ?? 0.52  // avg system-ui character/fontSize ratio
  const maxLines = opts.maxLines ?? 1
  const target   = baseSize * scale

  // Si el texto puede caber en `maxLines` líneas, retornar el target
  const chars        = Math.max(1, text.length)
  const lineCapacity = maxWidth / (target * charRatio)
  if (chars / maxLines <= lineCapacity) return target

  // Si no cabe, reducir hasta que entre en `maxLines`
  const requiredPerLine = chars / maxLines
  const fitSize         = maxWidth / (requiredPerLine * charRatio)
  return Math.max(minSize, Math.min(target, fitSize))
}

// ─── Color helpers ────────────────────────────────────────────────────────────

function hexToRgb(hex: string): [number, number, number] {
  // Manejar formato rgb(r, g, b) por si llega uno
  const rgbMatch = hex.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/)
  if (rgbMatch) return [Number(rgbMatch[1]), Number(rgbMatch[2]), Number(rgbMatch[3])]
  const cleaned = hex.replace('#', '')
  const r = parseInt(cleaned.slice(0, 2), 16)
  const g = parseInt(cleaned.slice(2, 4), 16)
  const b = parseInt(cleaned.slice(4, 6), 16)
  return [isNaN(r) ? 30 : r, isNaN(g) ? 30 : g, isNaN(b) ? 30 : b]
}

function shiftColor(hex: string, delta: number): string {
  const [r, g, b] = hexToRgb(hex)
  const c = (v: number) => Math.max(0, Math.min(255, v + delta))
  const h = (v: number) => c(v).toString(16).padStart(2, '0')
  return `#${h(r)}${h(g)}${h(b)}`
}

function hexToRgba(hex: string, alpha: number): string {
  const [r, g, b] = hexToRgb(hex)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

function seededRand(seed: number, index: number): number {
  const s = Math.abs(Math.sin(seed * 127.1 + index * 311.7)) * 43758.5453
  return s - Math.floor(s)
}

// ─── Organic drift — Perlin-like camera movement via stacked sines ────────────
function organicDrift(frame: number, driftSeed: number): { x: number; y: number } {
  const s = Math.abs(driftSeed) % 9973
  const x = Math.sin(frame * 0.0072 + s * 0.001231) * 12
          + Math.sin(frame * 0.0139 + s * 0.002347) * 5
  const y = Math.cos(frame * 0.0054 + s * 0.001873) * 9
          + Math.cos(frame * 0.0108 + s * 0.003147) * 4
  return { x, y }
}

// ─── Validación y sanitización ────────────────────────────────────────────────

const VALID_TEXT_ANIMS: readonly TextAnim[] = [
  'punchIn','slideUp','slideDown','slideLeft','slideRight',
  'wordByWord','blurReveal','rotateIn','zoomIn','fadeOnly',
  'typewriter','glitch','letterDrop','elastic','scramble',
  'cascadeUp','morphReveal','flipIn','splitReveal','popIn',
  'marquee','maskWipe','swirlIn','shake3D','liquidWipe','verticalize','staggerDrop',
  'zoomBlur','breathe','colorCycle','slideArc','expandOut','chromaShift',
  'glitchTV','paperFold','neonFlicker','slingShot','spiralIn','wobbleIn','splitFlap','inkBleed',
  'colorPour','mirrorIn','shutterReveal','pulseRing','magnetSnap','curtainDrop','lensZoom','dashStroke',
  'stampIn','zoomOut','windSweep','scanReveal','neonBuild','accelDrop','stretchIn','implode','flipReveal','textRise',
]
const VALID_BG_TREATS: readonly BgTreat[] = [
  'dark','tint','panel','vignette','split','minimal',
  'duotone','colorBurn','cinematic','glassmorphism','paperGrid',
  'colorBlock','colorWash','gradientBurst','striped','wavePattern','spotlight',
  'dotMatrix','meshGradient','paperTexture',
]
const VALID_ACCENT_TYPES: readonly AccentType[] = [
  'vbar','hline','bracket','pill','circle','diagonal','grid','none',
  'cornerBracket','particles','neonBorder','filmstrip','tiltCard','badgePop',
  'arrowMark','noiseTexture','colorFrame','sticker','orbitDots',
]
const VALID_SCENE_LAYOUTS: readonly SceneLayout[] = [
  'hero','split','carousel','magazine','overlay','photoTop',
  'bigType','mosaic','diagonalSplit','circleCrop','verticalBand',
  'bento','tripleStrip','floatingCard','typeMask','zoomFrame',
]
const VALID_GRAD_ANGLES = [0,45,90,135,180,225,270,315]

function sanitizeStyle(raw: Partial<GeneratedStyle>): GeneratedStyle {
  const clamp  = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v || 0))
  const inList = <T,>(v: unknown, list: readonly T[], def: T): T => (list as unknown[]).includes(v) ? v as T : def
  let textY = typeof raw.textY === 'number' ? raw.textY : 50
  if (textY === 50 && (raw as Record<string, unknown>)['vAlign'] === 'bottom') textY = 72
  return {
    textAnim:        inList(raw.textAnim,    VALID_TEXT_ANIMS,    'slideUp'),
    bgTreat:         inList(raw.bgTreat,     VALID_BG_TREATS,     'dark'),
    accentType:      inList(raw.accentType,  VALID_ACCENT_TYPES,  'vbar'),
    sceneLayout:     inList(raw.sceneLayout, VALID_SCENE_LAYOUTS, 'hero'),
    align:           raw.align === 'center' ? 'center' : 'left',
    textY:           clamp(textY, 10, 88),
    fontWeight:      Math.round(clamp(raw.fontWeight ?? 700, 200, 900) / 100) * 100,
    tracking:        typeof raw.tracking === 'string' ? raw.tracking : '0em',
    subtextUpper:    raw.subtextUpper === true,
    springStiffness: clamp(raw.springStiffness ?? 80, 20, 300),
    springDamping:   clamp(raw.springDamping   ?? 18, 5,  30),
    kbDir:           raw.kbDir === 'out' ? 'out' : 'in',
    overlayAlpha:    clamp(raw.overlayAlpha ?? 0.60, 0.25, 0.82),
    kbRange:         clamp(raw.kbRange      ?? 0.08, 0.04, 0.15),
    gradAngle:       VALID_GRAD_ANGLES.includes(raw.gradAngle ?? -1) ? raw.gradAngle! : 135,
    paddingH:        clamp(raw.paddingH    ?? 80, 65, 105),
    accentBright:    clamp(raw.accentBright ?? 0, -20, 60),
    fontScale:       clamp(raw.fontScale   ?? 1.0, 0.72, 1.28),
  }
}

function fallbackStyle(seed: number): GeneratedStyle {
  const anims:   TextAnim[]   = ['punchIn','slideUp','slideLeft','wordByWord','blurReveal','rotateIn','slideDown','zoomIn','typewriter','glitch','letterDrop','elastic','scramble','fadeOnly','cascadeUp','morphReveal','flipIn','splitReveal','popIn','marquee','maskWipe','swirlIn','shake3D','liquidWipe','verticalize','staggerDrop','zoomBlur','breathe','colorCycle','slideArc','expandOut','chromaShift','glitchTV','paperFold','neonFlicker','slingShot','spiralIn','wobbleIn','splitFlap','inkBleed','colorPour','mirrorIn','shutterReveal','pulseRing','magnetSnap','curtainDrop','lensZoom','dashStroke']
  const bgs:     BgTreat[]   = ['dark','tint','panel','vignette','split','minimal','duotone','colorBurn','cinematic','glassmorphism','paperGrid','colorBlock','colorWash','gradientBurst','striped','wavePattern','spotlight','dotMatrix','meshGradient','paperTexture']
  const accs:    AccentType[] = ['vbar','hline','bracket','pill','circle','diagonal','grid','none','cornerBracket','particles','neonBorder','filmstrip','tiltCard','badgePop','arrowMark','noiseTexture','colorFrame','sticker','orbitDots']
  const layouts: SceneLayout[] = ['hero','split','carousel','magazine','overlay','photoTop','bigType','mosaic','diagonalSplit','circleCrop','verticalBand','bento','tripleStrip','floatingCard','typeMask','zoomFrame']
  const i = (n: number, x: number) => Math.floor(Math.abs(Math.sin(seed * 127.1 + x * 311.7)) * 43758.5453 % n)
  const textYOptions = [14, 22, 38, 50, 62, 72, 80]
  return sanitizeStyle({
    textAnim:        anims[i(anims.length, 0)],
    bgTreat:         bgs[i(bgs.length, 1)],
    accentType:      accs[i(accs.length, 2)],
    sceneLayout:     layouts[i(layouts.length, 17)],
    align:           i(2, 3) === 0 ? 'center' : 'left',
    textY:           textYOptions[i(textYOptions.length, 4)]!,
    fontWeight:      [300,400,600,700,800,900][i(6, 5)]!,
    tracking:        ['-0.05em','-0.02em','0em','0.04em','0.08em','0.14em','0.20em'][i(7, 6)]!,
    subtextUpper:    i(2, 7) === 0,
    springStiffness: 30 + i(270, 8),
    springDamping:   6  + i(24, 9),
    kbDir:           i(2, 10) === 0 ? 'in' : 'out',
    overlayAlpha:    0.30 + (seededRand(seed, 11) * 0.50),
    kbRange:         0.04 + (seededRand(seed, 12) * 0.11),
    gradAngle:       VALID_GRAD_ANGLES[i(8, 13)]!,
    paddingH:        68 + i(38, 14),
    accentBright:    i(80, 15) - 20,
    fontScale:       0.75 + (seededRand(seed, 16) * 0.53),
  })
}

// ─── TextReveal — 15 tipos de animación ──────────────────────────────────────

interface TextRevealProps {
  text:       string
  frame:      number
  fps:        number
  delay:      number
  gs:         GeneratedStyle
  fontSize:   number
  color:      string
  shadow?:    string
  maxWidth?:  number
  textAlign?: React.CSSProperties['textAlign']
  extraStyle?: React.CSSProperties
}

const TextReveal: React.FC<TextRevealProps> = ({
  text, frame, fps, delay, gs, fontSize, color, shadow, maxWidth, textAlign, extraStyle,
}) => {
  const f   = Math.max(0, frame - delay)
  const cfg = { stiffness: gs.springStiffness, damping: gs.springDamping }
  const base: React.CSSProperties = {
    color, fontSize,
    fontWeight:    gs.fontWeight,
    fontFamily:    'system-ui, -apple-system, "Segoe UI", Arial, sans-serif',
    margin: 0,
    lineHeight:    gs.tracking.includes('0.1') || gs.tracking.includes('0.2') ? 1.30 : 1.05,
    letterSpacing: gs.tracking,
    maxWidth:      maxWidth ?? 900,
    textAlign:     textAlign ?? (gs.align === 'center' ? 'center' : 'left'),
    textShadow:    shadow ?? 'none',
    ...extraStyle,
  }

  // ── Persistent motion: tilt on energetic entries + float on calm profiles ────
  const energeticAnims: TextAnim[] = ['punchIn','elastic','popIn','cascadeUp','splitReveal','letterDrop','wordByWord']
  const hasTilt   = energeticAnims.includes(gs.textAnim) && gs.fontWeight >= 600
  const tiltSign  = gs.align === 'left' ? -1 : 1
  const tiltMax   = hasTilt ? (gs.fontWeight >= 800 ? 1.4 : 0.8) * tiltSign : 0
  const tiltDecay = spring({ frame: f, fps, config: { stiffness: 24, damping: 18 }, durationInFrames: 52 })
  const pmTilt    = tiltMax * Math.max(0, 1 - tiltDecay)
  const isCalm    = gs.springStiffness <= 90
  const fMax      = isCalm ? (gs.fontWeight <= 400 ? 2.8 : gs.fontWeight <= 600 ? 1.8 : 1.0) : 0
  const pmFloat   = f > 40 ? Math.sin(f * 0.016 + gs.gradAngle * 0.02) * fMax : 0
  const pmStr     = [
    Math.abs(pmTilt)  > 0.001 ? `rotate(${pmTilt.toFixed(3)}deg)` : '',
    Math.abs(pmFloat) > 0.1   ? `translateY(${pmFloat.toFixed(2)}px)` : '',
  ].filter(Boolean).join(' ') || undefined
  // pm(t) — prepend persistent motion to any existing CSS transform string
  const pm = (t?: string): string | undefined =>
    pmStr ? (t ? `${pmStr} ${t}` : pmStr) : t
  // wrap() — for multi-element containers where `pm()` can't merge transforms
  const wrap = (el: React.ReactElement): React.ReactElement => {
    if (!pmStr) return el
    return (
      <div style={{ transform: pmStr, transformOrigin: gs.align === 'center' ? 'center center' : 'left center' }}>
        {el}
      </div>
    )
  }

  if (gs.textAnim === 'punchIn') {
    const prog  = spring({ frame: f, fps, config: cfg, durationInFrames: 18 })
    const scale = interpolate(prog, [0, 1], [1.6, 1.0])
    const op    = interpolate(frame - delay, [0, 3], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
    return <h1 style={{ ...base, opacity: op, transform: pm(`scale(${scale})`), transformOrigin: gs.align === 'center' ? 'center' : 'left center' }}>{text}</h1>
  }

  if (gs.textAnim === 'slideUp') {
    const prog = spring({ frame: f, fps, config: cfg, durationInFrames: 32 })
    const y    = interpolate(prog, [0, 1], [72, 0])
    return <h1 style={{ ...base, opacity: prog, transform: pm(`translateY(${y}px)`) }}>{text}</h1>
  }

  if (gs.textAnim === 'slideDown') {
    const prog = spring({ frame: f, fps, config: cfg, durationInFrames: 32 })
    const y    = interpolate(prog, [0, 1], [-72, 0])
    return <h1 style={{ ...base, opacity: prog, transform: pm(`translateY(${y}px)`) }}>{text}</h1>
  }

  if (gs.textAnim === 'slideLeft') {
    const prog = spring({ frame: f, fps, config: cfg, durationInFrames: 28 })
    const x    = interpolate(prog, [0, 1], [-110, 0])
    return <h1 style={{ ...base, opacity: prog, transform: pm(`translateX(${x}px)`) }}>{text}</h1>
  }

  if (gs.textAnim === 'slideRight') {
    const prog = spring({ frame: f, fps, config: cfg, durationInFrames: 28 })
    const x    = interpolate(prog, [0, 1], [110, 0])
    return <h1 style={{ ...base, opacity: prog, transform: pm(`translateX(${x}px)`) }}>{text}</h1>
  }

  if (gs.textAnim === 'wordByWord') {
    const words   = text.split(' ')
    const wordGap = Math.max(2, Math.round(280 / gs.springStiffness))
    return wrap(
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.22em', justifyContent: gs.align === 'center' ? 'center' : 'flex-start', maxWidth: maxWidth ?? 900, ...extraStyle }}>
        {words.map((word, wi) => {
          const wf   = Math.max(0, f - wi * wordGap)
          const prog = spring({ frame: wf, fps, config: cfg, durationInFrames: 20 })
          const y    = interpolate(prog, [0, 1], [40, 0])
          return <span key={wi} style={{ ...base, opacity: prog, transform: `translateY(${y}px)`, display: 'inline-block', maxWidth: undefined, textAlign: undefined }}>{word}</span>
        })}
      </div>
    )
  }

  if (gs.textAnim === 'blurReveal') {
    const dur  = Math.round(50 * (100 / Math.max(20, gs.springStiffness)))
    const prog = spring({ frame: f, fps, config: cfg, durationInFrames: Math.max(18, dur) })
    const blur = interpolate(prog, [0, 1], [24, 0])
    const op   = interpolate(prog, [0, 0.22], [0, 1])
    return <h1 style={{ ...base, opacity: op, filter: `blur(${blur}px)`, transform: pm() }}>{text}</h1>
  }

  if (gs.textAnim === 'rotateIn') {
    const prog = spring({ frame: f, fps, config: cfg, durationInFrames: 30 })
    const rot  = interpolate(prog, [0, 1], [-8, 0])
    const y    = interpolate(prog, [0, 1], [52, 0])
    return <h1 style={{ ...base, opacity: prog, transform: pm(`translateY(${y}px) rotate(${rot}deg)`), transformOrigin: 'left bottom' }}>{text}</h1>
  }

  if (gs.textAnim === 'zoomIn') {
    const prog  = spring({ frame: f, fps, config: { stiffness: Math.min(gs.springStiffness, 100), damping: gs.springDamping }, durationInFrames: 36 })
    const scale = interpolate(prog, [0, 1], [0.80, 1.0])
    const op    = interpolate(prog, [0, 0.35], [0, 1])
    return <h1 style={{ ...base, opacity: op, transform: pm(`scale(${scale})`), transformOrigin: gs.align === 'center' ? 'center' : 'left center' }}>{text}</h1>
  }

  // ── NEW: typewriter ──────────────────────────────────────────────────────────
  if (gs.textAnim === 'typewriter') {
    const chars    = text.split('')
    const perChar  = Math.max(1.2, 35 / chars.length) // frames entre caracteres
    const totalDur = chars.length * perChar
    const op       = interpolate(f, [0, 4], [0, 1], { extrapolateRight: 'clamp' })
    return (
      <h1 style={{ ...base, opacity: op, transform: pm() }}>
        {chars.map((char, ci) => {
          const startF   = ci * perChar
          const charProg = interpolate(f, [startF, startF + 2], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
          const cursorActive = Math.abs(f - (ci * perChar)) < 3
          return (
            <span key={ci} style={{ opacity: charProg, display: 'inline' }}>
              {char}
            </span>
          )
        })}
        {/* Cursor parpadeante */}
        <span style={{
          opacity: f < totalDur + 10 ? (Math.floor(f / 4) % 2 === 0 ? 1 : 0) : 0,
          display: 'inline-block',
          width: fontSize * 0.5,
          height: fontSize * 0.85,
          background: color,
          marginLeft: 4,
          verticalAlign: 'middle',
        }} />
      </h1>
    )
  }

  // ── NEW: glitch ──────────────────────────────────────────────────────────────
  if (gs.textAnim === 'glitch') {
    // Grid con 3 h1 en la misma celda — alineación perfecta sea center o left.
    const settling     = f < 24
    const glitchActive = settling && Math.floor(f / 3) % 2 === 0
    const offsetX      = glitchActive ? Math.sin(f * 17.3) * 10 : 0
    const offsetY      = glitchActive ? Math.cos(f * 11.7) * 4 : 0
    const op           = interpolate(f, [0, 6], [0, 1], { extrapolateRight: 'clamp' })
    const finalScale   = spring({ frame: Math.max(0, f - 20), fps, config: { stiffness: 200, damping: 22 }, durationInFrames: 14 })
    return wrap(
      <div style={{ display: 'grid', justifyItems: gs.align === 'center' ? 'center' : 'start', ...extraStyle }}>
        {glitchActive && (
          <>
            <h1 style={{ ...base, gridArea: '1 / 1', color: 'rgba(255,30,90,0.7)', transform: `translate(${offsetX}px, ${offsetY}px)`, filter: 'blur(1.5px)', margin: 0 }}>{text}</h1>
            <h1 style={{ ...base, gridArea: '1 / 1', color: 'rgba(0,220,255,0.7)', transform: `translate(${-offsetX * 0.8}px, ${-offsetY}px)`, filter: 'blur(1.5px)', margin: 0 }}>{text}</h1>
          </>
        )}
        <h1 style={{ ...base, gridArea: '1 / 1', opacity: op, transform: settling ? `translate(${offsetX * 0.2}px, 0) scale(${1 - (1 - finalScale) * 0.05})` : 'none' }}>{text}</h1>
      </div>
    )
  }

  // ── NEW: letterDrop ──────────────────────────────────────────────────────────
  if (gs.textAnim === 'letterDrop') {
    const chars      = text.split('')
    const letterDelay = Math.max(1.5, Math.round(180 / gs.springStiffness))
    return wrap(
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.05em', justifyContent: gs.align === 'center' ? 'center' : 'flex-start', maxWidth: maxWidth ?? 900, ...extraStyle }}>
        {chars.map((char, ci) => {
          const cf   = Math.max(0, f - ci * letterDelay)
          const prog = spring({ frame: cf, fps, config: { stiffness: gs.springStiffness, damping: gs.springDamping }, durationInFrames: 22 })
          const y    = interpolate(prog, [0, 1], [-90, 0])
          const rot  = interpolate(prog, [0, 1], [-15, 0])
          return (
            <span key={ci} style={{ ...base, opacity: prog, transform: `translateY(${y}px) rotate(${rot}deg)`, display: 'inline-block', maxWidth: undefined, textAlign: undefined }}>
              {char === ' ' ? ' ' : char}
            </span>
          )
        })}
      </div>
    )
  }

  // ── NEW: elastic ─────────────────────────────────────────────────────────────
  if (gs.textAnim === 'elastic') {
    const prog  = spring({ frame: f, fps, config: { stiffness: 350, damping: 7 }, durationInFrames: 45 })
    const scale = interpolate(prog, [0, 1], [0.0, 1.0])
    const op    = interpolate(f, [0, 4], [0, 1], { extrapolateRight: 'clamp' })
    return <h1 style={{ ...base, opacity: op, transform: pm(`scale(${scale})`), transformOrigin: gs.align === 'center' ? 'center' : 'left center' }}>{text}</h1>
  }

  // ── NEW: scramble ─────────────────────────────────────────────────────────────
  if (gs.textAnim === 'scramble') {
    const totalFrames = Math.max(20, Math.round(fps * 0.9))
    const progress    = Math.min(1, f / totalFrames)
    const resolvedN   = Math.floor(text.length * progress)
    const pool        = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#@$%&?!'
    const op          = interpolate(f, [0, 4], [0, 1], { extrapolateRight: 'clamp' })
    return (
      <h1 style={{ ...base, opacity: op, transform: pm() }}>
        {text.split('').map((char, ci) => {
          if (char === ' ') return <span key={ci}>&nbsp;</span>
          if (ci < resolvedN) return <span key={ci}>{char}</span>
          const scrambled = pool[Math.floor(Math.abs(Math.sin(ci * 1337.7 + f * 0.3)) * pool.length) % pool.length]!
          return <span key={ci} style={{ opacity: 0.55, color: hexToRgba('#ffffff', 0.7) }}>{scrambled}</span>
        })}
      </h1>
    )
  }

  // ── NEW: popIn — pop explosivo desde escala 0 (mobile card pop) ─────────────
  if (gs.textAnim === 'popIn') {
    const pop   = spring({ frame: f, fps, config: { stiffness: 420, damping: 20 }, durationInFrames: 18 })
    const scale = interpolate(pop, [0, 1], [0.0, 1.0])
    const op    = interpolate(f, [0, 3], [0, 1], { extrapolateRight: 'clamp' })
    return (
      <h1 style={{ ...base, opacity: op, transform: pm(`scale(${scale})`), transformOrigin: gs.align === 'center' ? 'center' : 'left center' }}>
        {text}
      </h1>
    )
  }

  // ── NEW: cascadeUp — palabras ascienden en oleada escalonada ────────────────
  if (gs.textAnim === 'cascadeUp') {
    const words   = text.split(' ')
    const wordGap = Math.max(3, Math.round(200 / Math.max(30, gs.springStiffness)))
    const cfg2    = { stiffness: Math.min(gs.springStiffness, 200), damping: Math.max(gs.springDamping, 14) }
    return wrap(
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.22em', justifyContent: gs.align === 'center' ? 'center' : 'flex-start', maxWidth: maxWidth ?? 900, overflow: 'hidden', ...extraStyle }}>
        {words.map((word, wi) => {
          const wf   = Math.max(0, f - wi * wordGap)
          const prog = spring({ frame: wf, fps, config: cfg2, durationInFrames: 24 })
          const y    = interpolate(prog, [0, 1], [80, 0])
          const op   = interpolate(prog, [0, 0.2], [0, 1])
          return (
            <span key={wi} style={{ ...base, opacity: op, transform: `translateY(${y}px)`, display: 'inline-block', maxWidth: undefined, textAlign: undefined }}>
              {word}
            </span>
          )
        })}
      </div>
    )
  }

  // ── NEW: morphReveal — texto emerge de un blob → nítido ──────────────────────
  if (gs.textAnim === 'morphReveal') {
    const prog   = spring({ frame: f, fps, config: { stiffness: Math.min(gs.springStiffness, 80), damping: gs.springDamping }, durationInFrames: 38 })
    const blur   = interpolate(prog, [0, 1], [28, 0])
    const scale  = interpolate(prog, [0, 1], [1.18, 1.0])
    const op     = interpolate(prog, [0, 0.18], [0, 1])
    return (
      <h1 style={{ ...base, opacity: op, filter: `blur(${blur}px)`, transform: pm(`scale(${scale})`), transformOrigin: gs.align === 'center' ? 'center' : 'left center' }}>
        {text}
      </h1>
    )
  }

  // ── NEW: flipIn — volteo horizontal dramático ─────────────────────────────────
  if (gs.textAnim === 'flipIn') {
    const prog   = spring({ frame: f, fps, config: { stiffness: Math.min(gs.springStiffness, 220), damping: gs.springDamping }, durationInFrames: 26 })
    const scaleY = interpolate(prog, [0, 0.45, 1], [0.0, 0.08, 1.0])
    const op     = interpolate(prog, [0, 0.35, 1], [0, 0, 1])
    const skewX  = interpolate(prog, [0, 0.5, 1], [-6, -2, 0])
    return (
      <h1 style={{ ...base, opacity: op, transform: pm(`scaleY(${scaleY}) skewX(${skewX}deg)`), transformOrigin: gs.align === 'center' ? 'center bottom' : 'left bottom' }}>
        {text}
      </h1>
    )
  }

  // ── NEW: splitReveal — dos mitades convergen desde los lados ─────────────────
  if (gs.textAnim === 'splitReveal') {
    const prog   = spring({ frame: f, fps, config: { stiffness: Math.min(gs.springStiffness, 180), damping: gs.springDamping }, durationInFrames: 28 })
    const offset = interpolate(prog, [0, 1], [120, 0])
    const op     = interpolate(prog, [0, 0.1], [0, 1])
    return wrap(
      <div style={{ position: 'relative', overflow: 'hidden', maxWidth: maxWidth ?? 900, ...extraStyle }}>
        {/* Mitad izquierda */}
        <h1 style={{ ...base, opacity: op, clipPath: 'inset(0 50% 0 0)', transform: `translateX(${-offset}px)`, maxWidth: undefined }}>
          {text}
        </h1>
        {/* Mitad derecha — superpuesta */}
        <h1 style={{ ...base, opacity: op, clipPath: 'inset(0 0 0 50%)', transform: `translateX(${offset}px)`, position: 'absolute', top: 0, left: 0, right: 0, maxWidth: undefined }}>
          {text}
        </h1>
      </div>
    )
  }

  // ── marquee — entra desde la derecha y se queda visible (no sale del frame) ─
  if (gs.textAnim === 'marquee') {
    // Antes: salía del frame a -60% y no volvía. Ahora: entra y se queda.
    const enter = spring({ frame: f, fps, config: { stiffness: 65, damping: 22 }, durationInFrames: 38 })
    const dist  = interpolate(enter, [0, 1], [110, 0])  // % desde la derecha hacia el centro
    const op    = interpolate(f, [0, 4], [0, 1], { extrapolateRight: 'clamp' })
    // Pequeño drift continuo después del entry para mantener vida
    const post  = Math.max(0, f - 40)
    const drift = Math.sin(post * 0.025) * 1.5
    return (
      <div style={{ overflow: 'hidden', maxWidth: '100%', ...extraStyle }}>
        <h1 style={{ ...base, opacity: op, transform: pm(`translateX(${dist + drift}%)`), whiteSpace: 'nowrap' }}>
          {text}
        </h1>
      </div>
    )
  }

  // ── NEW: maskWipe — máscara revela el texto en wipe diagonal ────────────────
  if (gs.textAnim === 'maskWipe') {
    const wipe = spring({ frame: f, fps, config: { stiffness: 90, damping: 22 }, durationInFrames: 32 })
    const pct  = interpolate(wipe, [0, 1], [100, 0])
    const op   = interpolate(f, [0, 3], [0, 1], { extrapolateRight: 'clamp' })
    return (
      <h1 style={{
        ...base, opacity: op, transform: pm(),
        clipPath: `polygon(0 0, ${100 - pct}% 0, ${100 - pct + 8}% 100%, 0 100%)`,
      }}>
        {text}
      </h1>
    )
  }

  // ── NEW: swirlIn — palabras entran en espiral con rotación ──────────────────
  if (gs.textAnim === 'swirlIn') {
    const words   = text.split(' ')
    const wordGap = Math.max(2, Math.round(220 / gs.springStiffness))
    return wrap(
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.22em', justifyContent: gs.align === 'center' ? 'center' : 'flex-start', maxWidth: maxWidth ?? 900, ...extraStyle }}>
        {words.map((word, wi) => {
          const wf    = Math.max(0, f - wi * wordGap)
          const prog  = spring({ frame: wf, fps, config: { stiffness: Math.min(gs.springStiffness, 180), damping: gs.springDamping }, durationInFrames: 28 })
          const sc    = interpolate(prog, [0, 1], [0.0, 1.0])
          const rot   = interpolate(prog, [0, 1], [(wi % 2 ? -180 : 180), 0])
          const op    = interpolate(prog, [0, 0.25], [0, 1])
          return (
            <span key={wi} style={{ ...base, opacity: op, transform: `scale(${sc}) rotate(${rot}deg)`, display: 'inline-block', maxWidth: undefined, textAlign: undefined, transformOrigin: 'center center' }}>
              {word}
            </span>
          )
        })}
      </div>
    )
  }

  // ── NEW: shake3D — texto vibra y se asienta con perspectiva 3D ──────────────
  if (gs.textAnim === 'shake3D') {
    const settling = f < 28
    const shakeX   = settling ? Math.sin(f * 1.6) * (1 - f / 28) * 18 : 0
    const shakeY   = settling ? Math.cos(f * 2.1) * (1 - f / 28) * 8  : 0
    const persp    = spring({ frame: f, fps, config: { stiffness: 110, damping: 18 }, durationInFrames: 24 })
    const rotY     = interpolate(persp, [0, 1], [38, 0])
    const op       = interpolate(f, [0, 4], [0, 1], { extrapolateRight: 'clamp' })
    return (
      <div style={{ perspective: 1200, ...extraStyle }}>
        <h1 style={{ ...base, opacity: op, transform: pm(`translate(${shakeX}px, ${shakeY}px) rotateY(${rotY}deg)`), transformOrigin: gs.align === 'center' ? 'center center' : 'left center' }}>
          {text}
        </h1>
      </div>
    )
  }

  // ── NEW: liquidWipe — clip-path orgánico animado ────────────────────────────
  if (gs.textAnim === 'liquidWipe') {
    const wipe = spring({ frame: f, fps, config: { stiffness: 70, damping: 24 }, durationInFrames: 36 })
    const b    = interpolate(wipe, [0, 1], [0, 100])
    const wob  = Math.sin(f * 0.18) * 4
    const op   = interpolate(f, [0, 4], [0, 1], { extrapolateRight: 'clamp' })
    return (
      <h1 style={{
        ...base, opacity: op, transform: pm(),
        clipPath: `polygon(0 ${100-b+wob}%, 100% ${100-b-wob}%, 100% 100%, 0 100%)`,
      }}>
        {text}
      </h1>
    )
  }

  // ── NEW: verticalize — texto rotado 90° desliza desde arriba ────────────────
  if (gs.textAnim === 'verticalize') {
    // Texto vertical: limita altura a maxHeight para no expandirse fuera del frame.
    // Si el texto es largo, lo reducimos en tamaño para que quepa verticalmente.
    const safeFontSize = text.length > 10 ? Math.round(fontSize * 0.65) : fontSize
    const prog = spring({ frame: f, fps, config: { stiffness: 75, damping: 22 }, durationInFrames: 30 })
    const y    = interpolate(prog, [0, 1], [-220, 0])
    return wrap(
      <div style={{
        writingMode: 'vertical-rl' as React.CSSProperties['writingMode'],
        opacity: prog,
        transform: `translateY(${y}px) rotate(180deg)`,
        maxHeight: 600,
        overflow: 'hidden',
        ...extraStyle,
      }}>
        <span style={{ ...base, fontSize: safeFontSize, display: 'inline-block', maxWidth: undefined, textAlign: undefined }}>{text}</span>
      </div>
    )
  }

  // ── NEW: staggerDrop — letras caen una a una con bounce desigual ────────────
  if (gs.textAnim === 'staggerDrop') {
    const chars = text.split('')
    const baseDelay = Math.max(1.5, Math.round(160 / gs.springStiffness))
    return wrap(
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.05em', justifyContent: gs.align === 'center' ? 'center' : 'flex-start', maxWidth: maxWidth ?? 900, ...extraStyle }}>
        {chars.map((char, ci) => {
          const wobble  = Math.sin(ci * 1.7) * 0.5 + 1     // 0.5–1.5
          const cf      = Math.max(0, f - ci * baseDelay * wobble)
          const prog    = spring({ frame: cf, fps, config: { stiffness: 280 + (ci % 3) * 60, damping: 11 + (ci % 4) * 2 }, durationInFrames: 26 })
          const y       = interpolate(prog, [0, 1], [-(120 + (ci % 5) * 20), 0])
          const rotIn   = interpolate(prog, [0, 1], [(ci % 2 ? -25 : 25), 0])
          return (
            <span key={ci} style={{ ...base, opacity: prog, transform: `translateY(${y}px) rotate(${rotIn}deg)`, display: 'inline-block', maxWidth: undefined, textAlign: undefined, transformOrigin: 'center bottom' }}>
              {char === ' ' ? ' ' : char}
            </span>
          )
        })}
      </div>
    )
  }

  // ── NEW: zoomBlur — entra desde lejos con desenfoque cinematográfico ────────
  if (gs.textAnim === 'zoomBlur') {
    const prog  = spring({ frame: f, fps, config: { stiffness: 55, damping: 24 }, durationInFrames: 42 })
    const scale = interpolate(prog, [0, 1], [3.2, 1.0])
    const blur  = interpolate(prog, [0, 1], [22, 0])
    const op    = interpolate(prog, [0, 0.3], [0, 1])
    return <h1 style={{ ...base, opacity: op, filter: `blur(${blur}px)`, transform: pm(`scale(${scale})`), transformOrigin: gs.align === 'center' ? 'center center' : 'left center' }}>{text}</h1>
  }

  // ── NEW: breathe — pulso sutil continuo + fade in inicial ───────────────────
  if (gs.textAnim === 'breathe') {
    const op    = interpolate(f, [0, 18], [0, 1], { extrapolateRight: 'clamp' })
    const pulse = 1 + 0.025 * Math.sin(f * 0.06)
    return <h1 style={{ ...base, opacity: op, transform: pm(`scale(${pulse})`), transformOrigin: gs.align === 'center' ? 'center' : 'left center' }}>{text}</h1>
  }

  // ── NEW: colorCycle — texto cicla entre colores en su entrada ───────────────
  if (gs.textAnim === 'colorCycle') {
    const prog  = spring({ frame: f, fps, config: { stiffness: 80, damping: 20 }, durationInFrames: 36 })
    const y     = interpolate(prog, [0, 1], [50, 0])
    const cycle = f < 36 ? Math.floor(f / 6) % 3 : 3
    const colors = ['#FFFFFF', '#FFE066', color]
    const dynColor = cycle < 3 ? colors[cycle]! : color
    return <h1 style={{ ...base, color: dynColor, opacity: prog, transform: pm(`translateY(${y}px)`) }}>{text}</h1>
  }

  // ── NEW: slideArc — entrada con trayectoria curva ───────────────────────────
  if (gs.textAnim === 'slideArc') {
    const prog = spring({ frame: f, fps, config: { stiffness: 75, damping: 22 }, durationInFrames: 36 })
    // parábola: pasa por (1, 0, 0) → arco hacia el centro
    const arc  = 1 - prog
    const x    = interpolate(prog, [0, 1], [-140, 0])
    const y    = -Math.sin(prog * Math.PI) * 60   // bandeja arriba a la mitad
    const rot  = interpolate(prog, [0, 1], [-12, 0])
    return <h1 style={{ ...base, opacity: 1 - arc, transform: pm(`translate(${x}px, ${y}px) rotate(${rot}deg)`), transformOrigin: 'left center' }}>{text}</h1>
  }

  // ── NEW: expandOut — letras parten del centro y se expanden ─────────────────
  if (gs.textAnim === 'expandOut') {
    const chars = text.split('')
    const mid   = (chars.length - 1) / 2
    const baseDelay = Math.max(1.5, Math.round(160 / gs.springStiffness))
    return wrap(
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.05em', justifyContent: gs.align === 'center' ? 'center' : 'flex-start', maxWidth: maxWidth ?? 900, ...extraStyle }}>
        {chars.map((char, ci) => {
          const dist  = Math.abs(ci - mid)
          const cf    = Math.max(0, f - dist * baseDelay)
          const prog  = spring({ frame: cf, fps, config: { stiffness: 240, damping: 16 }, durationInFrames: 22 })
          const sc    = interpolate(prog, [0, 1], [0.0, 1.0])
          const op    = interpolate(prog, [0, 0.3], [0, 1])
          return (
            <span key={ci} style={{ ...base, opacity: op, transform: `scale(${sc})`, display: 'inline-block', maxWidth: undefined, textAlign: undefined, transformOrigin: 'center center' }}>
              {char === ' ' ? ' ' : char}
            </span>
          )
        })}
      </div>
    )
  }

  // ── chromaShift — aberración cromática persistente con grid layout ──────────
  if (gs.textAnim === 'chromaShift') {
    const op    = interpolate(f, [0, 8], [0, 1], { extrapolateRight: 'clamp' })
    const shift = 2 + Math.sin(f * 0.08) * 1.5
    return wrap(
      <div style={{ display: 'grid', justifyItems: gs.align === 'center' ? 'center' : 'start', ...extraStyle }}>
        <h1 style={{ ...base, gridArea: '1 / 1', color: 'rgba(255,30,90,0.75)', transform: `translate(${-shift}px, ${shift * 0.4}px)`, filter: 'blur(0.5px)', margin: 0 }}>{text}</h1>
        <h1 style={{ ...base, gridArea: '1 / 1', color: 'rgba(0,220,255,0.75)', transform: `translate(${shift}px, ${-shift * 0.4}px)`, filter: 'blur(0.5px)', margin: 0 }}>{text}</h1>
        <h1 style={{ ...base, gridArea: '1 / 1', opacity: op }}>{text}</h1>
      </div>
    )
  }

  // ── glitchTV — TV vieja con scanlines + aberración (grid alineado) ─────────
  if (gs.textAnim === 'glitchTV') {
    const settling = f < 30
    const scanLine = (f * 6) % 100
    const tearX    = settling && Math.floor(f / 4) % 2 === 0 ? Math.sin(f * 5.3) * 12 : 0
    const op       = interpolate(f, [0, 6], [0, 1], { extrapolateRight: 'clamp' })
    const finalScale = spring({ frame: Math.max(0, f - 22), fps, config: { stiffness: 220, damping: 22 }, durationInFrames: 14 })
    return wrap(
      <div style={{ position: 'relative', display: 'grid', justifyItems: gs.align === 'center' ? 'center' : 'start', ...extraStyle }}>
        {settling && (
          <>
            <h1 style={{ ...base, gridArea: '1 / 1', color: 'rgba(255,30,90,0.65)', transform: `translate(${tearX}px, 0)`, filter: 'blur(0.8px)', margin: 0 }}>{text}</h1>
            <h1 style={{ ...base, gridArea: '1 / 1', color: 'rgba(0,220,255,0.65)', transform: `translate(${-tearX}px, 1px)`, filter: 'blur(0.8px)', margin: 0 }}>{text}</h1>
          </>
        )}
        <h1 style={{ ...base, gridArea: '1 / 1', opacity: op, transform: settling ? `translate(${tearX * 0.2}px, 0)` : `scale(${1 - (1 - finalScale) * 0.04})` }}>{text}</h1>
        {settling && (
          <div style={{ position: 'absolute', left: -20, right: -20, top: `${scanLine}%`, height: 2, background: 'rgba(255,255,255,0.45)', pointerEvents: 'none', mixBlendMode: 'overlay' }} />
        )}
      </div>
    )
  }

  // ── NEW: paperFold — el texto se desdobla en perspectiva como una hoja ─────
  if (gs.textAnim === 'paperFold') {
    const prog   = spring({ frame: f, fps, config: { stiffness: 70, damping: 22 }, durationInFrames: 32 })
    const rotX   = interpolate(prog, [0, 1], [-95, 0])  // pliega desde "cerrado" hacia "abierto"
    const op     = interpolate(prog, [0, 0.25], [0, 1])
    const shadow = interpolate(prog, [0, 1], [0.85, 0.15])
    return (
      <div style={{ perspective: 1400, ...extraStyle }}>
        <h1 style={{
          ...base,
          opacity: op,
          transform: pm(`rotateX(${rotX}deg)`),
          transformOrigin: 'center bottom',
          textShadow: `0 ${Math.round(20 * shadow)}px ${Math.round(40 * shadow)}px rgba(0,0,0,${shadow * 0.6})`,
        }}>
          {text}
        </h1>
      </div>
    )
  }

  // ── NEW: neonFlicker — parpadeo tipo letrero neón con glow ────────────────
  if (gs.textAnim === 'neonFlicker') {
    // Patrón de flicker realista basado en seeded random + tiempo
    const isOn = f < 30
      ? (seededRand(Math.floor(f / 2), 0) > 0.25)   // primeros frames: flicker activo
      : true                                          // luego estable
    const flickerOpacity = isOn ? 1 : 0.25
    const op = interpolate(f, [0, 3], [0, 1], { extrapolateRight: 'clamp' })
    const glow = isOn ? 1 : 0.4
    const accentLike = '#FF3D7F'  // típico neón rosado, contrasta sobre cualquier fondo
    return (
      <h1 style={{
        ...base,
        opacity: op * flickerOpacity,
        transform: pm(),
        textShadow: `0 0 ${10 * glow}px ${accentLike}, 0 0 ${24 * glow}px ${accentLike}, 0 0 ${48 * glow}px rgba(255, 61, 127, ${0.6 * glow})`,
        filter: `brightness(${0.95 + glow * 0.1})`,
      }}>
        {text}
      </h1>
    )
  }

  // ── NEW: slingShot — rebote estilo tirachinas desde el borde ──────────────
  if (gs.textAnim === 'slingShot') {
    // 0 → -1.3 (overshoot atrás) → 0 (final)
    const prog  = spring({ frame: f, fps, config: { stiffness: 320, damping: 8 }, durationInFrames: 36 })
    const x     = interpolate(prog, [0, 1], [-380, 0])
    const sc    = interpolate(prog, [0, 0.4, 1], [0.6, 1.20, 1.0])
    const rot   = interpolate(prog, [0, 0.4, 1], [-22, 8, 0])
    const op    = interpolate(f, [0, 4], [0, 1], { extrapolateRight: 'clamp' })
    return <h1 style={{ ...base, opacity: op, transform: pm(`translateX(${x}px) scale(${sc}) rotate(${rot}deg)`), transformOrigin: 'left center' }}>{text}</h1>
  }

  // ── NEW: spiralIn — entra rotando en espiral hacia el centro ──────────────
  if (gs.textAnim === 'spiralIn') {
    const prog   = spring({ frame: f, fps, config: { stiffness: 65, damping: 22 }, durationInFrames: 40 })
    const angle  = interpolate(prog, [0, 1], [Math.PI * 1.8, 0])
    const radius = interpolate(prog, [0, 1], [380, 0])
    const x      = Math.cos(angle) * radius
    const y      = Math.sin(angle) * radius * 0.5
    const sc     = interpolate(prog, [0, 1], [0.3, 1.0])
    const rot    = interpolate(prog, [0, 1], [180, 0])
    const op     = interpolate(prog, [0, 0.35], [0, 1])
    return <h1 style={{ ...base, opacity: op, transform: pm(`translate(${x}px, ${y}px) scale(${sc}) rotate(${rot}deg)`), transformOrigin: 'center center' }}>{text}</h1>
  }

  // ── NEW: wobbleIn — bamboleo orgánico tipo gelatina ─────────────────────────
  if (gs.textAnim === 'wobbleIn') {
    const enter = spring({ frame: f, fps, config: { stiffness: 280, damping: 9 }, durationInFrames: 40 })
    const sc    = interpolate(enter, [0, 0.4, 0.7, 1], [0.6, 1.18, 0.94, 1.0])
    // Wobble orgánico continuo después del entry
    const post  = Math.max(0, f - 20)
    const wobX  = Math.sin(post * 0.15) * Math.exp(-post * 0.04) * 6
    const wobY  = Math.cos(post * 0.18) * Math.exp(-post * 0.04) * 4
    const skew  = Math.sin(post * 0.12) * Math.exp(-post * 0.04) * 2.5
    const op    = interpolate(f, [0, 4], [0, 1], { extrapolateRight: 'clamp' })
    return <h1 style={{ ...base, opacity: op, transform: pm(`scale(${sc}) translate(${wobX}px, ${wobY}px) skewX(${skew}deg)`), transformOrigin: gs.align === 'center' ? 'center center' : 'left center' }}>{text}</h1>
  }

  // ── NEW: splitFlap — display de aeropuerto, cada letra "voltea" ────────────
  if (gs.textAnim === 'splitFlap') {
    const chars   = text.split('')
    const perChar = Math.max(1.5, Math.round(180 / gs.springStiffness))
    return wrap(
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.05em', justifyContent: gs.align === 'center' ? 'center' : 'flex-start', maxWidth: maxWidth ?? 900, perspective: 800, ...extraStyle }}>
        {chars.map((char, ci) => {
          const cf     = Math.max(0, f - ci * perChar)
          const flip   = spring({ frame: cf, fps, config: { stiffness: 220, damping: 16 }, durationInFrames: 18 })
          const rotX   = interpolate(flip, [0, 0.5, 1], [-90, 8, 0])
          const op     = interpolate(flip, [0, 0.4, 1], [0, 0, 1])
          return (
            <span key={ci} style={{
              ...base, opacity: op,
              display: 'inline-block',
              transform: `rotateX(${rotX}deg)`,
              transformOrigin: 'center bottom',
              maxWidth: undefined, textAlign: undefined,
              backfaceVisibility: 'hidden' as React.CSSProperties['backfaceVisibility'],
            }}>
              {char === ' ' ? ' ' : char}
            </span>
          )
        })}
      </div>
    )
  }

  // ── NEW: inkBleed — tinta que se expande desde un punto ────────────────────
  if (gs.textAnim === 'inkBleed') {
    const prog = spring({ frame: f, fps, config: { stiffness: 38, damping: 25 }, durationInFrames: 48 })
    const blur = interpolate(prog, [0, 1], [42, 0])
    const sc   = interpolate(prog, [0, 1], [0.85, 1.0])
    const op   = interpolate(prog, [0, 0.15], [0, 1])
    return <h1 style={{
      ...base,
      opacity: op,
      filter: `blur(${blur}px) contrast(${1 + (1-prog) * 0.6})`,
      transform: pm(`scale(${sc})`),
      transformOrigin: gs.align === 'center' ? 'center center' : 'left center',
    }}>{text}</h1>
  }

  // ── NEW: colorPour — el color se vierte llenando el texto de abajo hacia arriba ─
  if (gs.textAnim === 'colorPour') {
    // Dos capas en grid: una con outline (texto vacío) y otra rellena con color que crece desde abajo.
    const prog = spring({ frame: f, fps, config: { stiffness: 65, damping: 24 }, durationInFrames: 42 })
    const fill = interpolate(prog, [0, 1], [100, 0])  // % de cuánto NO está lleno (clip-path inset top)
    const op   = interpolate(f, [0, 6], [0, 1], { extrapolateRight: 'clamp' })
    return wrap(
      <div style={{ display: 'grid', justifyItems: gs.align === 'center' ? 'center' : 'start', opacity: op, ...extraStyle }}>
        {/* Outline base */}
        <h1 style={{ ...base, gridArea: '1 / 1', color: 'transparent', WebkitTextStroke: `2px ${color}`, margin: 0 }}>{text}</h1>
        {/* Relleno que sube */}
        <h1 style={{ ...base, gridArea: '1 / 1', clipPath: `inset(${fill}% 0 0 0)`, margin: 0 }}>{text}</h1>
      </div>
    )
  }

  // ── NEW: mirrorIn — texto + reflejo invertido debajo ──────────────────────────
  if (gs.textAnim === 'mirrorIn') {
    const prog = spring({ frame: f, fps, config: { stiffness: 80, damping: 22 }, durationInFrames: 32 })
    const y    = interpolate(prog, [0, 1], [40, 0])
    const op   = interpolate(prog, [0, 0.3], [0, 1])
    return wrap(
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: gs.align === 'center' ? 'center' : 'flex-start', opacity: op, transform: pm(`translateY(${y}px)`), ...extraStyle }}>
        <h1 style={{ ...base, margin: 0 }}>{text}</h1>
        {/* Reflejo: misma h1 invertida con máscara de fade */}
        <h1 style={{
          ...base,
          margin: 0,
          marginTop: -fontSize * 0.05,
          transform: 'scaleY(-1)',
          opacity: 0.35,
          maskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.7), transparent 70%)',
          WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.7), transparent 70%)' as React.CSSProperties['WebkitMaskImage'],
        }}>{text}</h1>
      </div>
    )
  }

  // ── NEW: shutterReveal — láminas tipo persiana se abren ──────────────────────
  if (gs.textAnim === 'shutterReveal') {
    // 6 láminas verticales que se abren con stagger
    const lamellas = 6
    const enter = spring({ frame: f, fps, config: { stiffness: 90, damping: 22 }, durationInFrames: 36 })
    const op    = interpolate(enter, [0, 0.3], [0, 1])
    return wrap(
      <div style={{ position: 'relative', display: 'inline-block', ...extraStyle }}>
        <h1 style={{ ...base, opacity: op, margin: 0 }}>{text}</h1>
        {/* Láminas que se cierran (cubren el texto) y se abren */}
        <div style={{ position: 'absolute', inset: 0, display: 'flex', pointerEvents: 'none' }}>
          {Array.from({ length: lamellas }, (_, li) => {
            const lp = Math.max(0, enter - li * 0.05)
            const h  = interpolate(lp, [0, 1], [100, 0])
            return (
              <div key={li} style={{
                flex: 1,
                background: shiftColor(gs.bgTreat === 'dark' || gs.bgTreat === 'cinematic' ? '#1a1a1a' : color, -30),
                clipPath: `inset(0 0 ${h}% 0)`,
                borderRight: li < lamellas - 1 ? '1px solid rgba(0,0,0,0.1)' : 'none',
              }} />
            )
          })}
        </div>
      </div>
    )
  }

  // ── NEW: pulseRing — anillos pulsando al fondo + texto fadeIn ─────────────────
  if (gs.textAnim === 'pulseRing') {
    const op = interpolate(f, [4, 18], [0, 1], { extrapolateRight: 'clamp' })
    return wrap(
      <div style={{ position: 'relative', display: 'inline-block', ...extraStyle }}>
        {/* 3 anillos pulsando */}
        {[0, 1, 2].map(ri => {
          const phase = (f * 0.04 + ri * 0.5) % 2.2
          const scale = 0.4 + phase * 0.85
          const opR   = Math.max(0, 1 - phase * 0.55)
          return (
            <div key={ri} style={{
              position: 'absolute',
              left: '50%', top: '50%',
              width: fontSize * 1.4, height: fontSize * 1.4,
              border: `2px solid ${color}`,
              borderRadius: '50%',
              transform: `translate(-50%, -50%) scale(${scale})`,
              opacity: opR * 0.5,
              pointerEvents: 'none',
            }} />
          )
        })}
        <h1 style={{ ...base, opacity: op, position: 'relative', margin: 0 }}>{text}</h1>
      </div>
    )
  }

  // ── NEW: magnetSnap — letras flotantes que hacen snap a su posición ──────────
  if (gs.textAnim === 'magnetSnap') {
    const chars  = text.split('')
    const snapAt = 24   // todas las letras hacen snap en este frame
    return wrap(
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.05em', justifyContent: gs.align === 'center' ? 'center' : 'flex-start', maxWidth: maxWidth ?? 900, ...extraStyle }}>
        {chars.map((char, ci) => {
          // Cada letra tiene un offset aleatorio determinístico
          const offsetX = Math.sin(ci * 12.9) * 80
          const offsetY = Math.cos(ci * 7.4) * 60
          const offsetR = Math.sin(ci * 5.1) * 30
          const snap    = spring({ frame: Math.max(0, f - 6), fps, config: { stiffness: 380, damping: 18 }, durationInFrames: snapAt })
          const x       = interpolate(snap, [0, 1], [offsetX, 0])
          const y       = interpolate(snap, [0, 1], [offsetY, 0])
          const rot     = interpolate(snap, [0, 1], [offsetR, 0])
          const op      = interpolate(snap, [0, 0.4], [0, 1])
          return (
            <span key={ci} style={{ ...base, opacity: op, transform: `translate(${x}px, ${y}px) rotate(${rot}deg)`, display: 'inline-block', maxWidth: undefined, textAlign: undefined }}>
              {char === ' ' ? ' ' : char}
            </span>
          )
        })}
      </div>
    )
  }

  // ── NEW: curtainDrop — cortina cae revelando el texto ────────────────────────
  if (gs.textAnim === 'curtainDrop') {
    const fall = spring({ frame: f, fps, config: { stiffness: 85, damping: 24 }, durationInFrames: 34 })
    const drop = interpolate(fall, [0, 1], [0, 100])     // % de qué tan abajo cayó la cortina
    const op   = interpolate(f, [10, 22], [0, 1], { extrapolateRight: 'clamp' })
    return wrap(
      <div style={{ position: 'relative', display: 'inline-block', ...extraStyle }}>
        <h1 style={{ ...base, opacity: op, margin: 0 }}>{text}</h1>
        {/* Cortina */}
        <div style={{
          position: 'absolute', top: 0, left: -10, right: -10,
          height: `${100 - drop}%`,
          background: `linear-gradient(to bottom, ${color}, ${hexToRgba(color, 0.85)})`,
          boxShadow: `0 4px 16px ${hexToRgba('#000', 0.30)}`,
          pointerEvents: 'none',
        }} />
      </div>
    )
  }

  // ── NEW: lensZoom — zoom de lente con foco que se aclara ────────────────────
  if (gs.textAnim === 'lensZoom') {
    const prog = spring({ frame: f, fps, config: { stiffness: 60, damping: 22 }, durationInFrames: 40 })
    const sc   = interpolate(prog, [0, 1], [0.55, 1.0])
    const blur = interpolate(prog, [0, 0.5, 1], [18, 6, 0])
    const op   = interpolate(prog, [0, 0.3], [0, 1])
    const vignette = interpolate(prog, [0, 1], [1.2, 0])
    return wrap(
      <div style={{ position: 'relative', display: 'inline-block', ...extraStyle }}>
        <h1 style={{ ...base, opacity: op, filter: `blur(${blur}px)`, transform: pm(`scale(${sc})`), transformOrigin: 'center center', margin: 0 }}>{text}</h1>
        {/* Vignette circular tipo lente */}
        {vignette > 0.01 && (
          <div style={{
            position: 'absolute', inset: -20,
            background: `radial-gradient(circle, transparent 30%, rgba(0,0,0,${vignette * 0.55}) 80%)`,
            opacity: vignette,
            pointerEvents: 'none',
          }} />
        )}
      </div>
    )
  }

  // ── NEW: dashStroke — letras dibujadas como trazo de bolígrafo (SVG-like) ───
  if (gs.textAnim === 'dashStroke') {
    // Texto outline + stroke-dashoffset progressivo (simulado con clipPath)
    const prog = spring({ frame: f, fps, config: { stiffness: 50, damping: 24 }, durationInFrames: 46 })
    const draw = interpolate(prog, [0, 1], [100, 0])
    const fill = interpolate(prog, [0.6, 1], [0, 1], { extrapolateLeft: 'clamp' })
    const op   = interpolate(f, [0, 5], [0, 1], { extrapolateRight: 'clamp' })
    return wrap(
      <div style={{ display: 'grid', justifyItems: gs.align === 'center' ? 'center' : 'start', opacity: op, ...extraStyle }}>
        {/* Trazo (outline visible) */}
        <h1 style={{ ...base, gridArea: '1 / 1', color: 'transparent', WebkitTextStroke: `1.5px ${color}`, clipPath: `inset(0 ${draw}% 0 0)`, margin: 0 }}>{text}</h1>
        {/* Relleno final (fadeIn al final del trazado) */}
        <h1 style={{ ...base, gridArea: '1 / 1', opacity: fill, margin: 0 }}>{text}</h1>
      </div>
    )
  }

  // ── stampIn — sello de goma: impacto seco con squish, sin overshoot elástico ─
  if (gs.textAnim === 'stampIn') {
    const hit = spring({ frame: f, fps, config: { stiffness: 620, damping: 22 }, durationInFrames: 14 })
    const sc  = interpolate(hit, [0, 0.45, 1], [1.42, 0.92, 1.0])
    const rot = interpolate(hit, [0, 0.3, 1], [gs.align === 'left' ? -3 : 3, 0, 0])
    const op  = interpolate(f, [0, 2], [0, 1], { extrapolateRight: 'clamp' })
    return <h1 style={{ ...base, opacity: op, transform: pm(`scale(${sc}) rotate(${rot}deg)`), transformOrigin: gs.align === 'center' ? 'center bottom' : 'left bottom' }}>{text}</h1>
  }

  // ── zoomOut — parte ENORME y se contrae, con rack-focus de cámara ─────────────
  if (gs.textAnim === 'zoomOut') {
    const prog  = spring({ frame: f, fps, config: { stiffness: 50, damping: 25 }, durationInFrames: 42 })
    const scale = interpolate(prog, [0, 1], [3.2, 1.0])
    const blur  = interpolate(prog, [0, 0.28, 1], [8, 18, 0])
    const op    = interpolate(f, [0, 4], [0, 1], { extrapolateRight: 'clamp' })
    return <h1 style={{ ...base, opacity: op, filter: `blur(${blur}px)`, transform: pm(`scale(${scale})`), transformOrigin: 'center center' }}>{text}</h1>
  }

  // ── windSweep — único skewX: llega inclinado por el viento y se endereza ───────
  if (gs.textAnim === 'windSweep') {
    const prog = spring({ frame: f, fps, config: { stiffness: 88, damping: 20 }, durationInFrames: 34 })
    const skew = interpolate(prog, [0, 1], [-26, 0])
    const x    = interpolate(prog, [0, 1], [-170, 0])
    const op   = interpolate(f, [0, 5], [0, 1], { extrapolateRight: 'clamp' })
    return <h1 style={{ ...base, opacity: op, transform: pm(`translateX(${x}px) skewX(${skew}deg)`) }}>{text}</h1>
  }

  // ── scanReveal — clip rectangular limpio izq → der (diferente del diagonal maskWipe)
  if (gs.textAnim === 'scanReveal') {
    const prog = spring({ frame: f, fps, config: { stiffness: 78, damping: 22 }, durationInFrames: 34 })
    const pct  = interpolate(prog, [0, 1], [100, 0])
    const op   = interpolate(f, [0, 3], [0, 1], { extrapolateRight: 'clamp' })
    return <h1 style={{ ...base, opacity: op, transform: pm(), clipPath: `inset(0 ${pct}% 0 0)` }}>{text}</h1>
  }

  // ── neonBuild — el glow se construye hasta revelar el texto (diferente al flicker)
  if (gs.textAnim === 'neonBuild') {
    const build = spring({ frame: f, fps, config: { stiffness: 100, damping: 14 }, durationInFrames: 30 })
    const glow  = interpolate(build, [0, 0.55, 1], [0, 1.7, 1.0])
    const op    = interpolate(f, [0, 8], [0, 1], { extrapolateRight: 'clamp' })
    const [cr, cg, cb] = hexToRgb(color)
    return <h1 style={{
      ...base, opacity: op, transform: pm(),
      textShadow: `0 0 ${8*glow}px rgba(${cr},${cg},${cb},0.95), 0 0 ${22*glow}px rgba(${cr},${cg},${cb},0.65), 0 0 ${48*glow}px rgba(${cr},${cg},${cb},0.28)`,
    }}>{text}</h1>
  }

  // ── accelDrop — gravedad pura Easing.in(cubic) + squish al aterrizar, sin rebote
  if (gs.textAnim === 'accelDrop') {
    const t   = Math.min(1, f / 28)
    const y   = interpolate(t, [0, 1], [-140, 0], { easing: Easing.in(Easing.cubic) })
    const scX = f >= 26 ? 1 + Math.sin((f - 26) * 0.6) * 0.048 * Math.exp(-(f - 26) * 0.22) : 1
    const op  = interpolate(f, [0, 4], [0, 1], { extrapolateRight: 'clamp' })
    return <h1 style={{ ...base, opacity: op, transform: pm(`translateY(${y}px) scaleX(${scX})`), transformOrigin: 'center bottom' }}>{text}</h1>
  }

  // ── stretchIn — único scaleX: entra comprimido horizontal y se expande ──────────
  if (gs.textAnim === 'stretchIn') {
    const prog = spring({ frame: f, fps, config: { stiffness: 165, damping: 15 }, durationInFrames: 26 })
    const scX  = interpolate(prog, [0, 0.52, 1], [0.04, 1.12, 1.0])
    const op   = interpolate(f, [0, 3], [0, 1], { extrapolateRight: 'clamp' })
    return <h1 style={{ ...base, opacity: op, transform: pm(`scaleX(${scX})`), transformOrigin: gs.align === 'center' ? 'center center' : 'left center' }}>{text}</h1>
  }

  // ── implode — coalesce desde partículas dispersas hacia el centro ────────────────
  if (gs.textAnim === 'implode') {
    const prog  = spring({ frame: f, fps, config: { stiffness: 65, damping: 22 }, durationInFrames: 38 })
    const scale = interpolate(prog, [0, 0.65, 1], [0.22, 1.08, 1.0])
    const blur  = interpolate(prog, [0, 0.50, 1], [20, 4, 0])
    const y     = interpolate(prog, [0, 1], [-38, 0])
    const op    = interpolate(prog, [0, 0.18], [0, 1])
    return <h1 style={{ ...base, opacity: op, filter: `blur(${blur}px)`, transform: pm(`scale(${scale}) translateY(${y}px)`), transformOrigin: gs.align === 'center' ? 'center center' : 'left center' }}>{text}</h1>
  }

  // ── flipReveal — rotateY 3D real (diferente a flipIn que usa scaleY) ─────────────
  if (gs.textAnim === 'flipReveal') {
    const prog = spring({ frame: f, fps, config: { stiffness: 175, damping: 18 }, durationInFrames: 26 })
    const rotY = interpolate(prog, [0, 1], [88, 0])
    const op   = interpolate(prog, [0, 0.38], [0, 1])
    return (
      <div style={{ perspective: 900, ...extraStyle }}>
        <h1 style={{ ...base, opacity: op, transform: pm(`rotateY(${rotY}deg)`), transformOrigin: gs.align === 'center' ? 'center center' : 'left center' }}>{text}</h1>
      </div>
    )
  }

  // ── textRise — clip de abajo hacia arriba: el texto emerge del piso ─────────────
  if (gs.textAnim === 'textRise') {
    const prog = spring({ frame: f, fps, config: { stiffness: 82, damping: 22 }, durationInFrames: 32 })
    const pct  = interpolate(prog, [0, 1], [100, 0])
    const op   = interpolate(f, [0, 3], [0, 1], { extrapolateRight: 'clamp' })
    return <h1 style={{ ...base, opacity: op, transform: pm(), clipPath: `inset(0 0 ${pct}% 0)` }}>{text}</h1>
  }

  // fadeOnly — default
  const prog = spring({ frame: f, fps, config: { stiffness: Math.min(gs.springStiffness, 60), damping: gs.springDamping }, durationInFrames: 40 })
  return <h1 style={{ ...base, opacity: prog, transform: pm() }}>{text}</h1>
}

// ─── SubtextReveal ────────────────────────────────────────────────────────────

const SubtextReveal: React.FC<{
  text: string; frame: number; fps: number; delay: number
  gs: GeneratedStyle; color: string; fontSize?: number; extraStyle?: React.CSSProperties
  /** Tamaño del title de arriba — define el gap proporcional para evitar choque visual */
  titleSize?: number
}> = ({ text, frame, fps, delay, gs, color, fontSize = 26, extraStyle, titleSize }) => {
  const f = Math.max(0, frame - delay)
  // Gap proporcional al tamaño del título: títulos enormes requieren más respiro.
  // Min 18px, escala 12% del title → 64px title→26px gap, 200px title→42px gap
  const safeGap = titleSize ? Math.max(18, Math.round(titleSize * 0.18)) : 18
  const baseStyle: React.CSSProperties = {
    color, fontSize, fontWeight: 400,
    fontFamily: 'system-ui, -apple-system, "Segoe UI", Arial, sans-serif',
    margin: 0, marginTop: safeGap, lineHeight: 1.45,
    letterSpacing: gs.subtextUpper ? '2.5px' : '0.3px',
    textTransform: gs.subtextUpper ? 'uppercase' : 'none',
    textAlign: gs.align === 'center' ? 'center' : 'left',
    maxWidth: 640,
    ...extraStyle,
  }

  if (gs.textAnim === 'blurReveal' || gs.textAnim === 'scramble') {
    const prog = spring({ frame: f, fps, config: { stiffness: 42, damping: 20 }, durationInFrames: 34 })
    const blur = interpolate(prog, [0, 1], [10, 0])
    return <p style={{ ...baseStyle, opacity: prog, filter: `blur(${blur}px)` }}>{text}</p>
  }
  if (gs.textAnim === 'punchIn' || gs.textAnim === 'elastic') {
    const prog = spring({ frame: f, fps, config: { stiffness: 200, damping: 18 }, durationInFrames: 14 })
    const sc   = interpolate(prog, [0, 1], [1.22, 1.0])
    const op   = interpolate(Math.max(0, frame - delay), [0, 3], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
    return <p style={{ ...baseStyle, opacity: op, transform: `scale(${sc})` }}>{text}</p>
  }
  if (gs.textAnim === 'slideLeft' || gs.textAnim === 'glitch') {
    const prog = spring({ frame: f, fps, config: { stiffness: 52, damping: 22 }, durationInFrames: 28 })
    const x    = interpolate(prog, [0, 1], [-55, 0])
    return <p style={{ ...baseStyle, opacity: prog, transform: `translateX(${x}px)` }}>{text}</p>
  }
  if (gs.textAnim === 'slideRight') {
    const prog = spring({ frame: f, fps, config: { stiffness: 52, damping: 22 }, durationInFrames: 28 })
    const x    = interpolate(prog, [0, 1], [55, 0])
    return <p style={{ ...baseStyle, opacity: prog, transform: `translateX(${x}px)` }}>{text}</p>
  }
  if (gs.textAnim === 'typewriter') {
    const prog = spring({ frame: f, fps, config: { stiffness: 45, damping: 24 }, durationInFrames: 30 })
    return <p style={{ ...baseStyle, opacity: prog }}>{text}</p>
  }
  if (gs.textAnim === 'letterDrop') {
    const prog = spring({ frame: f, fps, config: { stiffness: 60, damping: 18 }, durationInFrames: 22 })
    const y    = interpolate(prog, [0, 1], [-30, 0])
    return <p style={{ ...baseStyle, opacity: prog, transform: `translateY(${y}px)` }}>{text}</p>
  }
  if (gs.textAnim === 'rotateIn') {
    const prog = spring({ frame: f, fps, config: { stiffness: 55, damping: 22 }, durationInFrames: 28 })
    const rot  = interpolate(prog, [0, 1], [-3, 0])
    const y    = interpolate(prog, [0, 1], [16, 0])
    return <p style={{ ...baseStyle, opacity: prog, transform: `translateY(${y}px) rotate(${rot}deg)` }}>{text}</p>
  }
  if (gs.textAnim === 'fadeOnly' || gs.textAnim === 'zoomIn') {
    const prog = spring({ frame: f, fps, config: { stiffness: 40, damping: 24 }, durationInFrames: 38 })
    return <p style={{ ...baseStyle, opacity: prog }}>{text}</p>
  }
  if (gs.textAnim === 'popIn') {
    const pop = spring({ frame: f, fps, config: { stiffness: 350, damping: 18 }, durationInFrames: 16 })
    const sc  = interpolate(pop, [0, 1], [0.5, 1.0])
    const op  = interpolate(pop, [0, 0.2], [0, 1])
    return <p style={{ ...baseStyle, opacity: op, transform: `scale(${sc})`, transformOrigin: 'left center' }}>{text}</p>
  }
  if (gs.textAnim === 'cascadeUp') {
    const prog = spring({ frame: f, fps, config: { stiffness: 75, damping: 20 }, durationInFrames: 28 })
    const y    = interpolate(prog, [0, 1], [32, 0])
    return <p style={{ ...baseStyle, opacity: prog, transform: `translateY(${y}px)` }}>{text}</p>
  }
  if (gs.textAnim === 'morphReveal') {
    const prog = spring({ frame: f, fps, config: { stiffness: 40, damping: 22 }, durationInFrames: 34 })
    const blur = interpolate(prog, [0, 1], [10, 0])
    return <p style={{ ...baseStyle, opacity: prog, filter: `blur(${blur}px)` }}>{text}</p>
  }
  if (gs.textAnim === 'flipIn') {
    const prog   = spring({ frame: f, fps, config: { stiffness: 110, damping: 18 }, durationInFrames: 24 })
    const scaleY = interpolate(prog, [0, 0.4, 1], [0, 0.1, 1])
    const op     = interpolate(prog, [0, 0.4, 1], [0, 0, 1])
    return <p style={{ ...baseStyle, opacity: op, transform: `scaleY(${scaleY})`, transformOrigin: 'left bottom' }}>{text}</p>
  }
  if (gs.textAnim === 'splitReveal') {
    const prog = spring({ frame: f, fps, config: { stiffness: 90, damping: 20 }, durationInFrames: 26 })
    const x    = interpolate(prog, [0, 1], [-40, 0])
    return <p style={{ ...baseStyle, opacity: prog, transform: `translateX(${x}px)` }}>{text}</p>
  }
  // default slideUp
  const prog = spring({ frame: f, fps, config: { stiffness: 55, damping: 22 }, durationInFrames: 28 })
  const y    = interpolate(prog, [0, 1], [24, 0])
  return <p style={{ ...baseStyle, opacity: prog, transform: `translateY(${y}px)` }}>{text}</p>
}

// ─── BgLayer — 9 tratamientos de fondo ───────────────────────────────────────

const BgLayer: React.FC<{
  bgImage?: string; gs: GeneratedStyle
  brandColor: string; secondary: string
  kenBurns: number; kbOrigin: string
  sceneType: 'intro' | 'content' | 'cta'
  frame: number; driftSeed: number
}> = ({ bgImage, gs, brandColor, secondary, kenBurns, kbOrigin, sceneType, frame, driftSeed }) => {
  const { overlayAlpha, bgTreat } = gs
  const darker  = shiftColor(brandColor, -65)
  const darker2 = shiftColor(brandColor, -90)
  const hasBg   = !!bgImage && sceneType !== 'cta'

  const PhotoImg = () => {
    if (!hasBg) return null
    const drift = organicDrift(frame, driftSeed)
    return (
      <Img src={bgImage!} style={{
        position: 'absolute', inset: 0, width: '100%', height: '100%',
        objectFit: 'cover',
        transform: `scale(${kenBurns}) translate(${drift.x.toFixed(2)}px, ${drift.y.toFixed(2)}px)`,
        transformOrigin: kbOrigin,
      }} />
    )
  }

  const GradientBg = ({ gradient }: { gradient: string }) => (
    <div style={{ position: 'absolute', inset: 0, background: gradient }} />
  )

  if (bgTreat === 'dark') return (
    <>
      {!hasBg && <GradientBg gradient={`linear-gradient(155deg, ${darker2} 0%, ${darker} 60%, ${shiftColor(secondary,-30)} 100%)`} />}
      <PhotoImg />
      {hasBg && <div style={{ position: 'absolute', inset: 0, background: `rgba(0,0,0,${overlayAlpha * 0.55})` }} />}
      {hasBg && <div style={{ position: 'absolute', inset: 0, background: hexToRgba(brandColor, overlayAlpha * 0.18) }} />}
      <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(to top, rgba(0,0,0,${Math.min(0.70, overlayAlpha*0.95)}) 0%, transparent 50%)` }} />
    </>
  )

  if (bgTreat === 'tint') return (
    <>
      {!hasBg && <GradientBg gradient={`linear-gradient(155deg, ${darker2} 0%, ${darker} 55%, ${brandColor} 100%)`} />}
      <PhotoImg />
      {hasBg && <div style={{ position: 'absolute', inset: 0, background: hexToRgba(brandColor, overlayAlpha * 0.62) }} />}
      {hasBg && <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(135deg, ${hexToRgba(brandColor, 0.32)}, transparent)` }} />}
      <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(to top, ${hexToRgba(darker2, 0.72)} 0%, transparent 45%)` }} />
    </>
  )

  if (bgTreat === 'panel') return (
    <>
      <GradientBg gradient={`linear-gradient(145deg, ${darker2} 0%, ${darker} 42%, ${brandColor} 100%)`} />
      {hasBg && <Img src={bgImage!} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.12 + overlayAlpha * 0.12, transform: `scale(${kenBurns})`, transformOrigin: kbOrigin }} />}
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse 80% 80% at 50% 50%, transparent 18%, rgba(0,0,0,${overlayAlpha * 0.62}) 100%)` }} />
    </>
  )

  if (bgTreat === 'vignette') return (
    <>
      {!hasBg && <GradientBg gradient={`radial-gradient(ellipse at 50% 40%, ${darker} 0%, ${darker2} 70%, #000 100%)`} />}
      <PhotoImg />
      {hasBg && <div style={{ position: 'absolute', inset: 0, background: `rgba(0,0,0,${overlayAlpha * 0.52})` }} />}
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse 72% 72% at 50% 50%, transparent 20%, rgba(0,0,0,${Math.min(0.88, overlayAlpha * 1.08)}) 100%)` }} />
      {hasBg && <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(to top, rgba(0,0,0,${overlayAlpha * 0.92}) 0%, transparent 48%)` }} />}
    </>
  )

  if (bgTreat === 'split') return (
    <>
      {!hasBg && <GradientBg gradient={`linear-gradient(155deg, ${darker2} 0%, ${darker} 60%, ${shiftColor(secondary,-30)} 100%)`} />}
      <PhotoImg />
      {hasBg && <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(90deg, rgba(0,0,0,${Math.min(0.96, overlayAlpha*1.25)}) 0%, rgba(0,0,0,${overlayAlpha}) 40%, rgba(0,0,0,${overlayAlpha*0.52}) 68%, rgba(0,0,0,${overlayAlpha*0.12}) 100%)` }} />}
    </>
  )

  // ── NEW: duotone ─────────────────────────────────────────────────────────────
  if (bgTreat === 'duotone') return (
    <>
      {!hasBg && <GradientBg gradient={`linear-gradient(155deg, ${darker2} 0%, ${brandColor} 100%)`} />}
      <PhotoImg />
      {hasBg && <div style={{ position: 'absolute', inset: 0, background: `rgba(0,0,0,0.4)` }} />}
      {hasBg && <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(135deg, ${hexToRgba(darker2, 0.75)} 0%, ${hexToRgba(brandColor, 0.65)} 100%)` }} />}
      <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(to top, rgba(0,0,0,0.82) 0%, transparent 45%)` }} />
    </>
  )

  // ── NEW: colorBurn ───────────────────────────────────────────────────────────
  if (bgTreat === 'colorBurn') return (
    <>
      {!hasBg && <GradientBg gradient={`linear-gradient(155deg, ${darker2} 0%, ${darker} 100%)`} />}
      <PhotoImg />
      {hasBg && <div style={{ position: 'absolute', inset: 0, background: `rgba(0,0,0,${overlayAlpha * 0.5})` }} />}
      {hasBg && <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(120deg, ${hexToRgba(brandColor, 0.30)} 0%, ${hexToRgba(secondary, 0.20)} 50%, transparent 100%)` }} />}
      <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(to top, rgba(0,0,0,0.90) 0%, transparent 50%)` }} />
    </>
  )

  // ── NEW: cinematic ────────────────────────────────────────────────────────────
  if (bgTreat === 'cinematic') {
    const bar = 90
    return (
      <>
        {!hasBg && <GradientBg gradient={`linear-gradient(0deg, #000 0%, ${darker2} 50%, #000 100%)`} />}
        <PhotoImg />
        {hasBg && <div style={{ position: 'absolute', inset: 0, background: `rgba(0,0,0,${overlayAlpha})` }} />}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: bar, background: '#000' }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: bar, background: '#000' }} />
        <div style={{ position: 'absolute', top: bar, left: 0, right: 0, height: 1, background: hexToRgba(brandColor, 0.4) }} />
        <div style={{ position: 'absolute', bottom: bar, left: 0, right: 0, height: 1, background: hexToRgba(brandColor, 0.4) }} />
      </>
    )
  }

  // ── NEW: glassmorphism — glass translúcido inspirado en floating card UIs ────
  if (bgTreat === 'glassmorphism') return (
    <>
      {!hasBg && <GradientBg gradient={`linear-gradient(145deg, ${darker2} 0%, ${shiftColor(brandColor,-40)} 55%, ${shiftColor(brandColor,-10)} 100%)`} />}
      <PhotoImg />
      {hasBg && <div style={{ position: 'absolute', inset: 0, background: `rgba(0,0,0,${overlayAlpha * 0.72})` }} />}
      {/* Glass highlight — simula el brillo del frosted glass */}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.03) 40%, rgba(0,0,0,0.15) 100%)' }} />
      {/* Borde brillante superior — efecto edge del glass */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'rgba(255,255,255,0.22)' }} />
      <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(to top, rgba(0,0,0,0.90) 0%, rgba(0,0,0,0.04) 50%, transparent 100%)` }} />
    </>
  )

  // ── NEW: paperGrid — trama técnica de cuadrícula (Figma/Design System poster) ─
  if (bgTreat === 'paperGrid') return (
    <>
      {!hasBg && <GradientBg gradient={`linear-gradient(160deg, #080808 0%, ${darker2} 55%, #0e0e0e 100%)`} />}
      <PhotoImg />
      {hasBg && <div style={{ position: 'absolute', inset: 0, background: `rgba(0,0,0,${overlayAlpha})` }} />}
      {/* Grid de líneas finas */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `linear-gradient(rgba(255,255,255,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.045) 1px, transparent 1px)`,
        backgroundSize: '52px 52px',
      }} />
      {/* Puntos en las intersecciones */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `radial-gradient(${hexToRgba(brandColor, 0.18)} 1.5px, transparent 1.5px)`,
        backgroundSize: '52px 52px',
        backgroundPosition: '-1px -1px',
      }} />
      <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(to top, rgba(0,0,0,0.94) 0%, transparent 52%)` }} />
    </>
  )

  // ── NEW: colorBlock — bloque sólido de color de marca, sin foto encima ──────
  if (bgTreat === 'colorBlock') {
    const lighter = shiftColor(brandColor, +12)
    return (
      <>
        <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(${gs.gradAngle}deg, ${brandColor} 0%, ${lighter} 100%)` }} />
        {/* Sutil pulso radial */}
        <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse 70% 60% at 50% 40%, ${hexToRgba(secondary, 0.25)} 0%, transparent 70%)` }} />
        <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse 90% 50% at 50% 100%, ${hexToRgba(darker2, 0.42)} 0%, transparent 60%)` }} />
      </>
    )
  }

  // ── NEW: colorWash — foto teñida con color de marca (sin negros pesados) ────
  if (bgTreat === 'colorWash') {
    return (
      <>
        {!hasBg && <GradientBg gradient={`linear-gradient(155deg, ${brandColor} 0%, ${shiftColor(secondary,-15)} 100%)`} />}
        <PhotoImg />
        {hasBg && <div style={{ position: 'absolute', inset: 0, background: hexToRgba(brandColor, 0.65), mixBlendMode: 'multiply' }} />}
        {hasBg && <div style={{ position: 'absolute', inset: 0, background: hexToRgba(secondary, 0.18), mixBlendMode: 'screen' }} />}
        <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(to top, ${hexToRgba(darker2, 0.55)} 0%, transparent 55%)` }} />
      </>
    )
  }

  // ── NEW: gradientBurst — explosión radial de color de marca desde un punto ──
  if (bgTreat === 'gradientBurst') {
    const burstX = gs.gradAngle < 180 ? '22%' : '78%'
    const burstY = gs.textY >= 50 ? '20%' : '80%'
    return (
      <>
        <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(${gs.gradAngle}deg, ${darker2} 0%, ${shiftColor(brandColor,-40)} 100%)` }} />
        {hasBg && <Img src={bgImage!} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.22, transform: `scale(${kenBurns})`, transformOrigin: kbOrigin }} />}
        <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(circle 70% at ${burstX} ${burstY}, ${hexToRgba(brandColor, 0.85)} 0%, ${hexToRgba(brandColor, 0.30)} 30%, transparent 70%)` }} />
        <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(circle 40% at ${burstX} ${burstY}, ${hexToRgba(secondary, 0.45)} 0%, transparent 50%)` }} />
      </>
    )
  }

  // ── NEW: striped — franjas diagonales de colores de marca ───────────────────
  if (bgTreat === 'striped') {
    const stripeColors = [brandColor, secondary, shiftColor(brandColor, +18)]
    return (
      <>
        <div style={{ position: 'absolute', inset: 0, background: darker2 }} />
        {hasBg && <Img src={bgImage!} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.30, transform: `scale(${kenBurns})`, transformOrigin: kbOrigin }} />}
        <div style={{
          position: 'absolute', inset: 0,
          background: `repeating-linear-gradient(${gs.gradAngle}deg,
            ${hexToRgba(stripeColors[0]!, 0.75)} 0px,
            ${hexToRgba(stripeColors[0]!, 0.75)} 80px,
            ${hexToRgba(stripeColors[1]!, 0.68)} 80px,
            ${hexToRgba(stripeColors[1]!, 0.68)} 160px,
            ${hexToRgba(stripeColors[2]!, 0.75)} 160px,
            ${hexToRgba(stripeColors[2]!, 0.75)} 240px
          )`,
          mixBlendMode: hasBg ? 'multiply' : 'normal',
        }} />
        <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(to top, ${hexToRgba(darker2, 0.45)} 0%, transparent 40%)` }} />
      </>
    )
  }

  // ── NEW: wavePattern — ondas SVG de color de marca ──────────────────────────
  if (bgTreat === 'wavePattern') {
    const waveColor1 = hexToRgba(brandColor, 0.55)
    const waveColor2 = hexToRgba(secondary, 0.40)
    const waveColor3 = hexToRgba(shiftColor(brandColor, +20), 0.50)
    const waveShift  = (frame * 0.6) % 100
    return (
      <>
        <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(160deg, ${darker2} 0%, ${shiftColor(brandColor,-30)} 100%)` }} />
        {hasBg && <Img src={bgImage!} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.18 }} />}
        <svg viewBox="0 0 1280 720" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
          <path d={`M 0 ${260 + Math.sin(frame * 0.04) * 18} Q 320 ${200 + Math.cos(frame * 0.05) * 22} 640 260 T 1280 ${280 + Math.sin(frame * 0.06) * 20} L 1280 720 L 0 720 Z`} fill={waveColor1} />
          <path d={`M 0 ${400 + Math.cos(frame * 0.05) * 22} Q 360 ${360 + Math.sin(frame * 0.04) * 28} 720 410 T 1280 ${420 + Math.cos(frame * 0.07) * 24} L 1280 720 L 0 720 Z`} fill={waveColor2} />
          <path d={`M 0 ${540 + Math.sin(frame * 0.06) * 18} Q 320 ${520 + Math.cos(frame * 0.05) * 22} 640 545 T 1280 ${560 + Math.sin(frame * 0.04) * 18} L 1280 720 L 0 720 Z`} fill={waveColor3} />
        </svg>
        <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(to top, ${hexToRgba(darker2, 0.30)} 0%, transparent 35%)`, opacity: waveShift > 50 ? 1 : 1 }} />
      </>
    )
  }

  // ── NEW: spotlight — único haz cónico iluminando la zona del texto ──────────
  if (bgTreat === 'spotlight') {
    const spotX = gs.align === 'center' ? '50%' : '32%'
    const spotY = gs.textY >= 65 ? '78%' : gs.textY <= 28 ? '24%' : '50%'
    return (
      <>
        {!hasBg && <GradientBg gradient={`radial-gradient(ellipse at center, ${darker} 0%, #050505 100%)`} />}
        <PhotoImg />
        <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse 35% 45% at ${spotX} ${spotY}, transparent 0%, rgba(0,0,0,0.20) 30%, rgba(0,0,0,0.75) 70%, rgba(0,0,0,0.90) 100%)` }} />
        <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse 30% 35% at ${spotX} ${spotY}, ${hexToRgba(brandColor, 0.22)} 0%, transparent 60%)` }} />
      </>
    )
  }

  // ── NEW: dotMatrix — patrón de puntos pulsando con color de marca ───────────
  if (bgTreat === 'dotMatrix') {
    const pulse = 0.6 + 0.4 * Math.sin(frame * 0.05)
    return (
      <>
        <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(${gs.gradAngle}deg, ${shiftColor(brandColor,-30)} 0%, ${shiftColor(secondary,-15)} 100%)` }} />
        {hasBg && <Img src={bgImage!} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.15, transform: `scale(${kenBurns})`, transformOrigin: kbOrigin }} />}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `radial-gradient(${hexToRgba(brandColor, 0.45 * pulse)} 4px, transparent 4.5px)`,
          backgroundSize: '46px 46px',
          backgroundPosition: `${(frame * 0.3) % 46}px ${(frame * 0.2) % 46}px`,
        }} />
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `radial-gradient(${hexToRgba(secondary, 0.30 * pulse)} 2px, transparent 2.5px)`,
          backgroundSize: '24px 24px',
        }} />
        <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse 70% 60% at 50% 50%, transparent 0%, ${hexToRgba(darker2, 0.50)} 85%)` }} />
      </>
    )
  }

  // ── NEW: meshGradient — gradiente mesh multicolor estilo conic ──────────────
  if (bgTreat === 'meshGradient') {
    const rot = (frame * 0.4) % 360
    return (
      <>
        <div style={{
          position: 'absolute', inset: 0,
          background: `conic-gradient(from ${rot}deg at 30% 40%, ${brandColor}, ${secondary}, ${shiftColor(brandColor, +30)}, ${shiftColor(secondary, -10)}, ${brandColor})`,
        }} />
        <div style={{
          position: 'absolute', inset: 0,
          background: `radial-gradient(circle at 70% 60%, ${hexToRgba(shiftColor(brandColor, +20), 0.55)} 0%, transparent 50%)`,
          filter: 'blur(40px)',
        }} />
        {hasBg && <Img src={bgImage!} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.20, mixBlendMode: 'overlay' }} />}
        <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(to top, ${hexToRgba(darker2, 0.40)} 0%, transparent 50%)` }} />
      </>
    )
  }

  // ── NEW: paperTexture — papel suave con tinte de marca ──────────────────────
  if (bgTreat === 'paperTexture') {
    return (
      <>
        <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(${gs.gradAngle}deg, ${shiftColor(brandColor, +35)} 0%, ${shiftColor(secondary, +30)} 100%)` }} />
        <svg width="0" height="0" style={{ position: 'absolute' }}>
          <filter id={`paper-${frame % 5}`}>
            <feTurbulence type="fractalNoise" baseFrequency="0.025" numOctaves="3" />
            <feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.18 0" />
          </filter>
        </svg>
        <div style={{ position: 'absolute', inset: 0, filter: `url(#paper-${frame % 5})`, mixBlendMode: 'multiply', opacity: 0.6 }} />
        {hasBg && <Img src={bgImage!} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.32, mixBlendMode: 'multiply' }} />}
        <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse 80% 70% at 50% 50%, transparent 30%, ${hexToRgba(darker2, 0.22)} 100%)` }} />
      </>
    )
  }

  // minimal — default
  return (
    <>
      {!hasBg && <GradientBg gradient={`linear-gradient(155deg, ${darker2} 0%, ${darker} 60%, ${brandColor} 100%)`} />}
      <PhotoImg />
      {hasBg && <div style={{ position: 'absolute', inset: 0, background: `rgba(0,0,0,${Math.min(0.30, overlayAlpha * 0.38)})` }} />}
      <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(to top, rgba(0,0,0,${Math.min(0.72, overlayAlpha*0.90)}) 0%, transparent 40%)` }} />
    </>
  )
}

// ─── AccentLayer — 12 tipos ───────────────────────────────────────────────────

const AccentLayer: React.FC<{
  gs: GeneratedStyle; brandColor: string; accent: string
  frame: number; total: number; fps: number
  sceneIdx: number; isBottom: boolean; isCenter: boolean; paddingH: number
  brandName?: string; logoOpacity?: number
}> = ({ gs, brandColor, accent, frame, total, fps, sceneIdx, isBottom, isCenter, paddingH, brandName, logoOpacity = 1 }) => {
  const accentC = shiftColor(accent, gs.accentBright)
  const darker  = shiftColor(brandColor, -55)

  const barH    = spring({ frame, fps, config: { stiffness: 110, damping: 18 }, durationInFrames: 20 })
  const lineW   = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) })
  const floatY  = 6 * Math.sin(frame * 0.04)
  const rotDeg  = frame * 0.15

  if (gs.accentType === 'vbar') return (
    <>
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 7, background: `linear-gradient(to bottom, transparent 5%, ${brandColor} 30%, ${accentC} 70%, transparent 95%)`, boxShadow: `4px 0 20px ${hexToRgba(brandColor, 0.55)}` }} />
      <div style={{ position: 'absolute', left: paddingH, top: `${50 - barH * 26}%`, width: interpolate(frame, [0, 14], [0, 200], { extrapolateRight: 'clamp' }), height: 2, background: hexToRgba(accentC, 0.55) }} />
    </>
  )

  if (gs.accentType === 'hline') return (
    <>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 44, background: 'rgba(0,0,0,0.88)' }} />
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 44, background: 'rgba(0,0,0,0.88)' }} />
      <div style={{ position: 'absolute', top: 44, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${hexToRgba(accentC, 0.85)}, transparent)` }} />
      <div style={{ position: 'absolute', bottom: 44, left: 0, right: 0, height: 1, background: `linear-gradient(90deg, transparent, ${hexToRgba(accentC, 0.40)}, transparent)` }} />
    </>
  )

  if (gs.accentType === 'bracket') return (
    <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 14, background: `linear-gradient(to bottom, ${accentC} 0%, ${darker} 100%)`, boxShadow: `6px 0 24px ${hexToRgba(accentC, 0.40)}` }} />
  )

  if (gs.accentType === 'pill') return (
    <div style={{
      position: 'absolute',
      bottom: isBottom ? 218 : undefined, top: isBottom ? undefined : 58, left: paddingH,
      background: hexToRgba(brandColor, 0.92), borderRadius: 5, padding: '5px 15px',
      opacity: logoOpacity,
      boxShadow: `0 4px 16px ${hexToRgba(brandColor, 0.45)}`,
    }}>
      <span style={{ color: '#fff', fontSize: 12, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', fontFamily: 'system-ui' }}>
        {brandName ?? String(sceneIdx + 1).padStart(2, '0')}
      </span>
    </div>
  )

  if (gs.accentType === 'circle') return (
    <>
      <div style={{
        position: 'absolute',
        right: isCenter ? '50%' : -50, top: '50%',
        width: 500, height: 500, borderRadius: '50%',
        border: `2px solid ${hexToRgba(accentC, 0.12)}`,
        transform: `translateY(calc(-50% + ${floatY}px)) ${isCenter ? 'translateX(50%)' : ''}`,
      }} />
      <div style={{
        position: 'absolute',
        right: isCenter ? '50%' : 20, top: '50%',
        width: 320, height: 320, borderRadius: '50%',
        background: `radial-gradient(circle, ${hexToRgba(accentC, 0.10)} 0%, transparent 68%)`,
        transform: `translateY(calc(-50% + ${floatY * -0.7}px)) ${isCenter ? 'translateX(50%)' : ''}`,
      }} />
    </>
  )

  if (gs.accentType === 'diagonal') return (
    <>
      <div style={{
        position: 'absolute', top: -100, right: isCenter ? '35%' : '55%',
        width: 80, height: '200%',
        background: hexToRgba(accentC, 0.12),
        transform: 'rotate(12deg)', transformOrigin: 'center center',
      }} />
      <div style={{
        position: 'absolute', top: -100, right: isCenter ? '28%' : '48%',
        width: 30, height: '200%',
        background: hexToRgba(accentC, 0.07),
        transform: 'rotate(12deg)', transformOrigin: 'center center',
      }} />
    </>
  )

  if (gs.accentType === 'grid') return (
    <div style={{
      position: 'absolute', inset: 0,
      backgroundImage: `radial-gradient(${hexToRgba('#fff', 0.055)} 1.5px, transparent 1.5px)`,
      backgroundSize: '34px 34px',
    }} />
  )

  // ── NEW: cornerBracket ───────────────────────────────────────────────────────
  if (gs.accentType === 'cornerBracket') {
    const reveal = interpolate(frame, [0, 18], [0, 1], { extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) })
    const bSize  = Math.round(52 * reveal)
    const bW     = 3
    const c      = hexToRgba(accentC, 0.80)
    const m      = 38
    return (
      <>
        {/* Top-left */}
        <div style={{ position: 'absolute', top: m, left: m, width: bSize, height: bW, background: c }} />
        <div style={{ position: 'absolute', top: m, left: m, width: bW, height: bSize, background: c }} />
        {/* Top-right */}
        <div style={{ position: 'absolute', top: m, right: m, width: bSize, height: bW, background: c }} />
        <div style={{ position: 'absolute', top: m, right: m, width: bW, height: bSize, background: c }} />
        {/* Bottom-left */}
        <div style={{ position: 'absolute', bottom: m, left: m, width: bSize, height: bW, background: c }} />
        <div style={{ position: 'absolute', bottom: m, left: m, width: bW, height: bSize, background: c }} />
        {/* Bottom-right */}
        <div style={{ position: 'absolute', bottom: m, right: m, width: bSize, height: bW, background: c }} />
        <div style={{ position: 'absolute', bottom: m, right: m, width: bW, height: bSize, background: c }} />
      </>
    )
  }

  // ── NEW: particles ─────────────────────────────────────────────────────────
  if (gs.accentType === 'particles') {
    const pts = Array.from({ length: 18 }, (_, i) => ({
      x:    10 + seededRand(i * 11 + 3, 0) * 80,
      y:    10 + seededRand(i * 11 + 3, 1) * 80,
      r:    2 + seededRand(i * 11 + 3, 2) * 4,
      spd:  0.015 + seededRand(i * 11 + 3, 3) * 0.035,
      pha:  seededRand(i * 11 + 3, 4) * Math.PI * 2,
    }))
    return (
      <>
        {pts.map((p, pi) => {
          const op     = interpolate(frame, [pi * 1.5, pi * 1.5 + 12], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
          const floatDy = Math.sin(frame * p.spd + p.pha) * 8
          const floatDx = Math.cos(frame * p.spd * 0.7 + p.pha) * 5
          return (
            <div key={pi} style={{
              position: 'absolute',
              left: `${p.x + floatDx * 0.3}%`,
              top:  `${p.y + floatDy * 0.3}%`,
              width:  p.r * 2, height: p.r * 2,
              borderRadius: '50%',
              background: hexToRgba(accentC, 0.45),
              opacity: op,
              boxShadow: `0 0 ${p.r * 2}px ${hexToRgba(accentC, 0.35)}`,
            }} />
          )
        })}
      </>
    )
  }

  // ── NEW: neonBorder ────────────────────────────────────────────────────────
  if (gs.accentType === 'neonBorder') {
    const reveal = interpolate(frame, [0, 22], [0, 1], { extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) })
    const pulse  = 0.6 + 0.4 * Math.sin(frame * 0.08)
    const glow   = `0 0 12px ${hexToRgba(accentC, 0.7 * pulse)}, 0 0 40px ${hexToRgba(accentC, 0.25 * pulse)}`
    const bAlpha = 0.65 * reveal * pulse
    return (
      <>
        <div style={{ position: 'absolute', top: 24, left: 24, right: 24, height: 1.5, background: hexToRgba(accentC, bAlpha), boxShadow: glow }} />
        <div style={{ position: 'absolute', bottom: 24, left: 24, right: 24, height: 1.5, background: hexToRgba(accentC, bAlpha), boxShadow: glow }} />
        <div style={{ position: 'absolute', top: 24, bottom: 24, left: 24, width: 1.5, background: hexToRgba(accentC, bAlpha), boxShadow: glow }} />
        <div style={{ position: 'absolute', top: 24, bottom: 24, right: 24, width: 1.5, background: hexToRgba(accentC, bAlpha), boxShadow: glow }} />
      </>
    )
  }

  // ── NEW: filmstrip ─────────────────────────────────────────────────────────
  if (gs.accentType === 'filmstrip') {
    const holeH = 14
    const holeW = 20
    const gap   = 12
    const stripH = 36
    const count = 22
    return (
      <>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: stripH, background: 'rgba(0,0,0,0.88)' }} />
        {Array.from({ length: count }, (_, i) => (
          <div key={i} style={{
            position: 'absolute',
            top: (stripH - holeH) / 2,
            left: 20 + i * (holeW + gap),
            width: holeW, height: holeH,
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: 2,
          }} />
        ))}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: stripH, background: 'rgba(0,0,0,0.88)' }} />
        {Array.from({ length: count }, (_, i) => (
          <div key={`b-${i}`} style={{
            position: 'absolute',
            bottom: (stripH - holeH) / 2,
            left: 20 + i * (holeW + gap),
            width: holeW, height: holeH,
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: 2,
          }} />
        ))}
      </>
    )
  }

  // ── NEW: tiltCard — cards decorativas rotadas (floating card UI refs) ────────
  if (gs.accentType === 'tiltCard') {
    const reveal  = interpolate(frame, [0, 28], [0, 1], { extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) })
    const floatY  = 5 * Math.sin(frame * 0.025 + 0.5)
    const floatY2 = 4 * Math.sin(frame * 0.030)
    const right   = isCenter ? '8%' : '4%'
    return (
      <>
        {/* Card trasera — más rotada */}
        <div style={{
          position: 'absolute',
          right, top: '12%',
          width: 300, height: 190,
          background: `linear-gradient(135deg, ${hexToRgba(accentC, 0.10 * reveal)}, ${hexToRgba(brandColor, 0.06 * reveal)})`,
          border: `1px solid ${hexToRgba(accentC, 0.18 * reveal)}`,
          borderRadius: 18,
          transform: `rotate(-10deg) translateY(${floatY}px)`,
          boxShadow: `0 12px 40px rgba(0,0,0,0.4)`,
        }} />
        {/* Card del medio */}
        <div style={{
          position: 'absolute',
          right, top: '20%',
          width: 265, height: 165,
          background: `linear-gradient(135deg, ${hexToRgba(accentC, 0.07 * reveal)}, ${hexToRgba(brandColor, 0.04 * reveal)})`,
          border: `1px solid ${hexToRgba(accentC, 0.25 * reveal)}`,
          borderRadius: 15,
          transform: `rotate(-5deg) translateY(${floatY2}px)`,
          boxShadow: `0 8px 28px rgba(0,0,0,0.35)`,
        }}>
          {/* Mini líneas internas */}
          <div style={{ position: 'absolute', top: 20, left: 16, right: 16, height: 1.5, background: hexToRgba(accentC, 0.22 * reveal), borderRadius: 1 }} />
          <div style={{ position: 'absolute', top: 32, left: 16, width: '55%', height: 1, background: hexToRgba(accentC, 0.14 * reveal), borderRadius: 1 }} />
        </div>
      </>
    )
  }

  // ── NEW: badgePop — pill badge animado en esquina (travel/recipe "Top Rated") ─
  if (gs.accentType === 'badgePop') {
    const pop    = spring({ frame: Math.max(0, frame - 6), fps, config: { stiffness: 400, damping: 14 }, durationInFrames: 20 })
    const scale  = interpolate(pop, [0, 1], [0.0, 1.0])
    const pulse  = 1 + 0.025 * Math.sin(frame * 0.08)
    const badgeX = isCenter ? '50%' : undefined
    return (
      <div style={{
        position: 'absolute',
        top: 32, right: isCenter ? undefined : 36, left: isCenter ? '50%' : undefined,
        transform: `scale(${scale}) ${isCenter ? 'translateX(-50%)' : ''} scaleX(${pulse})`,
        transformOrigin: 'right top',
      }}>
        <div style={{
          background: hexToRgba(accentC, 0.95),
          borderRadius: 24,
          padding: '9px 20px',
          display: 'flex', alignItems: 'center', gap: 7,
          boxShadow: `0 4px 20px ${hexToRgba(accentC, 0.50)}, 0 1px 0 rgba(255,255,255,0.25) inset`,
          border: `1px solid ${hexToRgba('#fff', 0.18)}`,
        }}>
          <span style={{
            color: '#fff', fontSize: 13, fontWeight: 800,
            fontFamily: 'system-ui, -apple-system, sans-serif',
            letterSpacing: '1.5px', textTransform: 'uppercase',
          }}>
            ★ TOP PICK
          </span>
        </div>
      </div>
    )
  }

  // ── NEW: arrowMark — flecha gruesa que apunta al texto ──────────────────────
  if (gs.accentType === 'arrowMark') {
    const reveal  = interpolate(frame, [4, 24], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) })
    const arrowY  = isBottom ? '38%' : isCenter ? '22%' : '62%'
    const arrowX  = isCenter ? '12%' : '72%'
    const drift   = Math.sin(frame * 0.05) * 4
    return (
      <div style={{
        position: 'absolute', left: arrowX, top: arrowY,
        opacity: reveal, transform: `translate(${drift}px, 0) scale(${0.6 + reveal * 0.4})`,
      }}>
        <svg width={170} height={120} viewBox="0 0 170 120" style={{ filter: `drop-shadow(0 4px 14px ${hexToRgba(accentC, 0.45)})` }}>
          <path d={`M 12 60 Q 60 ${12 + Math.sin(frame * 0.06) * 6} 130 60`} stroke={accentC} strokeWidth={5} fill="none" strokeLinecap="round" />
          <path d="M 116 46 L 140 60 L 116 76" stroke={accentC} strokeWidth={5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    )
  }

  // ── NEW: noiseTexture — grano sutil con SVG sobre toda la escena ────────────
  if (gs.accentType === 'noiseTexture') {
    return (
      <>
        <svg width="0" height="0" style={{ position: 'absolute' }}>
          <filter id={`noise-${sceneIdx}`}>
            <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" stitchTiles="stitch" />
            <feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.12 0" />
          </filter>
        </svg>
        <div style={{
          position: 'absolute', inset: 0,
          filter: `url(#noise-${sceneIdx})`,
          mixBlendMode: 'overlay',
          opacity: 0.55,
          pointerEvents: 'none',
        }} />
      </>
    )
  }

  // ── NEW: colorFrame — marco grueso de color de marca ────────────────────────
  if (gs.accentType === 'colorFrame') {
    const reveal = interpolate(frame, [0, 22], [0, 1], { extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) })
    const thick  = 14
    return (
      <>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: thick, background: accentC, transformOrigin: 'left', transform: `scaleX(${reveal})` }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: thick, background: accentC, transformOrigin: 'right', transform: `scaleX(${reveal})` }} />
        <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: thick, background: accentC, transformOrigin: 'top', transform: `scaleY(${reveal})` }} />
        <div style={{ position: 'absolute', top: 0, bottom: 0, right: 0, width: thick, background: accentC, transformOrigin: 'bottom', transform: `scaleY(${reveal})` }} />
      </>
    )
  }

  // ── NEW: sticker — sticker rotado tipo "NEW" o brand-name ───────────────────
  if (gs.accentType === 'sticker') {
    const pop    = spring({ frame: Math.max(0, frame - 8), fps, config: { stiffness: 380, damping: 14 }, durationInFrames: 22 })
    const scale  = interpolate(pop, [0, 1], [0, 1])
    const wobble = Math.sin(frame * 0.09) * 2.5
    const right  = isCenter ? undefined : 64
    const left   = isCenter ? '12%' : undefined
    return (
      <div style={{
        position: 'absolute',
        top: 64, right, left,
        transform: `scale(${scale}) rotate(${-14 + wobble}deg)`,
        transformOrigin: 'center center',
      }}>
        <div style={{
          background: accentC,
          padding: '14px 22px',
          borderRadius: 6,
          boxShadow: `0 8px 24px ${hexToRgba(accentC, 0.5)}, 0 0 0 4px ${hexToRgba('#fff', 0.92)}`,
          border: `2px dashed rgba(255,255,255,0.45)`,
        }}>
          <span style={{
            color: '#fff', fontSize: 18, fontWeight: 900,
            fontFamily: 'system-ui',
            letterSpacing: '2px', textTransform: 'uppercase',
            display: 'block', lineHeight: 1,
          }}>
            {brandName ?? 'NEW'}
          </span>
        </div>
      </div>
    )
  }

  // ── NEW: orbitDots — puntos orbitando alrededor del centro ──────────────────
  if (gs.accentType === 'orbitDots') {
    const dots = Array.from({ length: 8 }, (_, i) => i)
    const radius = 280
    return (
      <>
        {dots.map(di => {
          const baseAngle = (di / dots.length) * Math.PI * 2
          const angle = baseAngle + frame * 0.025
          const x = Math.cos(angle) * radius
          const y = Math.sin(angle) * radius * 0.55
          const op = interpolate(frame, [di * 2, di * 2 + 14], [0, 0.8], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
          const size = 9 + (di % 3) * 4
          return (
            <div key={di} style={{
              position: 'absolute', left: '50%', top: '50%',
              width: size, height: size, borderRadius: '50%',
              background: hexToRgba(accentC, 0.85),
              transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
              opacity: op,
              boxShadow: `0 0 ${size * 2}px ${hexToRgba(accentC, 0.4)}`,
            }} />
          )
        })}
      </>
    )
  }

  return null // 'none'
}

// ─── DESIGN constants ─────────────────────────────────────────────────────────

const DESIGN_WIDTH  = 1280
const DESIGN_HEIGHT = 720

// ─── CarouselSlide — imágenes ciclan con Ken Burns durante la escena ──────────

const CarouselSlide: React.FC<{
  scene:       VideoScene
  sceneType:   'intro' | 'content' | 'cta'
  sceneIdx:    number
  gs:          GeneratedStyle
  brandColor:  string
  secondary:   string
  accent:      string
  brandName?:  string
  logoUrl?:    string
  images:      string[]     // todas las imágenes disponibles
  kbOrigins:   string[]
  fps:         number
  total:       number
}> = ({ scene, sceneType, sceneIdx, gs, brandColor, secondary, accent, brandName, logoUrl, images, kbOrigins, fps, total }) => {
  const frame   = useCurrentFrame()
  const fadeOut = interpolate(frame, [total - 12, total - 2], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const logoOp  = spring({ frame, fps, config: { stiffness: 80, damping: 20 }, durationInFrames: 22 })
  const accentC = shiftColor(accent, gs.accentBright)
  const darker2 = shiftColor(brandColor, -90)

  // Duración de cada imagen dentro de la escena
  const imgDuration  = total / Math.max(1, images.length)
  const currentIdx   = Math.floor(frame / imgDuration) % images.length
  const nextIdx      = (currentIdx + 1) % images.length
  const crossFadePos = (frame % imgDuration) / imgDuration
  const crossAlpha   = crossFadePos > 0.75 ? interpolate(crossFadePos, [0.75, 1.0], [0, 1]) : 0
  const carDrift     = organicDrift(frame, sceneIdx * 37 + gs.gradAngle)
  const carDrift2    = organicDrift(frame, sceneIdx * 37 + gs.gradAngle + 23)

  const kbCurrent = gs.kbDir === 'in'
    ? interpolate(frame, [currentIdx * imgDuration, (currentIdx + 1) * imgDuration], [1.0, 1.0 + gs.kbRange], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
    : interpolate(frame, [currentIdx * imgDuration, (currentIdx + 1) * imgDuration], [1.0 + gs.kbRange, 1.0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  const isCenter  = gs.align === 'center'
  const fontBase  = sceneType === 'intro' ? 88 : sceneType === 'cta' ? 92 : 82
  const fontSize  = Math.round(fontBase * gs.fontScale)
  const titleDelay = 12
  const subDelay   = 28
  const shadow     = '0 4px 28px rgba(0,0,0,0.86)'
  const subColor   = 'rgba(255,255,255,0.82)'
  const pulse      = sceneType === 'cta' ? 1 + 0.022 * Math.sin(frame * 0.10) : 1

  return (
    <AbsoluteFill style={{ overflow: 'hidden', opacity: fadeOut }}>
      {/* Imágenes con crossfade */}
      {images.length > 0 && sceneType !== 'cta' && (
        <>
          <Img src={images[currentIdx]!} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${kbCurrent}) translate(${carDrift.x.toFixed(2)}px, ${carDrift.y.toFixed(2)}px)`, transformOrigin: kbOrigins[currentIdx % kbOrigins.length]! }} />
          {crossAlpha > 0 && (
            <Img src={images[nextIdx]!} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: crossAlpha, transform: `scale(1.04) translate(${carDrift2.x.toFixed(2)}px, ${carDrift2.y.toFixed(2)}px)`, transformOrigin: kbOrigins[nextIdx % kbOrigins.length]! }} />
          )}
          <div style={{ position: 'absolute', inset: 0, background: `rgba(0,0,0,${gs.overlayAlpha})` }} />
          <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 45%)` }} />
        </>
      )}
      {sceneType === 'cta' && (
        <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(${gs.gradAngle}deg, #080808 0%, ${darker2} 50%, ${shiftColor(brandColor,-45)} 100%)` }} />
      )}

      <AccentLayer gs={gs} brandColor={brandColor} accent={accent} frame={frame} total={total} fps={fps} sceneIdx={sceneIdx} isBottom={gs.textY >= 65} isCenter={isCenter} paddingH={gs.paddingH} brandName={brandName} logoOpacity={logoOp} />

      {/* Texto posicionado */}
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: isCenter ? 'center' : 'flex-start',
        justifyContent: 'center',
        paddingTop:    gs.textY < 45 ? Math.round((45 - gs.textY) * 5) : 0,
        paddingBottom: gs.textY > 55 ? Math.round((gs.textY - 55) * 5) : 0,
        paddingLeft:  isCenter ? `${gs.paddingH}px` : `${gs.paddingH}px`,
        paddingRight: isCenter ? `${gs.paddingH}px` : `${gs.paddingH}px`,
      }}>
        <TextReveal text={scene.text} frame={frame} fps={fps} delay={titleDelay} gs={gs} fontSize={fontSize} color="#FFFFFF" shadow={shadow} maxWidth={isCenter ? 920 : 700} textAlign={isCenter ? 'center' : 'left'} extraStyle={sceneType === 'cta' ? { transform: `scale(${pulse})` } : undefined} />
        {gs.textAnim !== 'fadeOnly' && (
          <div style={{ width: interpolate(Math.max(0, frame - 20), [0, 22], [0, 68], { extrapolateRight: 'clamp' }), height: 3, background: hexToRgba(accentC, 0.92), borderRadius: 2, marginTop: 22, marginBottom: scene.subtext ? 14 : 0 }} />
        )}
        {scene.subtext && <SubtextReveal text={scene.subtext} frame={frame} fps={fps} delay={subDelay} gs={gs} color={subColor} fontSize={25} titleSize={fontSize} />}
      </div>

      {/* Logo en intro/cta */}
      {logoUrl && (sceneType === 'intro' || sceneType === 'cta') && (
        <div style={{ position: 'absolute', top: 52, left: isCenter ? '50%' : gs.paddingH, transform: isCenter ? `translateX(-50%)` : undefined, opacity: logoOp }}>
          <Img src={logoUrl} style={{ height: 56, width: 'auto', maxWidth: 180, objectFit: 'contain', filter: 'drop-shadow(0 3px 16px rgba(0,0,0,0.7)) brightness(1.1)' }} />
        </div>
      )}
    </AbsoluteFill>
  )
}

// ─── SplitSlide — panel oscuro izquierdo + imagen derecha ────────────────────

const SplitSlide: React.FC<{
  scene:       VideoScene
  sceneType:   'intro' | 'content' | 'cta'
  sceneIdx:    number
  gs:          GeneratedStyle
  brandColor:  string
  secondary:   string
  accent:      string
  brandName?:  string
  logoUrl?:    string
  bgImage?:    string
  kbOrigin:    string
  fps:         number
  total:       number
}> = ({ scene, sceneType, sceneIdx, gs, brandColor, secondary, accent, brandName, logoUrl, bgImage, kbOrigin, fps, total }) => {
  const frame   = useCurrentFrame()
  const fadeOut = interpolate(frame, [total - 12, total - 2], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const accentC = shiftColor(accent, gs.accentBright)
  const darker  = shiftColor(brandColor, -55)
  const darker2 = shiftColor(brandColor, -90)

  // Panel izquierdo: se desliza desde la izquierda
  const panelSlide = spring({ frame, fps, config: { stiffness: 90, damping: 22 }, durationInFrames: 28 })
  const panelX     = interpolate(panelSlide, [0, 1], [-DESIGN_WIDTH * 0.45, 0])

  // Imagen derecha: zoom Ken Burns
  const kbStart = gs.kbDir === 'in' ? 1.0 : 1.0 + gs.kbRange
  const kbEnd   = gs.kbDir === 'in' ? 1.0 + gs.kbRange : 1.0
  const kbVal   = interpolate(frame, [0, total], [kbStart, kbEnd], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  const logoOp     = spring({ frame, fps, config: { stiffness: 80, damping: 20 }, durationInFrames: 22 })
  const fontSize   = Math.round((sceneType === 'cta' ? 96 : 80) * gs.fontScale)
  const titleDelay = 16
  const subDelay   = 30
  const panelW      = 480  // panel width in design units (out of 1280)
  const pulse       = sceneType === 'cta' ? 1 + 0.022 * Math.sin(frame * 0.10) : 1
  const splitDrift  = organicDrift(frame, sceneIdx * 37 + gs.gradAngle)

  return (
    <AbsoluteFill style={{ overflow: 'hidden', opacity: fadeOut }}>
      {/* Imagen — ocupa el lado derecho */}
      {bgImage && sceneType !== 'cta' ? (
        <Img src={bgImage} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${kbVal}) translate(${splitDrift.x.toFixed(2)}px, ${splitDrift.y.toFixed(2)}px)`, transformOrigin: kbOrigin }} />
      ) : (
        <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(${gs.gradAngle}deg, ${darker2} 0%, ${darker} 50%, ${brandColor} 100%)` }} />
      )}

      {/* Panel izquierdo oscuro deslizándose */}
      <div style={{
        position: 'absolute', top: 0, bottom: 0, left: 0,
        width: panelW,
        background: `linear-gradient(160deg, #000000 0%, #0a0a0a 60%, ${hexToRgba(brandColor, 0.15)} 100%)`,
        transform: `translateX(${panelX}px)`,
        borderRight: `1px solid ${hexToRgba(accentC, 0.25)}`,
        boxShadow: `8px 0 32px rgba(0,0,0,0.6)`,
      }}>
        {/* Línea acento vertical */}
        <div style={{
          position: 'absolute', right: 0, top: '10%', bottom: '10%',
          width: 2,
          background: `linear-gradient(to bottom, transparent, ${hexToRgba(accentC, 0.8)}, transparent)`,
          boxShadow: `0 0 12px ${hexToRgba(accentC, 0.5)}`,
        }} />

        {/* Logo */}
        {logoUrl && (
          <div style={{ position: 'absolute', top: 52, left: 52, opacity: logoOp }}>
            <Img src={logoUrl} style={{ height: 44, width: 'auto', maxWidth: 140, objectFit: 'contain', filter: 'brightness(1.1) drop-shadow(0 2px 10px rgba(0,0,0,0.8))' }} />
          </div>
        )}

        {/* Texto */}
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column', justifyContent: 'center',
          paddingLeft: 52, paddingRight: 40,
          paddingTop: logoUrl ? 60 : 0,
        }}>
          <TextReveal text={scene.text} frame={frame} fps={fps} delay={titleDelay} gs={{ ...gs, align: 'left' }} fontSize={fontSize} color="#FFFFFF" shadow="0 4px 28px rgba(0,0,0,0.95)" maxWidth={panelW - 80} textAlign="left" extraStyle={pulse !== 1 ? { transform: `scale(${pulse})`, transformOrigin: 'left center' } : undefined} />
          <div style={{ width: interpolate(Math.max(0, frame - 22), [0, 22], [0, 60], { extrapolateRight: 'clamp' }), height: 3, background: hexToRgba(accentC, 0.9), borderRadius: 2, marginTop: 22, marginBottom: scene.subtext ? 14 : 0, boxShadow: `0 0 10px ${hexToRgba(accentC, 0.6)}` }} />
          {scene.subtext && <SubtextReveal text={scene.subtext} frame={frame} fps={fps} delay={subDelay} gs={{ ...gs, align: 'left' }} color="rgba(255,255,255,0.75)" fontSize={22} titleSize={fontSize} />}
        </div>

        {/* Nombre de marca abajo */}
        {brandName && (
          <div style={{
            position: 'absolute', bottom: 36, left: 52,
            opacity: interpolate(frame, [36, 52], [0, 0.60], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
          }}>
            <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13, fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase', fontFamily: 'system-ui' }}>{brandName}</span>
          </div>
        )}
      </div>

      {/* Degradado de suavizado en el borde del panel */}
      <div style={{
        position: 'absolute', top: 0, bottom: 0,
        left: panelW - 1,
        width: 80,
        background: `linear-gradient(90deg, rgba(0,0,0,0.55), transparent)`,
        transform: `translateX(${panelX}px)`,
      }} />
    </AbsoluteFill>
  )
}

// ─── MagazineSlide — tipografía editorial masiva ──────────────────────────────

const MagazineSlide: React.FC<{
  scene:       VideoScene
  sceneType:   'intro' | 'content' | 'cta'
  sceneIdx:    number
  gs:          GeneratedStyle
  brandColor:  string
  secondary:   string
  accent:      string
  brandName?:  string
  logoUrl?:    string
  bgImage?:    string
  kbOrigin:    string
  fps:         number
  total:       number
}> = ({ scene, sceneType, sceneIdx, gs, brandColor, secondary, accent, brandName, logoUrl, bgImage, kbOrigin, fps, total }) => {
  const frame   = useCurrentFrame()
  const fadeOut = interpolate(frame, [total - 12, total - 2], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const accentC = shiftColor(accent, gs.accentBright)
  const darker  = shiftColor(brandColor, -55)
  const darker2 = shiftColor(brandColor, -90)

  // Fondo
  const hasBg   = !!bgImage && sceneType !== 'cta'
  const kbVal   = interpolate(frame, [0, total], gs.kbDir === 'in' ? [1.0, 1.0 + gs.kbRange] : [1.0 + gs.kbRange, 1.0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const magDrift = organicDrift(frame, sceneIdx * 37 + gs.gradAngle)

  // Texto enorme — font muy grande, toma todo el ancho
  // Headline editorial adaptativo — admite 2 líneas, no se sale del frame
  const bigFont = Math.round(fitFontSize(scene.text, DESIGN_WIDTH - 120, 130, gs.fontScale, { minSize: 64, maxLines: 2 }))
  const titleDelay = 8
  const subDelay   = 22
  const logoOp     = spring({ frame, fps, config: { stiffness: 80, damping: 20 }, durationInFrames: 22 })

  // Línea decorativa superior
  const lineW = interpolate(frame, [0, 20], [0, DESIGN_WIDTH * 0.65], { extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) })

  return (
    <AbsoluteFill style={{ overflow: 'hidden', opacity: fadeOut }}>
      {/* Fondo */}
      {hasBg ? (
        <>
          <Img src={bgImage!} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.22, transform: `scale(${kbVal}) translate(${magDrift.x.toFixed(2)}px, ${magDrift.y.toFixed(2)}px)`, transformOrigin: kbOrigin }} />
          <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(155deg, ${darker2} 0%, ${shiftColor(brandColor,-70)} 100%)` }} />
        </>
      ) : (
        <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(155deg, ${darker2} 0%, ${darker} 55%, ${shiftColor(brandColor,-25)} 100%)` }} />
      )}

      {/* Número de escena editorial */}
      <div style={{
        position: 'absolute', top: 42, right: 60,
        opacity: interpolate(frame, [6, 20], [0, 0.15], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
        fontSize: 240, fontWeight: 900, color: '#ffffff',
        fontFamily: 'system-ui, Arial, sans-serif',
        lineHeight: 1, letterSpacing: '-0.05em',
        userSelect: 'none',
      }}>
        {String(sceneIdx + 1).padStart(2, '0')}
      </div>

      {/* Línea superior */}
      <div style={{ position: 'absolute', top: 54, left: 60, width: lineW, height: 2, background: hexToRgba(accentC, 0.75), boxShadow: `0 0 10px ${hexToRgba(accentC, 0.4)}` }} />

      {/* Logo */}
      {logoUrl && (
        <div style={{ position: 'absolute', top: 42, left: 60, opacity: logoOp }}>
          <Img src={logoUrl} style={{ height: 38, width: 'auto', maxWidth: 120, objectFit: 'contain', filter: 'brightness(1.1)' }} />
        </div>
      )}

      {/* Texto editorial — alineado abajo-izquierda o izquierda-centro */}
      <div style={{
        position: 'absolute',
        bottom: 72, left: 60, right: 60,
        display: 'flex', flexDirection: 'column',
        alignItems: gs.align === 'center' ? 'center' : 'flex-start',
      }}>
        {scene.subtext && (
          <div style={{
            color: hexToRgba(accentC, 0.9),
            fontSize: 14, fontWeight: 700,
            letterSpacing: '4px', textTransform: 'uppercase',
            fontFamily: 'system-ui',
            opacity: interpolate(frame, [subDelay, subDelay + 14], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
            marginBottom: 14,
            textAlign: gs.align === 'center' ? 'center' : 'left',
          }}>
            {scene.subtext}
          </div>
        )}
        <TextReveal text={scene.text} frame={frame} fps={fps} delay={titleDelay} gs={gs} fontSize={bigFont} color="#FFFFFF" shadow="0 6px 40px rgba(0,0,0,0.95)" maxWidth={DESIGN_WIDTH - 120} textAlign={gs.align === 'center' ? 'center' : 'left'} />
        {/* Línea inferior */}
        <div style={{ width: interpolate(Math.max(0, frame - 18), [0, 22], [0, 80], { extrapolateRight: 'clamp' }), height: 3, background: hexToRgba(accentC, 0.85), borderRadius: 2, marginTop: 28 }} />
      </div>
    </AbsoluteFill>
  )
}

// ─── OverlaySlide — estilo Instagram Story: foto domina, texto al pie ─────────

const OverlaySlide: React.FC<{
  scene:       VideoScene
  sceneType:   'intro' | 'content' | 'cta'
  sceneIdx:    number
  gs:          GeneratedStyle
  brandColor:  string
  secondary:   string
  accent:      string
  brandName?:  string
  logoUrl?:    string
  bgImage?:    string
  kbOrigin:    string
  fps:         number
  total:       number
}> = ({ scene, sceneType, sceneIdx, gs, brandColor, secondary, accent, brandName, logoUrl, bgImage, kbOrigin, fps, total }) => {
  const frame   = useCurrentFrame()
  const fadeOut = interpolate(frame, [total - 12, total - 2], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const accentC = shiftColor(accent, gs.accentBright)
  const darker2 = shiftColor(brandColor, -90)
  const logoOp  = spring({ frame, fps, config: { stiffness: 80, damping: 20 }, durationInFrames: 22 })

  const hasBg   = !!bgImage && sceneType !== 'cta'
  const kbVal   = interpolate(frame, [0, total], gs.kbDir === 'in' ? [1.0, 1.0 + gs.kbRange] : [1.0 + gs.kbRange, 1.0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const ovrDrift = organicDrift(frame, sceneIdx * 37 + gs.gradAngle)

  const fontSize   = Math.round(72 * gs.fontScale)
  const titleDelay = 14
  const subDelay   = 30

  // Altura del bloque de texto inferior
  const blockH = 200

  // El bloque entra deslizando desde abajo
  const blockSlide = spring({ frame: Math.max(0, frame - 8), fps, config: { stiffness: 70, damping: 22 }, durationInFrames: 30 })
  const blockY     = interpolate(blockSlide, [0, 1], [blockH, 0])

  return (
    <AbsoluteFill style={{ overflow: 'hidden', opacity: fadeOut }}>
      {/* Imagen casi sin overlay */}
      {hasBg ? (
        <>
          <Img src={bgImage!} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${kbVal}) translate(${ovrDrift.x.toFixed(2)}px, ${ovrDrift.y.toFixed(2)}px)`, transformOrigin: kbOrigin }} />
          <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.15) 40%, rgba(0,0,0,0.06) 70%, transparent 100%)` }} />
        </>
      ) : (
        <>
          <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(180deg, ${darker2} 0%, ${shiftColor(brandColor,-30)} 100%)` }} />
        </>
      )}

      {/* AccentLayer */}
      <AccentLayer gs={gs} brandColor={brandColor} accent={accent} frame={frame} total={total} fps={fps} sceneIdx={sceneIdx} isBottom isCenter={false} paddingH={gs.paddingH} brandName={brandName} logoOpacity={logoOp} />

      {/* Logo en top-left */}
      {logoUrl && (
        <div style={{ position: 'absolute', top: 44, left: gs.paddingH, opacity: logoOp }}>
          <Img src={logoUrl} style={{ height: 40, width: 'auto', maxWidth: 120, objectFit: 'contain', filter: 'drop-shadow(0 2px 12px rgba(0,0,0,0.8)) brightness(1.1)' }} />
        </div>
      )}

      {/* Bloque de texto deslizante desde abajo */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        transform: `translateY(${blockY}px)`,
        padding: `28px ${gs.paddingH}px 44px`,
        background: `linear-gradient(to top, rgba(0,0,0,0.98) 0%, rgba(0,0,0,0.85) 80%, transparent 100%)`,
      }}>
        {/* Pill de categoría */}
        <div style={{
          display: 'inline-block', background: hexToRgba(brandColor, 0.85),
          borderRadius: 4, padding: '4px 12px', marginBottom: 16,
          opacity: interpolate(frame, [titleDelay, titleDelay + 10], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
        }}>
          <span style={{ color: '#fff', fontSize: 11, fontWeight: 700, letterSpacing: '2.5px', textTransform: 'uppercase', fontFamily: 'system-ui' }}>
            {brandName ?? '—'}
          </span>
        </div>
        <TextReveal text={scene.text} frame={frame} fps={fps} delay={titleDelay} gs={{ ...gs, align: 'left' }} fontSize={fontSize} color="#FFFFFF" shadow="0 3px 20px rgba(0,0,0,0.9)" maxWidth={DESIGN_WIDTH - gs.paddingH * 2} textAlign="left" />
        {scene.subtext && <SubtextReveal text={scene.subtext} frame={frame} fps={fps} delay={subDelay} gs={{ ...gs, align: 'left' }} color="rgba(255,255,255,0.72)" fontSize={22} />}
      </div>
    </AbsoluteFill>
  )
}

// ─── PhotoTopSlide — foto top 60% + panel blanco deslizante (travel/recipe cards) ──

const PhotoTopSlide: React.FC<{
  scene:       VideoScene
  sceneType:   'intro' | 'content' | 'cta'
  sceneIdx:    number
  gs:          GeneratedStyle
  brandColor:  string
  secondary:   string
  accent:      string
  brandName?:  string
  logoUrl?:    string
  bgImage?:    string
  kbOrigin:    string
  fps:         number
  total:       number
}> = ({ scene, sceneType, sceneIdx, gs, brandColor, secondary, accent, brandName, logoUrl, bgImage, kbOrigin, fps, total }) => {
  const frame   = useCurrentFrame()
  const fadeOut = interpolate(frame, [total - 12, total - 2], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const accentC = shiftColor(accent, gs.accentBright)
  const darker2 = shiftColor(brandColor, -90)
  const logoOp  = spring({ frame, fps, config: { stiffness: 80, damping: 20 }, durationInFrames: 22 })

  // Photo = top 62% of frame
  const photoH = Math.round(DESIGN_HEIGHT * 0.62)
  // White panel = bottom ~42% (overlaps slightly for smooth edge)
  const panelH = Math.round(DESIGN_HEIGHT * 0.44)

  const hasBg   = !!bgImage && sceneType !== 'cta'
  const kbVal   = interpolate(frame, [0, total], gs.kbDir === 'in' ? [1.0, 1.0 + gs.kbRange] : [1.0 + gs.kbRange, 1.0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const ptDrift = organicDrift(frame, sceneIdx * 37 + gs.gradAngle)

  // Panel desliza desde abajo
  const panelSlide = spring({ frame: Math.max(0, frame - 4), fps, config: { stiffness: 68, damping: 24 }, durationInFrames: 32 })
  const panelY     = interpolate(panelSlide, [0, 1], [panelH, 0])

  // Accent line reveal
  const lineW = interpolate(frame, [18, 38], [0, 72], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) })

  const titleDelay = 18
  const subDelay   = 34
  // Para la escena CTA, el fondo no es foto sino gradiente de marca
  const fontSize   = Math.round((sceneType === 'cta' ? 68 : 60) * gs.fontScale)

  // Colores del panel — blanco para content, oscuro para CTA
  const isCta       = sceneType === 'cta'
  const panelBg     = isCta ? `linear-gradient(160deg, #0a0a0a 0%, ${darker2} 100%)` : '#ffffff'
  const titleColor  = isCta ? '#ffffff' : '#0a0a0a'
  const subColor    = isCta ? hexToRgba(accentC, 0.85) : '#6B7280'
  const accentLine  = isCta ? hexToRgba(accentC, 0.9) : hexToRgba(accentC, 0.85)

  return (
    <AbsoluteFill style={{ overflow: 'hidden', opacity: fadeOut }}>

      {/* ── Zona de foto (top 62%) ── */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: photoH, overflow: 'hidden' }}>
        {hasBg ? (
          <Img src={bgImage!} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${kbVal}) translate(${ptDrift.x.toFixed(2)}px, ${ptDrift.y.toFixed(2)}px)`, transformOrigin: kbOrigin }} />
        ) : (
          <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(155deg, ${darker2} 0%, ${shiftColor(brandColor,-20)} 60%, ${shiftColor(brandColor,+20)} 100%)` }} />
        )}
        {/* Degradado hacia blanco/oscuro en la parte inferior de la foto */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: 100,
          background: isCta
            ? 'linear-gradient(to bottom, transparent, #0a0a0a)'
            : 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.95))',
        }} />

        {/* Badge/pill en esquina superior derecha — inspirado en "Top Rated", "Spicy Choice" */}
        <div style={{
          position: 'absolute', top: 22, left: 22,
          opacity: interpolate(frame, [6, 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
        }}>
          <div style={{
            background: 'rgba(0,0,0,0.52)',
            backdropFilter: 'blur(4px)',
            borderRadius: 20, padding: '7px 16px',
            border: '1px solid rgba(255,255,255,0.22)',
          }}>
            <span style={{ color: '#fff', fontSize: 13, fontWeight: 700, fontFamily: 'system-ui', letterSpacing: '1px' }}>
              {brandName ?? '✦ BRAND'}
            </span>
          </div>
        </div>

        {/* Logo en top-right */}
        {logoUrl && (
          <div style={{ position: 'absolute', top: 22, right: 26, opacity: logoOp }}>
            <Img src={logoUrl} style={{ height: 36, width: 'auto', maxWidth: 110, objectFit: 'contain', filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.6)) brightness(1.1)' }} />
          </div>
        )}
      </div>

      {/* ── Panel de texto (sube desde abajo) ── */}
      <div style={{
        position: 'absolute',
        bottom: 0, left: 0, right: 0,
        height: panelH,
        transform: `translateY(${panelY}px)`,
        background: panelBg,
        borderTopLeftRadius: isCta ? 0 : 28,
        borderTopRightRadius: isCta ? 0 : 28,
        boxShadow: isCta ? 'none' : '0 -10px 40px rgba(0,0,0,0.14)',
        paddingTop: 28,
        paddingLeft: gs.paddingH,
        paddingRight: gs.paddingH,
        paddingBottom: 32,
        display: 'flex', flexDirection: 'column',
        justifyContent: 'flex-start',
      }}>
        {/* Línea acento de color */}
        <div style={{ width: lineW, height: 3.5, background: accentLine, borderRadius: 2, marginBottom: 20, boxShadow: isCta ? `0 0 12px ${hexToRgba(accentC, 0.6)}` : 'none' }} />

        <TextReveal
          text={scene.text}
          frame={frame} fps={fps} delay={titleDelay}
          gs={gs} fontSize={fontSize}
          color={titleColor}
          shadow={isCta ? '0 4px 24px rgba(0,0,0,0.6)' : 'none'}
          maxWidth={DESIGN_WIDTH - gs.paddingH * 2}
          textAlign={gs.align === 'center' ? 'center' : 'left'}
        />

        {scene.subtext && (
          <SubtextReveal
            text={scene.subtext} frame={frame} fps={fps} delay={subDelay}
            gs={gs} color={subColor} fontSize={20}
            extraStyle={{ marginTop: 12 }}
          />
        )}

        {/* Dot indicators de carousel (inspirados en los dots de paginación de las refs) */}
        <div style={{
          display: 'flex', gap: 7, marginTop: 20,
          opacity: interpolate(frame, [subDelay + 8, subDelay + 22], [0, 0.6], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
        }}>
          {[0,1,2].map(di => (
            <div key={di} style={{
              width: di === 0 ? 20 : 7, height: 7, borderRadius: 4,
              background: di === 0 ? accentLine : (isCta ? 'rgba(255,255,255,0.25)' : '#D1D5DB'),
              transition: 'none',
            }} />
          ))}
        </div>
      </div>

      {/* AccentLayer sobre la foto */}
      <AccentLayer gs={gs} brandColor={brandColor} accent={accent} frame={frame} total={total} fps={fps} sceneIdx={sceneIdx} isBottom={false} isCenter={gs.align === 'center'} paddingH={gs.paddingH} brandName={brandName} logoOpacity={logoOp} />
    </AbsoluteFill>
  )
}

// ─── GenericSlide (hero) ──────────────────────────────────────────────────────

const GenericSlide: React.FC<{
  scene:       VideoScene
  sceneType:   'intro' | 'content' | 'cta'
  sceneIdx:    number
  gs:          GeneratedStyle
  brandColor:  string
  secondary:   string
  accent:      string
  brandName?:  string
  logoUrl?:    string
  bgImage?:    string
  kbOrigin:    string
  fps:         number
  total:       number
}> = ({ scene, sceneType, sceneIdx, gs, brandColor, secondary, accent, brandName, logoUrl, bgImage, kbOrigin, fps, total }) => {
  const frame = useCurrentFrame()

  const kbStart  = gs.kbDir === 'out' ? 1.0 + gs.kbRange : 1.0
  const kbEnd    = gs.kbDir === 'out' ? 1.0 : 1.0 + gs.kbRange
  const kbActual = sceneIdx % 2 === 0
    ? interpolate(frame, [0, total], [kbStart, kbEnd],   { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
    : interpolate(frame, [0, total], [kbEnd,   kbStart], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const fadeOut  = interpolate(frame, [total - 12, total - 2], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const logoOp   = spring({ frame, fps, config: { stiffness: 80, damping: 20 }, durationInFrames: 22 })

  const isCenter = gs.align === 'center'
  const isBottom = gs.textY >= 65
  const isTop    = gs.textY <= 28
  const isCta    = sceneType === 'cta'
  const accentC  = shiftColor(accent, gs.accentBright)

  const displayText   = scene.text
  const fontSizeBase  = sceneType === 'intro' ? 88 : sceneType === 'cta' ? 92 : 82
  const fontSize      = Math.round(fontSizeBase * gs.fontScale)
  const titleDelay    = gs.textAnim === 'wordByWord' ? 8 : gs.textAnim === 'blurReveal' ? 6 : 14
  const subDelay      = gs.textAnim === 'wordByWord' ? 22 : gs.textAnim === 'blurReveal' ? 20 : 32

  const shadow = (gs.bgTreat === 'vignette' || gs.bgTreat === 'minimal')
    ? `0 0 55px ${hexToRgba(brandColor, 0.42)}, 0 2px 14px rgba(0,0,0,0.55)`
    : isCta ? '0 4px 32px rgba(0,0,0,0.48)'
    : '0 4px 28px rgba(0,0,0,0.86)'

  const subColor = gs.bgTreat === 'panel' || isCta
    ? hexToRgba(accentC, 0.88)
    : gs.bgTreat === 'minimal'
      ? 'rgba(255,255,255,0.90)'
      : 'rgba(255,255,255,0.82)'

  const pulse = isCta ? 1 + 0.022 * Math.sin(frame * 0.10) : 1

  const CtaBg = () => {
    const d2  = shiftColor(brandColor, -80)
    const d1  = shiftColor(brandColor, -45)
    const d0  = shiftColor(brandColor, -18)
    const sec = shiftColor(secondary,  -8)
    if (gs.bgTreat === 'dark' || gs.bgTreat === 'tint') return (
      <>
        <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(${gs.gradAngle}deg, #080808 0%, ${d2} 45%, ${d1} 100%)` }} />
        <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse 80% 80% at 50% 50%, transparent 20%, rgba(0,0,0,0.55) 100%)` }} />
        {gs.accentType !== 'none' && gs.accentType !== 'grid' && (
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: `linear-gradient(90deg, transparent, ${hexToRgba(accentC, 0.80)}, transparent)` }} />
        )}
      </>
    )
    if (gs.bgTreat === 'panel') return (
      <>
        <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(${gs.gradAngle}deg, ${d1} 0%, ${d0} 48%, ${brandColor} 100%)` }} />
        <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse 68% 68% at 50% 50%, transparent 28%, rgba(0,0,0,0.42) 100%)` }} />
      </>
    )
    if (gs.bgTreat === 'vignette') return (
      <>
        <div style={{ position: 'absolute', inset: 0, background: '#040404' }} />
        <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse 58% 58% at 50% 42%, ${hexToRgba(brandColor, 0.35)} 0%, transparent 68%)` }} />
        <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(to top, rgba(0,0,0,0.88) 0%, transparent 52%)` }} />
      </>
    )
    if (gs.bgTreat === 'minimal' || gs.bgTreat === 'duotone' || gs.bgTreat === 'colorBurn') return (
      <>
        <div style={{ position: 'absolute', inset: 0, background: '#0C0C0C' }} />
        <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(${gs.gradAngle}deg, transparent 0%, ${hexToRgba(brandColor, 0.18)} 50%, transparent 100%)` }} />
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg, transparent 10%, ${hexToRgba(brandColor, 0.50)} 50%, transparent 90%)` }} />
      </>
    )
    if (gs.bgTreat === 'glassmorphism') return (
      <>
        <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(145deg, #050505 0%, ${shiftColor(brandColor,-75)} 50%, #080808 100%)` }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.02) 50%, rgba(0,0,0,0.12) 100%)' }} />
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'rgba(255,255,255,0.18)' }} />
        <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse 60% 60% at 50% 50%, ${hexToRgba(brandColor, 0.14)} 0%, transparent 70%)` }} />
      </>
    )
    if (gs.bgTreat === 'paperGrid') return (
      <>
        <div style={{ position: 'absolute', inset: 0, background: '#060606' }} />
        <div style={{ position: 'absolute', inset: 0, backgroundImage: `linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)`, backgroundSize: '52px 52px' }} />
        <div style={{ position: 'absolute', inset: 0, backgroundImage: `radial-gradient(${hexToRgba(brandColor, 0.20)} 1.5px, transparent 1.5px)`, backgroundSize: '52px 52px', backgroundPosition: '-1px -1px' }} />
        <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse 70% 70% at 50% 42%, ${hexToRgba(brandColor, 0.16)} 0%, transparent 65%)` }} />
      </>
    )
    if (gs.bgTreat === 'cinematic') return (
      <>
        <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(${gs.gradAngle}deg, #050505 0%, ${d2} 50%, ${d1} 100%)` }} />
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 80, background: '#000' }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 80, background: '#000' }} />
      </>
    )
    return (
      <>
        <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(${gs.gradAngle}deg, #090909 0%, ${d2} 60%, ${sec} 100%)` }} />
        <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse 50% 70% at ${gs.gradAngle < 180 ? '85%' : '15%'} 50%, ${hexToRgba(brandColor, 0.22)} 0%, transparent 65%)` }} />
        <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(to top, rgba(0,0,0,0.82) 0%, transparent 48%)` }} />
      </>
    )
  }

  return (
    <AbsoluteFill style={{ overflow: 'hidden', opacity: fadeOut }}>
      {isCta
        ? <CtaBg />
        : <BgLayer bgImage={bgImage} gs={gs} brandColor={brandColor} secondary={secondary} kenBurns={kbActual} kbOrigin={kbOrigin} sceneType={sceneType} frame={frame} driftSeed={sceneIdx * 37 + gs.gradAngle} />
      }

      <AccentLayer
        gs={gs} brandColor={brandColor} accent={accent}
        frame={frame} total={total} fps={fps}
        sceneIdx={sceneIdx} isBottom={isBottom} isCenter={isCenter} paddingH={gs.paddingH}
        brandName={brandName} logoOpacity={logoOp}
      />

      {logoUrl && (sceneType === 'intro' || sceneType === 'cta') && !isBottom && (() => {
        // ── Safe-zone vertical para el logo ────────────────────────────────────
        // Texto muy arriba (textY <= 25): logo más pequeño Y más arriba para no chocar.
        // Texto en zona media: logo en posición normal.
        const tightTop = gs.textY <= 25 && sceneType === 'intro'
        const logoTop  = tightTop ? 24 : gs.accentType === 'hline' ? 62 : 56
        const logoH    = sceneType === 'cta' ? 28 : tightTop ? 38 : 68
        return (
          <div style={{
            position: 'absolute',
            top: logoTop,
            left: isCenter ? '50%' : gs.paddingH,
            transform: isCenter ? `translateX(-50%) scale(${logoOp})` : `scale(${logoOp})`,
            transformOrigin: isCenter ? 'top center' : 'top left',
            opacity: logoOp,
          }}>
            <Img src={logoUrl} style={{ height: logoH, width: 'auto', maxWidth: 200, objectFit: 'contain', filter: sceneType === 'cta' ? 'brightness(0) invert(1)' : 'drop-shadow(0 3px 16px rgba(0,0,0,0.7)) brightness(1.1)' }} />
          </div>
        )
      })()}

      <div style={{
        position: 'absolute',
        ...(isBottom && !isCta
          ? { bottom: Math.round(DESIGN_HEIGHT * (1 - gs.textY / 100)) + (gs.accentType === 'hline' ? 44 : 0), left: gs.accentType === 'bracket' ? gs.paddingH + 22 : gs.accentType === 'vbar' ? gs.paddingH + 26 : gs.paddingH, right: gs.paddingH }
          : isTop && !isCta
          ? {
              top: Math.round(DESIGN_HEIGHT * gs.textY / 100) + (gs.accentType === 'hline' ? 44 : 0),
              left: isCenter ? 0 : gs.accentType === 'bracket' ? gs.paddingH + 22 : gs.accentType === 'vbar' ? gs.paddingH + 26 : gs.paddingH,
              right: isCenter ? 0 : gs.paddingH,
              display: 'flex', flexDirection: 'column',
              alignItems: isCenter ? 'center' : 'flex-start',
              paddingLeft: isCenter ? `${gs.paddingH + 14}px` : undefined,
              paddingRight: isCenter ? `${gs.paddingH + 14}px` : bgImage && gs.bgTreat !== 'split' ? '360px' : undefined,
            }
          : {
              top: 0, left: 0, right: 0, bottom: 0,
              display: 'flex', flexDirection: 'column',
              alignItems: isCenter ? 'center' : 'flex-start',
              justifyContent: 'center',
              paddingTop:    gs.accentType === 'hline' ? 48 : gs.textY < 45 ? Math.round((45 - gs.textY) * 5) : 0,
              paddingBottom: gs.accentType === 'hline' ? 48 : gs.textY > 55 ? Math.round((gs.textY - 55) * 5) : 0,
              paddingLeft:   isCenter ? `${gs.paddingH + 14}px` : gs.accentType === 'bracket' ? `${gs.paddingH + 22}px` : gs.accentType === 'vbar' ? `${gs.paddingH + 26}px` : `${gs.paddingH}px`,
              paddingRight:  isCenter ? `${gs.paddingH + 14}px` : bgImage && !isCta && gs.bgTreat !== 'split' ? '360px' : `${gs.paddingH}px`,
            }
        ),
      }}>
        {logoUrl && sceneType === 'intro' && isBottom && (
          <div style={{ marginBottom: 14, opacity: logoOp }}>
            <Img src={logoUrl} style={{ height: 48, width: 'auto', maxWidth: 150, objectFit: 'contain', filter: 'brightness(1.1) drop-shadow(0 2px 10px rgba(0,0,0,0.8))' }} />
          </div>
        )}

        <TextReveal
          text={isCta ? scene.text : displayText}
          frame={frame} fps={fps} delay={titleDelay}
          gs={gs} fontSize={fontSize} color="#FFFFFF" shadow={shadow}
          maxWidth={isCenter ? 920 : 700}
          textAlign={isCenter ? 'center' : 'left'}
          extraStyle={isCta && gs.textAnim !== 'blurReveal' ? { transform: `scale(${pulse})` } : undefined}
        />

        {gs.textAnim !== 'fadeOnly' && (
          <div style={{
            width: interpolate(Math.max(0, frame - 20), [0, 22], [0, 68], { extrapolateRight: 'clamp' }),
            height: gs.tracking.includes('0.1') || gs.tracking.includes('0.2') ? 1 : 3,
            background: gs.tracking.includes('0.1') || gs.tracking.includes('0.2')
              ? hexToRgba('#fff', 0.38)
              : hexToRgba(accentC, gs.bgTreat === 'panel' || isCta ? 0.75 : 0.92),
            borderRadius: 2, marginTop: 22, marginBottom: scene.subtext ? 14 : 0,
            boxShadow: gs.accentType === 'vbar' ? `0 0 12px ${hexToRgba(accentC, 0.85)}` : 'none',
          }} />
        )}

        {scene.subtext && (
          <SubtextReveal
            text={scene.subtext} frame={frame} fps={fps} delay={subDelay}
            gs={gs} color={subColor}
            fontSize={gs.tracking.includes('0.1') || gs.tracking.includes('0.2') ? 18 : 25}
          />
        )}
      </div>

      {isCta && brandName && (
        <div style={{
          position: 'absolute', bottom: 40,
          left: isCenter ? '50%' : gs.paddingH,
          transform: isCenter ? 'translateX(-50%)' : undefined,
          display: 'flex', alignItems: 'center', gap: 10,
          opacity: interpolate(frame, [36, 52], [0, 0.58], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
        }}>
          {logoUrl && (
            <Img src={logoUrl} style={{ height: 22, width: 'auto', maxWidth: 66, objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
          )}
          <span style={{ color: 'rgba(255,255,255,0.88)', fontSize: 15, fontWeight: 600, fontFamily: 'system-ui', letterSpacing: parseFloat(gs.tracking) > 4 ? '4px' : '2px', textTransform: 'uppercase' }}>
            {brandName}
          </span>
        </div>
      )}
    </AbsoluteFill>
  )
}

// ─── BigTypeSlide — tipografía monstruosa, foto miniatura o ausente ─────────

const BigTypeSlide: React.FC<{
  scene:       VideoScene
  sceneType:   'intro' | 'content' | 'cta'
  sceneIdx:    number
  gs:          GeneratedStyle
  brandColor:  string
  secondary:   string
  accent:      string
  brandName?:  string
  logoUrl?:    string
  bgImage?:    string
  kbOrigin:    string
  fps:         number
  total:       number
}> = ({ scene, sceneType, sceneIdx, gs, brandColor, secondary, accent, brandName, logoUrl, bgImage, kbOrigin, fps, total }) => {
  const frame   = useCurrentFrame()
  const fadeOut = interpolate(frame, [total - 12, total - 2], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const accentC = shiftColor(accent, gs.accentBright)
  const darker2 = shiftColor(brandColor, -90)
  const logoOp  = spring({ frame, fps, config: { stiffness: 80, damping: 20 }, durationInFrames: 22 })

  // Tipografía enorme adaptativa — escala según longitud para evitar overflow
  // baseSize 200 con scale 1.28 = 256, pero fitFontSize lo baja si el texto es largo
  const giantFont  = Math.round(fitFontSize(scene.text, DESIGN_WIDTH - 140, 200, gs.fontScale, { minSize: 84, maxLines: 1 }))
  const titleDelay = 6
  // Subtext arranca cuando el título ya está casi asentado (spring de 32 frames)
  const subDelay   = Math.max(34, titleDelay + 28)

  // La foto pequeña está en una esquina como mini-thumbnail
  const hasMini = !!bgImage && sceneType !== 'cta'
  const miniSize = 220
  const miniKb   = interpolate(frame, [0, total], [1.0, 1.0 + gs.kbRange], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const miniCorner = sceneIdx % 4
  const miniPos = miniCorner === 0 ? { top: 80, right: 80 }
                : miniCorner === 1 ? { bottom: 80, right: 80 }
                : miniCorner === 2 ? { top: 80, left: 80 }
                : { bottom: 80, left: 80 }

  return (
    <AbsoluteFill style={{ overflow: 'hidden', opacity: fadeOut }}>
      {/* Fondo de color de marca (no foto full-bleed) */}
      <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(${gs.gradAngle}deg, ${brandColor} 0%, ${shiftColor(secondary, -10)} 100%)` }} />
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse 80% 60% at 50% 50%, ${hexToRgba(shiftColor(brandColor, +25), 0.30)} 0%, transparent 70%)` }} />

      {/* Texto monstruoso atravesando el frame */}
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', alignItems: 'center',
        justifyContent: gs.align === 'center' ? 'center' : 'flex-start',
        paddingLeft:  gs.align === 'center' ? 0 : gs.paddingH,
        paddingRight: gs.align === 'center' ? 0 : gs.paddingH,
      }}>
        <TextReveal
          text={scene.text}
          frame={frame} fps={fps} delay={titleDelay}
          gs={gs} fontSize={giantFont}
          color="#FFFFFF"
          shadow={`0 8px 50px ${hexToRgba(darker2, 0.65)}`}
          maxWidth={DESIGN_WIDTH - 80}
          textAlign={gs.align === 'center' ? 'center' : 'left'}
          extraStyle={{ lineHeight: 0.88, letterSpacing: '-0.04em' }}
        />
      </div>

      {/* Subtext flotando arriba o abajo en pequeño */}
      {scene.subtext && (
        <div style={{
          position: 'absolute',
          bottom: gs.textY < 50 ? 60 : undefined,
          top: gs.textY >= 50 ? 60 : undefined,
          left: '50%', transform: 'translateX(-50%)',
          opacity: interpolate(frame, [subDelay, subDelay + 14], [0, 0.95], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
        }}>
          <div style={{ background: hexToRgba(darker2, 0.50), backdropFilter: 'blur(8px)', padding: '10px 22px', borderRadius: 100, border: `1px solid ${hexToRgba('#fff', 0.18)}` }}>
            <span style={{ color: '#fff', fontSize: 16, fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase', fontFamily: 'system-ui' }}>
              {scene.subtext}
            </span>
          </div>
        </div>
      )}

      {/* Thumbnail pequeña con la foto */}
      {hasMini && (
        <div style={{
          position: 'absolute', ...miniPos,
          width: miniSize, height: miniSize,
          borderRadius: 18, overflow: 'hidden',
          transform: `scale(${spring({ frame: Math.max(0, frame - 10), fps, config: { stiffness: 200, damping: 18 }, durationInFrames: 22 })}) rotate(${-3 + (sceneIdx % 2) * 6}deg)`,
          boxShadow: `0 18px 50px ${hexToRgba(darker2, 0.55)}, 0 0 0 6px rgba(255,255,255,0.95)`,
        }}>
          <Img src={bgImage!} style={{ width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${miniKb})`, transformOrigin: kbOrigin }} />
        </div>
      )}

      {/* AccentLayer ligero */}
      <AccentLayer gs={gs} brandColor={brandColor} accent={accent} frame={frame} total={total} fps={fps} sceneIdx={sceneIdx} isBottom={gs.textY >= 65} isCenter={gs.align === 'center'} paddingH={gs.paddingH} brandName={brandName} logoOpacity={logoOp} />

      {/* Logo arriba */}
      {logoUrl && (sceneType === 'intro' || sceneType === 'cta') && (
        <div style={{ position: 'absolute', top: 44, left: 60, opacity: logoOp }}>
          <Img src={logoUrl} style={{ height: 44, width: 'auto', maxWidth: 140, objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
        </div>
      )}
    </AbsoluteFill>
  )
}

// ─── MosaicSlide — grilla 2x2 de fotos + texto en una celda ────────────────

const MosaicSlide: React.FC<{
  scene:       VideoScene
  sceneType:   'intro' | 'content' | 'cta'
  sceneIdx:    number
  gs:          GeneratedStyle
  brandColor:  string
  secondary:   string
  accent:      string
  brandName?:  string
  logoUrl?:    string
  bgImage?:    string
  kbOrigin:    string
  fps:         number
  total:       number
  images:      string[]
}> = ({ scene, sceneType, sceneIdx, gs, brandColor, secondary, accent, brandName, logoUrl, bgImage, kbOrigin, fps, total, images }) => {
  const frame   = useCurrentFrame()
  const fadeOut = interpolate(frame, [total - 12, total - 2], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const accentC = shiftColor(accent, gs.accentBright)
  const darker2 = shiftColor(brandColor, -90)
  const logoOp  = spring({ frame, fps, config: { stiffness: 80, damping: 20 }, durationInFrames: 22 })

  // Posición de la celda de texto (1 de 4)
  const textCell = sceneIdx % 4
  const cells = [0, 1, 2, 3]
  const fontSize = Math.round(52 * gs.fontScale)
  const titleDelay = 22
  const subDelay   = 38

  // Pool de imágenes (rota si hay pocas)
  const photoCells = cells.filter(c => c !== textCell)

  return (
    <AbsoluteFill style={{ overflow: 'hidden', opacity: fadeOut, background: darker2 }}>
      <div style={{ position: 'absolute', inset: 0, display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr', gap: 6 }}>
        {cells.map(ci => {
          const isText = ci === textCell
          const cellDelay = ci * 4
          const op = interpolate(frame, [cellDelay, cellDelay + 16], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
          const sc = spring({ frame: Math.max(0, frame - cellDelay), fps, config: { stiffness: 110, damping: 20 }, durationInFrames: 24 })

          if (isText) {
            return (
              <div key={ci} style={{
                background: `linear-gradient(${gs.gradAngle}deg, ${brandColor}, ${shiftColor(secondary, -10)})`,
                display: 'flex', flexDirection: 'column', justifyContent: 'center',
                padding: 38,
                opacity: op,
                transform: `scale(${sc})`,
                position: 'relative', overflow: 'hidden',
              }}>
                <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(circle at 30% 30%, ${hexToRgba('#fff', 0.10)}, transparent 60%)` }} />
                <TextReveal text={scene.text} frame={frame} fps={fps} delay={titleDelay} gs={{ ...gs, align: 'left' }} fontSize={fontSize} color="#FFFFFF" shadow={`0 4px 18px ${hexToRgba(darker2, 0.5)}`} maxWidth={300} textAlign="left" />
                {scene.subtext && <SubtextReveal text={scene.subtext} frame={frame} fps={fps} delay={subDelay} gs={{ ...gs, align: 'left' }} color="rgba(255,255,255,0.88)" fontSize={16} extraStyle={{ marginTop: 12 }} />}
              </div>
            )
          }

          const imgIdx = photoCells.indexOf(ci)
          const imgUrl = images.length > 0 ? images[imgIdx % images.length] : null
          const kbVal  = interpolate(frame, [0, total], [1.0, 1.0 + gs.kbRange * 0.6], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

          return (
            <div key={ci} style={{
              opacity: op,
              transform: `scale(${sc})`,
              position: 'relative', overflow: 'hidden',
              background: shiftColor(brandColor, -50),
            }}>
              {imgUrl ? (
                <Img src={imgUrl} style={{ width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${kbVal})`, transformOrigin: ci % 2 === 0 ? 'top right' : 'bottom left' }} />
              ) : (
                <div style={{ width: '100%', height: '100%', background: `linear-gradient(${(ci * 90 + 45)}deg, ${shiftColor(brandColor, -30 + ci * 10)}, ${shiftColor(secondary, -10 - ci * 5)})` }} />
              )}
              {/* Tinte de marca sutil */}
              <div style={{ position: 'absolute', inset: 0, background: hexToRgba(brandColor, 0.18), mixBlendMode: 'overlay' }} />
            </div>
          )
        })}
      </div>

      {/* Logo */}
      {logoUrl && (sceneType === 'intro' || sceneType === 'cta') && (
        <div style={{ position: 'absolute', top: 28, left: 28, opacity: logoOp, zIndex: 5 }}>
          <Img src={logoUrl} style={{ height: 36, width: 'auto', maxWidth: 120, objectFit: 'contain', filter: 'brightness(0) invert(1) drop-shadow(0 2px 8px rgba(0,0,0,0.6))' }} />
        </div>
      )}
    </AbsoluteFill>
  )
}

// ─── DiagonalSplitSlide — división diagonal foto/color ──────────────────────

const DiagonalSplitSlide: React.FC<{
  scene:       VideoScene
  sceneType:   'intro' | 'content' | 'cta'
  sceneIdx:    number
  gs:          GeneratedStyle
  brandColor:  string
  secondary:   string
  accent:      string
  brandName?:  string
  logoUrl?:    string
  bgImage?:    string
  kbOrigin:    string
  fps:         number
  total:       number
}> = ({ scene, sceneType, sceneIdx, gs, brandColor, secondary, accent, brandName, logoUrl, bgImage, kbOrigin, fps, total }) => {
  const frame   = useCurrentFrame()
  const fadeOut = interpolate(frame, [total - 12, total - 2], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const accentC = shiftColor(accent, gs.accentBright)
  const darker2 = shiftColor(brandColor, -90)
  const logoOp  = spring({ frame, fps, config: { stiffness: 80, damping: 20 }, durationInFrames: 22 })

  const reveal = spring({ frame, fps, config: { stiffness: 60, damping: 24 }, durationInFrames: 38 })
  const cut    = interpolate(reveal, [0, 1], [110, 50])  // % horizontal del corte
  const slope  = sceneIdx % 2 === 0 ? 12 : -12             // grados del corte
  const fontSize = Math.round(72 * gs.fontScale)
  const titleDelay = 20
  const subDelay   = 36

  const hasBg = !!bgImage && sceneType !== 'cta'
  const kbVal = interpolate(frame, [0, total], [1.0, 1.0 + gs.kbRange], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  return (
    <AbsoluteFill style={{ overflow: 'hidden', opacity: fadeOut }}>
      {/* Mitad foto */}
      <div style={{
        position: 'absolute', inset: 0,
        clipPath: `polygon(0 0, ${cut}% 0, ${cut - slope}% 100%, 0 100%)`,
      }}>
        {hasBg ? (
          <Img src={bgImage!} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${kbVal})`, transformOrigin: kbOrigin }} />
        ) : (
          <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(155deg, ${shiftColor(brandColor, -30)}, ${darker2})` }} />
        )}
        <div style={{ position: 'absolute', inset: 0, background: hexToRgba(brandColor, 0.22), mixBlendMode: 'multiply' }} />
      </div>

      {/* Mitad color */}
      <div style={{
        position: 'absolute', inset: 0,
        clipPath: `polygon(${cut}% 0, 100% 0, 100% 100%, ${cut - slope}% 100%)`,
        background: `linear-gradient(${gs.gradAngle}deg, ${brandColor} 0%, ${shiftColor(secondary, -15)} 100%)`,
      }}>
        <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(circle at 70% 50%, ${hexToRgba(shiftColor(brandColor, +20), 0.30)}, transparent 60%)` }} />
      </div>

      {/* Línea diagonal de acento */}
      <div style={{
        position: 'absolute', top: 0, bottom: 0,
        left: `${cut}%`,
        width: 4,
        transformOrigin: 'top',
        transform: `rotate(${-slope * 0.5}deg) translateX(-2px)`,
        background: `linear-gradient(to bottom, transparent, ${accentC}, transparent)`,
        boxShadow: `0 0 20px ${hexToRgba(accentC, 0.7)}`,
        opacity: reveal,
      }} />

      {/* Texto en la mitad de color */}
      <div style={{
        position: 'absolute',
        top: '50%',
        right: 70,
        transform: 'translateY(-50%)',
        width: '42%',
        maxWidth: 540,
      }}>
        <TextReveal text={scene.text} frame={frame} fps={fps} delay={titleDelay} gs={{ ...gs, align: 'left' }} fontSize={fontSize} color="#FFFFFF" shadow={`0 4px 24px ${hexToRgba(darker2, 0.6)}`} maxWidth={500} textAlign="left" />
        {gs.textAnim !== 'fadeOnly' && (
          <div style={{ width: interpolate(frame, [titleDelay + 4, titleDelay + 24], [0, 80], { extrapolateRight: 'clamp' }), height: 3, background: '#fff', borderRadius: 2, marginTop: 18, marginBottom: scene.subtext ? 12 : 0 }} />
        )}
        {scene.subtext && <SubtextReveal text={scene.subtext} frame={frame} fps={fps} delay={subDelay} gs={{ ...gs, align: 'left' }} color="rgba(255,255,255,0.88)" fontSize={20} />}
      </div>

      {/* Logo */}
      {logoUrl && (
        <div style={{ position: 'absolute', top: 44, left: 60, opacity: logoOp }}>
          <Img src={logoUrl} style={{ height: 38, width: 'auto', maxWidth: 120, objectFit: 'contain', filter: 'brightness(0) invert(1) drop-shadow(0 2px 10px rgba(0,0,0,0.7))' }} />
        </div>
      )}

      <AccentLayer gs={gs} brandColor={brandColor} accent={accent} frame={frame} total={total} fps={fps} sceneIdx={sceneIdx} isBottom={false} isCenter={false} paddingH={gs.paddingH} brandName={brandName} logoOpacity={logoOp} />
    </AbsoluteFill>
  )
}

// ─── CircleCropSlide — foto en círculo, texto rodeándolo, fondo color ──────

const CircleCropSlide: React.FC<{
  scene:       VideoScene
  sceneType:   'intro' | 'content' | 'cta'
  sceneIdx:    number
  gs:          GeneratedStyle
  brandColor:  string
  secondary:   string
  accent:      string
  brandName?:  string
  logoUrl?:    string
  bgImage?:    string
  kbOrigin:    string
  fps:         number
  total:       number
}> = ({ scene, sceneType, sceneIdx, gs, brandColor, secondary, accent, brandName, logoUrl, bgImage, kbOrigin, fps, total }) => {
  const frame   = useCurrentFrame()
  const fadeOut = interpolate(frame, [total - 12, total - 2], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const accentC = shiftColor(accent, gs.accentBright)
  const darker2 = shiftColor(brandColor, -90)
  const logoOp  = spring({ frame, fps, config: { stiffness: 80, damping: 20 }, durationInFrames: 22 })

  const circleScale = spring({ frame, fps, config: { stiffness: 130, damping: 20 }, durationInFrames: 30 })
  const ringScale   = spring({ frame: Math.max(0, frame - 6), fps, config: { stiffness: 110, damping: 22 }, durationInFrames: 28 })

  const hasBg = !!bgImage && sceneType !== 'cta'
  const kbVal = interpolate(frame, [0, total], [1.0, 1.0 + gs.kbRange], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  // Posición del círculo (alternada por escena)
  const circleSide = sceneIdx % 2 === 0 ? 'right' : 'left'
  const circleSize = 480
  const circlePos  = circleSide === 'right' ? { right: 60 } : { left: 60 }

  const fontSize   = Math.round(70 * gs.fontScale)
  const titleDelay = 18
  const subDelay   = 32

  return (
    <AbsoluteFill style={{ overflow: 'hidden', opacity: fadeOut }}>
      {/* Fondo de color de marca con gradiente */}
      <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(${gs.gradAngle}deg, ${brandColor} 0%, ${shiftColor(secondary, -20)} 100%)` }} />
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse 70% 60% at 30% 40%, ${hexToRgba(shiftColor(brandColor, +25), 0.30)}, transparent 65%)` }} />

      {/* Círculo decorativo de fondo (anillo) */}
      <div style={{
        position: 'absolute', top: '50%', ...circlePos,
        transform: `translateY(-50%) scale(${ringScale})`,
        width: circleSize + 80, height: circleSize + 80,
        borderRadius: '50%',
        border: `2px dashed ${hexToRgba('#fff', 0.30)}`,
        animation: 'none',
      }} />

      {/* Foto en círculo */}
      {hasBg && (
        <div style={{
          position: 'absolute', top: '50%', ...circlePos,
          transform: `translateY(-50%) scale(${circleScale})`,
          width: circleSize, height: circleSize,
          borderRadius: '50%',
          overflow: 'hidden',
          boxShadow: `0 20px 60px ${hexToRgba(darker2, 0.55)}, 0 0 0 6px rgba(255,255,255,0.95)`,
        }}>
          <Img src={bgImage!} style={{ width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${kbVal})`, transformOrigin: kbOrigin }} />
        </div>
      )}
      {!hasBg && (
        <div style={{
          position: 'absolute', top: '50%', ...circlePos,
          transform: `translateY(-50%) scale(${circleScale})`,
          width: circleSize, height: circleSize,
          borderRadius: '50%',
          background: `linear-gradient(135deg, ${shiftColor(brandColor, +20)}, ${shiftColor(secondary, -10)})`,
          boxShadow: `0 20px 60px ${hexToRgba(darker2, 0.55)}`,
        }} />
      )}

      {/* Texto al lado opuesto del círculo */}
      <div style={{
        position: 'absolute',
        top: '50%',
        ...(circleSide === 'right' ? { left: 60 } : { right: 60 }),
        transform: 'translateY(-50%)',
        width: '42%', maxWidth: 480,
      }}>
        <TextReveal text={scene.text} frame={frame} fps={fps} delay={titleDelay} gs={{ ...gs, align: 'left' }} fontSize={fontSize} color="#FFFFFF" shadow={`0 4px 20px ${hexToRgba(darker2, 0.5)}`} maxWidth={460} textAlign="left" />
        <div style={{ width: interpolate(frame, [titleDelay + 4, titleDelay + 24], [0, 70], { extrapolateRight: 'clamp' }), height: 3, background: '#fff', borderRadius: 2, marginTop: 18, marginBottom: scene.subtext ? 12 : 0 }} />
        {scene.subtext && <SubtextReveal text={scene.subtext} frame={frame} fps={fps} delay={subDelay} gs={{ ...gs, align: 'left' }} color="rgba(255,255,255,0.88)" fontSize={20} />}
      </div>

      {/* Logo en top-left si no choca con círculo */}
      {logoUrl && circleSide === 'right' && (
        <div style={{ position: 'absolute', top: 44, left: 60, opacity: logoOp }}>
          <Img src={logoUrl} style={{ height: 38, width: 'auto', maxWidth: 120, objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
        </div>
      )}
      {logoUrl && circleSide === 'left' && (
        <div style={{ position: 'absolute', top: 44, right: 60, opacity: logoOp }}>
          <Img src={logoUrl} style={{ height: 38, width: 'auto', maxWidth: 120, objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
        </div>
      )}

      <AccentLayer gs={gs} brandColor={brandColor} accent={accent} frame={frame} total={total} fps={fps} sceneIdx={sceneIdx} isBottom={false} isCenter={false} paddingH={gs.paddingH} brandName={brandName} logoOpacity={logoOp} />
    </AbsoluteFill>
  )
}

// ─── VerticalBandSlide — banda vertical de color con texto, foto al lado ────

const VerticalBandSlide: React.FC<{
  scene:       VideoScene
  sceneType:   'intro' | 'content' | 'cta'
  sceneIdx:    number
  gs:          GeneratedStyle
  brandColor:  string
  secondary:   string
  accent:      string
  brandName?:  string
  logoUrl?:    string
  bgImage?:    string
  kbOrigin:    string
  fps:         number
  total:       number
}> = ({ scene, sceneType, sceneIdx, gs, brandColor, secondary, accent, brandName, logoUrl, bgImage, kbOrigin, fps, total }) => {
  const frame   = useCurrentFrame()
  const fadeOut = interpolate(frame, [total - 12, total - 2], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const accentC = shiftColor(accent, gs.accentBright)
  const darker2 = shiftColor(brandColor, -90)
  const logoOp  = spring({ frame, fps, config: { stiffness: 80, damping: 20 }, durationInFrames: 22 })

  // Banda vertical se expande desde el centro
  const bandReveal = spring({ frame, fps, config: { stiffness: 80, damping: 22 }, durationInFrames: 32 })
  const bandW = interpolate(bandReveal, [0, 1], [0, 580])

  // Banda en izquierda o derecha alternadamente
  const bandSide = sceneIdx % 2 === 0 ? 'left' : 'right'
  const bandPos  = bandSide === 'left' ? { left: 0 } : { right: 0 }

  const hasBg = !!bgImage && sceneType !== 'cta'
  const kbVal = interpolate(frame, [0, total], [1.0, 1.0 + gs.kbRange], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  const fontSize = Math.round(58 * gs.fontScale)
  const titleDelay = 20
  const subDelay   = 36

  return (
    <AbsoluteFill style={{ overflow: 'hidden', opacity: fadeOut }}>
      {/* Imagen full o fondo neutro */}
      {hasBg ? (
        <Img src={bgImage!} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${kbVal})`, transformOrigin: kbOrigin }} />
      ) : (
        <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(155deg, ${darker2}, ${shiftColor(brandColor,-25)})` }} />
      )}
      {hasBg && <div style={{ position: 'absolute', inset: 0, background: hexToRgba(darker2, 0.32) }} />}

      {/* Banda vertical de color */}
      <div style={{
        position: 'absolute', top: 0, bottom: 0,
        ...bandPos,
        width: bandW,
        background: `linear-gradient(${bandSide === 'left' ? '90deg' : '270deg'}, ${brandColor} 0%, ${shiftColor(brandColor, +10)} 50%, ${shiftColor(secondary, -10)} 100%)`,
        boxShadow: bandSide === 'left' ? `8px 0 32px ${hexToRgba(darker2, 0.55)}` : `-8px 0 32px ${hexToRgba(darker2, 0.55)}`,
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        padding: '60px 50px',
      }}>
        {logoUrl && (
          <div style={{ position: 'absolute', top: 44, ...(bandSide === 'left' ? { left: 50 } : { right: 50 }), opacity: logoOp }}>
            <Img src={logoUrl} style={{ height: 36, width: 'auto', maxWidth: 110, objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
          </div>
        )}
        <div style={{ opacity: bandReveal > 0.7 ? 1 : 0 }}>
          <TextReveal text={scene.text} frame={frame} fps={fps} delay={titleDelay} gs={{ ...gs, align: 'left' }} fontSize={fontSize} color="#FFFFFF" shadow={`0 4px 18px ${hexToRgba(darker2, 0.5)}`} maxWidth={460} textAlign="left" />
          <div style={{ width: interpolate(frame, [titleDelay + 4, titleDelay + 24], [0, 60], { extrapolateRight: 'clamp' }), height: 3, background: '#fff', borderRadius: 2, marginTop: 16, marginBottom: scene.subtext ? 12 : 0 }} />
          {scene.subtext && <SubtextReveal text={scene.subtext} frame={frame} fps={fps} delay={subDelay} gs={{ ...gs, align: 'left' }} color="rgba(255,255,255,0.85)" fontSize={18} />}
        </div>

        {/* Pequeño detalle decorativo */}
        <div style={{
          position: 'absolute', bottom: 50,
          ...(bandSide === 'left' ? { left: 50 } : { right: 50 }),
          display: 'flex', gap: 8,
          opacity: interpolate(frame, [subDelay + 8, subDelay + 22], [0, 0.7], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
        }}>
          {[0,1,2].map(di => (
            <div key={di} style={{
              width: di === 0 ? 20 : 7, height: 7, borderRadius: 4,
              background: di === 0 ? '#fff' : hexToRgba('#fff', 0.4),
            }} />
          ))}
        </div>
      </div>

      <AccentLayer gs={gs} brandColor={brandColor} accent={accent} frame={frame} total={total} fps={fps} sceneIdx={sceneIdx} isBottom={false} isCenter={false} paddingH={gs.paddingH} brandName={brandName} logoOpacity={logoOp} />
    </AbsoluteFill>
  )
}

// ─── BentoSlide — bento grid 3x2 con celdas de tamaño variable ───────────────

const BentoSlide: React.FC<{
  scene: VideoScene; sceneType: 'intro'|'content'|'cta'; sceneIdx: number
  gs: GeneratedStyle; brandColor: string; secondary: string; accent: string
  brandName?: string; logoUrl?: string; bgImage?: string; kbOrigin: string
  fps: number; total: number; images: string[]
}> = ({ scene, sceneType, sceneIdx, gs, brandColor, secondary, accent, brandName, logoUrl, kbOrigin, fps, total, images }) => {
  const frame   = useCurrentFrame()
  const fadeOut = interpolate(frame, [total - 12, total - 2], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const accentC = shiftColor(accent, gs.accentBright)
  const darker2 = shiftColor(brandColor, -90)
  const logoOp  = spring({ frame, fps, config: { stiffness: 80, damping: 20 }, durationInFrames: 22 })

  // Layout bento — 5 celdas con grid-area
  const cellPatterns = [
    // Pattern 0: text grande izq, 4 fotos pequeñas der
    { text: { col: '1 / 3', row: '1 / 3' }, photos: [{ col: '3', row: '1' }, { col: '4', row: '1' }, { col: '3', row: '2' }, { col: '4', row: '2' }] },
    // Pattern 1: text arriba ancho, 3 fotos abajo
    { text: { col: '1 / 4', row: '1' }, photos: [{ col: '1 / 2', row: '2' }, { col: '2 / 3', row: '2' }, { col: '3 / 5', row: '2' }] },
    // Pattern 2: text esquina, fotos rodeando
    { text: { col: '2 / 4', row: '1 / 2' }, photos: [{ col: '1', row: '1 / 3' }, { col: '4', row: '1 / 3' }, { col: '2 / 4', row: '2' }] },
  ]
  const pattern = cellPatterns[sceneIdx % cellPatterns.length]!
  const fontSize = Math.round(48 * gs.fontScale)

  return (
    <AbsoluteFill style={{ overflow: 'hidden', opacity: fadeOut, background: darker2, padding: 24 }}>
      <div style={{ width: '100%', height: '100%', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gridTemplateRows: 'repeat(2, 1fr)', gap: 12 }}>
        {/* Celda de texto */}
        <div style={{
          gridColumn: pattern.text.col, gridRow: pattern.text.row,
          background: `linear-gradient(${gs.gradAngle}deg, ${brandColor}, ${shiftColor(secondary,-10)})`,
          borderRadius: 18, padding: 36, position: 'relative', overflow: 'hidden',
          opacity: interpolate(frame, [0, 18], [0, 1], { extrapolateRight: 'clamp' }),
          transform: `scale(${spring({ frame, fps, config: { stiffness: 110, damping: 20 }, durationInFrames: 24 })})`,
          display: 'flex', flexDirection: 'column', justifyContent: 'center',
        }}>
          <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(circle at 30% 30%, ${hexToRgba('#fff', 0.10)}, transparent 60%)` }} />
          <TextReveal text={scene.text} frame={frame} fps={fps} delay={20} gs={{ ...gs, align: 'left' }} fontSize={fontSize} color="#FFFFFF" shadow={`0 4px 18px ${hexToRgba(darker2,0.5)}`} maxWidth={400} textAlign="left" />
          {scene.subtext && <SubtextReveal text={scene.subtext} frame={frame} fps={fps} delay={36} gs={{ ...gs, align: 'left' }} color="rgba(255,255,255,0.88)" fontSize={16} extraStyle={{ marginTop: 12 }} />}
        </div>
        {/* Celdas de foto */}
        {pattern.photos.map((p, pi) => {
          const imgUrl = images[pi % Math.max(1, images.length)] ?? null
          const delay = 4 + pi * 6
          const op = interpolate(frame, [delay, delay + 18], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
          const sc = spring({ frame: Math.max(0, frame - delay), fps, config: { stiffness: 140, damping: 20 }, durationInFrames: 22 })
          const kbVal = interpolate(frame, [0, total], [1.0, 1.0 + 0.06], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
          return (
            <div key={pi} style={{
              gridColumn: p.col, gridRow: p.row,
              borderRadius: 18, overflow: 'hidden',
              opacity: op, transform: `scale(${sc})`,
              background: shiftColor(brandColor, -40),
              position: 'relative',
            }}>
              {imgUrl ? (
                <Img src={imgUrl} style={{ width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${kbVal})`, transformOrigin: pi % 2 === 0 ? 'top right' : 'bottom left' }} />
              ) : (
                <div style={{ width: '100%', height: '100%', background: `linear-gradient(${(pi * 90 + 45)}deg, ${shiftColor(brandColor, -20 + pi * 10)}, ${shiftColor(secondary, -10 - pi * 5)})` }} />
              )}
              <div style={{ position: 'absolute', inset: 0, background: hexToRgba(brandColor, 0.15), mixBlendMode: 'multiply' }} />
            </div>
          )
        })}
      </div>
      {logoUrl && (sceneType === 'intro' || sceneType === 'cta') && (
        <div style={{ position: 'absolute', top: 36, right: 36, opacity: logoOp, zIndex: 5 }}>
          <Img src={logoUrl} style={{ height: 32, width: 'auto', maxWidth: 110, objectFit: 'contain', filter: 'brightness(0) invert(1) drop-shadow(0 2px 8px rgba(0,0,0,0.6))' }} />
        </div>
      )}
    </AbsoluteFill>
  )
}

// ─── TripleStripSlide — 3 bandas horizontales: color/foto/color ──────────────

const TripleStripSlide: React.FC<{
  scene: VideoScene; sceneType: 'intro'|'content'|'cta'; sceneIdx: number
  gs: GeneratedStyle; brandColor: string; secondary: string; accent: string
  brandName?: string; logoUrl?: string; bgImage?: string; kbOrigin: string
  fps: number; total: number
}> = ({ scene, sceneType, sceneIdx, gs, brandColor, secondary, accent, brandName, logoUrl, bgImage, kbOrigin, fps, total }) => {
  const frame   = useCurrentFrame()
  const fadeOut = interpolate(frame, [total - 12, total - 2], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const accentC = shiftColor(accent, gs.accentBright)
  const darker2 = shiftColor(brandColor, -90)
  const logoOp  = spring({ frame, fps, config: { stiffness: 80, damping: 20 }, durationInFrames: 22 })

  const top = spring({ frame, fps, config: { stiffness: 70, damping: 22 }, durationInFrames: 28 })
  const bot = spring({ frame: Math.max(0, frame - 4), fps, config: { stiffness: 70, damping: 22 }, durationInFrames: 28 })
  const topY = interpolate(top, [0, 1], [-240, 0])
  const botY = interpolate(bot, [0, 1], [240, 0])

  const hasBg = !!bgImage && sceneType !== 'cta'
  const kbVal = interpolate(frame, [0, total], [1.0, 1.0 + gs.kbRange], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  const stripH = 200       // altura de cada banda de color
  const fontSize = Math.round(68 * gs.fontScale)
  // alternar: banda superior con texto o banda media con texto
  const textInTop = sceneIdx % 2 === 0

  return (
    <AbsoluteFill style={{ overflow: 'hidden', opacity: fadeOut, background: darker2 }}>
      {/* Banda foto media */}
      <div style={{ position: 'absolute', top: stripH, left: 0, right: 0, bottom: stripH, overflow: 'hidden' }}>
        {hasBg ? (
          <Img src={bgImage!} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${kbVal})`, transformOrigin: kbOrigin }} />
        ) : (
          <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(155deg, ${darker2}, ${brandColor})` }} />
        )}
        <div style={{ position: 'absolute', inset: 0, background: hexToRgba(brandColor, 0.18), mixBlendMode: 'multiply' }} />
      </div>

      {/* Banda superior */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: stripH,
        background: `linear-gradient(${gs.gradAngle}deg, ${brandColor}, ${shiftColor(secondary, -10)})`,
        transform: `translateY(${topY}px)`,
        display: 'flex', alignItems: 'center', padding: '0 60px',
        boxShadow: `0 8px 24px ${hexToRgba(darker2, 0.45)}`,
      }}>
        {textInTop ? (
          <div style={{ flex: 1 }}>
            <TextReveal text={scene.text} frame={frame} fps={fps} delay={20} gs={{ ...gs, align: 'left' }} fontSize={fontSize} color="#FFFFFF" shadow={`0 3px 16px ${hexToRgba(darker2, 0.5)}`} maxWidth={DESIGN_WIDTH - 120} textAlign="left" />
          </div>
        ) : (
          <>
            {logoUrl && <Img src={logoUrl} style={{ height: 40, width: 'auto', maxWidth: 130, objectFit: 'contain', filter: 'brightness(0) invert(1)', opacity: logoOp }} />}
            {brandName && <span style={{ color: '#fff', fontSize: 18, fontWeight: 700, letterSpacing: '2.5px', textTransform: 'uppercase', fontFamily: 'system-ui', marginLeft: logoUrl ? 24 : 0, opacity: 0.85 }}>{brandName}</span>}
          </>
        )}
      </div>

      {/* Banda inferior */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: stripH,
        background: `linear-gradient(${(gs.gradAngle + 180) % 360}deg, ${shiftColor(secondary, -15)}, ${brandColor})`,
        transform: `translateY(${botY}px)`,
        display: 'flex', alignItems: 'center', padding: '0 60px',
        boxShadow: `0 -8px 24px ${hexToRgba(darker2, 0.45)}`,
      }}>
        {!textInTop ? (
          <div style={{ flex: 1 }}>
            <TextReveal text={scene.text} frame={frame} fps={fps} delay={20} gs={{ ...gs, align: 'left' }} fontSize={fontSize} color="#FFFFFF" shadow={`0 3px 16px ${hexToRgba(darker2, 0.5)}`} maxWidth={DESIGN_WIDTH - 120} textAlign="left" />
          </div>
        ) : scene.subtext ? (
          <SubtextReveal text={scene.subtext} frame={frame} fps={fps} delay={32} gs={{ ...gs, align: 'left' }} color="rgba(255,255,255,0.92)" fontSize={22} extraStyle={{ marginTop: 0 }} />
        ) : null}
      </div>

      <AccentLayer gs={gs} brandColor={brandColor} accent={accent} frame={frame} total={total} fps={fps} sceneIdx={sceneIdx} isBottom={!textInTop} isCenter={false} paddingH={gs.paddingH} brandName={brandName} logoOpacity={logoOp} />
    </AbsoluteFill>
  )
}

// ─── FloatingCardSlide — tarjeta flotante 3D con tilt ────────────────────────

const FloatingCardSlide: React.FC<{
  scene: VideoScene; sceneType: 'intro'|'content'|'cta'; sceneIdx: number
  gs: GeneratedStyle; brandColor: string; secondary: string; accent: string
  brandName?: string; logoUrl?: string; bgImage?: string; kbOrigin: string
  fps: number; total: number
}> = ({ scene, sceneType, sceneIdx, gs, brandColor, secondary, accent, brandName, logoUrl, bgImage, kbOrigin, fps, total }) => {
  const frame   = useCurrentFrame()
  const fadeOut = interpolate(frame, [total - 12, total - 2], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const accentC = shiftColor(accent, gs.accentBright)
  const darker2 = shiftColor(brandColor, -90)
  const logoOp  = spring({ frame, fps, config: { stiffness: 80, damping: 20 }, durationInFrames: 22 })

  // Card flota con tilt 3D
  const enter = spring({ frame, fps, config: { stiffness: 95, damping: 20 }, durationInFrames: 32 })
  const yOff  = interpolate(enter, [0, 1], [80, 0])
  const op    = interpolate(enter, [0, 0.3], [0, 1])
  const tilt  = Math.sin(frame * 0.025) * 2.5    // tilt continuo sutil
  const floatY = Math.sin(frame * 0.035) * 4

  // Card interna: 640 width × 48 padding = 544 usable
  // Permitimos 2 líneas para texto medio-largo
  const fontSize = Math.round(fitFontSize(scene.text, 540, 64, gs.fontScale, { minSize: 30, maxLines: 2 }))
  const hasBg = !!bgImage && sceneType !== 'cta'

  return (
    <AbsoluteFill style={{ overflow: 'hidden', opacity: fadeOut }}>
      {/* Fondo ambient */}
      <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(${gs.gradAngle}deg, ${shiftColor(brandColor, -45)} 0%, ${shiftColor(brandColor, -15)} 100%)` }} />
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse 60% 50% at 50% 40%, ${hexToRgba(brandColor, 0.40)} 0%, transparent 65%)` }} />
      {/* Blurred photo background */}
      {hasBg && <Img src={bgImage!} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.30, filter: 'blur(28px)', transform: `scale(1.2)` }} />}

      {/* Cards detrás (decorativas) */}
      <div style={{
        position: 'absolute', left: '50%', top: '50%',
        transform: `translate(-50%, calc(-50% + ${floatY * 0.6}px)) rotate(${-8 + tilt * 0.4}deg) scale(${enter * 0.92})`,
        width: 560, height: 380, borderRadius: 22,
        background: hexToRgba(secondary, 0.30),
        border: `1px solid ${hexToRgba('#fff', 0.18)}`,
        backdropFilter: 'blur(8px)',
        opacity: op * 0.7,
      }} />
      <div style={{
        position: 'absolute', left: '50%', top: '50%',
        transform: `translate(-50%, calc(-50% + ${floatY * 0.8}px)) rotate(${4 + tilt * 0.5}deg) scale(${enter * 0.96})`,
        width: 600, height: 400, borderRadius: 24,
        background: hexToRgba(brandColor, 0.45),
        border: `1px solid ${hexToRgba('#fff', 0.22)}`,
        backdropFilter: 'blur(10px)',
        opacity: op * 0.85,
      }} />

      {/* Card principal con texto */}
      <div style={{
        position: 'absolute', left: '50%', top: '50%',
        transform: `translate(-50%, calc(-50% + ${yOff + floatY}px)) rotate(${tilt}deg) perspective(1000px) rotateY(${tilt * 0.6}deg)`,
        width: 640, height: 420,
        background: `linear-gradient(135deg, ${hexToRgba('#fff', 0.18)}, ${hexToRgba(brandColor, 0.45)})`,
        backdropFilter: 'blur(14px)',
        border: `1.5px solid ${hexToRgba('#fff', 0.28)}`,
        borderRadius: 26,
        boxShadow: `0 24px 60px ${hexToRgba(darker2, 0.55)}, 0 0 0 1px ${hexToRgba('#fff', 0.12)} inset`,
        padding: 48,
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        opacity: op,
      }}>
        {logoUrl && (sceneType === 'intro' || sceneType === 'cta') && (
          <div style={{ marginBottom: 18, opacity: logoOp }}>
            <Img src={logoUrl} style={{ height: 32, width: 'auto', maxWidth: 110, objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
          </div>
        )}
        <TextReveal text={scene.text} frame={frame} fps={fps} delay={18} gs={{ ...gs, align: 'left' }} fontSize={fontSize} color="#FFFFFF" shadow={`0 3px 16px ${hexToRgba(darker2, 0.45)}`} maxWidth={540} textAlign="left" />
        <div style={{ width: interpolate(frame, [22, 42], [0, 80], { extrapolateRight: 'clamp' }), height: 3, background: '#fff', borderRadius: 2, marginTop: 18, marginBottom: scene.subtext ? 12 : 0 }} />
        {scene.subtext && <SubtextReveal text={scene.subtext} frame={frame} fps={fps} delay={32} gs={{ ...gs, align: 'left' }} color="rgba(255,255,255,0.85)" fontSize={20} />}
      </div>

      <AccentLayer gs={gs} brandColor={brandColor} accent={accent} frame={frame} total={total} fps={fps} sceneIdx={sceneIdx} isBottom={false} isCenter={true} paddingH={gs.paddingH} brandName={brandName} logoOpacity={logoOp} />
    </AbsoluteFill>
  )
}

// ─── TypeMaskSlide — foto recortada DENTRO de la silueta del texto ───────────

const TypeMaskSlide: React.FC<{
  scene: VideoScene; sceneType: 'intro'|'content'|'cta'; sceneIdx: number
  gs: GeneratedStyle; brandColor: string; secondary: string; accent: string
  brandName?: string; logoUrl?: string; bgImage?: string; kbOrigin: string
  fps: number; total: number
}> = ({ scene, sceneType, sceneIdx, gs, brandColor, secondary, accent, brandName, logoUrl, bgImage, kbOrigin, fps, total }) => {
  const frame   = useCurrentFrame()
  const fadeOut = interpolate(frame, [total - 12, total - 2], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const accentC = shiftColor(accent, gs.accentBright)
  const darker2 = shiftColor(brandColor, -90)
  const logoOp  = spring({ frame, fps, config: { stiffness: 80, damping: 20 }, durationInFrames: 22 })

  // Texto MASIVO con la foto haciendo de "relleno" via background-clip: text
  const hasBg = !!bgImage && sceneType !== 'cta'
  // Tipografía masiva pero adaptable — evita que texto largo desborde el frame
  const giantSize = Math.round(fitFontSize(scene.text, DESIGN_WIDTH - 120, 220, gs.fontScale, { minSize: 92, maxLines: 1 }))
  const enter = spring({ frame, fps, config: { stiffness: 60, damping: 24 }, durationInFrames: 36 })
  const scale = interpolate(enter, [0, 1], [1.8, 1.0])
  const op    = interpolate(enter, [0, 0.3], [0, 1])

  return (
    <AbsoluteFill style={{ overflow: 'hidden', opacity: fadeOut }}>
      {/* Fondo de color de marca */}
      <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(${gs.gradAngle}deg, ${darker2} 0%, ${shiftColor(brandColor, -20)} 100%)` }} />

      {/* Texto MASIVO con la foto adentro */}
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        opacity: op,
        transform: `scale(${scale})`,
        transformOrigin: 'center center',
      }}>
        {hasBg ? (
          <div style={{
            fontSize: giantSize, fontWeight: 900,
            fontFamily: 'system-ui, Arial, sans-serif',
            lineHeight: 0.85, letterSpacing: '-0.06em',
            textAlign: 'center', maxWidth: DESIGN_WIDTH - 80,
            background: `url(${bgImage}) center/cover`,
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text' as React.CSSProperties['backgroundClip'],
            color: 'transparent',
            WebkitTextStroke: `2px ${hexToRgba('#fff', 0.18)}`,
          }}>
            {scene.text}
          </div>
        ) : (
          <div style={{
            fontSize: giantSize, fontWeight: 900,
            fontFamily: 'system-ui, Arial, sans-serif',
            lineHeight: 0.85, letterSpacing: '-0.06em',
            textAlign: 'center', maxWidth: DESIGN_WIDTH - 80,
            background: `linear-gradient(135deg, ${brandColor}, ${secondary})`,
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text' as React.CSSProperties['backgroundClip'],
            color: 'transparent',
          }}>
            {scene.text}
          </div>
        )}
      </div>

      {/* Halo / glow */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `radial-gradient(ellipse 60% 40% at 50% 50%, ${hexToRgba(brandColor, 0.20)} 0%, transparent 70%)`,
        opacity: op,
      }} />

      {/* Subtext flotando */}
      {scene.subtext && (
        <div style={{
          position: 'absolute', bottom: 90, left: '50%', transform: 'translateX(-50%)',
          opacity: interpolate(frame, [28, 44], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
        }}>
          <div style={{ background: hexToRgba(darker2, 0.55), backdropFilter: 'blur(8px)', padding: '12px 24px', borderRadius: 100, border: `1px solid ${hexToRgba('#fff', 0.2)}` }}>
            <span style={{ color: '#fff', fontSize: 18, fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase', fontFamily: 'system-ui' }}>
              {scene.subtext}
            </span>
          </div>
        </div>
      )}

      {/* Logo */}
      {logoUrl && (
        <div style={{ position: 'absolute', top: 56, left: 60, opacity: logoOp }}>
          <Img src={logoUrl} style={{ height: 38, width: 'auto', maxWidth: 120, objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
        </div>
      )}

      <AccentLayer gs={gs} brandColor={brandColor} accent={accent} frame={frame} total={total} fps={fps} sceneIdx={sceneIdx} isBottom={false} isCenter={true} paddingH={gs.paddingH} brandName={brandName} logoOpacity={logoOp} />
    </AbsoluteFill>
  )
}

// ─── ZoomFrameSlide — foto en marco centrado + texto alrededor ───────────────

const ZoomFrameSlide: React.FC<{
  scene: VideoScene; sceneType: 'intro'|'content'|'cta'; sceneIdx: number
  gs: GeneratedStyle; brandColor: string; secondary: string; accent: string
  brandName?: string; logoUrl?: string; bgImage?: string; kbOrigin: string
  fps: number; total: number
}> = ({ scene, sceneType, sceneIdx, gs, brandColor, secondary, accent, brandName, logoUrl, bgImage, kbOrigin, fps, total }) => {
  const frame   = useCurrentFrame()
  const fadeOut = interpolate(frame, [total - 12, total - 2], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const accentC = shiftColor(accent, gs.accentBright)
  const darker2 = shiftColor(brandColor, -90)
  const logoOp  = spring({ frame, fps, config: { stiffness: 80, damping: 20 }, durationInFrames: 22 })

  const frameOpen = spring({ frame, fps, config: { stiffness: 90, damping: 22 }, durationInFrames: 30 })
  const frameW = interpolate(frameOpen, [0, 1], [200, 760])
  const frameH = interpolate(frameOpen, [0, 1], [200, 480])

  const hasBg = !!bgImage && sceneType !== 'cta'
  const kbVal = interpolate(frame, [0, total], [1.0, 1.0 + gs.kbRange * 1.5], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const fontSize = Math.round(56 * gs.fontScale)

  return (
    <AbsoluteFill style={{ overflow: 'hidden', opacity: fadeOut }}>
      {/* Fondo color de marca pleno */}
      <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(${gs.gradAngle}deg, ${brandColor} 0%, ${shiftColor(secondary, -10)} 100%)` }} />
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse 80% 60% at 50% 50%, ${hexToRgba(shiftColor(brandColor, +20), 0.25)} 0%, transparent 70%)` }} />

      {/* Texto arriba */}
      <div style={{ position: 'absolute', top: 60, left: 0, right: 0, padding: '0 80px', textAlign: 'center', opacity: interpolate(frame, [20, 38], [0, 1], { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' }) }}>
        {logoUrl && (
          <div style={{ marginBottom: 14, opacity: logoOp }}>
            <Img src={logoUrl} style={{ height: 32, width: 'auto', maxWidth: 100, objectFit: 'contain', filter: 'brightness(0) invert(1)', display: 'inline-block' }} />
          </div>
        )}
        <TextReveal text={scene.text} frame={frame} fps={fps} delay={18} gs={{ ...gs, align: 'center' }} fontSize={fontSize} color="#FFFFFF" shadow={`0 3px 14px ${hexToRgba(darker2, 0.5)}`} maxWidth={DESIGN_WIDTH - 160} textAlign="center" />
      </div>

      {/* Marco con la foto en el centro */}
      <div style={{
        position: 'absolute', left: '50%', top: '50%',
        transform: `translate(-50%, calc(-50% + 30px))`,
        width: frameW, height: frameH,
        borderRadius: 16, overflow: 'hidden',
        background: shiftColor(brandColor, -30),
        boxShadow: `0 28px 70px ${hexToRgba(darker2, 0.65)}, 0 0 0 8px rgba(255,255,255,0.96)`,
      }}>
        {hasBg ? (
          <Img src={bgImage!} style={{ width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${kbVal})`, transformOrigin: kbOrigin }} />
        ) : (
          <div style={{ width: '100%', height: '100%', background: `linear-gradient(135deg, ${shiftColor(brandColor, +20)}, ${shiftColor(secondary, -15)})` }} />
        )}
      </div>

      {/* Subtext + dots abajo */}
      {scene.subtext && (
        <div style={{
          position: 'absolute', bottom: 70, left: 0, right: 0, textAlign: 'center',
          opacity: interpolate(frame, [36, 52], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
        }}>
          <SubtextReveal text={scene.subtext} frame={frame} fps={fps} delay={38} gs={{ ...gs, align: 'center' }} color="rgba(255,255,255,0.88)" fontSize={18} extraStyle={{ marginTop: 0 }} />
          <div style={{ display: 'flex', gap: 7, justifyContent: 'center', marginTop: 14 }}>
            {[0,1,2].map(di => (
              <div key={di} style={{
                width: di === sceneIdx % 3 ? 18 : 6, height: 6, borderRadius: 4,
                background: di === sceneIdx % 3 ? '#fff' : 'rgba(255,255,255,0.45)',
              }} />
            ))}
          </div>
        </div>
      )}

      <AccentLayer gs={gs} brandColor={brandColor} accent={accent} frame={frame} total={total} fps={fps} sceneIdx={sceneIdx} isBottom={true} isCenter={true} paddingH={gs.paddingH} brandName={brandName} logoOpacity={logoOp} />
    </AbsoluteFill>
  )
}

// ─── Composition root ─────────────────────────────────────────────────────────

export const BrandVideoComposition: React.FC<BrandVideoProps> = ({
  scenes,
  brandColor,
  secondaryColor,
  accentColor,
  brandName,
  logoUrl,
  referenceImageUrls = [],
  seed = 0,
  generatedStyle,
  sceneStyles,
}) => {
  const { fps, width, height } = useVideoConfig()

  const secondary = secondaryColor ?? shiftColor(brandColor, +55)
  const accent    = accentColor    ?? shiftColor(brandColor, +85)

  const scaleX = width  / DESIGN_WIDTH
  const scaleY = height / DESIGN_HEIGHT

  let imgIdx = 0
  const sceneImages = scenes.map((scene, i) => {
    const layout = scene.layout ?? (i === 0 ? 'intro' : i === scenes.length - 1 ? 'cta' : 'content')
    if (layout === 'cta' || referenceImageUrls.length === 0) return undefined
    return referenceImageUrls[(imgIdx++) % referenceImageUrls.length]
  })

  // Ken Burns origins — más variados con nuevo rango
  const kbOrigins = Array.from({ length: Math.max(5, scenes.length) }, (_, i) => {
    const opts = ['center', 'top left', 'top right', 'bottom left', 'bottom right', '30% 40%', '70% 30%', '60% 70%']
    return opts[Math.floor(seededRand(seed, i * 3) * opts.length)]!
  })

  let offset = 0
  return (
    <AbsoluteFill>
      <div style={{ width: DESIGN_WIDTH, height: DESIGN_HEIGHT, transform: `scale(${scaleX}, ${scaleY})`, transformOrigin: '0 0', position: 'absolute', top: 0, left: 0 }}>
        {scenes.map((scene, i) => {
          const durationInFrames = Math.round(scene.durationInSeconds * fps)
          const from = offset
          offset += durationInFrames
          const sceneType = scene.layout ?? (i === 0 ? 'intro' : i === scenes.length - 1 ? 'cta' : 'content') as 'intro' | 'content' | 'cta'

          const sceneGs = sceneStyles?.[i]
            ? sanitizeStyle(sceneStyles[i]!)
            : generatedStyle
              ? sanitizeStyle(generatedStyle)
              : fallbackStyle(seed + i * 97)

          const commonProps = {
            scene,
            sceneType,
            sceneIdx:    i,
            gs:          sceneGs,
            brandColor,
            secondary,
            accent,
            brandName,
            logoUrl,
            bgImage:     sceneImages[i],
            kbOrigin:    kbOrigins[i % kbOrigins.length]!,
            fps,
            total:       durationInFrames,
          }

          // Seleccionar componente según sceneLayout
          let SlideComponent: React.ReactElement
          switch (sceneGs.sceneLayout) {
            case 'carousel':
              SlideComponent = (
                <CarouselSlide
                  {...commonProps}
                  images={referenceImageUrls.length > 0 ? referenceImageUrls : []}
                  kbOrigins={kbOrigins}
                />
              )
              break
            case 'split':
              SlideComponent = <SplitSlide {...commonProps} />
              break
            case 'magazine':
              SlideComponent = <MagazineSlide {...commonProps} />
              break
            case 'overlay':
              SlideComponent = <OverlaySlide {...commonProps} />
              break
            case 'photoTop':
              SlideComponent = <PhotoTopSlide {...commonProps} />
              break
            case 'bigType':
              SlideComponent = <BigTypeSlide {...commonProps} />
              break
            case 'mosaic':
              SlideComponent = (
                <MosaicSlide
                  {...commonProps}
                  images={referenceImageUrls.length > 0 ? referenceImageUrls : []}
                />
              )
              break
            case 'diagonalSplit':
              SlideComponent = <DiagonalSplitSlide {...commonProps} />
              break
            case 'circleCrop':
              SlideComponent = <CircleCropSlide {...commonProps} />
              break
            case 'verticalBand':
              SlideComponent = <VerticalBandSlide {...commonProps} />
              break
            case 'bento':
              SlideComponent = (
                <BentoSlide
                  {...commonProps}
                  images={referenceImageUrls.length > 0 ? referenceImageUrls : []}
                />
              )
              break
            case 'tripleStrip':
              SlideComponent = <TripleStripSlide {...commonProps} />
              break
            case 'floatingCard':
              SlideComponent = <FloatingCardSlide {...commonProps} />
              break
            case 'typeMask':
              SlideComponent = <TypeMaskSlide {...commonProps} />
              break
            case 'zoomFrame':
              SlideComponent = <ZoomFrameSlide {...commonProps} />
              break
            case 'hero':
            default:
              SlideComponent = <GenericSlide {...commonProps} />
              break
          }

          return (
            <Sequence key={i} from={from} durationInFrames={durationInFrames}>
              {SlideComponent}
            </Sequence>
          )
        })}
      </div>
    </AbsoluteFill>
  )
}
