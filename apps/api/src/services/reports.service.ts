import { prisma } from '../lib/prisma'
import { NotFoundError, ValidationError } from '../lib/errors'

/**
 * Lets a user report one of their own generations that ended in FAILED.
 * Idempotent per job (one report per job): re-reporting updates the message
 * and re-opens the report.
 */
export async function createReport(userId: string, jobId: string, message?: string) {
  const job = await prisma.generationJob.findFirst({ where: { id: jobId, userId } })
  if (!job) throw new NotFoundError('GenerationJob')
  if (job.status !== 'FAILED') {
    throw new ValidationError('Solo se pueden reportar generaciones fallidas')
  }

  return prisma.generationReport.upsert({
    where:  { jobId },
    update: { message: message ?? null, status: 'OPEN' },
    create: { jobId, userId, message: message ?? null },
  })
}
