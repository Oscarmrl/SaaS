'use client'

import { useEffect, useState, useCallback, useRef, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { IconSparkles, IconPhoto, IconFileText, IconVideo, IconCircleCheck, IconCircleX, IconLoader2, IconBolt, IconShoppingCart, IconDownload, IconTrash, IconArrowsMaximize, IconInfoCircle, IconMovie, IconFlag } from '@tabler/icons-react'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { api } from '@/lib/api-client'
import { useUser } from '@/contexts/UserContext'
import { AssetPreviewModal } from '@/components/dashboard/AssetPreviewModal'
import { CREDIT_COSTS } from '@brandai/shared'
import type { BrandProfile } from '@brandai/shared'

type AssetType = 'IMAGE' | 'BANNER' | 'VIDEO_8S' | 'VIDEO_15S' | 'VIDEO_30S' | 'CAPTION'
type Platform  = 'instagram' | 'facebook' | 'whatsapp' | 'all'
type JobStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'

const isVideoType = (t: AssetType): boolean =>
  t === 'VIDEO_8S' || t === 'VIDEO_15S' || t === 'VIDEO_30S'

interface Job {
  id: string
  status: JobStatus
  type: AssetType
  creditsRequired: number
  errorMessage?: string
  generatedAsset?: { id: string; url: string; thumbnailUrl?: string }
}

// Créditos: fuente de verdad en @brandai/shared (CREDIT_COSTS), no hardcodear.
const ASSET_TYPES = [
  { value: 'IMAGE'     as AssetType, label: 'Imagen',    icon: IconPhoto,    desc: 'Foto publicitaria con IA' },
  { value: 'BANNER'    as AssetType, label: 'Banner',    icon: IconSparkles, desc: 'Banner para redes sociales' },
  { value: 'CAPTION'   as AssetType, label: 'Caption',   icon: IconFileText, desc: 'Texto persuasivo con IA' },
  { value: 'VIDEO_8S'  as AssetType, label: 'Video 8s',  icon: IconVideo,    desc: 'Mini-video con audio (IA)' },
  { value: 'VIDEO_15S' as AssetType, label: 'Video 15s', icon: IconVideo,    desc: 'Video con audio — plan Negocio+' },
  { value: 'VIDEO_30S' as AssetType, label: 'Video 30s', icon: IconVideo,    desc: 'Video largo con audio — plan Negocio+' },
].map(t => ({ ...t, credits: CREDIT_COSTS[t.value] }))

const PLATFORMS = [
  { value: 'instagram' as Platform, label: 'Instagram' },
  { value: 'facebook'  as Platform, label: 'Facebook'  },
  { value: 'whatsapp'  as Platform, label: 'WhatsApp'  },
  { value: 'all'       as Platform, label: 'Todas'     },
]

const VIDEO_MESSAGES = [
  { at:   0, text: 'Generando el guion y la narración con IA...' },
  { at:   8, text: 'Iniciando el motor de generación de video...' },
  { at:  20, text: 'Creando las escenas con audio incorporado...' },
  { at:  45, text: 'Renderizando el video, esto toma un momento.' },
  { at:  85, text: 'Subiendo el video a la nube...' },
  { at: 110, text: 'Tomando un poco más de lo habitual, ya casi...' },
  { at: 150, text: '¡Sigue ahí! Terminando los últimos detalles.' },
]

const VIDEO_PHASES = [
  { label: 'Guion con IA',   from:   0, to:  20 },
  { label: 'Generando video', from: 20, to:  85 },
  { label: 'Subiendo',       from:  85, to: 999 },
]

function NoCreditsPanel({ balance, required }: { balance: number; required: number }) {
  return (
    <div className="rounded-[12px] border border-[#FDE68A] bg-[#FFFBEB] p-5 space-y-3">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-[8px] bg-[#FEF3C7] flex items-center justify-center flex-shrink-0">
          <IconBolt size={16} stroke={1.8} className="text-[#D97706]" />
        </div>
        <p className="text-sm font-semibold text-[#92400E]">Créditos insuficientes</p>
      </div>
      <p className="text-xs text-[#92400E]">
        Necesitas <span className="font-bold">{required}</span> créditos pero solo tienes{' '}
        <span className="font-bold">{balance}</span>.
      </p>
      <Link
        href="/credits"
        className="flex items-center justify-center gap-2 w-full py-2.5 bg-[#09090B] text-white text-xs font-semibold rounded-[8px] hover:bg-[#18181B] transition-all duration-150"
      >
        <IconShoppingCart size={14} stroke={1.8} />
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
  const [reportOpen,   setReportOpen]   = useState(false)
  const [reportMsg,    setReportMsg]    = useState('')
  const [reporting,    setReporting]    = useState(false)
  const [reported,     setReported]     = useState(false)
  const intervalRef     = useRef<ReturnType<typeof setInterval> | null>(null)
  const [videoMsgIdx,   setVideoMsgIdx]   = useState(0)
  const [elapsedSecs,   setElapsedSecs]   = useState(0)
  const videoTimersRef  = useRef<ReturnType<typeof setTimeout>[]>([])
  const elapsedTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Cuando un caption termina, obtener el texto via proxy (evita CORS de R2)
  useEffect(() => {
    if (job?.status === 'COMPLETED' && job.type === 'CAPTION' && job.generatedAsset?.url) {
      fetch(`/api/caption?url=${encodeURIComponent(job.generatedAsset.url)}`)
        .then(r => r.ok ? r.text() : Promise.reject(r.status))
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

  async function handleReport(jobId: string) {
    setReporting(true)
    try {
      await api.post('/reports', { jobId, message: reportMsg.trim() || undefined })
      setReported(true)
      setReportOpen(false)
      toast.success('Reporte enviado. ¡Gracias por avisarnos!')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'No se pudo enviar el reporte')
    } finally {
      setReporting(false)
    }
  }

  const selectedType        = ASSET_TYPES.find(t => t.value === assetType)
  const requiredCredits     = selectedType?.credits ?? 0
  const hasEnoughCredits    = credits.balance >= requiredCredits

  function startVideoMessages() {
    videoTimersRef.current.forEach(clearTimeout)
    videoTimersRef.current = []
    if (elapsedTimerRef.current) clearInterval(elapsedTimerRef.current)
    setVideoMsgIdx(0)
    setElapsedSecs(0)
    VIDEO_MESSAGES.forEach(({ at }, idx) => {
      if (idx === 0) return
      const id = setTimeout(() => setVideoMsgIdx(idx), at * 1000)
      videoTimersRef.current.push(id)
    })
    elapsedTimerRef.current = setInterval(() => setElapsedSecs(s => s + 1), 1000)
  }

  function stopVideoMessages() {
    videoTimersRef.current.forEach(clearTimeout)
    videoTimersRef.current = []
    if (elapsedTimerRef.current) { clearInterval(elapsedTimerRef.current); elapsedTimerRef.current = null }
  }

  useEffect(() => {
    api.get<BrandProfile[]>('/brands').then(setBrands).catch(() => {})
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
      stopVideoMessages()
    }
  }, [])

  const stopPolling = useCallback(() => {
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null }
    stopVideoMessages()
    setPolling(false)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const pollJob = useCallback((jobId: string, isVideo: boolean) => {
    setPolling(true)
    let attempts   = 0
    // Images/captions: poll every 2s for 60s (30 attempts)
    // Videos: poll every 5s for ~11min (130 attempts) — Sora/Veo tardan minutos.
    // Debe superar el SORA_TIMEOUT_MS del worker (10 min) para que el worker
    // resuelva el job a FAILED con un mensaje real antes de que la UI se rinda.
    const INTERVAL     = isVideo ? 5000 : 2000
    const MAX_ATTEMPTS = isVideo ? 130  : 30

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
            errorMessage: 'La generación está tardando más de lo normal. El video puede completarse igual — revísalo en la galería de Assets en unos minutos.',
          } : prev)
        }
      } catch {
        stopPolling()
      }
    }, INTERVAL)
  }, [stopPolling, refreshCredits])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!brandId || !userPrompt.trim()) return

    // Guardia del lado cliente antes de llamar al API
    if (!hasEnoughCredits) return

    setLoading(true)
    setJob(null)
    setError(null)
    setReported(false)
    setReportOpen(false)
    setReportMsg('')

    try {
      const created = await api.post<Job>('/generate', {
        brandId,
        type:       assetType,
        userPrompt: userPrompt.trim(),
        platform,
      })
      const isVideo = isVideoType(assetType)
      setJob(created)
      pollJob(created.id, isVideo)
      if (isVideo) startVideoMessages()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al generar el contenido'
      if (msg.toLowerCase().includes('credit') || msg.toLowerCase().includes('crédito')) {
        refreshCredits()
      } else {
        toast.error(msg)
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
        <div data-tour="gen-brand" className="card space-y-3">
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
        <div data-tour="gen-type" className="card space-y-3">
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
                      ? 'border-[#09090B] bg-[#F4F4F5]'
                      : 'border-[#E5E7EB] bg-white hover:border-[#09090B] hover:bg-[#F4F4F5]/20'}
                  `}
                >
                  <div className={`w-8 h-8 rounded-[8px] flex items-center justify-center ${active ? 'bg-[#09090B]' : 'bg-[#F1F3F5]'}`}>
                    <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-[#6B7280]'}`} />
                  </div>
                  <span className={`text-xs font-semibold ${active ? 'text-[#09090B]' : 'text-[#0A0A0A]'}`}>{label}</span>
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
        <div data-tour="gen-platform" className="card space-y-3">
          <h2 className="text-sm font-semibold text-[#0A0A0A]">Plataforma</h2>
          <div className="flex flex-wrap gap-2">
            {PLATFORMS.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => setPlatform(value)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-150
                  ${platform === value ? 'bg-[#F4F4F5] text-[#09090B]' : 'bg-[#F1F3F5] text-[#374151] hover:bg-[#F4F4F5]/50'}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Prompt */}
        <div data-tour="gen-prompt" className="card space-y-3">
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

        {/* Botón — cambia según créditos */}
        {hasEnoughCredits ? (
          <button
            type="submit"
            disabled={loading || polling || !brandId || !userPrompt.trim()}
            className="btn-accent w-full py-3"
          >
            {loading || polling
              ? <><IconLoader2 size={15} className="animate-spin" /> Generando...</>
              : <><IconSparkles size={15} stroke={1.8} /> Generar — {requiredCredits} créditos</>
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
        <div data-tour="gen-status" className="card p-5">
          <h3 className="text-sm font-semibold text-[#0A0A0A] mb-4">Estado de generación</h3>

          {!job && !error && (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="w-12 h-12 rounded-full bg-[#F1F3F5] flex items-center justify-center mb-3">
                <IconSparkles size={20} stroke={1.5} className="text-[#A1A1AA]" />
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
              {/* Badge de estado */}
              <div className={`flex items-center gap-2 px-3 py-2 rounded-[8px] text-xs font-medium
                ${job.status === 'COMPLETED' ? 'bg-green-50 text-green-700'  : ''}
                ${job.status === 'FAILED'    ? 'bg-red-50   text-red-700'    : ''}
                ${job.status === 'PENDING' || job.status === 'PROCESSING' ? 'bg-[#F4F4F5] text-[#09090B]' : ''}
              `}>
                {job.status === 'COMPLETED'  && <IconCircleCheck size={15} stroke={1.8} />}
                {job.status === 'FAILED'     && <IconCircleX     size={15} stroke={1.8} />}
                {(job.status === 'PENDING' || job.status === 'PROCESSING') && <IconLoader2 size={15} className="animate-spin" />}
                {{
                  PENDING:    'En cola...',
                  PROCESSING: 'Generando con IA...',
                  COMPLETED:  '¡Listo!',
                  FAILED:     'Error en generación',
                }[job.status]}
              </div>

              {/* Panel explicativo para videos en progreso */}
              {(job.status === 'PENDING' || job.status === 'PROCESSING') &&
               isVideoType(job.type) && (
                <div className="space-y-2.5">

                  {/* Paso actual animado */}
                  <div className="rounded-[10px] border border-[#E4E4E7] bg-[#FAFAFA] p-4 space-y-3">
                    <div className="flex items-start gap-2.5">
                      <IconMovie size={15} stroke={1.7} className="text-[#09090B] flex-shrink-0 mt-0.5" />
                      <p className="text-xs font-medium text-[#09090B] leading-relaxed">
                        {VIDEO_MESSAGES[videoMsgIdx]?.text}
                      </p>
                    </div>

                    {/* Barra de progreso basada en tiempo */}
                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-[10px] text-[#A1A1AA]">
                          {elapsedSecs < 60
                            ? `${elapsedSecs}s transcurridos`
                            : `${Math.floor(elapsedSecs / 60)}m ${elapsedSecs % 60}s transcurridos`}
                        </span>
                        <span className="text-[10px] text-[#A1A1AA]">
                          {job.type === 'VIDEO_8S' ? 'aprox. 1–2 min' : job.type === 'VIDEO_15S' ? 'aprox. 1–3 min' : 'aprox. 2–4 min'}
                        </span>
                      </div>
                      <div className="h-1.5 bg-[#E4E4E7] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#09090B] rounded-full transition-all duration-1000 ease-linear"
                          style={{ width: `${Math.min(elapsedSecs / (job.type === 'VIDEO_8S' ? 110 : job.type === 'VIDEO_15S' ? 200 : 260) * 100, 93)}%` }}
                        />
                      </div>
                    </div>

                    {/* Fases */}
                    <div className="flex gap-1 flex-wrap">
                      {VIDEO_PHASES.map(phase => {
                        const done    = elapsedSecs >= phase.to && phase.to !== 999
                        const active  = elapsedSecs >= phase.from && elapsedSecs < phase.to
                        return (
                          <span key={phase.label} className={`
                            text-[9px] font-medium px-2 py-0.5 rounded-full transition-all duration-500
                            ${done   ? 'bg-[#09090B] text-white'        : ''}
                            ${active ? 'bg-[#F4F4F5] text-[#09090B] ring-1 ring-[#09090B]' : ''}
                            ${!done && !active ? 'bg-[#F4F4F5] text-[#A1A1AA]' : ''}
                          `}>
                            {done ? '✓ ' : ''}{phase.label}
                          </span>
                        )
                      })}
                    </div>
                  </div>

                  {/* Nota técnica */}
                  <div className="flex items-start gap-2 px-3 py-2.5 rounded-[8px] border border-[#E4E4E7] bg-white">
                    <IconInfoCircle size={13} stroke={1.7} className="text-[#A1A1AA] flex-shrink-0 mt-px" />
                    <p className="text-[10px] text-[#71717A] leading-relaxed">
                      El video se genera con <span className="font-semibold text-[#3F3F46]">IA y audio incorporado</span> a partir del guion de tu marca. Por eso toma unos minutos: vale la pena la espera.
                    </p>
                  </div>
                </div>
              )}

              {job.status === 'FAILED' && (
                <div className="space-y-2.5">
                  {job.errorMessage && (
                    <p className="text-xs text-[#EF4444]">{job.errorMessage}</p>
                  )}

                  {reported ? (
                    <div className="flex items-center gap-2 rounded-[8px] bg-[#10B981]/10 px-3 py-2 text-xs font-medium text-[#059669] animate-fade-in">
                      <IconCircleCheck size={14} stroke={1.8} className="flex-shrink-0" />
                      Reporte enviado. ¡Gracias por avisarnos!
                    </div>
                  ) : reportOpen ? (
                    <div className="space-y-2 rounded-[8px] border border-[#E4E4E7] bg-white p-3 animate-fade-in">
                      <label className="block text-[11px] font-medium text-[#3F3F46]">
                        ¿Qué querías generar? (opcional)
                      </label>
                      <textarea
                        value={reportMsg}
                        onChange={e => setReportMsg(e.target.value)}
                        rows={3}
                        maxLength={500}
                        placeholder="Contanos qué esperabas o qué salió mal…"
                        className="input resize-none text-xs"
                      />
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleReport(job.id)}
                          disabled={reporting}
                          className="btn-primary px-3 py-1.5 text-xs"
                        >
                          {reporting
                            ? <><IconLoader2 size={13} className="animate-spin" /> Enviando…</>
                            : 'Enviar reporte'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setReportOpen(false)}
                          className="btn-ghost px-3 py-1.5 text-xs"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setReportOpen(true)}
                      className="btn-outline px-3 py-1.5 text-xs"
                    >
                      <IconFlag size={13} stroke={1.8} /> Reportar este fallo
                    </button>
                  )}
                </div>
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
                      {isVideoType(job.type) ? (
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
                          <IconArrowsMaximize size={14} stroke={1.8} />
                          Ver en grande
                        </div>
                      </div>
                    </button>

                    {/* Acciones rápidas */}
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => handleDownload(job.generatedAsset!.url)}
                        className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-[8px] bg-[#09090B] text-white text-xs font-semibold hover:bg-[#18181B] transition-all duration-150"
                      >
                        <IconDownload size={14} stroke={2} />
                        Descargar
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDiscard(job.generatedAsset!.id)}
                        disabled={discarding}
                        className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-[8px] border border-[#E5E7EB] text-[#6B7280] text-xs font-semibold hover:bg-[#F1F3F5] hover:text-[#EF4444] hover:border-[#EF4444] transition-all duration-150 disabled:opacity-60"
                      >
                        {discarding
                          ? <IconLoader2 size={14} className="animate-spin" />
                          : <IconTrash size={14} stroke={1.8} className="w-3.5 h-3.5" />
                        }
                        {discarding ? 'Eliminando…' : 'Descartar'}
                      </button>
                    </div>

                    <p className="text-[10px] text-[#9CA3AF] text-center">
                      El asset queda guardado en{' '}
                      <a href="/assets" className="text-[#09090B] hover:underline">Mis assets</a>
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
            <IconBolt size={15} stroke={1.8} className="text-[#09090B]" />
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
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Generar contenido</h1>
          <p className="page-subtitle">Crea imágenes, banners, captions y videos con IA</p>
        </div>
      </div>
      <Suspense>
        <GenerateForm />
      </Suspense>
    </div>
  )
}
