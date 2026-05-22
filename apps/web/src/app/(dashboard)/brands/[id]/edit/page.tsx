'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, UploadSimple, X, CircleNotch, CheckCircle, Trash,
  Coffee, ForkKnife, ShoppingBag, Briefcase, Sparkle,
} from '@phosphor-icons/react'
import { createClient } from '@/lib/supabase'
import { api } from '@/lib/api-client'
import type { BrandProfile } from '@brandai/shared'

/** Extrae { bucket, path } de una URL pública de Supabase Storage */
function extractStoragePath(url: string): { bucket: string; path: string } | null {
  const marker = '/object/public/'
  const idx = url.indexOf(marker)
  if (idx === -1) return null
  const after = url.slice(idx + marker.length)
  const slash = after.indexOf('/')
  if (slash === -1) return null
  return { bucket: after.slice(0, slash), path: after.slice(slash + 1) }
}

const INDUSTRIES = [
  { value: 'cafe',       label: 'Café',        Icon: Coffee      },
  { value: 'restaurant', label: 'Restaurante', Icon: ForkKnife   },
  { value: 'retail',     label: 'Retail',      Icon: ShoppingBag },
  { value: 'services',   label: 'Servicios',   Icon: Briefcase   },
  { value: 'other',      label: 'Otro',        Icon: Sparkle     },
]

const TONES = [
  { value: 'warm',     label: 'Cálido y artesanal' },
  { value: 'modern',   label: 'Moderno y minimalista' },
  { value: 'elegant',  label: 'Elegante y premium' },
  { value: 'cheerful', label: 'Alegre y colorido' },
  { value: 'rustic',   label: 'Rústico y natural' },
]

