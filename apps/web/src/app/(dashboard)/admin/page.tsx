'use client'

import { useEffect, useState } from 'react'
import {
  IconUsers, IconCurrencyDollar, IconCoins, IconPhoto, IconPalette,
  IconShieldLock, IconBan, IconTrendingUp, IconLoader2,
} from '@tabler/icons-react'
import { api } from '@/lib/api-client'

interface Stats {
  users:   { total: number; admins: number; suspended: number; new7d: number; new30d: number }
  revenue: { totalUsd: number; creditsSold: number; completedPayments: number }
  credits: { outstandingBalance: number; lifetimeIssued: number; totalSpent: number }
  content: { brands: number; assets: number }
  jobs:    { PENDING: number; PROCESSING: number; COMPLETED: number; FAILED: number }
}

const JOB_META: Record<keyof Stats['jobs'], { label: string; color: string }> = {
  PENDING:    { label: 'Pendientes',  color: '#F59E0B' },
  PROCESSING: { label: 'Procesando',  color: '#3B82F6' },
  COMPLETED:  { label: 'Completados', color: '#10B981' },
  FAILED:     { label: 'Fallidos',    color: '#EF4444' },
}

function StatCard({ icon: Icon, label, value, sub }: {
  icon: React.ElementType; label: string; value: string | number; sub?: string
}) {
  return (
    <div className="card !p-4 sm:!p-5">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-7 h-7 rounded-[7px] bg-[#F4F4F5] flex items-center justify-center">
          <Icon size={15} stroke={1.8} className="text-[#3F3F46]" />
        </div>
        <p className="text-xs text-[#71717A]">{label}</p>
      </div>
      <p className="text-2xl font-bold text-[#09090B] tracking-tight">{value}</p>
      {sub && <p className="text-[11px] text-[#A1A1AA] mt-0.5">{sub}</p>}
    </div>
  )
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    api.get<Stats>('/admin/stats')
      .then(setStats)
      .catch((e) => setError(e instanceof Error ? e.message : 'Error al cargar métricas'))
  }, [])

  if (error) return <p className="text-sm text-red-500">{error}</p>

  if (!stats) {
    return (
      <div className="flex justify-center py-20">
        <IconLoader2 size={24} className="text-[#A1A1AA] animate-spin" />
      </div>
    )
  }

  const totalJobs = stats.jobs.PENDING + stats.jobs.PROCESSING + stats.jobs.COMPLETED + stats.jobs.FAILED

  return (
    <div className="space-y-6">
      {/* Negocio */}
      <div>
        <h2 className="text-xs font-bold tracking-[0.12em] uppercase text-[#A1A1AA] mb-3">Negocio</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard icon={IconCurrencyDollar} label="Ingresos totales"
            value={`$${stats.revenue.totalUsd.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
            sub={`${stats.revenue.completedPayments} pagos completados`} />
          <StatCard icon={IconCoins} label="Créditos vendidos"
            value={stats.revenue.creditsSold.toLocaleString()} />
          <StatCard icon={IconUsers} label="Usuarios"
            value={stats.users.total.toLocaleString()}
            sub={`+${stats.users.new7d} esta semana`} />
          <StatCard icon={IconTrendingUp} label="Nuevos (30 días)"
            value={stats.users.new30d.toLocaleString()} />
        </div>
      </div>

      {/* Usuarios */}
      <div>
        <h2 className="text-xs font-bold tracking-[0.12em] uppercase text-[#A1A1AA] mb-3">Usuarios</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard icon={IconShieldLock} label="Administradores" value={stats.users.admins} />
          <StatCard icon={IconBan} label="Suspendidos" value={stats.users.suspended} />
          <StatCard icon={IconPalette} label="Marcas creadas" value={stats.content.brands.toLocaleString()} />
          <StatCard icon={IconPhoto} label="Assets generados" value={stats.content.assets.toLocaleString()} />
        </div>
      </div>

      {/* Créditos */}
      <div>
        <h2 className="text-xs font-bold tracking-[0.12em] uppercase text-[#A1A1AA] mb-3">Créditos</h2>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          <StatCard icon={IconCoins} label="Balance en circulación" value={stats.credits.outstandingBalance.toLocaleString()} />
          <StatCard icon={IconCoins} label="Emitidos (histórico)" value={stats.credits.lifetimeIssued.toLocaleString()} />
          <StatCard icon={IconCoins} label="Consumidos" value={stats.credits.totalSpent.toLocaleString()} />
        </div>
      </div>

      {/* Jobs */}
      <div>
        <h2 className="text-xs font-bold tracking-[0.12em] uppercase text-[#A1A1AA] mb-3">
          Generaciones <span className="text-[#D4D4D8] normal-case font-medium tracking-normal">· {totalJobs.toLocaleString()} totales</span>
        </h2>
        <div className="card !p-4 sm:!p-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {(Object.keys(JOB_META) as (keyof Stats['jobs'])[]).map((key) => {
              const count = stats.jobs[key]
              const pct = totalJobs > 0 ? Math.round((count / totalJobs) * 100) : 0
              return (
                <div key={key}>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <span className="w-2 h-2 rounded-full" style={{ background: JOB_META[key].color }} />
                    <span className="text-xs text-[#71717A]">{JOB_META[key].label}</span>
                  </div>
                  <p className="text-xl font-bold text-[#09090B]">{count.toLocaleString()}</p>
                  <div className="mt-1.5 h-1.5 rounded-full bg-[#F4F4F5] overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: JOB_META[key].color }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
