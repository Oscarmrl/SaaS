import type { Job } from 'bullmq'
import { PrismaClient } from '@prisma/client'
import type { JobQueuePayload } from '@brandai/shared'

const prisma = new PrismaClient()

// Video processing via Remotion + FFmpeg is complex and runs inside the worker
// as a separate render pipeline. This processor orchestrates the flow.
export async function processVideoJob(job: Job<JobQueuePayload>): Promise<void> {
  const { jobId, userId } = job.data

  await prisma.generationJob.update({
    where: { id: jobId },
    data:  { status: 'PROCESSING' },
  })

  try {
    // TODO: integrate Remotion render + FFmpeg composite + ElevenLabs TTS
    // Pipeline:
    // 1. Generate script with Claude Sonnet (prompt already built)
    // 2. Generate voice with ElevenLabs
    // 3. Render video frames with Remotion
    // 4. Composite audio + video with FFmpeg
    // 5. Upload to R2

    throw new Error('Video rendering not yet implemented — coming in Phase 3')
  } catch (error) {
    const jobRecord = await prisma.generationJob.findUnique({ where: { id: jobId } })
    if (jobRecord && jobRecord.status !== 'COMPLETED') {
      await prisma.$transaction([
        prisma.creditAccount.update({
          where: { userId },
          data:  { balance: { increment: jobRecord.creditsRequired } },
        }),
        prisma.generationJob.update({
          where: { id: jobId },
          data:  { status: 'FAILED', errorMessage: error instanceof Error ? error.message : 'Unknown' },
        }),
      ])
    }
    throw error
  }
}
