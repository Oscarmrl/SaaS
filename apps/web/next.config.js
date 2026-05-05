/** @type {import('next').NextConfig} */
const config = {
  output: 'standalone',
  transpilePackages: ['@brandai/shared'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.r2.dev' },
      { protocol: 'https', hostname: '**.supabase.co' },
      { protocol: 'https', hostname: 'replicate.delivery' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
}

module.exports = config
