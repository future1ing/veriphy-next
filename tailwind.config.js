/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: '#0b0f0e',
        surface: '#111815',
        surface2: '#182219',
        surface3: '#1f2d22',
        border: '#2a3d2d',
        accent: '#4ade80',
        'accent-dim': 'rgba(74,222,128,0.12)',
        tx: '#e8f0e9',
        tx2: '#8fa890',
        tx3: '#5a7060',
      },
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        display: ['Syne', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
