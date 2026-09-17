/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        foundation: {
          base: '#FAF9F6',
          surface: '#FFFFFF',
          accent: '#C5A059',
          navy: '#0F172A',
          slate: '#475569',
          border: '#E2E8F0',
        },
        status: {
          supported: '#10b981',
          uncertain: '#f59e0b',
          unsupported: '#ef4444',
        }
      },
      fontFamily: {
        serif: ['Georgia', 'serif'],
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
