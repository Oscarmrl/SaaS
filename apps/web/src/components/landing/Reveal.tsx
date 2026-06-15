'use client'

import { useEffect, useRef, useState, type ElementType, type ReactNode } from 'react'

interface RevealProps {
  children: ReactNode
  /** Stagger delay in ms applied via CSS variable */
  delay?: number
  /** scale-in variant for hero / featured blocks */
  scale?: boolean
  /** Render as a different element (default div) */
  as?: ElementType
  className?: string
}

/**
 * Scroll-triggered reveal. Adds `.is-visible` once the element enters the
 * viewport. Motion itself lives in globals.css (.reveal / .reveal-scale) so
 * `prefers-reduced-motion` is honoured centrally.
 */
export function Reveal({ children, delay = 0, scale = false, as, className = '' }: RevealProps) {
  const Tag = (as ?? 'div') as ElementType
  const ref = useRef<HTMLElement | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          io.disconnect()
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -8% 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <Tag
      ref={ref}
      className={`${scale ? 'reveal-scale' : 'reveal'} ${visible ? 'is-visible' : ''} ${className}`}
      style={{ ['--reveal-delay' as string]: `${delay}ms` }}
    >
      {children}
    </Tag>
  )
}
