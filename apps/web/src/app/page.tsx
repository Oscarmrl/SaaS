'use client'

import Link from 'next/link'
import { Sparkle, ArrowRight, Check, Lightning, Image, FilmSlate, PencilSimple, Palette } from '@phosphor-icons/react'
import { FanCarousel } from '@/components/landing/FanCarousel'

const FEATURES = [
  { Icon: Image,        title: 'Imágenes publicitarias', desc: 'Fotos profesionales generadas con IA que respetan tu marca y paleta de colores' },
  { Icon: FilmSlate,    title: 'Videos 15s y 30s',       desc: 'Mini-videos con voz profesional y música, listos para publicar en redes' },
  { Icon: PencilSimple, title: 'Captions en español',    desc: 'Textos persuasivos con hashtags optimizados para cada plataforma' },
  { Icon: Palette,      title: 'Banners para redes',     desc: 'Diseños adaptados a Instagram, Facebook, WhatsApp y TikTok' },
]

const PACKS = [
  { name: 'Semilla',  credits:   80, price:  8, popular: false },
  { name: 'Negocio',  credits:  220, price: 18, popular: true  },
  { name: 'Pro',      credits:  500, price: 35, popular: false },
  { name: 'Agencia',  credits: 1300, price: 70, popular: false },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-sans overflow-x-hidden">

      {/* ── Nav ─────────────────────────────────────────────────────── */}
      <nav className="px-6 sm:px-10 py-5 flex items-center justify-between max-w-[1200px] mx-auto">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-[8px] bg-[#7C3AED] flex items-center justify-center">
            <Sparkle className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-[#0A0A0A] text-lg">BrandAI</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm text-[#6B7280]">
          <a href="#features" className="hover:text-[#0A0A0A] transition-colors">Funciones</a>
          <a href="#pricing"  className="hover:text-[#0A0A0A] transition-colors">Precios</a>
          <a href="#how"      className="hover:text-[#0A0A0A] transition-colors">Cómo funciona</a>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login"    className="text-sm font-medium text-[#0A0A0A] hover:text-[#7C3AED] transition-colors hidden sm:block">Iniciar sesión</Link>
          <Link href="/register" className="btn-accent text-sm px-5 py-2.5">Empezar gratis</Link>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────────────────── */}
      <section className="relative pt-6 sm:pt-10 lg:pt-14 pb-0 text-center">

        {/* Title */}
        <div className="px-4 sm:px-6 mb-1">
          <h1 className="text-[1.45rem] sm:text-[2rem] lg:text-[2.75rem] font-black text-[#0A0A0A] leading-[1.1] tracking-tight max-w-[520px] sm:max-w-[600px] mx-auto">
            Crea imágenes y videos para tus productos
          </h1>
        </div>

        {/* ── Full-width carousel ───────────────────────────────────── */}
        <div className="relative w-full overflow-visible">
          <FanCarousel />
        </div>

        {/* Subtitle + CTAs below the carousel */}
        <div className="px-4 sm:px-6 mt-8 sm:mt-10 mb-8 sm:mb-12">
          <p className="text-xs sm:text-sm text-[#6B7280] max-w-[300px] sm:max-w-[340px] mx-auto mb-3 sm:mb-4">
            IA generativa para negocios de LATAM. Resultados en segundos.
          </p>
          <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap mb-3">
            <Link href="/register" className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 bg-[#0A0A0A] text-white text-sm font-bold rounded-[10px] hover:bg-[#111] transition-all">
              Empezar gratis <ArrowRight className="w-4 h-4" />
            </Link>
            <a href="#pricing" className="text-sm font-semibold text-[#6B7280] hover:text-[#0A0A0A] transition-colors">
              Ver precios →
            </a>
          </div>
          <p className="text-[11px] sm:text-xs text-[#9CA3AF]">Sin tarjeta de crédito · Paga solo lo que usas</p>
        </div>
      </section>

      {/* ── Divider strip ───────────────────────────────────────────── */}
      <div className="border-y border-[#E5E7EB] py-5">
        <p className="text-center text-[10px] text-[#9CA3AF] font-semibold tracking-[0.15em] uppercase mb-4">Perfecto para</p>
        <div className="flex justify-center flex-wrap gap-x-8 gap-y-2 text-sm font-medium text-[#6B7280] px-6">
          {['Cafeterías', 'Restaurantes', 'Tiendas de ropa', 'Salones de belleza', 'Panaderías', 'Gimnasios', 'Consultorías'].map(b => (
            <span key={b}>{b}</span>
          ))}
        </div>
      </div>

      {/* ── Features ────────────────────────────────────────────────── */}
      <section id="features" className="bg-[#F8F9FA] py-24 px-6">
        <div className="max-w-[1100px] mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-bold tracking-widest text-[#7C3AED] uppercase mb-4">Funciones</p>
            <h2 className="text-4xl font-extrabold text-[#0A0A0A] mb-3">Todo lo que necesita tu negocio</h2>
            <p className="text-[#6B7280] text-lg">Contenido profesional en segundos, adaptado a tu marca</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {FEATURES.map(({ Icon, title, desc }) => (
              <div key={title} className="bg-white border border-[#E5E7EB] rounded-[16px] p-6 hover:shadow-md hover:-translate-y-0.5 transition-all duration-150">
                <div className="w-11 h-11 rounded-[12px] bg-[#EDE9FE] flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-[#7C3AED]" weight="bold" />
                </div>
                <h3 className="font-bold text-[#0A0A0A] mb-2">{title}</h3>
                <p className="text-sm text-[#6B7280] leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ────────────────────────────────────────────── */}
      <section id="how" className="py-24 px-6">
        <div className="max-w-[780px] mx-auto text-center">
          <p className="text-xs font-bold tracking-widest text-[#7C3AED] uppercase mb-4">Cómo funciona</p>
          <h2 className="text-4xl font-extrabold text-[#0A0A0A] mb-16">3 pasos y listo</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-10">
            {[
              { step: '01', title: 'Crea tu marca', desc: 'Cuéntanos sobre tu negocio, sube tu logo e imágenes de referencia para que la IA entienda tu estilo.' },
              { step: '02', title: 'Describe el contenido', desc: 'Dinos qué quieres generar — imagen, banner, video o caption — y para qué plataforma.' },
              { step: '03', title: 'Descarga y publica', desc: 'La IA genera el contenido en segundos. Descárgalo y publícalo directamente en tus redes.' },
            ].map(({ step, title, desc }) => (
              <div key={step} className="flex flex-col items-center text-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#0A0A0A] text-white flex items-center justify-center text-sm font-black">
                  {step}
                </div>
                <h3 className="font-bold text-[#0A0A0A] text-lg">{title}</h3>
                <p className="text-sm text-[#6B7280] leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ─────────────────────────────────────────────────── */}
      <section id="pricing" className="bg-[#F8F9FA] py-24 px-6">
        <div className="max-w-[1000px] mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-bold tracking-widest text-[#7C3AED] uppercase mb-4">Precios</p>
            <h2 className="text-4xl font-extrabold text-[#0A0A0A] mb-3">Packs de créditos</h2>
            <p className="text-[#6B7280] text-lg">Compra una vez, úsalos cuando quieras. Sin suscripciones.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {PACKS.map(({ name, credits, price, popular }) => (
              <div
                key={name}
                className={`relative flex flex-col gap-5 p-6 rounded-[20px] ${
                  popular ? 'bg-[#111111]' : 'bg-white border border-[#E5E7EB]'
                }`}
              >
                {popular && (
                  <span className="absolute -top-3 right-5 bg-[#7C3AED] text-white text-[10px] font-black px-3 py-1 rounded-full tracking-wide uppercase">
                    Popular
                  </span>
                )}
                <div className="w-9 h-9 rounded-[10px] bg-[#7C3AED]/20 flex items-center justify-center">
                  <Lightning className={`w-4 h-4 ${popular ? 'text-violet-300' : 'text-[#7C3AED]'}`} />
                </div>
                <div>
                  <h3 className={`font-extrabold text-xl ${popular ? 'text-white' : 'text-[#0A0A0A]'}`}>{name}</h3>
                  <p className={`text-xs mt-0.5 ${popular ? 'text-[#9CA3AF]' : 'text-[#6B7280]'}`}>{credits.toLocaleString()} créditos</p>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className={`text-4xl font-black ${popular ? 'text-white' : 'text-[#0A0A0A]'}`}>${price}</span>
                  <span className={`text-sm ${popular ? 'text-[#9CA3AF]' : 'text-[#6B7280]'}`}>USD</span>
                </div>
                <ul className="space-y-2 flex-1">
                  {['Imágenes con IA', 'Banners', 'Captions', 'Sin expiración'].map(f => (
                    <li key={f} className="flex items-center gap-2 text-xs">
                      <Check className={`w-3.5 h-3.5 flex-shrink-0 ${popular ? 'text-violet-400' : 'text-[#7C3AED]'}`} />
                      <span className={popular ? 'text-[#9CA3AF]' : 'text-[#6B7280]'}>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/register"
                  className={`block w-full text-center py-3 text-sm font-bold rounded-[10px] transition-all duration-150 ${
                    popular
                      ? 'bg-white text-[#0A0A0A] hover:bg-[#F8F9FA]'
                      : 'bg-[#0A0A0A] text-white hover:bg-[#222]'
                  }`}
                >
                  Comenzar
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA final ───────────────────────────────────────────────── */}
      <section className="py-28 px-6 text-center">
        <h2 className="text-4xl sm:text-5xl font-black text-[#0A0A0A] mb-5 max-w-[560px] mx-auto leading-tight">
          Empieza a crear contenido profesional hoy
        </h2>
        <p className="text-[#6B7280] mb-8 text-lg">Únete a los negocios que ya generan su publicidad con IA</p>
        <Link href="/register" className="inline-flex items-center gap-2 px-8 py-4 bg-[#0A0A0A] text-white text-base font-bold rounded-[12px] hover:bg-[#111] transition-all shadow-sm">
          Crear cuenta gratis <ArrowRight className="w-5 h-5" />
        </Link>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────── */}
      <footer className="border-t border-[#E5E7EB] py-8 px-6">
        <div className="max-w-[1200px] mx-auto flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-[6px] bg-[#7C3AED] flex items-center justify-center">
              <Sparkle className="w-3 h-3 text-white" />
            </div>
            <span className="text-sm font-bold text-[#0A0A0A]">BrandAI</span>
          </div>
          <p className="text-xs text-[#9CA3AF]">© 2026 BrandAI. Hecho para negocios latinoamericanos.</p>
        </div>
      </footer>
    </div>
  )
}
