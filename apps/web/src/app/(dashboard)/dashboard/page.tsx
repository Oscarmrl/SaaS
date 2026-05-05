import { Sparkles, Image, FileText, Video, ArrowRight, Plus } from 'lucide-react'
import Link from 'next/link'
import { CreditBalance } from '@/components/dashboard/CreditBalance'

const QUICK_ACTIONS = [
  { type: 'IMAGE',   icon: Image,    label: 'Imagen',   credits: 10, color: 'bg-violet-50 text-violet-600' },
  { type: 'BANNER',  icon: Sparkles, label: 'Banner',   credits:  8, color: 'bg-blue-50 text-blue-600'    },
  { type: 'CAPTION', icon: FileText, label: 'Caption',  credits:  3, color: 'bg-green-50 text-green-600'  },
  { type: 'VIDEO_15S', icon: Video,  label: 'Video 15s', credits: 20, color: 'bg-orange-50 text-orange-600' },
] as const

export default async function DashboardPage() {
  // Mock data for design preview — replace with real API calls once Supabase is configured
  const firstName     = 'Usuario'
  const creditBalance = { balance: 220, lifetimeCredits: 500 }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#0A0A0A]">
            Hola, {firstName}
          </h1>
          <p className="text-[#6B7280] mt-1 text-sm">
            ¿Qué contenido vas a crear hoy?
          </p>
        </div>
        <Link href="/brands/new" className="btn-primary">
          <Plus className="w-4 h-4" />
          Nueva marca
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column — main actions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick generate */}
          <div className="card">
            <h2 className="text-sm font-semibold text-[#0A0A0A] mb-4">Generar contenido</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {QUICK_ACTIONS.map(({ type, icon: Icon, label, credits, color }) => (
                <Link
                  key={type}
                  href={`/generate?type=${type}`}
                  className="flex flex-col items-center gap-2.5 p-4 rounded-[10px] border border-[#E5E7EB] hover:border-[#7C3AED] hover:bg-[#EDE9FE]/30 transition-all duration-150 group"
                >
                  <div className={`w-10 h-10 rounded-[8px] ${color} flex items-center justify-center`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-semibold text-[#0A0A0A]">{label}</span>
                  <span className="pill text-[10px]">{credits} créditos</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Recent assets placeholder */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-[#0A0A0A]">Assets recientes</h2>
              <Link href="/assets" className="text-xs text-[#7C3AED] font-medium hover:underline flex items-center gap-1">
                Ver todos <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-14 h-14 rounded-full bg-[#F1F3F5] flex items-center justify-center mb-3">
                <Image className="w-6 h-6 text-[#9CA3AF]" />
              </div>
              <p className="text-sm font-medium text-[#0A0A0A]">Sin assets todavía</p>
              <p className="text-xs text-[#6B7280] mt-1">Genera tu primer contenido y aparecerá aquí</p>
              <Link href="/generate" className="btn-accent mt-4 text-xs px-4 py-2">
                <Sparkles className="w-3.5 h-3.5" />
                Empezar
              </Link>
            </div>
          </div>
        </div>

        {/* Right column — sidebar stats */}
        <div className="space-y-4">
          <CreditBalance
            balance={creditBalance.balance}
            lifetimeCredits={creditBalance.lifetimeCredits}
          />

          {/* Brands panel */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-[#0A0A0A]">Mis marcas</h3>
              <Link href="/brands" className="text-xs text-[#7C3AED] font-medium hover:underline">
                Ver todas
              </Link>
            </div>
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <p className="text-xs text-[#6B7280]">No hay marcas creadas</p>
              <Link href="/brands/new" className="text-xs text-[#7C3AED] font-medium hover:underline mt-2">
                + Crear primera marca
              </Link>
            </div>
          </div>

          {/* Credit packs promo */}
          <div className="card-featured p-5">
            <div className="pill-accent mb-3 text-[10px]">Oferta</div>
            <h3 className="text-sm font-bold text-white mb-1">Pack Business</h3>
            <p className="text-[#9CA3AF] text-xs mb-4">220 créditos — perfectos para comenzar</p>
            <div className="flex items-baseline gap-1 mb-4">
              <span className="text-2xl font-bold text-white">$18</span>
              <span className="text-[#9CA3AF] text-xs">USD</span>
            </div>
            <Link href="/credits" className="
              block w-full text-center py-2.5 bg-white text-[#0A0A0A] text-xs font-semibold
              rounded-[8px] hover:bg-[#F8F9FA] transition-all duration-150
            ">
              Comprar créditos
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
