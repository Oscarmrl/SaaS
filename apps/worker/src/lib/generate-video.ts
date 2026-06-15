// ─── Generación de video — provider conmutable por VIDEO_PROVIDER ─────────────
//
// Dos providers de PRUEBAS mientras se integra Veo 3 Fast:
//   • sora-2 (OpenAI)  → video CON audio incorporado. Requiere OPENAI_API_KEY
//                        y acceso a la Videos API (verificación de org).
//   • wan    (HuggingFace, modelo Wan 2.2 vía fal-ai) → video MUDO (sin audio).
//                        Requiere HF_TOKEN con billing para el provider fal-ai.
//
// Ambos exponen `generateBrandVideo()` y devuelven el mismo shape. Para Veo 3
// solo se añade otra rama aquí. La narración del script alimenta el prompt en
// los dos casos; con Wan no habrá voz (limitación del modelo).
//
// Sin SDK para Sora (fetch puro). Para HF se usa @huggingface/inference, que es
// ESM-only: se carga con un dynamic import que TS no transpila a require().

const OPENAI_API = 'https://api.openai.com/v1'
const GEMINI_API = 'https://generativelanguage.googleapis.com/v1beta'

// sora-2 estándar soporta duraciones "4" | "8" | "12" (segundos, como STRING).
export type SoraSeconds = '4' | '8' | '12'
// Resoluciones 720p (tier más barato). Portrait por defecto para redes sociales.
export type SoraSize = '720x1280' | '1280x720'

export interface VideoResult {
  video:     Buffer
  thumbnail: Buffer | null
  model:     string
  seconds:   number
  size:      SoraSize
  hasAudio:  boolean
}

export interface VideoGenOpts {
  prompt:  string
  seconds: SoraSeconds
  size:    SoraSize
}

// ─── Dispatcher ───────────────────────────────────────────────────────────────

export async function generateBrandVideo(opts: VideoGenOpts): Promise<VideoResult> {
  const provider = process.env['VIDEO_PROVIDER'] ?? 'veo3-fast'

  if (provider.startsWith('veo')) {
    return generateVeo(opts)
  }

  if (provider.startsWith('wan') || provider === 'huggingface' || provider === 'hf') {
    const model = process.env['HF_VIDEO_MODEL'] ?? 'Wan-AI/Wan2.2-TI2V-5B'
    const video = await generateWanHF(opts.prompt)
    return { video, thumbnail: null, model, seconds: Number(opts.seconds), size: opts.size, hasAudio: false }
  }

  return generateSora(opts)
}

// ─── Provider: Google Veo 3 (Gemini API) — video con audio nativo ─────────────

interface VeoOperation {
  name?:  string
  done?:  boolean
  error?: { message?: string } | null
  response?: {
    generateVideoResponse?: {
      generatedSamples?:       Array<{ video?: { uri?: string } }>
      raiMediaFilteredReasons?: string[]
    }
  }
}

function geminiKey(): string {
  const key = process.env['GEMINI_API_KEY'] ?? process.env['GOOGLE_API_KEY']
  if (!key) throw new Error('GEMINI_API_KEY (o GOOGLE_API_KEY) env var is required for the Veo video provider')
  return key
}

