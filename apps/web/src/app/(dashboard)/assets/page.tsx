'use client'

import { useEffect, useState } from 'react'
import { Image, Sparkle, FileText, VideoCamera, DownloadSimple, Trash } from '@phosphor-icons/react'
import { api } from '@/lib/api-client'

type AssetType = 'IMAGE' | 'BANNER' | 'VIDEO_15S' | 'VIDEO_30S' | 'CAPTION'

interface Asset {
  id:          string
  type:        AssetType
  url:         string
  thumbnailUrl?: string
  creditsCost: number
  platform?:   string
  createdAt:   string
  brand:       { name: string }
}

interface PaginatedAssets {
  data:     Asset[]
  total:    number
  page:     number
  pageSize: number
}

const TYPE_FILTERS = [
  { value: '',         label: 'Todos'    },
  { value: 'IMAGE',    label: 'Imágenes' },
  { value: 'BANNER',   label: 'Banners'  },
  { value: 'CAPTION',  label: 'Captions' },
  { value: 'VIDEO_15S',label: 'Video 15s'},
  { value: 'VIDEO_30S',label: 'Video 30s'},
]

function AssetIcon({ type }: { type: AssetType }) {
  const cls = 'w-6 h-6 text-[#9CA3AF]'
  if (type === 'CAPTION') return <FileText className={cls} />
  if (type.startsWith('VIDEO')) return <VideoCamera className={cls} />
  return <Image className={cls} />
}

export default function AssetsPage() {
  const [assets,      setAssets]      = useState<Asset[]>([])
  const [loading,     setLoading]     = useState(true)
  const [typeFilter,  setTypeFilter]  = useState('')
  const [deleting,    setDeleting]    = useState<string | null>(null)

  function fetchAssets(type?: string) {
    setLoading(true)
    const qs = type ? `?type=${type}` : ''
    api.get<PaginatedAssets>(`/assets${qs}`)
      .then(res => setAssets(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchAssets(typeFilter || undefined) }, [typeFilter])

  async function handleDelete(id: string) {
    setDeleting(id)
    try {
      await api.delete(`/assets/${id}`)
      setAssets(prev => prev.filter(a => a.id !== id))
    } catch {}
    setDeleting(null)
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#0A0A0A]">Mis assets</h1>
          <p className="text-sm text-[#6B7280] mt-1">Todo el contenido generado con IA</p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {TYPE_FILTERS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setTypeFilter(value)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-150
              ${typeFilter === value
                ? 'bg-[#EDE9FE] text-[#7C3AED]'
                : 'bg-[#F1F3F5] text-[#374151] hover:bg-[#EDE9FE]/50'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Skeleton */}
      {loading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="skeleton aspect-square rounded-[12px]" />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && assets.length === 0 && (
        <div className="card flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-full bg-[#F1F3F5] flex items-center justify-center mb-4">
            <Sparkle className="w-7 h-7 text-[#9CA3AF]" />
          </div>
          <h3 className="text-base font-semibold text-[#0A0A0A]">Sin assets todavía</h3>
          <p className="text-sm text-[#6B7280] mt-1">
            {typeFilter ? 'No hay assets de ese tipo' : 'Genera tu primer contenido con IA'}
          </p>
        </div>
      )}

      {/* Grid */}
      {!loading && assets.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {assets.map(asset => (
            <div key={asset.id} className="group relative bg-white border border-[#E5E7EB] rounded-[12px] overflow-hidden hover:shadow-md transition-all duration-150">
              {/* Preview */}
              <div className="aspect-square bg-[#F1F3F5] flex items-center justify-center relative">
                {asset.thumbnailUrl ? (
                  <img
                    src={asset.thumbnailUrl}
                    alt={`Asset ${asset.type}`}
                    className="w-full h-full object-cover"
                  />
                ) : asset.type === 'CAPTION' ? (
                  <div className="p-4 text-xs text-[#374151] text-center line-clamp-4">
                    Vista previa del caption
                  </div>
                ) : (
                  <AssetIcon type={asset.type} />
                )}

                {/* Hover actions */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex items-center justify-center gap-2">
                  <a
                    href={asset.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-full bg-white flex items-center justify-center hover:bg-[#F1F3F5] transition-colors"
                    title="Descargar"
                  >
                    <DownloadSimple className="w-4 h-4 text-[#0A0A0A]" />
                  </a>
                  <button
                    onClick={() => handleDelete(asset.id)}
                    disabled={deleting === asset.id}
                    className="w-9 h-9 rounded-full bg-white flex items-center justify-center hover:bg-red-50 transition-colors"
                    title="Eliminar"
                  >
                    <Trash className="w-4 h-4 text-[#EF4444]" />
                  </button>
                </div>
              </div>

              {/* Info */}
              <div className="p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="pill text-[10px] capitalize">{asset.type.replace('_', ' ').toLowerCase()}</span>
                  <span className="text-[10px] text-[#9CA3AF]">{asset.creditsCost} cr.</span>
                </div>
                <p className="text-xs text-[#6B7280] truncate">{asset.brand.name}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
