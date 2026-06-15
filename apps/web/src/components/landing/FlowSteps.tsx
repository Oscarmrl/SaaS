'use client'

import {
  IconUpload, IconSparkles, IconCheck, IconPhoto,
  IconBrandInstagram, IconBrandWhatsapp, IconBrandTiktok, IconDownload,
} from '@tabler/icons-react'
import type { ReactNode } from 'react'
import { Reveal } from './Reveal'

/* ── tiny browser chrome wrapper for every mockup ── */
function Window({ children }: { children: ReactNode }) {
  return (
    <div className="w-full overflow-hidden rounded-[12px] border border-[#E4E4E7] bg-white shadow-sm">
      <div className="flex items-center gap-1.5 border-b border-[#F1F1F4] bg-[#FAFAFA] px-3 py-2">
        <span className="h-2 w-2 rounded-full bg-[#E4E4E7]" />
        <span className="h-2 w-2 rounded-full bg-[#E4E4E7]" />
        <span className="h-2 w-2 rounded-full bg-[#E4E4E7]" />
      </div>
      <div className="p-3.5">{children}</div>
    </div>
  )
}

const STEPS: { n: string; title: string; mock: ReactNode }[] = [
  {
    n: '01',
    title: 'Creá tu marca',
    mock: (
      <Window>
        <div className="flex h-[88px] flex-col gap-2.5">
          <div className="flex items-center justify-center gap-2 rounded-[8px] border border-dashed border-[#D4D4D8] bg-[#FAFAFA] py-3">
            <IconUpload size={15} stroke={1.8} className="text-[#A1A1AA]" />
            <span className="text-[10px] font-medium text-[#A1A1AA]">Subí tu logo</span>
          </div>
          <div className="flex items-center gap-1.5">
            {['#7C3AED', '#09090B', '#F59E0B', '#10B981'].map(c => (
              <span key={c} className="h-4 w-4 rounded-full border border-black/5" style={{ background: c }} />
            ))}
            <span className="ml-auto text-[9px] font-semibold text-[#A1A1AA]">Paleta</span>
          </div>
        </div>
      </Window>
    ),
  },
  {
    n: '02',
    title: 'Describí el contenido',
    mock: (
      <Window>
        <div className="flex h-[88px] flex-col gap-2.5">
          <div className="flex items-center rounded-[8px] border border-[#E4E4E7] bg-[#FAFAFA] px-2.5 py-2">
            <span className="text-[10px] text-[#3F3F46]">Foto de mi café latte</span>
            <span className="caret ml-0.5 inline-block h-3 w-px bg-[#7C3AED]" />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {['Imagen', 'Banner', 'Video'].map((t, i) => (
              <span
                key={t}
                className={`rounded-full px-2 py-0.5 text-[9px] font-semibold ${
                  i === 0 ? 'bg-[#EDE9FE] text-[#7C3AED]' : 'bg-[#F4F4F5] text-[#71717A]'
                }`}
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </Window>
    ),
  },
  {
    n: '03',
    title: 'La IA genera',
    mock: (
      <Window>
        <div className="relative flex h-[88px] flex-col gap-2">
          <div className="grid grid-cols-2 gap-1.5">
            {[0, 1, 2, 3].map(i => (
              <div key={i} className="skeleton h-[34px] w-full" style={{ animationDelay: `${i * 160}ms` }} />
            ))}
          </div>
          <div className="badge-3d absolute -right-1 -top-1 h-7 w-7 animate-float-lg">
            <IconSparkles size={13} />
          </div>
        </div>
      </Window>
    ),
  },
  {
    n: '04',
    title: 'Descargá y publicá',
    mock: (
      <Window>
        <div className="flex h-[88px] flex-col justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#10B981]/12">
              <IconCheck size={14} stroke={2.4} className="text-[#10B981]" />
            </span>
            <div className="flex-1">
              <div className="h-1.5 w-3/4 rounded-full bg-[#E4E4E7]" />
              <div className="mt-1 h-1.5 w-1/2 rounded-full bg-[#F1F1F4]" />
            </div>
            <IconDownload size={15} stroke={1.8} className="text-[#3F3F46]" />
          </div>
          <div className="flex items-center gap-2">
            {[IconBrandInstagram, IconBrandWhatsapp, IconBrandTiktok, IconPhoto].map((Ic, i) => (
              <span key={i} className="flex h-6 w-6 items-center justify-center rounded-[7px] bg-[#F4F4F5]">
                <Ic size={13} stroke={1.7} className="text-[#3F3F46]" />
              </span>
            ))}
          </div>
        </div>
      </Window>
    ),
  },
]

export function FlowSteps() {
  return (
    <div className="relative">
      {/* animated connector — desktop only, sits behind the cards */}
      <svg
        className="pointer-events-none absolute inset-x-0 top-[58px] hidden h-24 w-full lg:block"
        viewBox="0 0 1200 240"
        preserveAspectRatio="none"
        aria-hidden
      >
        {/* faint base track */}
        <path
          d="M40 120 C 220 30, 360 30, 460 120 S 720 210, 800 120 S 1040 30, 1160 120"
          fill="none"
          stroke="#E4E4E7"
          strokeWidth="2"
          strokeDasharray="7 11"
          strokeLinecap="round"
        />
        {/* flowing accent */}
        <path
          className="flow-line"
          d="M40 120 C 220 30, 360 30, 460 120 S 720 210, 800 120 S 1040 30, 1160 120"
          fill="none"
          stroke="#7C3AED"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>

      <div className="relative grid grid-cols-1 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-x-6">
        {STEPS.map(({ n, title, mock }, i) => (
          <Reveal key={n} delay={i * 130} className="relative flex flex-col items-center">
            {/* vertical connector — phones (single column) only */}
            {i < STEPS.length - 1 && (
              <span className="absolute left-1/2 top-full hidden h-10 w-px -translate-x-1/2 border-l border-dashed border-[#D4D4D8] max-sm:block" />
            )}
            <div className="w-full max-w-[230px]">{mock}</div>
            <div className="mt-4 flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#09090B] text-[10px] font-bold text-white">
                {n}
              </span>
              <span className="text-sm font-semibold tracking-tight text-[#09090B]">{title}</span>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  )
}
