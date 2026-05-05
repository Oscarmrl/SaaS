import type { FastifyPluginAsync } from 'fastify'
import { prisma } from '../../lib/prisma'

const PAYPAL_API_BASE = process.env['PAYPAL_MODE'] === 'live'
  ? 'https://api-m.paypal.com'
  : 'https://api-m.sandbox.paypal.com'

async function getPaypalAccessToken(): Promise<string> {
  const credentials = Buffer.from(
    `${process.env['PAYPAL_CLIENT_ID']}:${process.env['PAYPAL_CLIENT_SECRET']}`,
  ).toString('base64')

  const res = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
    method:  'POST',
    headers: {
      Authorization:  `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  })

  const data = await res.json() as { access_token: string }
  return data.access_token
}

async function verifyWebhookSignature(
  headers: Record<string, string | string[] | undefined>,
  rawBody: string,
  webhookId: string,
): Promise<boolean> {
  try {
    const token = await getPaypalAccessToken()

    const verifyPayload = {
      auth_algo:         headers['paypal-auth-algo'],
      cert_url:          headers['paypal-cert-url'],
      transmission_id:   headers['paypal-transmission-id'],
      transmission_sig:  headers['paypal-transmission-sig'],
      transmission_time: headers['paypal-transmission-time'],
      webhook_id:        webhookId,
      webhook_event:     JSON.parse(rawBody),
    }

    const res = await fetch(`${PAYPAL_API_BASE}/v1/notifications/verify-webhook-signature`, {
      method:  'POST',
      headers: {
        Authorization:  `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(verifyPayload),
    })

    const result = await res.json() as { verification_status: string }
    return result.verification_status === 'SUCCESS'
  } catch {
    return false
  }
}

export const paypalWebhookRoute: FastifyPluginAsync = async (instance) => {
  instance.post('/paypal', {
    config: { rawBody: true },
  }, async (request, reply) => {
    const rawBody   = (request as unknown as { rawBody: string }).rawBody ?? JSON.stringify(request.body)
    const webhookId = process.env['PAYPAL_WEBHOOK_ID'] ?? ''

    const isValid = await verifyWebhookSignature(
      request.headers as Record<string, string | string[] | undefined>,
      rawBody,
      webhookId,
    )

    if (!isValid) {
      request.log.warn('PayPal webhook signature verification failed')
      return reply.status(400).send({ error: 'INVALID_SIGNATURE' })
    }

    const event = request.body as { event_type: string; resource: Record<string, unknown> }

    if (event.event_type !== 'PAYMENT.CAPTURE.COMPLETED') {
      return reply.status(200).send({ received: true })
    }

    const resource     = event.resource
    const orderId      = resource['supplementary_data'] as { related_ids?: { order_id?: string } } | undefined
    const paypalOrderId = (orderId?.related_ids?.order_id ?? resource['id']) as string

    if (!paypalOrderId) {
      request.log.error('PayPal webhook missing order ID', resource)
      return reply.status(200).send({ received: true })
    }

    const payment = await prisma.payment.findUnique({ where: { paypalOrderId } })
    if (!payment) {
      request.log.warn(`PayPal webhook: no payment found for order ${paypalOrderId}`)
      return reply.status(200).send({ received: true })
    }

    if (payment.status === 'COMPLETED') {
      return reply.status(200).send({ received: true })
    }

    await prisma.$transaction([
      prisma.payment.update({
        where: { paypalOrderId },
        data:  { status: 'COMPLETED', paypalPayerId: resource['payer_id'] as string | undefined },
      }),
      prisma.creditAccount.update({
        where: { userId: payment.userId },
        data:  {
          balance:         { increment: payment.creditsPurchased },
          lifetimeCredits: { increment: payment.creditsPurchased },
        },
      }),
      prisma.creditTransaction.create({
        data: {
          userId:       payment.userId,
          amount:       payment.creditsPurchased,
          type:         'PURCHASE',
          description:  `Purchased ${payment.pack} pack — ${payment.creditsPurchased} credits`,
          paypalOrderId,
        },
      }),
    ])

    request.log.info(`Credits added for user ${payment.userId}: +${payment.creditsPurchased}`)
    return reply.status(200).send({ received: true })
  })
}
