import type { FastifyRequest, FastifyReply } from 'fastify'
import { createClient } from '@supabase/supabase-js'
import { prisma } from '../lib/prisma'
import { UnauthorizedError } from '../lib/errors'

const supabase = createClient(
  process.env['SUPABASE_URL']!,
  process.env['SUPABASE_SERVICE_ROLE_KEY']!,
)

declare module 'fastify' {
  interface FastifyRequest {
    user: {
      id: string
      supabaseId: string
      email: string
      name: string | null
    }
  }
}

export async function authMiddleware(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const authHeader = request.headers['authorization']
  if (!authHeader?.startsWith('Bearer ')) {
    const err = new UnauthorizedError('Missing authorization header')
    return reply.status(401).send({ error: err.code, message: err.message })
  }

  const token = authHeader.slice(7)

  const { data: { user: supabaseUser }, error } = await supabase.auth.getUser(token)
  if (error || !supabaseUser?.email) {
    const err = new UnauthorizedError('Invalid or expired token')
    return reply.status(401).send({ error: err.code, message: err.message })
  }

  let dbUser = await prisma.user.findUnique({
    where: { supabaseId: supabaseUser.id },
  })

  if (!dbUser) {
    dbUser = await prisma.user.create({
      data: {
        supabaseId: supabaseUser.id,
        email: supabaseUser.email,
        name: supabaseUser.user_metadata?.['full_name'] as string | undefined,
        creditAccount: {
          create: { balance: 0, lifetimeCredits: 0 },
        },
      },
    })
  }

  request.user = {
    id:         dbUser.id,
    supabaseId: dbUser.supabaseId,
    email:      dbUser.email,
    name:       dbUser.name,
  }
}
