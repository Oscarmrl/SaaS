import type { FastifyRequest, FastifyReply } from 'fastify'
import { ForbiddenError } from '../lib/errors'

/**
 * Gate for admin-only routes. Must run AFTER authMiddleware, which populates
 * `request.user` (including `role`). Returns 403 for non-admins.
 */
export async function adminMiddleware(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  if (request.user?.role !== 'ADMIN') {
    const err = new ForbiddenError('Admin access required')
    return reply.status(403).send({ error: err.code, message: err.message })
  }
}