async function generateVeo(opts: VideoGenOpts): Promise<VideoResult> {
  const key        = geminiKey()
  const model      = process.env['VEO_MODEL']      ?? 'veo-3.1-fast-generate-preview'
  const aspect     = process.env['VEO_ASPECT']     ?? (opts.size === '1280x720' ? '16:9' : '9:16')
  const resolution = process.env['VEO_RESOLUTION'] ?? '720p'
  // Veo solo admite duraciones "4" | "6" | "8". Cualquier otra (p.ej. 12) → 8.
  const seconds    = ['4', '6', '8'].includes(opts.seconds) ? opts.seconds : '8'

  const headers = { 'x-goog-api-key': key, 'Content-Type': 'application/json' }

  // 1. Lanzar la operación de larga duración ────────────────────────────────────
  console.log(`[Veo] predictLongRunning — model=${model} aspect=${aspect} res=${resolution} seconds=${seconds}`)
  const startRes = await fetch(`${GEMINI_API}/models/${model}:predictLongRunning`, {
    method:  'POST',
    headers,
    body:    JSON.stringify({
      instances:  [{ prompt: opts.prompt }],
      parameters: { aspectRatio: aspect, resolution, durationSeconds: seconds },
    }),
    signal:  AbortSignal.timeout(60_000),
  })
  if (!startRes.ok) throw new Error(`Veo start failed ${startRes.status}: ${await readError(startRes)}`)
  let op = (await startRes.json()) as VeoOperation
  if (!op.name) throw new Error('Veo did not return an operation name')
  console.log(`[Veo] operation: ${op.name}`)

  // 2. Poll hasta done ──────────────────────────────────────────────────────────
  const startedAt = Date.now()
  const timeoutMs = Number(process.env['VEO_TIMEOUT_MS'] ?? 10 * 60_000) // 10 min
  const pollMs    = Number(process.env['VEO_POLL_MS'] ?? 10_000)

  while (!op.done) {
    if (Date.now() - startedAt > timeoutMs) {
      throw new Error(`Veo generation timed out after ${Math.round(timeoutMs / 1000)}s (${op.name})`)
    }
    await new Promise((r) => setTimeout(r, pollMs))
    const pollRes = await fetch(`${GEMINI_API}/${op.name}`, { headers, signal: AbortSignal.timeout(60_000) })
    if (!pollRes.ok) throw new Error(`Veo poll failed ${pollRes.status}: ${await readError(pollRes)}`)
    op = (await pollRes.json()) as VeoOperation
    console.log(`[Veo] poll @${Math.round((Date.now() - startedAt) / 1000)}s — done=${op.done ?? false}`)
  }

  if (op.error) throw new Error(`Veo generation failed: ${op.error.message ?? 'unknown'}`)

  const gvr = op.response?.generateVideoResponse
  const uri = gvr?.generatedSamples?.[0]?.video?.uri
  if (!uri) {
    const filtered = gvr?.raiMediaFilteredReasons?.join('; ')
    throw new Error(`Veo returned no video${filtered ? ` (filtrado por seguridad: ${filtered})` : ''}`)
  }

  // 3. Descargar el MP4 (la uri requiere la API key) ────────────────────────────
  console.log(`[Veo] completed — downloading video`)
  const dlRes = await fetch(uri, { headers: { 'x-goog-api-key': key }, signal: AbortSignal.timeout(120_000) })
  if (!dlRes.ok) throw new Error(`Veo download failed ${dlRes.status}: ${await readError(dlRes)}`)
  const video = Buffer.from(await dlRes.arrayBuffer())
  console.log(`[Veo] downloaded video=${video.length}B`)

  return { video, thumbnail: null, model, seconds: Number(seconds), size: opts.size, hasAudio: true }
}

// ─── Provider: HuggingFace / Wan 2.2 (fal-ai) — video mudo ─────────────────────

// @huggingface/inference es ESM-only; el worker compila a CommonJS. Este wrapper
// evita que TS convierta el import() dinámico en require() (ERR_REQUIRE_ESM).
// eslint-disable-next-line @typescript-eslint/no-implied-eval
const importESM = new Function('s', 'return import(s)') as (s: string) => Promise<any>

async function generateWanHF(prompt: string): Promise<Buffer> {
  const token = process.env['HF_TOKEN']
  if (!token) throw new Error('HF_TOKEN env var is required for the huggingface video provider')

  const model   = process.env['HF_VIDEO_MODEL']    ?? 'Wan-AI/Wan2.2-TI2V-5B'
  const backend = process.env['HF_VIDEO_PROVIDER']  ?? 'fal-ai'

  console.log(`[HF] textToVideo — model=${model} provider=${backend}`)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { InferenceClient } = (await importESM('@huggingface/inference')) as any
  const client = new InferenceClient(token)

  const blob: Blob = await client.textToVideo({ provider: backend, model, inputs: prompt })
  const buffer = Buffer.from(await blob.arrayBuffer())
  console.log(`[HF] video received: ${buffer.length}B`)
  return buffer
}

