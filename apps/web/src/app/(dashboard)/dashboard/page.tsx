'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  IconSparkles, IconPhoto, IconFileText,
  IconVideo, IconArrowRight, IconPlus, IconBriefcase,
} from '@tabler/icons-react'
import { CreditBalance } from '@/components/dashboard/CreditBalance'
import { useUser } from '@/contexts/UserContext'
import { api } from '@/lib/api-client'
import type { BrandProfile } from '@brandai/shared'

const QUICK_ACTIONS = [
  { type: 'IMAGE',     icon: IconPhoto,     label: 'Imagen',    credits: 10, desc: 'Foto publicitaria'  },
  { type: 'BANNER',    icon: IconSparkles,  label: 'Banner',    credits:  8, desc: 'Banner para redes'  },
  { type: 'CAPTION',   icon: IconFileText,  label: 'Caption',   credits:  3, desc: 'Texto persuasivo'   },
  { type: 'VIDEO_15S', icon: IconVideo,     label: 'Video 15s', credits: 20, desc: 'Mini-video con voz' },
] as const

export default function DashboardPage() {
  const { firstName, credits, loadingCredits } = useUser()
  const [brands, setBrands]           = useState<BrandProfile[]>([])
  const [loadingBrands, setLoading]   = useState(true)

  useEffect(() => {
    api.get<BrandProfile[]>('/brands')
      .then(data => setBrands(data ?? []))
      .catch(() => setBrands([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="animate-fade-in space-y-8">

      {/* ── Page header ─────────────────────────────── */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Bienvenido, {firstName}</h1>
          <p className="page-subtitle">¿Qué vas a crear hoy?</p>
        </div>
        <Link href="/brands/new" data-tour="new-brand" className="btn-primary">
          <IconPlus size={15} stroke={2} />
          Nueva marca
        </Link>
      </div>

      {/* ── Main grid ────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left */}
        <div className="lg:col-span-2 space-y-5">

          {/* Quick actions */}
          <div data-tour="quick-actions" className="card">
            <p className="text-xs font-semibold text-[#3F3F46] mb-4 uppercase tracking-wide">Generar contenido</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {QUICK_ACTIONS.map(({ type, icon: Icon, label, credits: cost, desc }) => (
                <Link
                  key={type}
                  href={`/generate?type=${type}`}
                  className="group flex flex-col gap-3 p-4 rounded-[10px] border border-[#E4E4E7] bg-white hover:border-[#09090B] hover:bg-[#09090B] transition-all duration-150"
                >
                  <Icon size={20} stroke={1.6} className="text-[#71717A] group-hover:text-white transition-colors" />
                  <div>
                    <span className="text-xs font-semibold text-[#09090B] group-hover:text-white block transition-colors">{label}</span>
                    <span className="text-[10px] text-[#A1A1AA] group-hover:text-[#A1A1AA] transition-colors">{desc}</span>
                  </div>
                  <span className="text-[10px] font-medium text-[#71717A] group-hover:text-[#71717A] transition-colors">{cost} créditos</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Recent assets */}
          <div className="card">
            <div className="flex items-center justify-between mb-5">
              <p className="text-xs font-semibold text-[#3F3F46] uppercase tracking-wide">Assets recientes</p>
              <Link href="/assets" className="text-xs font-medium text-[#71717A] hover:text-[#09090B] flex items-center gap-1 transition-colors">
                Ver todos <IconArrowRight size={13} stroke={2} />
              </Link>
            </div>
            <div className="flex flex-col items-center justify-center py-10 text-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#F4F4F5] flex items-center justify-center">
                <IconPhoto size={20} stroke={1.5} className="text-[#A1A1AA]" />
              </div>
              <div>
                <p className="text-sm font-medium text-[#09090B]">Sin assets todavía</p>
                <p className="text-xs text-[#71717A] mt-1">Genera tu primer contenido con IA</p>
              </div>
              <Link href="/generate" className="btn-accent text-xs px-4 py-2">
                <IconSparkles size={14} stroke={1.8} />
                Empezar
              </Link>
            </div>
          </div>
        </div>

        {/* Right */}
        <div className="space-y-4">
          {loadingCredits ? (
            <div className="card h-36 skeleton" />
          ) : (
            <CreditBalance balance={credits.balance} lifetimeCredits={credits.lifetimeCredits} />
          )}

          {/* Brands */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-semibold text-[#3F3F46] uppercase tracking-wide">Mis marcas</p>
              <Link href="/brands" className="text-xs font-medium text-[#71717A] hover:text-[#09090B] transition-colors">
                Ver todas
              </Link>
            </div>

            {loadingBrands && (
              <div className="space-y-2">
                {[1, 2].map(i => <div key={i} className="h-10 rounded-[8px] skeleton" />)}
              </div>
            )}

            {!loadingBrands && brands.length === 0 && (
              <div className="flex flex-col items-center justify-center py-5 text-center gap-2">
                <IconBriefcase size={20} stroke={1.5} className="text-[#D4D4D8]" />
                <p className="text-xs text-[#A1A1AA]">No hay marcas creadas</p>
                <Link href="/brands/new" className="text-xs font-semibold text-[#09090B] hover:underline">
                  + Crear primera marca
                </Link>
              </div>
            )}

            {!loadingBrands && brands.length > 0 && (
              <div className="space-y-2">
                {brands.slice(0, 4).map(brand => (
                  <Link
                    key={brand.id}
                    href={`/brands/${brand.id}/edit`}
                    className="flex items-center gap-3 p-2.5 rounded-[8px] hover:bg-[#F4F4F5] transition-colors group"
                  >
                    {brand.logoUrl ? (
                      <img
                        src={brand.logoUrl}
                        alt={brand.name}
                        className="w-8 h-8 rounded-[6px] object-cover flex-shrink-0"
                      />
                    ) : (
                      <div
                        className="w-8 h-8 rounded-[6px] flex items-center justify-center flex-shrink-0 text-white text-xs font-bold"
                        style={{ background: brand.primaryColor ?? '#09090B' }}
                      >
                        {brand.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-[#09090B] truncate group-hover:text-[#09090B]">{brand.name}</p>
                      {brand.industry && (
                        <p className="text-[10px] text-[#A1A1AA] truncate capitalize">{brand.industry}</p>
                      )}
                    </div>
                  </Link>
                ))}
                {brands.length > 4 && (
                  <Link href="/brands" className="block text-center text-[10px] text-[#71717A] hover:text-[#09090B] pt-1 transition-colors">
                    +{brands.length - 4} más
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* Promo */}
          <div className="card-featured p-5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#52525B] mb-3">Pack recomendado</p>
            <h3 className="text-base font-bold text-white mb-0.5">Business</h3>
            <p className="text-xs text-[#71717A] mb-4">220 créditos sin expiración</p>
            <div className="flex items-baseline gap-1 mb-4">
              <span className="text-3xl font-bold text-white">$18</span>
              <span className="text-[#52525B] text-xs">USD</span>
            </div>
            <Link href="/credits" className="block w-full text-center py-2.5 bg-white text-[#09090B] text-xs font-bold rounded-[8px] hover:bg-[#F4F4F5] transition-colors">
              Comprar créditos
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
