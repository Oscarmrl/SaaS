// ─── Asset & Job enums ───────────────────────────────────────────────────────

export type AssetType = 'IMAGE' | 'BANNER' | 'VIDEO_15S' | 'VIDEO_30S' | 'CAPTION'
export type JobStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'
export type TransactionType = 'PURCHASE' | 'SPEND' | 'REFUND' | 'BONUS'
export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED'
export type CreditPack = 'SEED' | 'BUSINESS' | 'PRO' | 'AGENCY'
export type Platform = 'instagram' | 'facebook' | 'whatsapp' | 'tiktok' | 'all'
export type Industry = 'cafe' | 'restaurant' | 'retail' | 'services' | 'other'
export type ToneOfVoice = 'warm' | 'modern' | 'elegant' | 'cheerful' | 'rustic'

// ─── AI Provider interfaces ───────────────────────────────────────────────────

export interface ImageGenerationParams {
  prompt: string
  width?: number
  height?: number
  numImages?: number
  platform?: Platform
}

export interface GeneratedImage {
  url: string
  width: number
  height: number
  provider: string
  buffer?: Buffer
}

export interface TextGenerationParams {
  prompt: string
  systemPrompt?: string
  maxTokens?: number
  temperature?: number
}

export interface VoiceGenerationParams {
  text: string
  voiceId?: string
  stability?: number
  similarityBoost?: number
}

export interface VideoGenerationParams {
  script: string
  audioBuffer?: Buffer
  duration: 15 | 30
  brand: {
    primaryColor: string
    secondaryColor: string
    name: string
    logoUrl?: string
  }
  platform?: Platform
}

export interface GeneratedVideo {
  url: string
  thumbnailUrl: string
  durationSeconds: number
  provider: string
}

// ─── Domain types ─────────────────────────────────────────────────────────────

export interface UserContext {
  id: string
  supabaseId: string
  email: string
  name: string | null
}

export interface BrandProfile {
  id: string
  userId: string
  name: string
  description: string | null
  industry: string | null
  toneOfVoice: string | null
  targetAudience: string | null
  primaryColor: string | null
  secondaryColor: string | null
  fonts: string | null
  logoUrl: string | null
  referenceImageUrls: string[]
  extractedStyle: Record<string, unknown> | null
}

export interface ExtractedBrandStyle {
  colors: {
    primary: string
    secondary: string
    accent?: string
    background?: string
  }
  visualStyle: string
  fonts: string[]
  elements: string[]
  mood: string
  recommendations: string[]
}

export interface CreditAccountInfo {
  balance: number
  lifetimeCredits: number
}

export interface JobQueuePayload {
  jobId: string
  userId: string
  brandId: string
  type: AssetType
  prompt: string
  provider: string
  metadata?: Record<string, unknown>
}

// ─── API response types ───────────────────────────────────────────────────────

export interface ApiError {
  error: string
  message: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
}
