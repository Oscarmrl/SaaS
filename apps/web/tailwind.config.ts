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
        brand: {
          DEFAULT: '#7C3AED',
          light:   '#F5F0FF',
          hover:   '#6D28D9',
        },
        sidebar:  '#F9F9FB',
        surface:  '#FFFFFF',
        muted:    '#F4F4F5',
        subtle:   '#FAFAFA',
        zinc: {
          50:  '#FAFAFA',
          100: '#F4F4F5',
          200: '#E4E4E7',
          300: '#D4D4D8',
          400: '#A1A1AA',
          500: '#71717A',
          600: '#52525B',
          700: '#3F3F46',
          800: '#27272A',
          900: '#18181B',
          950: '#09090B',
        },
      },
      fontFamily: {
        sans: ['var(--font-jakarta)', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        sm:      '6px',
        DEFAULT: '10px',
        md:      '12px',
        lg:      '14px',
        xl:      '20px',
      },
      boxShadow: {
        card:       '0 1px 2px rgba(0,0,0,.05), 0 4px 16px rgba(0,0,0,.04)',
        'card-hover':'0 2px 4px rgba(0,0,0,.07), 0 8px 24px rgba(0,0,0,.06)',
        sm:         '0 1px 2px rgba(0,0,0,.06)',
        DEFAULT:    '0 1px 3px rgba(0,0,0,.08), 0 6px 16px rgba(0,0,0,.05)',
        md:         '0 2px 4px rgba(0,0,0,.08), 0 8px 24px rgba(0,0,0,.06)',
        lg:         '0 4px 6px rgba(0,0,0,.07), 0 16px 40px rgba(0,0,0,.06)',
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(6px)' },
          to:   { opacity: '1', transform: 'translateY(0)'   },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to:   { opacity: '1', transform: 'translateY(0)'    },
        },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.97)' },
          to:   { opacity: '1', transform: 'scale(1)'    },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition:  '200% 0' },
        },
        'scroll-x': {
          '0%':   { transform: 'translateX(0)'    },
          '100%': { transform: 'translateX(-50%)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)'   },
          '50%':      { transform: 'translateY(-8px)' },
        },
        'float-lg': {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)'      },
          '50%':      { transform: 'translateY(-14px) rotate(-3deg)' },
        },
        orbit: {
          from: { transform: 'rotate(0deg)'   },
          to:   { transform: 'rotate(360deg)' },
        },
        'orbit-rev': {
          from: { transform: 'rotate(360deg)' },
          to:   { transform: 'rotate(0deg)'   },
        },
        blob: {
          '0%, 100%': { transform: 'translate(0,0) scale(1)'          },
          '33%':      { transform: 'translate(24px,-30px) scale(1.08)' },
          '66%':      { transform: 'translate(-20px,18px) scale(0.94)' },
        },
        glow: {
          '0%, 100%': { opacity: '0.5' },
          '50%':      { opacity: '1'   },
        },
        'gradient-pan': {
          '0%, 100%': { backgroundPosition: '0% 50%'   },
          '50%':      { backgroundPosition: '100% 50%' },
        },
        marquee: {
          from: { transform: 'translateX(0)'    },
          to:   { transform: 'translateX(-50%)' },
        },
        shake: {
          '0%, 100%':      { transform: 'translateX(0)'    },
          '20%, 60%':      { transform: 'translateX(-6px)' },
          '40%, 80%':      { transform: 'translateX(6px)'  },
        },
      },
      animation: {
        'fade-in':   'fade-in 250ms ease-out',
        'slide-up':  'slide-up 300ms ease-out',
        'scale-in':  'scale-in 200ms ease-out',
        shimmer:     'shimmer 1.5s infinite linear',
        'scroll-x':  'scroll-x 28s linear infinite',
        float:       'float 4s ease-in-out infinite',
        'float-lg':  'float-lg 7s ease-in-out infinite',
        orbit:       'orbit 38s linear infinite',
        'orbit-rev': 'orbit-rev 38s linear infinite',
        blob:        'blob 18s ease-in-out infinite',
        glow:        'glow 4s ease-in-out infinite',
        'gradient-pan': 'gradient-pan 8s ease-in-out infinite',
        shake:       'shake 0.45s cubic-bezier(0.36,0.07,0.19,0.97)',
      },
    },
  },
  plugins: [],
}

export default config
