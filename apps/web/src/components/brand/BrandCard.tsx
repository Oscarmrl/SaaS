'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Sparkle, ArrowRight, Trash, CircleNotch, Warning, PencilSimple, Coffee, ForkKnife, ShoppingBag, Briefcase, type Icon as PhosphorIcon } from '@phosphor-icons/react'
import type { BrandProfile } from '@brandai/shared'

const INDUSTRY_LABELS: Record<string, string> = {
  cafe:       'Café',
  restaurant: 'Restaurante',
  retail:     'Retail',
  services:   'Servicios',
  other:      'Otro',
}

const INDUSTRY_ICONS: Record<string, PhosphorIcon> = {
  cafe:       Coffee,
  restaurant: ForkKnife,
  retail:     ShoppingBag,
  services:   Briefcase,
  other:      Sparkle,
}

interface Props {
  brand:    BrandProfile
  onDelete: (id: string) => Promise<void>
}

export function BrandCard({ brand, onDelete }: Props) {
  const [confirming, setConfirming] = useState(false)
  const [deleting,   setDeleting]   = useState(false)

  const industryLabel = brand.industry ? INDUSTRY_LABELS[brand.industry] : 'Sin industria'
  const IndustryIcon  = brand.industry ? INDUSTRY_ICONS[brand.industry]  : Sparkle

  async function handleDelete() {
    setDeleting(true)
    await onDelete(brand.id)
    // Si onDelete falla, el padre maneja el error y este componente
    // puede quedar en estado deleting — el padre lo elimina de la lista
    setDeleting(false)
    setConfirming(false)
  }

  if (confirming) {
    return (
      <div className="card flex flex-col gap-4 border-red-200 bg-red-50">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-[8px] bg-red-100 flex items-center justify-center flex-shrink-0">
            <Warning className="w-4 h-4 text-red-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#0A0A0A]">¿Eliminar &ldquo;{brand.name}&rdquo;?</p>
            <p className="text-xs text-[#6B7280] mt-0.5">
              Se borrarán todas las imágenes, banners y videos generados con esta marca. Esta acción no se puede deshacer.
            </p>
          </div>
        </div>

        <div className="flex gap-2 mt-auto">
          <button
            onClick={() => setConfirming(false)}
            disabled={deleting}
            className="flex-1 py-2 text-xs font-medium text-[#374151] bg-white border border-[#E5E7EB] rounded-[8px] hover:bg-[#F1F3F5] transition-all duration-150 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex-1 py-2 text-xs font-semibold text-white bg-red-600 rounded-[8px] hover:bg-red-700 transition-all duration-150 disabled:opacity-50 flex items-center justify-center gap-1.5"
          >
            {deleting
              ? <><CircleNotch className="w-3.5 h-3.5 animate-spin" /> Eliminando...</>
              : <><Trash className="w-3.5 h-3.5" /> Eliminar</>
            }
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="card-hover flex flex-col gap-4 group">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-[10px] bg-[#EDE9FE] flex items-center justify-center flex-shrink-0">
            {brand.logoUrl
              ? <img src={brand.logoUrl} alt={brand.name} className="w-full h-full object-cover rounded-[10px]" />
              : <IndustryIcon className="w-5 h-5 text-[#7C3AED]" />
            }
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[#0A0A0A] leading-tight">{brand.name}</h3>
            <span className="pill text-[10px] mt-1">{industryLabel}</span>
          </div>
        </div>

        {/* Acciones — visibles solo en hover */}
        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity duration-150 flex-shrink-0">
          <Link
            href={`/brands/${brand.id}/edit`}
            title="Editar marca"
            className="w-7 h-7 flex items-center justify-center rounded-[6px] text-[#9CA3AF] hover:bg-[#EDE9FE] hover:text-[#7C3AED] transition-all duration-150"
          >
            <PencilSimple className="w-3.5 h-3.5" />
          </Link>
          <button
            onClick={() => setConfirming(true)}
            title="Eliminar marca"
            className="w-7 h-7 flex items-center justify-center rounded-[6px] text-[#9CA3AF] hover:bg-red-50 hover:text-red-600 transition-all duration-150"
          >
            <Trash className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Meta */}
      {brand.toneOfVoice && (
        <p className="text-xs text-[#6B7280] capitalize">
          Tono: <span className="text-[#374151] font-medium">{brand.toneOfVoice}</span>
        </p>
      )}

      {brand.description && (
        <p className="text-xs text-[#6B7280] line-clamp-2">{brand.description}</p>
      )}

      {/* Analysis indicator */}
      {brand.extractedStyle && (
        <div className="pill-accent text-[10px]">
          <Sparkle className="w-3 h-3" /> IA analizada
        </div>
      )}

      {/* Action */}
      <Link
        href={`/generate?brandId=${brand.id}`}
        className="btn-accent text-xs py-2 mt-auto"
      >
        Generar contenido <ArrowRight className="w-3.5 h-3.5" />
      </Link>
    </div>
  )
}
