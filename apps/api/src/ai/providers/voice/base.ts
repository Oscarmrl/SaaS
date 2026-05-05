import type { VoiceGenerationParams } from '@brandai/shared'

export interface AIVoiceProvider {
  generateVoice(params: VoiceGenerationParams): Promise<Buffer>
  readonly providerName: string
}
