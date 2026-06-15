import type { BrandProfile, AssetType, Platform } from '@brandai/shared'

interface PromptOptions {
  platform?: Platform
  metadata?: Record<string, unknown>
}

export function buildImagePrompt(
  brand: BrandProfile,
  userRequest: string,
  options: PromptOptions = {},
): string {
  const style = brand.extractedStyle
  const styleDesc = style ? JSON.stringify(style) : 'not analyzed yet'

  return `
Professional advertising photography for ${brand.name}.
Business type: ${brand.industry ?? 'small business'}.
Visual style: ${brand.toneOfVoice ?? 'modern and clean'}.
Color palette: primary ${brand.primaryColor ?? '#000000'}, secondary ${brand.secondaryColor ?? '#ffffff'}.
Target audience: ${brand.targetAudience ?? 'general public'}.
Extracted brand style: ${styleDesc}.
User request: ${userRequest}.
Platform: ${options.platform ?? 'all'} social media format.
Quality: high-end commercial photography, 4K, perfect lighting, professional composition.
IMPORTANT: Strictly respect the brand color palette and visual style. No elements that conflict with the brand identity.
  `.trim()
}

export function buildBannerPrompt(
  brand: BrandProfile,
  userRequest: string,
  options: PromptOptions = {},
): string {
  return `
Create a professional marketing banner for ${brand.name}.
Style: ${brand.toneOfVoice ?? 'modern'}, ${brand.industry ?? 'business'} industry.
Colors: ${brand.primaryColor ?? '#000'} and ${brand.secondaryColor ?? '#fff'}.
Message: ${userRequest}.
Platform: ${options.platform ?? 'social media'} banner, optimized dimensions.
Include: brand name, key message, call to action.
Style: clean, professional, eye-catching. No stock photo clichés.
  `.trim()
}

export function buildCaptionPrompt(
  brand: BrandProfile,
  userRequest: string,
  options: PromptOptions = {},
): string {
  const platform = options.platform ?? 'instagram'
  return `
Write a ${platform} caption for ${brand.name}.
Business: ${brand.industry ?? 'small business'} in Latin America.
Tone: ${brand.toneOfVoice ?? 'friendly and professional'}.
Target audience: ${brand.targetAudience ?? 'local customers'}.
Topic / request: ${userRequest}.
Requirements:
- In Spanish, natural and engaging
- Include 3-5 relevant hashtags at the end
- Length appropriate for ${platform}: ${platform === 'instagram' ? '150-300 characters + hashtags' : '100-200 characters'}
- Include a clear call to action
  `.trim()
}

export function buildVideoScriptPrompt(
  brand: BrandProfile,
  userRequest: string,
  durationSeconds: 8 | 15 | 30,
): string {
  const wordCount = durationSeconds === 15 ? '35-40 words' : '70-80 words'
  return `
Write a ${durationSeconds}-second video script for ${brand.name}.
Business: ${brand.industry ?? 'small business'} in Latin America.
Tone: ${brand.toneOfVoice ?? 'warm and friendly'}.
Topic: ${userRequest}.
Requirements:
- Narration in Spanish, approximately ${wordCount}
- Conversational, not robotic
- Start with a hook in the first 3 seconds
- End with a clear call to action
- Return ONLY the narration text, no stage directions
  `.trim()
}

export function buildPromptForType(
  type: AssetType,
  brand: BrandProfile,
  userRequest: string,
  options: PromptOptions = {},
): string {
  switch (type) {
    case 'IMAGE':
    case 'IMAGE_HD':
      return buildImagePrompt(brand, userRequest, options)
    case 'BANNER':
      return buildBannerPrompt(brand, userRequest, options)
    case 'CAPTION':
      return buildCaptionPrompt(brand, userRequest, options)
    case 'VIDEO_8S':
      return buildVideoScriptPrompt(brand, userRequest, 8)
    case 'VIDEO_15S':
      return buildVideoScriptPrompt(brand, userRequest, 15)
    case 'VIDEO_30S':
      return buildVideoScriptPrompt(brand, userRequest, 30)
  }
}
