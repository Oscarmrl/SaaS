'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

// La vista de generaciones individuales se retiró por minimización de datos
// (el admin no debe ver el contenido de los usuarios). Redirige al resumen.
export default function AdminJobsRedirect() {
  const router = useRouter()
  useEffect(() => { router.replace('/admin') }, [router])
  return null
}
