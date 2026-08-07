import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Dark tactical "operator" aesthetic
        black: '#0a0e27', // Deep navy-black
        slate: {
          900: '#1a1f3a',
          800: '#2a2f4a',
          700: '#3a3f5a',
          600: '#4a4f6a',
        },
        amber: {
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
        },
        cyan: {
          400: '#22d3ee',
          500: '#06b6d4',
          600: '#0891b2',
        },
      },
      fontFamily: {
        sans: ['system-ui', 'sans-serif'],
        mono: ['monospace'],
      },
    },
  },
  plugins: [],
};

export default config;
