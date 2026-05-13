'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, Briefcase } from '@phosphor-icons/react'
import { BrandCard } from '@/components/brand/BrandCard'
import { api } from '@/lib/api-client'
import type { BrandProfile } from '@brandai/shared'

export default function BrandsPage() {
  const [brands,  setBrands]  = useState<BrandProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState<string | null>(null)

  useEffect(() => {
    api.get<BrandProfile[]>('/brands')
      .then(setBrands)
      .catch(err => setError(err instanceof Error ? err.message : 'Error al cargar marcas'))
      .finally(() => setLoading(false))
  }, [])

  async function handleDelete(id: string) {
    await api.delete(`/brands/${id}`)
    setBrands(prev => prev.filter(b => b.id !== id))
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#0A0A0A]">Mis marcas</h1>
          <p className="text-sm text-[#6B7280] mt-1">Gestiona las identidades de tus negocios</p>
        </div>
        <Link href="/brands/new" className="btn-primary">
          <Plus className="w-4 h-4" /> Nueva marca
        </Link>
      </div>

      {/* States */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="card h-48 skeleton" />
          ))}
        </div>
      )}

      {!loading && error && (
        <div className="card text-center py-12">
          <p className="text-sm text-[#EF4444]">{error}</p>
        </div>
      )}

      {!loading && !error && brands.length === 0 && (
        <div className="card flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-full bg-[#F1F3F5] flex items-center justify-center mb-4">
            <Briefcase className="w-7 h-7 text-[#9CA3AF]" />
          </div>
          <h3 className="text-base font-semibold text-[#0A0A0A]">Todavía no tienes marcas</h3>
          <p className="text-sm text-[#6B7280] mt-1 mb-6">Crea tu primera marca para empezar a generar contenido</p>
          <Link href="/brands/new" className="btn-accent">
            <Plus className="w-4 h-4" /> Crear primera marca
          </Link>
        </div>
      )}

      {!loading && !error && brands.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {brands.map(brand => (
            <BrandCard key={brand.id} brand={brand} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  )
}
