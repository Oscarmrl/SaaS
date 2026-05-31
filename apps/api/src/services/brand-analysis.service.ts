import { prisma } from '../lib/prisma'
import { getTextProvider } from '../ai/factory'
import type { ExtractedBrandStyle } from '@brandai/shared'
import { ClaudeSonnetProvider } from '../ai/providers/text/claude-sonnet'
import { NotFoundError, AppError } from '../lib/errors'

export async function analyzeBrandImages(
  brandId: string,
  userId: string,
): Promise<ExtractedBrandStyle> {
  const brand = await prisma.brand.findFirst({
    where: { id: brandId, userId },
  })
  if (!brand) throw new NotFoundError('Brand')

  const imageUrls = [
    ...(brand.logoUrl ? [brand.logoUrl] : []),
    ...brand.referenceImageUrls,
  ]

  if (imageUrls.length === 0) {
    throw new AppError('NO_IMAGES', 'Brand has no images to analyze', 422)
  }

  const provider = getTextProvider()
  if (!(provider instanceof ClaudeSonnetProvider)) {
    throw new AppError('PROVIDER_ERROR', 'Brand analysis requires Claude Sonnet provider', 500)
  }

  const extractedStyle = await provider.analyzeBrandImages(imageUrls)

  await prisma.brand.update({
    where: { id: brandId },
    data: {
      extractedStyle:  extractedStyle as never,
      primaryColor:    extractedStyle.colors.primary,
      secondaryColor:  extractedStyle.colors.secondary,
    },
  })

  return extractedStyle
}
