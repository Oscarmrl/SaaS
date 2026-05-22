'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { UploadSimple, X, CheckCircle, Sparkle, ArrowRight, CaretLeft, Coffee, ForkKnife, ShoppingBag, Briefcase } from '@phosphor-icons/react'
import { createClient } from '@/lib/supabase'
import { api } from '@/lib/api-client'
import type { BrandProfile } from '@brandai/shared'

type Industry = 'cafe' | 'restaurant' | 'retail' | 'services' | 'other'
type QuestionType = 'text' | 'select' | 'multiselect' | 'upload'

interface Question {
  id: string
  type: QuestionType
  label: string
  hint?: string
  placeholder?: string
  options?: string[]
}

const INDUSTRIES = [
  { value: 'cafe'       as Industry, label: 'Café / Cafetería', Icon: Coffee      },
  { value: 'restaurant' as Industry, label: 'Restaurante',      Icon: ForkKnife   },
  { value: 'retail'     as Industry, label: 'Tienda / Retail',  Icon: ShoppingBag },
  { value: 'services'   as Industry, label: 'Servicios',        Icon: Briefcase   },
  { value: 'other'      as Industry, label: 'Otro negocio',     Icon: Sparkle     },
]

const TONES = [
  { label: 'Cálido y artesanal',    value: 'warm' },
  { label: 'Moderno y minimalista', value: 'modern' },
  { label: 'Elegante y premium',    value: 'elegant' },
  { label: 'Alegre y colorido',     value: 'cheerful' },
  { label: 'Rústico y natural',     value: 'rustic' },
]

const PLATFORM_VALUES: Record<string, string> = {
  'Instagram': 'instagram',
  'Facebook': 'facebook',
  'WhatsApp Business': 'whatsapp',
  'TikTok': 'tiktok',
}

const TONE_Q: Question = {
  id: 'toneOfVoice',
  type: 'select',
  label: '¿Qué tono quieres transmitir?',
  options: TONES.map(t => t.label),
}

const PLATFORMS_Q: Question = {
  id: 'platforms',
  type: 'multiselect',
  label: '¿Para qué redes sociales vas a crear contenido?',
  options: ['Instagram', 'Facebook', 'WhatsApp Business', 'TikTok'],
}

const UPLOAD_Q: Question = {
  id: 'referenceImages',
  type: 'upload',
  label: 'Sube tu logo, fotos del negocio o imágenes de inspiración',
  hint: 'Mientras más subas, mejor respetaré tu identidad de marca (opcional)',
}

const FLOWS: Record<Industry, Question[]> = {
  cafe: [
    { id: 'brandName',   type: 'text',   label: '¿Cómo se llama tu café?',                placeholder: 'Ej: Café del Valle' },
    { id: 'coffeeType',  type: 'select', label: '¿Qué tipo de café ofreces?',              options: ['Especialidad', 'Tradicional', 'Cadena / franquicia'] },
    { id: 'atmosphere',  type: 'select', label: '¿Qué quieres mostrar en tu contenido?',   options: ['El ambiente del local', 'Los productos', 'Ambos'] },
    TONE_Q, PLATFORMS_Q, UPLOAD_Q,
  ],
  restaurant: [
    { id: 'brandName',   type: 'text',   label: '¿Cómo se llama tu restaurante?',          placeholder: 'Ej: La Cocina de Mamá' },
    { id: 'cuisineType', type: 'select', label: '¿Qué tipo de cocina ofreces?',             options: ['Mexicana', 'Internacional', 'Mediterránea', 'Asiática', 'Fusión', 'Otra'] },
    { id: 'focus',       type: 'select', label: '¿Qué quieres destacar?',                  options: ['Los platillos', 'El ambiente', 'Las promociones', 'Todo'] },
    TONE_Q, PLATFORMS_Q, UPLOAD_Q,
  ],
  retail: [
    { id: 'brandName',      type: 'text',   label: '¿Cómo se llama tu tienda?',            placeholder: 'Ej: Moda Express' },
    { id: 'productType',    type: 'select', label: '¿Qué vendes?',                         options: ['Ropa y accesorios', 'Tecnología', 'Hogar y decoración', 'Alimentos', 'Belleza', 'Otro'] },
    { id: 'targetAudience', type: 'text',   label: '¿A quién va dirigido tu negocio?',     placeholder: 'Ej: Mujeres de 25-40 años' },
    TONE_Q, PLATFORMS_Q, UPLOAD_Q,
  ],
  services: [
    { id: 'brandName',      type: 'text',   label: '¿Cómo se llama tu negocio?',           placeholder: 'Ej: Soluciones Rápidas' },
    { id: 'serviceType',    type: 'select', label: '¿Qué servicio ofreces?',               options: ['Salud y bienestar', 'Educación', 'Legal / Financiero', 'Tecnología', 'Construcción', 'Otro'] },
    { id: 'targetAudience', type: 'text',   label: '¿A quién va dirigido?',                placeholder: 'Ej: Empresas pequeñas y medianas' },
    TONE_Q, PLATFORMS_Q, UPLOAD_Q,
  ],
  other: [
    { id: 'brandName',      type: 'text',   label: '¿Cómo se llama tu negocio?',           placeholder: 'Nombre de tu negocio' },
    { id: 'description',    type: 'text',   label: '¿A qué se dedica tu negocio?',         placeholder: 'Describe brevemente qué ofreces' },
    { id: 'targetAudience', type: 'text',   label: '¿A quién va dirigido?',                placeholder: 'Describe tu público objetivo' },
    TONE_Q, PLATFORMS_Q, UPLOAD_Q,
  ],
}

