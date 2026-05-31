import Anthropic from '@anthropic-ai/sdk'
import type { AITextProvider } from './base'
import type { TextGenerationParams, ExtractedBrandStyle } from '@brandai/shared'
import { ExternalServiceError } from '../../../lib/errors'

const MODEL = 'claude-sonnet-4-6'

export class ClaudeSonnetProvider implements AITextProvider {
  readonly providerName = 'claude-sonnet'
  private client: Anthropic

  constructor() {
    if (!process.env['ANTHROPIC_API_KEY']) {
      throw new Error('ANTHROPIC_API_KEY is required')
    }
    this.client = new Anthropic({ apiKey: process.env['ANTHROPIC_API_KEY'] })
  }

  async generateText(params: TextGenerationParams): Promise<string> {
    const { prompt, systemPrompt, maxTokens = 1024, temperature = 0.7 } = params

    let response: Anthropic.Message
    try {
      response = await this.client.messages.create({
        model: MODEL,
        max_tokens: maxTokens,
        temperature,
        system: systemPrompt ?? 'You are a professional marketing copywriter for small businesses in Latin America.',
        messages: [{ role: 'user', content: prompt }],
      })
    } catch (err) {
      throw new ExternalServiceError('Claude Sonnet', err instanceof Error ? err.message : 'Text generation failed')
    }

    const block = response.content[0]
    if (!block || block.type !== 'text') {
      throw new ExternalServiceError('Claude Sonnet', 'No text content in response')
    }

    return block.text
  }

  async analyzeBrandImages(imageUrls: string[]): Promise<ExtractedBrandStyle> {
    // ── Descargar imágenes con validación de respuesta HTTP ──────────────────
    const fetchResults = await Promise.all(
      imageUrls.map(async (url) => {
        try {
          const res = await fetch(url)
          if (!res.ok) {
            console.warn(`[BrandAnalysis] HTTP ${res.status} fetching image — skipping: ${url.slice(0, 80)}`)
            return null
          }
          const contentType = res.headers.get('content-type') ?? ''
          // Rechazar respuestas que no sean imagen (ej. JSON de error de Supabase)
          if (!contentType.startsWith('image/')) {
            console.warn(`[BrandAnalysis] Non-image content-type "${contentType}" — skipping: ${url.slice(0, 80)}`)
            return null
          }
          const buf    = await res.arrayBuffer()
          const base64 = Buffer.from(buf).toString('base64')
          const mime   = contentType.split(';')[0]!.trim() as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp'
          console.log(`[BrandAnalysis] Loaded image (${(buf.byteLength / 1024).toFixed(0)} KB, ${mime}): ${url.slice(0, 60)}...`)
          return { type: 'image' as const, source: { type: 'base64' as const, media_type: mime, data: base64 } }
        } catch (err) {
          console.warn(`[BrandAnalysis] Failed to fetch image: ${url.slice(0, 80)} — ${(err as Error).message}`)
          return null
        }
      }),
    )

    const imageContents = fetchResults.filter((r): r is Anthropic.ImageBlockParam => r !== null)

    if (imageContents.length === 0) {
      throw new ExternalServiceError('BrandAnalysis', 'No se pudieron descargar las imágenes de la marca. Verifica que estén subidas correctamente.')
    }
    console.log(`[BrandAnalysis] Sending ${imageContents.length}/${imageUrls.length} images to Claude Opus`)

    // Análisis con Opus — mejor extracción de matices cromáticos que Sonnet.
    // El análisis es 1 vez por marca, justifica el costo extra.
    let response: Anthropic.Message
    try {
      response = await this.client.messages.create({
        model: 'claude-opus-4-7',
        max_tokens: 1800,
        system: `Eres ANALISTA SENIOR DE IDENTIDAD VISUAL de una agencia de branding.
Tu tarea: extraer la paleta cromática EXACTA de una marca a partir de su logo, fotos de referencia
y material visual. Esta paleta alimentará un generador de videos publicitarios — la precisión
del color es CRÍTICA.

━━━━ REGLA FUNDAMENTAL — LEE ESTO PRIMERO ━━━━

SOLO puedes usar colores que estés viendo VISUALMENTE en las imágenes proporcionadas.
PROHIBIDO inventar, suponer, o elegir colores "creativos" o "de moda".
PROHIBIDO usar colores de la interfaz, app, o herramienta que rodeaba las imágenes.
Si tienes dudas sobre un color, usa el eye-dropper más literal posible — el pixel real.
Actúa como un diseñador con un cuentagotas, no como un creativo eligiendo una paleta.

━━━━ REGLAS DE EXTRACCIÓN ━━━━

1. PRIMARY: el color que MÁS se repite o que define la identidad visual de la marca.
   Prioridad: color del logo → color dominante de las fotos → color de productos/packaging.
   NUNCA uses negro (#000000) o blanco (#FFFFFF) puro como primary a menos que sea una
   marca editorial/lujo explícitamente monocromática.
   NUNCA uses violeta, púrpura ni morado a menos que estén CLARAMENTE en las imágenes.

2. SECONDARY: el segundo color más presente en las imágenes. Debe harmonizar con primary.
   Si la marca parece monocromática, usa una variación tonal: más claro o más oscuro.

3. ACCENT: color de contraste/impacto que aparezca en las imágenes (botones, bordes, detalles).
   Si no hay accent claro, deriva uno: rota el hue del primary ~150° con mayor saturación.

4. DARK: tono oscuro DERIVADO del primary (no negro puro). Mezcla el primary hacia negro.

5. LIGHT: tono claro DERIVADO del primary (no blanco puro). Tinte muy suave del primary.

6. BACKGROUND: el fondo más neutral visible en las imágenes (off-white, crema, gris suave, etc).

━━━━ VALIDACIÓN ━━━━
- TODOS los colores en formato hex de 6 dígitos (#RRGGBB), sin alfa.
- No uses nombres como "red" — solo hex.
- El primary DEBE ser el color real del negocio: marrón si es café/madera,
  verde si es naturaleza/vegetal, naranja si es comida/energía, azul si es servicios/tech, etc.

━━━━ FORMATO DE RESPUESTA — SOLO JSON, sin markdown ━━━━
{
  "colors": {
    "primary":    "#RRGGBB",
    "secondary":  "#RRGGBB",
    "accent":     "#RRGGBB",
    "dark":       "#RRGGBB",
    "light":      "#RRGGBB",
    "background": "#RRGGBB"
  },
  "visualStyle": "descripción específica del estilo: movimiento de diseño, referencias estéticas, layout dominante",
  "fonts": ["familia tipográfica o descripción detallada (serif/sans/display, peso, personalidad)"],
  "elements": ["elementos visuales recurrentes: iconos, formas, patrones, texturas, estilo fotográfico"],
  "mood": "tono emocional de marca en una frase: qué siente la audiencia frente a esta marca",
  "recommendations": [
    "instrucciones concretas para generar imágenes/videos que respeten esta marca",
    "estilo de iluminación, composición, color grading, estilo fotográfico",
    "qué EVITAR para que el output se mantenga on-brand"
  ]
}`,
        messages: [
          {
            role: 'user',
            content: [
              ...imageContents,
              {
                type: 'text',
                text: 'Analiza estas imágenes con un eye-dropper virtual. Extrae solo los colores que VES en estas imágenes — los colores reales del negocio. No inventes. Devuelve solo el JSON.',
              },
            ],
          },
        ],
      })
    } catch (err) {
      throw new ExternalServiceError('Claude Opus', err instanceof Error ? err.message : 'Brand analysis failed')
    }

    const block = response.content[0]
    if (!block || block.type !== 'text') {
      throw new ExternalServiceError('Claude Opus', 'No response from brand analysis')
    }

    let parsed: ExtractedBrandStyle
    try {
      const jsonMatch = block.text.match(/\{[\s\S]*\}/)
      if (!jsonMatch?.[0]) throw new Error('No JSON found')
      parsed = JSON.parse(jsonMatch[0]) as ExtractedBrandStyle
    } catch {
      throw new ExternalServiceError('Claude Opus', 'Failed to parse brand analysis response')
    }

    // ── Validación y sanitización de la paleta ─────────────────────────────
    return sanitizeExtractedStyle(parsed)
  }
}

