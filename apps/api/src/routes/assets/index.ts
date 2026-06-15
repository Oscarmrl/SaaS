import type { FastifyPluginAsync } from 'fastify'
import { PaginationSchema } from '@brandai/shared'
import { prisma } from '../../lib/prisma'
import { NotFoundError } from '../../lib/errors'
import { deleteFromR2 } from '../../lib/r2'

export const assetsPlugin: FastifyPluginAsync = async (instance) => {
  // GET /assets — list all assets for user
  instance.get('/', async (request, reply) => {
    const query = PaginationSchema.parse(request.query)
    const { brandId, type } = request.query as { brandId?: string; type?: string }

    const where = {
      userId: request.user.id,
      ...(brandId ? { brandId } : {}),
      ...(type    ? { type: type as never } : {}),
    }

    const [data, total] = await Promise.all([
      prisma.generatedAsset.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip:    (query.page - 1) * query.pageSize,
        take:    query.pageSize,
        select: {
          id:             true,
          type:           true,
          url:            true,
          thumbnailUrl:   true,
          creditsCost:    true,
          platform:       true,
          createdAt:      true,
          brand:          { select: { name: true } },
        },
      }),
      prisma.generatedAsset.count({ where }),
    ])

    return reply.send({ data, total, page: query.page, pageSize: query.pageSize })
  })

  // GET /assets/:id
  instance.get('/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    const asset  = await prisma.generatedAsset.findFirst({
      where:   { id, userId: request.user.id },
      include: { brand: { select: { name: true } }, job: true },
    })
    if (!asset) throw new NotFoundError('Asset')
    return reply.send(asset)
  })

  // DELETE /assets/:id
  instance.delete('/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    const asset  = await prisma.generatedAsset.findFirst({
      where: { id, userId: request.user.id },
    })
    if (!asset) throw new NotFoundError('Asset')

    const r2Base = process.env['R2_PUBLIC_URL'] ?? ''
    const r2Urls = [asset.url, asset.thumbnailUrl].filter(
      (u): u is string => u != null && Boolean(r2Base) && u.startsWith(r2Base),
    )
    await Promise.allSettled(
      r2Urls.map(u => deleteFromR2(u.slice(r2Base.length + 1))),
    )

    await prisma.generatedAsset.delete({ where: { id } })
    return reply.status(204).send()
  })
}
