'use client'

import Link from 'next/link'
import {
  IconSparkles, IconArrowRight, IconCheck, IconBolt,
  IconPhoto, IconMovie, IconPencil, IconPalette,
  IconPlayerPlayFilled, IconClock, IconWand, IconLayoutGrid,
} from '@tabler/icons-react'
import { FanCarousel } from '@/components/landing/FanCarousel'
import { Reveal } from '@/components/landing/Reveal'
import { OrbitTools } from '@/components/landing/OrbitTools'
import { FlowSteps } from '@/components/landing/FlowSteps'
import { Faq } from '@/components/landing/Faq'

const PACKS = [
  { name: 'Semilla',  credits:  100, price:  5, popular: false, tag: 'Para empezar' },
  { name: 'Negocio',  credits:  250, price: 19, popular: true,  tag: 'Más elegido' },
  { name: 'Pro',      credits:  600, price: 39, popular: false, tag: 'Para crecer' },
  { name: 'Agencia',  credits: 1600, price: 75, popular: false, tag: 'Volumen alto' },
]

const INDUSTRIES = ['Cafeterías', 'Restaurantes', 'Tiendas de ropa', 'Salones de belleza', 'Panaderías', 'Gimnasios', 'Consultorías', 'Farmacias', 'Boutiques', 'Librerías']

