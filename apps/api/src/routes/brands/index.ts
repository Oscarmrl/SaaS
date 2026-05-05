import type { FastifyPluginAsync } from 'fastify'
import { CreateBrandSchema, UpdateBrandSchema } from '@brandai/shared'
import { prisma } from '../../lib/prisma'
import { NotFoundError } from '../../lib/errors'
import { analyzeBrandImages } from '../../services/brand-analysis.service'

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
    const existing = await prisma.brand.findFirst({ where: { id, userId: request.user.id } })
    if (!existing) throw new NotFoundError('Brand')

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
