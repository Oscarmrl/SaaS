'use client'

import { useEffect, useRef, useState } from 'react'
import {
  IconBrandInstagram, IconBrandFacebook, IconBrandWhatsapp, IconBrandTiktok,
  IconBrandYoutube, IconBrandMeta, IconBrandGoogle, IconBrandX,
} from '@tabler/icons-react'
import type { Icon } from '@tabler/icons-react'

/** Coordinate space the orbit is designed in; scaled to fit the container. */
const DESIGN = 440

const INNER: { Icon: Icon; cls: string }[] = [
  { Icon: IconBrandInstagram, cls: 'text-[#E1306C]' },
  { Icon: IconBrandWhatsapp,  cls: 'text-[#25D366]' },
  { Icon: IconBrandFacebook,  cls: 'text-[#1877F2]' },
  { Icon: IconBrandTiktok,    cls: 'text-[#09090B]' },
]

const OUTER: { Icon: Icon; cls: string }[] = [
  { Icon: IconBrandYoutube,   cls: 'text-[#FF0000]' },
  { Icon: IconBrandMeta,      cls: 'text-[#0866FF]' },
  { Icon: IconBrandGoogle,    cls: 'text-[#4285F4]' },
  { Icon: IconBrandX,         cls: 'text-[#09090B]' },
  { Icon: IconBrandInstagram, cls: 'text-[#7C3AED]' },
  { Icon: IconBrandFacebook,  cls: 'text-[#1877F2]' },
]

/**
 * One ring of badges. The wrapping div (in the parent) spins the whole ring;
 * each badge counter-spins at the *same* duration so it stays upright, and the
 * trailing rotate(-angle) cancels the placement rotation.
 */
function Ring({
  items, radius, size, counter, durationSec,
}: {
  items: { Icon: Icon; cls: string }[]
  radius: number
  size: number
  counter: 'animate-orbit' | 'animate-orbit-rev'
  durationSec: number
}) {
  return (
    <>
      {items.map(({ Icon, cls }, i) => {
        const angle = (i / items.length) * 360
        return (
          <div
            key={i}
            className="absolute left-1/2 top-1/2"
            style={{ transform: `rotate(${angle}deg) translateY(-${radius}px) rotate(${-angle}deg)` }}
          >
            <div
              className={`${counter} motion-reduce:animate-none`}
              style={{
                animationDuration: `${durationSec}s`,
                marginLeft: -size / 2,
                marginTop: -size / 2,
              }}
            >
              <div
                className="badge-3d-light flex items-center justify-center transition-transform duration-200 hover:scale-110"
                style={{ width: size, height: size }}
              >
                <Icon size={Math.round(size * 0.46)} stroke={1.6} className={cls} />
              </div>
            </div>
          </div>
        )
      })}
    </>
  )
}

export function OrbitTools() {
  const wrapRef = useRef<HTMLDivElement | null>(null)
  const [scale, setScale] = useState(1)
  const [measured, setMeasured] = useState(false)

  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const update = () => {
      setScale(el.clientWidth / DESIGN)
      setMeasured(true)
    }
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  return (
    <div ref={wrapRef} className="relative mx-auto aspect-square w-full max-w-[440px] select-none">
      {/* fixed-size design box, scaled to fit the container width */}
      <div
        className="absolute left-1/2 top-1/2"
        style={{
          width: DESIGN,
          height: DESIGN,
          transform: `translate(-50%, -50%) scale(${scale})`,
          transformOrigin: 'center',
          opacity: measured ? 1 : 0,
          transition: 'opacity 300ms ease-out',
        }}
      >
        {/* concentric guide rings */}
        <div className="absolute inset-[9%] rounded-full border border-dashed border-[#E4E4E7]" />
        <div className="absolute inset-[32%] rounded-full border border-dashed border-[#ECECEF]" />

        {/* soft glow behind centre */}
        <div className="absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#7C3AED]/10 blur-3xl animate-glow" />

        {/* outer ring — slow clockwise */}
        <div className="absolute inset-0 animate-orbit motion-reduce:animate-none" style={{ animationDuration: '42s' }}>
          <Ring items={OUTER} radius={186} size={48} counter="animate-orbit-rev" durationSec={42} />
        </div>

        {/* inner ring — faster, counter-clockwise */}
        <div className="absolute inset-0 animate-orbit-rev motion-reduce:animate-none" style={{ animationDuration: '28s' }}>
          <Ring items={INNER} radius={112} size={56} counter="animate-orbit" durationSec={28} />
        </div>

        {/* centre label */}
        <div className="absolute left-1/2 top-1/2 w-[200px] -translate-x-1/2 -translate-y-1/2 text-center">
          <p className="mb-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-[#A1A1AA]">
            Multiplataforma
          </p>
          <h3 className="text-2xl font-extrabold leading-tight tracking-tight text-[#09090B]">
            Listo para<br />
            <span className="text-aurora">cada red social</span>
          </h3>
        </div>
      </div>
    </div>
  )
}
