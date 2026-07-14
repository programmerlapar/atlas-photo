import { create } from 'zustand';

type Theme = 'light' | 'dark';

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

/**
 * Zustand store for managing theme state
 * Persists theme preference to localStorage
 */
export const useThemeStore = create<ThemeState>((set) => {
  // Load theme from localStorage on initialization
  const storedTheme = localStorage.getItem('photomap-theme') as Theme | null;
  const initialTheme = storedTheme || 'dark'; // Default to dark mode

  // Apply theme to document immediately
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-theme', initialTheme);
  }

  return {
    theme: initialTheme,
    setTheme: (theme) => {
      set({ theme });
      if (typeof document !== 'undefined') {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('photomap-theme', theme);
      }
    },
    toggleTheme: () => {
      set((state) => {
        const newTheme = state.theme === 'dark' ? 'light' : 'dark';
        if (typeof document !== 'undefined') {
          document.documentElement.setAttribute('data-theme', newTheme);
          localStorage.setItem('photomap-theme', newTheme);
        }
        return { theme: newTheme };
      });
    },
  };
});
