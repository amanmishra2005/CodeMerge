/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0B1120',
        surface: '#131B2E',
        surface2: '#1B2440',
        border: '#26314D',
        accent: '#4C8DFF',
        accent2: '#FFB454',
        easy: '#3DDC84',
        medium: '#FFB454',
        hard: '#FF5C5C',
        text: '#E8EDF7',
        muted: '#8B96AD',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      keyframes: {
        floatY: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-14px)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: 0.5 },
          '50%': { opacity: 1 },
        },
        drawLine: {
          '0%': { strokeDashoffset: 400 },
          '100%': { strokeDashoffset: 0 },
        },
      },
      animation: {
        floatY: 'floatY 6s ease-in-out infinite',
        pulseGlow: 'pulseGlow 3s ease-in-out infinite',
        drawLine: 'drawLine 2s ease forwards',
      },
    },
  },
  plugins: [],
};
