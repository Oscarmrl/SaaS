'use client'

import { IconBolt } from '@tabler/icons-react'
import Link from 'next/link'

interface CreditBalanceProps {
  balance:         number
  lifetimeCredits: number
}

export function CreditBalance({ balance, lifetimeCredits }: CreditBalanceProps) {
  const pct   = lifetimeCredits > 0 ? Math.min(Math.round((balance / lifetimeCredits) * 100), 100) : 0
  const isLow = balance > 0 && pct < 20

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-[7px] bg-[#F4F4F5] flex items-center justify-center">
            <IconBolt size={15} stroke={2} className="text-[#09090B]" />
          </div>
          <span className="text-xs font-semibold text-[#3F3F46] uppercase tracking-wide">Créditos</span>
        </div>
        <Link href="/credits" className="text-xs font-semibold text-[#09090B] hover:text-[#18181B] transition-colors">
          Comprar
        </Link>
      </div>

      <div className="mb-0.5">
        <span className="text-3xl font-bold text-[#09090B] tracking-tight tabular-nums">
          {balance.toLocaleString()}
        </span>
      </div>
      <p className="text-xs text-[#71717A] mb-4">disponibles</p>

      <div className="w-full h-1 bg-[#F4F4F5] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${pct}%`,
            background: isLow ? '#EF4444' : '#09090B',
          }}
        />
      </div>

      <div className="flex items-center justify-between mt-2">
        <span className="text-[10px] text-[#A1A1AA]">{lifetimeCredits.toLocaleString()} comprados en total</span>
        {isLow && <span className="text-[10px] font-semibold text-red-500">¡Pocos créditos!</span>}
      </div>
    </div>
  )
}
