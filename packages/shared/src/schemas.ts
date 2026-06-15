import { z } from 'zod'

// ─── Brand ───────────────────────────────────────────────────────────────────

export const CreateBrandSchema = z.object({
  name:                z.string().min(1).max(100),
  description:         z.string().max(500).optional(),
  industry:            z.enum(['cafe', 'restaurant', 'retail', 'services', 'other']).optional(),
  toneOfVoice:         z.enum(['warm', 'modern', 'elegant', 'cheerful', 'rustic']).optional(),
  targetAudience:      z.string().max(200).optional(),
  platforms:           z.array(z.enum(['instagram', 'facebook', 'whatsapp', 'tiktok'])).optional(),
  logoUrl:             z.string().url().optional(),
  referenceImageUrls:  z.array(z.string().url()).optional(),
})

export const UpdateBrandSchema = CreateBrandSchema.partial().extend({
  logoUrl: z.string().url().nullable().optional(),
})

export type CreateBrandInput = z.infer<typeof CreateBrandSchema>
export type UpdateBrandInput = z.infer<typeof UpdateBrandSchema>

// ─── Generation ──────────────────────────────────────────────────────────────

export const GenerateAssetSchema = z.object({
  brandId:    z.string().uuid(),
  type:       z.enum(['IMAGE', 'IMAGE_HD', 'BANNER', 'VIDEO_8S', 'VIDEO_15S', 'VIDEO_30S', 'CAPTION']),
  userPrompt: z.string().min(1).max(500),
  platform:   z.enum(['instagram', 'facebook', 'whatsapp', 'all']).optional(),
  metadata:   z.record(z.unknown()).optional(),
})

export type GenerateAssetInput = z.infer<typeof GenerateAssetSchema>

// ─── Reports ─────────────────────────────────────────────────────────────────

export const CreateReportSchema = z.object({
  jobId:   z.string().uuid(),
  message: z.string().trim().max(500).optional(),
})

export type CreateReportInput = z.infer<typeof CreateReportSchema>

// ─── Credits / Payments ──────────────────────────────────────────────────────

export const BuyCreditsSchema = z.object({
  pack:         z.enum(['SEED', 'BUSINESS', 'PRO', 'AGENCY']),
  paypalOrderId: z.string().min(1),
})

export const PaypalWebhookSchema = z.object({
  id:          z.string(),
  event_type:  z.string(),
  resource:    z.record(z.unknown()),
  create_time: z.string(),
})

export type BuyCreditsInput   = z.infer<typeof BuyCreditsSchema>
export type PaypalWebhookInput = z.infer<typeof PaypalWebhookSchema>

// ─── Pagination ──────────────────────────────────────────────────────────────

export const PaginationSchema = z.object({
  page:     z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
})

export type PaginationInput = z.infer<typeof PaginationSchema>
