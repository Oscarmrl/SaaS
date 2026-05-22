'use client'

import { useEffect, useRef } from 'react'
import { X, DownloadSimple, Trash, CircleNotch } from '@phosphor-icons/react'

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

  // Cerrar con Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  // Bloquear scroll del body
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  const typeLabel: Record<AssetType, string> = {
    IMAGE:     'Imagen',
    BANNER:    'Banner',
    VIDEO_15S: 'Video 15s',
    VIDEO_30S: 'Video 30s',
    CAPTION:   'Caption',
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="relative w-full max-w-2xl bg-[#0A0A0A] rounded-[16px] overflow-hidden shadow-2xl">

        {/* Cerrar */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4 text-white" />
        </button>

        {/* Contenido */}
        {isVideo ? (
          <video
            ref={videoRef}
            src={url}
            controls
            autoPlay
            playsInline
            className="w-full max-h-[65vh] bg-black"
          />
        ) : type === 'CAPTION' ? (
          <div className="bg-white max-h-[65vh] overflow-y-auto p-8">
            {captionText
              ? <p className="text-sm text-[#0A0A0A] leading-relaxed whitespace-pre-wrap">{captionText}</p>
              : <p className="text-xs text-[#9CA3AF] italic">Cargando texto…</p>
            }
          </div>
        ) : (
          <div className="bg-black flex items-center justify-center max-h-[65vh] overflow-hidden">
            <img
              src={url}
              alt="Vista previa"
              className="max-w-full max-h-[65vh] object-contain"
            />
          </div>
        )}

        {/* Footer */}
        <div className="px-5 py-4 flex items-center justify-between gap-4">
          <div className="min-w-0">
            {brandName && (
              <p className="text-sm font-semibold text-white truncate">{brandName}</p>
            )}
            <p className="text-xs text-[#9CA3AF] mt-0.5">{typeLabel[type]}</p>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={onDownload}
              className="flex items-center gap-1.5 px-4 py-2 rounded-[8px] bg-[#7C3AED] text-white text-xs font-semibold hover:bg-[#6D28D9] transition-colors"
            >
              <DownloadSimple className="w-3.5 h-3.5" />
              Descargar
            </button>

            <button
              onClick={onDestructive}
              disabled={destructiveLoading}
              className="flex items-center gap-1.5 px-4 py-2 rounded-[8px] border border-white/20 text-white text-xs font-semibold hover:bg-red-600 hover:border-red-600 transition-colors disabled:opacity-60"
            >
              {destructiveLoading
                ? <CircleNotch className="w-3.5 h-3.5 animate-spin" />
                : <Trash className="w-3.5 h-3.5" />
              }
              {destructiveLoading ? 'Procesando…' : destructiveLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
