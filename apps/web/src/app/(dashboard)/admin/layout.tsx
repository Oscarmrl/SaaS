'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  IconChartBar, IconUsers, IconCreditCard, IconStack2, IconShieldLock, IconLoader2,
} from '@tabler/icons-react'
import { api } from '@/lib/api-client'

const TABS = [
  { href: '/admin',          icon: IconChartBar,   label: 'Resumen'       },
  { href: '/admin/users',    icon: IconUsers,      label: 'Usuarios'      },
  { href: '/admin/payments', icon: IconCreditCard, label: 'Pagos'         },
  { href: '/admin/jobs',     icon: IconStack2,     label: 'Generaciones'  },
]

type Access = 'loading' | 'granted' | 'denied'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router   = useRouter()
  const [access, setAccess] = useState<Access>('loading')

  useEffect(() => {
    let mounted = true
    api.get<{ role: string }>('/user/me')
      .then((data) => {
        if (!mounted) return
        if (data.role === 'ADMIN') setAccess('granted')
        else { setAccess('denied'); router.replace('/dashboard') }
      })
      .catch(() => {
        if (!mounted) return
        setAccess('denied'); router.replace('/dashboard')
      })
    return () => { mounted = false }
  }, [router])

  if (access !== 'granted') {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <IconLoader2 size={28} className="text-[#A1A1AA] animate-spin mb-3" />
        <p className="text-sm text-[#71717A]">
          {access === 'denied' ? 'Acceso restringido. Redirigiendo...' : 'Verificando acceso...'}
        </p>
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-2.5 mb-1">
        <div className="w-7 h-7 rounded-[8px] bg-[#7C3AED] flex items-center justify-center">
          <IconShieldLock size={15} className="text-white" />
        </div>
        <h1 className="page-title">Panel de administración</h1>
      </div>
      <p className="page-subtitle mb-6">Gestión de usuarios, pagos y generaciones</p>

      {/* Sub-nav */}
      <div className="flex gap-1 mb-6 overflow-x-auto pb-1 border-b border-[#E4E4E7]">
        {TABS.map(({ href, icon: Icon, label }) => {
          const active = href === '/admin' ? pathname === '/admin' : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={`
                flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-t-[8px]
                border-b-2 -mb-px transition-colors whitespace-nowrap
                ${active
                  ? 'border-[#7C3AED] text-[#7C3AED]'
                  : 'border-transparent text-[#71717A] hover:text-[#09090B]'
                }
              `}
            >
              <Icon size={15} stroke={1.8} />
              {label}
            </Link>
          )
        })}
      </div>

      {children}
    </div>
  )
}
