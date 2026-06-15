import 'dotenv/config'
import { Worker } from 'bullmq'
import { Redis } from 'ioredis'
import pino from 'pino'
import { QUEUE_NAMES } from '@brandai/shared'
import { processImageJob } from './processors/image.processor'
import { processBannerJob } from './processors/banner.processor'
import { processCaptionJob } from './processors/caption.processor'
import { processVideoJob } from './processors/video.processor'
import type { JobQueuePayload } from '@brandai/shared'

const log = pino({
  level: process.env['NODE_ENV'] === 'production' ? 'info' : 'debug',
  ...(process.env['NODE_ENV'] !== 'production' && {
    transport: { target: 'pino-pretty', options: { colorize: true } },
  }),
})

if (!process.env['REDIS_URL']) {
  log.error('REDIS_URL is required')
  process.exit(1)
}

const connection = new Redis(process.env['REDIS_URL'], {
  maxRetriesPerRequest: null,
  enableReadyCheck:     false,
})

const worker = new Worker<JobQueuePayload>(
  QUEUE_NAMES.GENERATION,
  async (job) => {
    log.info({ jobId: job.data.jobId, type: job.data.type }, 'Processing job')

    switch (job.data.type) {
      case 'IMAGE':
        return processImageJob(job)
      case 'BANNER':
        return processBannerJob(job)
      case 'CAPTION':
        return processCaptionJob(job)
      case 'VIDEO_8S':
      case 'VIDEO_15S':
      case 'VIDEO_30S':
        return processVideoJob(job)
      default:
        throw new Error(`Unknown job type: ${job.data.type}`)
    }
  },
  {
    connection,
    concurrency: 3,
  },
)

worker.on('completed', (job) => {
  log.info({ jobId: job.data.jobId }, 'Job completed')
})

worker.on('failed', (job, err) => {
  log.error({ jobId: job?.data.jobId, error: err.message }, 'Job failed')
})

worker.on('error', (err) => {
  log.error({ error: err.message }, 'Worker error')
})

log.info('BrandAI Worker started — listening for generation jobs')

process.on('SIGTERM', async () => {
  log.info('SIGTERM received, closing worker gracefully')
  await worker.close()
  process.exit(0)
})
