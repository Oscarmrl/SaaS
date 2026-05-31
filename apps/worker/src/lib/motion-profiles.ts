/**
 * MOTION PROFILES — 20 personalidades visuales radicalmente distintas
 *
 * Cada perfil es un "director diferente":
 *  - sceneLayout → estructura visual del frame
 *  - textAnim    → cómo entra el texto (personalidad de movimiento)
 *  - bgTreat     → tratamiento de la foto de fondo
 *  - accentType  → elemento decorativo
 *  - Resto       → personalidad tipográfica + parámetros de física
 *
 * NUNCA le preguntes a Claude qué estilo usar.
 * El seed del jobId selecciona los perfiles de forma determinística.
 */

import type { GeneratedStyle } from '../remotion/BrandVideoComposition'

export const MOTION_PROFILES: Record<string, GeneratedStyle> = {

  // ─── 1. NOIR CINEMA ────────────────────────────────────────────────────────
  // Kubrick: lento, misterioso, letterbox, tipografía finísima, centro
  noir_cinema: {
    sceneLayout: 'hero', textAnim: 'blurReveal', bgTreat: 'cinematic', accentType: 'hline',
    align: 'center', textY: 16, fontWeight: 300, tracking: '0.20em',
    subtextUpper: true, springStiffness: 38, springDamping: 28,
    kbDir: 'in', overlayAlpha: 0.55, kbRange: 0.05,
    gradAngle: 135, paddingH: 100, accentBright: 15, fontScale: 1.15,
  },

  // ─── 2. URBAN HACK ─────────────────────────────────────────────────────────
  // Matrix + Supreme: glitch, colorBurn, neon, magazine, heavy black
  urban_hack: {
    sceneLayout: 'magazine', textAnim: 'glitch', bgTreat: 'colorBurn', accentType: 'neonBorder',
    align: 'left', textY: 78, fontWeight: 900, tracking: '-0.05em',
    subtextUpper: false, springStiffness: 280, springDamping: 14,
    kbDir: 'in', overlayAlpha: 0.55, kbRange: 0.12,
    gradAngle: 45, paddingH: 68, accentBright: 55, fontScale: 1.25,
  },

  // ─── 3. EDITORIAL SPLIT ────────────────────────────────────────────────────
  // Vogue / NYT: split panel, flipIn, duotone, partículas
  editorial_split: {
    sceneLayout: 'split', textAnim: 'flipIn', bgTreat: 'duotone', accentType: 'particles',
    align: 'left', textY: 48, fontWeight: 700, tracking: '0em',
    subtextUpper: false, springStiffness: 110, springDamping: 15,
    kbDir: 'out', overlayAlpha: 0.50, kbRange: 0.11,
    gradAngle: 90, paddingH: 85, accentBright: 20, fontScale: 0.98,
  },

  // ─── 4. STORY CORNER ───────────────────────────────────────────────────────
  // Instagram Stories orgánico: overlay, foto domina, corner brackets
  story_corner: {
    sceneLayout: 'overlay', textAnim: 'slideUp', bgTreat: 'minimal', accentType: 'cornerBracket',
    align: 'left', textY: 78, fontWeight: 600, tracking: '0.06em',
    subtextUpper: false, springStiffness: 65, springDamping: 22,
    kbDir: 'out', overlayAlpha: 0.28, kbRange: 0.07,
    gradAngle: 180, paddingH: 80, accentBright: 30, fontScale: 0.90,
  },

  // ─── 5. GLITCH CENTER ──────────────────────────────────────────────────────
  // Moda disruptiva: aberración cromática, neon, centro, dark
  glitch_center: {
    sceneLayout: 'hero', textAnim: 'glitch', bgTreat: 'dark', accentType: 'neonBorder',
    align: 'center', textY: 50, fontWeight: 800, tracking: '-0.02em',
    subtextUpper: false, springStiffness: 200, springDamping: 16,
    kbDir: 'in', overlayAlpha: 0.72, kbRange: 0.09,
    gradAngle: 0, paddingH: 80, accentBright: 50, fontScale: 1.10,
  },

  // ─── 6. LUXURY VOID ────────────────────────────────────────────────────────
  // Hermès / Bottega: fade puro, sin acento, tipografía ultradelgada, viñeta
  luxury_void: {
    sceneLayout: 'hero', textAnim: 'fadeOnly', bgTreat: 'vignette', accentType: 'none',
    align: 'center', textY: 50, fontWeight: 200, tracking: '0.12em',
    subtextUpper: true, springStiffness: 28, springDamping: 30,
    kbDir: 'in', overlayAlpha: 0.65, kbRange: 0.04,
    gradAngle: 270, paddingH: 105, accentBright: -10, fontScale: 0.82,
  },

  // ─── 7. TYPEWRITER TECH ────────────────────────────────────────────────────
  // Startup / fintech: typewriter con cursor, panel sólido, trama de puntos
  typewriter_tech: {
    sceneLayout: 'hero', textAnim: 'typewriter', bgTreat: 'panel', accentType: 'grid',
    align: 'left', textY: 38, fontWeight: 500, tracking: '0.04em',
    subtextUpper: false, springStiffness: 90, springDamping: 20,
    kbDir: 'in', overlayAlpha: 0.55, kbRange: 0.06,
    gradAngle: 225, paddingH: 80, accentBright: 25, fontScale: 0.95,
  },

  // ─── 8. ELASTIC JOY ────────────────────────────────────────────────────────
  // Consumer brand / snacks: carousel de fotos, rebote elástico, círculo animado
  elastic_joy: {
    sceneLayout: 'carousel', textAnim: 'elastic', bgTreat: 'tint', accentType: 'circle',
    align: 'center', textY: 50, fontWeight: 700, tracking: '0em',
    subtextUpper: false, springStiffness: 350, springDamping: 7,
    kbDir: 'in', overlayAlpha: 0.60, kbRange: 0.10,
    gradAngle: 135, paddingH: 85, accentBright: 30, fontScale: 1.05,
  },

  // ─── 9. LETTER FALL ────────────────────────────────────────────────────────
  // Intro cinemática: punchIn impacto, letterbox, corner brackets
  letter_fall: {
    sceneLayout: 'hero', textAnim: 'punchIn', bgTreat: 'cinematic', accentType: 'cornerBracket',
    align: 'center', textY: 22, fontWeight: 800, tracking: '-0.05em',
    subtextUpper: true, springStiffness: 160, springDamping: 12,
    kbDir: 'in', overlayAlpha: 0.75, kbRange: 0.08,
    gradAngle: 45, paddingH: 90, accentBright: 35, fontScale: 1.20,
  },

  // ─── 10. FILM GALLERY ──────────────────────────────────────────────────────
  // Agencia fotográfica: carousel + filmstrip + zoom, texto abajo sutil
  film_gallery: {
    sceneLayout: 'carousel', textAnim: 'zoomIn', bgTreat: 'minimal', accentType: 'filmstrip',
    align: 'center', textY: 74, fontWeight: 400, tracking: '0.08em',
    subtextUpper: false, springStiffness: 55, springDamping: 25,
    kbDir: 'out', overlayAlpha: 0.30, kbRange: 0.10,
    gradAngle: 180, paddingH: 80, accentBright: 10, fontScale: 0.88,
  },

  // ─── 11. MAG BOLD ──────────────────────────────────────────────────────────
  // Revista de moda: magazine layout, slide-down, panel, bloque grueso
  mag_bold: {
    sceneLayout: 'magazine', textAnim: 'slideDown', bgTreat: 'panel', accentType: 'bracket',
    align: 'left', textY: 80, fontWeight: 900, tracking: '-0.05em',
    subtextUpper: false, springStiffness: 120, springDamping: 16,
    kbDir: 'in', overlayAlpha: 0.70, kbRange: 0.09,
    gradAngle: 270, paddingH: 68, accentBright: 40, fontScale: 1.28,
  },

  // ─── 12. SPLIT STORY ───────────────────────────────────────────────────────
  // Documental / Narrative: panel oscuro izq, slide-left, dark, vbar
  split_story: {
    sceneLayout: 'split', textAnim: 'slideLeft', bgTreat: 'dark', accentType: 'vbar',
    align: 'left', textY: 45, fontWeight: 700, tracking: '0em',
    subtextUpper: false, springStiffness: 95, springDamping: 19,
    kbDir: 'out', overlayAlpha: 0.65, kbRange: 0.10,
    gradAngle: 135, paddingH: 80, accentBright: 15, fontScale: 1.00,
  },

  // ─── 13. PUNCH SPORT ───────────────────────────────────────────────────────
  // Nike / Adidas: punch-in, tint, franja diagonal, esquina inferior
  punch_sport: {
    sceneLayout: 'hero', textAnim: 'punchIn', bgTreat: 'tint', accentType: 'diagonal',
    align: 'left', textY: 72, fontWeight: 900, tracking: '-0.02em',
    subtextUpper: false, springStiffness: 260, springDamping: 18,
    kbDir: 'in', overlayAlpha: 0.62, kbRange: 0.13,
    gradAngle: 45, paddingH: 72, accentBright: 50, fontScale: 1.22,
  },

  // ─── 14. ORGANIC LIFE ──────────────────────────────────────────────────────
  // Lifestyle / wellness: overlay, blur reveal, duotone, partículas flotantes
  organic_life: {
    sceneLayout: 'overlay', textAnim: 'blurReveal', bgTreat: 'duotone', accentType: 'particles',
    align: 'center', textY: 82, fontWeight: 300, tracking: '0.12em',
    subtextUpper: false, springStiffness: 42, springDamping: 26,
    kbDir: 'out', overlayAlpha: 0.45, kbRange: 0.07,
    gradAngle: 225, paddingH: 90, accentBright: 25, fontScale: 0.85,
  },

  // ─── 15. DOCUMENTARY ───────────────────────────────────────────────────────
  // Vice / Netflix: rotateIn, viñeta, letterbox, texto izq arriba, grave
  documentary: {
    sceneLayout: 'hero', textAnim: 'rotateIn', bgTreat: 'vignette', accentType: 'hline',
    align: 'left', textY: 32, fontWeight: 600, tracking: '0.06em',
    subtextUpper: false, springStiffness: 75, springDamping: 22,
    kbDir: 'in', overlayAlpha: 0.68, kbRange: 0.06,
    gradAngle: 90, paddingH: 85, accentBright: 5, fontScale: 0.92,
  },

  // ─── 16. RETRO FILM ────────────────────────────────────────────────────────
  // Polaroid / Lomo: typewriter, colorBurn, filmstrip, texto arriba
  retro_film: {
    sceneLayout: 'hero', textAnim: 'typewriter', bgTreat: 'colorBurn', accentType: 'filmstrip',
    align: 'left', textY: 20, fontWeight: 700, tracking: '0.08em',
    subtextUpper: true, springStiffness: 80, springDamping: 20,
    kbDir: 'out', overlayAlpha: 0.58, kbRange: 0.07,
    gradAngle: 180, paddingH: 80, accentBright: 20, fontScale: 1.05,
  },

  // ─── 17. SOFT CAROUSEL ─────────────────────────────────────────────────────
  // Premium minimalista: carousel silencioso, slide-right, sin acento, aéreo
  soft_carousel: {
    sceneLayout: 'carousel', textAnim: 'slideRight', bgTreat: 'minimal', accentType: 'none',
    align: 'center', textY: 60, fontWeight: 300, tracking: '0.04em',
    subtextUpper: false, springStiffness: 58, springDamping: 24,
    kbDir: 'out', overlayAlpha: 0.28, kbRange: 0.08,
    gradAngle: 0, paddingH: 95, accentBright: 0, fontScale: 0.80,
  },

  // ─── 18. BRUTAL MANIFESTO ──────────────────────────────────────────────────
  // Supreme / Obey: magazine, zoomBlur, dark, bloque grueso, negro puro
  brutal_manifesto: {
    sceneLayout: 'magazine', textAnim: 'zoomBlur', bgTreat: 'dark', accentType: 'bracket',
    align: 'left', textY: 78, fontWeight: 900, tracking: '0em',
    subtextUpper: false, springStiffness: 180, springDamping: 11,
    kbDir: 'in', overlayAlpha: 0.80, kbRange: 0.11,
    gradAngle: 315, paddingH: 68, accentBright: 40, fontScale: 1.28,
  },

  // ─── 19. ARCHITECT ─────────────────────────────────────────────────────────
  // Zaha Hadid / MVRDV: split, fadeOnly, panel, vbar, ultrafino
  architect: {
    sceneLayout: 'split', textAnim: 'fadeOnly', bgTreat: 'panel', accentType: 'vbar',
    align: 'left', textY: 50, fontWeight: 300, tracking: '0.20em',
    subtextUpper: true, springStiffness: 30, springDamping: 30,
    kbDir: 'out', overlayAlpha: 0.55, kbRange: 0.05,
    gradAngle: 270, paddingH: 90, accentBright: -15, fontScale: 0.76,
  },

  // ─── 20. WORD POETRY ───────────────────────────────────────────────────────
  // Manifesto de marca: overlay, morphReveal emergente, tint, anillo
  word_poetry: {
    sceneLayout: 'overlay', textAnim: 'morphReveal', bgTreat: 'tint', accentType: 'circle',
    align: 'center', textY: 70, fontWeight: 600, tracking: '0.12em',
    subtextUpper: false, springStiffness: 82, springDamping: 20,
    kbDir: 'in', overlayAlpha: 0.60, kbRange: 0.09,
    gradAngle: 90, paddingH: 88, accentBright: 35, fontScale: 1.08,
  },

  // ─── 21. CASCADE HERO ──────────────────────────────────────────────────────
  // Intro cinemática: splitReveal dramático, viñeta, corchetes
  cascade_hero: {
    sceneLayout: 'hero', textAnim: 'splitReveal', bgTreat: 'vignette', accentType: 'cornerBracket',
    align: 'center', textY: 50, fontWeight: 900, tracking: '-0.03em',
    subtextUpper: false, springStiffness: 150, springDamping: 13,
    kbDir: 'in', overlayAlpha: 0.70, kbRange: 0.10,
    gradAngle: 270, paddingH: 80, accentBright: 30, fontScale: 1.18,
  },

  // ─── 22. MORPH CINEMA ──────────────────────────────────────────────────────
  // Intro inmersiva: texto emerge del desenfoque, letterbox, línea horizontal
  morph_cinema: {
    sceneLayout: 'hero', textAnim: 'morphReveal', bgTreat: 'cinematic', accentType: 'hline',
    align: 'center', textY: 45, fontWeight: 700, tracking: '0.08em',
    subtextUpper: true, springStiffness: 45, springDamping: 25,
    kbDir: 'out', overlayAlpha: 0.72, kbRange: 0.06,
    gradAngle: 180, paddingH: 90, accentBright: 20, fontScale: 1.10,
  },

  // ─── 23. FLIP SPLIT ────────────────────────────────────────────────────────
  // Editorial moderno: panel dividido, volteo dramático, barra vertical
  flip_split: {
    sceneLayout: 'split', textAnim: 'flipIn', bgTreat: 'panel', accentType: 'vbar',
    align: 'left', textY: 42, fontWeight: 700, tracking: '0.02em',
    subtextUpper: false, springStiffness: 130, springDamping: 17,
    kbDir: 'out', overlayAlpha: 0.58, kbRange: 0.08,
    gradAngle: 90, paddingH: 80, accentBright: 25, fontScale: 1.00,
  },

  // ─── 24. MORPH MINIMAL ─────────────────────────────────────────────────────
  // Ultra-minimalista: overlay, texto emerge del vacío, sin acento
  morph_minimal: {
    sceneLayout: 'overlay', textAnim: 'morphReveal', bgTreat: 'minimal', accentType: 'none',
    align: 'center', textY: 55, fontWeight: 300, tracking: '0.15em',
    subtextUpper: true, springStiffness: 35, springDamping: 28,
    kbDir: 'in', overlayAlpha: 0.35, kbRange: 0.05,
    gradAngle: 0, paddingH: 100, accentBright: 5, fontScale: 0.85,
  },

  // ─── 25. SPLIT REVEAL DARK ─────────────────────────────────────────────────
  // Impacto dramático: dos mitades convergen, dark, borde neón
  split_reveal_dark: {
    sceneLayout: 'hero', textAnim: 'splitReveal', bgTreat: 'dark', accentType: 'neonBorder',
    align: 'center', textY: 58, fontWeight: 800, tracking: '-0.01em',
    subtextUpper: false, springStiffness: 180, springDamping: 15,
    kbDir: 'in', overlayAlpha: 0.75, kbRange: 0.10,
    gradAngle: 135, paddingH: 80, accentBright: 45, fontScale: 1.12,
  },

  // ─── 26. BOLD CASCADE ──────────────────────────────────────────────────────
  // Magazine de impacto: slingShot desde el borde, tipografía editorial masiva con tinte
  bold_cascade: {
    sceneLayout: 'magazine', textAnim: 'slingShot', bgTreat: 'tint', accentType: 'bracket',
    align: 'left', textY: 75, fontWeight: 800, tracking: '-0.03em',
    subtextUpper: false, springStiffness: 140, springDamping: 14,
    kbDir: 'in', overlayAlpha: 0.65, kbRange: 0.11,
    gradAngle: 45, paddingH: 68, accentBright: 35, fontScale: 1.18,
  },

  // ─── 27. FLIP ORGANIC ──────────────────────────────────────────────────────
  // Lifestyle orgánico: volteo suave sobre foto, partículas flotantes
  flip_organic: {
    sceneLayout: 'overlay', textAnim: 'flipIn', bgTreat: 'duotone', accentType: 'particles',
    align: 'center', textY: 68, fontWeight: 400, tracking: '0.10em',
    subtextUpper: false, springStiffness: 100, springDamping: 19,
    kbDir: 'out', overlayAlpha: 0.52, kbRange: 0.07,
    gradAngle: 225, paddingH: 88, accentBright: 20, fontScale: 0.92,
  },

  // ─── 28. SPLIT EDITORIAL ───────────────────────────────────────────────────
  // Documental split: dos mitades convergen en panel dividido, duotono
  split_editorial: {
    sceneLayout: 'split', textAnim: 'splitReveal', bgTreat: 'duotone', accentType: 'bracket',
    align: 'left', textY: 48, fontWeight: 700, tracking: '0em',
    subtextUpper: false, springStiffness: 160, springDamping: 16,
    kbDir: 'out', overlayAlpha: 0.60, kbRange: 0.09,
    gradAngle: 90, paddingH: 80, accentBright: 20, fontScale: 0.98,
  },

  // ─── 29. CASCADE CTA ───────────────────────────────────────────────────────
  // CTA de impacto: elastic rebote sobre tinte de marca
  cascade_cta: {
    sceneLayout: 'hero', textAnim: 'elastic', bgTreat: 'tint', accentType: 'diagonal',
    align: 'center', textY: 50, fontWeight: 900, tracking: '-0.02em',
    subtextUpper: false, springStiffness: 200, springDamping: 14,
    kbDir: 'in', overlayAlpha: 0.65, kbRange: 0.12,
    gradAngle: 45, paddingH: 75, accentBright: 45, fontScale: 1.20,
  },

  // ─── 30. MORPH CTA ─────────────────────────────────────────────────────────
  // CTA elegante: texto nace del desenfoque, viñeta dramática, corchetes
  morph_cta: {
    sceneLayout: 'hero', textAnim: 'morphReveal', bgTreat: 'vignette', accentType: 'cornerBracket',
    align: 'center', textY: 48, fontWeight: 800, tracking: '0.02em',
    subtextUpper: false, springStiffness: 80, springDamping: 20,
    kbDir: 'out', overlayAlpha: 0.70, kbRange: 0.07,
    gradAngle: 270, paddingH: 80, accentBright: 35, fontScale: 1.15,
  },

  // ─── 31. FLIP CTA ──────────────────────────────────────────────────────────
  // CTA explosivo: volteo sobre colorBurn, trama de puntos de alto contraste
  flip_cta: {
    sceneLayout: 'hero', textAnim: 'flipIn', bgTreat: 'colorBurn', accentType: 'grid',
    align: 'center', textY: 52, fontWeight: 900, tracking: '-0.03em',
    subtextUpper: false, springStiffness: 220, springDamping: 16,
    kbDir: 'in', overlayAlpha: 0.72, kbRange: 0.11,
    gradAngle: 315, paddingH: 78, accentBright: 50, fontScale: 1.22,
  },

  // ─── 32. SPLIT CTA ─────────────────────────────────────────────────────────
  // CTA de impacto máximo: mitades convergen desde los extremos, dark, bloque
  split_cta: {
    sceneLayout: 'hero', textAnim: 'splitReveal', bgTreat: 'dark', accentType: 'bracket',
    align: 'left', textY: 62, fontWeight: 900, tracking: '0em',
    subtextUpper: false, springStiffness: 240, springDamping: 15,
    kbDir: 'in', overlayAlpha: 0.78, kbRange: 0.12,
    gradAngle: 45, paddingH: 72, accentBright: 40, fontScale: 1.20,
  },

  // ─── 33. GLASS INTRO ───────────────────────────────────────────────────────
  // Intro glassmorphism: pop explosivo, glass translúcido, corchetes (Framer AI ref)
  glass_intro: {
    sceneLayout: 'hero', textAnim: 'popIn', bgTreat: 'glassmorphism', accentType: 'cornerBracket',
    align: 'center', textY: 50, fontWeight: 700, tracking: '0.04em',
    subtextUpper: false, springStiffness: 420, springDamping: 20,
    kbDir: 'in', overlayAlpha: 0.72, kbRange: 0.07,
    gradAngle: 135, paddingH: 85, accentBright: 28, fontScale: 1.05,
  },

  // ─── 34. TILT INTRO ────────────────────────────────────────────────────────
  // Intro poster técnico: punch sobre grid, cards flotantes (Design System poster ref)
  tilt_intro: {
    sceneLayout: 'hero', textAnim: 'punchIn', bgTreat: 'paperGrid', accentType: 'tiltCard',
    align: 'left', textY: 48, fontWeight: 900, tracking: '-0.03em',
    subtextUpper: false, springStiffness: 280, springDamping: 16,
    kbDir: 'in', overlayAlpha: 0.80, kbRange: 0.08,
    gradAngle: 45, paddingH: 75, accentBright: 42, fontScale: 1.22,
  },

  // ─── 35. PHOTO TOP WARM ────────────────────────────────────────────────────
  // Content travel/recipe: foto top + panel blanco, punch impacto, badge esquina
  // Inspirado en: Banff travel card, Lebanese chicken recipe, Highland huts property
  photo_top_warm: {
    sceneLayout: 'photoTop', textAnim: 'punchIn', bgTreat: 'tint', accentType: 'badgePop',
    align: 'left', textY: 68, fontWeight: 700, tracking: '0em',
    subtextUpper: false, springStiffness: 260, springDamping: 18,
    kbDir: 'in', overlayAlpha: 0.55, kbRange: 0.09,
    gradAngle: 180, paddingH: 52, accentBright: 30, fontScale: 0.95,
  },

  // ─── 36. PHOTO TOP DARK ────────────────────────────────────────────────────
  // Content oscuro: foto top + panel oscuro, texto cae desde arriba (Dune/book card ref)
  photo_top_dark: {
    sceneLayout: 'photoTop', textAnim: 'slideDown', bgTreat: 'dark', accentType: 'cornerBracket',
    align: 'left', textY: 72, fontWeight: 800, tracking: '-0.01em',
    subtextUpper: false, springStiffness: 130, springDamping: 17,
    kbDir: 'out', overlayAlpha: 0.72, kbRange: 0.10,
    gradAngle: 180, paddingH: 52, accentBright: 22, fontScale: 0.98,
  },

  // ─── 37. GLASS CONTENT ─────────────────────────────────────────────────────
  // Content glassmorphism: overlay, pop, cards flotantes (neumorphic UI kit ref)
  glass_content: {
    sceneLayout: 'overlay', textAnim: 'popIn', bgTreat: 'glassmorphism', accentType: 'tiltCard',
    align: 'center', textY: 65, fontWeight: 600, tracking: '0.06em',
    subtextUpper: false, springStiffness: 400, springDamping: 20,
    kbDir: 'in', overlayAlpha: 0.68, kbRange: 0.08,
    gradAngle: 225, paddingH: 88, accentBright: 30, fontScale: 0.92,
  },

  // ─── 38. GLASS CTA ─────────────────────────────────────────────────────────
  // CTA glassmorphism: zoom cinematográfico, badge impacto, glass elegante
  glass_cta: {
    sceneLayout: 'hero', textAnim: 'zoomIn', bgTreat: 'glassmorphism', accentType: 'badgePop',
    align: 'center', textY: 50, fontWeight: 900, tracking: '-0.02em',
    subtextUpper: false, springStiffness: 88, springDamping: 22,
    kbDir: 'out', overlayAlpha: 0.74, kbRange: 0.07,
    gradAngle: 270, paddingH: 80, accentBright: 40, fontScale: 1.18,
  },

  // ─── 39. PAPER CTA ─────────────────────────────────────────────────────────
  // CTA técnico: maskWipe sobre grid paper, cards flotantes (Figma poster ref)
  paper_cta: {
    sceneLayout: 'hero', textAnim: 'maskWipe', bgTreat: 'paperGrid', accentType: 'tiltCard',
    align: 'left', textY: 45, fontWeight: 800, tracking: '0em',
    subtextUpper: false, springStiffness: 115, springDamping: 16,
    kbDir: 'in', overlayAlpha: 0.82, kbRange: 0.06,
    gradAngle: 45, paddingH: 75, accentBright: 35, fontScale: 1.14,
  },

  // ─── 40. TILT CTA ──────────────────────────────────────────────────────────
  // CTA con cards flotando: slide-up sobre viñeta, badge de urgencia (card fan ref)
  tilt_cta: {
    sceneLayout: 'hero', textAnim: 'slideUp', bgTreat: 'vignette', accentType: 'badgePop',
    align: 'center', textY: 52, fontWeight: 800, tracking: '0.02em',
    subtextUpper: false, springStiffness: 95, springDamping: 20,
    kbDir: 'out', overlayAlpha: 0.70, kbRange: 0.08,
    gradAngle: 270, paddingH: 80, accentBright: 38, fontScale: 1.12,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // NUEVOS PERFILES — Layouts radicalmente distintos, sin foto full-bleed
  // ═══════════════════════════════════════════════════════════════════════════

  // ─── 41. BIG TYPE COLOR ────────────────────────────────────────────────────
  // Intro: tipografía MONSTRUOSA sobre bloque de color de marca, sin foto encima
  big_type_color: {
    sceneLayout: 'bigType', textAnim: 'maskWipe', bgTreat: 'colorBlock', accentType: 'sticker',
    align: 'left', textY: 50, fontWeight: 900, tracking: '-0.05em',
    subtextUpper: false, springStiffness: 110, springDamping: 18,
    kbDir: 'in', overlayAlpha: 0.30, kbRange: 0.06,
    gradAngle: 135, paddingH: 70, accentBright: 35, fontScale: 1.20,
  },

  // ─── 42. BIG TYPE BURST ────────────────────────────────────────────────────
  // CTA explosivo: tipografía gigante sobre explosión radial de color
  big_type_burst: {
    sceneLayout: 'bigType', textAnim: 'liquidWipe', bgTreat: 'gradientBurst', accentType: 'arrowMark',
    align: 'center', textY: 50, fontWeight: 900, tracking: '-0.04em',
    subtextUpper: false, springStiffness: 90, springDamping: 22,
    kbDir: 'in', overlayAlpha: 0.40, kbRange: 0.05,
    gradAngle: 45, paddingH: 75, accentBright: 45, fontScale: 1.25,
  },

  // ─── 43. MOSAIC GRID ───────────────────────────────────────────────────────
  // Content: grilla 2x2 de fotos con celda de texto, pop tipo card
  mosaic_grid: {
    sceneLayout: 'mosaic', textAnim: 'popIn', bgTreat: 'colorBlock', accentType: 'noiseTexture',
    align: 'left', textY: 50, fontWeight: 800, tracking: '0em',
    subtextUpper: false, springStiffness: 280, springDamping: 18,
    kbDir: 'in', overlayAlpha: 0.40, kbRange: 0.05,
    gradAngle: 135, paddingH: 60, accentBright: 25, fontScale: 0.95,
  },

  // ─── 44. MOSAIC EDITORIAL ──────────────────────────────────────────────────
  // Content editorial: grilla + slideUp + textura
  mosaic_editorial: {
    sceneLayout: 'mosaic', textAnim: 'slideUp', bgTreat: 'colorBlock', accentType: 'colorFrame',
    align: 'left', textY: 50, fontWeight: 700, tracking: '-0.01em',
    subtextUpper: false, springStiffness: 95, springDamping: 20,
    kbDir: 'in', overlayAlpha: 0.35, kbRange: 0.05,
    gradAngle: 180, paddingH: 60, accentBright: 30, fontScale: 0.92,
  },

  // ─── 45. DIAGONAL CUT ──────────────────────────────────────────────────────
  // Content dramático: división diagonal con foto + bloque de color
  diagonal_cut: {
    sceneLayout: 'diagonalSplit', textAnim: 'slideRight', bgTreat: 'colorBlock', accentType: 'arrowMark',
    align: 'left', textY: 50, fontWeight: 800, tracking: '-0.02em',
    subtextUpper: false, springStiffness: 90, springDamping: 20,
    kbDir: 'in', overlayAlpha: 0.40, kbRange: 0.06,
    gradAngle: 135, paddingH: 70, accentBright: 30, fontScale: 1.05,
  },

  // ─── 46. DIAGONAL BOLD ─────────────────────────────────────────────────────
  // Intro impactante: corte diagonal + verticalize text
  diagonal_bold: {
    sceneLayout: 'diagonalSplit', textAnim: 'staggerDrop', bgTreat: 'colorBlock', accentType: 'sticker',
    align: 'left', textY: 50, fontWeight: 900, tracking: '-0.03em',
    subtextUpper: false, springStiffness: 180, springDamping: 14,
    kbDir: 'in', overlayAlpha: 0.45, kbRange: 0.07,
    gradAngle: 45, paddingH: 70, accentBright: 38, fontScale: 1.12,
  },

  // ─── 47. CIRCLE FOCUS ──────────────────────────────────────────────────────
  // Content: foto en círculo, texto al lado, bloque de color de marca
  circle_focus: {
    sceneLayout: 'circleCrop', textAnim: 'wordByWord', bgTreat: 'colorBlock', accentType: 'orbitDots',
    align: 'left', textY: 50, fontWeight: 700, tracking: '-0.01em',
    subtextUpper: false, springStiffness: 110, springDamping: 18,
    kbDir: 'in', overlayAlpha: 0.35, kbRange: 0.06,
    gradAngle: 135, paddingH: 60, accentBright: 28, fontScale: 0.98,
  },

  // ─── 48. CIRCLE EDITORIAL ──────────────────────────────────────────────────
  // Content elegante: círculo + texto fade-in + grano editorial
  circle_editorial: {
    sceneLayout: 'circleCrop', textAnim: 'blurReveal', bgTreat: 'colorBlock', accentType: 'noiseTexture',
    align: 'left', textY: 50, fontWeight: 500, tracking: '0.04em',
    subtextUpper: true, springStiffness: 50, springDamping: 25,
    kbDir: 'out', overlayAlpha: 0.32, kbRange: 0.05,
    gradAngle: 180, paddingH: 60, accentBright: 18, fontScale: 0.95,
  },

  // ─── 49. VERTICAL BAND ─────────────────────────────────────────────────────
  // Content modular: foto + banda lateral de color con texto
  vertical_band: {
    sceneLayout: 'verticalBand', textAnim: 'slideLeft', bgTreat: 'spotlight', accentType: 'colorFrame',
    align: 'left', textY: 50, fontWeight: 700, tracking: '0em',
    subtextUpper: false, springStiffness: 95, springDamping: 20,
    kbDir: 'in', overlayAlpha: 0.45, kbRange: 0.07,
    gradAngle: 135, paddingH: 60, accentBright: 25, fontScale: 1.00,
  },

  // ─── 50. VERTICAL EDGE ─────────────────────────────────────────────────────
  // Content asimétrico: banda + scramble effect + textura
  vertical_edge: {
    sceneLayout: 'verticalBand', textAnim: 'scramble', bgTreat: 'spotlight', accentType: 'noiseTexture',
    align: 'left', textY: 50, fontWeight: 800, tracking: '-0.02em',
    subtextUpper: false, springStiffness: 130, springDamping: 18,
    kbDir: 'out', overlayAlpha: 0.50, kbRange: 0.06,
    gradAngle: 90, paddingH: 60, accentBright: 35, fontScale: 1.05,
  },

  // ─── 51. WAVE FLOW ─────────────────────────────────────────────────────────
  // Content fluido: ondas SVG de color, swirlIn, hero
  wave_flow: {
    sceneLayout: 'hero', textAnim: 'swirlIn', bgTreat: 'wavePattern', accentType: 'orbitDots',
    align: 'center', textY: 50, fontWeight: 700, tracking: '0.02em',
    subtextUpper: false, springStiffness: 130, springDamping: 18,
    kbDir: 'in', overlayAlpha: 0.40, kbRange: 0.06,
    gradAngle: 180, paddingH: 80, accentBright: 30, fontScale: 1.05,
  },

  // ─── 52. STRIPED HERO ──────────────────────────────────────────────────────
  // Intro bold: franjas diagonales de color + shake3D
  striped_hero: {
    sceneLayout: 'hero', textAnim: 'shake3D', bgTreat: 'striped', accentType: 'sticker',
    align: 'left', textY: 50, fontWeight: 900, tracking: '-0.04em',
    subtextUpper: false, springStiffness: 150, springDamping: 16,
    kbDir: 'in', overlayAlpha: 0.50, kbRange: 0.07,
    gradAngle: 35, paddingH: 75, accentBright: 38, fontScale: 1.18,
  },

  // ─── 53. WASH CINEMA ───────────────────────────────────────────────────────
  // Content: colorWash en lugar de dark — foto con tinte de marca dominante
  wash_cinema: {
    sceneLayout: 'hero', textAnim: 'maskWipe', bgTreat: 'colorWash', accentType: 'arrowMark',
    align: 'left', textY: 65, fontWeight: 700, tracking: '-0.01em',
    subtextUpper: false, springStiffness: 95, springDamping: 20,
    kbDir: 'in', overlayAlpha: 0.55, kbRange: 0.09,
    gradAngle: 135, paddingH: 75, accentBright: 28, fontScale: 1.05,
  },

  // ─── 54. WASH POETRY ───────────────────────────────────────────────────────
  // Content poético: colorWash + liquidWipe + orbit dots
  wash_poetry: {
    sceneLayout: 'overlay', textAnim: 'liquidWipe', bgTreat: 'colorWash', accentType: 'orbitDots',
    align: 'center', textY: 72, fontWeight: 400, tracking: '0.10em',
    subtextUpper: false, springStiffness: 55, springDamping: 24,
    kbDir: 'out', overlayAlpha: 0.50, kbRange: 0.07,
    gradAngle: 225, paddingH: 85, accentBright: 22, fontScale: 0.92,
  },

  // ─── 55. SPOTLIGHT INTIMATE ────────────────────────────────────────────────
  // Intro íntimo: spotlight cónico + verticalize text
  spotlight_intimate: {
    sceneLayout: 'hero', textAnim: 'verticalize', bgTreat: 'spotlight', accentType: 'colorFrame',
    align: 'left', textY: 50, fontWeight: 600, tracking: '0.06em',
    subtextUpper: true, springStiffness: 70, springDamping: 22,
    kbDir: 'in', overlayAlpha: 0.65, kbRange: 0.05,
    gradAngle: 90, paddingH: 90, accentBright: 20, fontScale: 0.92,
  },

  // ─── 56. MARQUEE ENERGY ────────────────────────────────────────────────────
  // CTA: texto marquee horizontal + striped bg
  marquee_energy: {
    sceneLayout: 'hero', textAnim: 'marquee', bgTreat: 'striped', accentType: 'colorFrame',
    align: 'left', textY: 50, fontWeight: 900, tracking: '-0.03em',
    subtextUpper: false, springStiffness: 150, springDamping: 18,
    kbDir: 'in', overlayAlpha: 0.50, kbRange: 0.06,
    gradAngle: 45, paddingH: 70, accentBright: 40, fontScale: 1.15,
  },

  // ─── 57. WAVE CTA ──────────────────────────────────────────────────────────
  // CTA fluido: ondas de color + maskWipe + arrow apuntando
  wave_cta: {
    sceneLayout: 'hero', textAnim: 'maskWipe', bgTreat: 'wavePattern', accentType: 'arrowMark',
    align: 'center', textY: 50, fontWeight: 800, tracking: '-0.02em',
    subtextUpper: false, springStiffness: 100, springDamping: 20,
    kbDir: 'in', overlayAlpha: 0.45, kbRange: 0.06,
    gradAngle: 180, paddingH: 80, accentBright: 35, fontScale: 1.15,
  },

  // ─── 58. GRADIENT BURST CTA ────────────────────────────────────────────────
  // CTA: explosión radial + staggerDrop + sticker
  gradient_burst_cta: {
    sceneLayout: 'hero', textAnim: 'staggerDrop', bgTreat: 'gradientBurst', accentType: 'sticker',
    align: 'center', textY: 50, fontWeight: 900, tracking: '-0.03em',
    subtextUpper: false, springStiffness: 220, springDamping: 16,
    kbDir: 'in', overlayAlpha: 0.45, kbRange: 0.06,
    gradAngle: 45, paddingH: 78, accentBright: 45, fontScale: 1.18,
  },

  // ─── 59. CIRCLE CTA ────────────────────────────────────────────────────────
  // CTA centrado: spotlight + swirl + orbit dots
  circle_cta: {
    sceneLayout: 'hero', textAnim: 'swirlIn', bgTreat: 'spotlight', accentType: 'orbitDots',
    align: 'center', textY: 50, fontWeight: 800, tracking: '-0.02em',
    subtextUpper: false, springStiffness: 160, springDamping: 17,
    kbDir: 'out', overlayAlpha: 0.55, kbRange: 0.06,
    gradAngle: 270, paddingH: 80, accentBright: 38, fontScale: 1.15,
  },

  // ─── 60. STRIPED INTRO ─────────────────────────────────────────────────────
  // Intro alto contraste: franjas + verticalize + colorFrame
  striped_intro: {
    sceneLayout: 'hero', textAnim: 'shake3D', bgTreat: 'striped', accentType: 'colorFrame',
    align: 'center', textY: 50, fontWeight: 900, tracking: '-0.04em',
    subtextUpper: false, springStiffness: 180, springDamping: 16,
    kbDir: 'in', overlayAlpha: 0.50, kbRange: 0.07,
    gradAngle: 60, paddingH: 75, accentBright: 42, fontScale: 1.20,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // NUEVOS PERFILES — Tanda 2: bento, tripleStrip, floatingCard, typeMask, zoomFrame
  // ═══════════════════════════════════════════════════════════════════════════

  // ─── 61. BENTO EDITORIAL ───────────────────────────────────────────────────
  // Content estilo bento grid: celdas asimétricas con fotos + texto
  bento_editorial: {
    sceneLayout: 'bento', textAnim: 'popIn', bgTreat: 'colorBlock', accentType: 'noiseTexture',
    align: 'left', textY: 50, fontWeight: 800, tracking: '-0.01em',
    subtextUpper: false, springStiffness: 280, springDamping: 18,
    kbDir: 'in', overlayAlpha: 0.35, kbRange: 0.05,
    gradAngle: 135, paddingH: 60, accentBright: 28, fontScale: 0.96,
  },

  // ─── 62. BENTO SOFT ────────────────────────────────────────────────────────
  // Content elegante con bento + breathe + paperTexture
  bento_soft: {
    sceneLayout: 'bento', textAnim: 'breathe', bgTreat: 'paperTexture', accentType: 'colorFrame',
    align: 'left', textY: 50, fontWeight: 600, tracking: '0.02em',
    subtextUpper: false, springStiffness: 60, springDamping: 24,
    kbDir: 'out', overlayAlpha: 0.30, kbRange: 0.05,
    gradAngle: 145, paddingH: 60, accentBright: 18, fontScale: 0.92,
  },

  // ─── 63. TRIPLE STRIP BOLD ─────────────────────────────────────────────────
  // Intro: 3 bandas horizontales con slideArc dramático
  triple_strip_bold: {
    sceneLayout: 'tripleStrip', textAnim: 'slideArc', bgTreat: 'meshGradient', accentType: 'arrowMark',
    align: 'left', textY: 50, fontWeight: 900, tracking: '-0.03em',
    subtextUpper: false, springStiffness: 100, springDamping: 20,
    kbDir: 'in', overlayAlpha: 0.40, kbRange: 0.06,
    gradAngle: 45, paddingH: 60, accentBright: 35, fontScale: 1.12,
  },

  // ─── 64. TRIPLE STRIP MINIMAL ──────────────────────────────────────────────
  // Content elegante: 3 bandas + fadeOnly + paper
  triple_strip_minimal: {
    sceneLayout: 'tripleStrip', textAnim: 'zoomBlur', bgTreat: 'paperTexture', accentType: 'noiseTexture',
    align: 'left', textY: 50, fontWeight: 500, tracking: '0.06em',
    subtextUpper: true, springStiffness: 55, springDamping: 24,
    kbDir: 'in', overlayAlpha: 0.32, kbRange: 0.05,
    gradAngle: 90, paddingH: 60, accentBright: 15, fontScale: 0.95,
  },

  // ─── 65. FLOATING GLASS ────────────────────────────────────────────────────
  // Intro: tarjeta flotante 3D + breathe + dotMatrix
  floating_glass: {
    sceneLayout: 'floatingCard', textAnim: 'breathe', bgTreat: 'dotMatrix', accentType: 'orbitDots',
    align: 'center', textY: 50, fontWeight: 700, tracking: '0.02em',
    subtextUpper: false, springStiffness: 70, springDamping: 22,
    kbDir: 'in', overlayAlpha: 0.55, kbRange: 0.06,
    gradAngle: 135, paddingH: 80, accentBright: 30, fontScale: 1.05,
  },

  // ─── 66. FLOATING DRAMA ────────────────────────────────────────────────────
  // CTA: card flotante + expandOut + meshGradient
  floating_drama: {
    sceneLayout: 'floatingCard', textAnim: 'expandOut', bgTreat: 'meshGradient', accentType: 'sticker',
    align: 'center', textY: 50, fontWeight: 800, tracking: '-0.02em',
    subtextUpper: false, springStiffness: 220, springDamping: 16,
    kbDir: 'in', overlayAlpha: 0.50, kbRange: 0.06,
    gradAngle: 225, paddingH: 80, accentBright: 38, fontScale: 1.15,
  },

  // ─── 67. TYPE MASK CINEMA ──────────────────────────────────────────────────
  // Intro: texto monstruoso con foto recortada DENTRO de la silueta
  type_mask_cinema: {
    sceneLayout: 'typeMask', textAnim: 'zoomBlur', bgTreat: 'dark', accentType: 'noiseTexture',
    align: 'center', textY: 50, fontWeight: 900, tracking: '-0.06em',
    subtextUpper: false, springStiffness: 55, springDamping: 24,
    kbDir: 'in', overlayAlpha: 0.50, kbRange: 0.05,
    gradAngle: 180, paddingH: 60, accentBright: 25, fontScale: 1.25,
  },

  // ─── 68. TYPE MASK CTA ─────────────────────────────────────────────────────
  // CTA: tipografía gigante con foto dentro + chromaShift
  type_mask_cta: {
    sceneLayout: 'typeMask', textAnim: 'chromaShift', bgTreat: 'gradientBurst', accentType: 'colorFrame',
    align: 'center', textY: 50, fontWeight: 900, tracking: '-0.06em',
    subtextUpper: false, springStiffness: 75, springDamping: 22,
    kbDir: 'in', overlayAlpha: 0.45, kbRange: 0.05,
    gradAngle: 45, paddingH: 60, accentBright: 40, fontScale: 1.28,
  },

  // ─── 69. ZOOM FRAME EDITORIAL ──────────────────────────────────────────────
  // Content: foto en marco centrado + texto arriba/abajo + breathe
  zoom_frame_editorial: {
    sceneLayout: 'zoomFrame', textAnim: 'wordByWord', bgTreat: 'colorBlock', accentType: 'orbitDots',
    align: 'center', textY: 50, fontWeight: 700, tracking: '-0.01em',
    subtextUpper: false, springStiffness: 110, springDamping: 18,
    kbDir: 'in', overlayAlpha: 0.35, kbRange: 0.10,
    gradAngle: 135, paddingH: 80, accentBright: 25, fontScale: 1.00,
  },

  // ─── 70. ZOOM FRAME PRESTIGE ───────────────────────────────────────────────
  // Content elegante: zoomFrame + fadeOnly + paperTexture
  zoom_frame_prestige: {
    sceneLayout: 'zoomFrame', textAnim: 'fadeOnly', bgTreat: 'paperTexture', accentType: 'colorFrame',
    align: 'center', textY: 50, fontWeight: 400, tracking: '0.14em',
    subtextUpper: true, springStiffness: 45, springDamping: 26,
    kbDir: 'in', overlayAlpha: 0.32, kbRange: 0.10,
    gradAngle: 145, paddingH: 80, accentBright: 12, fontScale: 0.90,
  },

  // ─── 71. ZOOM FRAME CTA ────────────────────────────────────────────────────
  // CTA: marco + colorCycle + sticker
  zoom_frame_cta: {
    sceneLayout: 'zoomFrame', textAnim: 'colorCycle', bgTreat: 'dotMatrix', accentType: 'sticker',
    align: 'center', textY: 50, fontWeight: 900, tracking: '-0.03em',
    subtextUpper: false, springStiffness: 95, springDamping: 20,
    kbDir: 'in', overlayAlpha: 0.50, kbRange: 0.08,
    gradAngle: 90, paddingH: 80, accentBright: 42, fontScale: 1.18,
  },

  // ─── 72. MESH FLOW ─────────────────────────────────────────────────────────
  // Content fluido: mesh gradient + slideArc + orbit
  mesh_flow: {
    sceneLayout: 'hero', textAnim: 'slideArc', bgTreat: 'meshGradient', accentType: 'orbitDots',
    align: 'left', textY: 50, fontWeight: 700, tracking: '0.02em',
    subtextUpper: false, springStiffness: 80, springDamping: 22,
    kbDir: 'in', overlayAlpha: 0.42, kbRange: 0.07,
    gradAngle: 180, paddingH: 80, accentBright: 28, fontScale: 1.05,
  },

  // ─── 73. PAPER EDITORIAL ───────────────────────────────────────────────────
  // Content editorial sobre paper texture + zoomBlur
  paper_editorial: {
    sceneLayout: 'overlay', textAnim: 'zoomBlur', bgTreat: 'paperTexture', accentType: 'noiseTexture',
    align: 'left', textY: 75, fontWeight: 600, tracking: '0.04em',
    subtextUpper: false, springStiffness: 55, springDamping: 24,
    kbDir: 'out', overlayAlpha: 0.30, kbRange: 0.06,
    gradAngle: 145, paddingH: 75, accentBright: 18, fontScale: 0.95,
  },

  // ─── 74. CHROMA NIGHT ──────────────────────────────────────────────────────
  // Content disruptivo: chromaShift + dotMatrix
  chroma_night: {
    sceneLayout: 'hero', textAnim: 'chromaShift', bgTreat: 'dotMatrix', accentType: 'neonBorder',
    align: 'center', textY: 50, fontWeight: 800, tracking: '-0.03em',
    subtextUpper: false, springStiffness: 130, springDamping: 18,
    kbDir: 'in', overlayAlpha: 0.55, kbRange: 0.08,
    gradAngle: 270, paddingH: 80, accentBright: 50, fontScale: 1.15,
  },

  // ─── 75. EXPAND CTA ────────────────────────────────────────────────────────
  // CTA: expandOut + meshGradient + arrow
  expand_cta: {
    sceneLayout: 'hero', textAnim: 'expandOut', bgTreat: 'meshGradient', accentType: 'arrowMark',
    align: 'center', textY: 50, fontWeight: 900, tracking: '-0.02em',
    subtextUpper: false, springStiffness: 240, springDamping: 16,
    kbDir: 'in', overlayAlpha: 0.42, kbRange: 0.06,
    gradAngle: 60, paddingH: 78, accentBright: 42, fontScale: 1.22,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // NUEVOS PERFILES — Tanda 3: glitchTV, paperFold, neonFlicker, slingShot, etc.
  // ═══════════════════════════════════════════════════════════════════════════

  // ─── 76. GLITCH TV CINEMA ──────────────────────────────────────────────────
  // Intro disruptiva: TV vieja + scanlines + cinemático
  glitch_tv_cinema: {
    sceneLayout: 'hero', textAnim: 'glitchTV', bgTreat: 'cinematic', accentType: 'neonBorder',
    align: 'center', textY: 50, fontWeight: 800, tracking: '-0.03em',
    subtextUpper: false, springStiffness: 220, springDamping: 16,
    kbDir: 'in', overlayAlpha: 0.55, kbRange: 0.08,
    gradAngle: 0, paddingH: 80, accentBright: 50, fontScale: 1.12,
  },

  // ─── 77. PAPER FOLD MAG ────────────────────────────────────────────────────
  // Intro editorial: papel se desdobla en magazine layout
  paper_fold_mag: {
    sceneLayout: 'magazine', textAnim: 'paperFold', bgTreat: 'paperTexture', accentType: 'colorFrame',
    align: 'left', textY: 75, fontWeight: 800, tracking: '-0.02em',
    subtextUpper: false, springStiffness: 70, springDamping: 22,
    kbDir: 'in', overlayAlpha: 0.30, kbRange: 0.06,
    gradAngle: 145, paddingH: 68, accentBright: 22, fontScale: 1.10,
  },

  // ─── 78. NEON NIGHT ────────────────────────────────────────────────────────
  // Content nocturno: neón parpadeante + dotMatrix
  neon_night: {
    sceneLayout: 'hero', textAnim: 'neonFlicker', bgTreat: 'dotMatrix', accentType: 'neonBorder',
    align: 'center', textY: 50, fontWeight: 700, tracking: '0.04em',
    subtextUpper: false, springStiffness: 80, springDamping: 22,
    kbDir: 'in', overlayAlpha: 0.55, kbRange: 0.07,
    gradAngle: 270, paddingH: 80, accentBright: 50, fontScale: 1.10,
  },

  // ─── 79. SLINGSHOT BOLD ────────────────────────────────────────────────────
  // CTA energético: rebote + striped + sticker
  slingshot_bold: {
    sceneLayout: 'hero', textAnim: 'slingShot', bgTreat: 'striped', accentType: 'sticker',
    align: 'left', textY: 50, fontWeight: 900, tracking: '-0.04em',
    subtextUpper: false, springStiffness: 320, springDamping: 8,
    kbDir: 'in', overlayAlpha: 0.50, kbRange: 0.06,
    gradAngle: 30, paddingH: 72, accentBright: 42, fontScale: 1.20,
  },

  // ─── 80. SPIRAL DRAMA ──────────────────────────────────────────────────────
  // Intro dramático: espiral + gradientBurst + orbit dots
  spiral_drama: {
    sceneLayout: 'hero', textAnim: 'spiralIn', bgTreat: 'gradientBurst', accentType: 'orbitDots',
    align: 'center', textY: 50, fontWeight: 800, tracking: '-0.03em',
    subtextUpper: false, springStiffness: 65, springDamping: 22,
    kbDir: 'in', overlayAlpha: 0.45, kbRange: 0.07,
    gradAngle: 45, paddingH: 80, accentBright: 38, fontScale: 1.15,
  },

  // ─── 81. WOBBLE PLAY ───────────────────────────────────────────────────────
  // Content lúdico: bamboleo gelatina + meshGradient + cards
  wobble_play: {
    sceneLayout: 'hero', textAnim: 'wobbleIn', bgTreat: 'meshGradient', accentType: 'tiltCard',
    align: 'center', textY: 50, fontWeight: 800, tracking: '-0.02em',
    subtextUpper: false, springStiffness: 280, springDamping: 9,
    kbDir: 'in', overlayAlpha: 0.42, kbRange: 0.06,
    gradAngle: 135, paddingH: 80, accentBright: 35, fontScale: 1.10,
  },

  // ─── 82. SPLIT FLAP STATION ────────────────────────────────────────────────
  // Content estilo aeropuerto: split-flap + paper grid + cornerBracket
  split_flap_station: {
    sceneLayout: 'hero', textAnim: 'splitFlap', bgTreat: 'paperGrid', accentType: 'cornerBracket',
    align: 'left', textY: 50, fontWeight: 800, tracking: '-0.01em',
    subtextUpper: false, springStiffness: 160, springDamping: 17,
    kbDir: 'in', overlayAlpha: 0.65, kbRange: 0.06,
    gradAngle: 90, paddingH: 75, accentBright: 30, fontScale: 1.08,
  },

  // ─── 83. INK BLEED EDITORIAL ───────────────────────────────────────────────
  // Content artesanal: tinta que se expande + paper texture
  ink_bleed_editorial: {
    sceneLayout: 'hero', textAnim: 'inkBleed', bgTreat: 'paperTexture', accentType: 'noiseTexture',
    align: 'left', textY: 60, fontWeight: 700, tracking: '0em',
    subtextUpper: false, springStiffness: 38, springDamping: 25,
    kbDir: 'in', overlayAlpha: 0.32, kbRange: 0.05,
    gradAngle: 145, paddingH: 75, accentBright: 18, fontScale: 1.00,
  },

  // ─── 84. GLITCH TV CTA ─────────────────────────────────────────────────────
  // CTA disruptiva: TV glitch + colorBurn + neon
  glitch_tv_cta: {
    sceneLayout: 'hero', textAnim: 'glitchTV', bgTreat: 'colorBurn', accentType: 'neonBorder',
    align: 'center', textY: 50, fontWeight: 900, tracking: '-0.04em',
    subtextUpper: false, springStiffness: 240, springDamping: 15,
    kbDir: 'in', overlayAlpha: 0.55, kbRange: 0.08,
    gradAngle: 315, paddingH: 78, accentBright: 50, fontScale: 1.18,
  },

  // ─── 85. NEON CTA ──────────────────────────────────────────────────────────
  // CTA noche: neón + spotlight + sticker
  neon_cta: {
    sceneLayout: 'hero', textAnim: 'neonFlicker', bgTreat: 'spotlight', accentType: 'sticker',
    align: 'center', textY: 50, fontWeight: 800, tracking: '0.04em',
    subtextUpper: false, springStiffness: 75, springDamping: 22,
    kbDir: 'in', overlayAlpha: 0.65, kbRange: 0.06,
    gradAngle: 270, paddingH: 80, accentBright: 50, fontScale: 1.12,
  },

  // ─── 86. SPIRAL CTA ────────────────────────────────────────────────────────
  // CTA: espiral + meshGradient + arrow
  spiral_cta: {
    sceneLayout: 'hero', textAnim: 'spiralIn', bgTreat: 'meshGradient', accentType: 'arrowMark',
    align: 'center', textY: 50, fontWeight: 800, tracking: '-0.03em',
    subtextUpper: false, springStiffness: 60, springDamping: 22,
    kbDir: 'in', overlayAlpha: 0.40, kbRange: 0.06,
    gradAngle: 90, paddingH: 80, accentBright: 40, fontScale: 1.18,
  },

  // ─── 87. PAPER FOLD CTA ────────────────────────────────────────────────────
  // CTA elegante: papel desdoblando + paperTexture + colorFrame
  paper_fold_cta: {
    sceneLayout: 'hero', textAnim: 'paperFold', bgTreat: 'paperTexture', accentType: 'colorFrame',
    align: 'center', textY: 50, fontWeight: 700, tracking: '0.02em',
    subtextUpper: false, springStiffness: 70, springDamping: 22,
    kbDir: 'in', overlayAlpha: 0.32, kbRange: 0.05,
    gradAngle: 145, paddingH: 80, accentBright: 25, fontScale: 1.12,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // NUEVOS PERFILES — Tanda 4: colorPour, mirrorIn, shutter, pulseRing, etc.
  // ═══════════════════════════════════════════════════════════════════════════

  // ─── 88. COLOR POUR HERO ───────────────────────────────────────────────────
  // Intro: el color de marca llena el texto desde abajo
  color_pour_hero: {
    sceneLayout: 'hero', textAnim: 'colorPour', bgTreat: 'colorBlock', accentType: 'colorFrame',
    align: 'left', textY: 50, fontWeight: 900, tracking: '-0.03em',
    subtextUpper: false, springStiffness: 65, springDamping: 24,
    kbDir: 'in', overlayAlpha: 0.30, kbRange: 0.05,
    gradAngle: 135, paddingH: 75, accentBright: 30, fontScale: 1.18,
  },

  // ─── 89. MIRROR LUX ────────────────────────────────────────────────────────
  // Content lujo: texto con reflejo + paperTexture + colorFrame
  mirror_lux: {
    sceneLayout: 'hero', textAnim: 'mirrorIn', bgTreat: 'paperTexture', accentType: 'colorFrame',
    align: 'center', textY: 45, fontWeight: 500, tracking: '0.12em',
    subtextUpper: true, springStiffness: 80, springDamping: 22,
    kbDir: 'in', overlayAlpha: 0.30, kbRange: 0.05,
    gradAngle: 145, paddingH: 90, accentBright: 18, fontScale: 0.95,
  },

  // ─── 90. SHUTTER STUDIO ────────────────────────────────────────────────────
  // Intro: persiana se abre con dramaticidad sobre dark
  shutter_studio: {
    sceneLayout: 'hero', textAnim: 'shutterReveal', bgTreat: 'cinematic', accentType: 'cornerBracket',
    align: 'center', textY: 50, fontWeight: 800, tracking: '-0.02em',
    subtextUpper: false, springStiffness: 90, springDamping: 22,
    kbDir: 'in', overlayAlpha: 0.55, kbRange: 0.06,
    gradAngle: 90, paddingH: 80, accentBright: 35, fontScale: 1.15,
  },

  // ─── 91. PULSE RING CTA ────────────────────────────────────────────────────
  // CTA energético: anillos pulsando + dotMatrix + arrow
  pulse_ring_cta: {
    sceneLayout: 'hero', textAnim: 'pulseRing', bgTreat: 'dotMatrix', accentType: 'arrowMark',
    align: 'center', textY: 50, fontWeight: 900, tracking: '-0.02em',
    subtextUpper: false, springStiffness: 80, springDamping: 22,
    kbDir: 'in', overlayAlpha: 0.50, kbRange: 0.06,
    gradAngle: 90, paddingH: 80, accentBright: 45, fontScale: 1.18,
  },

  // ─── 92. MAGNET SNAP ───────────────────────────────────────────────────────
  // Content lúdico: letras flotando + meshGradient + tiltCard
  magnet_snap: {
    sceneLayout: 'hero', textAnim: 'magnetSnap', bgTreat: 'meshGradient', accentType: 'tiltCard',
    align: 'center', textY: 50, fontWeight: 800, tracking: '-0.02em',
    subtextUpper: false, springStiffness: 380, springDamping: 18,
    kbDir: 'in', overlayAlpha: 0.42, kbRange: 0.06,
    gradAngle: 135, paddingH: 80, accentBright: 35, fontScale: 1.10,
  },

  // ─── 93. CURTAIN DRAMA ─────────────────────────────────────────────────────
  // Intro teatral: cortina cae sobre dark
  curtain_drama: {
    sceneLayout: 'hero', textAnim: 'curtainDrop', bgTreat: 'dark', accentType: 'cornerBracket',
    align: 'center', textY: 50, fontWeight: 900, tracking: '-0.03em',
    subtextUpper: false, springStiffness: 85, springDamping: 24,
    kbDir: 'in', overlayAlpha: 0.55, kbRange: 0.06,
    gradAngle: 180, paddingH: 80, accentBright: 30, fontScale: 1.18,
  },

  // ─── 94. LENS CINEMA ───────────────────────────────────────────────────────
  // Content cinematográfico: zoom de lente sobre vignette
  lens_cinema: {
    sceneLayout: 'hero', textAnim: 'lensZoom', bgTreat: 'vignette', accentType: 'hline',
    align: 'center', textY: 50, fontWeight: 600, tracking: '0.08em',
    subtextUpper: true, springStiffness: 60, springDamping: 22,
    kbDir: 'in', overlayAlpha: 0.55, kbRange: 0.06,
    gradAngle: 90, paddingH: 90, accentBright: 18, fontScale: 1.05,
  },

  // ─── 95. DASH STROKE EDITORIAL ─────────────────────────────────────────────
  // Content artesanal: trazo de bolígrafo + paperTexture
  dash_stroke_editorial: {
    sceneLayout: 'hero', textAnim: 'dashStroke', bgTreat: 'paperTexture', accentType: 'noiseTexture',
    align: 'left', textY: 50, fontWeight: 700, tracking: '0em',
    subtextUpper: false, springStiffness: 50, springDamping: 24,
    kbDir: 'in', overlayAlpha: 0.30, kbRange: 0.05,
    gradAngle: 145, paddingH: 75, accentBright: 18, fontScale: 1.00,
  },

  // ─── 96. COLOR POUR CTA ────────────────────────────────────────────────────
  // CTA: pour de color + gradientBurst
  color_pour_cta: {
    sceneLayout: 'hero', textAnim: 'colorPour', bgTreat: 'gradientBurst', accentType: 'sticker',
    align: 'center', textY: 50, fontWeight: 900, tracking: '-0.03em',
    subtextUpper: false, springStiffness: 60, springDamping: 24,
    kbDir: 'in', overlayAlpha: 0.40, kbRange: 0.05,
    gradAngle: 45, paddingH: 78, accentBright: 42, fontScale: 1.20,
  },

  // ─── 97. PULSE RING INTRO ──────────────────────────────────────────────────
  // Intro: anillos pulsando + colorBlock
  pulse_ring_intro: {
    sceneLayout: 'hero', textAnim: 'pulseRing', bgTreat: 'colorBlock', accentType: 'orbitDots',
    align: 'center', textY: 50, fontWeight: 800, tracking: '0.02em',
    subtextUpper: false, springStiffness: 80, springDamping: 22,
    kbDir: 'in', overlayAlpha: 0.35, kbRange: 0.05,
    gradAngle: 90, paddingH: 80, accentBright: 30, fontScale: 1.12,
  },

  // ─── 98. SHUTTER CTA ───────────────────────────────────────────────────────
  // CTA: persiana cierre + colorBurn
  shutter_cta: {
    sceneLayout: 'hero', textAnim: 'shutterReveal', bgTreat: 'colorBurn', accentType: 'colorFrame',
    align: 'center', textY: 50, fontWeight: 900, tracking: '-0.04em',
    subtextUpper: false, springStiffness: 90, springDamping: 22,
    kbDir: 'in', overlayAlpha: 0.55, kbRange: 0.07,
    gradAngle: 45, paddingH: 80, accentBright: 45, fontScale: 1.20,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // TANDA 5 — Animaciones 1x elevadas a 3x + layouts sin cubrir
  // ═══════════════════════════════════════════════════════════════════════════

  // ── rotateIn (1→3) ──────────────────────────────────────────────────────────
  rotate_split: {
    sceneLayout: 'split', textAnim: 'rotateIn', bgTreat: 'panel', accentType: 'vbar',
    align: 'left', textY: 38, fontWeight: 700, tracking: '0.04em',
    subtextUpper: false, springStiffness: 80, springDamping: 22,
    kbDir: 'out', overlayAlpha: 0.55, kbRange: 0.08,
    gradAngle: 90, paddingH: 80, accentBright: 22, fontScale: 1.00,
  },
  rotate_cta: {
    sceneLayout: 'hero', textAnim: 'rotateIn', bgTreat: 'gradientBurst', accentType: 'badgePop',
    align: 'left', textY: 62, fontWeight: 800, tracking: '-0.01em',
    subtextUpper: false, springStiffness: 95, springDamping: 20,
    kbDir: 'in', overlayAlpha: 0.48, kbRange: 0.09,
    gradAngle: 45, paddingH: 72, accentBright: 38, fontScale: 1.12,
  },

  // ── marquee (1→3) ──────────────────────────────────────────────────────────
  marquee_dark: {
    sceneLayout: 'magazine', textAnim: 'marquee', bgTreat: 'dark', accentType: 'filmstrip',
    align: 'left', textY: 72, fontWeight: 900, tracking: '-0.04em',
    subtextUpper: false, springStiffness: 95, springDamping: 20,
    kbDir: 'in', overlayAlpha: 0.68, kbRange: 0.09,
    gradAngle: 315, paddingH: 68, accentBright: 35, fontScale: 1.20,
  },
  marquee_overlay: {
    sceneLayout: 'overlay', textAnim: 'marquee', bgTreat: 'colorWash', accentType: 'orbitDots',
    align: 'left', textY: 75, fontWeight: 700, tracking: '0em',
    subtextUpper: false, springStiffness: 80, springDamping: 22,
    kbDir: 'out', overlayAlpha: 0.48, kbRange: 0.07,
    gradAngle: 180, paddingH: 72, accentBright: 28, fontScale: 1.05,
  },

  // ── colorCycle (1→3) ───────────────────────────────────────────────────────
  cycle_intro: {
    sceneLayout: 'hero', textAnim: 'colorCycle', bgTreat: 'meshGradient', accentType: 'sticker',
    align: 'center', textY: 48, fontWeight: 800, tracking: '-0.02em',
    subtextUpper: false, springStiffness: 85, springDamping: 20,
    kbDir: 'in', overlayAlpha: 0.42, kbRange: 0.07,
    gradAngle: 135, paddingH: 80, accentBright: 40, fontScale: 1.12,
  },
  cycle_overlay: {
    sceneLayout: 'overlay', textAnim: 'colorCycle', bgTreat: 'tint', accentType: 'circle',
    align: 'center', textY: 68, fontWeight: 600, tracking: '0.08em',
    subtextUpper: false, springStiffness: 78, springDamping: 22,
    kbDir: 'out', overlayAlpha: 0.52, kbRange: 0.08,
    gradAngle: 225, paddingH: 85, accentBright: 30, fontScale: 0.95,
  },

  // ── wobbleIn (1→3) ─────────────────────────────────────────────────────────
  wobble_intro: {
    sceneLayout: 'hero', textAnim: 'wobbleIn', bgTreat: 'colorBlock', accentType: 'sticker',
    align: 'center', textY: 50, fontWeight: 900, tracking: '-0.03em',
    subtextUpper: false, springStiffness: 280, springDamping: 9,
    kbDir: 'in', overlayAlpha: 0.32, kbRange: 0.06,
    gradAngle: 45, paddingH: 78, accentBright: 38, fontScale: 1.18,
  },
  wobble_cta: {
    sceneLayout: 'hero', textAnim: 'wobbleIn', bgTreat: 'gradientBurst', accentType: 'arrowMark',
    align: 'center', textY: 50, fontWeight: 900, tracking: '-0.02em',
    subtextUpper: false, springStiffness: 260, springDamping: 9,
    kbDir: 'in', overlayAlpha: 0.45, kbRange: 0.07,
    gradAngle: 90, paddingH: 78, accentBright: 45, fontScale: 1.20,
  },

  // ── inkBleed (1→3) ─────────────────────────────────────────────────────────
  ink_intro: {
    sceneLayout: 'magazine', textAnim: 'inkBleed', bgTreat: 'dark', accentType: 'bracket',
    align: 'left', textY: 72, fontWeight: 800, tracking: '-0.02em',
    subtextUpper: false, springStiffness: 40, springDamping: 26,
    kbDir: 'in', overlayAlpha: 0.72, kbRange: 0.08,
    gradAngle: 315, paddingH: 68, accentBright: 25, fontScale: 1.15,
  },
  ink_cta: {
    sceneLayout: 'hero', textAnim: 'inkBleed', bgTreat: 'vignette', accentType: 'hline',
    align: 'center', textY: 50, fontWeight: 700, tracking: '0.06em',
    subtextUpper: true, springStiffness: 38, springDamping: 26,
    kbDir: 'in', overlayAlpha: 0.62, kbRange: 0.06,
    gradAngle: 90, paddingH: 90, accentBright: 18, fontScale: 1.05,
  },

  // ── mirrorIn (1→3) ─────────────────────────────────────────────────────────
  mirror_intro: {
    sceneLayout: 'hero', textAnim: 'mirrorIn', bgTreat: 'cinematic', accentType: 'hline',
    align: 'center', textY: 42, fontWeight: 600, tracking: '0.10em',
    subtextUpper: true, springStiffness: 75, springDamping: 22,
    kbDir: 'in', overlayAlpha: 0.62, kbRange: 0.05,
    gradAngle: 180, paddingH: 90, accentBright: 20, fontScale: 1.00,
  },
  mirror_cta: {
    sceneLayout: 'hero', textAnim: 'mirrorIn', bgTreat: 'dark', accentType: 'cornerBracket',
    align: 'center', textY: 50, fontWeight: 700, tracking: '0.08em',
    subtextUpper: false, springStiffness: 80, springDamping: 22,
    kbDir: 'out', overlayAlpha: 0.68, kbRange: 0.06,
    gradAngle: 270, paddingH: 88, accentBright: 22, fontScale: 1.08,
  },

  // ── curtainDrop (1→3) ──────────────────────────────────────────────────────
  curtain_content: {
    sceneLayout: 'split', textAnim: 'curtainDrop', bgTreat: 'panel', accentType: 'vbar',
    align: 'left', textY: 45, fontWeight: 700, tracking: '0.02em',
    subtextUpper: false, springStiffness: 88, springDamping: 24,
    kbDir: 'out', overlayAlpha: 0.55, kbRange: 0.08,
    gradAngle: 90, paddingH: 80, accentBright: 25, fontScale: 1.00,
  },
  curtain_cta: {
    sceneLayout: 'hero', textAnim: 'curtainDrop', bgTreat: 'gradientBurst', accentType: 'arrowMark',
    align: 'center', textY: 50, fontWeight: 900, tracking: '-0.03em',
    subtextUpper: false, springStiffness: 85, springDamping: 24,
    kbDir: 'in', overlayAlpha: 0.45, kbRange: 0.07,
    gradAngle: 45, paddingH: 78, accentBright: 42, fontScale: 1.20,
  },

  // ── lensZoom (1→3) ─────────────────────────────────────────────────────────
  lens_intro: {
    sceneLayout: 'hero', textAnim: 'lensZoom', bgTreat: 'cinematic', accentType: 'hline',
    align: 'center', textY: 48, fontWeight: 700, tracking: '0.10em',
    subtextUpper: true, springStiffness: 58, springDamping: 24,
    kbDir: 'in', overlayAlpha: 0.65, kbRange: 0.06,
    gradAngle: 180, paddingH: 90, accentBright: 20, fontScale: 1.08,
  },
  lens_cta: {
    sceneLayout: 'hero', textAnim: 'lensZoom', bgTreat: 'gradientBurst', accentType: 'badgePop',
    align: 'center', textY: 50, fontWeight: 800, tracking: '-0.01em',
    subtextUpper: false, springStiffness: 62, springDamping: 23,
    kbDir: 'in', overlayAlpha: 0.44, kbRange: 0.07,
    gradAngle: 45, paddingH: 80, accentBright: 42, fontScale: 1.15,
  },

  // ── dashStroke (1→3) ───────────────────────────────────────────────────────
  dash_intro: {
    sceneLayout: 'hero', textAnim: 'dashStroke', bgTreat: 'paperGrid', accentType: 'tiltCard',
    align: 'left', textY: 48, fontWeight: 800, tracking: '-0.02em',
    subtextUpper: false, springStiffness: 52, springDamping: 24,
    kbDir: 'in', overlayAlpha: 0.68, kbRange: 0.06,
    gradAngle: 45, paddingH: 75, accentBright: 30, fontScale: 1.12,
  },
  dash_cta: {
    sceneLayout: 'hero', textAnim: 'dashStroke', bgTreat: 'colorBlock', accentType: 'sticker',
    align: 'left', textY: 50, fontWeight: 900, tracking: '-0.04em',
    subtextUpper: false, springStiffness: 50, springDamping: 24,
    kbDir: 'in', overlayAlpha: 0.32, kbRange: 0.05,
    gradAngle: 135, paddingH: 72, accentBright: 35, fontScale: 1.18,
  },

  // ── Nuevos layouts poco usados ──────────────────────────────────────────────
  bento_cinematic: {
    sceneLayout: 'bento', textAnim: 'morphReveal', bgTreat: 'cinematic', accentType: 'hline',
    align: 'center', textY: 50, fontWeight: 700, tracking: '0.06em',
    subtextUpper: true, springStiffness: 48, springDamping: 26,
    kbDir: 'in', overlayAlpha: 0.62, kbRange: 0.05,
    gradAngle: 180, paddingH: 60, accentBright: 22, fontScale: 0.98,
  },
  bento_glitch: {
    sceneLayout: 'bento', textAnim: 'glitch', bgTreat: 'colorBurn', accentType: 'neonBorder',
    align: 'left', textY: 50, fontWeight: 900, tracking: '-0.03em',
    subtextUpper: false, springStiffness: 200, springDamping: 15,
    kbDir: 'in', overlayAlpha: 0.60, kbRange: 0.06,
    gradAngle: 45, paddingH: 60, accentBright: 50, fontScale: 1.10,
  },
  triple_neon: {
    sceneLayout: 'tripleStrip', textAnim: 'neonFlicker', bgTreat: 'dark', accentType: 'neonBorder',
    align: 'center', textY: 50, fontWeight: 700, tracking: '0.04em',
    subtextUpper: false, springStiffness: 78, springDamping: 22,
    kbDir: 'in', overlayAlpha: 0.65, kbRange: 0.05,
    gradAngle: 90, paddingH: 60, accentBright: 50, fontScale: 1.05,
  },
  floating_marquee: {
    sceneLayout: 'floatingCard', textAnim: 'marquee', bgTreat: 'dotMatrix', accentType: 'orbitDots',
    align: 'left', textY: 50, fontWeight: 800, tracking: '-0.02em',
    subtextUpper: false, springStiffness: 90, springDamping: 20,
    kbDir: 'in', overlayAlpha: 0.50, kbRange: 0.06,
    gradAngle: 135, paddingH: 70, accentBright: 35, fontScale: 1.12,
  },
  type_mask_ink: {
    sceneLayout: 'typeMask', textAnim: 'inkBleed', bgTreat: 'dark', accentType: 'noiseTexture',
    align: 'center', textY: 50, fontWeight: 900, tracking: '-0.07em',
    subtextUpper: false, springStiffness: 38, springDamping: 26,
    kbDir: 'in', overlayAlpha: 0.55, kbRange: 0.05,
    gradAngle: 180, paddingH: 60, accentBright: 20, fontScale: 1.25,
  },
  zoom_pour: {
    sceneLayout: 'zoomFrame', textAnim: 'colorPour', bgTreat: 'colorBlock', accentType: 'colorFrame',
    align: 'center', textY: 50, fontWeight: 800, tracking: '-0.02em',
    subtextUpper: false, springStiffness: 65, springDamping: 24,
    kbDir: 'in', overlayAlpha: 0.32, kbRange: 0.08,
    gradAngle: 90, paddingH: 80, accentBright: 30, fontScale: 1.10,
  },
  circle_curtain: {
    sceneLayout: 'circleCrop', textAnim: 'curtainDrop', bgTreat: 'colorBlock', accentType: 'orbitDots',
    align: 'left', textY: 50, fontWeight: 800, tracking: '-0.01em',
    subtextUpper: false, springStiffness: 88, springDamping: 24,
    kbDir: 'in', overlayAlpha: 0.36, kbRange: 0.06,
    gradAngle: 135, paddingH: 60, accentBright: 30, fontScale: 1.05,
  },
  diagonal_lens: {
    sceneLayout: 'diagonalSplit', textAnim: 'lensZoom', bgTreat: 'cinematic', accentType: 'hline',
    align: 'left', textY: 50, fontWeight: 700, tracking: '0.04em',
    subtextUpper: true, springStiffness: 60, springDamping: 24,
    kbDir: 'in', overlayAlpha: 0.58, kbRange: 0.07,
    gradAngle: 45, paddingH: 68, accentBright: 20, fontScale: 0.98,
  },
  vertical_wobble: {
    sceneLayout: 'verticalBand', textAnim: 'wobbleIn', bgTreat: 'colorWash', accentType: 'colorFrame',
    align: 'left', textY: 50, fontWeight: 800, tracking: '-0.02em',
    subtextUpper: false, springStiffness: 270, springDamping: 9,
    kbDir: 'out', overlayAlpha: 0.48, kbRange: 0.07,
    gradAngle: 90, paddingH: 60, accentBright: 32, fontScale: 1.05,
  },
  mosaic_curtain: {
    sceneLayout: 'mosaic', textAnim: 'curtainDrop', bgTreat: 'colorBlock', accentType: 'colorFrame',
    align: 'left', textY: 50, fontWeight: 700, tracking: '0em',
    subtextUpper: false, springStiffness: 88, springDamping: 24,
    kbDir: 'in', overlayAlpha: 0.38, kbRange: 0.05,
    gradAngle: 135, paddingH: 60, accentBright: 26, fontScale: 0.95,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // TANDA 6 — 10 animaciones nuevas × 3 perfiles cada una = 30 perfiles
  // ═══════════════════════════════════════════════════════════════════════════

  // ── stampIn ────────────────────────────────────────────────────────────────
  stamp_intro: {
    sceneLayout: 'hero', textAnim: 'stampIn', bgTreat: 'colorBlock', accentType: 'sticker',
    align: 'center', textY: 50, fontWeight: 900, tracking: '-0.02em',
    subtextUpper: false, springStiffness: 620, springDamping: 22,
    kbDir: 'in', overlayAlpha: 0.32, kbRange: 0.05,
    gradAngle: 135, paddingH: 78, accentBright: 38, fontScale: 1.20,
  },
  stamp_content: {
    sceneLayout: 'split', textAnim: 'stampIn', bgTreat: 'tint', accentType: 'vbar',
    align: 'left', textY: 45, fontWeight: 800, tracking: '-0.01em',
    subtextUpper: false, springStiffness: 580, springDamping: 20,
    kbDir: 'out', overlayAlpha: 0.58, kbRange: 0.08,
    gradAngle: 90, paddingH: 80, accentBright: 28, fontScale: 1.05,
  },
  stamp_cta: {
    sceneLayout: 'hero', textAnim: 'stampIn', bgTreat: 'gradientBurst', accentType: 'arrowMark',
    align: 'center', textY: 50, fontWeight: 900, tracking: '-0.03em',
    subtextUpper: false, springStiffness: 600, springDamping: 22,
    kbDir: 'in', overlayAlpha: 0.42, kbRange: 0.07,
    gradAngle: 45, paddingH: 78, accentBright: 45, fontScale: 1.22,
  },

  // ── zoomOut ────────────────────────────────────────────────────────────────
  zoom_out_intro: {
    sceneLayout: 'hero', textAnim: 'zoomOut', bgTreat: 'cinematic', accentType: 'hline',
    align: 'center', textY: 46, fontWeight: 700, tracking: '0.08em',
    subtextUpper: true, springStiffness: 50, springDamping: 25,
    kbDir: 'in', overlayAlpha: 0.60, kbRange: 0.05,
    gradAngle: 180, paddingH: 88, accentBright: 18, fontScale: 1.08,
  },
  zoom_out_content: {
    sceneLayout: 'overlay', textAnim: 'zoomOut', bgTreat: 'minimal', accentType: 'none',
    align: 'center', textY: 60, fontWeight: 500, tracking: '0.12em',
    subtextUpper: true, springStiffness: 48, springDamping: 26,
    kbDir: 'out', overlayAlpha: 0.30, kbRange: 0.06,
    gradAngle: 0, paddingH: 95, accentBright: 8, fontScale: 0.92,
  },
  zoom_out_cta: {
    sceneLayout: 'hero', textAnim: 'zoomOut', bgTreat: 'gradientBurst', accentType: 'sticker',
    align: 'center', textY: 50, fontWeight: 900, tracking: '-0.02em',
    subtextUpper: false, springStiffness: 52, springDamping: 24,
    kbDir: 'in', overlayAlpha: 0.44, kbRange: 0.07,
    gradAngle: 45, paddingH: 80, accentBright: 42, fontScale: 1.18,
  },

  // ── windSweep ──────────────────────────────────────────────────────────────
  wind_intro: {
    sceneLayout: 'magazine', textAnim: 'windSweep', bgTreat: 'dark', accentType: 'bracket',
    align: 'left', textY: 72, fontWeight: 900, tracking: '-0.04em',
    subtextUpper: false, springStiffness: 88, springDamping: 20,
    kbDir: 'in', overlayAlpha: 0.68, kbRange: 0.10,
    gradAngle: 315, paddingH: 68, accentBright: 32, fontScale: 1.22,
  },
  wind_content: {
    sceneLayout: 'hero', textAnim: 'windSweep', bgTreat: 'duotone', accentType: 'vbar',
    align: 'left', textY: 48, fontWeight: 700, tracking: '0em',
    subtextUpper: false, springStiffness: 85, springDamping: 20,
    kbDir: 'out', overlayAlpha: 0.52, kbRange: 0.08,
    gradAngle: 135, paddingH: 80, accentBright: 22, fontScale: 1.00,
  },
  wind_cta: {
    sceneLayout: 'hero', textAnim: 'windSweep', bgTreat: 'striped', accentType: 'arrowMark',
    align: 'left', textY: 52, fontWeight: 900, tracking: '-0.03em',
    subtextUpper: false, springStiffness: 90, springDamping: 19,
    kbDir: 'in', overlayAlpha: 0.50, kbRange: 0.07,
    gradAngle: 45, paddingH: 72, accentBright: 40, fontScale: 1.18,
  },

  // ── scanReveal ─────────────────────────────────────────────────────────────
  scan_intro: {
    sceneLayout: 'hero', textAnim: 'scanReveal', bgTreat: 'paperGrid', accentType: 'tiltCard',
    align: 'left', textY: 42, fontWeight: 800, tracking: '-0.01em',
    subtextUpper: false, springStiffness: 78, springDamping: 22,
    kbDir: 'in', overlayAlpha: 0.72, kbRange: 0.06,
    gradAngle: 45, paddingH: 75, accentBright: 32, fontScale: 1.15,
  },
  scan_content: {
    sceneLayout: 'split', textAnim: 'scanReveal', bgTreat: 'panel', accentType: 'vbar',
    align: 'left', textY: 45, fontWeight: 700, tracking: '0.02em',
    subtextUpper: false, springStiffness: 75, springDamping: 22,
    kbDir: 'out', overlayAlpha: 0.55, kbRange: 0.08,
    gradAngle: 90, paddingH: 80, accentBright: 22, fontScale: 1.00,
  },
  scan_cta: {
    sceneLayout: 'hero', textAnim: 'scanReveal', bgTreat: 'colorBlock', accentType: 'colorFrame',
    align: 'left', textY: 50, fontWeight: 900, tracking: '-0.03em',
    subtextUpper: false, springStiffness: 80, springDamping: 22,
    kbDir: 'in', overlayAlpha: 0.32, kbRange: 0.05,
    gradAngle: 135, paddingH: 72, accentBright: 38, fontScale: 1.20,
  },

  // ── neonBuild ──────────────────────────────────────────────────────────────
  neon_build_intro: {
    sceneLayout: 'hero', textAnim: 'neonBuild', bgTreat: 'dark', accentType: 'neonBorder',
    align: 'center', textY: 50, fontWeight: 700, tracking: '0.06em',
    subtextUpper: false, springStiffness: 100, springDamping: 14,
    kbDir: 'in', overlayAlpha: 0.72, kbRange: 0.07,
    gradAngle: 0, paddingH: 82, accentBright: 50, fontScale: 1.12,
  },
  neon_build_content: {
    sceneLayout: 'hero', textAnim: 'neonBuild', bgTreat: 'dotMatrix', accentType: 'none',
    align: 'center', textY: 55, fontWeight: 600, tracking: '0.04em',
    subtextUpper: false, springStiffness: 95, springDamping: 15,
    kbDir: 'in', overlayAlpha: 0.55, kbRange: 0.06,
    gradAngle: 270, paddingH: 85, accentBright: 40, fontScale: 1.05,
  },
  neon_build_cta: {
    sceneLayout: 'hero', textAnim: 'neonBuild', bgTreat: 'colorBurn', accentType: 'neonBorder',
    align: 'center', textY: 50, fontWeight: 800, tracking: '-0.01em',
    subtextUpper: false, springStiffness: 105, springDamping: 14,
    kbDir: 'in', overlayAlpha: 0.60, kbRange: 0.08,
    gradAngle: 315, paddingH: 80, accentBright: 52, fontScale: 1.18,
  },

  // ── accelDrop ──────────────────────────────────────────────────────────────
  accel_drop_intro: {
    sceneLayout: 'hero', textAnim: 'accelDrop', bgTreat: 'cinematic', accentType: 'hline',
    align: 'center', textY: 50, fontWeight: 800, tracking: '0.04em',
    subtextUpper: true, springStiffness: 80, springDamping: 20,
    kbDir: 'in', overlayAlpha: 0.62, kbRange: 0.06,
    gradAngle: 180, paddingH: 85, accentBright: 22, fontScale: 1.12,
  },
  accel_drop_content: {
    sceneLayout: 'overlay', textAnim: 'accelDrop', bgTreat: 'duotone', accentType: 'particles',
    align: 'left', textY: 72, fontWeight: 700, tracking: '0em',
    subtextUpper: false, springStiffness: 80, springDamping: 20,
    kbDir: 'out', overlayAlpha: 0.50, kbRange: 0.08,
    gradAngle: 225, paddingH: 78, accentBright: 25, fontScale: 0.98,
  },
  accel_drop_cta: {
    sceneLayout: 'hero', textAnim: 'accelDrop', bgTreat: 'tint', accentType: 'diagonal',
    align: 'center', textY: 50, fontWeight: 900, tracking: '-0.02em',
    subtextUpper: false, springStiffness: 80, springDamping: 20,
    kbDir: 'in', overlayAlpha: 0.60, kbRange: 0.08,
    gradAngle: 45, paddingH: 78, accentBright: 42, fontScale: 1.20,
  },

  // ── stretchIn ──────────────────────────────────────────────────────────────
  stretch_intro: {
    sceneLayout: 'magazine', textAnim: 'stretchIn', bgTreat: 'dark', accentType: 'bracket',
    align: 'left', textY: 74, fontWeight: 900, tracking: '-0.05em',
    subtextUpper: false, springStiffness: 165, springDamping: 15,
    kbDir: 'in', overlayAlpha: 0.72, kbRange: 0.09,
    gradAngle: 315, paddingH: 68, accentBright: 35, fontScale: 1.25,
  },
  stretch_content: {
    sceneLayout: 'hero', textAnim: 'stretchIn', bgTreat: 'colorBlock', accentType: 'colorFrame',
    align: 'left', textY: 48, fontWeight: 800, tracking: '-0.02em',
    subtextUpper: false, springStiffness: 160, springDamping: 15,
    kbDir: 'in', overlayAlpha: 0.30, kbRange: 0.06,
    gradAngle: 135, paddingH: 72, accentBright: 28, fontScale: 1.10,
  },
  stretch_cta: {
    sceneLayout: 'hero', textAnim: 'stretchIn', bgTreat: 'gradientBurst', accentType: 'arrowMark',
    align: 'center', textY: 50, fontWeight: 900, tracking: '-0.03em',
    subtextUpper: false, springStiffness: 165, springDamping: 14,
    kbDir: 'in', overlayAlpha: 0.44, kbRange: 0.07,
    gradAngle: 45, paddingH: 78, accentBright: 45, fontScale: 1.22,
  },

  // ── implode ────────────────────────────────────────────────────────────────
  implode_intro: {
    sceneLayout: 'hero', textAnim: 'implode', bgTreat: 'vignette', accentType: 'cornerBracket',
    align: 'center', textY: 50, fontWeight: 900, tracking: '-0.02em',
    subtextUpper: false, springStiffness: 65, springDamping: 22,
    kbDir: 'in', overlayAlpha: 0.68, kbRange: 0.07,
    gradAngle: 270, paddingH: 82, accentBright: 30, fontScale: 1.18,
  },
  implode_content: {
    sceneLayout: 'overlay', textAnim: 'implode', bgTreat: 'tint', accentType: 'circle',
    align: 'center', textY: 68, fontWeight: 600, tracking: '0.06em',
    subtextUpper: false, springStiffness: 62, springDamping: 22,
    kbDir: 'out', overlayAlpha: 0.50, kbRange: 0.07,
    gradAngle: 225, paddingH: 85, accentBright: 28, fontScale: 0.96,
  },
  implode_cta: {
    sceneLayout: 'hero', textAnim: 'implode', bgTreat: 'meshGradient', accentType: 'badgePop',
    align: 'center', textY: 50, fontWeight: 800, tracking: '-0.01em',
    subtextUpper: false, springStiffness: 65, springDamping: 22,
    kbDir: 'in', overlayAlpha: 0.42, kbRange: 0.07,
    gradAngle: 90, paddingH: 80, accentBright: 38, fontScale: 1.15,
  },

  // ── flipReveal ─────────────────────────────────────────────────────────────
  flip_reveal_intro: {
    sceneLayout: 'hero', textAnim: 'flipReveal', bgTreat: 'panel', accentType: 'vbar',
    align: 'left', textY: 44, fontWeight: 700, tracking: '0.04em',
    subtextUpper: false, springStiffness: 175, springDamping: 18,
    kbDir: 'out', overlayAlpha: 0.58, kbRange: 0.07,
    gradAngle: 90, paddingH: 80, accentBright: 22, fontScale: 1.05,
  },
  flip_reveal_content: {
    sceneLayout: 'split', textAnim: 'flipReveal', bgTreat: 'dark', accentType: 'vbar',
    align: 'left', textY: 48, fontWeight: 700, tracking: '0.02em',
    subtextUpper: false, springStiffness: 170, springDamping: 18,
    kbDir: 'out', overlayAlpha: 0.65, kbRange: 0.08,
    gradAngle: 135, paddingH: 80, accentBright: 20, fontScale: 1.00,
  },
  flip_reveal_cta: {
    sceneLayout: 'hero', textAnim: 'flipReveal', bgTreat: 'gradientBurst', accentType: 'badgePop',
    align: 'center', textY: 50, fontWeight: 900, tracking: '-0.02em',
    subtextUpper: false, springStiffness: 178, springDamping: 18,
    kbDir: 'in', overlayAlpha: 0.44, kbRange: 0.07,
    gradAngle: 45, paddingH: 80, accentBright: 42, fontScale: 1.20,
  },

  // ── textRise ───────────────────────────────────────────────────────────────
  text_rise_intro: {
    sceneLayout: 'hero', textAnim: 'textRise', bgTreat: 'cinematic', accentType: 'hline',
    align: 'center', textY: 48, fontWeight: 700, tracking: '0.08em',
    subtextUpper: true, springStiffness: 82, springDamping: 22,
    kbDir: 'in', overlayAlpha: 0.62, kbRange: 0.05,
    gradAngle: 180, paddingH: 88, accentBright: 20, fontScale: 1.08,
  },
  text_rise_content: {
    sceneLayout: 'overlay', textAnim: 'textRise', bgTreat: 'colorWash', accentType: 'orbitDots',
    align: 'left', textY: 75, fontWeight: 700, tracking: '0em',
    subtextUpper: false, springStiffness: 80, springDamping: 22,
    kbDir: 'out', overlayAlpha: 0.48, kbRange: 0.07,
    gradAngle: 180, paddingH: 75, accentBright: 25, fontScale: 1.00,
  },
  text_rise_cta: {
    sceneLayout: 'hero', textAnim: 'textRise', bgTreat: 'tint', accentType: 'arrowMark',
    align: 'center', textY: 50, fontWeight: 900, tracking: '-0.02em',
    subtextUpper: false, springStiffness: 85, springDamping: 22,
    kbDir: 'in', overlayAlpha: 0.55, kbRange: 0.07,
    gradAngle: 45, paddingH: 80, accentBright: 40, fontScale: 1.18,
  },
} // fin MOTION_PROFILES

export const PROFILE_NAMES = Object.keys(MOTION_PROFILES) as (keyof typeof MOTION_PROFILES)[]

// ─── Clasificación por tipo de escena ────────────────────────────────────────
// Regla: dentro de cada pool, textAnims únicos para máxima variedad intra-video.
// Entre pools se pueden repetir (son pools separados, el motor anti-repetición
// gestiona los conflictos dentro del mismo video).

// INTRO: perfiles — máxima variedad de aperturas
export const INTRO_PROFILES: string[] = [
  'noir_cinema',         // blurReveal
  'letter_fall',         // punchIn
  'urban_hack',          // glitch
  'glitch_center',       // glitch
  'mag_bold',            // slideDown
  'typewriter_tech',     // typewriter
  'cascade_hero',        // splitReveal
  'morph_cinema',        // morphReveal
  'documentary',         // rotateIn
  'glass_intro',         // popIn
  'tilt_intro',          // punchIn
  'big_type_color',      // maskWipe
  'diagonal_bold',       // staggerDrop
  'spotlight_intimate',  // verticalize
  'striped_hero',        // shake3D
  'striped_intro',       // shake3D
  'triple_strip_bold',   // slideArc
  'floating_glass',      // breathe
  'type_mask_cinema',    // zoomBlur
  'chroma_night',        // chromaShift
  'glitch_tv_cinema',    // glitchTV
  'paper_fold_mag',      // paperFold
  'spiral_drama',        // spiralIn
  'neon_night',          // neonFlicker
  'color_pour_hero',     // colorPour
  'shutter_studio',      // shutterReveal
  'curtain_drama',       // curtainDrop
  'pulse_ring_intro',    // pulseRing
  'cycle_intro',         // colorCycle
  'wobble_intro',        // wobbleIn
  'ink_intro',           // inkBleed
  'mirror_intro',        // mirrorIn
  'lens_intro',          // lensZoom
  'dash_intro',          // dashStroke
  'marquee_dark',        // marquee
  'bento_cinematic',     // morphReveal + bento
  'bento_glitch',        // glitch + bento
  'stamp_intro',         // stampIn
  'zoom_out_intro',      // zoomOut
  'wind_intro',          // windSweep
  'scan_intro',          // scanReveal
  'neon_build_intro',    // neonBuild
  'accel_drop_intro',    // accelDrop
  'stretch_intro',       // stretchIn
  'implode_intro',       // implode
  'flip_reveal_intro',   // flipReveal
  'text_rise_intro',     // textRise
]

// CONTENT: perfiles — máxima diversidad de layouts y tratamientos
export const CONTENT_PROFILES: string[] = [
  'editorial_split',     // flipIn
  'story_corner',        // slideUp
  'elastic_joy',         // elastic
  'film_gallery',        // zoomIn
  'split_story',         // slideLeft
  'organic_life',        // blurReveal
  'retro_film',          // typewriter
  'soft_carousel',       // slideRight
  'architect',           // fadeOnly
  'word_poetry',         // morphReveal
  'flip_split',          // flipIn
  'morph_minimal',       // morphReveal
  'split_reveal_dark',   // splitReveal
  'bold_cascade',        // slingShot
  'photo_top_warm',      // punchIn
  'photo_top_dark',      // slideDown
  'glass_content',       // popIn
  'mosaic_grid',         // popIn
  'mosaic_editorial',    // slideUp
  'mosaic_curtain',      // curtainDrop
  'diagonal_cut',        // slideRight
  'diagonal_lens',       // lensZoom
  'circle_focus',        // wordByWord
  'circle_editorial',    // blurReveal
  'circle_curtain',      // curtainDrop
  'vertical_band',       // slideLeft
  'vertical_edge',       // scramble
  'vertical_wobble',     // wobbleIn
  'wave_flow',           // swirlIn
  'wash_cinema',         // maskWipe
  'wash_poetry',         // liquidWipe
  'bento_editorial',     // popIn
  'bento_soft',          // breathe
  'triple_strip_minimal',// zoomBlur
  'triple_neon',         // neonFlicker
  'floating_marquee',    // marquee
  'zoom_frame_editorial',// wordByWord
  'zoom_frame_prestige', // fadeOnly
  'zoom_pour',           // colorPour
  'type_mask_ink',       // inkBleed
  'mesh_flow',           // slideArc
  'paper_editorial',     // zoomBlur
  'wobble_play',         // wobbleIn
  'split_flap_station',  // splitFlap
  'ink_bleed_editorial', // inkBleed
  'mirror_lux',          // mirrorIn
  'magnet_snap',         // magnetSnap
  'lens_cinema',         // lensZoom
  'dash_stroke_editorial', // dashStroke
  'rotate_split',        // rotateIn
  'curtain_content',     // curtainDrop
  'cycle_overlay',       // colorCycle
  'marquee_overlay',     // marquee
  'stamp_content',       // stampIn
  'zoom_out_content',    // zoomOut
  'wind_content',        // windSweep
  'scan_content',        // scanReveal
  'neon_build_content',  // neonBuild
  'accel_drop_content',  // accelDrop
  'stretch_content',     // stretchIn
  'implode_content',     // implode
  'flip_reveal_content', // flipReveal
  'text_rise_content',   // textRise
]

// CTA: perfiles
export const CTA_PROFILES: string[] = [
  'punch_sport',         // punchIn
  'glitch_center',       // glitch
  'urban_hack',          // glitch
  'elastic_joy',         // elastic
  'brutal_manifesto',    // zoomBlur
  'cascade_cta',         // elastic
  'morph_cta',           // morphReveal
  'flip_cta',            // flipIn
  'split_cta',           // splitReveal
  'glass_cta',           // zoomIn
  'paper_cta',           // maskWipe
  'tilt_cta',            // slideUp
  'big_type_burst',      // liquidWipe
  'marquee_energy',      // marquee
  'wave_cta',            // maskWipe
  'gradient_burst_cta',  // staggerDrop
  'circle_cta',          // swirlIn
  'floating_drama',      // expandOut
  'type_mask_cta',       // chromaShift
  'zoom_frame_cta',      // colorCycle
  'expand_cta',          // expandOut
  'slingshot_bold',      // slingShot
  'glitch_tv_cta',       // glitchTV
  'neon_cta',            // neonFlicker
  'spiral_cta',          // spiralIn
  'paper_fold_cta',      // paperFold
  'color_pour_cta',      // colorPour
  'pulse_ring_cta',      // pulseRing
  'shutter_cta',         // shutterReveal
  'rotate_cta',          // rotateIn
  'wobble_cta',          // wobbleIn
  'ink_cta',             // inkBleed
  'mirror_cta',          // mirrorIn
  'lens_cta',            // lensZoom
  'dash_cta',            // dashStroke
  'curtain_cta',         // curtainDrop
  'circle_curtain',      // curtainDrop + circleCrop
  'stamp_cta',           // stampIn
  'zoom_out_cta',        // zoomOut
  'wind_cta',            // windSweep
  'scan_cta',            // scanReveal
  'neon_build_cta',      // neonBuild
  'accel_drop_cta',      // accelDrop
  'stretch_cta',         // stretchIn
  'implode_cta',         // implode
  'flip_reveal_cta',     // flipReveal
  'text_rise_cta',       // textRise
]
