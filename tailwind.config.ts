import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/renderer/**/*.{js,ts,jsx,tsx,html}',
    './src/renderer/index.html',
  ],
  theme: {
    extend: {
      colors: {
        // Primary colors
        primary: {
          DEFAULT: '#1EC8E6',
          dark: '#1AB8D6',
          hover: '#1AB8D6',
          pressed: '#17A8C6',
        },
        // Secondary colors
        secondary: {
          DEFAULT: '#0A2A4A',
        },
        // Accent colors
        accent: {
          DEFAULT: '#314D6E',
        },
        // Neutral grayscale
        neutral: {
          50: '#FAFBFC',
          100: '#F0F2F4',
          200: '#E2E6EA',
          300: '#CBD2D9',
          400: '#9AA5B1',
          500: '#7B8794',
          600: '#616E7C',
          700: '#3E4C59',
          800: '#323F4B',
          900: '#1F2933',
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
