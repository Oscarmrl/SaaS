import { prisma } from '../lib/prisma'
import { NotFoundError } from '../lib/errors'
import type { CreditPack } from '@brandai/shared'
import { CREDIT_PACKS } from '@brandai/shared'

export async function getBalance(userId: string): Promise<{ balance: number; lifetimeCredits: number }> {
  const account = await prisma.creditAccount.findUnique({ where: { userId } })
  if (!account) throw new NotFoundError('CreditAccount')
  return { balance: account.balance, lifetimeCredits: account.lifetimeCredits }
}

export async function getTransactionHistory(
  userId: string,
  page: number,
  pageSize: number,
) {
  const [data, total] = await Promise.all([
    prisma.creditTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.creditTransaction.count({ where: { userId } }),
  ])
  return { data, total, page, pageSize }
}

export async function createPaypalOrder(
  userId: string,
  pack: CreditPack,
): Promise<{ paypalClientId: string; pack: typeof CREDIT_PACKS[CreditPack] }> {
  const packInfo = CREDIT_PACKS[pack]
  // The frontend will call PayPal directly using the client ID.
  // After capture, PayPal sends a webhook to /webhooks/paypal.
  return {
    paypalClientId: process.env['PAYPAL_CLIENT_ID'] ?? '',
    pack: packInfo,
  }
}

export async function recordPendingPayment(
  userId: string,
  pack: CreditPack,
  paypalOrderId: string,
) {
  const packInfo = CREDIT_PACKS[pack]
  return prisma.payment.create({
    data: {
      userId,
      paypalOrderId,
      amountUsd:       packInfo.priceUsd,
      creditsPurchased: packInfo.credits,
      status:          'PENDING',
      pack,
    },
  })
}
