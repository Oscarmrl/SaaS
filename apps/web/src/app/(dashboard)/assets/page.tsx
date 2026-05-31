'use client'

import { useEffect, useState } from 'react'
import {
  IconPhoto, IconSparkles, IconFileText, IconVideo,
  IconDownload, IconTrash, IconPlayerPlay, IconLoader2, IconArrowsMaximize,
} from '@tabler/icons-react'
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

function CaptionThumbnail({ url }: { url: string }) {
  const [text, setText] = useState<string | null>(null)

  useEffect(() => {
    fetch(`/api/caption?url=${encodeURIComponent(url)}`)
      .then(r => r.ok ? r.text() : Promise.reject())
      .then(setText)
      .catch(() => setText(null))
  }, [url])

  return (
    <div className="w-full h-full p-3 flex flex-col justify-between bg-white">
      {text ? (
        <p className="text-[9px] sm:text-[10px] text-[#3F3F46] leading-relaxed line-clamp-6 text-left whitespace-pre-wrap">
          {text}
        </p>
      ) : (
        <div className="flex items-center justify-center h-full">
          <IconFileText size={24} stroke={1.3} className="text-[#D4D4D8]" />
        </div>
      )}
    </div>
  )
}

const TYPE_FILTERS = [
  { value: '',          label: 'Todos'     },
  { value: 'IMAGE',     label: 'Imágenes'  },
  { value: 'BANNER',    label: 'Banners'   },
  { value: 'CAPTION',   label: 'Captions'  },
  { value: 'VIDEO_15S', label: 'Video 15s' },
  { value: 'VIDEO_30S', label: 'Video 30s' },
]

const isVideo = (type: AssetType) => type === 'VIDEO_15S' || type === 'VIDEO_30S'

function AssetTypeIcon({ type }: { type: AssetType }) {
  const cls = 'text-[#A1A1AA]'
  if (type === 'CAPTION')  return <IconFileText size={20} stroke={1.5} className={cls} />
  if (isVideo(type))       return <IconVideo    size={20} stroke={1.5} className={cls} />
  return <IconPhoto size={20} stroke={1.5} className={cls} />
}

