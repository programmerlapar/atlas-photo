import { create } from 'zustand';

/**
 * Album grid size preference
 * Continuous value from 0-100 where:
 * - 0 = most compact (smallest cards, most columns)
 * - 50 = medium (balanced)
 * - 100 = largest cards (fewest columns)
 */
interface PreferencesState {
  albumGridSize: number; // 0-100
  setAlbumGridSize: (size: number) => void;
}

/**
 * Zustand store for managing user preferences
 * Persists preferences to localStorage
 */
export const usePreferencesStore = create<PreferencesState>((set) => {
  // Load album grid size from localStorage on initialization
  const loadAlbumGridSize = (): number => {
    if (typeof window === 'undefined') {
      return 50; // Default to medium
    }

    try {
      const stored = localStorage.getItem('photomap-albumGridSize');
      if (stored) {
        const parsed = parseInt(stored, 10);
        // Validate range (0-100)
        if (!isNaN(parsed) && parsed >= 0 && parsed <= 100) {
          return parsed;
        }
      }
      return 50; // Default to medium
    } catch (error) {
      console.error('Error loading album grid size preference:', error);
      return 50;
    }
  };

  const initialAlbumGridSize = loadAlbumGridSize();

  return {
    albumGridSize: initialAlbumGridSize,
    setAlbumGridSize: (size) => {
      // Clamp value between 0 and 100
      const clampedSize = Math.max(0, Math.min(100, size));
      set({ albumGridSize: clampedSize });
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('photomap-albumGridSize', clampedSize.toString());
        } catch (error) {
          console.error('Error saving album grid size preference:', error);
        }
      }
    },
  };
});

