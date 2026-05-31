import type { Job } from 'bullmq'
import Anthropic from '@anthropic-ai/sdk'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import type { JobQueuePayload } from '@brandai/shared'
import { prisma } from '../lib/prisma'

function getAnthropicClient(): Anthropic {
  if (!process.env['ANTHROPIC_API_KEY']) {
    throw new Error('ANTHROPIC_API_KEY is not configured — caption generation unavailable')
  }
  return new Anthropic({ apiKey: process.env['ANTHROPIC_API_KEY'] })
}

const r2 = new S3Client({
  region:   'auto',
  endpoint: `https://${process.env['R2_ACCOUNT_ID']!}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId:     process.env['R2_ACCESS_KEY_ID']!,
    secretAccessKey: process.env['R2_SECRET_ACCESS_KEY']!,
  },
})

function cleanCaption(raw: string): string {
  let text = raw.trim()

  // Strip intro lines: "Here's a caption...", "Here is your...", etc.
  text = text.replace(/^here[''’]?s\s+[^\n]*\n+/i, '')
  text = text.replace(/^here\s+is\s+[^\n]*\n+/i, '')

  // Strip leading/trailing markdown separators (--- or ***)
  text = text.replace(/^[-*]{3,}\s*\n/gm, '')
  text = text.replace(/\n\s*[-*]{3,}\s*$/g, '')

  // Strip trailing character-count or meta notes
  text = text.replace(/\n+\*?_?character count[^\n]*\n?$/im, '')
  text = text.replace(/\n+\*[^\n]+characters[^\n]*\*\s*$/im, '')
  text = text.replace(/\n+_[^\n]+characters[^\n]*_\s*$/im, '')

  return text.trim()
}

export async function processCaptionJob(job: Job<JobQueuePayload>): Promise<void> {
  const { jobId, userId, brandId, type, prompt } = job.data

  await prisma.generationJob.update({
    where: { id: jobId },
    data:  { status: 'PROCESSING' },
  })

  try {
    const anthropic = getAnthropicClient()
    const message = await anthropic.messages.create({
      model:      'claude-sonnet-4-6',
      max_tokens:  512,
      system: `You are a professional social media copywriter for small businesses.
Write engaging, authentic captions adapted to the brand's tone and platform.

CRITICAL RULES — you must follow these without exception:
- Output ONLY the caption text, ready to paste directly into Instagram/Facebook/etc.
- Do NOT include any introduction like "Here's a caption..." or "Here is your caption..."
- Do NOT include markdown separators (--- or ***)
- Do NOT include character counts, notes, or any meta-commentary
- Do NOT wrap the caption in quotes or code blocks
- Start directly with the first word of the caption`,
      messages: [{ role: 'user', content: prompt }],
    })

    const block = message.content[0]
    if (!block || block.type !== 'text') throw new Error('No caption text returned')

    const captionText = cleanCaption(block.text)
    const buffer      = Buffer.from(captionText, 'utf-8')
    const key         = `users/${userId}/assets/${jobId}.txt`

    await r2.send(new PutObjectCommand({
      Bucket:      process.env['R2_BUCKET_NAME']!,
      Key:         key,
      Body:        buffer,
      ContentType: 'text/plain; charset=utf-8',
    }))

    const publicUrl = `${process.env['R2_PUBLIC_URL']!}/${key}`
    const jobRecord = await prisma.generationJob.findUnique({ where: { id: jobId } })
    const creditsCost = jobRecord?.creditsRequired ?? 3

    await prisma.$transaction([
      prisma.generatedAsset.create({
        data: {
          userId,
          brandId,
          jobId,
          type,
          url:        publicUrl,
          creditsCost,
          provider:   'claude-sonnet',
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
