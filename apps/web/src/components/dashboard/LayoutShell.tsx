'use client'

import { useState } from 'react'
import { IconSparkles, IconMenu2 } from '@tabler/icons-react'
import { Sidebar } from './Sidebar'
import { OnboardingTour } from './OnboardingTour'

export function LayoutShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[#FAFAFA]">

      {/* Onboarding tour (client-only, renders its own portal) */}
      <OnboardingTour />

      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="lg:ml-[220px] flex flex-col min-h-screen">

        {/* Mobile top bar */}
        <header className="lg:hidden sticky top-0 z-20 bg-white border-b border-[#E4E4E7] px-4 h-14 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-[7px] bg-[#09090B] flex items-center justify-center">
              <IconSparkles size={14} className="text-white" />
            </div>
            <span className="font-bold text-[#09090B] text-sm tracking-tight">BrandAI</span>
          </div>
          <button
            onClick={() => setSidebarOpen(true)}
            className="w-9 h-9 flex items-center justify-center rounded-[8px] text-[#71717A] hover:bg-[#F4F4F5] transition-colors"
            aria-label="Abrir menú"
          >
            <IconMenu2 size={20} stroke={1.7} />
          </button>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
            {children}
          </div>
        </main>

      </div>
    </div>
  )
}
