/** @type {import('next').NextConfig} */
const config = {
  // 'standalone' solo para producción (Railway/Docker)
  // En desarrollo no se usa para evitar el error "Missing ActionQueueContext"
  ...(process.env.NODE_ENV === 'production' && { output: 'standalone' }),
  transpilePackages: ['@brandai/shared', '@phosphor-icons/react'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.r2.dev' },
      { protocol: 'https', hostname: '**.supabase.co' },
      { protocol: 'https', hostname: 'replicate.delivery' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
    ],
  },
}

module.exports = config
