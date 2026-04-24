import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        surface: {
          950: '#050607',
          900: '#0a0d10',
          850: '#11161b',
          800: '#171d24',
          700: '#1d2731',
        },
        accent: {
          cyan: '#4dd7ff',
          blue: '#4b8dff',
          green: '#73f0a7',
        },
      },
      boxShadow: {
        panel: '0 24px 80px rgba(0, 0, 0, 0.35)',
        inset: 'inset 0 1px 0 rgba(255,255,255,0.05)',
      },
      fontFamily: {
        sans: ['"IBM Plex Sans"', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [],
} satisfies Config;
