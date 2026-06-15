import type { FastifyPluginAsync } from 'fastify'
import { CreateReportSchema } from '@brandai/shared'
import { createReport } from '../../services/reports.service'

export const reportsPlugin: FastifyPluginAsync = async (instance) => {
  // POST /reports — report a failed generation
  instance.post('/', async (request, reply) => {
    const data   = CreateReportSchema.parse(request.body)
    const report = await createReport(request.user.id, data.jobId, data.message)
    return reply.status(201).send(report)
  })
}
