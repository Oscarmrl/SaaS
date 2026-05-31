import type { AIVoiceProvider } from './base'
import type { VoiceGenerationParams } from '@brandai/shared'
import { ExternalServiceError } from '../../../lib/errors'

const API_URL = 'https://api.elevenlabs.io/v1'

// Voz por defecto: Daniel — tono cálido, profesional, neutro en español LATAM
// Configurable vía ELEVENLABS_VOICE_ID en .env
const DEFAULT_VOICE_ID = 'onwK4e9ZLuTAKqWW03F9'

// eleven_multilingual_v2 — mejor calidad para español, soporta múltiples acentos LATAM
const DEFAULT_MODEL = 'eleven_multilingual_v2'

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
      voiceId         = process.env['ELEVENLABS_VOICE_ID'] ?? DEFAULT_VOICE_ID,
      stability       = 0.45,
      similarityBoost = 0.80,
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
        model_id: DEFAULT_MODEL,
        voice_settings: {
          stability,
          similarity_boost:   similarityBoost,
          style:              0.30,   // algo de expresividad para publicidad
          use_speaker_boost:  true,
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