// ─── Provider: OpenAI Sora 2 — video con audio ────────────────────────────────

interface VideoJob {
  id:        string
  status:    'queued' | 'in_progress' | 'completed' | 'failed'
  progress?: number
  error?:    { message?: string } | null
}

function authHeaders(): Record<string, string> {
  const key = process.env['OPENAI_API_KEY']
  if (!key) throw new Error('OPENAI_API_KEY env var is required for the sora-2 video provider')
  return { Authorization: `Bearer ${key}` }
}

async function readError(res: Response): Promise<string> {
  return res.text().catch(() => res.statusText)
}

async function generateSora(opts: VideoGenOpts): Promise<VideoResult> {
  const model = process.env['SORA_MODEL'] ?? 'sora-2'

  // 1. Crear el job ───────────────────────────────────────────────────────────
  console.log(`[Sora] POST /videos — model=${model} size=${opts.size} seconds=${opts.seconds}`)
  const createRes = await fetch(`${OPENAI_API}/videos`, {
    method:  'POST',
    headers: { ...authHeaders(), 'Content-Type': 'application/json' },
    body:    JSON.stringify({ model, prompt: opts.prompt, size: opts.size, seconds: opts.seconds }),
    signal:  AbortSignal.timeout(60_000),
  })
  if (!createRes.ok) throw new Error(`Sora create failed ${createRes.status}: ${await readError(createRes)}`)
  let job = (await createRes.json()) as VideoJob
  console.log(`[Sora] job created: id=${job.id} status=${job.status}`)

  // 2. Poll hasta estado terminal ───────────────────────────────────────────────
  const startedAt = Date.now()
  const timeoutMs = Number(process.env['SORA_TIMEOUT_MS'] ?? 10 * 60_000) // 10 min
  const pollMs    = Number(process.env['SORA_POLL_MS'] ?? 5_000)

  while (job.status === 'queued' || job.status === 'in_progress') {
    if (Date.now() - startedAt > timeoutMs) {
      throw new Error(`Sora generation timed out after ${Math.round(timeoutMs / 1000)}s (job ${job.id})`)
    }
    await new Promise((r) => setTimeout(r, pollMs))
    const pollRes = await fetch(`${OPENAI_API}/videos/${job.id}`, {
      headers: authHeaders(),
      signal:  AbortSignal.timeout(60_000),
    })
    if (!pollRes.ok) throw new Error(`Sora poll failed ${pollRes.status}: ${await readError(pollRes)}`)
    job = (await pollRes.json()) as VideoJob
    const elapsed = Math.round((Date.now() - startedAt) / 1000)
    console.log(`[Sora] poll @${elapsed}s — status=${job.status}${typeof job.progress === 'number' ? ` progress=${job.progress}%` : ''}`)
  }

  if (job.status !== 'completed') {
    throw new Error(`Sora generation failed: ${job.error?.message ?? job.status} (job ${job.id})`)
  }

  // 3. Descargar MP4 + thumbnail ────────────────────────────────────────────────
  console.log(`[Sora] completed — downloading content (job ${job.id})`)
  const video     = await downloadContent(job.id, 'video')
  const thumbnail = await downloadContent(job.id, 'thumbnail').catch(() => null)
  console.log(`[Sora] downloaded video=${video.length}B thumbnail=${thumbnail?.length ?? 0}B`)

  return { video, thumbnail, model, seconds: Number(opts.seconds), size: opts.size, hasAudio: true }
}

async function downloadContent(id: string, variant: 'video' | 'thumbnail'): Promise<Buffer> {
  const url = variant === 'thumbnail'
    ? `${OPENAI_API}/videos/${id}/content?variant=thumbnail`
    : `${OPENAI_API}/videos/${id}/content`
  const res = await fetch(url, { headers: authHeaders(), signal: AbortSignal.timeout(120_000) })
  if (!res.ok) throw new Error(`Sora download (${variant}) failed ${res.status}: ${await readError(res)}`)
  return Buffer.from(await res.arrayBuffer())
}
