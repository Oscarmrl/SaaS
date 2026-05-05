import Anthropic from '@anthropic-ai/sdk'
import type { AITextProvider } from './base'
import type { TextGenerationParams } from '@brandai/shared'
import { ExternalServiceError } from '../../../lib/errors'

const MODEL = 'claude-sonnet-4-6'

export class ClaudeSonnetProvider implements AITextProvider {
  readonly providerName = 'claude-sonnet'
  private client: Anthropic

  constructor() {
    if (!process.env['ANTHROPIC_API_KEY']) {
      throw new Error('ANTHROPIC_API_KEY is required')
    }
    this.client = new Anthropic({ apiKey: process.env['ANTHROPIC_API_KEY'] })
  }

  async generateText(params: TextGenerationParams): Promise<string> {
    const { prompt, systemPrompt, maxTokens = 1024, temperature = 0.7 } = params

    let response: Anthropic.Message
    try {
      response = await this.client.messages.create({
        model: MODEL,
        max_tokens: maxTokens,
        temperature,
        system: systemPrompt ?? 'You are a professional marketing copywriter for small businesses in Latin America.',
        messages: [{ role: 'user', content: prompt }],
      })
    } catch (err) {
      throw new ExternalServiceError('Claude Sonnet', err instanceof Error ? err.message : 'Text generation failed')
    }

    const block = response.content[0]
    if (!block || block.type !== 'text') {
      throw new ExternalServiceError('Claude Sonnet', 'No text content in response')
    }

    return block.text
  }
}
