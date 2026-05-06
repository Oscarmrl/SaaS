import { Queue } from 'bullmq'
import { prisma } from '../lib/prisma'
import { redis } from '../lib/redis'
import { InsufficientCreditsError, NotFoundError, AppError } from '../lib/errors'
import { buildPromptForType } from './prompt-builder.service'
import { getProviderNameForAsset } from '../ai/factory'
import { CREDIT_COSTS, QUEUE_NAMES } from '@brandai/shared'
import type { AssetType, Platform, JobQueuePayload } from '@brandai/shared'
import type { GenerationJob } from '@prisma/client'

const generationQueue = new Queue<JobQueuePayload>(QUEUE_NAMES.GENERATION, {
  connection: redis,
  defaultJobOptions: {
    attempts:    3,
    backoff:     { type: 'exponential', delay: 5000 },
    removeOnComplete: { count: 100 },
    removeOnFail:     { count: 500 },
  },
})

interface GenerateParams {
  userId:     string
  brandId:    string
  type:       AssetType
  userPrompt: string
  platform?:  Platform
  metadata?:  Record<string, unknown>
}

export async function generateAsset(params: GenerateParams): Promise<GenerationJob> {
  const { userId, brandId, type, userPrompt, platform, metadata } = params

  const creditsRequired = CREDIT_COSTS[type]

  // 1. Check credits
  const account = await prisma.creditAccount.findUnique({ where: { userId } })
  if (!account || account.balance < creditsRequired) {
    throw new InsufficientCreditsError()
  }

  // 2. Load brand
  const brand = await prisma.brand.findFirst({ where: { id: brandId, userId } })
  if (!brand) throw new NotFoundError('Brand')

  // 3. Build enriched prompt
  const brandProfile = {
    id:                 brand.id,
    userId:             brand.userId,
    name:               brand.name,
    description:        brand.description,
    industry:           brand.industry,
    toneOfVoice:        brand.toneOfVoice,
    targetAudience:     brand.targetAudience,
    primaryColor:       brand.primaryColor,
    secondaryColor:     brand.secondaryColor,
    fonts:              brand.fonts,
    logoUrl:            brand.logoUrl,
    referenceImageUrls: brand.referenceImageUrls,
    extractedStyle:     brand.extractedStyle as Record<string, unknown> | null,
  }
  const prompt   = buildPromptForType(type, brandProfile, userPrompt, { platform, metadata })
  const provider = getProviderNameForAsset(type)

  // 4. Atomic: decrement credits + create job
  let job!: GenerationJob
  await prisma.$transaction(async (tx) => {
    await tx.creditAccount.update({
      where: { userId },
      data:  { balance: { decrement: creditsRequired } },
    })

    job = await tx.generationJob.create({
      data: {
        userId,
        brandId,
        type,
        status:          'PENDING',
        prompt,
        userPrompt,
        creditsRequired,
        provider,
        metadata:        (metadata ?? {}) as never,
      },
    })
  })

  // 5. Enqueue — refund on failure
  try {
    const bullJob = await generationQueue.add('generate', {
      jobId:    job.id,
      userId,
      brandId,
      type,
      prompt,
      provider,
      metadata,
    })

    await prisma.generationJob.update({
      where: { id: job.id },
      data:  { bullJobId: bullJob.id },
    })
  } catch (err) {
    await prisma.$transaction([
      prisma.creditAccount.update({
        where: { userId },
        data:  { balance: { increment: creditsRequired } },
      }),
      prisma.generationJob.update({
        where: { id: job.id },
        data:  { status: 'FAILED', errorMessage: 'Failed to enqueue generation job' },
      }),
    ])
    throw new AppError('ENQUEUE_FAILED', 'Failed to start generation', 500)
  }

  return job
}

export async function getJobStatus(jobId: string, userId: string) {
  const job = await prisma.generationJob.findFirst({
    where: { id: jobId, userId },
    include: { generatedAsset: true },
  })
  if (!job) throw new NotFoundError('GenerationJob')
  return job
}
