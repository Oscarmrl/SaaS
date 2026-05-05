import type { VideoGenerationParams, GeneratedVideo } from '@brandai/shared'

export interface AIVideoProvider {
  generateVideo(params: VideoGenerationParams): Promise<GeneratedVideo>
  readonly providerName: string
}
