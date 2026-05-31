import type { FastifyRequest, FastifyReply } from 'fastify'
import { createClient } from '@supabase/supabase-js'
import type { UserRole } from '@prisma/client'
import { prisma } from '../lib/prisma'
import { UnauthorizedError, ForbiddenError } from '../lib/errors'

const supabase = createClient(
  process.env['SUPABASE_URL']!,
  process.env['SUPABASE_SERVICE_ROLE_KEY']!,
)

// Emails listed here are auto-promoted to ADMIN on login (bootstrap mechanism).
const ADMIN_EMAILS = new Set(
  (process.env['ADMIN_EMAILS'] ?? '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean),
)

declare module 'fastify' {
  interface FastifyRequest {
    user: {
      id: string
      supabaseId: string
      email: string
      name: string | null
      role: UserRole
      suspended: boolean
    }
  }
}

/* ── In-memory auth cache ────────────────────────────────────
   Caches the resolved user for each JWT token for 60 seconds.
   Eliminates 2 round-trips (Supabase + Prisma) on repeat requests
   from the same session (e.g. polling every 2500ms uses the same token).
   TTL is well within Supabase's 1-hour token lifetime.
───────────────────────────────────────────────────────────── */
interface CachedUser {
  id: string; supabaseId: string; email: string; name: string | null
  role: UserRole; suspended: boolean
  expiresAt: number
}

const authCache = new Map<string, CachedUser>()
const CACHE_TTL = 60_000 // 60 seconds

// Periodic cleanup to prevent unbounded memory growth
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of authCache) {
    if (entry.expiresAt < now) authCache.delete(key)
  }
}, 5 * 60_000).unref()

export async function authMiddleware(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const authHeader = request.headers['authorization']
  if (!authHeader?.startsWith('Bearer ')) {
    const err = new UnauthorizedError('Missing authorization header')
    return reply.status(401).send({ error: err.code, message: err.message })
  }

  const token = authHeader.slice(7)

  // Cache hit — skip both Supabase and DB round-trips
  const cached = authCache.get(token)
  if (cached && cached.expiresAt > Date.now()) {
    if (cached.suspended) {
      const err = new ForbiddenError('Account suspended')
      return reply.status(403).send({ error: err.code, message: err.message })
    }
    request.user = {
      id: cached.id, supabaseId: cached.supabaseId, email: cached.email,
      name: cached.name, role: cached.role, suspended: cached.suspended,
    }
    return
  }

  // Cache miss — validate with Supabase
  const { data: { user: supabaseUser }, error } = await supabase.auth.getUser(token)
  if (error || !supabaseUser?.email) {
    authCache.delete(token) // evict stale entry if any
    const err = new UnauthorizedError('Invalid or expired token')
    return reply.status(401).send({ error: err.code, message: err.message })
  }

  // Resolve internal user (upsert on first login)
  let dbUser = await prisma.user.findUnique({
    where:  { supabaseId: supabaseUser.id },
    select: { id: true, supabaseId: true, email: true, name: true, role: true, suspended: true },
  })

  if (!dbUser) {
    dbUser = await prisma.user.create({
      data: {
        supabaseId: supabaseUser.id,
        email:      supabaseUser.email,
        name:       supabaseUser.user_metadata?.['full_name'] as string | undefined,
        role:       ADMIN_EMAILS.has(supabaseUser.email.toLowerCase()) ? 'ADMIN' : 'USER',
        creditAccount: { create: { balance: 0, lifetimeCredits: 0 } },
      },
      select: { id: true, supabaseId: true, email: true, name: true, role: true, suspended: true },
    })
  } else if (dbUser.role !== 'ADMIN' && ADMIN_EMAILS.has(dbUser.email.toLowerCase())) {
    // Bootstrap: auto-promote allow-listed emails on subsequent logins
    dbUser = await prisma.user.update({
      where:  { id: dbUser.id },
      data:   { role: 'ADMIN' },
      select: { id: true, supabaseId: true, email: true, name: true, role: true, suspended: true },
    })
  }

  // Block suspended accounts
  if (dbUser.suspended) {
    authCache.set(token, { ...dbUser, expiresAt: Date.now() + CACHE_TTL })
    const err = new ForbiddenError('Account suspended')
    return reply.status(403).send({ error: err.code, message: err.message })
  }

  // Populate cache
  authCache.set(token, { ...dbUser, expiresAt: Date.now() + CACHE_TTL })

  request.user = dbUser
}
