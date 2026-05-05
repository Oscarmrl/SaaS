'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Sparkles, Image, Briefcase, Zap, Settings, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

const NAV = [
  { href: '/dashboard',  icon: LayoutDashboard, label: 'Inicio' },
  { href: '/brands',     icon: Briefcase,       label: 'Mis marcas' },
  { href: '/generate',   icon: Sparkles,        label: 'Generar' },
  { href: '/assets',     icon: Image,           label: 'Mis assets' },
  { href: '/credits',    icon: Zap,             label: 'Créditos' },
]

export function Sidebar() {
  const pathname = usePathname()
  const router   = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <aside className="fixed left-0 top-0 h-screen w-[72px] bg-[#0A0A0A] flex flex-col items-center py-5 z-40">
      {/* Logo mark */}
      <div className="w-9 h-9 rounded-[10px] bg-[#7C3AED] flex items-center justify-center mb-8 flex-shrink-0">
        <Sparkles className="w-5 h-5 text-white" />
      </div>

      {/* Nav */}
      <nav className="flex flex-col items-center gap-1 flex-1">
        {NAV.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              title={label}
              className={`
                group relative w-11 h-11 flex items-center justify-center rounded-[10px]
                transition-all duration-150
                ${active
                  ? 'bg-[#7C3AED] text-white'
                  : 'text-[#6B7280] hover:bg-[#1A1A1A] hover:text-white'}
              `}
            >
              <Icon className="w-5 h-5" />
              {/* Tooltip */}
              <span className="
                absolute left-14 px-2 py-1 bg-[#1A1A1A] text-white text-xs rounded-[6px]
                opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap
                transition-opacity duration-150 z-50
              ">
                {label}
              </span>
            </Link>
          )
        })}
      </nav>

      {/* Bottom */}
      <div className="flex flex-col items-center gap-1">
        <Link
          href="/settings"
          title="Ajustes"
          className="w-11 h-11 flex items-center justify-center rounded-[10px] text-[#6B7280] hover:bg-[#1A1A1A] hover:text-white transition-all duration-150"
        >
          <Settings className="w-5 h-5" />
        </Link>
        <button
          onClick={handleLogout}
          title="Cerrar sesión"
          className="w-11 h-11 flex items-center justify-center rounded-[10px] text-[#6B7280] hover:bg-[#1A1A1A] hover:text-red-400 transition-all duration-150"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </aside>
  )
}
