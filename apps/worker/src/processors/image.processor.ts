import type { Job } from 'bullmq'
import { PrismaClient } from '@prisma/client'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import Replicate from 'replicate'
import type { JobQueuePayload } from '@brandai/shared'

const prisma = new PrismaClient()

const r2 = new S3Client({
  region:   'auto',
  endpoint: `https://${process.env['R2_ACCOUNT_ID']!}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId:     process.env['R2_ACCESS_KEY_ID']!,
    secretAccessKey: process.env['R2_SECRET_ACCESS_KEY']!,
  },
})

const replicate = new Replicate({ auth: process.env['REPLICATE_API_TOKEN'] ?? '' })

async function generateImageBuffer(prompt: string): Promise<Buffer> {
  const provider = process.env['IMAGE_PROVIDER'] ?? 'flux-schnell'

  if (provider === 'huggingface') {
    const hfToken = process.env['HF_TOKEN']
    if (!hfToken) throw new Error('HF_TOKEN env var is required for huggingface provider')

    const res = await fetch(
      'https://router.huggingface.co/hf-inference/models/black-forest-labs/FLUX.1-schnell',
      {
        method:  'POST',
        headers: { Authorization: `Bearer ${hfToken}`, 'Content-Type': 'application/json' },
        body:    JSON.stringify({ inputs: prompt, parameters: { num_inference_steps: 4 } }),
      }
    )
    if (!res.ok) {
      const msg = await res.text().catch(() => res.statusText)
      throw new Error(`HuggingFace error ${res.status}: ${msg}`)
    }
    return Buffer.from(await res.arrayBuffer())
  }

  // Replicate: flux-schnell (cheap) or flux-pro
  const model = provider === 'flux-pro'
    ? 'black-forest-labs/flux-pro'
    : 'black-forest-labs/flux-schnell'

  const replicateInput = provider === 'flux-pro'
    ? { prompt, width: 1024, height: 1024, num_outputs: 1, guidance: 3.5, num_inference_steps: 28, output_format: 'webp', output_quality: 90 }
    : { prompt, num_outputs: 1, num_inference_steps: 4, output_format: 'webp', output_quality: 90, aspect_ratio: '1:1' }

  const output  = await replicate.run(model as `${string}/${string}`, { input: replicateInput })
  const urls    = Array.isArray(output) ? output : [output]
  const imgUrl  = urls[0] as string
  if (!imgUrl) throw new Error(`No image URL returned from ${model}`)

  const res = await fetch(imgUrl)
  if (!res.ok) throw new Error(`Failed to download image: ${res.status}`)
  return Buffer.from(await res.arrayBuffer())
}

export async function processImageJob(job: Job<JobQueuePayload>): Promise<void> {
  const { jobId, userId, brandId, type, prompt } = job.data

  await prisma.generationJob.update({
    where: { id: jobId },
    data:  { status: 'PROCESSING' },
  })

  try {
    const buffer = await generateImageBuffer(prompt)

    const key = `users/${userId}/assets/${jobId}.webp`
    await r2.send(new PutObjectCommand({
      Bucket:      process.env['R2_BUCKET_NAME']!,
      Key:         key,
      Body:        buffer,
      ContentType: 'image/webp',
    }))

    const publicUrl = `${process.env['R2_PUBLIC_URL']!}/${key}`

    const jobRecord = await prisma.generationJob.findUnique({ where: { id: jobId } })
    const creditsCost = jobRecord?.creditsRequired ?? 10

    await prisma.$transaction([
      prisma.generatedAsset.create({
        data: {
          userId,
          brandId,
          jobId,
          type,
          url:        publicUrl,
          width:      1024,
          height:     1024,
          creditsCost,
          provider:   'flux-pro',
        },
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
          data:  {
            status:       'FAILED',
            errorMessage: error instanceof Error ? error.message : 'Unknown error',
          },
        }),
      ])
    }
    throw error
  }
}
