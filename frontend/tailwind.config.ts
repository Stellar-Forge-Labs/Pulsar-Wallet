import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'deep-space': '#0B1026',
        'electric-blue': '#3B82F6',
        'stellar-cyan': '#06B6D4',
        white: '#FFFFFF',
        'slate-gray': '#64748B',
        'success-green': '#22C55E',
        'error-red': '#EF4444',
      },
      fontFamily: {
        heading: ['Inter', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
};

export default config;
