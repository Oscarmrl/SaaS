import type { Job } from 'bullmq'
import Anthropic from '@anthropic-ai/sdk'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import type { JobQueuePayload } from '@brandai/shared'
import { prisma } from '../lib/prisma'
import { generateBrandVideo, type SoraSeconds, type SoraSize } from '../lib/generate-video'

const r2 = new S3Client({
  region:   'auto',
  endpoint: `https://${process.env['R2_ACCOUNT_ID']!}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId:     process.env['R2_ACCESS_KEY_ID']!,
    secretAccessKey: process.env['R2_SECRET_ACCESS_KEY']!,
  },
})

// ─── Color helpers ────────────────────────────────────────────────────────────

function isValidHex(v: unknown): v is string {
  return typeof v === 'string' && /^#[0-9A-Fa-f]{3,6}$/.test(v.trim())
}

function extractColorFromStyle(extractedStyle: unknown, key: string): string | undefined {
  try {
    const style = typeof extractedStyle === 'string'
      ? (JSON.parse(extractedStyle) as Record<string, unknown>)
      : (extractedStyle as Record<string, unknown>)
    if (!style || typeof style !== 'object') return undefined
    const colors = style['colors']
    if (!colors || typeof colors !== 'object') return undefined
    const val = (colors as Record<string, unknown>)[key]
    return isValidHex(val) ? val.trim() : undefined
  } catch {
    return undefined
  }
}

// ─── Seed determinístico desde jobId ─────────────────────────────────────────

function seedFromJobId(jobId: string): number {
  const hex = jobId.replace(/-/g, '')
  const a = parseInt(hex.slice(0, 8),   16) || 1
  const b = parseInt(hex.slice(8, 16),  16) || 1
  const c = parseInt(hex.slice(16, 24), 16) || 1
  const d = parseInt(hex.slice(24),     16) || 1
  return ((a ^ (b >>> 3) ^ (c << 5) ^ d) >>> 0) || 1
}

// ─── Anthropic client ─────────────────────────────────────────────────────────

function getAnthropicClient(): Anthropic {
  if (!process.env['ANTHROPIC_API_KEY']) throw new Error('ANTHROPIC_API_KEY is required')
  return new Anthropic({ apiKey: process.env['ANTHROPIC_API_KEY'] })
}

// ─── Script types ─────────────────────────────────────────────────────────────

export interface VideoScene {
  text:              string
  subtext?:          string
  layout:            'intro' | 'content' | 'cta'
  durationInSeconds: number
  narration?:        string
}

interface ScriptResult {
  scenes: VideoScene[]
}

function extractJson(text: string): ScriptResult {
  const attempts: Array<() => ScriptResult | null> = [
    () => JSON.parse(text) as ScriptResult,
    () => {
      const m = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/)
      return m ? JSON.parse(m[1]!) as ScriptResult : null
    },
    () => {
      const m = text.match(/\{[\s\S]*\}/)
      return m ? JSON.parse(m[0]) as ScriptResult : null
    },
  ]
  for (const attempt of attempts) {
    try {
      const result = attempt()
      if (result?.scenes?.length) return result
    } catch { /* try next */ }
  }
  throw new Error('Failed to parse video script JSON from Claude response')
}

// ─── Direcciones creativas (seed-based) ───────────────────────────────────────

const CREATIVE_DIRECTIONS = [
  'Minimalista. Silencios entre palabras. Una frase que duela o libere — nada en el medio.',
  'Urgente y visceral. Cada palabra es un puño. El lector no puede ignorarlo ni esquivarlo.',
  'Poético y sensorial. Apela a lo que el cliente siente en su cuerpo, no a lo que ve.',
  'Directo al grano: el beneficio más concreto posible. Sin adjetivos vacíos. Solo la verdad útil.',
  'Narrativo con tensión. Comienza con el problema antes que la solución. Construye hasta el remate.',
  'Conversacional íntimo. Como si hablara un amigo que ya probó el producto y no puede callarlo.',
  'Provocador. Empieza con una afirmación inesperada o una pregunta que incomoda al espectador.',
  'Cinematográfico. Escenas que se ven más que se leen. Imágenes mentales concretas, no conceptos.',
  'Emocional sin sentimentalismo. Toca un miedo real o un deseo profundo, pero sin manipulación obvia.',
  'Contrastivo. Antes / después. El mundo con y sin el producto. Que la diferencia sea obvia.',
  'Audaz e irreverente. Se permite el humor, la ironía o el autoconsciente — si la marca lo soporta.',
  'Aspiracional concreto. Muestra el resultado final exacto que el cliente puede lograr.',
]

// ─── 1. Generar script con Opus ───────────────────────────────────────────────

interface BrandContext {
  name:           string
  industry:       string
  toneOfVoice:    string
  targetAudience: string
  mood:           string
  visualStyle:    string
  primaryColor:   string
  userPrompt:     string
}

async function generateScript(
  ctx: BrandContext,
  targetSeconds: number,
  seed: number,
): Promise<ScriptResult> {
  const sceneCount    = targetSeconds <= 8 ? 2 : targetSeconds <= 15 ? 3 : 5
  const sceneDuration = Math.floor(targetSeconds / sceneCount)

  const charsMin = Math.floor(sceneDuration * 12 * 0.82)
  const charsMax = Math.floor(sceneDuration * 12 * 0.90)

  const direction = CREATIVE_DIRECTIONS[Math.abs(seed) % CREATIVE_DIRECTIONS.length]!

  const sceneLayouts = [
    'intro',
    ...Array.from({ length: sceneCount - 2 }, () => 'content'),
    'cta',
  ]
  const layoutList = sceneLayouts
    .map((l, i) => `  - Escena ${i + 1}: layout "${l}", ${sceneDuration}s`)
    .join('\n')

  const anthropic = getAnthropicClient()
  const message = await anthropic.messages.create({
    model:      'claude-opus-4-7',
    max_tokens: 2000,
    system: `Eres DIRECTOR CREATIVO de una agencia publicitaria de élite.
Escribes el copy de un spot de ${targetSeconds}s para la marca "${ctx.name}".
Color primario de marca: ${ctx.primaryColor}.
NO defines estilos visuales — solo texto y narración.

━━━━ DIRECCIÓN CREATIVA ━━━━
${direction}

━━━━ CONTEXTO DE MARCA ━━━━
Nombre:    ${ctx.name}
Industria: ${ctx.industry}
Tono base: ${ctx.toneOfVoice}
Audiencia: ${ctx.targetAudience}
Mood:      ${ctx.mood}
Estilo:    ${ctx.visualStyle}

━━━━ ESTRUCTURA — ${sceneCount} escenas ━━━━
${layoutList}

━━━━ RESTRICCIONES TÉCNICAS ━━━━
"text":      máx 26 caracteres. UN impacto visual. Sin punto final.
"subtext":   máx 52 caracteres. Solo si suma tensión real — omítelo si no vale.
"narration": EXACTAMENTE entre ${charsMin} y ${charsMax} caracteres.
             TTS español ≈ 12 chars/seg. Cuenta antes de responder.
             Prohibido: "increíble", "fantástico", "único", clichés de relleno.

━━━━ FORMATO — JSON PURO ━━━━
{
  "scenes": [
    {"text":"...","subtext":"...","layout":"intro","durationInSeconds":${sceneDuration},"narration":"..."},
    {"text":"...","layout":"cta","durationInSeconds":${sceneDuration},"narration":"..."}
  ]
}`,
    messages: [{ role: 'user', content: ctx.userPrompt }],
  })

  const block = message.content[0]
  if (!block || block.type !== 'text') throw new Error('No script returned from Opus')
  const result = extractJson(block.text)
  console.log(`[Video] Script: ${result.scenes.length} scenes — direction: "${direction.slice(0, 50)}..."`)
  return result
}

// ─── Prompt de Sora (video con audio) desde el script ─────────────────────────

const SECONDS_BY_TYPE: Record<'VIDEO_8S' | 'VIDEO_15S' | 'VIDEO_30S', SoraSeconds> = {
  // sora-2 estándar solo soporta 4/8/12s. 15s y 30s se aproximan al máximo (12s)
  // hasta que Veo 3 Fast permita duraciones largas. La duración real se guarda
  // en el asset, no la nominal del tipo.
  VIDEO_8S:  '8',
  VIDEO_15S: '12',
  VIDEO_30S: '12',
}

function buildSoraPrompt(ctx: BrandContext, scenes: VideoScene[]): string {
  const narration = scenes.map((s) => s.narration?.trim()).filter(Boolean).join(' ')
  const onScreen  = scenes.map((s) => s.text?.trim()).filter(Boolean).join(' / ')

  return [
    `Cinematic ${ctx.industry} advertisement for the brand "${ctx.name}".`,
    `Mood: ${ctx.mood}. Visual style: ${ctx.visualStyle}. Brand accent color: ${ctx.primaryColor}.`,
    `Target audience: ${ctx.targetAudience}. Tone of voice: ${ctx.toneOfVoice}.`,
    `Concept: ${ctx.userPrompt}.`,
    narration ? `Spoken voiceover in natural Latin American Spanish: "${narration}"` : '',
    onScreen  ? `On-screen text overlays: ${onScreen}.` : '',
    'High-end commercial production, smooth camera movement, professional lighting.',
  ].filter(Boolean).join('\n')
}

// ─── Job processor ────────────────────────────────────────────────────────────

export async function processVideoJob(job: Job<JobQueuePayload>): Promise<void> {
  const { jobId, userId, brandId, type, prompt } = job.data

  await prisma.generationJob.update({
    where: { id: jobId },
    data:  { status: 'PROCESSING' },
  })

  try {
    const brand = await prisma.brand.findUnique({ where: { id: brandId } })

    const extractedStyle = brand?.extractedStyle
    const fromStyle = (key: string) => extractColorFromStyle(extractedStyle, key)

    const brandColor = fromStyle('primary') ?? (isValidHex(brand?.primaryColor) ? brand!.primaryColor! : '#1A1A1A')

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const styleObj    = (typeof extractedStyle === 'object' && extractedStyle !== null) ? extractedStyle as Record<string, any> : {}
    const mood        = (styleObj['mood']        as string | undefined) ?? 'profesional y confiable'
    const visualStyle = (styleObj['visualStyle'] as string | undefined) ?? 'moderno y limpio'

    const targetSecs = type === 'VIDEO_30S' ? 30 : type === 'VIDEO_8S' ? 8 : 15
    const seed       = seedFromJobId(jobId)

    // ── 1. Script (Opus) ──────────────────────────────────────────────────────
    const ctx: BrandContext = {
      name:           brand?.name           ?? 'Mi Marca',
      industry:       brand?.industry       ?? 'general',
      toneOfVoice:    brand?.toneOfVoice    ?? 'profesional',
      targetAudience: brand?.targetAudience ?? 'público general',
      primaryColor:   brandColor,
      mood,
      visualStyle,
      userPrompt:     prompt,
    }

    const { scenes } = await generateScript(ctx, targetSecs, seed)

    // ── 2. Video con audio (Sora 2 — provider de pruebas) ─────────────────────
    // Sora 2 genera el video CON audio incorporado a partir del prompt (incluida
    // la narración del script). No se requiere TTS externo ni merge de audio.
    // Cuando Veo 3 Fast esté listo, se sustituye solo esta llamada.
    const size:    SoraSize    = (process.env['SORA_SIZE'] as SoraSize | undefined) ?? '720x1280'
    const seconds: SoraSeconds = SECONDS_BY_TYPE[type as keyof typeof SECONDS_BY_TYPE]
    const soraPrompt = buildSoraPrompt(ctx, scenes)

    console.log(`[Video] Generating ${type} with Sora — ${seconds}s @ ${size}`)
    const result = await generateBrandVideo({ prompt: soraPrompt, seconds, size })

    // ── 3. Upload a R2 (video + thumbnail) ────────────────────────────────────
    const videoKey = `users/${userId}/assets/${jobId}.mp4`
    await r2.send(new PutObjectCommand({
      Bucket:      process.env['R2_BUCKET_NAME']!,
      Key:         videoKey,
      Body:        result.video,
      ContentType: 'video/mp4',
    }))
    const publicUrl = `${process.env['R2_PUBLIC_URL']!}/${videoKey}`

    let thumbnailUrl: string | undefined
    if (result.thumbnail) {
      const thumbKey = `users/${userId}/assets/${jobId}-thumb.webp`
      await r2.send(new PutObjectCommand({
        Bucket:      process.env['R2_BUCKET_NAME']!,
        Key:         thumbKey,
        Body:        result.thumbnail,
        ContentType: 'image/webp',
      }))
      thumbnailUrl = `${process.env['R2_PUBLIC_URL']!}/${thumbKey}`
    }

    const [width, height] = size.split('x').map(Number) as [number, number]
    const provider = process.env['VIDEO_PROVIDER'] ?? result.model

    // Los créditos ya se descontaron al encolar el job — aquí solo registramos
    // el gasto (SPEND) y marcamos el job COMPLETED. NO se vuelve a decrementar.
    const jobRecord   = await prisma.generationJob.findUnique({ where: { id: jobId } })
    const creditsCost = jobRecord?.creditsRequired ?? (type === 'VIDEO_30S' ? 120 : type === 'VIDEO_8S' ? 40 : 60)

    await prisma.$transaction([
      prisma.generatedAsset.create({
        data: {
          userId,
          brandId,
          jobId,
          type,
          url:             publicUrl,
          ...(thumbnailUrl ? { thumbnailUrl } : {}),
          width,
          height,
          durationSeconds: result.seconds,
          creditsCost,
          provider,
        },
      }),
      prisma.generationJob.update({
        where: { id: jobId },
        data:  { status: 'COMPLETED', creditsCharged: creditsCost },
      }),
      prisma.creditTransaction.create({
        data: { userId, amount: -creditsCost, type: 'SPEND', description: `Generated ${type}`, assetId: jobId },
      }),
    ])

  } catch (error) {
    const jobRecord = await prisma.generationJob.findUnique({ where: { id: jobId } })
    if (jobRecord && jobRecord.status !== 'COMPLETED') {
      await prisma.$transaction([
        prisma.creditAccount.update({
          where: { userId },
          data:  { balance: { increment: jobRecord.creditsRequired } },
        }),
        prisma.generationJob.update({
          where: { id: jobId },
          data:  { status: 'FAILED', errorMessage: error instanceof Error ? error.message : 'Unknown' },
        }),
      ])
    }
    throw error
  }
}

// Exportar helpers reutilizables para cuando se implemente Veo 3
export { generateScript, seedFromJobId }
