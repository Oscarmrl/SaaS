import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Design system — from CLAUDE.md visual guide
        brand: {
          DEFAULT: '#7C3AED',
          light:   '#EDE9FE',
          hover:   '#6D28D9',
        },
        sidebar: '#0A0A0A',
        surface: '#FFFFFF',
        muted:   '#F1F3F5',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        sm:   '8px',
        DEFAULT: '12px',
        lg:   '16px',
        xl:   '24px',
      },
      boxShadow: {
        card: '0 4px 6px -1px rgba(0,0,0,.07), 0 2px 4px -1px rgba(0,0,0,.04)',
        'card-hover': '0 10px 15px -3px rgba(0,0,0,.08), 0 4px 6px -2px rgba(0,0,0,.04)',
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(4px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition:  '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-10px)' },
        },
        'float-slow': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-6px)' },
        },
        'badge-float': {
          '0%, 100%': { transform: 'translateY(0px) scale(1)' },
          '50%':      { transform: 'translateY(-5px) scale(1.02)' },
        },
      },
      animation: {
        'fade-in':    'fade-in 200ms ease-in-out',
        shimmer:      'shimmer 1.5s infinite linear',
        float:        'float 4s ease-in-out infinite',
        'float-slow': 'float-slow 6s ease-in-out infinite',
        'badge-float':'badge-float 3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}

export default config
