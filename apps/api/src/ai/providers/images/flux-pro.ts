import Replicate from 'replicate'
import type { AIImageProvider } from './base'
import type { ImageGenerationParams, GeneratedImage } from '@brandai/shared'
import { ExternalServiceError } from '../../../lib/errors'

const FLUX_PRO_MODEL = 'black-forest-labs/flux-pro'

export class FluxProProvider implements AIImageProvider {
  readonly providerName = 'flux-pro'
  private client: Replicate

  constructor() {
    if (!process.env['REPLICATE_API_TOKEN']) {
      throw new Error('REPLICATE_API_TOKEN is required')
    }
    this.client = new Replicate({ auth: process.env['REPLICATE_API_TOKEN'] })
  }

  async generateImage(params: ImageGenerationParams): Promise<GeneratedImage> {
    const { prompt, width = 1024, height = 1024 } = params

    let output: unknown
    try {
      output = await this.client.run(FLUX_PRO_MODEL, {
        input: {
          prompt,
          width,
          height,
          num_outputs: 1,
          guidance: 3.5,
          num_inference_steps: 28,
          output_format: 'webp',
          output_quality: 90,
        },
      })
    } catch (err) {
      throw new ExternalServiceError('Flux Pro', err instanceof Error ? err.message : 'Generation failed')
    }

    const urls = Array.isArray(output) ? output : [output]
    const imageUrl = urls[0] as string | undefined

    if (!imageUrl || typeof imageUrl !== 'string') {
      throw new ExternalServiceError('Flux Pro', 'No image URL returned')
    }

    const response = await fetch(imageUrl)
    if (!response.ok) {
      throw new ExternalServiceError('Flux Pro', `Failed to download image: ${response.status}`)
    }

    const buffer = Buffer.from(await response.arrayBuffer())

    return {
      url:      imageUrl,
      width,
      height,
      provider: this.providerName,
      buffer,
    }
  }
}
