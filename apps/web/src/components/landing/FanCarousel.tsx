'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

const CARDS = [
  { src: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=320&h=400&fit=crop&crop=center', label: 'Café Ámbar' },
  { src: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=320&h=400&fit=crop&crop=center',    label: 'Urban Shoes' },
  { src: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=320&h=400&fit=crop&crop=center', label: 'Glow Beauty' },
  { src: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=320&h=400&fit=crop&crop=center', label: 'Burger House' },
  { src: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=320&h=400&fit=crop&crop=center', label: 'Time Luxe' },
  { src: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=320&h=400&fit=crop&crop=center', label: 'StyleMax' },
  { src: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=320&h=400&fit=crop&crop=center', label: 'Sabor Rico' },
  { src: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=320&h=400&fit=crop&crop=center',    label: 'Sole Co.' },
]

function slotProps(slot: number, isMobile: boolean) {
  const spread = isMobile ? 72 : 92
  const startLeft = isMobile ? 2 : -6

  if (slot <= 0) return { left: -22, rot: -18, y: 55, scale: 0.60, opacity: 0, z: 0 }
  if (slot >= 7) return { left: 102, rot:  18, y: 55, scale: 0.60, opacity: 0, z: 0 }

  const t   = (slot - 1) / 5
  const abs = Math.abs(t - 0.5) * 2

  return {
    left:    startLeft + t * spread,
    rot:     -14 + t * 28,
    y:       abs * abs * 30,
    scale:   1 - abs * 0.09,
    opacity: 1,
    z:       slot === 3 || slot === 4 ? 10 : Math.round(8 - abs * 6),
  }
}

export function FanCarousel() {
  const refs    = useRef<(HTMLDivElement | null)[]>([])
  const slots   = useRef<number[]>(Array.from({ length: 8 }, (_, i) => i))
  const nextImg = useRef(CARDS.length - 1)
  const busy    = useRef(false)

  useEffect(() => {
    const isMobile = window.innerWidth < 640

    refs.current.forEach((el, i) => {
      if (!el) return
      const p = slotProps(slots.current[i], isMobile)
      gsap.set(el, {
        left:            `${p.left}%`,
        rotation:        p.rot,
        y:               p.y,
        scale:           p.scale,
        opacity:         p.opacity,
        zIndex:          p.z,
        transformOrigin: 'bottom center',
      })
    })

    function cycle() {
      if (busy.current) return
      busy.current = true
      const isMob = window.innerWidth < 640

      const tl = gsap.timeline({
        defaults: { duration: 0.85, ease: 'power3.inOut' },
        onComplete() {
          refs.current.forEach((el, i) => {
            if (slots.current[i] !== -1) return
            nextImg.current = (nextImg.current + 1) % CARDS.length
            const img   = el?.querySelector('img')
            const label = el?.querySelector('[data-label]') as HTMLElement | null
            if (img)   img.src           = CARDS[nextImg.current].src
            if (label) label.textContent = CARDS[nextImg.current].label
            slots.current[i] = 7
            const p = slotProps(7, isMob)
            gsap.set(el, { left: `${p.left}%`, rotation: p.rot, y: p.y, scale: p.scale, opacity: 0, zIndex: 0 })
          })
          busy.current = false
        },
      })

      refs.current.forEach((el, i) => {
        if (!el) return
        const cur = slots.current[i]

        if (cur === 0) {
          tl.to(el, { left: '-24%', rotation: -20, y: 65, scale: 0.5, opacity: 0, duration: 0.7, ease: 'power2.in' }, 0)
          slots.current[i] = -1
        } else if (cur === 7) {
          const p = slotProps(6, isMob)
          tl.to(el, { left: `${p.left}%`, rotation: p.rot, y: p.y, scale: p.scale, opacity: 1, zIndex: p.z }, 0)
          slots.current[i] = 6
        } else {
          const next = cur - 1
          const p    = slotProps(next, isMob)
          tl.to(el, { left: `${p.left}%`, rotation: p.rot, y: p.y, scale: p.scale, opacity: p.opacity, zIndex: p.z }, 0)
          slots.current[i] = next
        }
      })
    }

    const id = setInterval(cycle, 2600)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="relative w-full h-[180px] sm:h-[270px] lg:h-[340px] overflow-visible">
      {CARDS.map((card, i) => (
        <div
          key={i}
          ref={el => { refs.current[i] = el }}
          className="absolute bottom-0 w-[72px] sm:w-[140px] lg:w-[190px] h-[105px] sm:h-[200px] lg:h-[265px] rounded-[10px] sm:rounded-[16px] lg:rounded-[18px] overflow-hidden shadow-lg sm:shadow-2xl"
          style={{ transformOrigin: 'bottom center', willChange: 'transform' }}
        >
          <img
            src={card.src}
            alt={card.label}
            className="w-full h-full object-cover pointer-events-none"
            draggable={false}
          />
          <div className="absolute bottom-0 inset-x-0 h-10 bg-gradient-to-t from-black/70 to-transparent" />
          <p
            data-label
            className="absolute bottom-1.5 left-0 right-0 text-center text-white text-[8px] sm:text-[11px] font-semibold tracking-wide px-1"
          >
            {card.label}
          </p>
        </div>
      ))}
    </div>
  )
}