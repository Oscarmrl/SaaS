import type { FastifyPluginAsync } from 'fastify'
import { GenerateAssetSchema } from '@brandai/shared'
import { generateAsset, getJobStatus } from '../../services/generation.service'

export const generatePlugin: FastifyPluginAsync = async (instance) => {
  // POST /generate — enqueue a new generation job
  instance.post('/', async (request, reply) => {
    const data = GenerateAssetSchema.parse(request.body)
    const job  = await generateAsset({
      userId:     request.user.id,
      brandId:    data.brandId,
      type:       data.type,
      userPrompt: data.userPrompt,
      platform:   data.platform as never,
      metadata:   data.metadata as Record<string, unknown> | undefined,
    })
    return reply.status(202).send(job)
  })

  // GET /generate/:jobId — poll job status
  instance.get('/:jobId', async (request, reply) => {
    const { jobId } = request.params as { jobId: string }
    const job = await getJobStatus(jobId, request.user.id)
    return reply.send(job)
  })
}
