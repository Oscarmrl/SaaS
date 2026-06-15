import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { adminMiddleware } from '../../middleware/admin.middleware'
import { adminService } from '../../services/admin.service'
import { ForbiddenError } from '../../lib/errors'

const listUsersSchema = z.object({
  search: z.string().trim().optional(),
  page:   z.coerce.number().int().min(1).optional(),
})

const grantCreditsSchema = z.object({
  amount:      z.number().int().positive().max(100_000),
  description: z.string().trim().max(200).optional(),
})

const roleSchema = z.object({
  role: z.enum(['USER', 'ADMIN']),
})

const suspendSchema = z.object({
  suspended: z.boolean(),
})

const listPaymentsSchema = z.object({
  search: z.string().trim().optional(),
  status: z.enum(['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED']).optional(),
  page:   z.coerce.number().int().min(1).optional(),
})

const listReportsSchema = z.object({
  status: z.enum(['OPEN', 'RESOLVED']).optional(),
  page:   z.coerce.number().int().min(1).optional(),
})

const updateReportSchema = z.object({
  status:    z.enum(['OPEN', 'RESOLVED']),
  adminNote: z.string().trim().max(500).optional(),
})

export async function adminPlugin(server: FastifyInstance): Promise<void> {
  // Every route in this plugin requires admin role
  server.addHook('preHandler', adminMiddleware)

  /* ── Dashboard ── */
  server.get('/stats', async () => adminService.getStats())

  /* ── Users ── */
  server.get('/users', async (request) => {
    const { search, page } = listUsersSchema.parse(request.query)
    return adminService.listUsers({ search, page })
  })

  server.get('/users/:id', async (request) => {
    const { id } = request.params as { id: string }
    return adminService.getUserDetail(id)
  })

  server.post('/users/:id/credits', async (request, reply) => {
    const { id } = request.params as { id: string }
    const { amount, description } = grantCreditsSchema.parse(request.body)
    const result = await adminService.grantCredits(id, amount, description ?? '')
    return reply.status(201).send(result)
  })

  server.patch('/users/:id/role', async (request) => {
    const { id } = request.params as { id: string }
    const { role } = roleSchema.parse(request.body)
    if (id === request.user.id && role !== 'ADMIN') {
      throw new ForbiddenError('No puedes quitarte tu propio rol de administrador')
    }
    return adminService.setRole(id, role)
  })

  server.patch('/users/:id/suspend', async (request) => {
    const { id } = request.params as { id: string }
    const { suspended } = suspendSchema.parse(request.body)
    if (id === request.user.id) {
      throw new ForbiddenError('No puedes suspender tu propia cuenta')
    }
    return adminService.setSuspended(id, suspended)
  })

  server.delete('/users/:id', async (request) => {
    const { id } = request.params as { id: string }
    if (id === request.user.id) {
      throw new ForbiddenError('No puedes eliminar tu propia cuenta desde el panel admin')
    }
    return adminService.deleteUser(id)
  })

  /* ── Payments ── */
  server.get('/payments', async (request) => {
    const { search, status, page } = listPaymentsSchema.parse(request.query)
    return adminService.listPayments({ search, status, page })
  })

  /* ── Reports ── */
  server.get('/reports', async (request) => {
    const { status, page } = listReportsSchema.parse(request.query)
    return adminService.listReports({ status, page })
  })

  server.patch('/reports/:id', async (request) => {
    const { id } = request.params as { id: string }
    const { status, adminNote } = updateReportSchema.parse(request.body)
    return adminService.setReportStatus(id, status, adminNote)
  })
}
