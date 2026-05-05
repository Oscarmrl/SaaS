import { createClient } from './supabase'

const API_URL = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:3001'

async function getAuthHeader(): Promise<{ Authorization: string }> {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.access_token) throw new Error('Not authenticated')
  return { Authorization: `Bearer ${session.access_token}` }
}

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const authHeader = await getAuthHeader()
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...authHeader,
      ...(options.headers ?? {}),
    },
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({ message: res.statusText }))
    throw new Error((body as { message?: string }).message ?? 'API error')
  }

  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

export const api = {
  get:    <T>(path: string) => request<T>(path),
  post:   <T>(path: string, body: unknown) => request<T>(path, { method: 'POST',   body: JSON.stringify(body) }),
  patch:  <T>(path: string, body: unknown) => request<T>(path, { method: 'PATCH',  body: JSON.stringify(body) }),
  delete: <T>(path: string) =>               request<T>(path, { method: 'DELETE' }),
}
