// ─── Asset & Job enums ───────────────────────────────────────────────────────

export type AssetType = 'IMAGE' | 'IMAGE_HD' | 'BANNER' | 'VIDEO_8S' | 'VIDEO_15S' | 'VIDEO_30S' | 'CAPTION'
export type JobStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'
export type VideoTier = 'BASIC' | 'FULL'
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

export interface VideoGenerationParams {
  script: string
  duration: 8 | 15 | 30
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
    primary: string         // color dominante de marca (botones, CTAs, áreas grandes)
    secondary: string       // segundo color de soporte (gradientes, contraste)
    accent?: string         // pop/destacado (badges, líneas decorativas)
    background?: string     // base/canvas
    dark?: string           // tono oscuro derivado para sombras y fondos
    light?: string          // tono claro derivado para highlights
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
