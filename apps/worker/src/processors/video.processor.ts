import type { Job } from 'bullmq'
import Anthropic from '@anthropic-ai/sdk'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { execFile } from 'child_process'
import { promisify } from 'util'
import { writeFile, readFile, mkdir, rm } from 'fs/promises'
import { tmpdir } from 'os'
import { randomUUID } from 'crypto'
import path from 'path'
import type { JobQueuePayload } from '@brandai/shared'
import { renderVideoBuffer } from '../lib/render-video'
import { prisma } from '../lib/prisma'
import { generateStylesForScenes, inferSceneTypes, logStyleSummary } from '../lib/style-engine'
import type { BrandVideoProps, VideoScene } from '../remotion/BrandVideoComposition'

// eslint-disable-next-line @typescript-eslint/no-require-imports
const ffmpegPath: string | null = require('ffmpeg-static') as string | null

const execFileAsync = promisify(execFile)

const r2 = new S3Client({
  region:   'auto',
  endpoint: `https://${process.env['R2_ACCOUNT_ID']!}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId:     process.env['R2_ACCESS_KEY_ID']!,
    secretAccessKey: process.env['R2_SECRET_ACCESS_KEY']!,
  },
})

// ─── Extracción robusta de colores desde extractedStyle (Json de Prisma) ─────
// extractedStyle puede ser null, string serializado, o un objeto JSON.
// Validamos que el valor sea realmente un hex antes de usarlo.

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

// ─── Seed determinístico a partir del jobId (UUID hex → número) ───────────────
// Mezcla los 4 bloques de 8 chars del UUID con XOR + shifts para máxima entropía.
// Versión anterior solo usaba los últimos 8 chars → colisiones de seed reales.

function seedFromJobId(jobId: string): number {
  const hex = jobId.replace(/-/g, '')
  const a = parseInt(hex.slice(0, 8),   16) || 1
  const b = parseInt(hex.slice(8, 16),  16) || 1
  const c = parseInt(hex.slice(16, 24), 16) || 1
  const d = parseInt(hex.slice(24),     16) || 1
  return ((a ^ (b >>> 3) ^ (c << 5) ^ d) >>> 0) || 1
}

// ─── Pre-fetch de imágenes a data URLs ───────────────────────────────────────
// Remotion + Chromium intenta cargar imágenes via HTTP durante el render.
// Si la red se cae (o el handshake QUIC con Supabase falla), el frame se rompe.
// Pre-descargamos en Node (con retries) y pasamos data URLs al composition.
// Resultado: el render no depende de red, es más rápido y reproducible.

async function fetchAsDataUrl(url: string, attempt = 0): Promise<string | null> {
  try {
    const res = await fetch(url)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const buf  = Buffer.from(await res.arrayBuffer())
    const mime = res.headers.get('content-type') ?? (url.endsWith('.png') ? 'image/png' : 'image/jpeg')
    return `data:${mime};base64,${buf.toString('base64')}`
  } catch (err) {
    if (attempt < 2) {
      console.warn(`[Prefetch] retry ${attempt + 1} for ${url.slice(0, 60)}... (${(err as Error).message})`)
      await new Promise(r => setTimeout(r, 800 * (attempt + 1)))
      return fetchAsDataUrl(url, attempt + 1)
    }
    console.error(`[Prefetch] failed permanently for ${url.slice(0, 60)}...`)
    return null
  }
}

async function prefetchAll(urls: string[]): Promise<string[]> {
  const results = await Promise.all(urls.map(u => fetchAsDataUrl(u)))
  return results.filter((x): x is string => x !== null)
}

// ─── Anthropic client ─────────────────────────────────────────────────────────

function getAnthropicClient(): Anthropic {
  if (!process.env['ANTHROPIC_API_KEY']) throw new Error('ANTHROPIC_API_KEY is required')
  return new Anthropic({ apiKey: process.env['ANTHROPIC_API_KEY'] })
}

// ─── JSON parser robusto ──────────────────────────────────────────────────────
// Claude ahora solo devuelve scenes[] con texto/narración — sin estilos visuales.

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

// ─── Brand context ────────────────────────────────────────────────────────────

interface BrandContext {
  name:           string
  industry:       string
  toneOfVoice:    string
  targetAudience: string
  mood:           string
  visualStyle:    string
  userPrompt:     string
}

// ─── Direcciones creativas — 12 personalidades de escritura distintas ────────
// Seleccionada por seed: cada jobId produce una dirección diferente.
// Esto garantiza que el copy sea radicalmente diferente en tono y estructura
// incluso para la misma marca generada dos veces.

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

// ─── 1. Generar script con Opus — SOLO TEXTO, sin estilos ────────────────────
// Los estilos visuales los genera el style-engine (seed-based), no Claude.
// El seed selecciona la DIRECCIÓN CREATIVA que Opus recibe, garantizando
// que cada video tenga un tono narrativo genuinamente diferente.

async function generateScript(
  ctx: BrandContext,
  targetSeconds: number,
  seed: number,
): Promise<ScriptResult> {
  const sceneCount    = targetSeconds <= 15 ? 3 : 5
  const sceneDuration = Math.floor(targetSeconds / sceneCount)

  // Presupuesto de caracteres calibrado para TTS español (~12 chars/seg)
  const charsMin = Math.floor(sceneDuration * 12 * 0.82)
  const charsMax = Math.floor(sceneDuration * 12 * 0.90)

  // Dirección creativa derivada del seed — diferente por cada jobId
  const direction = CREATIVE_DIRECTIONS[Math.abs(seed) % CREATIVE_DIRECTIONS.length]!

  // Layout de las escenas (solo estructura, Opus decide el resto)
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
NO defines estilos visuales — solo texto.

━━━━ DIRECCIÓN CREATIVA (sigue esta voz, no la cambies) ━━━━
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
El copy de cada escena es decisión tuya — sigue la dirección creativa.

━━━━ RESTRICCIONES TÉCNICAS (innegociables) ━━━━
"text":      máx 26 caracteres. UN impacto visual. Sin punto final.
"subtext":   máx 52 caracteres. Solo si suma tensión real — omítelo si no vale.
"narration": EXACTAMENTE entre ${charsMin} y ${charsMax} caracteres (espacios incluidos).
             TTS español ≈ 12 chars/seg. Cuenta antes de responder.
             Prohibido: "increíble", "fantástico", "único", "lo mejor", clichés de relleno.

━━━━ FORMATO — JSON PURO, sin markdown ━━━━
{
  "scenes": [
    {"text":"...","subtext":"...","layout":"intro","durationInSeconds":${sceneDuration},"narration":"..."},
    {"text":"...","layout":"content","durationInSeconds":${sceneDuration},"narration":"..."},
    {"text":"...","subtext":"...","layout":"cta","durationInSeconds":${sceneDuration},"narration":"..."}
  ]
}`,
    messages: [{ role: 'user', content: ctx.userPrompt }],
  })

  const block = message.content[0]
  if (!block || block.type !== 'text') throw new Error('No script returned from Opus')
  const result = extractJson(block.text)

  console.log(`[Video] Opus generated ${result.scenes.length} scenes — direction: "${direction.slice(0, 60)}..."`)
  return result
}

