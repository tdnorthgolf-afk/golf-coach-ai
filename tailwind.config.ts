import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Pebble Beach Coastal Palette
        'midnight': {
          DEFAULT: '#002D40',
          teal: '#002D40',
        },
        'beach': {
          DEFAULT: '#D6C8B4',
          tan: '#D6C8B4',
        },
        'pebble': {
          DEFAULT: '#E65722',
          orange: '#E65722',
        },
        'coastal': {
          dark: '#0A1A20',
          text: '#0B2D38',
        },
        'cream': {
          DEFAULT: '#E8E3DC',
          light: '#E8E3DC',
        },
        'sky': {
          blue: '#87CEEB',
          cadet: '#5F9EA0',
        },
        'error': {
          DEFAULT: '#D94F3A',
          red: '#D94F3A',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'coastal': '0 4px 20px rgba(0, 45, 64, 0.15)',
        'coastal-lg': '0 8px 40px rgba(0, 45, 64, 0.2)',
        'orange-glow': '0 4px 20px rgba(230, 87, 34, 0.25)',
      },
    },
  },
  plugins: [],
}

export default config