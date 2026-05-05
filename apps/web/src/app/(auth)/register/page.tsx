'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Sparkles, Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function RegisterPage() {
  const [name,     setName]     = useState('')
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState<string | null>(null)
  const [loading,  setLoading]  = useState(false)
  const router   = useRouter()
  const supabase = createClient()

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center p-4">
      <div className="w-full max-w-[400px]">
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <div className="w-10 h-10 rounded-[10px] bg-[#7C3AED] flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-[#0A0A0A]">BrandAI</span>
        </div>

        <div className="card p-8">
          <h1 className="text-xl font-bold text-[#0A0A0A] mb-1">Crea tu cuenta</h1>
          <p className="text-sm text-[#6B7280] mb-6">Empieza gratis, sin tarjeta de crédito</p>

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#374151] mb-1.5">Nombre</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Tu nombre"
                required
                className="input"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#374151] mb-1.5">Email</label>
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
              <label className="block text-xs font-medium text-[#374151] mb-1.5">Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Mínimo 8 caracteres"
                minLength={8}
                required
                className="input"
              />
            </div>

            {error && (
              <div className="text-xs text-red-500 bg-red-50 border border-red-200 rounded-[8px] px-3 py-2">
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-accent w-full justify-center py-3">
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Creando cuenta…</>
              ) : (
                'Crear cuenta gratis'
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-[#6B7280] mt-4">
          ¿Ya tienes cuenta?{' '}
          <Link href="/login" className="text-[#7C3AED] font-medium hover:underline">
            Iniciar sesión
          </Link>
        </p>
      </div>
    </div>
  )
}
