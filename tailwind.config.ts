import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/renderer/**/*.{js,ts,jsx,tsx,html}',
    './src/renderer/index.html',
  ],
  theme: {
    extend: {
      colors: {
        // Primary colors - Bright Sky Blue (from logo)
        primary: {
          DEFAULT: '#58a0ff',
          dark: '#4890f0',
          hover: '#68a8ff',
          pressed: '#4080e0',
          mid: '#4080c8',
        },
        // Secondary colors - Deep Indigo (from logo)
        secondary: {
          DEFAULT: '#303090',
        },
        // Accent colors - Coral Salmon (from logo)
        accent: {
          DEFAULT: '#ff8888',
        },
        // Tertiary colors - Violet (from logo)
        tertiary: {
          DEFAULT: '#5840c8',
        },
        // Neutral grayscale (indigo-tinted)
        neutral: {
          50: '#f0f1f8',
          100: '#d8daf0',
          200: '#b8bce0',
          300: '#9094c8',
          400: '#6e72a8',
          500: '#545888',
          600: '#3e4068',
          700: '#2a2c50',
          800: '#1e2040',
          900: '#121428',
        },
        // Semantic colors
        success: {
          DEFAULT: '#22C55E',
        },
        error: {
          DEFAULT: '#EF4444',
        },
        warning: {
          DEFAULT: '#F59E0B',
        },
        info: {
          DEFAULT: '#60A5FA',
        },
        // Background aliases (for semantic usage)
        background: {
          primary: 'var(--bg-primary)',
          secondary: 'var(--bg-secondary)',
          tertiary: 'var(--bg-tertiary)',
          elevated: 'var(--bg-elevated)',
          muted: 'var(--bg-muted)',
        },
        // Text aliases
        foreground: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          tertiary: 'var(--text-tertiary)',
          muted: 'var(--text-muted)',
          disabled: 'var(--text-disabled)',
        },
        // Border aliases
        border: {
          subtle: 'var(--border-subtle)',
          DEFAULT: 'var(--border-default)',
          strong: 'var(--border-strong)',
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
        mono: ['SF Mono', 'Monaco', 'Courier New', 'monospace'],
      },
      borderRadius: {
        xs: '8px',
        sm: '14px',
        md: '20px',
        xl: '28px',
      },
      boxShadow: {
        l1: '0 1px 2px rgba(0,0,0,0.06)',
        l2: '0 4px 10px rgba(0,0,0,0.08)',
        l3: '0 10px 24px rgba(0,0,0,0.12)',
      },
      transitionTimingFunction: {
        ios: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
      },
      spacing: {
        // Integrate custom spacing tokens with Tailwind spacing scale
        // Using 8-pt rhythm: 4, 8, 12, 16, 20, 24, 32, 48, 64px
        1: 'var(--spacing-1)', // 4px
        2: 'var(--spacing-2)', // 8px
        3: 'var(--spacing-3)', // 12px
        4: 'var(--spacing-4)', // 16px
        5: 'var(--spacing-5)', // 20px
        6: 'var(--spacing-6)', // 24px
        8: 'var(--spacing-8)', // 32px
        12: 'var(--spacing-12)', // 48px
        16: 'var(--spacing-16)', // 64px
      },
    },
  },
  plugins: [],
};

export default config;
