'use client'

import { useEffect, useState } from 'react'
import { IconBolt, IconCircleCheck, IconArrowUpRight, IconArrowDownLeft, IconClock } from '@tabler/icons-react'
import { api } from '@/lib/api-client'
import { CREDIT_PACKS } from '@brandai/shared'

interface CreditAccount { balance: number; lifetimeCredits: number }
interface Transaction {
  id: string; amount: number; type: 'PURCHASE' | 'SPEND' | 'REFUND' | 'BONUS'
  description: string; createdAt: string
}
interface TransactionPage { data: Transaction[]; total: number; page: number; pageSize: number }
type Pack = 'SEED' | 'BUSINESS' | 'PRO' | 'AGENCY'

const PACK_DETAILS: Record<Pack, { label: string; popular?: boolean; features: string[] }> = {
  SEED:     { label: 'Semilla',  features: ['100 créditos',  '20 imágenes',  '25 banners',  '50 captions'] },
  BUSINESS: { label: 'Negocio',  popular: true, features: ['250 créditos', '50 imágenes',  '62 banners',  '125 captions'] },
  PRO:      { label: 'Pro',      features: ['600 créditos',  '120 imágenes', '150 banners', '300 captions'] },
  AGENCY:   { label: 'Agencia',  features: ['1600 créditos', '320 imágenes', '400 banners', '800 captions'] },
}

export default function CreditsPage() {
  const [account,      setAccount]      = useState<CreditAccount | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loadingAcct,  setLoadingAcct]  = useState(true)
  const [buying,       setBuying]       = useState<Pack | null>(null)

  useEffect(() => {
    api.get<CreditAccount>('/credits/balance').then(setAccount).finally(() => setLoadingAcct(false))
    api.get<TransactionPage>('/credits/history').then(res => setTransactions(res.data)).catch(() => {})
  }, [])

  async function handleBuy(pack: Pack) {
    setBuying(pack)
    try {
      const order = await api.post<{ orderId: string; approvalUrl: string }>('/credits/prepare-order', { pack })
      window.location.href = order.approvalUrl
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al iniciar el pago')
    } finally { setBuying(null) }
  }

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Créditos</h1>
          <p className="page-subtitle">Compra créditos para generar contenido con IA</p>
        </div>
      </div>

      {/* Balance */}
      <div data-tour="credits-balance" className="card mb-7 p-6 flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="section-label mb-2">Créditos disponibles</p>
          {loadingAcct
            ? <div className="h-10 w-32 skeleton rounded" />
            : <p className="text-3xl sm:text-4xl font-bold text-[#09090B] tracking-tight tabular-nums">{account?.balance ?? 0}</p>
          }
          <p className="text-xs text-[#71717A] mt-1">{account?.lifetimeCredits ?? 0} créditos comprados en total</p>
        </div>
        <div className="w-12 h-12 rounded-full bg-[#F4F4F5] flex items-center justify-center flex-shrink-0">
          <IconBolt size={22} stroke={1.6} className="text-[#09090B]" />
        </div>
      </div>

      {/* Packs */}
      <p className="text-xs font-semibold text-[#3F3F46] uppercase tracking-wide mb-4">Packs de créditos</p>
      <div data-tour="credits-packs" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        {(Object.entries(CREDIT_PACKS) as [Pack, { credits: number; priceUsd: number }][]).map(([pack, { credits, priceUsd }]) => {
          const detail   = PACK_DETAILS[pack]
          const isBuying = buying === pack

          return (
            <div key={pack} className={`relative flex flex-col gap-4 p-5 rounded-[12px] border transition-all ${
              detail.popular ? 'card-featured' : 'border-[#E4E4E7] bg-white hover:border-[#D4D4D8]'
            }`}>
              {detail.popular && (
                <span className="absolute -top-2.5 right-4 bg-white text-[#09090B] text-[9px] font-bold px-2.5 py-0.5 rounded-full tracking-widest uppercase">
                  Popular
                </span>
              )}

              <div>
                <h3 className={`font-bold text-lg tracking-tight ${detail.popular ? 'text-white' : 'text-[#09090B]'}`}>{detail.label}</h3>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className={`text-3xl font-bold tracking-tight ${detail.popular ? 'text-white' : 'text-[#09090B]'}`}>${priceUsd}</span>
                  <span className={`text-xs ${detail.popular ? 'text-[#52525B]' : 'text-[#71717A]'}`}>USD</span>
                </div>
              </div>

              <ul className="space-y-1.5 flex-1">
                {detail.features.map(f => (
                  <li key={f} className="flex items-center gap-2 text-xs">
                    <IconCircleCheck size={13} stroke={1.8} className={detail.popular ? 'text-[#71717A]' : 'text-[#09090B]'} />
                    <span className={detail.popular ? 'text-[#52525B]' : 'text-[#71717A]'}>{f}</span>
                  </li>
                ))}
              </ul>

              <button onClick={() => handleBuy(pack)} disabled={isBuying}
                className={`w-full py-2.5 text-xs font-semibold rounded-[8px] transition-colors disabled:opacity-60 ${
                  detail.popular ? 'bg-white text-[#09090B] hover:bg-[#F4F4F5]' : 'btn-primary'
                }`}>
                {isBuying ? 'Procesando...' : `Comprar — $${priceUsd} USD`}
              </button>
            </div>
          )
        })}
      </div>

      {/* History */}
      <div data-tour="credits-history" className="card">
        <p className="text-xs font-semibold text-[#3F3F46] uppercase tracking-wide mb-5">Historial</p>

        {transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center gap-2">
            <IconClock size={22} stroke={1.5} className="text-[#A1A1AA]" />
            <p className="text-xs text-[#71717A]">Sin transacciones todavía</p>
          </div>
        ) : (
          <div className="divide-y divide-[#F4F4F5]">
            {transactions.map(tx => (
              <div key={tx.id} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center ${tx.amount > 0 ? 'bg-[#F0FDF4]' : 'bg-[#F4F4F5]'}`}>
                    {tx.amount > 0
                      ? <IconArrowUpRight size={14} stroke={2} className="text-[#16A34A]" />
                      : <IconArrowDownLeft size={14} stroke={2} className="text-[#71717A]" />
                    }
                  </div>
                  <div>
                    <p className="text-xs font-medium text-[#09090B]">{tx.description}</p>
                    <p className="text-[10px] text-[#A1A1AA] mt-0.5">
                      {new Date(tx.createdAt).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                </div>
                <span className={`text-sm font-semibold tabular-nums ${tx.amount > 0 ? 'text-[#16A34A]' : 'text-[#09090B]'}`}>
                  {tx.amount > 0 ? '+' : ''}{tx.amount}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
