import 'dotenv/config'
import Fastify from 'fastify'
import cors from '@fastify/cors'
import helmet from '@fastify/helmet'
import { authMiddleware } from './middleware/auth.middleware'
import { creditsPlugin } from './routes/credits/index'
import { brandsPlugin } from './routes/brands/index'
import { generatePlugin } from './routes/generate/index'
import { assetsPlugin } from './routes/assets/index'
import { userPlugin } from './routes/user/index'
import { adminPlugin } from './routes/admin/index'
import { paypalWebhookRoute } from './routes/webhooks/paypal.route'
import { AppError } from './lib/errors'

const server = Fastify({
  logger: {
    level: process.env['NODE_ENV'] === 'production' ? 'info' : 'debug',
    ...(process.env['NODE_ENV'] !== 'production' && {
      transport: { target: 'pino-pretty', options: { colorize: true } },
    }),
  },
})

server.setErrorHandler((error, request, reply) => {
  if (error instanceof AppError) {
    return reply.status(error.statusCode).send({
      error:   error.code,
      message: error.message,
    })
  }

  if (error.validation) {
    return reply.status(400).send({
      error:   'VALIDATION_ERROR',
      message: error.message,
    })
  }

  request.log.error(error)
  return reply.status(500).send({
    error:   'INTERNAL_ERROR',
    message: 'An unexpected error occurred',
  })
})

async function start(): Promise<void> {
  await server.register(cors, {
    origin: process.env['FRONTEND_URL'] ?? 'http://localhost:3000',
    credentials: true,
  })
  await server.register(helmet)

  // Health check (public)
  server.get('/health', async () => ({ status: 'ok', timestamp: new Date().toISOString() }))

  // Webhook (public — no auth middleware)
  await server.register(paypalWebhookRoute, { prefix: '/webhooks' })

  // Authenticated routes (scoped auth hook)
  await server.register(async (instance) => {
    instance.addHook('preHandler', authMiddleware)
    await instance.register(userPlugin,     { prefix: '/user' })
    await instance.register(creditsPlugin,  { prefix: '/credits' })
    await instance.register(brandsPlugin,   { prefix: '/brands' })
    await instance.register(generatePlugin, { prefix: '/generate' })
    await instance.register(assetsPlugin,   { prefix: '/assets' })
    await instance.register(adminPlugin,    { prefix: '/admin' })
  })

  const port = Number(process.env['PORT'] ?? 3001)
  await server.listen({ port, host: '0.0.0.0' })
  server.log.info(`API running on port ${port}`)
}

start().catch((err) => {
  console.error(err)
  process.exit(1)
})
