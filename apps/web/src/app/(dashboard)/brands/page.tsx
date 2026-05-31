'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { IconPlus, IconBriefcase } from '@tabler/icons-react'
import toast from 'react-hot-toast'
import { BrandCard } from '@/components/brand/BrandCard'
import { api } from '@/lib/api-client'
import type { BrandProfile } from '@brandai/shared'

export default function BrandsPage() {
  const [brands,  setBrands]  = useState<BrandProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(false)

  useEffect(() => {
    api.get<BrandProfile[]>('/brands')
      .then(setBrands)
      .catch(() => { toast.error('Error al cargar las marcas'); setError(true) })
      .finally(() => setLoading(false))
  }, [])

  async function handleDelete(id: string) {
    try {
      await api.delete(`/brands/${id}`)
      setBrands(prev => prev.filter(b => b.id !== id))
      toast.success('Marca eliminada')
    } catch {
      toast.error('No se pudo eliminar la marca')
    }
  }

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Mis marcas</h1>
          <p className="page-subtitle">Gestiona las identidades de tus negocios</p>
        </div>
        <Link href="/brands/new" className="btn-primary">
          <IconPlus size={15} stroke={2} /> Nueva marca
        </Link>
      </div>

      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <div key={i} className="card h-52 skeleton" />)}
        </div>
      )}

      {!loading && error && (
        <div className="card text-center py-12">
          <p className="text-sm text-[#71717A]">No se pudieron cargar las marcas</p>
        </div>
      )}

      {!loading && !error && brands.length === 0 && (
        <div className="card flex flex-col items-center justify-center py-20 text-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[#F4F4F5] flex items-center justify-center">
            <IconBriefcase size={20} stroke={1.5} className="text-[#A1A1AA]" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[#09090B]">Todavía no tienes marcas</h3>
            <p className="text-xs text-[#71717A] mt-1">Crea tu primera marca para empezar a generar contenido</p>
          </div>
          <Link href="/brands/new" className="btn-accent">
            <IconPlus size={15} stroke={2} /> Crear primera marca
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
