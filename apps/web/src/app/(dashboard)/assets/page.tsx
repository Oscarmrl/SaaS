'use client'

import { useEffect, useState } from 'react'
import { Image, Sparkle, FileText, VideoCamera, DownloadSimple, Trash, Play, CircleNotch } from '@phosphor-icons/react'
import { api } from '@/lib/api-client'
import { AssetPreviewModal } from '@/components/dashboard/AssetPreviewModal'

type AssetType = 'IMAGE' | 'BANNER' | 'VIDEO_15S' | 'VIDEO_30S' | 'CAPTION'

interface Asset {
  id:           string
  type:         AssetType
  url:          string
  thumbnailUrl?: string
  creditsCost:  number
  platform?:    string
  createdAt:    string
  brand:        { name: string }
}

interface PaginatedAssets {
  data:     Asset[]
  total:    number
  page:     number
  pageSize: number
}

const TYPE_FILTERS = [
  { value: '',          label: 'Todos'     },
  { value: 'IMAGE',     label: 'Imágenes'  },
  { value: 'BANNER',    label: 'Banners'   },
  { value: 'CAPTION',   label: 'Captions'  },
  { value: 'VIDEO_15S', label: 'Video 15s' },
  { value: 'VIDEO_30S', label: 'Video 30s' },
]

function AssetIcon({ type }: { type: AssetType }) {
  const cls = 'w-6 h-6 text-[#9CA3AF]'
  if (type === 'CAPTION')       return <FileText     className={cls} />
  if (type.startsWith('VIDEO')) return <VideoCamera  className={cls} />
  return <Image className={cls} />
}

// ── Página principal ────────────────────────────────────────────────────────

export default function AssetsPage() {
  const [assets,       setAssets]       = useState<Asset[]>([])
  const [loading,      setLoading]      = useState(true)
  const [typeFilter,   setTypeFilter]   = useState('')
  const [deleting,      setDeleting]      = useState<string | null>(null)
  const [deletingModal, setDeletingModal] = useState(false)
  const [previewAsset,  setPreviewAsset]  = useState<Asset | null>(null)

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

  function handleDownload(asset: Asset) {
    const a    = document.createElement('a')
    a.href     = `/api/download?url=${encodeURIComponent(asset.url)}`
    a.click()
  }

  const isVideo = (type: AssetType) => type === 'VIDEO_15S' || type === 'VIDEO_30S'

  return (
    <div>
      {/* Modal de previsualización */}
      {previewAsset && (
        <AssetPreviewModal
          url={previewAsset.url}
          type={previewAsset.type}
          brandName={previewAsset.brand.name}
          onClose={() => setPreviewAsset(null)}
          onDownload={() => handleDownload(previewAsset)}
          onDestructive={async () => {
            setDeletingModal(true)
            await handleDelete(previewAsset.id)
            setDeletingModal(false)
            setPreviewAsset(null)
          }}
          destructiveLabel="Eliminar"
          destructiveLoading={deletingModal}
        />
      )}

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
            <div
              key={asset.id}
              className="bg-white border border-[#E5E7EB] rounded-[12px] overflow-hidden hover:shadow-md transition-all duration-150 flex flex-col"
            >
              {/* Thumbnail — clickeable abre el modal */}
              {isVideo(asset.type) ? (
                <button
                  onClick={() => setPreviewAsset(asset)}
                  className="aspect-square bg-black relative overflow-hidden group/thumb w-full"
                >
                  <video
                    src={asset.url}
                    preload="metadata"
                    muted
                    playsInline
                    className="w-full h-full object-cover opacity-90"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover/thumb:bg-black/30 transition-colors duration-150">
                    <div className="w-11 h-11 rounded-full bg-black/50 flex items-center justify-center group-hover/thumb:scale-110 transition-transform duration-150">
                      <Play className="w-5 h-5 text-white" weight="fill" />
                    </div>
                  </div>
                </button>
              ) : (
                <button
                  onClick={() => setPreviewAsset(asset)}
                  className="aspect-square bg-[#F1F3F5] flex items-center justify-center overflow-hidden w-full group/thumb relative"
                >
                  {asset.type === 'CAPTION' ? (
                    <div className="p-4 text-xs text-[#374151] text-center line-clamp-6">
                      Vista previa del caption
                    </div>
                  ) : (
                    <img
                      src={asset.thumbnailUrl ?? asset.url}
                      alt={`Asset ${asset.type}`}
                      className="w-full h-full object-cover group-hover/thumb:scale-105 transition-transform duration-200"
                    />
                  )}
                </button>
              )}

              {/* Footer */}
              <div className="p-3 flex flex-col gap-2.5 flex-1">
                {/* Meta */}
                <div>
                  <div className="flex items-center justify-between">
                    <span className="pill text-[10px] capitalize">
                      {asset.type.replace('_', ' ').toLowerCase()}
                    </span>
                    <span className="text-[10px] text-[#9CA3AF]">{asset.creditsCost} cr.</span>
                  </div>
                  <p className="text-xs text-[#6B7280] truncate mt-1">{asset.brand.name}</p>
                </div>

                {/* Acciones */}
                <div className="flex flex-col gap-1.5 mt-auto pt-2 border-t border-[#F1F3F5]">
                  {/* Reproducir — solo videos */}
                  {isVideo(asset.type) && (
                    <button
                      onClick={() => setPreviewAsset(asset)}
                      className="flex items-center justify-center gap-1.5 w-full py-1.5 rounded-[7px] bg-[#EDE9FE] text-[#7C3AED] text-[11px] font-semibold hover:bg-[#7C3AED] hover:text-white transition-all duration-150"
                    >
                      <Play className="w-3.5 h-3.5" weight="fill" />
                      Reproducir
                    </button>
                  )}

                  {/* Descargar + Eliminar */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleDownload(asset)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-[7px] bg-[#F1F3F5] text-[#374151] text-[11px] font-semibold hover:bg-[#E5E7EB] transition-colors duration-150"
                    >
                      <DownloadSimple className="w-3.5 h-3.5" />
                      Descargar
                    </button>
                    <button
                      onClick={() => handleDelete(asset.id)}
                      disabled={deleting === asset.id}
                      className="w-8 h-8 flex items-center justify-center rounded-[7px] text-[#9CA3AF] hover:bg-red-50 hover:text-[#EF4444] transition-all duration-150 disabled:opacity-50 flex-shrink-0"
                      title="Eliminar"
                    >
                      {deleting === asset.id
                        ? <CircleNotch className="w-3.5 h-3.5 animate-spin" />
                        : <Trash className="w-3.5 h-3.5" />
                      }
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
