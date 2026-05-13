'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { SquaresFour, Sparkle, Image as ImageIcon, Briefcase, Lightning, GearSix, SignOut } from '@phosphor-icons/react'
import { createClient } from '@/lib/supabase'
import { useUser } from '@/contexts/UserContext'

const NAV = [
  { href: '/dashboard', icon: SquaresFour, label: 'Inicio'     },
  { href: '/brands',    icon: Briefcase,       label: 'Mis marcas' },
  { href: '/generate',  icon: Sparkle,        label: 'Generar'    },
  { href: '/assets',    icon: ImageIcon,       label: 'Mis assets' },
  { href: '/credits',   icon: Lightning,             label: 'Créditos'   },
]

export function Sidebar() {
  const pathname          = usePathname()
  const router            = useRouter()
  const { displayName, firstName, avatarUrl, credits } = useUser()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  const initials = firstName.slice(0, 1).toUpperCase()

  return (
    <aside className="fixed left-0 top-0 h-screen w-[72px] bg-[#0A0A0A] flex flex-col items-center py-5 z-40">
      {/* Logo mark */}
      <div className="w-9 h-9 rounded-[10px] bg-[#7C3AED] flex items-center justify-center mb-8 flex-shrink-0">
        <Sparkle className="w-5 h-5 text-white" />
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
              <Icon className="w-5 h-5" weight={active ? 'bold' : 'regular'} />
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

      {/* Bottom — user avatar + settings + logout */}
      <div className="flex flex-col items-center gap-1">
        {/* User avatar con tooltip de nombre y créditos */}
        <div className="group relative">
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt={displayName}
              width={36}
              height={36}
              className="rounded-full border-2 border-[#1A1A1A] group-hover:border-[#7C3AED] transition-all duration-150 cursor-default"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-[#7C3AED]/20 border-2 border-[#1A1A1A] group-hover:border-[#7C3AED] flex items-center justify-center transition-all duration-150 cursor-default">
              <span className="text-xs font-bold text-[#7C3AED]">{initials}</span>
            </div>
          )}
          {/* Tooltip con nombre y créditos */}
          <div className="
            absolute left-14 bottom-0 px-3 py-2 bg-[#1A1A1A] rounded-[8px]
            opacity-0 group-hover:opacity-100 pointer-events-none
            transition-opacity duration-150 z-50 whitespace-nowrap
          ">
            <p className="text-white text-xs font-medium">{displayName}</p>
            <p className="text-[#9CA3AF] text-[10px] mt-0.5 flex items-center gap-1">
              <Lightning className="w-3 h-3 text-[#7C3AED]" />
              {credits.balance.toLocaleString()} créditos
            </p>
          </div>
        </div>

        <Link
          href="/settings"
          title="Ajustes"
          className="w-11 h-11 flex items-center justify-center rounded-[10px] text-[#6B7280] hover:bg-[#1A1A1A] hover:text-white transition-all duration-150"
        >
          <GearSix className="w-5 h-5" />
        </Link>

        <button
          onClick={handleLogout}
          title="Cerrar sesión"
          className="w-11 h-11 flex items-center justify-center rounded-[10px] text-[#6B7280] hover:bg-[#1A1A1A] hover:text-red-400 transition-all duration-150"
        >
          <SignOut className="w-5 h-5" />
        </button>
      </div>
    </aside>
  )
}
