import type { Job } from 'bullmq'
import { PrismaClient } from '@prisma/client'
import Anthropic from '@anthropic-ai/sdk'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import type { JobQueuePayload } from '@brandai/shared'
import { renderVideoBuffer } from '../lib/render-video'
import type { BrandVideoProps } from '../remotion/BrandVideoComposition'

const prisma = new PrismaClient()

const r2 = new S3Client({
  region:   'auto',
  endpoint: `https://${process.env['R2_ACCOUNT_ID']!}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId:     process.env['R2_ACCESS_KEY_ID']!,
    secretAccessKey: process.env['R2_SECRET_ACCESS_KEY']!,
  },
})

function getAnthropicClient(): Anthropic {
  if (!process.env['ANTHROPIC_API_KEY']) throw new Error('ANTHROPIC_API_KEY is required')
  return new Anthropic({ apiKey: process.env['ANTHROPIC_API_KEY'] })
}

function extractJson(text: string): { scenes: BrandVideoProps['scenes'] } {
  const attempts: Array<() => { scenes: BrandVideoProps['scenes'] } | null> = [
    () => JSON.parse(text) as { scenes: BrandVideoProps['scenes'] },
    () => {
      const m = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/)
      return m ? JSON.parse(m[1]!) as { scenes: BrandVideoProps['scenes'] } : null
    },
    () => {
      const m = text.match(/\{[\s\S]*\}/)
      return m ? JSON.parse(m[0]) as { scenes: BrandVideoProps['scenes'] } : null
    },
  ]
  for (const attempt of attempts) {
    try {
      const result = attempt()
      if (result?.scenes?.length) return result
    } catch {}
  }
  throw new Error('Failed to parse video script JSON from Claude response')
}

async function generateScript(
  prompt: string,
  targetSeconds: number,
): Promise<BrandVideoProps['scenes']> {
  const sceneCount    = targetSeconds <= 15 ? 3 : 5
  const sceneDuration = Math.floor(targetSeconds / sceneCount)

  const anthropic = getAnthropicClient()
  const message = await anthropic.messages.create({
    model:      'claude-haiku-4-5-20251001',
    max_tokens: 512,
    system: `Eres director creativo senior de publicidad para redes sociales en Latinoamérica.
Creas scripts de video que VENDEN. Cada escena debe ser memorable, emocional y directa.

Genera exactamente ${sceneCount} escenas que sumen ${targetSeconds} segundos.
Estructura sugerida:
  - Escena 1 (intro): nombre de marca o gancho emocional potente
  - Escenas intermedias: beneficio clave o prueba social
  - Última escena: llamada a la acción clara y urgente

Reglas de copywriting:
  - "text": máx 30 caracteres, titulares como un golpe — sin palabras de relleno
  - "subtext": máx 55 caracteres, complementa sin repetir el titular (puede estar vacío)
  - "durationInSeconds": ${sceneDuration} por escena
  - Usa verbos de acción, números concretos, o preguntas retóricas
  - Evita frases genéricas como "calidad premium" o "lo mejor del mercado"

Responde SOLO con JSON válido: {"scenes": [...]}`,
    messages: [{ role: 'user', content: prompt }],
  })

  const block = message.content[0]
  if (!block || block.type !== 'text') throw new Error('No script returned from Claude')
  return extractJson(block.text).scenes
}

export async function processVideoJob(job: Job<JobQueuePayload>): Promise<void> {
  const { jobId, userId, brandId, type, prompt } = job.data

  await prisma.generationJob.update({
    where: { id: jobId },
    data:  { status: 'PROCESSING' },
  })

  try {
    const brand       = await prisma.brand.findUnique({ where: { id: brandId } })
    const brandColor  = brand?.primaryColor ?? '#7C3AED'
    const targetSecs  = type === 'VIDEO_30S' ? 30 : 15

    const scenes = await generateScript(prompt, targetSecs)
    const props: BrandVideoProps = { scenes, brandColor }
    const buffer = await renderVideoBuffer(props, 1280, 720)

    const key = `users/${userId}/assets/${jobId}.mp4`
    await r2.send(new PutObjectCommand({
      Bucket:      process.env['R2_BUCKET_NAME']!,
      Key:         key,
      Body:        buffer,
      ContentType: 'video/mp4',
    }))

    const publicUrl   = `${process.env['R2_PUBLIC_URL']!}/${key}`
    const jobRecord   = await prisma.generationJob.findUnique({ where: { id: jobId } })
    const creditsCost = jobRecord?.creditsRequired ?? (type === 'VIDEO_30S' ? 35 : 20)

    await prisma.$transaction([
      prisma.generatedAsset.create({
        data: {
          userId,
          brandId,
          jobId,
          type,
          url:             publicUrl,
          width:           1280,
          height:          720,
          durationSeconds: targetSecs,
          creditsCost,
          provider:        'remotion',
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
          data:  { status: 'FAILED', errorMessage: error instanceof Error ? error.message : 'Unknown' },
        }),
      ])
    }
    throw error
  }
}
