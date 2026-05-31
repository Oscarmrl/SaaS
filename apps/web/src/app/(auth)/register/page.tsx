'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { IconSparkles, IconLoader2, IconCheck } from '@tabler/icons-react'
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

const BENEFITS = [
  'Imágenes publicitarias en segundos',
  'Videos con voz profesional incluidos',
  'Sin suscripción — paga solo lo que usas',
]

export default function RegisterPage() {
  const [name,     setName]     = useState('')
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [loading,  setLoading]  = useState(false)
  const router   = useRouter()
  const supabase = createClient()

  async function handleGoogle() {
    setLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
    if (error) { toast.error('No se pudo conectar con Google'); setLoading(false) }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault(); setLoading(true)
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { data: { full_name: name } },
    })
    if (error) { toast.error(error.message); setLoading(false); return }
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen flex bg-white">

      {/* Left panel */}
      <div className="hidden lg:flex lg:w-[42%] flex-col justify-between p-12 bg-[#09090B]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-[8px] bg-white flex items-center justify-center">
            <IconSparkles size={16} className="text-[#09090B]" />
          </div>
          <span className="text-white font-bold text-base tracking-tight">BrandAI</span>
        </div>

        <div>
          <p className="text-[10px] font-bold tracking-[0.14em] uppercase text-[#52525B] mb-5">Empieza gratis hoy</p>
          <h2 className="text-3xl font-bold text-white leading-tight tracking-tight mb-8">
            Publicidad<br />
            profesional para<br />
            tu negocio.
          </h2>
          <div className="space-y-3">
            {BENEFITS.map(b => (
              <div key={b} className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-[#18181B] flex items-center justify-center flex-shrink-0 mt-px">
                  <IconCheck size={11} stroke={2.5} className="text-[#71717A]" />
                </div>
                <span className="text-sm text-[#71717A] leading-relaxed">{b}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-[#18181B] pt-6">
          <p className="text-xs text-[#52525B] font-medium">Sin tarjeta de crédito requerida.</p>
          <p className="text-sm text-white font-semibold mt-1">Cuenta gratis — paga cuando generes.</p>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center px-6 sm:px-10 bg-[#FAFAFA]">
        <div className="w-full max-w-[380px]">

          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-[8px] bg-[#09090B] flex items-center justify-center">
              <IconSparkles size={16} className="text-white" />
            </div>
            <span className="font-bold text-[#09090B]">BrandAI</span>
          </div>

          <h1 className="text-xl font-semibold text-[#09090B] tracking-tight mb-1">Crear cuenta</h1>
          <p className="text-sm text-[#71717A] mb-7">Empieza gratis, sin tarjeta de crédito</p>

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#3F3F46] mb-1.5">Nombre</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)}
                placeholder="Tu nombre" required className="input" />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#3F3F46] mb-1.5">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="tu@email.com" required className="input" />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#3F3F46] mb-1.5">Contraseña</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="Mínimo 8 caracteres" minLength={8} required className="input" />
            </div>

            <button type="submit" disabled={loading} className="btn-accent w-full justify-center py-2.5">
              {loading ? <><IconLoader2 size={15} className="animate-spin" /> Creando cuenta…</> : 'Crear cuenta gratis'}
            </button>
          </form>

          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-[#E4E4E7]" />
            <span className="text-[11px] text-[#A1A1AA]">o continúa con</span>
            <div className="flex-1 h-px bg-[#E4E4E7]" />
          </div>

          <button onClick={handleGoogle} disabled={loading}
            className="w-full flex items-center justify-center gap-2.5 border border-[#E4E4E7] rounded-[8px] px-4 py-2.5 text-sm font-medium text-[#09090B] bg-white hover:bg-[#F4F4F5] transition-colors disabled:opacity-50">
            <GoogleIcon />
            Google
          </button>

          <p className="text-center text-xs text-[#71717A] mt-6">
            ¿Ya tienes cuenta?{' '}
            <Link href="/login" className="text-[#09090B] font-semibold hover:underline">Iniciar sesión</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
