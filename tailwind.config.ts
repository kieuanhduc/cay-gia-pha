import type { Config } from 'tailwindcss'

export default {
  content: [],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Be Vietnam Pro', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#fdf8f0',
          100: '#f9eddb',
          200: '#f2d8b6',
          300: '#e9bc87',
          400: '#df9956',
          500: '#d67d33',
          600: '#c86628',
          700: '#a64e23',
          800: '#854023',
          900: '#6c361f',
          950: '#3a1a0f',
        },
      },
    },
  },
} satisfies Config
