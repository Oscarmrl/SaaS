'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  IconLoader2, IconChevronLeft, IconChevronRight, IconAlertTriangle,
  IconCircleCheck, IconRotateClockwise, IconMessage2,
} from '@tabler/icons-react'
import toast from 'react-hot-toast'
import { api } from '@/lib/api-client'

type ReportStatus = 'OPEN' | 'RESOLVED'

interface Report {
  id: string
  message: string | null
  status: ReportStatus
  adminNote: string | null
  createdAt: string
  user: { id: string; email: string }
  job: {
    id: string
    type: string
    provider: string
    userPrompt: string
    errorMessage: string | null
    createdAt: string
    brand: { id: string; name: string } | null
  }
}

interface ReportsResponse {
  reports: Report[]; total: number; openCount: number; page: number; totalPages: number
}

const TYPE_LABEL: Record<string, string> = {
  IMAGE: 'Imagen', IMAGE_HD: 'Imagen HD', BANNER: 'Banner',
  VIDEO_8S: 'Video 8s', VIDEO_15S: 'Video 15s', VIDEO_30S: 'Video 30s', CAPTION: 'Caption',
}

const STATUS_FILTERS: { value: ReportStatus | ''; label: string }[] = [
  { value: '',         label: 'Todos'     },
  { value: 'OPEN',     label: 'Abiertos'  },
  { value: 'RESOLVED', label: 'Resueltos' },
]

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
}

export default function AdminReportsPage() {
  const [status, setStatus] = useState<ReportStatus | ''>('')
  const [page,   setPage]   = useState(1)
  const [data,   setData]   = useState<ReportsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (status) params.set('status', status)
      params.set('page', String(page))
      const res = await api.get<ReportsResponse>(`/admin/reports?${params.toString()}`)
      setData(res)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [status, page])

  useEffect(() => { void load() }, [load])

  async function changeStatus(id: string, next: ReportStatus) {
    setUpdating(id)
    try {
      await api.patch(`/admin/reports/${id}`, { status: next })
      toast.success(next === 'RESOLVED' ? 'Reporte marcado como resuelto' : 'Reporte reabierto')
      await load()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'No se pudo actualizar el reporte')
    } finally {
      setUpdating(null)
    }
  }

  return (
    <div>
      {/* Status filter */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 mb-4">
        {STATUS_FILTERS.map((f) => (
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
        {data && data.openCount > 0 && (
          <span className="ml-auto flex-shrink-0 text-[11px] font-semibold text-[#7C3AED] bg-[#EDE9FE] px-2.5 py-1 rounded-full">
            {data.openCount} abierto{data.openCount === 1 ? '' : 's'}
          </span>
        )}
      </div>

      {loading && !data ? (
        <div className="flex justify-center py-20"><IconLoader2 size={24} className="text-[#A1A1AA] animate-spin" /></div>
      ) : !data || data.reports.length === 0 ? (
        <p className="text-sm text-[#71717A] py-12 text-center">No hay reportes.</p>
      ) : (
        <>
          <div className="space-y-2">
            {data.reports.map((r) => (
              <div key={r.id} className="card !p-3.5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#F4F4F5] text-[#3F3F46]">
                        {TYPE_LABEL[r.job.type] ?? r.job.type}
                      </span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        r.status === 'OPEN' ? 'bg-[#F59E0B]/10 text-[#F59E0B]' : 'bg-[#10B981]/10 text-[#10B981]'
                      }`}>
                        {r.status === 'OPEN' ? 'Abierto' : 'Resuelto'}
                      </span>
                      <span className="text-[10px] text-[#A1A1AA]">{r.job.provider}</span>
                    </div>

                    <p className="text-sm text-[#09090B] truncate">{r.job.userPrompt || '—'}</p>
                    <p className="text-xs text-[#71717A] truncate mt-0.5">
                      {r.user.email}{r.job.brand ? ` · ${r.job.brand.name}` : ''}
                    </p>

                    {r.job.errorMessage && (
                      <p className="flex items-start gap-1 text-[11px] text-red-500 mt-1.5 leading-snug">
                        <IconAlertTriangle size={13} className="flex-shrink-0 mt-px" />
                        <span className="truncate">{r.job.errorMessage}</span>
                      </p>
                    )}

                    {r.message && (
                      <p className="flex items-start gap-1.5 text-[11px] text-[#3F3F46] mt-1.5 leading-snug bg-[#FAFAFA] border border-[#E4E4E7] rounded-[8px] px-2.5 py-1.5">
                        <IconMessage2 size={13} className="flex-shrink-0 mt-px text-[#A1A1AA]" />
                        <span>{r.message}</span>
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <p className="text-[10px] text-[#A1A1AA] whitespace-nowrap">{fmtDate(r.createdAt)}</p>
                    {r.status === 'OPEN' ? (
                      <button
                        onClick={() => changeStatus(r.id, 'RESOLVED')}
                        disabled={updating === r.id}
                        className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1.5 rounded-[8px] bg-[#09090B] text-white hover:bg-[#18181B] disabled:opacity-50 transition-colors whitespace-nowrap"
                      >
                        {updating === r.id
                          ? <IconLoader2 size={13} className="animate-spin" />
                          : <IconCircleCheck size={13} stroke={1.8} />}
                        Resolver
                      </button>
                    ) : (
                      <button
                        onClick={() => changeStatus(r.id, 'OPEN')}
                        disabled={updating === r.id}
                        className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1.5 rounded-[8px] border border-[#E4E4E7] text-[#71717A] hover:bg-[#F4F4F5] disabled:opacity-50 transition-colors whitespace-nowrap"
                      >
                        {updating === r.id
                          ? <IconLoader2 size={13} className="animate-spin" />
                          : <IconRotateClockwise size={13} stroke={1.8} />}
                        Reabrir
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {data.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-xs text-[#71717A]">{data.total} reportes · página {data.page} de {data.totalPages}</p>
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
