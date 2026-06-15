'use client'

import { useEffect, useRef, useState } from 'react'
import {
  IconUsers, IconCurrencyDollar, IconCoins, IconPhoto, IconPalette,
  IconShieldLock, IconBan, IconTrendingUp, IconLoader2, IconArrowUpRight,
  IconSparkles, IconChartPie,
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
  COMPLETED:  { label: 'Completados', color: '#10B981' },
  PROCESSING: { label: 'Procesando',  color: '#3B82F6' },
  PENDING:    { label: 'Pendientes',  color: '#F59E0B' },
  FAILED:     { label: 'Fallidos',    color: '#EF4444' },
}

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

/* ── Count-up number ─────────────────────────────────────── */
function useCountUp(target: number, duration = 1000): number {
  const [val, setVal] = useState(0)
  useEffect(() => {
    if (prefersReducedMotion()) { setVal(target); return }
    let raf = 0
    const start = performance.now()
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - t, 3) // easeOutCubic
      setVal(target * eased)
      if (t < 1) raf = requestAnimationFrame(tick)
      else setVal(target)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, duration])
  return val
}

function Num({ value, money, className }: { value: number; money?: boolean; className?: string }) {
  const v = useCountUp(value)
  const text = money
    ? `$${v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : Math.round(v).toLocaleString('es')
  return <span className={`tabular-nums ${className ?? ''}`}>{text}</span>
}

/* ── Multi-segment donut (SVG) ───────────────────────────── */
function Donut({ segments, centerTop, centerValue, centerSub }: {
  segments: { value: number; color: string }[]
  centerTop: string
  centerValue: string
  centerSub: string
}) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { const id = requestAnimationFrame(() => setMounted(true)); return () => cancelAnimationFrame(id) }, [])

  const total = segments.reduce((s, x) => s + x.value, 0) || 1
  const r = 54
  const C = 2 * Math.PI * r
  let acc = 0

  return (
    <div className="relative mx-auto h-[150px] w-[150px]">
      <svg viewBox="0 0 140 140" className="h-full w-full -rotate-90">
        <circle cx="70" cy="70" r={r} fill="none" stroke="#F1F1F4" strokeWidth="13" />
        {segments.map((seg, i) => {
          const segLen = (seg.value / total) * C
          const offset = -acc
          acc += segLen
          return (
            <circle
              key={i}
              cx="70" cy="70" r={r} fill="none"
              stroke={seg.color} strokeWidth="13" strokeLinecap="round"
              strokeDasharray={mounted ? `${Math.max(segLen - 2, 0)} ${C}` : `0 ${C}`}
              strokeDashoffset={offset}
              style={{ transition: 'stroke-dasharray 1s cubic-bezier(0.16,1,0.3,1)', transitionDelay: `${i * 90}ms` }}
            />
          )
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-[9px] font-bold uppercase tracking-[0.12em] text-[#A1A1AA]">{centerTop}</span>
        <span className="text-3xl font-extrabold tracking-tight text-[#09090B] tabular-nums">{centerValue}</span>
        <span className="text-[10px] text-[#71717A]">{centerSub}</span>
      </div>
    </div>
  )
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [animate, setAnimate] = useState(false)

  useEffect(() => {
    api.get<Stats>('/admin/stats')
      .then(setStats)
      .catch((e) => setError(e instanceof Error ? e.message : 'Error al cargar métricas'))
  }, [])

  useEffect(() => {
    if (!stats) return
    const id = requestAnimationFrame(() => setAnimate(true))
    return () => cancelAnimationFrame(id)
  }, [stats])

  if (error) return <p className="text-sm text-red-500">{error}</p>

  if (!stats) {
    return (
      <div className="flex justify-center py-20">
        <IconLoader2 size={24} className="text-[#A1A1AA] animate-spin" />
      </div>
    )
  }

  const totalJobs   = stats.jobs.PENDING + stats.jobs.PROCESSING + stats.jobs.COMPLETED + stats.jobs.FAILED
  const successRate = totalJobs > 0 ? Math.round((stats.jobs.COMPLETED / totalJobs) * 100) : 0
  const failRate    = totalJobs > 0 ? Math.round((stats.jobs.FAILED / totalJobs) * 100) : 0

  const creditDenom   = Math.max(stats.credits.lifetimeIssued, stats.credits.totalSpent + stats.credits.outstandingBalance, 1)
  const spentPct      = Math.round((stats.credits.totalSpent / creditDenom) * 100)
  const outstandingPct = Math.round((stats.credits.outstandingBalance / creditDenom) * 100)
  const assetsPerBrand = stats.content.brands > 0 ? (stats.content.assets / stats.content.brands).toFixed(1) : '0'

  const e = (ms: number) => ({ ['--enter-delay' as string]: `${ms}ms` })

  return (
    <div className="space-y-4">

      {/* ── Row 1: Ingresos (hero) + Usuarios ── */}
      <div className="grid gap-4 lg:grid-cols-3">

        {/* Ingresos — dark featured */}
        <div
          className="enter relative overflow-hidden rounded-[16px] border border-[#27272A] p-6 sm:p-7 lg:col-span-2"
          style={{ background: 'linear-gradient(155deg,#1C1C20 0%,#09090B 70%)', ...e(0) }}
        >
          <div className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full bg-[#7C3AED]/25 blur-[80px] animate-glow" />
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.06]"
            style={{ backgroundImage: 'radial-gradient(circle at center,#fff 1px,transparent 1px)', backgroundSize: '22px 22px' }}
          />
          <div className="relative">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-[9px] bg-white/10">
                  <IconCurrencyDollar size={16} stroke={1.8} className="text-[#A78BFA]" />
                </div>
                <span className="text-xs font-medium text-[#A1A1AA]">Ingresos totales</span>
              </div>
              <span className="flex items-center gap-1 rounded-full bg-[#10B981]/15 px-2.5 py-1 text-[10px] font-semibold text-[#34D399]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#34D399]" /> En vivo
              </span>
            </div>

            <p className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
              <Num value={stats.revenue.totalUsd} money />
            </p>

            <div className="mt-6 grid grid-cols-3 gap-3 border-t border-white/10 pt-5">
              {[
                { label: 'Pagos completados', value: stats.revenue.completedPayments },
                { label: 'Créditos vendidos',  value: stats.revenue.creditsSold },
                { label: 'Nuevos · 30 días',   value: stats.users.new30d },
              ].map((s) => (
                <div key={s.label}>
                  <p className="text-lg font-bold text-white"><Num value={s.value} /></p>
                  <p className="mt-0.5 text-[10px] uppercase tracking-wide text-[#52525B]">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Usuarios */}
        <div className="enter card !p-6 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md" style={e(90)}>
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-[9px] bg-[#EDE9FE]">
              <IconUsers size={16} stroke={1.8} className="text-[#7C3AED]" />
            </div>
            <span className="text-xs font-medium text-[#71717A]">Usuarios</span>
          </div>

          <div className="flex items-end gap-2">
            <p className="text-4xl font-extrabold tracking-tight text-[#09090B]"><Num value={stats.users.total} /></p>
            {stats.users.new7d > 0 && (
              <span className="mb-1.5 flex items-center gap-0.5 rounded-full bg-[#10B981]/10 px-2 py-0.5 text-[11px] font-semibold text-[#059669]">
                <IconArrowUpRight size={12} stroke={2.2} />+{stats.users.new7d}
              </span>
            )}
          </div>
          <p className="mt-0.5 mb-4 text-[11px] text-[#A1A1AA]">nuevos esta semana</p>

          <div className="grid grid-cols-2 gap-2">
            <MiniStat icon={IconShieldLock} color="#7C3AED" label="Admins" value={stats.users.admins} />
            <MiniStat icon={IconBan} color="#EF4444" label="Suspendidos" value={stats.users.suspended} />
          </div>
        </div>
      </div>

      {/* ── Row 2: Generaciones (donut) + Créditos + Contenido ── */}
      <div className="grid gap-4 lg:grid-cols-3">

        {/* Generaciones — donut */}
        <div className="enter card !p-6 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md" style={e(150)}>
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-[9px] bg-[#F4F4F5]">
                <IconChartPie size={16} stroke={1.8} className="text-[#3F3F46]" />
              </div>
              <span className="text-xs font-medium text-[#71717A]">Generaciones</span>
            </div>
            <span className="text-[11px] font-semibold text-[#A1A1AA]"><Num value={totalJobs} /> total</span>
          </div>

          <Donut
            segments={(Object.keys(JOB_META) as (keyof Stats['jobs'])[]).map((k) => ({ value: stats.jobs[k], color: JOB_META[k].color }))}
            centerTop="Éxito"
            centerValue={`${successRate}%`}
            centerSub={failRate > 0 ? `${failRate}% fallidos` : 'sin fallos'}
          />

          <div className="mt-4 grid grid-cols-2 gap-x-3 gap-y-2">
            {(Object.keys(JOB_META) as (keyof Stats['jobs'])[]).map((k) => (
              <div key={k} className="flex items-center gap-1.5">
                <span className="h-2 w-2 flex-shrink-0 rounded-full" style={{ background: JOB_META[k].color }} />
                <span className="text-[11px] text-[#71717A]">{JOB_META[k].label}</span>
                <span className="ml-auto text-[11px] font-semibold text-[#09090B] tabular-nums">{stats.jobs[k].toLocaleString('es')}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Créditos — flow bar */}
        <div className="enter card !p-6 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md" style={e(210)}>
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-[9px] bg-[#F4F4F5]">
              <IconCoins size={16} stroke={1.8} className="text-[#3F3F46]" />
            </div>
            <span className="text-xs font-medium text-[#71717A]">Créditos</span>
          </div>

          <p className="text-xs text-[#A1A1AA]">Emitidos (histórico)</p>
          <p className="mb-4 text-3xl font-extrabold tracking-tight text-[#09090B]"><Num value={stats.credits.lifetimeIssued} /></p>

          {/* stacked flow bar */}
          <div className="mb-3 flex h-2.5 w-full overflow-hidden rounded-full bg-[#F1F1F4]">
            <div
              className="h-full bg-[#7C3AED]"
              style={{ width: animate ? `${spentPct}%` : '0%', transition: 'width 1s cubic-bezier(0.16,1,0.3,1)', transitionDelay: '250ms' }}
            />
            <div
              className="h-full bg-[#D4D4D8]"
              style={{ width: animate ? `${outstandingPct}%` : '0%', transition: 'width 1s cubic-bezier(0.16,1,0.3,1)', transitionDelay: '380ms' }}
            />
          </div>

          <div className="space-y-2">
            <FlowRow color="#7C3AED" label="Consumidos" value={stats.credits.totalSpent} pct={spentPct} />
            <FlowRow color="#D4D4D8" label="En circulación" value={stats.credits.outstandingBalance} pct={outstandingPct} />
          </div>
        </div>

        {/* Contenido */}
        <div className="enter card !p-6 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md" style={e(270)}>
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-[9px] bg-[#F4F4F5]">
              <IconSparkles size={16} stroke={1.8} className="text-[#3F3F46]" />
            </div>
            <span className="text-xs font-medium text-[#71717A]">Contenido</span>
          </div>

          <div className="space-y-3">
            <BigTile icon={IconPhoto} label="Assets generados" value={stats.content.assets} accent="#09090B" />
            <BigTile icon={IconPalette} label="Marcas creadas" value={stats.content.brands} accent="#7C3AED" />
          </div>

          <div className="mt-4 flex items-center gap-2 rounded-[10px] bg-[#FAFAFA] px-3 py-2.5">
            <IconTrendingUp size={14} stroke={1.8} className="text-[#7C3AED]" />
            <span className="text-[11px] text-[#71717A]">Promedio</span>
            <span className="ml-auto text-sm font-bold text-[#09090B] tabular-nums">{assetsPerBrand}</span>
            <span className="text-[11px] text-[#A1A1AA]">assets/marca</span>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Small building blocks ───────────────────────────────── */
function MiniStat({ icon: Icon, color, label, value }: {
  icon: React.ElementType; color: string; label: string; value: number
}) {
  return (
    <div className="rounded-[10px] bg-[#FAFAFA] px-3 py-2.5">
      <div className="mb-1 flex items-center gap-1.5">
        <Icon size={13} stroke={1.8} style={{ color }} />
        <span className="text-[10px] text-[#71717A]">{label}</span>
      </div>
      <p className="text-lg font-bold text-[#09090B] tabular-nums">{value.toLocaleString('es')}</p>
    </div>
  )
}

function FlowRow({ color, label, value, pct }: { color: string; label: string; value: number; pct: number }) {
  return (
    <div className="flex items-center gap-2">
      <span className="h-2 w-2 flex-shrink-0 rounded-full" style={{ background: color }} />
      <span className="text-[11px] text-[#71717A]">{label}</span>
      <span className="ml-auto text-[11px] font-semibold text-[#09090B] tabular-nums">{value.toLocaleString('es')}</span>
      <span className="w-9 text-right text-[10px] text-[#A1A1AA] tabular-nums">{pct}%</span>
    </div>
  )
}

function BigTile({ icon: Icon, label, value, accent }: {
  icon: React.ElementType; label: string; value: number; accent: string
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[10px]" style={{ background: `${accent}14` }}>
        <Icon size={18} stroke={1.7} style={{ color: accent }} />
      </div>
      <div className="min-w-0">
        <p className="text-xl font-extrabold tracking-tight text-[#09090B]"><Num value={value} /></p>
        <p className="text-[11px] text-[#A1A1AA]">{label}</p>
      </div>
    </div>
  )
}