function buildPayload(industry: Industry, answers: Record<string, unknown>) {
  const toneLabel = answers['toneOfVoice'] as string | undefined
  const toneValue = TONES.find(t => t.label === toneLabel)?.value

  const platformLabels = answers['platforms'] as string[] | undefined
  const platforms = platformLabels
    ?.map(p => PLATFORM_VALUES[p])
    .filter((p): p is string => Boolean(p))

  const descParts: string[] = []
  if (answers['coffeeType'])  descParts.push(`Tipo de café: ${answers['coffeeType']}`)
  if (answers['atmosphere'])  descParts.push(`Contenido: ${answers['atmosphere']}`)
  if (answers['cuisineType']) descParts.push(`Cocina: ${answers['cuisineType']}`)
  if (answers['focus'])       descParts.push(`Enfoque: ${answers['focus']}`)
  if (answers['productType']) descParts.push(`Productos: ${answers['productType']}`)
  if (answers['serviceType']) descParts.push(`Servicio: ${answers['serviceType']}`)
  if (answers['description']) descParts.push(answers['description'] as string)

  return {
    name:           answers['brandName'] as string,
    industry,
    toneOfVoice:    toneValue,
    targetAudience: answers['targetAudience'] as string | undefined,
    description:    descParts.join('. ') || undefined,
    platforms:      platforms as ('instagram' | 'facebook' | 'whatsapp' | 'tiktok')[] | undefined,
  }
}

type Phase = 'industry' | 'questions' | 'submitting' | 'done'