// ─── Helpers de paleta ─────────────────────────────────────────────────────

const HEX_RE = /^#[0-9A-Fa-f]{6}$/

function isValidHex(v: unknown): v is string {
  return typeof v === 'string' && HEX_RE.test(v.trim())
}

function normalizeHex(v: unknown, fallback: string): string {
  if (typeof v !== 'string') return fallback
  const trimmed = v.trim()
  if (HEX_RE.test(trimmed)) return trimmed.toUpperCase()
  // Aceptar #RGB y expandir
  const m = trimmed.match(/^#([0-9A-Fa-f])([0-9A-Fa-f])([0-9A-Fa-f])$/)
  if (m) return `#${m[1]!}${m[1]!}${m[2]!}${m[2]!}${m[3]!}${m[3]!}`.toUpperCase()
  return fallback
}

function hexToRgb(hex: string): [number, number, number] {
  const c = hex.replace('#', '')
  return [parseInt(c.slice(0,2), 16), parseInt(c.slice(2,4), 16), parseInt(c.slice(4,6), 16)]
}

function rgbToHex(r: number, g: number, b: number): string {
  const c = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0')
  return `#${c(r)}${c(g)}${c(b)}`.toUpperCase()
}

function shiftHex(hex: string, delta: number): string {
  const [r, g, b] = hexToRgb(hex)
  return rgbToHex(r + delta, g + delta, b + delta)
}

function sanitizeExtractedStyle(raw: ExtractedBrandStyle): ExtractedBrandStyle {
  const colors = (raw?.colors ?? {}) as ExtractedBrandStyle['colors']
  // Defaults coherentes si Claude devuelve algo inválido
  const primary    = normalizeHex(colors.primary,    '#1A1A1A')
  const secondary  = normalizeHex(colors.secondary,  shiftHex(primary, +30))
  const accent     = normalizeHex(colors.accent,     shiftHex(primary, +55))
  const dark       = normalizeHex(colors.dark,       shiftHex(primary, -65))
  const light      = normalizeHex(colors.light,      shiftHex(primary, +90))
  const background = normalizeHex(colors.background, '#FAFAFA')

  return {
    colors: { primary, secondary, accent, dark, light, background },
    visualStyle:     typeof raw.visualStyle === 'string' ? raw.visualStyle : 'moderno y limpio',
    fonts:           Array.isArray(raw.fonts) ? raw.fonts.filter(s => typeof s === 'string') : [],
    elements:        Array.isArray(raw.elements) ? raw.elements.filter(s => typeof s === 'string') : [],
    mood:            typeof raw.mood === 'string' ? raw.mood : 'profesional y confiable',
    recommendations: Array.isArray(raw.recommendations) ? raw.recommendations.filter(s => typeof s === 'string') : [],
  }
}
