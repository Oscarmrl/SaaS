import type { FastifyPluginAsync } from 'fastify'
import { BuyCreditsSchema, PaginationSchema } from '@brandai/shared'
import * as creditsService from '../../services/credits.service'

export const creditsPlugin: FastifyPluginAsync = async (instance) => {
  // GET /credits/balance
  instance.get('/balance', async (request, reply) => {
    const data = await creditsService.getBalance(request.user.id)
    return reply.send(data)
  })

  // GET /credits/history
  instance.get('/history', async (request, reply) => {
    const query = PaginationSchema.parse(request.query)
    const data  = await creditsService.getTransactionHistory(
      request.user.id,
      query.page,
      query.pageSize,
    )
    return reply.send(data)
  })

  // POST /credits/prepare-order — frontend creates PayPal order, then calls /capture
  instance.post('/prepare-order', {
    schema: {
      body: {
        type: 'object',
        required: ['pack'],
        properties: {
          pack: { type: 'string', enum: ['SEED', 'BUSINESS', 'PRO', 'AGENCY'] },
        },
      },
    },
  }, async (request, reply) => {
    const body  = request.body as { pack: string }
    const pack  = BuyCreditsSchema.pick({ pack: true }).parse(body).pack
    const data  = await creditsService.createPaypalOrder(request.user.id, pack)
    return reply.send(data)
  })

  // POST /credits/capture — called after frontend captures PayPal order
  instance.post('/capture', {
    schema: {
      body: {
        type: 'object',
        required: ['pack', 'paypalOrderId'],
        properties: {
          pack:         { type: 'string' },
          paypalOrderId:{ type: 'string' },
        },
      },
    },
  }, async (request, reply) => {
    const { pack, paypalOrderId } = BuyCreditsSchema.parse(request.body)
    const payment = await creditsService.recordPendingPayment(request.user.id, pack, paypalOrderId)
    return reply.status(201).send(payment)
  })
}
