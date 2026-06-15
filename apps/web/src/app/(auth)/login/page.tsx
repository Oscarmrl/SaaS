'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  IconSparkles, IconLoader2, IconBolt, IconPhoto, IconVideo,
  IconMail, IconLock, IconEye, IconEyeOff, IconArrowRight,
} from '@tabler/icons-react'
import toast from 'react-hot-toast'
import Link from 'next/link'

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
      <path d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  )
}

const FEATURES = [
  { icon: IconPhoto, label: 'Imágenes y banners publicitarios' },
  { icon: IconVideo, label: 'Videos 15s y 30s con voz IA'     },
  { icon: IconBolt,  label: 'Paga solo lo que usas'           },
]

// Floating asset collage on the brand panel — each card drifts independently.
const FLOAT_CARDS = [
  { src: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=320&h=440&fit=crop', cls: 'top-[8%]  right-[16%] h-48 w-36 rotate-[6deg]',     anim: 'animate-float-lg', delay: '0s'   },
  { src: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=320&h=440&fit=crop', cls: 'top-[36%] right-[3%]  h-44 w-32 rotate-[3deg]',     anim: 'animate-float',    delay: '1.1s' },
  { src: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=320&h=440&fit=crop',    cls: 'top-[31%] right-[42%] h-36 w-28 -rotate-[8deg]',    anim: 'animate-float',    delay: '0.6s' },
  { src: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=320&h=440&fit=crop', cls: 'bottom-[9%] right-[27%] h-40 w-32 -rotate-[5deg]',  anim: 'animate-float-lg', delay: '0.9s' },
  { src: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=320&h=440&fit=crop', cls: 'top-[61%] right-[49%] h-28 w-24 rotate-[10deg]',    anim: 'animate-float',    delay: '1.6s' },
]

export default function LoginPage() {
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [shake,    setShake]    = useState(false)
  const router       = useRouter()
  const searchParams = useSearchParams()
  const supabase     = createClient()

  useEffect(() => {
    if (searchParams.get('error') === 'oauth') {
      toast.error('Error al iniciar sesión con Google.')
    }
  }, [searchParams])

  function triggerShake() {
    setShake(true)
    window.setTimeout(() => setShake(false), 500)
  }

  async function handleGoogle() {
    setLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
    if (error) { toast.error('No se pudo conectar con Google'); setLoading(false) }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault(); setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { toast.error('Email o contraseña incorrectos'); setLoading(false); triggerShake(); return }
    router.push('/dashboard')
  }

  return (
    <div className="flex min-h-screen bg-white">

      {/* ── Left panel — animated brand scene ── */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-[#09090B] p-12 lg:flex lg:w-[44%]">
        {/* atmosphere */}
        <div className="pointer-events-none absolute -left-20 -top-24 h-80 w-80 rounded-full bg-[#7C3AED]/25 blur-[90px] animate-blob" />
        <div className="pointer-events-none absolute -right-16 top-1/3 h-72 w-72 rounded-full bg-[#7C3AED]/15 blur-[90px] animate-blob" style={{ animationDelay: '4s' }} />
        <div className="pointer-events-none absolute -bottom-24 left-1/4 h-72 w-72 rounded-full bg-[#4F46E5]/10 blur-[90px] animate-glow" />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07] [mask-image:radial-gradient(ellipse_80%_70%_at_30%_40%,black,transparent)]"
          style={{ backgroundImage: 'radial-gradient(circle at center,#fff 1px,transparent 1px)', backgroundSize: '24px 24px' }}
        />

        {/* floating asset collage */}
        <div className="pointer-events-none absolute right-0 top-0 z-0 hidden h-full w-[60%] lg:block">
          {FLOAT_CARDS.map(({ src, cls, anim, delay }, i) => (
            <div
              key={i}
              className={`absolute overflow-hidden rounded-[16px] border border-white/10 shadow-2xl ${anim} ${cls}`}
              style={{ animationDelay: delay }}
            >
              <img src={src} alt="" className="h-full w-full object-cover" draggable={false} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            </div>
          ))}

          {/* left fade so the headline stays readable over the collage */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#09090B] via-[#09090B]/70 to-transparent" />

          {/* floating product badges (above the fade) */}
          <div className="badge-3d-light absolute right-[14%] top-[3%] flex items-center gap-1.5 !rounded-full px-2.5 py-1 animate-float" style={{ animationDelay: '1.2s' }}>
            <IconSparkles size={11} className="text-[#7C3AED]" />
            <span className="text-[10px] font-bold text-[#09090B]">Generado con IA</span>
          </div>
          <div className="badge-3d absolute bottom-[24%] right-[20%] flex h-10 w-10 animate-float-lg items-center justify-center" style={{ animationDelay: '0.4s' }}>
            <IconVideo size={17} stroke={1.8} />
          </div>
        </div>

        {/* logo */}
        <div className="enter relative z-10 flex items-center gap-2" style={{ ['--enter-delay' as string]: '0ms' }}>
          <div className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-white">
            <IconSparkles size={16} className="text-[#09090B]" />
          </div>
          <span className="text-base font-bold tracking-tight text-white">BrandAI</span>
        </div>

        {/* middle */}
        <div className="relative z-10 max-w-[330px]">
          <p className="enter mb-5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#A78BFA]" style={{ ['--enter-delay' as string]: '120ms' }}>
            IA generativa para tu negocio
          </p>
          <h2 className="enter mb-8 text-[2.6rem] font-extrabold leading-[1.08] tracking-tight text-white [text-shadow:0_2px_24px_rgba(0,0,0,0.6)]" style={{ ['--enter-delay' as string]: '200ms' }}>
            Crea contenido<br />
            publicitario<br />
            <span className="text-aurora-light">profesional.</span>
          </h2>
          <div className="space-y-3">
            {FEATURES.map(({ icon: Icon, label }, i) => (
              <div
                key={label}
                className="enter group flex items-center gap-3"
                style={{ ['--enter-delay' as string]: `${320 + i * 90}ms` }}
              >
                <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-[7px] bg-white/[0.06] ring-1 ring-white/10 transition-all duration-200 group-hover:bg-[#7C3AED]/20 group-hover:ring-[#7C3AED]/40">
                  <Icon size={14} stroke={1.8} className="text-[#A1A1AA] transition-colors duration-200 group-hover:text-[#C4B5FD]" />
                </div>
                <span className="text-sm text-[#A1A1AA] transition-colors duration-200 group-hover:text-white">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* stats */}
        <div className="enter relative z-10 border-t border-white/[0.08] pt-6" style={{ ['--enter-delay' as string]: '620ms' }}>
          <div className="flex gap-8">
            {[{ v: '500+', l: 'Marcas activas' }, { v: '10K+', l: 'Assets generados' }, { v: '$0', l: 'Para empezar' }].map(({ v, l }) => (
              <div key={l}>
                <div className="text-lg font-bold text-white">{v}</div>
                <div className="mt-0.5 text-[10px] font-medium uppercase tracking-wide text-[#52525B]">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right panel — form ── */}
      <div className="relative flex flex-1 items-center justify-center bg-[#FAFAFA] px-6 sm:px-10">
        {/* subtle accent glow top */}
        <div className="pointer-events-none absolute -top-20 right-1/4 h-64 w-64 rounded-full bg-[#7C3AED]/[0.07] blur-3xl" />

        <div className={`relative w-full max-w-[380px] ${shake ? 'animate-shake' : ''}`}>

          {/* Mobile logo */}
          <div className="enter mb-8 flex items-center gap-2 lg:hidden" style={{ ['--enter-delay' as string]: '0ms' }}>
            <div className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-[#09090B]">
              <IconSparkles size={16} className="text-white" />
            </div>
            <span className="font-bold text-[#09090B]">BrandAI</span>
          </div>

          <h1 className="enter mb-1 text-2xl font-bold tracking-tight text-[#09090B]" style={{ ['--enter-delay' as string]: '60ms' }}>
            Iniciar sesión
          </h1>
          <p className="enter mb-7 text-sm text-[#71717A]" style={{ ['--enter-delay' as string]: '120ms' }}>
            Bienvenido de vuelta a tu cuenta
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email */}
            <div className="enter" style={{ ['--enter-delay' as string]: '180ms' }}>
              <label className="mb-1.5 block text-xs font-medium text-[#3F3F46]">Email</label>
              <div className="group relative">
                <IconMail size={16} stroke={1.7} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#A1A1AA] transition-colors duration-200 group-focus-within:text-[#7C3AED]" />
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="tu@email.com" required autoComplete="email"
                  className="w-full rounded-[8px] border border-[#E4E4E7] bg-white py-2.5 pl-10 pr-3 text-sm text-[#09090B] placeholder-[#A1A1AA] transition-all duration-200 focus:border-[#7C3AED] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/15"
                />
              </div>
            </div>

            {/* Password */}
            <div className="enter" style={{ ['--enter-delay' as string]: '240ms' }}>
              <label className="mb-1.5 block text-xs font-medium text-[#3F3F46]">Contraseña</label>
              <div className="group relative">
                <IconLock size={16} stroke={1.7} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#A1A1AA] transition-colors duration-200 group-focus-within:text-[#7C3AED]" />
                <input
                  type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••" required autoComplete="current-password"
                  className="w-full rounded-[8px] border border-[#E4E4E7] bg-white py-2.5 pl-10 pr-10 text-sm text-[#09090B] placeholder-[#A1A1AA] transition-all duration-200 focus:border-[#7C3AED] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/15"
                />
                <button
                  type="button" onClick={() => setShowPass(v => !v)} tabIndex={-1}
                  aria-label={showPass ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-[#A1A1AA] transition-colors duration-150 hover:text-[#09090B]"
                >
                  {showPass ? <IconEyeOff size={16} stroke={1.7} /> : <IconEye size={16} stroke={1.7} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <div className="enter" style={{ ['--enter-delay' as string]: '300ms' }}>
              <button
                type="submit" disabled={loading}
                className="group flex w-full items-center justify-center gap-2 rounded-[8px] bg-[#09090B] py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-[#18181B] hover:shadow-[0_8px_24px_-6px_rgba(124,58,237,0.5)] active:scale-[0.98] disabled:opacity-50"
              >
                {loading ? (
                  <><IconLoader2 size={15} className="animate-spin" /> Iniciando sesión…</>
                ) : (
                  <>Iniciar sesión <IconArrowRight size={15} stroke={2} className="transition-transform duration-200 group-hover:translate-x-0.5" /></>
                )}
              </button>
            </div>
          </form>

          {/* Divider */}
          <div className="enter my-5 flex items-center gap-3" style={{ ['--enter-delay' as string]: '360ms' }}>
            <div className="h-px flex-1 bg-[#E4E4E7]" />
            <span className="text-[11px] text-[#A1A1AA]">o continúa con</span>
            <div className="h-px flex-1 bg-[#E4E4E7]" />
          </div>

          {/* Google */}
          <button
            onClick={handleGoogle} disabled={loading}
            className="enter flex w-full items-center justify-center gap-2.5 rounded-[8px] border border-[#E4E4E7] bg-white px-4 py-2.5 text-sm font-medium text-[#09090B] transition-all duration-200 hover:border-[#D4D4D8] hover:bg-[#F4F4F5] hover:shadow-sm active:scale-[0.98] disabled:opacity-50"
            style={{ ['--enter-delay' as string]: '420ms' }}
          >
            <GoogleIcon />
            Google
          </button>

          <p className="enter mt-6 text-center text-xs text-[#71717A]" style={{ ['--enter-delay' as string]: '480ms' }}>
            ¿No tienes cuenta?{' '}
            <Link href="/register" className="font-semibold text-[#09090B] transition-colors hover:text-[#7C3AED] hover:underline">
              Regístrate gratis
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