export function SmartBrandForm() {
  const router     = useRouter()
  const fileRef    = useRef<HTMLInputElement>(null)

  const [phase,         setPhase]         = useState<Phase>('industry')
  const [industry,      setIndustry]      = useState<Industry | null>(null)
  const [questionIndex, setQuestionIndex] = useState(0)
  const [answers,       setAnswers]       = useState<Record<string, unknown>>({})
  const [files,         setFiles]         = useState<File[]>([])
  const [error,         setError]         = useState<string | null>(null)
  const [createdBrand,  setCreatedBrand]  = useState<BrandProfile | null>(null)

  const questions      = industry ? FLOWS[industry] : []
  const currentQ       = questions[questionIndex]
  const progress       = questions.length > 0 ? ((questionIndex + 1) / questions.length) * 100 : 0
  const currentAnswer  = currentQ ? answers[currentQ.id] : undefined
  const isLast         = questionIndex === questions.length - 1

  function selectIndustry(ind: Industry) {
    setIndustry(ind)
    setPhase('questions')
    setQuestionIndex(0)
    setAnswers({})
    setFiles([])
  }

  function setAnswer(value: unknown) {
    setAnswers(prev => ({ ...prev, [currentQ.id]: value }))
  }

  function toggleOption(option: string) {
    const current = (answers[currentQ.id] as string[] | undefined) ?? []
    const next = current.includes(option)
      ? current.filter(o => o !== option)
      : [...current, option]
    setAnswer(next)
  }

  function canProceed(): boolean {
    if (currentQ?.type === 'upload') return true
    if (!currentAnswer) return false
    if (currentQ?.type === 'multiselect') return Array.isArray(currentAnswer) && currentAnswer.length > 0
    if (currentQ?.type === 'text') return typeof currentAnswer === 'string' && currentAnswer.trim().length > 0
    return Boolean(currentAnswer)
  }

  function handleBack() {
    if (questionIndex === 0) {
      setPhase('industry')
      setIndustry(null)
    } else {
      setQuestionIndex(i => i - 1)
    }
  }

  function handleNext() {
    if (isLast) handleSubmit()
    else setQuestionIndex(i => i + 1)
  }

  async function handleSubmit() {
    if (!industry) return
    setPhase('submitting')
    setError(null)

    try {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      const userId = session?.user?.id

      const uploadedUrls: string[] = []
      if (files.length > 0 && userId) {
        for (const file of files) {
          const path = `${userId}/${Date.now()}-${file.name.replace(/\s+/g, '_')}`
          const { error: upErr } = await supabase.storage
            .from('brand-assets')
            .upload(path, file, { upsert: true })
          if (!upErr) {
            const { data: urlData } = supabase.storage.from('brand-assets').getPublicUrl(path)
            uploadedUrls.push(urlData.publicUrl)
          }
        }
      }

      const payload = {
        ...buildPayload(industry, answers),
        ...(uploadedUrls.length > 0 ? {
          logoUrl:            uploadedUrls[0],
          referenceImageUrls: uploadedUrls,
        } : {}),
      }

      const brand = await api.post<BrandProfile>('/brands', payload)

      if (uploadedUrls.length > 0) {
        await api.post(`/brands/${brand.id}/analyze`, {}).catch(() => {})
      }

      setCreatedBrand(brand)
      setPhase('done')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocurrió un error al crear la marca')
      setPhase('questions')
    }
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files ?? [])
    setFiles(prev => [...prev, ...selected])
    setAnswer(selected.map(f => f.name))
  }

  function removeFile(index: number) {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  // ── Phase: Industry selection ───────────────────────────────────────────────
  if (phase === 'industry') {
    return (
      <div className="max-w-[560px] mx-auto pt-8">
        <div className="text-center mb-10">
          <div className="pill-accent inline-flex mb-4">Nueva marca</div>
          <h1 className="text-2xl font-bold text-[#0A0A0A]">¿Cuál es tu tipo de negocio?</h1>
          <p className="text-[#6B7280] text-sm mt-2">Adaptaré las preguntas a tu industria</p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {INDUSTRIES.map(({ value, label, Icon }) => (
            <button
              key={value}
              onClick={() => selectIndustry(value)}
              className="
                flex flex-col items-center gap-3 p-5 bg-white border border-[#E5E7EB]
                rounded-[12px] hover:border-[#7C3AED] hover:bg-[#EDE9FE]/20
                transition-all duration-150 group text-center
              "
            >
              <div className="w-10 h-10 rounded-[10px] bg-[#F1F3F5] flex items-center justify-center group-hover:bg-[#EDE9FE] transition-colors">
                <Icon className="w-5 h-5 text-[#6B7280] group-hover:text-[#7C3AED] transition-colors" />
              </div>
              <span className="text-sm font-semibold text-[#0A0A0A] group-hover:text-[#7C3AED] transition-colors">{label}</span>
            </button>
          ))}
        </div>
      </div>
    )
  }

  // ── Phase: Submitting ───────────────────────────────────────────────────────
  if (phase === 'submitting') {
    return (
      <div className="max-w-[560px] mx-auto pt-16 flex flex-col items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-[#EDE9FE] flex items-center justify-center">
          <Sparkle className="w-7 h-7 text-[#7C3AED] animate-pulse" />
        </div>
        <h2 className="text-lg font-bold text-[#0A0A0A]">Creando tu marca...</h2>
        <p className="text-sm text-[#6B7280] text-center">
          {files.length > 0 ? 'Analizando tus imágenes con IA' : 'Guardando tu información'}
        </p>
      </div>
    )
  }

  // ── Phase: Done ─────────────────────────────────────────────────────────────
  if (phase === 'done' && createdBrand) {
    return (
      <div className="max-w-[560px] mx-auto pt-16 flex flex-col items-center gap-6 text-center">
        <div className="w-16 h-16 rounded-full bg-[#D1FAE5] flex items-center justify-center">
          <CheckCircle className="w-8 h-8 text-[#10B981]" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-[#0A0A0A]">¡Tu marca está lista!</h2>
          <p className="text-[#6B7280] mt-2 text-sm">
            <span className="font-semibold text-[#0A0A0A]">{createdBrand.name}</span> fue creada correctamente
          </p>
        </div>
        <div className="bg-white border border-[#E5E7EB] rounded-[12px] p-5 w-full text-left space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#6B7280]">Industria</span>
            <span className="pill text-xs capitalize">{createdBrand.industry ?? '—'}</span>
          </div>
          {createdBrand.toneOfVoice && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#6B7280]">Tono</span>
              <span className="text-sm font-medium text-[#0A0A0A] capitalize">{createdBrand.toneOfVoice}</span>
            </div>
          )}
          {createdBrand.targetAudience && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#6B7280]">Público objetivo</span>
              <span className="text-sm font-medium text-[#0A0A0A]">{createdBrand.targetAudience}</span>
            </div>
          )}
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <button
            onClick={() => router.push('/generate')}
            className="btn-accent flex-1"
          >
            <Sparkle className="w-4 h-4" />
            Generar contenido
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => router.push('/brands')}
            className="btn-outline flex-1"
          >
            Ver mis marcas
          </button>
        </div>
      </div>
    )
  }

  // ── Phase: Questions ────────────────────────────────────────────────────────
  if (!currentQ) return null

  return (
    <div className="max-w-[560px] mx-auto pt-6">
      {/* Progress bar */}
      <div className="h-1 w-full bg-[#E5E7EB] rounded-full mb-8 overflow-hidden">
        <div
          className="h-full bg-[#7C3AED] rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Step counter */}
      <div className="pill-accent text-xs mb-6">
        Paso {questionIndex + 1} de {questions.length}
      </div>

      {/* Question */}
      <h2 className="text-2xl font-bold text-[#0A0A0A] mb-2 leading-snug">{currentQ.label}</h2>
      {currentQ.hint && (
        <p className="text-sm text-[#6B7280] mb-6">{currentQ.hint}</p>
      )}

      {/* Input */}
      <div className="mb-8">
        {currentQ.type === 'text' && (
          <input
            className="input text-base py-3"
            placeholder={currentQ.placeholder}
            value={(currentAnswer as string) ?? ''}
            onChange={e => setAnswer(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && canProceed() && handleNext()}
            autoFocus
          />
        )}

        {currentQ.type === 'select' && (
          <div className="grid grid-cols-1 gap-2">
            {currentQ.options?.map(option => {
              const active = currentAnswer === option
              return (
                <button
                  key={option}
                  onClick={() => setAnswer(option)}
                  className={`
                    w-full text-left px-4 py-3 rounded-[10px] border text-sm font-medium
                    transition-all duration-150
                    ${active
                      ? 'border-[#7C3AED] bg-[#EDE9FE] text-[#7C3AED]'
                      : 'border-[#E5E7EB] bg-white text-[#0A0A0A] hover:border-[#7C3AED] hover:bg-[#EDE9FE]/20'}
                  `}
                >
                  {option}
                </button>
              )
            })}
          </div>
        )}

        {currentQ.type === 'multiselect' && (
          <div className="grid grid-cols-2 gap-2">
            {currentQ.options?.map(option => {
              const selected = (currentAnswer as string[] | undefined)?.includes(option) ?? false
              return (
                <button
                  key={option}
                  onClick={() => toggleOption(option)}
                  className={`
                    text-left px-4 py-3 rounded-[10px] border text-sm font-medium
                    transition-all duration-150 flex items-center justify-between gap-2
                    ${selected
                      ? 'border-[#7C3AED] bg-[#EDE9FE] text-[#7C3AED]'
                      : 'border-[#E5E7EB] bg-white text-[#0A0A0A] hover:border-[#7C3AED] hover:bg-[#EDE9FE]/20'}
                  `}
                >
                  {option}
                  {selected && <CheckCircle className="w-4 h-4 flex-shrink-0" />}
                </button>
              )
            })}
          </div>
        )}

        {currentQ.type === 'upload' && (
          <div className="space-y-3">
            <button
              onClick={() => fileRef.current?.click()}
              className="
                w-full border-2 border-dashed border-[#D1D5DB] rounded-[12px]
                p-8 flex flex-col items-center gap-3 text-center
                hover:border-[#7C3AED] hover:bg-[#EDE9FE]/10 transition-all duration-150
              "
            >
              <div className="w-10 h-10 rounded-full bg-[#F1F3F5] flex items-center justify-center">
                <UploadSimple className="w-5 h-5 text-[#6B7280]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#0A0A0A]">Haz clic para subir archivos</p>
                <p className="text-xs text-[#6B7280] mt-0.5">PNG, JPG, WEBP — hasta 10MB cada uno</p>
              </div>
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFileSelect}
            />
            {files.length > 0 && (
              <div className="space-y-2">
                {files.map((file, i) => (
                  <div key={i} className="flex items-center gap-3 px-3 py-2 bg-white border border-[#E5E7EB] rounded-[8px]">
                    <div className="w-8 h-8 rounded bg-[#EDE9FE] flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-[#7C3AED]">IMG</span>
                    </div>
                    <span className="text-sm text-[#0A0A0A] flex-1 truncate">{file.name}</span>
                    <button onClick={() => removeFile(i)} className="text-[#9CA3AF] hover:text-[#EF4444] transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {error && (
        <p className="text-sm text-[#EF4444] mb-4 px-3 py-2 bg-red-50 rounded-[8px]">{error}</p>
      )}

      {/* Navigation */}
      <div className="flex gap-3">
        <button onClick={handleBack} className="btn-outline px-4">
          <CaretLeft className="w-4 h-4" />
        </button>
        <button
          onClick={handleNext}
          disabled={!canProceed()}
          className="btn-accent flex-1"
        >
          {isLast ? 'Crear marca' : 'Siguiente'}
          {!isLast && <ArrowRight className="w-4 h-4" />}
        </button>
      </div>
    </div>
  )
}
