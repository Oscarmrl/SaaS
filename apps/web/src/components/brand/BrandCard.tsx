'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  IconSparkles, IconArrowRight, IconTrash, IconLoader2,
  IconAlertTriangle, IconPencil, IconCoffee, IconToolsKitchen2,
  IconShoppingBag, IconBriefcase,
} from '@tabler/icons-react'
import type { BrandProfile } from '@brandai/shared'

const INDUSTRY_LABELS: Record<string, string> = {
  cafe:       'Café',
  restaurant: 'Restaurante',
  retail:     'Retail',
  services:   'Servicios',
  other:      'Otro',
}

const INDUSTRY_ICONS: Record<string, React.ElementType> = {
  cafe:       IconCoffee,
  restaurant: IconToolsKitchen2,
  retail:     IconShoppingBag,
  services:   IconBriefcase,
  other:      IconSparkles,
}

interface Props {
  brand:    BrandProfile
  onDelete: (id: string) => Promise<void>
}

export function BrandCard({ brand, onDelete }: Props) {
  const [confirming, setConfirming] = useState(false)
  const [deleting,   setDeleting]   = useState(false)

  const industryLabel = brand.industry ? INDUSTRY_LABELS[brand.industry] : 'Sin industria'
  const IndustryIcon  = brand.industry ? INDUSTRY_ICONS[brand.industry] ?? IconSparkles : IconSparkles

  async function handleDelete() {
    setDeleting(true)
    await onDelete(brand.id)
    setDeleting(false)
    setConfirming(false)
  }

  if (confirming) {
    return (
      <div className="card flex flex-col gap-4 border-red-200 bg-red-50">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-[8px] bg-red-100 flex items-center justify-center flex-shrink-0">
            <IconAlertTriangle size={16} stroke={1.8} className="text-red-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#09090B]">¿Eliminar &ldquo;{brand.name}&rdquo;?</p>
            <p className="text-xs text-[#71717A] mt-0.5 leading-relaxed">
              Se borrarán todos los assets generados. Esta acción no se puede deshacer.
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setConfirming(false)} disabled={deleting}
            className="flex-1 py-2 text-xs font-medium text-[#3F3F46] bg-white border border-[#E4E4E7] rounded-[8px] hover:bg-[#F4F4F5] transition-colors disabled:opacity-50">
            Cancelar
          </button>
          <button onClick={handleDelete} disabled={deleting}
            className="flex-1 py-2 text-xs font-semibold text-white bg-red-600 rounded-[8px] hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5">
            {deleting
              ? <><IconLoader2 size={14} className="animate-spin" /> Eliminando...</>
              : <><IconTrash size={14} stroke={1.8} /> Eliminar</>
            }
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="card-hover flex flex-col gap-4 group">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-[9px] bg-[#F4F4F5] flex items-center justify-center flex-shrink-0 overflow-hidden">
            {brand.logoUrl
              ? <img src={brand.logoUrl} alt={brand.name} className="w-full h-full object-cover" />
              : <IndustryIcon size={18} stroke={1.6} className="text-[#71717A]" />
            }
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[#09090B] leading-tight">{brand.name}</h3>
            <span className="pill text-[10px] mt-1">{industryLabel}</span>
          </div>
        </div>

        <div className="flex items-center gap-0.5 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-150">
          <Link href={`/brands/${brand.id}/edit`} title="Editar"
            className="w-7 h-7 flex items-center justify-center rounded-[6px] text-[#A1A1AA] hover:bg-[#F4F4F5] hover:text-[#09090B] transition-colors">
            <IconPencil size={14} stroke={1.8} />
          </Link>
          <button onClick={() => setConfirming(true)} title="Eliminar"
            className="w-7 h-7 flex items-center justify-center rounded-[6px] text-[#A1A1AA] hover:bg-red-50 hover:text-red-600 transition-colors">
            <IconTrash size={14} stroke={1.8} />
          </button>
        </div>
      </div>

      {brand.toneOfVoice && (
        <p className="text-xs text-[#71717A]">
          Tono: <span className="text-[#3F3F46] font-medium">{brand.toneOfVoice}</span>
        </p>
      )}

      {brand.description && (
        <p className="text-xs text-[#71717A] line-clamp-2 leading-relaxed">{brand.description}</p>
      )}

      {brand.extractedStyle && (
        <div className="pill-accent text-[10px]">
          <IconSparkles size={11} /> IA analizada
        </div>
      )}

      <Link href={`/generate?brandId=${brand.id}`} className="btn-primary text-xs py-2 mt-auto justify-center">
        Generar contenido <IconArrowRight size={14} stroke={2} />
      </Link>
    </div>
  )
}
