'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter, useSearchParams } from 'next/navigation'
import { Sparkle, CircleNotch } from '@phosphor-icons/react'
import Link from 'next/link'

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
      <path d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  )
}

export default function LoginPage() {
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [loading,  setLoading]  = useState(false)
  const router       = useRouter()
  const searchParams = useSearchParams()
  const supabase     = createClient()
  const [error, setError] = useState<string | null>(
    searchParams.get('error') === 'oauth' ? 'Error al iniciar sesión con Google. Intenta de nuevo.' : null
  )

  async function handleGoogle() {
    setError(null)
    setLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
    if (error) {
      setError('No se pudo conectar con Google')
      setLoading(false)
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError('Email o contraseña incorrectos')
      setLoading(false)
      return
    }

    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center p-4">
      <div className="w-full max-w-[400px]">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <div className="w-10 h-10 rounded-[10px] bg-[#7C3AED] flex items-center justify-center">
            <Sparkle className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-[#0A0A0A]">BrandAI</span>
        </div>

        <div className="card p-8">
          <h1 className="text-xl font-bold text-[#0A0A0A] mb-1">Bienvenido de vuelta</h1>
          <p className="text-sm text-[#6B7280] mb-6">Inicia sesión en tu cuenta</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#374151] mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="tu@email.com"
                required
                className="input"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#374151] mb-1.5">
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="input"
              />
            </div>

            {error && (
              <div className="text-xs text-red-500 bg-red-50 border border-red-200 rounded-[8px] px-3 py-2">
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3">
              {loading ? (
                <><CircleNotch className="w-4 h-4 animate-spin" /> Iniciando sesión…</>
              ) : (
                'Iniciar sesión'
              )}
            </button>
          </form>

          <div className="flex items-center gap-3 mt-4">
            <div className="flex-1 h-px bg-[#E5E7EB]" />
            <span className="text-xs text-[#9CA3AF]">o</span>
            <div className="flex-1 h-px bg-[#E5E7EB]" />
          </div>

          <button
            type="button"
            onClick={handleGoogle}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 border border-[#E5E7EB] rounded-[8px] px-4 py-2.5 text-sm font-medium text-[#0A0A0A] bg-white hover:bg-[#F1F3F5] transition-all duration-150 disabled:opacity-50 mt-3"
          >
            <GoogleIcon />
            Continuar con Google
          </button>
        </div>

        <p className="text-center text-xs text-[#6B7280] mt-4">
          ¿No tienes cuenta?{' '}
          <Link href="/register" className="text-[#7C3AED] font-medium hover:underline">
            Regístrate gratis
          </Link>
        </p>
      </div>
    </div>
  )
}
