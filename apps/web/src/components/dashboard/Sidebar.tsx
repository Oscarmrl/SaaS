'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import {
  IconLayoutDashboard,
  IconBriefcase,
  IconSparkles,
  IconPhoto,
  IconBolt,
  IconSettings,
  IconLogout,
  IconShieldLock,
  IconHelpCircle,
  IconX,
} from '@tabler/icons-react'
import { createClient } from '@/lib/supabase'
import { useUser } from '@/contexts/UserContext'
import { useTour } from '@/contexts/TourContext'

// Selectores para el tour de onboarding (React Joyride)
const TOUR_IDS: Record<string, string> = {
  '/generate': 'nav-generate',
  '/assets':   'nav-assets',
}

const NAV_SECTIONS = [
  {
    label: 'Principal',
    items: [
      { href: '/dashboard', icon: IconLayoutDashboard, label: 'Inicio'      },
      { href: '/brands',    icon: IconBriefcase,       label: 'Mis marcas'  },
      { href: '/generate',  icon: IconSparkles,        label: 'Generar'     },
      { href: '/assets',    icon: IconPhoto,           label: 'Mis assets'  },
    ],
  },
  {
    label: 'Cuenta',
    items: [
      { href: '/credits',   icon: IconBolt,      label: 'Créditos' },
      { href: '/settings',  icon: IconSettings,  label: 'Ajustes'  },
    ],
  },
]

interface SidebarProps {
  isOpen:  boolean
  onClose: () => void
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname()
  const router   = useRouter()
  const { displayName, firstName, avatarUrl, credits, isAdmin } = useUser()
  const { startCurrentTour } = useTour()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  const initials = firstName.slice(0, 1).toUpperCase()

  return (
    <aside className={`
      fixed left-0 top-0 h-screen w-[220px]
      bg-[#F9F9FB] border-r border-[#E4E4E7]
      flex flex-col z-40
      transition-transform duration-300 ease-in-out
      ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
    `}>

      {/* Logo */}
      <div className="px-5 py-5 border-b border-[#E4E4E7] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-[8px] bg-[#09090B] flex items-center justify-center flex-shrink-0">
            <IconSparkles size={16} className="text-white" />
          </div>
          <span className="font-bold text-[#09090B] text-base tracking-tight">BrandAI</span>
        </div>
        <button
          onClick={onClose}
          className="lg:hidden w-7 h-7 flex items-center justify-center rounded-[6px] text-[#A1A1AA] hover:bg-[#EDEDEF] transition-colors"
          aria-label="Cerrar menú"
        >
          <IconX size={16} stroke={1.7} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto">
        {NAV_SECTIONS.map(section => (
          <div key={section.label}>
            <p className="section-label px-2 mb-1.5">{section.label}</p>
            <div className="space-y-0.5">
              {section.items.map(({ href, icon: Icon, label }) => {
                const active = pathname === href || pathname.startsWith(href + '/')
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={onClose}
                    data-tour={TOUR_IDS[href]}
                    className={`
                      flex items-center gap-2.5 px-2.5 py-2 rounded-[8px] text-sm font-medium
                      transition-all duration-150
                      ${active
                        ? 'bg-[#09090B] text-white'
                        : 'text-[#71717A] hover:bg-[#EDEDEF] hover:text-[#09090B]'}
                    `}
                  >
                    <Icon size={17} stroke={active ? 2.0 : 1.7} />
                    {label}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}

        {isAdmin && (
          <div>
            <p className="section-label px-2 mb-1.5">Administración</p>
            <div className="space-y-0.5">
              <Link
                href="/admin"
                onClick={onClose}
                className={`
                  flex items-center gap-2.5 px-2.5 py-2 rounded-[8px] text-sm font-medium
                  transition-all duration-150
                  ${pathname === '/admin' || pathname.startsWith('/admin/')
                    ? 'bg-[#7C3AED] text-white'
                    : 'text-[#71717A] hover:bg-[#EDEDEF] hover:text-[#7C3AED]'}
                `}
              >
                <IconShieldLock size={17} stroke={pathname.startsWith('/admin') ? 2.0 : 1.7} />
                Admin
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Footer */}
      <div className="border-t border-[#E4E4E7] px-3 py-3 space-y-0.5">
        {/* Credits indicator */}
        <div data-tour="credits" className="flex items-center gap-2 px-2.5 py-2 rounded-[8px] bg-[#F4F4F5]">
          <IconBolt size={15} stroke={1.8} className="text-[#09090B] flex-shrink-0" />
          <div className="min-w-0">
            <span className="text-xs font-semibold text-[#09090B] tabular-nums">
              {credits.balance.toLocaleString()}
            </span>
            <span className="text-xs text-[#71717A] ml-1">créditos</span>
          </div>
          <Link href="/credits" onClick={onClose} className="ml-auto text-[10px] font-semibold text-[#09090B] hover:underline flex-shrink-0">
            + comprar
          </Link>
        </div>

        {/* User row */}
        <div className="flex items-center gap-2.5 px-2.5 py-2">
          {avatarUrl ? (
            <Image src={avatarUrl} alt={displayName} width={28} height={28}
              className="rounded-full border border-[#E4E4E7] flex-shrink-0" />
          ) : (
            <div className="w-7 h-7 rounded-full bg-[#E4E4E7] flex items-center justify-center flex-shrink-0">
              <span className="text-[10px] font-bold text-[#3F3F46]">{initials}</span>
            </div>
          )}
          <span className="text-xs font-medium text-[#3F3F46] truncate flex-1">{displayName}</span>
          <button onClick={() => { startCurrentTour(); onClose() }} title="Ver guía de esta página"
            className="w-7 h-7 flex items-center justify-center rounded-[6px] text-[#A1A1AA] hover:bg-[#EDEDEF] hover:text-[#7C3AED] transition-all duration-150 flex-shrink-0">
            <IconHelpCircle size={15} stroke={1.7} />
          </button>
          <button onClick={handleLogout} title="Cerrar sesión"
            className="w-7 h-7 flex items-center justify-center rounded-[6px] text-[#A1A1AA] hover:bg-[#EDEDEF] hover:text-[#09090B] transition-all duration-150 flex-shrink-0">
            <IconLogout size={15} stroke={1.7} />
          </button>
        </div>
      </div>
    </aside>
  )
}
