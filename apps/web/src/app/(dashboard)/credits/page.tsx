'use client'

import { useEffect, useState } from 'react'
import { Lightning, CheckCircle, ArrowUpRight, ArrowDownLeft, Clock } from '@phosphor-icons/react'
import { api } from '@/lib/api-client'
import { CREDIT_PACKS } from '@brandai/shared'

interface CreditAccount {
  balance:         number
  lifetimeCredits: number
}

interface Transaction {
  id:          string
  amount:      number
  type:        'PURCHASE' | 'SPEND' | 'REFUND' | 'BONUS'
  description: string
  createdAt:   string
}

interface TransactionPage {
  data:     Transaction[]
  total:    number
  page:     number
  pageSize: number
}

type Pack = 'SEED' | 'BUSINESS' | 'PRO' | 'AGENCY'

const PACK_DETAILS: Record<Pack, { label: string; popular?: boolean; features: string[] }> = {
  SEED:     { label: 'Seed',     features: ['80 créditos',  '8 imágenes',   '26 banners',   '26 captions'] },
  BUSINESS: { label: 'Business', popular: true, features: ['220 créditos', '22 imágenes',  '27 banners',   '73 captions'] },
  PRO:      { label: 'Pro',      features: ['500 créditos', '50 imágenes',  '62 banners',   '166 captions'] },
  AGENCY:   { label: 'Agency',   features: ['1300 créditos','130 imágenes', '162 banners',  '433 captions'] },
}

function TransactionIcon({ type }: { type: Transaction['type'] }) {
  if (type === 'PURCHASE' || type === 'BONUS' || type === 'REFUND') {
    return <ArrowUpRight className="w-3.5 h-3.5 text-[#10B981]" />
  }
  return <ArrowDownLeft className="w-3.5 h-3.5 text-[#6B7280]" />
}

export default function CreditsPage() {
  const [account,      setAccount]      = useState<CreditAccount | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loadingAcct,  setLoadingAcct]  = useState(true)
  const [buying,       setBuying]       = useState<Pack | null>(null)

  useEffect(() => {
    api.get<CreditAccount>('/credits/balance')
      .then(setAccount)
      .finally(() => setLoadingAcct(false))

    api.get<TransactionPage>('/credits/history')
      .then(res => setTransactions(res.data))
      .catch(() => {})
  }, [])

  async function handleBuy(pack: Pack) {
    setBuying(pack)
    try {
      // Creates a pending PayPal order
      const order = await api.post<{ orderId: string; approvalUrl: string }>(
        '/credits/prepare-order',
        { pack }
      )
      // Redirect to PayPal approval page
      window.location.href = order.approvalUrl
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al iniciar el pago')
    } finally {
      setBuying(null)
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#0A0A0A]">Créditos</h1>
        <p className="text-sm text-[#6B7280] mt-1">Compra créditos para generar contenido con IA</p>
      </div>

      {/* Balance card */}
      <div className="card-featured p-6 mb-8 flex items-center justify-between">
        <div>
          <p className="text-[#9CA3AF] text-xs mb-1">Créditos disponibles</p>
          {loadingAcct
            ? <div className="h-10 w-32 skeleton rounded" />
            : <p className="text-4xl font-bold text-white">{account?.balance ?? 0}</p>
          }
          <p className="text-[#9CA3AF] text-xs mt-1">
            {account?.lifetimeCredits ?? 0} créditos comprados en total
          </p>
        </div>
        <div className="w-14 h-14 rounded-full bg-[#7C3AED]/30 flex items-center justify-center">
          <Lightning className="w-7 h-7 text-[#7C3AED]" />
        </div>
      </div>

      {/* Packs */}
      <h2 className="text-base font-semibold text-[#0A0A0A] mb-4">Packs de créditos</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {(Object.entries(CREDIT_PACKS) as [Pack, { credits: number; priceUsd: number }][]).map(([pack, { credits, priceUsd }]) => {
          const detail  = PACK_DETAILS[pack]
          const isBuying = buying === pack

          if (detail.popular) {
            return (
              <div key={pack} className="card-featured flex flex-col gap-4 relative">
                <div className="pill-accent text-[10px] self-start">Popular</div>
                <div>
                  <h3 className="text-lg font-bold text-white">{detail.label}</h3>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-3xl font-bold text-white">${priceUsd}</span>
                    <span className="text-[#9CA3AF] text-xs">USD</span>
                  </div>
                </div>
                <ul className="space-y-1.5 flex-1">
                  {detail.features.map(f => (
                    <li key={f} className="flex items-center gap-2 text-xs text-[#D1D5DB]">
                      <CheckCircle className="w-3.5 h-3.5 text-[#7C3AED] flex-shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => handleBuy(pack)}
                  disabled={isBuying}
                  className="w-full py-2.5 bg-white text-[#0A0A0A] text-xs font-semibold rounded-[8px] hover:bg-[#F8F9FA] transition-all duration-150 disabled:opacity-60"
                >
                  {isBuying ? 'Procesando...' : `Comprar — $${priceUsd} USD`}
                </button>
              </div>
            )
          }

          return (
            <div key={pack} className="card flex flex-col gap-4">
              <div>
                <h3 className="text-base font-semibold text-[#0A0A0A]">{detail.label}</h3>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-3xl font-bold text-[#0A0A0A]">${priceUsd}</span>
                  <span className="text-[#6B7280] text-xs">USD</span>
                </div>
              </div>
              <ul className="space-y-1.5 flex-1">
                {detail.features.map(f => (
                  <li key={f} className="flex items-center gap-2 text-xs text-[#6B7280]">
                    <CheckCircle className="w-3.5 h-3.5 text-[#10B981] flex-shrink-0" /> {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handleBuy(pack)}
                disabled={isBuying}
                className="btn-primary text-xs py-2 w-full disabled:opacity-60"
              >
                {isBuying ? 'Procesando...' : `Comprar — $${priceUsd} USD`}
              </button>
            </div>
          )
        })}
      </div>

      {/* Transaction history */}
      <div className="card">
        <h2 className="text-sm font-semibold text-[#0A0A0A] mb-4">Historial de créditos</h2>

        {transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <Clock className="w-7 h-7 text-[#9CA3AF] mb-2" />
            <p className="text-xs text-[#6B7280]">Sin transacciones todavía</p>
          </div>
        ) : (
          <div className="divide-y divide-[#E5E7EB]">
            {transactions.map(tx => (
              <div key={tx.id} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center
                    ${tx.amount > 0 ? 'bg-green-50' : 'bg-[#F1F3F5]'}`}>
                    <TransactionIcon type={tx.type} />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-[#0A0A0A]">{tx.description}</p>
                    <p className="text-[10px] text-[#9CA3AF]">
                      {new Date(tx.createdAt).toLocaleDateString('es-MX', {
                        day: '2-digit', month: 'short', year: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
                <span className={`text-sm font-semibold ${tx.amount > 0 ? 'text-[#10B981]' : 'text-[#0A0A0A]'}`}>
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
