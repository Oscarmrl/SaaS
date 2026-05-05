import type { ImageGenerationParams, GeneratedImage } from '@brandai/shared'

export interface AIImageProvider {
  generateImage(params: ImageGenerationParams): Promise<GeneratedImage>
  readonly providerName: string
}
