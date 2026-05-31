import type { Metadata } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import './globals.css'

const jakarta = Plus_Jakarta_Sans({
  subsets:  ['latin'],
  weight:   ['400', '500', '600', '700', '800'],
  variable: '--font-jakarta',
  display:  'swap',
})

export const metadata: Metadata = {
  title:       'BrandAI — Publicidad con IA para tu negocio',
  description: 'Genera imágenes, banners y videos publicitarios con IA en segundos. Diseñado para cualquier negocio, en cualquier parte del mundo.',
  keywords:    ['publicidad', 'IA', 'marketing', 'redes sociales', 'pequeños negocios', 'contenido con IA'],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${jakarta.variable} font-sans antialiased`}>
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 4000,
            style: {
              fontFamily: 'var(--font-jakarta), system-ui, sans-serif',
              fontSize: '13px',
              fontWeight: '500',
              borderRadius: '10px',
              padding: '10px 14px',
              boxShadow: '0 4px 16px rgba(0,0,0,0.10)',
            },
            success: {
              style: { background: '#09090B', color: '#fff' },
              iconTheme: { primary: '#10B981', secondary: '#09090B' },
            },
            error: {
              duration: 5000,
              style: { background: '#fff', color: '#09090B', border: '1px solid #FECACA' },
              iconTheme: { primary: '#EF4444', secondary: '#fff' },
            },
          }}
        />
      </body>
    </html>
  )
}
