'use client'

import Link from 'next/link'
import {
  IconSparkles, IconArrowRight, IconCheck, IconBolt,
  IconPhoto, IconMovie, IconPencil, IconPalette,
} from '@tabler/icons-react'
import { FanCarousel } from '@/components/landing/FanCarousel'

const FEATURES = [
  { Icon: IconPhoto,  title: 'Imágenes publicitarias', desc: 'Fotos profesionales con IA que respetan tu paleta y estilo de marca.' },
  { Icon: IconMovie,  title: 'Videos 15s y 30s',       desc: 'Mini-videos con voz profesional y animaciones, listos para publicar.' },
  { Icon: IconPencil, title: 'Captions en español',    desc: 'Textos persuasivos con hashtags optimizados para cada plataforma.' },
  { Icon: IconPalette,title: 'Banners para redes',     desc: 'Diseños adaptados a Instagram, Facebook, WhatsApp y TikTok.' },
]

const PACKS = [
  { name: 'Semilla',  credits:   80, price:  8, popular: false },
  { name: 'Negocio',  credits:  220, price: 18, popular: true  },
  { name: 'Pro',      credits:  500, price: 35, popular: false },
  { name: 'Agencia',  credits: 1300, price: 70, popular: false },
]

const INDUSTRIES = ['Cafeterías', 'Restaurantes', 'Tiendas de ropa', 'Salones de belleza', 'Panaderías', 'Gimnasios', 'Consultorías', 'Farmacias', 'Boutiques', 'Librerías']

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white overflow-x-hidden">

      {/* ── Nav ──────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 border-b border-[#E4E4E7] bg-white/90 backdrop-blur-sm px-6 sm:px-10 py-4">
        <div className="max-w-[1160px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[8px] bg-[#09090B] flex items-center justify-center">
              <IconSparkles size={16} className="text-white" />
            </div>
            <span className="font-bold text-[#09090B] text-base tracking-tight">BrandAI</span>
          </div>
          <div className="hidden md:flex items-center gap-7 text-sm text-[#71717A]">
            <a href="#features" className="hover:text-[#09090B] transition-colors">Funciones</a>
            <a href="#pricing"  className="hover:text-[#09090B] transition-colors">Precios</a>
            <a href="#how"      className="hover:text-[#09090B] transition-colors">Cómo funciona</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login"    className="text-sm font-medium text-[#71717A] hover:text-[#09090B] transition-colors hidden sm:block">Iniciar sesión</Link>
            <Link href="/register" className="btn-primary text-sm px-4 py-2">Empezar gratis</Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────────────── */}
      <section className="pt-10 sm:pt-14 pb-0 text-center px-4 bg-white">
        <div className="max-w-[620px] mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#E4E4E7] bg-[#FAFAFA] mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[#09090B]" />
            <span className="text-[11px] font-medium text-[#71717A]">IA generativa para tu negocio</span>
          </div>

          <h1 className="text-[1.85rem] sm:text-[2.4rem] lg:text-[2.9rem] font-extrabold text-[#09090B] leading-[1.08] tracking-tight mb-3">
            Crea publicidad profesional<br />en segundos
          </h1>

          <p className="text-sm sm:text-base text-[#71717A] max-w-[360px] mx-auto mb-0 leading-relaxed">
            IA que entiende tu marca y genera imágenes, videos y captions.
          </p>
        </div>

        <div className="mt-3 w-full overflow-visible">
          <FanCarousel />
        </div>

        <div className="max-w-[620px] mx-auto mt-12 sm:mt-6">
          <div className="flex items-center justify-center gap-3 flex-wrap mb-4">
            <Link href="/register" className="btn-primary px-7 py-3 text-sm">
              Empezar gratis <IconArrowRight size={16} stroke={2} />
            </Link>
            <a href="#how" className="btn-outline px-7 py-3 text-sm">Cómo funciona</a>
          </div>

          <div className="flex items-center justify-center gap-6 text-xs text-[#A1A1AA]">
            <span><strong className="text-[#09090B] font-semibold">500+</strong> marcas activas</span>
            <span className="w-1 h-1 rounded-full bg-[#D4D4D8]" />
            <span><strong className="text-[#09090B] font-semibold">10K+</strong> assets generados</span>
            <span className="w-1 h-1 rounded-full bg-[#D4D4D8]" />
            <span>Sin tarjeta de crédito</span>
          </div>
        </div>
      </section>

      {/* ── Ticker ───────────────────────────────────── */}
      <div className="border-y border-[#E4E4E7] py-3.5 overflow-hidden bg-[#FAFAFA]">
        <div className="flex gap-0 animate-scroll-x" style={{ width: 'max-content' }}>
          {[...INDUSTRIES, ...INDUSTRIES].map((name, i) => (
            <span key={i} className="px-7 text-xs font-medium text-[#A1A1AA] whitespace-nowrap">
              {name} <span className="text-[#D4D4D8] mx-2">·</span>
            </span>
          ))}
        </div>
      </div>

      {/* ── Features ─────────────────────────────────── */}
      <section id="features" className="py-20 sm:py-24 px-6 bg-white">
        <div className="max-w-[1100px] mx-auto">
          <div className="text-center mb-12">
            <p className="section-label mb-3">Funciones</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#09090B] tracking-tight mb-3">
              Todo lo que necesita tu negocio
            </h2>
            <p className="text-[#71717A] text-base max-w-[400px] mx-auto">
              Contenido profesional en segundos, adaptado a tu marca
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {FEATURES.map(({ Icon, title, desc }) => (
              <div key={title} className="card-hover p-5">
                <div className="w-9 h-9 rounded-[8px] bg-[#F4F4F5] flex items-center justify-center mb-4">
                  <Icon size={18} stroke={1.6} className="text-[#3F3F46]" />
                </div>
                <h3 className="font-semibold text-[#09090B] text-sm mb-1.5 tracking-tight">{title}</h3>
                <p className="text-xs text-[#71717A] leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────── */}
      <section id="how" className="py-20 sm:py-24 px-6 bg-[#FAFAFA] border-y border-[#E4E4E7]">
        <div className="max-w-[760px] mx-auto text-center">
          <p className="section-label mb-3">Cómo funciona</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#09090B] tracking-tight mb-12">3 pasos y listo</h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Crea tu marca',        desc: 'Cuéntanos sobre tu negocio y sube tu logo para que la IA entienda tu estilo.' },
              { step: '02', title: 'Describe el contenido', desc: 'Dinos qué quieres generar — imagen, banner, video o caption.' },
              { step: '03', title: 'Descarga y publica',   desc: 'La IA genera en segundos. Descárgalo y publícalo en tus redes.' },
            ].map(({ step, title, desc }) => (
              <div key={step} className="flex flex-col items-center text-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#09090B] text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                  {step}
                </div>
                <h3 className="font-semibold text-[#09090B] tracking-tight">{title}</h3>
                <p className="text-sm text-[#71717A] leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ──────────────────────────────────── */}
      <section id="pricing" className="py-20 sm:py-24 px-6 bg-white">
        <div className="max-w-[1000px] mx-auto">
          <div className="text-center mb-12">
            <p className="section-label mb-3">Precios</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#09090B] tracking-tight mb-2">Packs de créditos</h2>
            <p className="text-[#71717A]">Compra una vez, úsalos cuando quieras. Sin suscripciones.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {PACKS.map(({ name, credits, price, popular }) => (
              <div key={name} className={`relative flex flex-col gap-4 p-5 rounded-[12px] border transition-all duration-200 ${
                popular ? 'card-featured' : 'border-[#E4E4E7] bg-white hover:border-[#D4D4D8]'
              }`}>
                {popular && (
                  <span className="absolute -top-2.5 right-4 bg-[#09090B] text-white text-[9px] font-bold px-2.5 py-0.5 rounded-full tracking-widest uppercase">
                    Popular
                  </span>
                )}

                <div className="w-8 h-8 rounded-[8px] flex items-center justify-center"
                  style={{ background: popular ? 'rgba(255,255,255,0.08)' : '#F4F4F5' }}>
                  <IconBolt size={15} stroke={1.8} className={popular ? 'text-[#71717A]' : 'text-[#3F3F46]'} />
                </div>

                <div>
                  <h3 className={`font-bold text-lg tracking-tight ${popular ? 'text-white' : 'text-[#09090B]'}`}>{name}</h3>
                  <p className={`text-xs mt-0.5 ${popular ? 'text-[#52525B]' : 'text-[#71717A]'}`}>{credits.toLocaleString()} créditos</p>
                </div>

                <div className="flex items-baseline gap-1">
                  <span className={`text-3xl font-bold tracking-tight ${popular ? 'text-white' : 'text-[#09090B]'}`}>${price}</span>
                  <span className={`text-xs ${popular ? 'text-[#52525B]' : 'text-[#71717A]'}`}>USD</span>
                </div>

                <ul className="space-y-1.5 flex-1">
                  {['Imágenes con IA', 'Banners', 'Captions', 'Sin expiración'].map(f => (
                    <li key={f} className="flex items-center gap-2 text-xs">
                      <IconCheck size={13} stroke={2.5} className={popular ? 'text-[#71717A]' : 'text-[#09090B]'} />
                      <span className={popular ? 'text-[#52525B]' : 'text-[#71717A]'}>{f}</span>
                    </li>
                  ))}
                </ul>

                <Link href="/register" className={`block w-full text-center py-2.5 text-xs font-semibold rounded-[8px] transition-colors ${
                  popular ? 'bg-white text-[#09090B] hover:bg-[#F4F4F5]' : 'btn-primary'
                }`}>
                  Comenzar
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────── */}
      <section className="py-20 sm:py-24 px-6 text-center bg-[#09090B]">
        <div className="max-w-[520px] mx-auto">
          <p className="section-label text-[#52525B] mb-4">Únete hoy</p>
          <h2 className="text-2xl sm:text-4xl font-bold text-white mb-4 tracking-tight leading-tight">
            Empieza a crear contenido profesional hoy
          </h2>
          <p className="text-[#71717A] mb-8">Únete a los negocios que ya generan su publicidad con IA</p>
          <Link href="/register" className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-[#09090B] text-sm font-bold rounded-[8px] hover:bg-[#F4F4F5] transition-colors">
            Crear cuenta gratis <IconArrowRight size={16} stroke={2} />
          </Link>
          <p className="text-[#52525B] text-xs mt-4">Sin tarjeta de crédito · Paga solo lo que usas</p>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────── */}
      <footer className="border-t border-[#E4E4E7] py-7 px-6 bg-white">
        <div className="max-w-[1160px] mx-auto flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-[7px] bg-[#09090B] flex items-center justify-center">
              <IconSparkles size={14} className="text-white" />
            </div>
            <span className="text-sm font-bold text-[#09090B]">BrandAI</span>
          </div>
          <p className="text-xs text-[#A1A1AA]">© 2026 BrandAI. Publicidad profesional con IA.</p>
        </div>
      </footer>
    </div>
  )
}
