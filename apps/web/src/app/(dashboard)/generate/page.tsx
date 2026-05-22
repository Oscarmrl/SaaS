'use client'

import { useEffect, useState, useCallback, useRef, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Sparkle, Image, FileText, VideoCamera, CheckCircle, XCircle, CircleNotch, Lightning, ShoppingCart, DownloadSimple, Trash, ArrowsOut } from '@phosphor-icons/react'
import Link from 'next/link'
import { api } from '@/lib/api-client'
import { useUser } from '@/contexts/UserContext'
import { AssetPreviewModal } from '@/components/dashboard/AssetPreviewModal'
import type { BrandProfile } from '@brandai/shared'

type AssetType = 'IMAGE' | 'BANNER' | 'VIDEO_15S' | 'VIDEO_30S' | 'CAPTION'
type Platform  = 'instagram' | 'facebook' | 'whatsapp' | 'all'
type JobStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'

interface Job {
  id: string
  status: JobStatus
  type: AssetType
  creditsRequired: number
  errorMessage?: string
  generatedAsset?: { id: string; url: string; thumbnailUrl?: string }
}

const ASSET_TYPES = [
  { value: 'IMAGE'    as AssetType, label: 'Imagen',    icon: Image,    credits: 10, desc: 'Foto publicitaria con IA' },
  { value: 'BANNER'   as AssetType, label: 'Banner',    icon: Sparkle, credits:  8, desc: 'Banner para redes sociales' },
  { value: 'CAPTION'  as AssetType, label: 'Caption',   icon: FileText, credits:  3, desc: 'Texto persuasivo con IA' },
  { value: 'VIDEO_15S'as AssetType, label: 'Video 15s', icon: VideoCamera,    credits: 20, desc: 'Mini-video animado' },
  { value: 'VIDEO_30S'as AssetType, label: 'Video 30s', icon: VideoCamera,    credits: 35, desc: 'Video publicitario largo' },
]

const PLATFORMS = [
  { value: 'instagram' as Platform, label: 'Instagram' },
  { value: 'facebook'  as Platform, label: 'Facebook'  },
  { value: 'whatsapp'  as Platform, label: 'WhatsApp'  },
  { value: 'all'       as Platform, label: 'Todas'     },
]

