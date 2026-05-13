'use client'

import { Lightning } from '@phosphor-icons/react'
import Link from 'next/link'

interface CreditBalanceProps {
  balance: number
  lifetimeCredits: number
}

export function CreditBalance({ balance, lifetimeCredits }: CreditBalanceProps) {
  const pct = lifetimeCredits > 0 ? Math.min((balance / lifetimeCredits) * 100, 100) : 0

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-[8px] bg-[#EDE9FE] flex items-center justify-center">
            <Lightning className="w-4 h-4 text-[#7C3AED]" />
          </div>
          <span className="text-sm font-semibold text-[#0A0A0A]">Créditos</span>
        </div>
        <Link href="/credits" className="text-xs text-[#7C3AED] font-medium hover:underline">
          Comprar
        </Link>
      </div>

      <div className="text-3xl font-bold text-[#0A0A0A] mb-1">
        {balance.toLocaleString()}
      </div>
      <div className="text-xs text-[#6B7280] mb-3">disponibles</div>

      <div className="w-full h-1.5 bg-[#F1F3F5] rounded-full overflow-hidden">
        <div
          className="h-full bg-[#7C3AED] rounded-full transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="text-xs text-[#9CA3AF] mt-1.5">
        {lifetimeCredits.toLocaleString()} créditos comprados en total
      </div>
    </div>
  )
}
