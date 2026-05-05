import Anthropic from '@anthropic-ai/sdk'
import type { AITextProvider } from './base'
import type { TextGenerationParams, ExtractedBrandStyle } from '@brandai/shared'
import { ExternalServiceError } from '../../../lib/errors'

const MODEL = 'claude-haiku-4-5-20251001'

export class ClaudeHaikuProvider implements AITextProvider {
  readonly providerName = 'claude-haiku'
  private client: Anthropic

  constructor() {
    if (!process.env['ANTHROPIC_API_KEY']) {
      throw new Error('ANTHROPIC_API_KEY is required')
    }
    this.client = new Anthropic({ apiKey: process.env['ANTHROPIC_API_KEY'] })
  }

  async generateText(params: TextGenerationParams): Promise<string> {
    const { prompt, systemPrompt, maxTokens = 512 } = params

    let response: Anthropic.Message
    try {
      response = await this.client.messages.create({
        model: MODEL,
        max_tokens: maxTokens,
        system: systemPrompt ?? 'You are a brand identity analyst. Always respond with valid JSON.',
        messages: [{ role: 'user', content: prompt }],
      })
    } catch (err) {
      throw new ExternalServiceError('Claude Haiku', err instanceof Error ? err.message : 'Analysis failed')
    }

    const block = response.content[0]
    if (!block || block.type !== 'text') {
      throw new ExternalServiceError('Claude Haiku', 'No text content in response')
    }

    return block.text
  }

  async analyzeBrandImages(imageUrls: string[]): Promise<ExtractedBrandStyle> {
    const imageContents: Anthropic.ImageBlockParam[] = await Promise.all(
      imageUrls.map(async (url) => {
        const res = await fetch(url)
        const buf = await res.arrayBuffer()
        const base64 = Buffer.from(buf).toString('base64')
        const mime = res.headers.get('content-type') ?? 'image/jpeg'
        return {
          type: 'image' as const,
          source: {
            type: 'base64' as const,
            media_type: mime as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp',
            data: base64,
          },
        }
      }),
    )

    let response: Anthropic.Message
    try {
      response = await this.client.messages.create({
        model: MODEL,
        max_tokens: 1024,
        system: `You are a brand identity analyst. Analyze images and extract visual information.
Always respond with a valid JSON object matching this exact structure:
{
  "colors": { "primary": "#hex", "secondary": "#hex", "accent": "#hex", "background": "#hex" },
  "visualStyle": "string describing the overall style",
  "fonts": ["detected font or style description"],
  "elements": ["recurring visual elements"],
  "mood": "brand mood description",
  "recommendations": ["actionable recommendations for AI image generation"]
}`,
        messages: [
          {
            role: 'user',
            content: [
              ...imageContents,
              {
                type: 'text',
                text: 'Analyze these brand images and extract the visual identity information. Focus on colors, style, and what makes this brand unique.',
              },
            ],
          },
        ],
      })
    } catch (err) {
      throw new ExternalServiceError('Claude Haiku', err instanceof Error ? err.message : 'Brand analysis failed')
    }

    const block = response.content[0]
    if (!block || block.type !== 'text') {
      throw new ExternalServiceError('Claude Haiku', 'No response from brand analysis')
    }

    try {
      const jsonMatch = block.text.match(/\{[\s\S]*\}/)
      if (!jsonMatch?.[0]) throw new Error('No JSON found')
      return JSON.parse(jsonMatch[0]) as ExtractedBrandStyle
    } catch {
      throw new ExternalServiceError('Claude Haiku', 'Failed to parse brand analysis response')
    }
  }
}