function NoCreditsPanel({ balance, required }: { balance: number; required: number }) {
  return (
    <div className="rounded-[12px] border border-[#FDE68A] bg-[#FFFBEB] p-5 space-y-3">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-[8px] bg-[#FEF3C7] flex items-center justify-center flex-shrink-0">
          <Lightning className="w-4 h-4 text-[#D97706]" />
        </div>
        <p className="text-sm font-semibold text-[#92400E]">Créditos insuficientes</p>
      </div>
      <p className="text-xs text-[#92400E]">
        Necesitas <span className="font-bold">{required}</span> créditos pero solo tienes{' '}
        <span className="font-bold">{balance}</span>.
      </p>
      <Link
        href="/credits"
        className="flex items-center justify-center gap-2 w-full py-2.5 bg-[#7C3AED] text-white text-xs font-semibold rounded-[8px] hover:bg-[#6D28D9] transition-all duration-150"
      >
        <ShoppingCart className="w-3.5 h-3.5" />
        Comprar créditos
      </Link>
    </div>
  )
}

function GenerateForm() {
  const searchParams = useSearchParams()
  const router       = useRouter()
  const { credits, refreshCredits } = useUser()

  const [brands,     setBrands]     = useState<BrandProfile[]>([])
  const [brandId,    setBrandId]    = useState(searchParams.get('brandId') ?? '')
  const [assetType,  setAssetType]  = useState<AssetType>((searchParams.get('type') as AssetType) ?? 'IMAGE')
  const [platform,   setPlatform]   = useState<Platform>('instagram')
  const [userPrompt, setUserPrompt] = useState('')
  const [loading,      setLoading]      = useState(false)
  const [job,          setJob]          = useState<Job | null>(null)
  const [polling,      setPolling]      = useState(false)
  const [error,        setError]        = useState<string | null>(null)
  const [discarding,   setDiscarding]   = useState(false)
  const [previewOpen,  setPreviewOpen]  = useState(false)
  const [captionText,  setCaptionText]  = useState<string | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Cuando un caption termina, obtener el texto del archivo .txt
  useEffect(() => {
    if (job?.status === 'COMPLETED' && job.type === 'CAPTION' && job.generatedAsset?.url) {
      fetch(job.generatedAsset.url)
        .then(r => r.text())
        .then(setCaptionText)
        .catch(() => setCaptionText(null))
    } else {
      setCaptionText(null)
    }
  }, [job?.status, job?.type, job?.generatedAsset?.url])

  function handleDownload(url: string) {
    const a = document.createElement('a')
    a.href  = `/api/download?url=${encodeURIComponent(url)}`
    a.click()
  }

  async function handleDiscard(assetId: string) {
    setDiscarding(true)
    try {
      await api.delete(`/assets/${assetId}`)
    } catch {
      // si falla el delete en el servidor igual limpiamos la UI
    } finally {
      setDiscarding(false)
      setJob(null)
      setError(null)
    }
  }

  const selectedType        = ASSET_TYPES.find(t => t.value === assetType)
  const requiredCredits     = selectedType?.credits ?? 0
  const hasEnoughCredits    = credits.balance >= requiredCredits

  useEffect(() => {
    api.get<BrandProfile[]>('/brands').then(setBrands).catch(() => {})
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [])

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    setPolling(false)
  }, [])

  const pollJob = useCallback((jobId: string) => {
    setPolling(true)
    let attempts = 0
    const MAX_ATTEMPTS = 80

    intervalRef.current = setInterval(async () => {
      attempts++
      try {
        const updated = await api.get<Job>(`/generate/${jobId}`)
        setJob(updated)
        if (updated.status === 'COMPLETED' || updated.status === 'FAILED') {
          stopPolling()
          refreshCredits()
        } else if (attempts >= MAX_ATTEMPTS) {
          stopPolling()
          setJob(prev => prev ? {
            ...prev,
            status: 'FAILED',
            errorMessage: 'Tiempo de espera agotado. El worker puede estar caído.',
          } : prev)
        }
      } catch {
        stopPolling()
      }
    }, 2500)
  }, [stopPolling, refreshCredits])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!brandId || !userPrompt.trim()) return

    // Guardia del lado cliente antes de llamar al API
    if (!hasEnoughCredits) return

    setLoading(true)
    setJob(null)
    setError(null)

    try {
      const created = await api.post<Job>('/generate', {
        brandId,
        type:       assetType,
        userPrompt: userPrompt.trim(),
        platform,
      })
      setJob(created)
      pollJob(created.id)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al generar el contenido'
      // El API devuelve "Insufficient credits" cuando no hay saldo
      if (msg.toLowerCase().includes('credit') || msg.toLowerCase().includes('crédito')) {
        refreshCredits() // sincroniza el balance real
      }
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  if (brands.length === 0 && !loading) {
    return (
      <div className="card flex flex-col items-center justify-center py-16 text-center">
        <p className="text-sm font-medium text-[#0A0A0A]">Primero necesitas crear una marca</p>
        <p className="text-xs text-[#6B7280] mt-1 mb-4">El contenido se genera en base a tu identidad de marca</p>
        <button onClick={() => router.push('/brands/new')} className="btn-accent">
          Crear marca
        </button>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Form */}
      <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6">

        {/* Brand selector */}
        <div className="card space-y-3">
          <h2 className="text-sm font-semibold text-[#0A0A0A]">Marca</h2>
          <select
            value={brandId}
            onChange={e => setBrandId(e.target.value)}
            className="input"
            required
          >
            <option value="">Selecciona una marca...</option>
            {brands.map(b => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </div>

        {/* Asset type */}
        <div className="card space-y-3">
          <h2 className="text-sm font-semibold text-[#0A0A0A]">Tipo de contenido</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {ASSET_TYPES.map(({ value, label, icon: Icon, credits: cost, desc }) => {
              const active = assetType === value
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setAssetType(value)}
                  className={`
                    flex flex-col gap-2 p-3 rounded-[10px] border text-left
                    transition-all duration-150
                    ${active
                      ? 'border-[#7C3AED] bg-[#EDE9FE]'
                      : 'border-[#E5E7EB] bg-white hover:border-[#7C3AED] hover:bg-[#EDE9FE]/20'}
                  `}
                >
                  <div className={`w-8 h-8 rounded-[8px] flex items-center justify-center ${active ? 'bg-[#7C3AED]' : 'bg-[#F1F3F5]'}`}>
                    <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-[#6B7280]'}`} />
                  </div>
                  <span className={`text-xs font-semibold ${active ? 'text-[#7C3AED]' : 'text-[#0A0A0A]'}`}>{label}</span>
                  <span className={`pill text-[10px] ${credits.balance < cost ? 'bg-red-50 text-red-500' : ''}`}>
                    {cost} créditos
                  </span>
                </button>
              )
            })}
          </div>
          {selectedType && (
            <p className="text-xs text-[#6B7280]">{selectedType.desc}</p>
          )}
        </div>

        {/* Platform */}
        <div className="card space-y-3">
          <h2 className="text-sm font-semibold text-[#0A0A0A]">Plataforma</h2>
          <div className="flex flex-wrap gap-2">
            {PLATFORMS.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => setPlatform(value)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-150
                  ${platform === value ? 'bg-[#EDE9FE] text-[#7C3AED]' : 'bg-[#F1F3F5] text-[#374151] hover:bg-[#EDE9FE]/50'}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Prompt */}
        <div className="card space-y-3">
          <h2 className="text-sm font-semibold text-[#0A0A0A]">Descripción del contenido</h2>
          <textarea
            className="input min-h-[100px] resize-none"
            placeholder="Ej: Una imagen de mi producto estrella con fondo cálido, ideal para promoción de verano..."
            value={userPrompt}
            onChange={e => setUserPrompt(e.target.value)}
            required
          />
          <p className="text-xs text-[#9CA3AF]">
            Sé específico: colores, ambiente, mensaje, temporada, etc.
          </p>
        </div>

        {/* Error genérico del API */}
        {error && !error.toLowerCase().includes('credit') && (
          <div className="flex items-start gap-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded-[8px] px-3 py-2.5">
            <XCircle className="w-4 h-4 flex-shrink-0 mt-px" />
            {error}
          </div>
        )}

        {/* Botón — cambia según créditos */}
        {hasEnoughCredits ? (
          <button
            type="submit"
            disabled={loading || polling || !brandId || !userPrompt.trim()}
            className="btn-accent w-full py-3"
          >
            {loading || polling
              ? <><CircleNotch className="w-4 h-4 animate-spin" /> Generando...</>
              : <><Sparkle className="w-4 h-4" /> Generar — {requiredCredits} créditos</>
            }
          </button>
        ) : (
          <div className="space-y-2">
            <NoCreditsPanel balance={credits.balance} required={requiredCredits} />
          </div>
        )}
      </form>

      {/* Status panel */}
      <div className="space-y-4">
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-[#0A0A0A] mb-4">Estado de generación</h3>

          {!job && !error && (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="w-12 h-12 rounded-full bg-[#F1F3F5] flex items-center justify-center mb-3">
                <Sparkle className="w-5 h-5 text-[#9CA3AF]" />
              </div>
              <p className="text-xs text-[#6B7280]">El resultado aparecerá aquí</p>
            </div>
          )}

          {/* Error de créditos dentro del panel de estado */}
          {error && (error.toLowerCase().includes('credit') || error.toLowerCase().includes('crédito')) && (
            <NoCreditsPanel balance={credits.balance} required={requiredCredits} />
          )}

          {job && (
            <div className="space-y-3">
              <div className={`flex items-center gap-2 px-3 py-2 rounded-[8px] text-xs font-medium
                ${job.status === 'COMPLETED' ? 'bg-green-50 text-green-700'  : ''}
                ${job.status === 'FAILED'    ? 'bg-red-50   text-red-700'    : ''}
                ${job.status === 'PENDING' || job.status === 'PROCESSING' ? 'bg-[#EDE9FE] text-[#7C3AED]' : ''}
              `}>
                {job.status === 'COMPLETED'  && <CheckCircle className="w-4 h-4" />}
                {job.status === 'FAILED'     && <XCircle     className="w-4 h-4" />}
                {(job.status === 'PENDING' || job.status === 'PROCESSING') && <CircleNotch className="w-4 h-4 animate-spin" />}
                {{
                  PENDING:    'En cola...',
                  PROCESSING: 'Generando con IA...',
                  COMPLETED:  '¡Listo!',
                  FAILED:     'Error en generación',
                }[job.status]}
              </div>

              {job.status === 'FAILED' && job.errorMessage && (
                <p className="text-xs text-[#EF4444]">{job.errorMessage}</p>
              )}

              {job.status === 'COMPLETED' && job.generatedAsset && (
                <>
                  {/* Modal de previsualización */}
                  {previewOpen && (
                    <AssetPreviewModal
                      url={job.generatedAsset.url}
                      type={job.type}
                      captionText={captionText}
                      onClose={() => setPreviewOpen(false)}
                      onDownload={() => handleDownload(job.generatedAsset!.url)}
                      onDestructive={async () => {
                        await handleDiscard(job.generatedAsset!.id)
                        setPreviewOpen(false)
                      }}
                      destructiveLabel="Descartar"
                      destructiveLoading={discarding}
                    />
                  )}

                  <div className="space-y-3">
                    {/* Thumbnail clickeable — abre el modal */}
                    <button
                      type="button"
                      onClick={() => setPreviewOpen(true)}
                      className="w-full rounded-[10px] overflow-hidden border border-[#E5E7EB] bg-[#F1F3F5] relative group/prev block"
                    >
                      {job.type === 'VIDEO_15S' || job.type === 'VIDEO_30S' ? (
                        <video
                          src={job.generatedAsset.url}
                          preload="metadata"
                          muted
                          playsInline
                          className="w-full max-h-48 object-cover bg-black"
                        />
                      ) : job.type === 'CAPTION' ? (
                        <div className="p-4 min-h-[80px] text-left">
                          {captionText
                            ? <p className="text-xs text-[#0A0A0A] leading-relaxed line-clamp-4 whitespace-pre-wrap">{captionText}</p>
                            : <p className="text-xs text-[#9CA3AF] italic">Cargando texto…</p>
                          }
                        </div>
                      ) : (
                        <img
                          src={job.generatedAsset.url}
                          alt="Asset generado"
                          className="w-full max-h-48 object-cover"
                        />
                      )}

                      {/* Overlay "Ver en grande" */}
                      <div className="absolute inset-0 bg-black/0 group-hover/prev:bg-black/30 transition-colors duration-150 flex items-center justify-center">
                        <div className="opacity-0 group-hover/prev:opacity-100 transition-opacity duration-150 flex items-center gap-1.5 bg-black/70 text-white text-xs font-semibold px-3 py-1.5 rounded-full">
                          <ArrowsOut className="w-3.5 h-3.5" />
                          Ver en grande
                        </div>
                      </div>
                    </button>

                    {/* Acciones rápidas */}
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => handleDownload(job.generatedAsset!.url)}
                        className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-[8px] bg-[#7C3AED] text-white text-xs font-semibold hover:bg-[#6D28D9] transition-all duration-150"
                      >
                        <DownloadSimple className="w-3.5 h-3.5" />
                        Descargar
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDiscard(job.generatedAsset!.id)}
                        disabled={discarding}
                        className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-[8px] border border-[#E5E7EB] text-[#6B7280] text-xs font-semibold hover:bg-[#F1F3F5] hover:text-[#EF4444] hover:border-[#EF4444] transition-all duration-150 disabled:opacity-60"
                      >
                        {discarding
                          ? <CircleNotch className="w-3.5 h-3.5 animate-spin" />
                          : <Trash className="w-3.5 h-3.5" />
                        }
                        {discarding ? 'Eliminando…' : 'Descartar'}
                      </button>
                    </div>

                    <p className="text-[10px] text-[#9CA3AF] text-center">
                      El asset queda guardado en{' '}
                      <a href="/assets" className="text-[#7C3AED] hover:underline">Mis assets</a>
                    </p>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Costos de referencia */}
        <div className="card-featured p-5">
          <div className="flex items-center gap-2 mb-2">
            <Lightning className="w-4 h-4 text-[#7C3AED]" />
            <span className="text-xs font-semibold text-white">Costos de créditos</span>
          </div>
          <div className="space-y-1.5 mt-3">
            {ASSET_TYPES.map(({ label, credits: cost }) => (
              <div key={label} className="flex justify-between text-xs">
                <span className={credits.balance < cost ? 'text-red-400' : 'text-[#9CA3AF]'}>{label}</span>
                <span className={`font-medium ${credits.balance < cost ? 'text-red-400' : 'text-white'}`}>
                  {cost} cr.
                </span>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-3 border-t border-[#222]">
            <div className="flex justify-between text-xs">
              <span className="text-[#9CA3AF]">Tu balance</span>
              <span className="font-bold text-white">{credits.balance} cr.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function GeneratePage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#0A0A0A]">Generar contenido</h1>
        <p className="text-sm text-[#6B7280] mt-1">Crea imágenes, banners, captions y videos con IA</p>
      </div>
      <Suspense>
        <GenerateForm />
      </Suspense>
    </div>
  )
}
