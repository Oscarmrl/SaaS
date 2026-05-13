import { createClient } from '@supabase/supabase-js'

if (!process.env['SUPABASE_URL'])              throw new Error('SUPABASE_URL is required')
if (!process.env['SUPABASE_SERVICE_ROLE_KEY']) throw new Error('SUPABASE_SERVICE_ROLE_KEY is required')

export const supabaseAdmin = createClient(
  process.env['SUPABASE_URL']!,
  process.env['SUPABASE_SERVICE_ROLE_KEY']!,
  { auth: { autoRefreshToken: false, persistSession: false } },
)

const STORAGE_MARKER = '/object/public/'

/** Extrae el path relativo al bucket desde una URL pública de Supabase Storage */
export function extractSupabaseStoragePath(url: string): { bucket: string; path: string } | null {
  const idx = url.indexOf(STORAGE_MARKER)
  if (idx === -1) return null
  const afterMarker = url.slice(idx + STORAGE_MARKER.length)
  const slashIdx = afterMarker.indexOf('/')
  if (slashIdx === -1) return null
  return {
    bucket: afterMarker.slice(0, slashIdx),
    path:   afterMarker.slice(slashIdx + 1),
  }
}
