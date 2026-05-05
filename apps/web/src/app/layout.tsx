import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title:       'BrandAI — Publicidad con IA para tu negocio',
  description: 'Genera imágenes, banners y videos publicitarios con IA en segundos. Diseñado para negocios pequeños en Latinoamérica.',
  keywords:    ['publicidad', 'IA', 'marketing', 'redes sociales', 'latinoamerica', 'pequeños negocios'],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  )
}
