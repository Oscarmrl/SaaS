import type { TextGenerationParams } from '@brandai/shared'

export interface AITextProvider {
  generateText(params: TextGenerationParams): Promise<string>
  readonly providerName: string
}
