'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  IconSearch, IconLoader2, IconShieldLock, IconBan, IconTrash,
  IconCoins, IconChevronLeft, IconChevronRight, IconX,
} from '@tabler/icons-react'
import toast from 'react-hot-toast'
import { api } from '@/lib/api-client'

interface UserRow {
  id: string
  email: string
  name: string | null
  role: 'USER' | 'ADMIN'
  suspended: boolean
  createdAt: string
  creditAccount: { balance: number; lifetimeCredits: number } | null
  _count: { brands: number; generatedAssets: number; payments: number }
}

interface UsersResponse {
  users: UserRow[]; total: number; page: number; totalPages: number
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function AdminUsersPage() {
  const [search, setSearch]   = useState('')
  const [query,  setQuery]    = useState('')
  const [page,   setPage]     = useState(1)
  const [data,   setData]     = useState<UsersResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (query) params.set('search', query)
      params.set('page', String(page))
      const res = await api.get<UsersResponse>(`/admin/users?${params.toString()}`)
      setData(res)
    } catch {
      toast.error('Error al cargar usuarios')
    } finally {
      setLoading(false)
    }
  }, [query, page])

  useEffect(() => { void load() }, [load])

  function submitSearch(e: React.FormEvent) {
    e.preventDefault()
    setPage(1)
    setQuery(search.trim())
  }

  return (
    <div>
      {/* Search */}
      <form onSubmit={submitSearch} className="relative mb-4 max-w-[360px]">
        <IconSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A1A1AA]" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nombre o email..."
          className="input !pl-9"
        />
      </form>

      {loading && !data ? (
        <div className="flex justify-center py-20"><IconLoader2 size={24} className="text-[#A1A1AA] animate-spin" /></div>
      ) : !data || data.users.length === 0 ? (
        <p className="text-sm text-[#71717A] py-12 text-center">No se encontraron usuarios.</p>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block card !p-0 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E4E4E7] text-left text-[11px] uppercase tracking-wide text-[#A1A1AA]">
                  <th className="px-4 py-3 font-semibold">Usuario</th>
                  <th className="px-4 py-3 font-semibold">Rol</th>
                  <th className="px-4 py-3 font-semibold">Balance</th>
                  <th className="px-4 py-3 font-semibold">Marcas</th>
                  <th className="px-4 py-3 font-semibold">Assets</th>
                  <th className="px-4 py-3 font-semibold">Registro</th>
                </tr>
              </thead>
              <tbody>
                {data.users.map((u) => (
                  <tr
                    key={u.id}
                    onClick={() => setSelectedId(u.id)}
                    className="border-b border-[#F4F4F5] last:border-0 hover:bg-[#FAFAFA] cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-[#09090B] flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-bold text-white">{(u.name ?? u.email).charAt(0).toUpperCase()}</span>
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-[#09090B] truncate">{u.name ?? '—'}</p>
                          <p className="text-xs text-[#71717A] truncate">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <RoleBadge role={u.role} suspended={u.suspended} />
                    </td>
                    <td className="px-4 py-3 font-semibold text-[#09090B]">{u.creditAccount?.balance ?? 0}</td>
                    <td className="px-4 py-3 text-[#71717A]">{u._count.brands}</td>
                    <td className="px-4 py-3 text-[#71717A]">{u._count.generatedAssets}</td>
                    <td className="px-4 py-3 text-[#71717A] whitespace-nowrap">{fmtDate(u.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-2">
            {data.users.map((u) => (
              <button
                key={u.id}
                onClick={() => setSelectedId(u.id)}
                className="card !p-3 w-full text-left flex items-center gap-3"
              >
                <div className="w-9 h-9 rounded-full bg-[#09090B] flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-white">{(u.name ?? u.email).charAt(0).toUpperCase()}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-[#09090B] text-sm truncate">{u.name ?? u.email}</p>
                  <p className="text-xs text-[#71717A] truncate">{u.email}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <RoleBadge role={u.role} suspended={u.suspended} />
                  <p className="text-xs text-[#71717A] mt-1">{u.creditAccount?.balance ?? 0} créditos</p>
                </div>
              </button>
            ))}
          </div>

          {/* Pagination */}
          {data.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-xs text-[#71717A]">{data.total} usuarios · página {data.page} de {data.totalPages}</p>
              <div className="flex gap-1.5">
                <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}
                  className="w-8 h-8 flex items-center justify-center rounded-[8px] border border-[#E4E4E7] text-[#71717A] hover:bg-[#F4F4F5] disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                  <IconChevronLeft size={16} />
                </button>
                <button disabled={page >= data.totalPages} onClick={() => setPage((p) => p + 1)}
                  className="w-8 h-8 flex items-center justify-center rounded-[8px] border border-[#E4E4E7] text-[#71717A] hover:bg-[#F4F4F5] disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                  <IconChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {selectedId && (
        <UserDetailModal
          userId={selectedId}
          onClose={() => setSelectedId(null)}
          onChanged={load}
        />
      )}
    </div>
  )
}

function RoleBadge({ role, suspended }: { role: 'USER' | 'ADMIN'; suspended: boolean }) {
  if (suspended) {
    return <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-red-50 text-red-600">Suspendido</span>
  }
  if (role === 'ADMIN') {
    return <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#EDE9FE] text-[#7C3AED]">Admin</span>
  }
  return <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#F4F4F5] text-[#71717A]">Usuario</span>
}

/* ── Detail modal ──────────────────────────────────────────── */
interface UserDetail {
  id: string; email: string; name: string | null; role: 'USER' | 'ADMIN'
  suspended: boolean; createdAt: string
  creditAccount: { balance: number; lifetimeCredits: number } | null
  _count: { brands: number; generatedAssets: number; generationJobs: number }
  payments: { id: string; amountUsd: number; creditsPurchased: number; status: string; pack: string; createdAt: string }[]
  transactions: { id: string; amount: number; type: string; description: string; createdAt: string }[]
  brands: { id: string; name: string; industry: string | null; createdAt: string }[]
}

function UserDetailModal({ userId, onClose, onChanged }: {
  userId: string; onClose: () => void; onChanged: () => void
}) {
  const [user, setUser]       = useState<UserDetail | null>(null)
  const [busy, setBusy]       = useState(false)
  const [grantAmount, setGrantAmount] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)

  const load = useCallback(async () => {
    try {
      const data = await api.get<UserDetail>(`/admin/users/${userId}`)
      setUser(data)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Error al cargar usuario')
    }
  }, [userId])

  useEffect(() => { void load() }, [load])

  async function run(fn: () => Promise<unknown>, successMsg?: string) {
    setBusy(true)
    try {
      await fn()
      await load()
      onChanged()
      if (successMsg) toast.success(successMsg)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Error en la operación')
    } finally {
      setBusy(false)
    }
  }

  async function grant() {
    const amount = parseInt(grantAmount, 10)
    if (!amount || amount <= 0) return
    await run(() => api.post(`/admin/users/${userId}/credits`, { amount }), `${amount} créditos otorgados`)
    setGrantAmount('')
  }

  async function deleteUser() {
    setBusy(true)
    try {
      await api.delete(`/admin/users/${userId}`)
      toast.success('Usuario eliminado')
      onChanged()
      onClose()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Error al eliminar')
      setBusy(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center px-4 py-8 overflow-y-auto">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-[16px] w-full max-w-[560px] shadow-2xl">
        {!user ? (
          <div className="flex justify-center py-20"><IconLoader2 size={24} className="text-[#A1A1AA] animate-spin" /></div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-start justify-between p-5 border-b border-[#F4F4F5]">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-11 h-11 rounded-full bg-[#09090B] flex items-center justify-center flex-shrink-0">
                  <span className="text-base font-bold text-white">{(user.name ?? user.email).charAt(0).toUpperCase()}</span>
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-[#09090B] truncate">{user.name ?? '—'}</p>
                  <p className="text-xs text-[#71717A] truncate">{user.email}</p>
                  <div className="mt-1"><RoleBadge role={user.role} suspended={user.suspended} /></div>
                </div>
              </div>
              <button onClick={onClose} className="text-[#A1A1AA] hover:text-[#09090B] transition-colors flex-shrink-0">
                <IconX size={20} />
              </button>
            </div>

            <div className="p-5 space-y-5 max-h-[60vh] overflow-y-auto">

              {/* Stats */}
              <div className="grid grid-cols-3 gap-2">
                <MiniStat label="Balance" value={user.creditAccount?.balance ?? 0} />
                <MiniStat label="Marcas" value={user._count.brands} />
                <MiniStat label="Assets" value={user._count.generatedAssets} />
              </div>

              {/* Grant credits */}
              <div>
                <p className="text-xs font-semibold text-[#3F3F46] mb-2 flex items-center gap-1.5">
                  <IconCoins size={14} /> Otorgar créditos (bonus)
                </p>
                <div className="flex gap-2">
                  <input
                    type="number" min={1} value={grantAmount}
                    onChange={(e) => setGrantAmount(e.target.value)}
                    placeholder="Cantidad" className="input flex-1"
                  />
                  <button onClick={grant} disabled={busy || !grantAmount}
                    className="btn-primary text-xs px-4 whitespace-nowrap">Otorgar</button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => run(
                    () => api.patch(`/admin/users/${userId}/role`, { role: user.role === 'ADMIN' ? 'USER' : 'ADMIN' }),
                    user.role === 'ADMIN' ? 'Rol cambiado a Usuario' : 'Rol cambiado a Admin',
                  )}
                  disabled={busy}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-[8px] border border-[#E4E4E7] text-[#3F3F46] hover:bg-[#F4F4F5] transition-colors">
                  <IconShieldLock size={14} />
                  {user.role === 'ADMIN' ? 'Quitar admin' : 'Hacer admin'}
                </button>
                <button
                  onClick={() => run(
                    () => api.patch(`/admin/users/${userId}/suspend`, { suspended: !user.suspended }),
                    user.suspended ? 'Cuenta reactivada' : 'Cuenta suspendida',
                  )}
                  disabled={busy}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-[8px] border border-[#E4E4E7] text-[#3F3F46] hover:bg-[#F4F4F5] transition-colors">
                  <IconBan size={14} />
                  {user.suspended ? 'Reactivar' : 'Suspender'}
                </button>
                {!confirmDelete ? (
                  <button onClick={() => setConfirmDelete(true)} disabled={busy}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-[8px] border border-red-200 text-red-600 hover:bg-red-50 transition-colors ml-auto">
                    <IconTrash size={14} /> Eliminar
                  </button>
                ) : (
                  <div className="flex gap-2 ml-auto">
                    <button onClick={() => setConfirmDelete(false)} disabled={busy}
                      className="px-3 py-2 text-xs font-semibold rounded-[8px] border border-[#E4E4E7] text-[#71717A] hover:bg-[#F4F4F5]">Cancelar</button>
                    <button onClick={deleteUser} disabled={busy}
                      className="px-3 py-2 text-xs font-semibold rounded-[8px] bg-red-500 text-white hover:bg-red-600 disabled:opacity-50">
                      {busy ? 'Eliminando...' : 'Confirmar'}
                    </button>
                  </div>
                )}
              </div>

              {/* Brands */}
              {user.brands.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-[#3F3F46] mb-2">Marcas ({user.brands.length})</p>
                  <div className="space-y-1">
                    {user.brands.map((b) => (
                      <div key={b.id} className="flex items-center justify-between text-xs px-3 py-2 rounded-[8px] bg-[#FAFAFA]">
                        <span className="font-medium text-[#09090B]">{b.name}</span>
                        <span className="text-[#A1A1AA]">{b.industry ?? '—'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent transactions */}
              {user.transactions.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-[#3F3F46] mb-2">Transacciones recientes</p>
                  <div className="space-y-1">
                    {user.transactions.slice(0, 8).map((t) => (
                      <div key={t.id} className="flex items-center justify-between text-xs px-3 py-1.5">
                        <span className="text-[#71717A] truncate mr-2">{t.description}</span>
                        <span className={`font-semibold flex-shrink-0 ${t.amount >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                          {t.amount >= 0 ? '+' : ''}{t.amount}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-[10px] bg-[#FAFAFA] border border-[#F4F4F5] p-3 text-center">
      <p className="text-lg font-bold text-[#09090B]">{value.toLocaleString()}</p>
      <p className="text-[10px] text-[#71717A]">{label}</p>
    </div>
  )
}
