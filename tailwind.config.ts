import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#080b0f',
        panel: '#0e141b',
        steel: '#18212b',
        mist: '#9caaba',
        ice: '#79d4ff',
      },
      boxShadow: {
        panel: '0 18px 50px rgba(0, 0, 0, .24)',
      },
    },
  },
  plugins: [],
} satisfies Config
