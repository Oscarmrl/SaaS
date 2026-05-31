'use client'

import { useEffect, useRef } from 'react'
import { IconX, IconDownload, IconTrash, IconLoader2 } from '@tabler/icons-react'

type AssetType = 'IMAGE' | 'BANNER' | 'VIDEO_15S' | 'VIDEO_30S' | 'CAPTION'

interface Props {
  url:              string
  type:             AssetType
  captionText?:     string | null
  brandName?:       string
  onClose:          () => void
  onDownload:       () => void
  onDestructive:    () => Promise<void> | void
  destructiveLabel: string
  destructiveLoading?: boolean
}

export function AssetPreviewModal({
  url, type, captionText, brandName,
  onClose, onDownload, onDestructive, destructiveLabel, destructiveLoading,
}: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const isVideo  = type === 'VIDEO_15S' || type === 'VIDEO_30S'

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  const typeLabel: Record<AssetType, string> = {
    IMAGE: 'Imagen', BANNER: 'Banner',
    VIDEO_15S: 'Video 15s', VIDEO_30S: 'Video 30s', CAPTION: 'Caption',
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="relative w-full max-w-2xl bg-white rounded-[14px] overflow-hidden shadow-lg border border-[#E4E4E7]">

        {/* Close */}
        <button onClick={onClose}
          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-[#F4F4F5] hover:bg-[#E4E4E7] flex items-center justify-center transition-colors">
          <IconX size={15} stroke={2} className="text-[#71717A]" />
        </button>

        {/* Content */}
        {isVideo ? (
          <video ref={videoRef} src={url} controls autoPlay playsInline
            className="w-full max-h-[65vh] bg-[#09090B]" />
        ) : type === 'CAPTION' ? (
          <div className="bg-white max-h-[65vh] overflow-y-auto p-8">
            {captionText
              ? <p className="text-sm text-[#09090B] leading-relaxed whitespace-pre-wrap">{captionText}</p>
              : <p className="text-xs text-[#A1A1AA] italic">Cargando texto…</p>
            }
          </div>
        ) : (
          <div className="bg-[#F4F4F5] flex items-center justify-center max-h-[65vh] overflow-hidden">
            <img src={url} alt="Vista previa" className="max-w-full max-h-[65vh] object-contain" />
          </div>
        )}

        {/* Footer */}
        <div className="px-5 py-4 flex items-center justify-between gap-4 border-t border-[#E4E4E7]">
          <div className="min-w-0">
            {brandName && <p className="text-sm font-semibold text-[#09090B] truncate">{brandName}</p>}
            <p className="text-xs text-[#71717A] mt-0.5">{typeLabel[type]}</p>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button onClick={onDownload}
              className="flex items-center gap-1.5 px-4 py-2 rounded-[8px] bg-[#09090B] text-white text-xs font-semibold hover:bg-[#18181B] transition-colors">
              <IconDownload size={14} stroke={2} />
              Descargar
            </button>

            <button onClick={onDestructive} disabled={destructiveLoading}
              className="flex items-center gap-1.5 px-4 py-2 rounded-[8px] border border-[#E4E4E7] text-[#71717A] text-xs font-semibold hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors disabled:opacity-60">
              {destructiveLoading
                ? <IconLoader2 size={14} className="animate-spin" />
                : <IconTrash size={14} stroke={1.8} />
              }
              {destructiveLoading ? 'Procesando…' : destructiveLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
