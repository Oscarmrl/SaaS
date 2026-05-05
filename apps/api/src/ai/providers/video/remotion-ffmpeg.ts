import type { AIVideoProvider } from './base'
import type { VideoGenerationParams, GeneratedVideo } from '@brandai/shared'
import { ExternalServiceError } from '../../../lib/errors'

// Remotion + FFmpeg rendering happens in the worker service.
// This provider delegates to the worker via an internal HTTP call.
const WORKER_URL = process.env['WORKER_INTERNAL_URL'] ?? 'http://worker:3002'

export class RemotionFfmpegProvider implements AIVideoProvider {
  readonly providerName = 'remotion-ffmpeg'

  async generateVideo(params: VideoGenerationParams): Promise<GeneratedVideo> {
    const response = await fetch(`${WORKER_URL}/render`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
      signal: AbortSignal.timeout(300_000), // 5 min timeout
    })

    if (!response.ok) {
      const msg = await response.text()
      throw new ExternalServiceError('Remotion/FFmpeg', `${response.status}: ${msg}`)
    }

    return response.json() as Promise<GeneratedVideo>
  }
}