export default function LandingPage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-white">

      {/* ── Nav ──────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 border-b border-[#E4E4E7] bg-white/80 px-6 py-4 backdrop-blur-md sm:px-10">
        <div className="mx-auto flex max-w-[1160px] items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-[#09090B]">
              <IconSparkles size={16} className="text-white" />
            </div>
            <span className="text-base font-bold tracking-tight text-[#09090B]">BrandAI</span>
          </div>
          <div className="hidden items-center gap-7 text-sm text-[#71717A] md:flex">
            <a href="#solucion" className="transition-colors hover:text-[#09090B]">Solución</a>
            <a href="#redes"    className="transition-colors hover:text-[#09090B]">Redes</a>
            <a href="#pricing"  className="transition-colors hover:text-[#09090B]">Precios</a>
            <a href="#faq"      className="transition-colors hover:text-[#09090B]">FAQ</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="hidden text-sm font-medium text-[#71717A] transition-colors hover:text-[#09090B] sm:block">Iniciar sesión</Link>
            <Link href="/register" className="btn-primary px-4 py-2 text-sm">Empezar gratis</Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────────────── */}
      <section className="relative px-4 pt-12 pb-0 text-center sm:pt-16">
        {/* atmosphere */}
        <div className="aurora pointer-events-none absolute inset-0 -z-10" />
        <div className="bg-dot-grid pointer-events-none absolute inset-0 -z-10 opacity-40 [mask-image:radial-gradient(ellipse_60%_55%_at_50%_30%,black,transparent)]" />

        <div className="mx-auto max-w-[660px]">
          <div className="enter mb-5 inline-flex items-center gap-2 rounded-full border border-[#E4E4E7] bg-white/70 px-3 py-1 backdrop-blur" style={{ ['--enter-delay' as string]: '0ms' }}>
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#7C3AED] opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#7C3AED]" />
            </span>
            <span className="text-[11px] font-medium text-[#71717A]">IA generativa para tu negocio</span>
          </div>

          <h1 className="enter mb-4 text-[2rem] font-extrabold leading-[1.06] tracking-tight text-[#09090B] sm:text-[2.6rem] lg:text-[3.1rem]" style={{ ['--enter-delay' as string]: '90ms' }}>
            Tu agencia de publicidad,<br className="hidden sm:block" /> <span className="text-aurora">hecha con IA</span>
          </h1>

          <p className="enter mx-auto mb-0 max-w-[440px] text-sm leading-relaxed text-[#71717A] sm:text-base" style={{ ['--enter-delay' as string]: '180ms' }}>
            Imágenes, videos y captions profesionales que respetan tu marca. Sin diseñador, sin esperas, sin contratos.
          </p>
        </div>

        <div className="enter mt-4 w-full overflow-visible" style={{ ['--enter-delay' as string]: '260ms' }}>
          <FanCarousel />
        </div>

        <div className="mx-auto mt-12 max-w-[620px] sm:mt-6">
          <div className="enter mb-4 flex flex-wrap items-center justify-center gap-3" style={{ ['--enter-delay' as string]: '340ms' }}>
            <Link href="/register" className="btn-primary group px-7 py-3 text-sm">
              Empezar gratis
              <IconArrowRight size={16} stroke={2} className="transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>
            <a href="#solucion" className="btn-outline px-7 py-3 text-sm">Ver cómo funciona</a>
          </div>

          <div className="enter flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-[#A1A1AA]" style={{ ['--enter-delay' as string]: '420ms' }}>
            <span><strong className="font-semibold text-[#09090B]">500+</strong> marcas activas</span>
            <span className="h-1 w-1 rounded-full bg-[#D4D4D8]" />
            <span><strong className="font-semibold text-[#09090B]">10K+</strong> assets generados</span>
            <span className="h-1 w-1 rounded-full bg-[#D4D4D8]" />
            <span>Sin tarjeta de crédito</span>
          </div>
        </div>
      </section>

      {/* ── Ticker ───────────────────────────────────── */}
      <div className="mt-16 overflow-hidden border-y border-[#E4E4E7] bg-[#FAFAFA] py-3.5 sm:mt-20">
        <div className="flex animate-scroll-x gap-0" style={{ width: 'max-content' }}>
          {[...INDUSTRIES, ...INDUSTRIES].map((name, i) => (
            <span key={i} className="whitespace-nowrap px-7 text-xs font-medium text-[#A1A1AA]">
              {name} <span className="mx-2 text-[#D4D4D8]">·</span>
            </span>
          ))}
        </div>
      </div>

      {/* ── Solución (Bento) ─────────────────────────── */}
      <section id="solucion" className="px-6 py-20 sm:py-28">
        <div className="mx-auto max-w-[1100px]">
          <Reveal className="mb-14 text-center">
            <p className="section-label mb-3">Lo que resuelve</p>
            <h2 className="mx-auto max-w-[640px] text-balance text-2xl font-bold tracking-tight text-[#09090B] sm:text-4xl">
              Todo el contenido de tu negocio, generado en un solo lugar
            </h2>
            <p className="mx-auto mt-3 max-w-[440px] text-base text-[#71717A]">
              Olvidá las agencias caras y las plantillas genéricas. La IA entiende tu marca y crea por vos.
            </p>
          </Reveal>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-6">

            {/* A — Imágenes (large) */}
            <Reveal delay={0} className="lg:col-span-3">
              <article className="bento group h-full p-7">
                <div className="mb-5 flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[#F4F4F5]">
                    <IconPhoto size={18} stroke={1.6} className="text-[#3F3F46]" />
                  </div>
                  <span className="pill text-[11px]">Imágenes con IA</span>
                </div>
                <h3 className="mb-1.5 text-lg font-bold tracking-tight text-[#09090B]">
                  Fotos que parecen de un fotógrafo profesional
                </h3>
                <p className="mb-6 text-sm leading-relaxed text-[#71717A]">
                  Producto, ambiente o lifestyle — generados en segundos con tu paleta y tu estilo.
                </p>

                {/* mockup: stacked image + floating 3D badges */}
                <div className="relative mt-auto">
                  <div className="relative overflow-hidden rounded-[14px] border border-[#E4E4E7]">
                    <img
                      src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=640&h=320&fit=crop&crop=center"
                      alt="Ejemplo de imagen generada"
                      className="h-[170px] w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                      draggable={false}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                  </div>
                  {/* floating 3D badge */}
                  <div className="badge-3d absolute -right-2 -top-3 h-12 w-12 animate-float-lg">
                    <IconSparkles size={20} />
                  </div>
                  <div className="badge-3d-light absolute -bottom-3 left-4 flex items-center gap-1.5 !rounded-full px-3 py-1.5 animate-float" style={{ animationDelay: '1.5s' }}>
                    <span className="h-2 w-2 rounded-full bg-[#10B981]" />
                    <span className="text-[11px] font-semibold text-[#09090B]">4K · Listo</span>
                  </div>
                </div>
              </article>
            </Reveal>

            {/* B — Marca (palette) */}
            <Reveal delay={90} className="lg:col-span-3">
              <article className="bento h-full p-7">
                <div className="mb-5 flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[#F4F4F5]">
                    <IconPalette size={18} stroke={1.6} className="text-[#3F3F46]" />
                  </div>
                  <span className="pill text-[11px]">Identidad de marca</span>
                </div>
                <h3 className="mb-1.5 text-lg font-bold tracking-tight text-[#09090B]">
                  Tu marca, respetada al detalle
                </h3>
                <p className="mb-6 text-sm leading-relaxed text-[#71717A]">
                  Subí tu logo y la IA extrae colores, tipografías y estilo para aplicarlos en todo.
                </p>

                {/* mockup: brand profile card */}
                <div className="mt-auto rounded-[14px] border border-[#E4E4E7] bg-[#FAFAFA] p-5">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-[#09090B] text-sm font-bold text-white">CÁ</div>
                    <div>
                      <p className="text-sm font-semibold text-[#09090B]">Café Ámbar</p>
                      <p className="text-[11px] text-[#A1A1AA]">Cálido · artesanal</p>
                    </div>
                  </div>
                  <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-[#A1A1AA]">Paleta detectada</p>
                  <div className="flex gap-2">
                    {['#7C3AED', '#09090B', '#F59E0B', '#10B981', '#F4F4F5'].map((c, i) => (
                      <div
                        key={c}
                        className="h-9 flex-1 rounded-[8px] border border-black/5 transition-transform duration-200 hover:-translate-y-1"
                        style={{ background: c, transitionDelay: `${i * 20}ms` }}
                      />
                    ))}
                  </div>
                </div>
              </article>
            </Reveal>

            {/* C — Videos */}
            <Reveal delay={0} className="lg:col-span-2">
              <article className="bento h-full p-7">
                <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-[10px] bg-[#F4F4F5]">
                  <IconMovie size={18} stroke={1.6} className="text-[#3F3F46]" />
                </div>
                <h3 className="mb-1.5 text-base font-bold tracking-tight text-[#09090B]">Videos con voz</h3>
                <p className="mb-5 text-sm leading-relaxed text-[#71717A]">
                  Mini-videos verticales con audio, listos para reels e historias.
                </p>
                {/* mockup: video panel */}
                <div className="relative mt-auto flex h-[120px] items-center justify-center overflow-hidden rounded-[14px] bg-gradient-to-br from-[#18181B] to-[#09090B]">
                  <div className="badge-3d-light flex h-12 w-12 items-center justify-center !rounded-full">
                    <IconPlayerPlayFilled size={18} className="ml-0.5 text-[#09090B]" />
                  </div>
                  <div className="absolute bottom-3 left-3 right-3 flex items-end gap-0.5">
                    {[5, 9, 14, 8, 16, 11, 6, 13, 9, 18, 7, 12, 5, 15, 8].map((h, i) => (
                      <span
                        key={i}
                        className="flex-1 animate-pulse rounded-full bg-white/40"
                        style={{ height: h, animationDelay: `${i * 90}ms`, animationDuration: '1.4s' }}
                      />
                    ))}
                  </div>
                </div>
              </article>
            </Reveal>

            {/* D — Captions */}
            <Reveal delay={90} className="lg:col-span-2">
              <article className="bento h-full p-7">
                <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-[10px] bg-[#F4F4F5]">
                  <IconPencil size={18} stroke={1.6} className="text-[#3F3F46]" />
                </div>
                <h3 className="mb-1.5 text-base font-bold tracking-tight text-[#09090B]">Captions que venden</h3>
                <p className="mb-5 text-sm leading-relaxed text-[#71717A]">
                  Textos persuasivos en español con hashtags optimizados.
                </p>
                {/* mockup: caption bubble */}
                <div className="mt-auto rounded-[14px] border border-[#E4E4E7] bg-[#FAFAFA] p-4">
                  <p className="mb-2.5 text-[12px] leading-relaxed text-[#3F3F46]">
                    ☕ El aroma que despierta tu mañana. Vení por tu café de especialidad recién tostado.
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {['#caféLATAM', '#especialidad', '#mañana'].map(t => (
                      <span key={t} className="rounded-full bg-[#EDE9FE] px-2 py-0.5 text-[10px] font-semibold text-[#7C3AED]">{t}</span>
                    ))}
                  </div>
                </div>
              </article>
            </Reveal>

            {/* E — Comparativa Agencia vs BrandAI */}
            <Reveal delay={180} className="lg:col-span-2">
              <article className="group relative h-full overflow-hidden rounded-[16px] border border-[#27272A] p-7 text-white transition-all duration-300 hover:-translate-y-1"
                style={{ background: 'linear-gradient(160deg,#1C1C20 0%,#09090B 100%)' }}>
                {/* glow */}
                <div className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-[#7C3AED]/30 blur-3xl animate-glow" />

                <div className="relative">
                  <span className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-semibold text-white/80">
                    <IconBolt size={12} stroke={2} className="text-[#A78BFA]" />
                    De días a segundos
                  </span>
                  <h3 className="mb-6 text-base font-bold tracking-tight text-white">
                    Lo mismo que una agencia,<br />sin el precio ni la espera
                  </h3>

                  {/* comparison bars */}
                  <div className="space-y-4">
                    {/* agencia */}
                    <div>
                      <div className="mb-1.5 flex items-center justify-between text-xs">
                        <span className="text-[#A1A1AA]">Agencia tradicional</span>
                        <span className="font-semibold text-[#71717A]">3–5 días</span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-white/5">
                        <div className="bar-fill h-full rounded-full bg-[#52525B]" style={{ ['--bar-w' as string]: '92%', ['--bar-delay' as string]: '200ms' }} />
                      </div>
                    </div>
                    {/* brandai */}
                    <div>
                      <div className="mb-1.5 flex items-center justify-between text-xs">
                        <span className="font-medium text-white">BrandAI</span>
                        <span className="font-semibold text-[#A78BFA]">~8 segundos</span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-white/5">
                        <div className="bar-fill h-full rounded-full bg-gradient-to-r from-[#7C3AED] to-[#A78BFA] shadow-[0_0_12px_rgba(124,58,237,0.6)]" style={{ ['--bar-w' as string]: '14%', ['--bar-delay' as string]: '450ms' }} />
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex items-center gap-2 border-t border-white/10 pt-4 text-xs text-[#A1A1AA]">
                    <IconClock size={14} stroke={1.8} className="text-[#A78BFA]" />
                    <span>Disponible 24/7 · pagás solo lo que usás</span>
                  </div>
                </div>
              </article>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── Redes (Orbit) ────────────────────────────── */}
      <section id="redes" className="relative overflow-hidden border-y border-[#E4E4E7] bg-[#FAFAFA] px-6 py-20 sm:py-28">
        <div className="bg-dot-grid pointer-events-none absolute inset-0 opacity-30 [mask-image:radial-gradient(ellipse_70%_60%_at_50%_50%,black,transparent)]" />
        <div className="relative mx-auto grid max-w-[1100px] items-center gap-12 lg:grid-cols-2">
          <Reveal>
            <p className="section-label mb-3">Multiplataforma</p>
            <h2 className="mb-4 text-2xl font-bold tracking-tight text-[#09090B] sm:text-4xl">
              Publicá donde ya están tus clientes
            </h2>
            <p className="mb-7 max-w-[420px] text-base leading-relaxed text-[#71717A]">
              Cada asset se genera en el formato exacto de cada red — vertical para historias, cuadrado para el feed, horizontal para banners.
            </p>
            <ul className="space-y-3">
              {[
                { Icon: IconLayoutGrid, t: 'Formatos nativos para cada red' },
                { Icon: IconWand,       t: 'Adaptación automática de tamaño' },
                { Icon: IconCheck,      t: 'Descarga lista para publicar' },
              ].map(({ Icon, t }) => (
                <li key={t} className="flex items-center gap-3 text-sm text-[#3F3F46]">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white shadow-sm">
                    <Icon size={15} stroke={1.8} className="text-[#7C3AED]" />
                  </span>
                  {t}
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal scale delay={120}>
            <OrbitTools />
          </Reveal>
        </div>
      </section>

      {/* ── Flujo / Cómo funciona ────────────────────── */}
      <section id="flujo" className="relative overflow-hidden px-6 py-20 sm:py-28">
        {/* decorative backdrop blobs (PPP-style soft shapes) */}
        <div className="pointer-events-none absolute -left-16 top-8 h-72 w-72 rounded-full bg-[#7C3AED]/10 blur-3xl animate-blob" />
        <div className="pointer-events-none absolute -right-12 bottom-0 h-80 w-80 rounded-full bg-[#7C3AED]/[0.06] blur-3xl animate-blob" style={{ animationDelay: '3s' }} />

        <Reveal scale className="relative mx-auto max-w-[1080px] rounded-[24px] border border-[#E4E4E7] bg-white p-8 shadow-[0_10px_40px_-12px_rgba(9,9,11,0.12)] sm:p-14">
          <div className="mb-12 text-center">
            <span className="mx-auto mb-4 block h-0.5 w-8 rounded-full bg-[#7C3AED]" />
            <h2 className="text-2xl font-bold tracking-tight text-[#09090B] sm:text-4xl">Cómo funciona</h2>
            <p className="mx-auto mt-3 max-w-[440px] text-base text-[#71717A]">
              De tu marca a contenido listo para publicar, en cuatro pasos simples.
            </p>
          </div>
          <FlowSteps />
        </Reveal>
      </section>

      {/* ── Pricing ──────────────────────────────────── */}
      <section id="pricing" className="border-y border-[#E4E4E7] bg-[#FAFAFA] px-6 py-20 sm:py-28">
        <div className="mx-auto max-w-[1000px]">
          <Reveal className="mb-12 text-center">
            <p className="section-label mb-3">Precios</p>
            <h2 className="mb-2 text-2xl font-bold tracking-tight text-[#09090B] sm:text-4xl">Packs de créditos</h2>
            <p className="text-[#71717A]">Comprá una vez, usalos cuando quieras. Sin suscripciones.</p>
          </Reveal>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {PACKS.map(({ name, credits, price, popular, tag }, i) => (
              <Reveal key={name} delay={i * 80} className="h-full">
                <div className={`relative flex h-full flex-col gap-4 rounded-[14px] border p-5 transition-all duration-300 ${
                  popular
                    ? 'card-featured -translate-y-1 shadow-[0_20px_50px_-12px_rgba(9,9,11,0.4)]'
                    : 'border-[#E4E4E7] bg-white hover:-translate-y-1 hover:border-[#D4D4D8] hover:shadow-card-hover'
                }`}>
                  {popular && (
                    <span className="absolute -top-2.5 right-4 rounded-full bg-[#7C3AED] px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-widest text-white">
                      Popular
                    </span>
                  )}

                  <div className="flex h-8 w-8 items-center justify-center rounded-[8px]"
                    style={{ background: popular ? 'rgba(255,255,255,0.08)' : '#F4F4F5' }}>
                    <IconBolt size={15} stroke={1.8} className={popular ? 'text-[#7C3AED]' : 'text-[#3F3F46]'} />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className={`text-lg font-bold tracking-tight ${popular ? 'text-white' : 'text-[#09090B]'}`}>{name}</h3>
                    </div>
                    <p className={`mt-0.5 text-xs ${popular ? 'text-[#52525B]' : 'text-[#71717A]'}`}>{credits.toLocaleString()} créditos · {tag}</p>
                  </div>

                  <div className="flex items-baseline gap-1">
                    <span className={`text-3xl font-bold tracking-tight ${popular ? 'text-white' : 'text-[#09090B]'}`}>${price}</span>
                    <span className={`text-xs ${popular ? 'text-[#52525B]' : 'text-[#71717A]'}`}>USD</span>
                  </div>

                  <ul className="flex-1 space-y-1.5">
                    {['Imágenes con IA', 'Banners', 'Captions', 'Sin expiración'].map(f => (
                      <li key={f} className="flex items-center gap-2 text-xs">
                        <IconCheck size={13} stroke={2.5} className={popular ? 'text-[#7C3AED]' : 'text-[#09090B]'} />
                        <span className={popular ? 'text-[#A1A1AA]' : 'text-[#71717A]'}>{f}</span>
                      </li>
                    ))}
                  </ul>

                  <Link href="/register" className={`block w-full rounded-[8px] py-2.5 text-center text-xs font-semibold transition-colors ${
                    popular ? 'bg-white text-[#09090B] hover:bg-[#F4F4F5]' : 'btn-primary'
                  }`}>
                    Comenzar
                  </Link>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────── */}
      <section id="faq" className="px-6 py-20 sm:py-28">
        <div className="mx-auto grid max-w-[1000px] gap-10 lg:grid-cols-[0.85fr_1.15fr]">
          <Reveal>
            <p className="section-label mb-3">Preguntas frecuentes</p>
            <h2 className="mb-3 text-2xl font-bold tracking-tight text-[#09090B] sm:text-4xl">
              ¿Tenés dudas?
            </h2>
            <p className="mb-6 max-w-[320px] text-base leading-relaxed text-[#71717A]">
              Todo lo que necesitás saber antes de crear tu primer contenido con IA.
            </p>
            <Link href="/register" className="btn-primary px-6 py-3 text-sm">
              Empezar gratis <IconArrowRight size={16} stroke={2} />
            </Link>
          </Reveal>

          <Reveal delay={100}>
            <Faq />
          </Reveal>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────── */}
      <footer className="border-t border-[#E4E4E7] bg-white px-6 py-7">
        <div className="mx-auto flex max-w-[1160px] flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-[7px] bg-[#09090B]">
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
