import type { FastifyPluginAsync } from 'fastify'
import { CreateBrandSchema, UpdateBrandSchema } from '@brandai/shared'
import { prisma } from '../../lib/prisma'
import { NotFoundError } from '../../lib/errors'
import { analyzeBrandImages } from '../../services/brand-analysis.service'
import { deleteFromR2 } from '../../lib/r2'
import { supabaseAdmin, extractSupabaseStoragePath } from '../../lib/supabase-admin'

export const brandsPlugin: FastifyPluginAsync = async (instance) => {
  // GET /brands
  instance.get('/', async (request, reply) => {
    const brands = await prisma.brand.findMany({
      where:   { userId: request.user.id },
      orderBy: { createdAt: 'desc' },
    })
    return reply.send(brands)
  })

  // POST /brands
  instance.post('/', async (request, reply) => {
    const data  = CreateBrandSchema.parse(request.body)
    const brand = await prisma.brand.create({
      data: {
        userId:             request.user.id,
        name:               data.name,
        description:        data.description,
        industry:           data.industry,
        toneOfVoice:        data.toneOfVoice,
        targetAudience:     data.targetAudience,
        logoUrl:            data.logoUrl,
        referenceImageUrls: data.referenceImageUrls ?? [],
      },
    })
    return reply.status(201).send(brand)
  })

  // GET /brands/:id
  instance.get('/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    const brand  = await prisma.brand.findFirst({
      where: { id, userId: request.user.id },
    })
    if (!brand) throw new NotFoundError('Brand')
    return reply.send(brand)
  })

  // PATCH /brands/:id
  instance.patch('/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    const data   = UpdateBrandSchema.parse(request.body)

    const existing = await prisma.brand.findFirst({ where: { id, userId: request.user.id } })
    if (!existing) throw new NotFoundError('Brand')

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { platforms, ...brandData } = data
    const brand = await prisma.brand.update({
      where: { id },
      data:  brandData,
    })
    return reply.send(brand)
  })

  // DELETE /brands/:id
  instance.delete('/:id', async (request, reply) => {
    const { id } = request.params as { id: string }

    const brand = await prisma.brand.findFirst({
      where:   { id, userId: request.user.id },
      include: { generatedAssets: true },
    })
    if (!brand) throw new NotFoundError('Brand')

    // 1. Borrar assets generados de R2 (no bloquea si falla)
    const r2PublicUrl = process.env['R2_PUBLIC_URL'] ?? ''
    await Promise.allSettled(
      brand.generatedAssets
        .filter(a => r2PublicUrl && a.url.startsWith(r2PublicUrl))
        .map(a => deleteFromR2(a.url.slice(r2PublicUrl.length + 1)).catch(() => {})),
    )

    // 2. Borrar logo + imágenes de referencia de Supabase Storage (no bloquea si falla)
    const storageUrlsByBucket = new Map<string, string[]>()
    const imageUrls = [brand.logoUrl, ...brand.referenceImageUrls].filter(Boolean) as string[]
    for (const url of imageUrls) {
      const parsed = extractSupabaseStoragePath(url)
      if (!parsed) continue
      const list = storageUrlsByBucket.get(parsed.bucket) ?? []
      list.push(parsed.path)
      storageUrlsByBucket.set(parsed.bucket, list)
    }
    await Promise.allSettled(
      [...storageUrlsByBucket.entries()].map(([bucket, paths]) =>
        supabaseAdmin.storage.from(bucket).remove(paths).catch(() => {}),
      ),
    )

    // 3. Eliminar brand — Prisma cascadea GenerationJob y GeneratedAsset
    await prisma.brand.delete({ where: { id } })
    return reply.status(204).send()
  })

  // POST /brands/:id/analyze — trigger Claude Haiku brand analysis
  instance.post('/:id/analyze', async (request, reply) => {
    const { id } = request.params as { id: string }
    const result  = await analyzeBrandImages(id, request.user.id)
    return reply.send(result)
  })
}
