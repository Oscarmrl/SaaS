'use client'

import { useEffect, useState, useCallback } from 'react'
import { IconLoader2, IconChevronLeft, IconChevronRight, IconAlertTriangle } from '@tabler/icons-react'
import { api } from '@/lib/api-client'

type JobStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'
type AssetType = 'IMAGE' | 'BANNER' | 'VIDEO_15S' | 'VIDEO_30S' | 'CAPTION'

interface Job {
  id: string
  type: AssetType
  status: JobStatus
  userPrompt: string
  provider: string
  creditsRequired: number
  creditsCharged: number | null
  errorMessage: string | null
  createdAt: string
  user:  { id: string; email: string }
  brand: { id: string; name: string }
}

interface JobsResponse {
  jobs: Job[]; total: number; page: number; totalPages: number
}

const STATUS_META: Record<JobStatus, { label: string; cls: string }> = {
  COMPLETED:  { label: 'Completado', cls: 'bg-[#10B981]/10 text-[#10B981]' },
  PROCESSING: { label: 'Procesando', cls: 'bg-[#3B82F6]/10 text-[#3B82F6]' },
  PENDING:    { label: 'Pendiente',  cls: 'bg-[#F59E0B]/10 text-[#F59E0B]' },
  FAILED:     { label: 'Fallido',    cls: 'bg-[#EF4444]/10 text-[#EF4444]' },
}

const TYPE_LABEL: Record<AssetType, string> = {
  IMAGE: 'Imagen', BANNER: 'Banner', VIDEO_15S: 'Video 15s', VIDEO_30S: 'Video 30s', CAPTION: 'Caption',
}

const STATUS_FILTERS: { value: JobStatus | ''; label: string }[] = [
  { value: '',           label: 'Todos'       },
  { value: 'PENDING',    label: 'Pendientes'  },
  { value: 'PROCESSING', label: 'Procesando'  },
  { value: 'COMPLETED',  label: 'Completados' },
  { value: 'FAILED',     label: 'Fallidos'    },
]

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
}

export default function AdminJobsPage() {
  const [status, setStatus] = useState<JobStatus | ''>('')
  const [page,   setPage]   = useState(1)
  const [data,   setData]   = useState<JobsResponse | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (status) params.set('status', status)
      params.set('page', String(page))
      const res = await api.get<JobsResponse>(`/admin/jobs?${params.toString()}`)
      setData(res)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [status, page])

  useEffect(() => { void load() }, [load])

  return (
    <div>
      {/* Status filter */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 mb-4">
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
      </div>

      {loading && !data ? (
        <div className="flex justify-center py-20"><IconLoader2 size={24} className="text-[#A1A1AA] animate-spin" /></div>
      ) : !data || data.jobs.length === 0 ? (
        <p className="text-sm text-[#71717A] py-12 text-center">No se encontraron generaciones.</p>
      ) : (
        <>
          <div className="space-y-2">
            {data.jobs.map((j) => (
              <div key={j.id} className="card !p-3.5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#F4F4F5] text-[#3F3F46]">
                        {TYPE_LABEL[j.type]}
                      </span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${STATUS_META[j.status].cls}`}>
                        {STATUS_META[j.status].label}
                      </span>
                      <span className="text-[10px] text-[#A1A1AA]">{j.provider}</span>
                    </div>
                    <p className="text-sm text-[#09090B] truncate">{j.userPrompt || '—'}</p>
                    <p className="text-xs text-[#71717A] truncate mt-0.5">
                      {j.user.email} · {j.brand.name}
                    </p>
                    {j.status === 'FAILED' && j.errorMessage && (
                      <p className="flex items-start gap-1 text-[11px] text-red-500 mt-1.5 leading-snug">
                        <IconAlertTriangle size={13} className="flex-shrink-0 mt-px" />
                        <span className="truncate">{j.errorMessage}</span>
                      </p>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs font-semibold text-[#09090B]">{j.creditsCharged ?? j.creditsRequired} cr.</p>
                    <p className="text-[10px] text-[#A1A1AA] whitespace-nowrap mt-0.5">{fmtDate(j.createdAt)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {data.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-xs text-[#71717A]">{data.total} generaciones · página {data.page} de {data.totalPages}</p>
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
