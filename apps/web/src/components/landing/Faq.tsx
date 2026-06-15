'use client'

import { useState } from 'react'
import { IconPlus } from '@tabler/icons-react'

const ITEMS = [
  {
    q: '¿Necesito saber de diseño?',
    a: 'No. Cuéntale a BrandAI sobre tu negocio, sube tu logo y la IA se encarga del resto. Generás imágenes, videos y textos listos para publicar sin tocar una herramienta de diseño.',
  },
  {
    q: '¿Cómo funcionan los créditos?',
    a: 'Comprás un pack una sola vez y gastás créditos a tu ritmo. Una imagen cuesta 5 créditos, un caption 2, un video desde 40. Sin suscripciones y sin fecha de expiración.',
  },
  {
    q: '¿La IA respeta los colores de mi marca?',
    a: 'Sí. Analizamos tu logo y tus fotos de referencia para extraer tu paleta, tipografías y estilo, y los aplicamos en cada asset que generás.',
  },
  {
    q: '¿En qué formatos puedo descargar el contenido?',
    a: 'Imágenes y banners optimizados para Instagram, Facebook, WhatsApp y TikTok, y mini-videos verticales con audio listos para subir a historias y reels.',
  },
  {
    q: '¿Tengo que poner una tarjeta para empezar?',
    a: 'No. Te registrás gratis y probás la plataforma. Solo pagás cuando decidas comprar un pack de créditos.',
  },
]

function Item({ q, a, defaultOpen }: { q: string; a: string; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(!!defaultOpen)
  return (
    <div
      className={`rounded-[14px] border bg-white transition-colors duration-200 ${
        open ? 'border-[#D4D4D8] shadow-[0_4px_20px_rgba(0,0,0,0.05)]' : 'border-[#E4E4E7]'
      }`}
    >
      <button
        onClick={() => setOpen(v => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
      >
        <span className="text-sm font-semibold tracking-tight text-[#09090B]">{q}</span>
        <span
          className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full transition-all duration-300 ${
            open ? 'rotate-45 bg-[#09090B] text-white' : 'bg-[#F4F4F5] text-[#71717A]'
          }`}
        >
          <IconPlus size={14} stroke={2.2} />
        </span>
      </button>
      <div className={`faq-body ${open ? 'open' : ''}`}>
        <div>
          <p className="px-5 pb-4 text-sm leading-relaxed text-[#71717A]">{a}</p>
        </div>
      </div>
    </div>
  )
}

export function Faq() {
  return (
    <div className="flex flex-col gap-2.5">
      {ITEMS.map((it, i) => (
        <Item key={it.q} q={it.q} a={it.a} defaultOpen={i === 0} />
      ))}
    </div>
  )
}
