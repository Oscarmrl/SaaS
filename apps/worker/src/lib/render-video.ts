import path from 'path'
import os from 'os'
import { mkdir, readFile, rm } from 'fs/promises'
import { tmpdir } from 'os'
import { randomUUID } from 'crypto'
import { bundle } from '@remotion/bundler'
import { renderMedia, selectComposition } from '@remotion/renderer'
import type { BrandVideoProps } from '../remotion/BrandVideoComposition'

// 24fps = estándar cinematográfico — 20% menos frames que 30fps, calidad idéntica para redes sociales
export const FPS = 24

// Concurrencia: cuántas instancias de Chrome renderizan frames en paralelo.
// Por defecto Remotion usa cpus()/2. Lo forzamos a usar más para máxima velocidad.
// En Railway/Docker con pocos cores, el env var permite ajustarlo por deployment.
function getConcurrency(): number {
  const fromEnv = parseInt(process.env['REMOTION_CONCURRENCY'] ?? '0')
  if (fromEnv > 0) return fromEnv
  const cpus = os.cpus().length
  return Math.max(2, Math.floor(cpus * 0.75))
}

export type { VideoScene, BrandVideoProps as VideoScript } from '../remotion/BrandVideoComposition'

// Cached bundle path — built once per worker process
let _bundlePath: string | undefined

export async function warmupBundle(): Promise<void> {
  await getBundlePath()
}

async function getBundlePath(): Promise<string> {
  if (_bundlePath) return _bundlePath

  // In dev (ts-node-dev): __dirname = src/lib → entry is src/remotion/index.tsx
  // In prod (compiled):   REMOTION_ENTRY_POINT env var points to dist/remotion/index.js
  const entryPoint =
    process.env['REMOTION_ENTRY_POINT'] ??
    path.resolve(__dirname, '../remotion/index.tsx')

  console.log(`[Remotion] Bundling from: ${entryPoint}`)
  _bundlePath = await bundle({ entryPoint })
  console.log(`[Remotion] Bundle ready`)
  return _bundlePath
}

export async function renderVideoBuffer(
  props: BrandVideoProps,
  width  = 1280,
  height = 720,
): Promise<Buffer> {
  const bundlePath  = await getBundlePath()
  const tmpDir      = path.join(tmpdir(), `brandai-${randomUUID()}`)
  await mkdir(tmpDir, { recursive: true })
  const outputPath  = path.join(tmpDir, 'output.mp4')

  try {
    const totalFrames = props.scenes.reduce(
      (sum, s) => sum + Math.round(s.durationInSeconds * FPS),
      0,
    )

    // Remotion expects Record<string, unknown> for inputProps
    const inputProps = props as unknown as Record<string, unknown>

    const composition = await selectComposition({
      serveUrl:   bundlePath,
      id:         'BrandVideo',
      inputProps,
    })

    const concurrency = getConcurrency()
    console.log(`[Remotion] concurrency: ${concurrency} | fps: ${FPS} | ${width}x${height}`)

    await renderMedia({
      composition:       { ...composition, durationInFrames: totalFrames, fps: FPS, width, height },
      serveUrl:          bundlePath,
      codec:             'h264',
      outputLocation:    outputPath,
      inputProps,
      browserExecutable: process.env['REMOTION_CHROME_EXECUTABLE'],
      concurrency,
      // ── Chromium renderer ─────────────────────────────────────────────────
      // swangle = SwiftANGLE: más rápido que el swiftshader por defecto en Linux/Docker
      // headless. Sin GPU ni cambio de calidad — solo el backend de rasterización.
      // En Mac usa el stack nativo (no afecta). Env var para sobreescribir si falla.
      chromiumOptions: {
        gl: (process.env['REMOTION_GL'] ?? 'swangle') as 'swangle' | 'swiftshader' | 'angle' | 'egl',
      },
      // ── Quality settings ──────────────────────────────────────────────────
      crf:         23,
      jpegQuality: 85,
      // ─────────────────────────────────────────────────────────────────────
      onProgress: ({ progress }) => {
        const pct = Math.round(progress * 100)
        if (pct % 10 === 0) console.log(`[Remotion] Render: ${pct}%`)
      },
    })

    return await readFile(outputPath)
  } finally {
    await rm(tmpDir, { recursive: true, force: true }).catch(() => {})
  }
}
