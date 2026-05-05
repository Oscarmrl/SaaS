import type { AssetType, CreditPack } from './types'

export const CREDIT_COSTS: Record<AssetType | 'BRAND_ANALYSIS', number> = {
  IMAGE:          10,
  BANNER:          8,
  VIDEO_15S:      20,
  VIDEO_30S:      35,
  CAPTION:         3,
  BRAND_ANALYSIS:  2,
} as const

export const CREDIT_PACKS: Record<CreditPack, { credits: number; priceUsd: number; label: string }> = {
  SEED:     { credits:   80, priceUsd:  8, label: 'Semilla' },
  BUSINESS: { credits:  220, priceUsd: 18, label: 'Negocio' },
  PRO:      { credits:  500, priceUsd: 35, label: 'Pro' },
  AGENCY:   { credits: 1300, priceUsd: 70, label: 'Agencia' },
} as const

export const ASSET_DIMENSIONS: Record<string, { width: number; height: number }> = {
  'instagram-square':   { width: 1080, height: 1080 },
  'instagram-portrait': { width: 1080, height: 1350 },
  'instagram-story':    { width: 1080, height: 1920 },
  'facebook-post':      { width: 1200, height: 630 },
  'facebook-story':     { width: 1080, height: 1920 },
  'whatsapp-status':    { width: 1080, height: 1920 },
  default:              { width: 1024, height: 1024 },
} as const

export const SUPPORTED_INDUSTRIES = [
  { value: 'cafe',       label: 'Café / Cafetería' },
  { value: 'restaurant', label: 'Restaurante' },
  { value: 'retail',     label: 'Tienda / Retail' },
  { value: 'services',   label: 'Servicios' },
  { value: 'other',      label: 'Otro' },
] as const

export const TONE_OPTIONS = [
  { value: 'warm',     label: 'Cálido y artesanal' },
  { value: 'modern',   label: 'Moderno y minimalista' },
  { value: 'elegant',  label: 'Elegante y premium' },
  { value: 'cheerful', label: 'Alegre y colorido' },
  { value: 'rustic',   label: 'Rústico y natural' },
] as const

export const PLATFORM_OPTIONS = [
  { value: 'instagram', label: 'Instagram' },
  { value: 'facebook',  label: 'Facebook' },
  { value: 'whatsapp',  label: 'WhatsApp Business' },
  { value: 'tiktok',    label: 'TikTok' },
] as const

export const QUEUE_NAMES = {
  GENERATION: 'generation',
} as const