// ─── 2. Generar audio con ElevenLabs ─────────────────────────────────────────

async function generateAudio(scenes: VideoScene[]): Promise<Buffer | null> {
  const apiKey = process.env['ELEVENLABS_API_KEY']
  if (!apiKey) {
    console.warn('[ElevenLabs] ELEVENLABS_API_KEY not set — skipping audio')
    return null
  }

  // Concatenar naraciones respetando las pausas entre escenas
  const fullNarration = scenes
    .map(s => s.narration?.trim())
    .filter(Boolean)
    .join('  ')   // doble espacio = pausa natural entre escenas en TTS

  if (!fullNarration) {
    console.warn('[ElevenLabs] No narration text in scenes — skipping audio')
    return null
  }

  const voiceId = process.env['ELEVENLABS_VOICE_ID'] ?? 'onwK4e9ZLuTAKqWW03F9' // Daniel
  const model   = 'eleven_multilingual_v2'

  console.log(`[ElevenLabs] Generating audio — voice: ${voiceId}, model: ${model}`)
  console.log(`[ElevenLabs] Narration (${fullNarration.length} chars): ${fullNarration.slice(0, 80)}...`)

  const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: 'POST',
    headers: {
      'xi-api-key':   apiKey,
      'Content-Type': 'application/json',
      'Accept':       'audio/mpeg',
    },
    body: JSON.stringify({
      text: fullNarration,
      model_id: model,
      voice_settings: {
        stability:         0.45,
        similarity_boost:  0.80,
        style:             0.30,
        use_speaker_boost: true,
      },
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error(`[ElevenLabs] Error ${response.status}: ${errorText}`)
    return null
  }

  const audioBuffer = Buffer.from(await response.arrayBuffer())
  console.log(`[ElevenLabs] Audio generated: ${(audioBuffer.length / 1024).toFixed(1)} KB`)
  return audioBuffer
}

// ─── 3a. Medir duración real del audio con FFmpeg ────────────────────────────

async function getAudioDuration(audioPath: string): Promise<number> {
  if (!ffmpegPath) throw new Error('ffmpeg-static binary not found')

  // FFmpeg imprime la duración en stderr al analizar un archivo:
  //   "Duration: 00:00:14.32, start: 0.000000, bitrate: ..."
  // Usamos -f null -  para leer sin decodificar y sin output
  try {
    await execFileAsync(ffmpegPath, ['-i', audioPath, '-f', 'null', '-'], {
      // stderr contiene la info; stdout vacío
    })
  } catch (err) {
    // ffmpeg sale con código 1 cuando no hay output stream — capturamos stderr del error
    const stderr = (err as { stderr?: string }).stderr ?? ''
    const match  = stderr.match(/Duration:\s*(\d+):(\d+):(\d+(?:\.\d+)?)/)
    if (match) {
      const [, h, m, s] = match
      return Number(h!) * 3600 + Number(m!) * 60 + Number(s!)
    }
    console.warn('[FFmpeg] Could not parse audio duration — defaulting to 0')
    return 0
  }
  return 0
}

// ─── 3b. Calcular factor atempo para ajuste de velocidad ─────────────────────

// El filtro atempo de FFmpeg solo acepta valores entre 0.5 y 2.0
// Para factores fuera de rango se encadenan múltiples filtros
function buildAtempoFilter(factor: number): string {
  const clamped = Math.max(0.5, Math.min(2.0, factor))
  if (Math.abs(clamped - factor) > 0.001) {
    // Factor fuera de rango: encadenar dos filtros (ej. 0.3 = atempo=0.5,atempo=0.6)
    const stage1 = factor < 0.5 ? 0.5 : 2.0
    const stage2 = factor / stage1
    const s2clamped = Math.max(0.5, Math.min(2.0, stage2))
    return `atempo=${stage1.toFixed(3)},atempo=${s2clamped.toFixed(3)}`
  }
  return `atempo=${clamped.toFixed(3)}`
}

// ─── 3c. Fusionar video + audio con FFmpeg (con ajuste de velocidad) ─────────

async function mergeAudioVideo(
  videoBuffer:   Buffer,
  audioBuffer:   Buffer,
  targetSeconds: number,
): Promise<Buffer> {
  if (!ffmpegPath) throw new Error('ffmpeg-static binary not found')

  const tmpDir     = path.join(tmpdir(), `brandai-merge-${randomUUID()}`)
  const videoPath  = path.join(tmpDir, 'video.mp4')
  const audioPath  = path.join(tmpDir, 'audio.mp3')
  const outputPath = path.join(tmpDir, 'final.mp4')

  await mkdir(tmpDir, { recursive: true })

  try {
    await writeFile(videoPath, videoBuffer)
    await writeFile(audioPath, audioBuffer)

    // ── Medir duración real del audio y calcular factor de ajuste ───────────
    const audioDuration = await getAudioDuration(audioPath)
    console.log(`[FFmpeg] Audio duration: ${audioDuration.toFixed(2)}s / Target: ${targetSeconds}s`)

    // atempoFactor > 1 → acelerar; < 1 → ralentizar
    // Tolerancia ±2%: no ajustar si el audio ya está dentro del rango
    const tolerance   = 0.02
    const rawFactor   = audioDuration > 0 ? audioDuration / targetSeconds : 1
    const needsAdjust = Math.abs(rawFactor - 1) > tolerance

    let audioFilter: string
    if (needsAdjust) {
      const atempoStr = buildAtempoFilter(rawFactor)
      // apad rellena silencio si tras el ajuste el audio sigue siendo más corto
      audioFilter = `${atempoStr},apad`
      console.log(`[FFmpeg] Applying atempo=${rawFactor.toFixed(3)} (${atempoStr})`)
    } else {
      audioFilter = 'apad'
      console.log(`[FFmpeg] Audio within ±2% tolerance — no atempo needed`)
    }

    // -c:v copy   → no re-encode video (preserva calidad y velocidad)
    // -c:a aac    → codifica audio como AAC (compatible con MP4)
    // -b:a 192k   → bitrate de alta calidad
    // -map 0:v:0  → stream de video del primer input
    // -map 1:a:0  → stream de audio del segundo input
    // -af atempo  → ajusta velocidad del audio para igualar duración del video
    // -af apad    → rellena con silencio si el audio es ligeramente más corto
    // -shortest   → corta al stream más corto (video define la longitud final)
    await execFileAsync(ffmpegPath, [
      '-i', videoPath,
      '-i', audioPath,
      '-c:v', 'copy',
      '-c:a', 'aac',
      '-b:a', '192k',
      '-map', '0:v:0',
      '-map', '1:a:0',
      '-af', audioFilter,
      '-shortest',
      '-y',
      outputPath,
    ])

    const result = await readFile(outputPath)
    console.log(`[FFmpeg] Merged video: ${(result.length / 1024 / 1024).toFixed(2)} MB`)
    return result
  } finally {
    await rm(tmpDir, { recursive: true, force: true }).catch(() => {})
  }
}

// ─── Job processor principal ──────────────────────────────────────────────────

export async function processVideoJob(job: Job<JobQueuePayload>): Promise<void> {
  const { jobId, userId, brandId, type, prompt } = job.data

  await prisma.generationJob.update({
    where: { id: jobId },
    data:  { status: 'PROCESSING' },
  })

  try {
    const brand = await prisma.brand.findUnique({ where: { id: brandId } })

    // ── Extraer identidad completa de la marca (extracción robusta) ────────────
    const extractedStyle = brand?.extractedStyle

    // extractColorFromStyle valida el formato hex antes de usarlo
    const fromStyle = (key: string) => extractColorFromStyle(extractedStyle, key)

    // Prioridad: extractedStyle.colors.X → brand.primaryColor/secondaryColor → fallback neutro
    const brandColor     = fromStyle('primary')   ?? (isValidHex(brand?.primaryColor)   ? brand!.primaryColor!   : '#1A1A1A')
    const secondaryColor = fromStyle('secondary') ?? (isValidHex(brand?.secondaryColor) ? brand!.secondaryColor! : undefined)
    const accentColor    = fromStyle('accent')    ?? undefined

    // mood y visualStyle también vienen del extractedStyle
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const styleObj  = (typeof extractedStyle === 'object' && extractedStyle !== null) ? extractedStyle as Record<string, any> : {}
    const mood      = (styleObj['mood']        as string | undefined) ?? 'profesional y confiable'
    const visualStyle = (styleObj['visualStyle'] as string | undefined) ?? 'moderno y limpio'

    console.log(`[Video] Brand colors — primary: ${brandColor} | secondary: ${secondaryColor ?? 'n/a'} | accent: ${accentColor ?? 'n/a'}`)
    console.log(`[Video] extractedStyle present: ${extractedStyle != null}, primaryColor DB: ${brand?.primaryColor ?? 'null'}`)

    const targetSecs = type === 'VIDEO_30S' ? 30 : 15

    // ── Seed determinístico — cada jobId produce una animación diferente ─────
    const seed = seedFromJobId(jobId)
    console.log(`[Video] Seed: ${seed} (from jobId: ${jobId})`)

    // ── 1. Generar script visual + narración con Opus ───────────────────────
    const ctx: BrandContext = {
      name:           brand?.name           ?? 'Mi Marca',
      industry:       brand?.industry       ?? 'general',
      toneOfVoice:    brand?.toneOfVoice    ?? 'profesional',
      targetAudience: brand?.targetAudience ?? 'público general',
      mood,
      visualStyle,
      userPrompt:     prompt,
    }

    console.log(`[Video] Generating script for "${ctx.name}" — ${targetSecs}s — direction #${Math.abs(seed) % CREATIVE_DIRECTIONS.length}`)
    const { scenes } = await generateScript(ctx, targetSecs, seed)
    console.log(`[Video] Script ready: ${scenes.length} scenes`)

    // ── 2. Generar estilos con el motor de seed (NO Claude) ──────────────────
    // Aquí está la diferencia clave: el style engine garantiza variedad real.
    // Claude tiene sesgos y siempre elige combinaciones similares.
    // El motor LCG con el seed del jobId produce resultados únicos por video.
    const referenceImageUrls = brand?.referenceImageUrls ?? []
    const sceneTypes         = inferSceneTypes(scenes)
    const sceneStyles        = generateStylesForScenes({
      seed,
      sceneTypes,
      hasMultipleImages: referenceImageUrls.length >= 2,
    })
    logStyleSummary(sceneStyles)

    // ── 3a. Pre-descargar imágenes y generar audio en PARALELO ───────────────
    // El audio solo necesita las escenas (ya listas). La descarga de imágenes
    // y la llamada a ElevenLabs son independientes entre sí — corren juntas.
    console.log(`[Video] Pre-fetching ${referenceImageUrls.length} images + generating audio in parallel...`)
    const [[prefetchedRefs, prefetchedLogo], audioBuffer] = await Promise.all([
      Promise.all([
        prefetchAll(referenceImageUrls),
        brand?.logoUrl ? fetchAsDataUrl(brand.logoUrl) : Promise.resolve(null),
      ]),
      generateAudio(scenes).catch((err: unknown) => {
        console.error('[ElevenLabs] Unexpected error — video will be silent:', err)
        return null
      }),
    ])
    console.log(`[Video] Prefetched ${prefetchedRefs.length}/${referenceImageUrls.length} refs, logo: ${prefetchedLogo ? 'ok' : 'none'}, audio: ${audioBuffer ? `${(audioBuffer.length / 1024).toFixed(0)} KB` : 'none'}`)

    // ── 3b. Renderizar video con Remotion (audio ya listo cuando termine) ─────
    const props: BrandVideoProps = {
      scenes,
      brandColor,
      secondaryColor,
      accentColor,
      brandName:          brand?.name,
      logoUrl:            prefetchedLogo ?? brand?.logoUrl ?? undefined,
      referenceImageUrls: prefetchedRefs.length > 0 ? prefetchedRefs : referenceImageUrls,
      seed,
      sceneStyles,
    }

    console.log('[Video] Rendering with Remotion...')
    const videoBuffer = await renderVideoBuffer(props, 1280, 720)
    console.log(`[Video] Rendered: ${(videoBuffer.length / 1024 / 1024).toFixed(2)} MB`)

    let finalBuffer = videoBuffer

    // ── 5. Fusionar video + audio con FFmpeg (ajuste de velocidad incluido) ──
    if (audioBuffer) {
      console.log('[FFmpeg] Merging audio + video...')
      finalBuffer = await mergeAudioVideo(videoBuffer, audioBuffer, targetSecs).catch((err: unknown) => {
        console.error('[FFmpeg] Merge failed — uploading silent video:', err)
        return videoBuffer
      })
    }

    // ── 6. Subir a R2 ────────────────────────────────────────────────────────
    const key = `users/${userId}/assets/${jobId}.mp4`
    await r2.send(new PutObjectCommand({
      Bucket:      process.env['R2_BUCKET_NAME']!,
      Key:         key,
      Body:        finalBuffer,
      ContentType: 'video/mp4',
    }))

    const publicUrl = `${process.env['R2_PUBLIC_URL']!}/${key}`
    const jobRecord = await prisma.generationJob.findUnique({ where: { id: jobId } })
    const creditsCost = jobRecord?.creditsRequired ?? (type === 'VIDEO_30S' ? 35 : 20)

    await prisma.$transaction([
      prisma.generatedAsset.create({
        data: {
          userId,
          brandId,
          jobId,
          type,
          url:             publicUrl,
          width:           1280,
          height:          720,
          durationSeconds: targetSecs,
          creditsCost,
          provider:        'remotion+elevenlabs',
        },
      }),
      prisma.generationJob.update({
        where: { id: jobId },
        data:  { status: 'COMPLETED', creditsCharged: creditsCost },
      }),
      prisma.creditTransaction.create({
        data: {
          userId,
          amount:      -creditsCost,
          type:        'SPEND',
          description: `Generated ${type}`,
          assetId:     jobId,
        },
      }),
    ])

    console.log(`[Video] Job ${jobId} completed — ${publicUrl}`)

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
