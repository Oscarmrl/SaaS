import path from 'path'
import { mkdir, readFile, rm } from 'fs/promises'
import { tmpdir } from 'os'
import { randomUUID } from 'crypto'
import { bundle } from '@remotion/bundler'
import { renderMedia, selectComposition } from '@remotion/renderer'
import type { BrandVideoProps } from '../remotion/BrandVideoComposition'

const FPS = 30

export type { VideoScene, BrandVideoProps as VideoScript } from '../remotion/BrandVideoComposition'

// Cached bundle path — built once per worker process
let _bundlePath: string | undefined

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

    await renderMedia({
      composition:     { ...composition, durationInFrames: totalFrames, width, height },
      serveUrl:        bundlePath,
      codec:           'h264',
      outputLocation:  outputPath,
      inputProps,
      browserExecutable: process.env['REMOTION_CHROME_EXECUTABLE'],
      onProgress: ({ progress }) => {
        const pct = Math.round(progress * 100)
        if (pct % 25 === 0) console.log(`[Remotion] Render: ${pct}%`)
      },
    })

    return await readFile(outputPath)
  } finally {
    await rm(tmpDir, { recursive: true, force: true }).catch(() => {})
  }
}