export default function AssetsPage() {
  const [assets,        setAssets]        = useState<Asset[]>([])
  const [loading,       setLoading]       = useState(true)
  const [typeFilter,    setTypeFilter]    = useState('')
  const [deleting,       setDeleting]       = useState<string | null>(null)
  const [deletingModal,  setDeletingModal]  = useState(false)
  const [previewAsset,   setPreviewAsset]   = useState<Asset | null>(null)
  const [captionText,    setCaptionText]    = useState<string | null>(null)

  function openPreview(asset: Asset) {
    setCaptionText(null)
    setPreviewAsset(asset)
    if (asset.type === 'CAPTION') {
      fetch(`/api/caption?url=${encodeURIComponent(asset.url)}`)
        .then(r => r.ok ? r.text() : Promise.reject(r.status))
        .then(setCaptionText)
        .catch(() => setCaptionText(null))
    }
  }

  function fetchAssets(type?: string) {
    setLoading(true)
    api.get<PaginatedAssets>(`/assets${type ? `?type=${type}` : ''}`)
      .then(res => setAssets(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchAssets(typeFilter || undefined) }, [typeFilter])

  async function handleDelete(id: string) {
    setDeleting(id)
    try { await api.delete(`/assets/${id}`); setAssets(prev => prev.filter(a => a.id !== id)) } catch {}
    setDeleting(null)
  }

  function handleDownload(asset: Asset) {
    const a = document.createElement('a')
    a.href  = `/api/download?url=${encodeURIComponent(asset.url)}`
    a.click()
  }

  return (
    <div className="animate-fade-in">
      {previewAsset && (
        <AssetPreviewModal
          url={previewAsset.url} type={previewAsset.type} brandName={previewAsset.brand.name}
          captionText={captionText}
          onClose={() => { setPreviewAsset(null); setCaptionText(null) }}
          onDownload={() => handleDownload(previewAsset)}
          onDestructive={async () => { setDeletingModal(true); await handleDelete(previewAsset.id); setDeletingModal(false); setPreviewAsset(null); setCaptionText(null) }}
          destructiveLabel="Eliminar" destructiveLoading={deletingModal}
        />
      )}

      <div className="page-header">
        <div>
          <h1 className="page-title">Mis assets</h1>
          <p className="page-subtitle">Todo el contenido generado con IA</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-1.5 mb-6">
        {TYPE_FILTERS.map(({ value, label }) => (
          <button key={value} onClick={() => setTypeFilter(value)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-150 ${
              typeFilter === value
                ? 'bg-[#09090B] text-white'
                : 'bg-[#F4F4F5] text-[#71717A] hover:bg-[#E4E4E7] hover:text-[#09090B]'
            }`}>
            {label}
          </button>
        ))}
      </div>

      {/* Skeleton */}
      {loading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {[...Array(8)].map((_, i) => <div key={i} className="skeleton aspect-square" />)}
        </div>
      )}

      {/* Empty */}
      {!loading && assets.length === 0 && (
        <div className="card flex flex-col items-center justify-center py-20 text-center gap-3">
          <div className="w-12 h-12 rounded-full bg-[#F4F4F5] flex items-center justify-center">
            <IconSparkles size={20} stroke={1.5} className="text-[#A1A1AA]" />
          </div>
          <div>
            <p className="text-sm font-medium text-[#09090B]">Sin assets todavía</p>
            <p className="text-xs text-[#71717A] mt-1">{typeFilter ? 'No hay assets de ese tipo' : 'Genera tu primer contenido con IA'}</p>
          </div>
        </div>
      )}

      {/* Grid */}
      {!loading && assets.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {assets.map(asset => (
            <div key={asset.id} className="bg-white border border-[#E4E4E7] rounded-[12px] overflow-hidden hover:border-[#D4D4D8] hover:shadow-[0_2px_8px_rgba(0,0,0,0.06)] transition-all duration-150 flex flex-col">

              {/* Thumbnail */}
              {isVideo(asset.type) ? (
                <button onClick={() => openPreview(asset)}
                  className="aspect-square bg-[#09090B] relative overflow-hidden group w-full">
                  <video src={asset.url} preload="metadata" muted playsInline className="w-full h-full object-cover opacity-75" />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-black/25 transition-colors">
                    <div className="w-9 h-9 rounded-full bg-black/50 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <IconPlayerPlay size={16} stroke={1.8} className="text-white" />
                    </div>
                  </div>
                </button>
              ) : (
                <button onClick={() => openPreview(asset)}
                  className="aspect-square bg-[#F4F4F5] flex items-center justify-center overflow-hidden w-full group relative">
                  {asset.type === 'CAPTION' ? (
                    <CaptionThumbnail url={asset.url} />
                  ) : (
                    <img src={asset.thumbnailUrl ?? asset.url} alt={`Asset ${asset.type}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" />
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                    <IconArrowsMaximize size={18} stroke={1.8} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </button>
              )}

              {/* Footer */}
              <div className="p-3 flex flex-col gap-2 flex-1">
                <div className="flex items-center justify-between">
                  <span className="pill text-[10px]">{asset.type.replace(/_\d+S$/, '').toLowerCase()}</span>
                  <span className="text-[10px] text-[#A1A1AA] tabular-nums">{asset.creditsCost} cr.</span>
                </div>
                <p className="text-[10px] text-[#71717A] truncate">{asset.brand.name}</p>

                <div className="flex items-center gap-1.5 mt-auto pt-2 border-t border-[#F4F4F5]">
                  <button onClick={() => handleDownload(asset)}
                    className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-[6px] bg-[#F4F4F5] text-[#3F3F46] text-[10px] font-medium hover:bg-[#E4E4E7] transition-colors">
                    <IconDownload size={12} stroke={2} /> Descargar
                  </button>
                  <button onClick={() => handleDelete(asset.id)} disabled={deleting === asset.id}
                    className="w-7 h-7 flex items-center justify-center rounded-[6px] text-[#A1A1AA] hover:bg-red-50 hover:text-red-500 transition-colors disabled:opacity-50">
                    {deleting === asset.id
                      ? <IconLoader2 size={12} className="animate-spin" />
                      : <IconTrash size={12} stroke={1.8} />
                    }
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
