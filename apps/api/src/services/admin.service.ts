import { createClient } from '@supabase/supabase-js'
import type { JobStatus, AssetType, PaymentStatus, UserRole } from '@prisma/client'
import { prisma } from '../lib/prisma'
import { NotFoundError, ValidationError } from '../lib/errors'

const supabaseAdmin = createClient(
  process.env['SUPABASE_URL']!,
  process.env['SUPABASE_SERVICE_ROLE_KEY']!,
)

const PAGE_SIZE = 20

function daysAgo(n: number): Date {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d
}

export const adminService = {
  /* ── Dashboard metrics ──────────────────────────────────── */
  async getStats() {
    const [
      totalUsers,
      adminUsers,
      suspendedUsers,
      newUsers7d,
      newUsers30d,
      totalBrands,
      totalAssets,
      revenueAgg,
      completedPayments,
      creditAgg,
      spendAgg,
      jobsByStatus,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'ADMIN' } }),
      prisma.user.count({ where: { suspended: true } }),
      prisma.user.count({ where: { createdAt: { gte: daysAgo(7) } } }),
      prisma.user.count({ where: { createdAt: { gte: daysAgo(30) } } }),
      prisma.brand.count(),
      prisma.generatedAsset.count(),
      prisma.payment.aggregate({
        where: { status: 'COMPLETED' },
        _sum:  { amountUsd: true, creditsPurchased: true },
      }),
      prisma.payment.count({ where: { status: 'COMPLETED' } }),
      prisma.creditAccount.aggregate({ _sum: { balance: true, lifetimeCredits: true } }),
      prisma.creditTransaction.aggregate({ where: { type: 'SPEND' }, _sum: { amount: true } }),
      prisma.generationJob.groupBy({ by: ['status'], _count: { _all: true } }),
    ])

    const jobStatus: Record<JobStatus, number> = {
      PENDING: 0, PROCESSING: 0, COMPLETED: 0, FAILED: 0,
    }
    for (const row of jobsByStatus) jobStatus[row.status] = row._count._all

    return {
      users: {
        total:     totalUsers,
        admins:    adminUsers,
        suspended: suspendedUsers,
        new7d:     newUsers7d,
        new30d:    newUsers30d,
      },
      revenue: {
        totalUsd:         Number(revenueAgg._sum.amountUsd ?? 0),
        creditsSold:      revenueAgg._sum.creditsPurchased ?? 0,
        completedPayments,
      },
      credits: {
        outstandingBalance: creditAgg._sum.balance ?? 0,
        lifetimeIssued:     creditAgg._sum.lifetimeCredits ?? 0,
        totalSpent:         Math.abs(spendAgg._sum.amount ?? 0),
      },
      content: {
        brands: totalBrands,
        assets: totalAssets,
      },
      jobs: jobStatus,
    }
  },

  /* ── Users ──────────────────────────────────────────────── */
  async listUsers(opts: { search?: string; page?: number }) {
    const page = Math.max(1, opts.page ?? 1)
    const where = opts.search
      ? {
          OR: [
            { email: { contains: opts.search, mode: 'insensitive' as const } },
            { name:  { contains: opts.search, mode: 'insensitive' as const } },
          ],
        }
      : {}

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip:    (page - 1) * PAGE_SIZE,
        take:    PAGE_SIZE,
        select: {
          id: true, email: true, name: true, role: true, suspended: true, createdAt: true,
          creditAccount: { select: { balance: true, lifetimeCredits: true } },
          _count: { select: { brands: true, generatedAssets: true, payments: true } },
        },
      }),
      prisma.user.count({ where }),
    ])

    return { users, total, page, pageSize: PAGE_SIZE, totalPages: Math.ceil(total / PAGE_SIZE) }
  },

  async getUserDetail(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true, email: true, name: true, role: true, suspended: true,
        createdAt: true, supabaseId: true,
        creditAccount: { select: { balance: true, lifetimeCredits: true } },
        _count: { select: { brands: true, generatedAssets: true, generationJobs: true } },
      },
    })
    if (!user) throw new NotFoundError('User')

    const [payments, transactions, brands] = await Promise.all([
      prisma.payment.findMany({
        where: { userId }, orderBy: { createdAt: 'desc' }, take: 10,
      }),
      prisma.creditTransaction.findMany({
        where: { userId }, orderBy: { createdAt: 'desc' }, take: 15,
      }),
      prisma.brand.findMany({
        where: { userId }, orderBy: { createdAt: 'desc' }, take: 10,
        select: { id: true, name: true, industry: true, logoUrl: true, createdAt: true },
      }),
    ])

    return {
      ...user,
      payments: payments.map((p) => ({ ...p, amountUsd: Number(p.amountUsd) })),
      transactions,
      brands,
    }
  },

  async grantCredits(userId: string, amount: number, description: string) {
    if (!Number.isInteger(amount) || amount <= 0) {
      throw new ValidationError('amount must be a positive integer')
    }
    const account = await prisma.creditAccount.findUnique({ where: { userId } })
    if (!account) throw new NotFoundError('Credit account')

    const [updated] = await prisma.$transaction([
      prisma.creditAccount.update({
        where: { userId },
        data:  { balance: { increment: amount }, lifetimeCredits: { increment: amount } },
      }),
      prisma.creditTransaction.create({
        data: { userId, amount, type: 'BONUS', description: description || 'Créditos otorgados por administrador' },
      }),
    ])
    return { balance: updated.balance, lifetimeCredits: updated.lifetimeCredits }
  },

  async setRole(userId: string, role: UserRole) {
    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) throw new NotFoundError('User')
    return prisma.user.update({
      where: { id: userId }, data: { role },
      select: { id: true, role: true },
    })
  },

  async setSuspended(userId: string, suspended: boolean) {
    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) throw new NotFoundError('User')
    return prisma.user.update({
      where: { id: userId }, data: { suspended },
      select: { id: true, suspended: true },
    })
  },

  async deleteUser(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId }, select: { supabaseId: true },
    })
    if (!user) throw new NotFoundError('User')

    await prisma.user.delete({ where: { id: userId } })
    try {
      await supabaseAdmin.auth.admin.deleteUser(user.supabaseId)
    } catch {
      // Supabase deletion is best-effort; DB row (source of truth) is already gone.
    }
    return { success: true }
  },

  /* ── Payments ───────────────────────────────────────────── */
  async listPayments(opts: { search?: string; status?: PaymentStatus; page?: number }) {
    const page = Math.max(1, opts.page ?? 1)
    const where = {
      ...(opts.status ? { status: opts.status } : {}),
      ...(opts.search
        ? {
            OR: [
              { paypalOrderId: { contains: opts.search, mode: 'insensitive' as const } },
              { user: { email: { contains: opts.search, mode: 'insensitive' as const } } },
            ],
          }
        : {}),
    }

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip:    (page - 1) * PAGE_SIZE,
        take:    PAGE_SIZE,
        include: { user: { select: { id: true, email: true, name: true } } },
      }),
      prisma.payment.count({ where }),
    ])

    return {
      payments: payments.map((p) => ({ ...p, amountUsd: Number(p.amountUsd) })),
      total, page, pageSize: PAGE_SIZE, totalPages: Math.ceil(total / PAGE_SIZE),
    }
  },

  /* ── Generation jobs ────────────────────────────────────── */
  async listJobs(opts: { status?: JobStatus; type?: AssetType; page?: number }) {
    const page = Math.max(1, opts.page ?? 1)
    const where = {
      ...(opts.status ? { status: opts.status } : {}),
      ...(opts.type ? { type: opts.type } : {}),
    }

    const [jobs, total] = await Promise.all([
      prisma.generationJob.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip:    (page - 1) * PAGE_SIZE,
        take:    PAGE_SIZE,
        select: {
          id: true, type: true, status: true, userPrompt: true, provider: true,
          creditsRequired: true, creditsCharged: true, errorMessage: true, createdAt: true,
          user:  { select: { id: true, email: true } },
          brand: { select: { id: true, name: true } },
        },
      }),
      prisma.generationJob.count({ where }),
    ])

    return { jobs, total, page, pageSize: PAGE_SIZE, totalPages: Math.ceil(total / PAGE_SIZE) }
  },

  async getJobStats() {
    const [byStatus, byType, byProvider] = await Promise.all([
      prisma.generationJob.groupBy({ by: ['status'], _count: { _all: true } }),
      prisma.generationJob.groupBy({ by: ['type'],   _count: { _all: true } }),
      prisma.generationJob.groupBy({ by: ['provider'], _count: { _all: true } }),
    ])
    return {
      byStatus:   byStatus.map((r) => ({ status: r.status, count: r._count._all })),
      byType:     byType.map((r) => ({ type: r.type, count: r._count._all })),
      byProvider: byProvider.map((r) => ({ provider: r.provider, count: r._count._all })),
    }
  },
}
