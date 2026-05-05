import type { Job } from 'bullmq'
import { PrismaClient } from '@prisma/client'
import Replicate from 'replicate'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import type { JobQueuePayload } from '@brandai/shared'

const prisma   = new PrismaClient()
const replicate = new Replicate({ auth: process.env['REPLICATE_API_TOKEN']! })
const r2 = new S3Client({
  region:   'auto',
  endpoint: `https://${process.env['R2_ACCOUNT_ID']!}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId:     process.env['R2_ACCESS_KEY_ID']!,
    secretAccessKey: process.env['R2_SECRET_ACCESS_KEY']!,
  },
})

export async function processBannerJob(job: Job<JobQueuePayload>): Promise<void> {
  const { jobId, userId, brandId, type, prompt, metadata } = job.data
  const width  = (metadata?.['width']  as number | undefined) ?? 1200
  const height = (metadata?.['height'] as number | undefined) ?? 630

  await prisma.generationJob.update({
    where: { id: jobId },
    data:  { status: 'PROCESSING' },
  })

  try {
    const output = await replicate.run('black-forest-labs/flux-schnell', {
      input: {
        prompt:              `${prompt} Banner format, wide composition, marketing banner`,
        num_outputs:         1,
        num_inference_steps: 4,
        output_format:       'webp',
        output_quality:      90,
        aspect_ratio:        '16:9',
      },
    })

    const urls     = Array.isArray(output) ? output : [output]
    const imageUrl = urls[0] as string
    if (!imageUrl) throw new Error('No banner image URL returned')

    const res    = await fetch(imageUrl)
    const buffer = Buffer.from(await res.arrayBuffer())
    const key    = `users/${userId}/assets/${jobId}.webp`

    await r2.send(new PutObjectCommand({
      Bucket:      process.env['R2_BUCKET_NAME']!,
      Key:         key,
      Body:        buffer,
      ContentType: 'image/webp',
    }))

    const publicUrl   = `${process.env['R2_PUBLIC_URL']!}/${key}`
    const jobRecord   = await prisma.generationJob.findUnique({ where: { id: jobId } })
    const creditsCost = jobRecord?.creditsRequired ?? 8

    await prisma.$transaction([
      prisma.generatedAsset.create({
        data: { userId, brandId, jobId, type, url: publicUrl, width, height, creditsCost, provider: 'flux-pro' },
      }),
      prisma.generationJob.update({
        where: { id: jobId },
        data:  { status: 'COMPLETED', creditsCharged: creditsCost },
      }),
      prisma.creditTransaction.create({
        data: {
          userId,
          amount:      -creditsCost,
          type:        'SPEND',
          description: `Generated ${type}`,
          assetId:     jobId,
        },
      }),
    ])
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