export default function EditBrandPage() {
  const router      = useRouter()
  const params      = useParams()
  const id          = params['id'] as string
  const logoRef        = useRef<HTMLInputElement>(null)
  const refImgRef      = useRef<HTMLInputElement>(null)
  const originalLogo   = useRef<string | null>(null)
  const originalRefUrls = useRef<string[]>([])

  const [loadingBrand, setLoadingBrand] = useState(true)
  const [saving,       setSaving]       = useState(false)
  const [error,        setError]        = useState<string | null>(null)
  const [notFound,     setNotFound]     = useState(false)

  // Campos de texto
  const [name,           setName]           = useState('')
  const [description,    setDescription]    = useState('')
  const [targetAudience, setTargetAudience] = useState('')
  const [industry,       setIndustry]       = useState('')
  const [toneOfVoice,    setToneOfVoice]    = useState('')

  // Logo
  const [logoUrl,      setLogoUrl]      = useState<string | null>(null)
  const [newLogoFile,  setNewLogoFile]  = useState<File | null>(null)
  const [logoPreview,  setLogoPreview]  = useState<string | null>(null)

  // Imágenes de referencia
  const [refUrls,      setRefUrls]      = useState<string[]>([])
  const [newRefFiles,  setNewRefFiles]  = useState<File[]>([])
  const [newRefPrev,   setNewRefPrev]   = useState<string[]>([])

  useEffect(() => {
    api.get<BrandProfile>(`/brands/${id}`)
      .then(b => {
        setName(b.name)
        setDescription(b.description ?? '')
        setTargetAudience(b.targetAudience ?? '')
        setIndustry(b.industry ?? '')
        setToneOfVoice(b.toneOfVoice ?? '')
        setLogoUrl(b.logoUrl)
        setLogoPreview(b.logoUrl)
        setRefUrls(b.referenceImageUrls)
        // guardar originales para detectar eliminaciones al guardar
        originalLogo.current    = b.logoUrl
        originalRefUrls.current = b.referenceImageUrls
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoadingBrand(false))
  }, [id])

  // Logo handlers
  function handleLogoFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (logoPreview && logoPreview.startsWith('blob:')) URL.revokeObjectURL(logoPreview)
    setNewLogoFile(file)
    setLogoPreview(URL.createObjectURL(file))
  }

  function removeLogo() {
    if (logoPreview?.startsWith('blob:')) URL.revokeObjectURL(logoPreview)
    setLogoUrl(null)
    setNewLogoFile(null)
    setLogoPreview(null)
    if (logoRef.current) logoRef.current.value = ''
  }

  // Ref image handlers
  function handleRefFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    setNewRefFiles(prev => [...prev, ...files])
    setNewRefPrev(prev => [...prev, ...files.map(f => URL.createObjectURL(f))])
    if (refImgRef.current) refImgRef.current.value = ''
  }

  function removeExistingRef(url: string) {
    setRefUrls(prev => prev.filter(u => u !== url))
  }

  function removeNewRef(i: number) {
    URL.revokeObjectURL(newRefPrev[i])
    setNewRefFiles(prev => prev.filter((_, j) => j !== i))
    setNewRefPrev(prev => prev.filter((_, j) => j !== i))
  }

  async function handleSave() {
    if (!name.trim()) return
    setSaving(true)
    setError(null)

    try {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      const userId = session?.user?.id

      // ── Eliminar de Storage las imágenes que el usuario quitó ───────────────
      const urlsToDelete: string[] = []

      // Logo eliminado o reemplazado
      if (originalLogo.current && originalLogo.current !== logoUrl) {
        urlsToDelete.push(originalLogo.current)
      }

      // Imágenes de referencia eliminadas
      for (const url of originalRefUrls.current) {
        if (!refUrls.includes(url)) urlsToDelete.push(url)
      }

      if (urlsToDelete.length > 0) {
        const byBucket = new Map<string, string[]>()
        for (const url of urlsToDelete) {
          const parsed = extractStoragePath(url)
          if (!parsed) continue
          const list = byBucket.get(parsed.bucket) ?? []
          list.push(parsed.path)
          byBucket.set(parsed.bucket, list)
        }
        await Promise.allSettled(
          [...byBucket.entries()].map(([bucket, paths]) =>
            supabase.storage.from(bucket).remove(paths),
          ),
        )
      }

      // Subir nuevo logo si el usuario seleccionó uno
      let finalLogoUrl: string | null = logoUrl
      if (newLogoFile && userId) {
        const path = `${userId}/${Date.now()}-${newLogoFile.name.replace(/\s+/g, '_')}`
        const { error: upErr } = await supabase.storage
          .from('brand-assets')
          .upload(path, newLogoFile, { upsert: true })
        if (!upErr) {
          const { data: urlData } = supabase.storage.from('brand-assets').getPublicUrl(path)
          finalLogoUrl = urlData.publicUrl
        }
      }

      // Subir nuevas imágenes de referencia
      const uploadedRefUrls: string[] = []
      if (newRefFiles.length > 0 && userId) {
        for (const file of newRefFiles) {
          const path = `${userId}/${Date.now()}-${file.name.replace(/\s+/g, '_')}`
          const { error: upErr } = await supabase.storage
            .from('brand-assets')
            .upload(path, file, { upsert: true })
          if (!upErr) {
            const { data: urlData } = supabase.storage.from('brand-assets').getPublicUrl(path)
            uploadedRefUrls.push(urlData.publicUrl)
          }
        }
      }

      await api.patch(`/brands/${id}`, {
        name:               name.trim(),
        description:        description.trim() || undefined,
        targetAudience:     targetAudience.trim() || undefined,
        industry:           industry   || undefined,
        toneOfVoice:        toneOfVoice || undefined,
        logoUrl:            finalLogoUrl,
        referenceImageUrls: [...refUrls, ...uploadedRefUrls],
      })

      // Re-analizar con IA si cambiaron las imágenes
      if (newRefFiles.length > 0 || newLogoFile) {
        await api.post(`/brands/${id}/analyze`, {}).catch(() => {})
      }

      router.push('/brands')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar los cambios')
    } finally {
      setSaving(false)
    }
  }

  // ── Estados de carga / error ────────────────────────────────────────────────

  if (loadingBrand) {
    return (
      <div className="max-w-[640px] mx-auto space-y-4 pt-4">
        {[1, 2, 3].map(i => <div key={i} className="card h-32 skeleton" />)}
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="max-w-[640px] mx-auto">
        <div className="card text-center py-16">
          <p className="text-sm text-[#6B7280]">Marca no encontrada</p>
          <Link href="/brands" className="btn-outline mt-4 inline-flex">Volver a mis marcas</Link>
        </div>
      </div>
    )
  }

  const totalImages = refUrls.length + newRefFiles.length

  return (
    <div className="max-w-[640px] mx-auto pb-12">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Link
          href="/brands"
          className="w-9 h-9 flex items-center justify-center rounded-[8px] border border-[#E5E7EB] text-[#6B7280] hover:bg-[#F1F3F5] transition-all duration-150 flex-shrink-0"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[#0A0A0A]">Editar marca</h1>
          <p className="text-sm text-[#6B7280] mt-0.5 truncate">{name}</p>
        </div>
      </div>

      <div className="space-y-5">
        {/* Información básica */}
        <div className="card space-y-4">
          <h2 className="text-sm font-semibold text-[#0A0A0A]">Información básica</h2>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[#374151]">Nombre *</label>
            <input
              className="input"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Nombre de tu negocio"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[#374151]">Descripción</label>
            <textarea
              className="input min-h-[80px] resize-none"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="¿A qué se dedica tu negocio?"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[#374151]">Público objetivo</label>
            <input
              className="input"
              value={targetAudience}
              onChange={e => setTargetAudience(e.target.value)}
              placeholder="Ej: Mujeres de 25-40 años"
            />
          </div>
        </div>

        {/* Identidad de marca */}
        <div className="card space-y-4">
          <h2 className="text-sm font-semibold text-[#0A0A0A]">Identidad de marca</h2>

          <div className="space-y-2">
            <label className="text-xs font-medium text-[#374151]">Industria</label>
            <div className="grid grid-cols-5 gap-2">
              {INDUSTRIES.map(({ value, label, Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setIndustry(value)}
                  className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-[10px] border text-center transition-all duration-150
                    ${industry === value
                      ? 'border-[#7C3AED] bg-[#EDE9FE]'
                      : 'border-[#E5E7EB] bg-white hover:border-[#7C3AED] hover:bg-[#EDE9FE]/20'}`}
                >
                  <Icon className={`w-5 h-5 ${industry === value ? 'text-[#7C3AED]' : 'text-[#6B7280]'}`} weight={industry === value ? 'bold' : 'regular'} />
                  <span className={`text-[10px] font-semibold leading-tight ${industry === value ? 'text-[#7C3AED]' : 'text-[#374151]'}`}>
                    {label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-[#374151]">Tono de voz</label>
            <div className="grid grid-cols-1 gap-1.5">
              {TONES.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setToneOfVoice(value)}
                  className={`text-left px-4 py-2.5 rounded-[10px] border text-sm font-medium transition-all duration-150
                    ${toneOfVoice === value
                      ? 'border-[#7C3AED] bg-[#EDE9FE] text-[#7C3AED]'
                      : 'border-[#E5E7EB] bg-white text-[#0A0A0A] hover:border-[#7C3AED] hover:bg-[#EDE9FE]/20'}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Logo */}
        <div className="card space-y-4">
          <h2 className="text-sm font-semibold text-[#0A0A0A]">Logo</h2>

          {logoPreview ? (
            <div className="flex items-center gap-4">
              <img
                src={logoPreview}
                alt="Logo"
                className="w-20 h-20 rounded-[10px] object-cover border border-[#E5E7EB] flex-shrink-0"
              />
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => logoRef.current?.click()}
                  className="btn-outline text-xs py-1.5 px-3"
                >
                  Reemplazar
                </button>
                <button
                  type="button"
                  onClick={removeLogo}
                  className="flex items-center gap-1.5 text-xs font-medium text-[#EF4444] hover:underline"
                >
                  <Trash className="w-3.5 h-3.5" />
                  Eliminar logo
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => logoRef.current?.click()}
              className="w-full border-2 border-dashed border-[#D1D5DB] rounded-[12px] p-6 flex flex-col items-center gap-2 hover:border-[#7C3AED] hover:bg-[#EDE9FE]/10 transition-all duration-150"
            >
              <div className="w-9 h-9 rounded-full bg-[#F1F3F5] flex items-center justify-center">
                <UploadSimple className="w-4 h-4 text-[#6B7280]" />
              </div>
              <span className="text-xs font-semibold text-[#0A0A0A]">Subir logo</span>
              <span className="text-[10px] text-[#6B7280]">PNG, JPG, WEBP</span>
            </button>
          )}

          <input ref={logoRef} type="file" accept="image/*" className="hidden" onChange={handleLogoFile} />
        </div>

        {/* Imágenes de referencia */}
        <div className="card space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-[#0A0A0A]">Imágenes de referencia</h2>
              {totalImages > 0 && (
                <p className="text-xs text-[#6B7280] mt-0.5">{totalImages} imagen{totalImages !== 1 ? 'es' : ''}</p>
              )}
            </div>
            <button
              type="button"
              onClick={() => refImgRef.current?.click()}
              className="flex items-center gap-1.5 text-xs font-semibold text-[#7C3AED] hover:text-[#6D28D9] transition-colors"
            >
              <UploadSimple className="w-3.5 h-3.5" />
              Añadir
            </button>
          </div>

          {totalImages > 0 ? (
            <div className="grid grid-cols-3 gap-2">
              {/* Existentes */}
              {refUrls.map(url => (
                <div key={url} className="relative group aspect-square">
                  <img
                    src={url}
                    alt="Referencia"
                    className="w-full h-full object-cover rounded-[8px] border border-[#E5E7EB]"
                  />
                  <button
                    type="button"
                    onClick={() => removeExistingRef(url)}
                    className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Quitar imagen"
                  >
                    <X className="w-3 h-3 text-white" />
                  </button>
                </div>
              ))}

              {/* Nuevas (pendientes de subir) */}
              {newRefPrev.map((preview, i) => (
                <div key={`new-${i}`} className="relative group aspect-square">
                  <img
                    src={preview}
                    alt="Nueva"
                    className="w-full h-full object-cover rounded-[8px] border-2 border-[#7C3AED]"
                  />
                  <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded-full bg-[#7C3AED] text-[9px] font-bold text-white leading-none">
                    NUEVA
                  </div>
                  <button
                    type="button"
                    onClick={() => removeNewRef(i)}
                    className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Quitar imagen"
                  >
                    <X className="w-3 h-3 text-white" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => refImgRef.current?.click()}
              className="w-full border-2 border-dashed border-[#D1D5DB] rounded-[12px] p-6 flex flex-col items-center gap-2 hover:border-[#7C3AED] hover:bg-[#EDE9FE]/10 transition-all duration-150"
            >
              <UploadSimple className="w-5 h-5 text-[#9CA3AF]" />
              <span className="text-xs text-[#6B7280]">Sin imágenes — haz clic para añadir</span>
            </button>
          )}

          <input ref={refImgRef} type="file" accept="image/*" multiple className="hidden" onChange={handleRefFiles} />
        </div>

        {/* Error */}
        {error && (
          <p className="text-sm text-[#EF4444] bg-red-50 border border-red-200 rounded-[8px] px-3 py-2.5">
            {error}
          </p>
        )}

        {/* Acciones */}
        <div className="flex gap-3">
          <Link href="/brands" className="btn-outline flex-1 text-center py-2.5">
            Cancelar
          </Link>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !name.trim()}
            className="btn-accent flex-1 py-2.5"
          >
            {saving
              ? <><CircleNotch className="w-4 h-4 animate-spin" /> Guardando...</>
              : <><CheckCircle className="w-4 h-4" /> Guardar cambios</>
            }
          </button>
        </div>
      </div>
    </div>
  )
}
