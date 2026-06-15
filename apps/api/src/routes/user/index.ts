import type { FastifyPluginAsync } from 'fastify'
import { z } from 'zod'
import { prisma } from '../../lib/prisma'
import { supabaseAdmin, extractSupabaseStoragePath } from '../../lib/supabase-admin'
import { deleteFromR2 } from '../../lib/r2'

const UpdateUserSchema = z.object({
  name: z.string().min(1).max(100).trim(),
})

export const userPlugin: FastifyPluginAsync = async (instance) => {

  // GET /user/me
  instance.get('/me', async (request, reply) => {
    const user = await prisma.user.findUnique({
      where:  { id: request.user.id },
      select: { id: true, email: true, name: true, role: true, onboardedAt: true, createdAt: true },
    })
    return reply.send(user)
  })

  // POST /user/tour-complete — marca un tour de onboarding como visto.
  // Se guarda en user_metadata.completed_tours (Supabase): por-cuenta y cross-device,
  // sin necesidad de columnas extra en la DB.
  instance.post('/tour-complete', async (request, reply) => {
    const { key } = z.object({ key: z.string().min(1).max(50) }).parse(request.body)

    const { data } = await supabaseAdmin.auth.admin.getUserById(request.user.supabaseId)
    const current = (data.user?.user_metadata?.['completed_tours'] as string[] | undefined) ?? []

    if (!current.includes(key)) {
      await supabaseAdmin.auth.admin.updateUserById(request.user.supabaseId, {
        user_metadata: { completed_tours: [...current, key] },
      })
    }
    return reply.send({ ok: true })
  })

  // PATCH /user — update display name in Prisma + Supabase metadata
  instance.patch('/', async (request, reply) => {
    const { name } = UpdateUserSchema.parse(request.body)

    await prisma.user.update({
      where: { id: request.user.id },
      data:  { name },
    })

    await supabaseAdmin.auth.admin.updateUserById(request.user.supabaseId, {
      user_metadata: { full_name: name },
    })

    return reply.send({ name })
  })

  // DELETE /user — full account deletion with storage cleanup
  instance.delete('/', async (request, reply) => {
    const { id: userId, supabaseId } = request.user

    // 1. Collect R2 keys from generated assets
    const assets = await prisma.generatedAsset.findMany({
      where:  { userId },
      select: { url: true, thumbnailUrl: true },
    })

    const r2PublicUrl = (process.env['R2_PUBLIC_URL'] ?? '').replace(/\/$/, '')
    const r2Keys = assets.flatMap(({ url, thumbnailUrl }) =>
      [url, thumbnailUrl].flatMap(u => {
        if (u && r2PublicUrl && u.startsWith(r2PublicUrl + '/')) {
          return [u.slice(r2PublicUrl.length + 1)]
        }
        return []
      })
    )

    // 2. Collect Supabase Storage paths from brand images
    const brands = await prisma.brand.findMany({
      where:  { userId },
      select: { logoUrl: true, referenceImageUrls: true },
    })

    const storageByBucket = new Map<string, string[]>()
    for (const { logoUrl, referenceImageUrls } of brands) {
      const urls = [...referenceImageUrls]
      if (logoUrl) urls.push(logoUrl)
      for (const url of urls) {
        const parsed = extractSupabaseStoragePath(url)
        if (!parsed) continue
        const paths = storageByBucket.get(parsed.bucket) ?? []
        paths.push(parsed.path)
        storageByBucket.set(parsed.bucket, paths)
      }
    }

    // 3. Delete external files — don't fail account deletion if storage cleanup fails
    await Promise.allSettled([
      ...r2Keys.map(key => deleteFromR2(key)),
      ...[...storageByBucket.entries()].map(([bucket, paths]) =>
        supabaseAdmin.storage.from(bucket).remove(paths)
      ),
    ])

    // 4. Delete from Prisma — cascades all related data (credits, brands, assets, jobs)
    await prisma.user.delete({ where: { id: userId } })

    // 5. Delete from Supabase Auth
    await supabaseAdmin.auth.admin.deleteUser(supabaseId)

    return reply.status(204).send()
  })
}
