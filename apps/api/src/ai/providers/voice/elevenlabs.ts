import type { AIVoiceProvider } from './base'
import type { VoiceGenerationParams } from '@brandai/shared'
import { ExternalServiceError } from '../../../lib/errors'

const API_URL = 'https://api.elevenlabs.io/v1'
const DEFAULT_VOICE_ID = '21m00Tcm4TlvDq8ikWAM' // Rachel — natural, clear

export class ElevenLabsProvider implements AIVoiceProvider {
  readonly providerName = 'elevenlabs'
  private apiKey: string

  constructor() {
    if (!process.env['ELEVENLABS_API_KEY']) {
      throw new Error('ELEVENLABS_API_KEY is required')
    }
    this.apiKey = process.env['ELEVENLABS_API_KEY']
  }

  async generateVoice(params: VoiceGenerationParams): Promise<Buffer> {
    const {
      text,
      voiceId       = DEFAULT_VOICE_ID,
      stability     = 0.5,
      similarityBoost = 0.75,
    } = params

    const response = await fetch(`${API_URL}/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'xi-api-key':   this.apiKey,
        'Content-Type': 'application/json',
        'Accept':       'audio/mpeg',
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_turbo_v2',
        voice_settings: {
          stability,
          similarity_boost: similarityBoost,
        },
      }),
    })

    if (!response.ok) {
      const msg = await response.text()
      throw new ExternalServiceError('ElevenLabs', `${response.status}: ${msg}`)
    }

    const arrayBuffer = await response.arrayBuffer()
    return Buffer.from(arrayBuffer)
  }
}
