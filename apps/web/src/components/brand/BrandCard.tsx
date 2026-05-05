import Link from 'next/link'
import { Sparkles, ArrowRight } from 'lucide-react'
import type { BrandProfile } from '@brandai/shared'

const INDUSTRY_LABELS: Record<string, string> = {
  cafe:       'Café',
  restaurant: 'Restaurante',
  retail:     'Retail',
  services:   'Servicios',
  other:      'Otro',
}

const INDUSTRY_ICONS: Record<string, string> = {
  cafe:       '☕',
  restaurant: '🍽️',
  retail:     '🛍️',
  services:   '💼',
  other:      '✨',
}

interface Props {
  brand: BrandProfile
}

export function BrandCard({ brand }: Props) {
  const industryLabel = brand.industry ? INDUSTRY_LABELS[brand.industry] : 'Sin industria'
  const industryIcon  = brand.industry ? INDUSTRY_ICONS[brand.industry] : '✨'

  return (
    <div className="card-hover flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-[10px] bg-[#EDE9FE] flex items-center justify-center text-lg flex-shrink-0">
            {brand.logoUrl
              ? <img src={brand.logoUrl} alt={brand.name} className="w-full h-full object-cover rounded-[10px]" />
              : <span>{industryIcon}</span>
            }
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[#0A0A0A] leading-tight">{brand.name}</h3>
            <span className="pill text-[10px] mt-1">{industryLabel}</span>
          </div>
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
          <Sparkles className="w-3 h-3" /> IA analizada
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
