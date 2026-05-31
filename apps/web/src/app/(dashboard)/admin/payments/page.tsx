'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  IconSearch, IconLoader2, IconChevronLeft, IconChevronRight,
} from '@tabler/icons-react'
import { api } from '@/lib/api-client'

type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED'

interface Payment {
  id: string
  paypalOrderId: string
  amountUsd: number
  creditsPurchased: number
  status: PaymentStatus
  pack: string
  createdAt: string
  user: { id: string; email: string; name: string | null }
}

interface PaymentsResponse {
  payments: Payment[]; total: number; page: number; totalPages: number
}

const STATUS_META: Record<PaymentStatus, { label: string; cls: string }> = {
  COMPLETED: { label: 'Completado', cls: 'bg-[#10B981]/10 text-[#10B981]' },
  PENDING:   { label: 'Pendiente',  cls: 'bg-[#F59E0B]/10 text-[#F59E0B]' },
  FAILED:    { label: 'Fallido',    cls: 'bg-[#EF4444]/10 text-[#EF4444]' },
  REFUNDED:  { label: 'Reembolso',  cls: 'bg-[#3B82F6]/10 text-[#3B82F6]' },
}

const FILTERS: { value: PaymentStatus | ''; label: string }[] = [
  { value: '',          label: 'Todos'       },
  { value: 'COMPLETED', label: 'Completados' },
  { value: 'PENDING',   label: 'Pendientes'  },
  { value: 'FAILED',    label: 'Fallidos'    },
  { value: 'REFUNDED',  label: 'Reembolsos'  },
]

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function AdminPaymentsPage() {
  const [search, setSearch] = useState('')
  const [query,  setQuery]  = useState('')
  const [status, setStatus] = useState<PaymentStatus | ''>('')
  const [page,   setPage]   = useState(1)
  const [data,   setData]   = useState<PaymentsResponse | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (query)  params.set('search', query)
      if (status) params.set('status', status)
      params.set('page', String(page))
      const res = await api.get<PaymentsResponse>(`/admin/payments?${params.toString()}`)
      setData(res)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [query, status, page])

  useEffect(() => { void load() }, [load])

  function submitSearch(e: React.FormEvent) {
    e.preventDefault()
    setPage(1)
    setQuery(search.trim())
  }

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <form onSubmit={submitSearch} className="relative flex-1 max-w-[360px]">
          <IconSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A1A1AA]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por email o nº de orden..."
            className="input !pl-9"
          />
        </form>
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {FILTERS.map((f) => (
            <button
              key={f.value || 'all'}
              onClick={() => { setStatus(f.value); setPage(1) }}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                status === f.value ? 'bg-[#09090B] text-white' : 'bg-[#F4F4F5] text-[#71717A] hover:bg-[#E4E4E7]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {loading && !data ? (
        <div className="flex justify-center py-20"><IconLoader2 size={24} className="text-[#A1A1AA] animate-spin" /></div>
      ) : !data || data.payments.length === 0 ? (
        <p className="text-sm text-[#71717A] py-12 text-center">No se encontraron pagos.</p>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block card !p-0 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E4E4E7] text-left text-[11px] uppercase tracking-wide text-[#A1A1AA]">
                  <th className="px-4 py-3 font-semibold">Usuario</th>
                  <th className="px-4 py-3 font-semibold">Pack</th>
                  <th className="px-4 py-3 font-semibold">Monto</th>
                  <th className="px-4 py-3 font-semibold">Créditos</th>
                  <th className="px-4 py-3 font-semibold">Estado</th>
                  <th className="px-4 py-3 font-semibold">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {data.payments.map((p) => (
                  <tr key={p.id} className="border-b border-[#F4F4F5] last:border-0 hover:bg-[#FAFAFA] transition-colors">
                    <td className="px-4 py-3 min-w-0">
                      <p className="font-medium text-[#09090B] truncate">{p.user.name ?? '—'}</p>
                      <p className="text-xs text-[#71717A] truncate">{p.user.email}</p>
                    </td>
                    <td className="px-4 py-3 text-[#71717A]">{p.pack}</td>
                    <td className="px-4 py-3 font-semibold text-[#09090B]">${p.amountUsd.toFixed(2)}</td>
                    <td className="px-4 py-3 text-[#71717A]">{p.creditsPurchased.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${STATUS_META[p.status].cls}`}>
                        {STATUS_META[p.status].label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[#71717A] whitespace-nowrap">{fmtDate(p.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-2">
            {data.payments.map((p) => (
              <div key={p.id} className="card !p-3">
                <div className="flex items-center justify-between mb-1.5">
                  <p className="font-medium text-[#09090B] text-sm truncate mr-2">{p.user.email}</p>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${STATUS_META[p.status].cls}`}>
                    {STATUS_META[p.status].label}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-[#71717A]">
                  <span>{p.pack} · {p.creditsPurchased} créditos</span>
                  <span className="font-semibold text-[#09090B]">${p.amountUsd.toFixed(2)}</span>
                </div>
                <p className="text-[10px] text-[#A1A1AA] mt-1">{fmtDate(p.createdAt)}</p>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {data.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-xs text-[#71717A]">{data.total} pagos · página {data.page} de {data.totalPages}</p>
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
    </div>
  )
}
