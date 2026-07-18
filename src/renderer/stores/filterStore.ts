import { create } from 'zustand';
import type { Photo } from '../../shared/types/photo';

export type SortOption = 'date' | 'name' | 'location' | 'size';
export type GroupOption = 'date' | 'location' | 'none';

interface FilterState {
  searchQuery: string;
  dateRange: { start: Date | null; end: Date | null };
  fileTypes: string[];
  locationFilter: string | null;
  sortBy: SortOption;
  sortOrder: 'asc' | 'desc';
  groupBy: GroupOption;
  setSearchQuery: (query: string) => void;
  setDateRange: (start: Date | null, end: Date | null) => void;
  setFileTypes: (types: string[]) => void;
  setLocationFilter: (location: string | null) => void;
  setSortBy: (sortBy: SortOption) => void;
  setSortOrder: (order: 'asc' | 'desc') => void;
  setGroupBy: (groupBy: GroupOption) => void;
  clearFilters: () => void;
  applyFilters: (photos: Photo[]) => Photo[];
}

/**
 * Zustand store for managing filter and sort state
 * Persists sort and group preferences to localStorage
 */
export const useFilterStore = create<FilterState>((set, get) => {
  // Load preferences from localStorage on initialization
  const loadPreferences = () => {
    if (typeof window === 'undefined') {
      return {
        sortBy: 'date' as SortOption,
        sortOrder: 'desc' as 'asc' | 'desc',
        groupBy: 'date' as GroupOption,
      };
    }

    try {
      const storedSortBy = localStorage.getItem('photomap-sortBy') as SortOption | null;
      const storedSortOrder = localStorage.getItem('photomap-sortOrder') as 'asc' | 'desc' | null;
      const storedGroupBy = localStorage.getItem('photomap-groupBy') as GroupOption | null;

      return {
        sortBy: storedSortBy || 'date',
        sortOrder: storedSortOrder || 'desc',
        groupBy: storedGroupBy || 'date',
      };
    } catch (error) {
      console.error('Error loading filter preferences:', error);
      return {
        sortBy: 'date' as SortOption,
        sortOrder: 'desc' as 'asc' | 'desc',
        groupBy: 'date' as GroupOption,
      };
    }
  };

  const preferences = loadPreferences();

  return {
    searchQuery: '',
    dateRange: { start: null, end: null },
    fileTypes: [],
    locationFilter: null,
    sortBy: preferences.sortBy,
    sortOrder: preferences.sortOrder,
    groupBy: preferences.groupBy,
    setSearchQuery: (query) => set({ searchQuery: query }),
    setDateRange: (start, end) => set({ dateRange: { start, end } }),
    setFileTypes: (types) => set({ fileTypes: types }),
    setLocationFilter: (location) => set({ locationFilter: location }),
    setSortBy: (sortBy) => {
      set({ sortBy });
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('photomap-sortBy', sortBy);
        } catch (error) {
          console.error('Error saving sort preference:', error);
        }
      }
    },
    setSortOrder: (order) => {
      set({ sortOrder: order });
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('photomap-sortOrder', order);
        } catch (error) {
          console.error('Error saving sort order preference:', error);
        }
      }
    },
    setGroupBy: (groupBy) => {
      set({ groupBy });
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('photomap-groupBy', groupBy);
        } catch (error) {
          console.error('Error saving group preference:', error);
        }
      }
    },
    clearFilters: () =>
      set({
        searchQuery: '',
        dateRange: { start: null, end: null },
        fileTypes: [],
        locationFilter: null,
      }),
    applyFilters: (photos) => {
      const {
        searchQuery,
        dateRange,
        fileTypes,
        locationFilter,
        sortBy,
        sortOrder,
      } = get();

      let filtered = photos;

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter((photo) => {
          const filename = photo.filename.toLowerCase();
          const date = photo.metadata?.date
            ? new Date(photo.metadata.date).toLocaleDateString().toLowerCase()
            : '';
          const location = photo.metadata?.location
            ? `${photo.metadata.location.latitude}, ${photo.metadata.location.longitude}`
            : '';
          return (
            filename.includes(query) ||
            date.includes(query) ||
            location.includes(query)
          );
        });
      }

      // Date range filter
      if (dateRange.start || dateRange.end) {
        filtered = filtered.filter((photo) => {
          if (!photo.metadata?.date) return false;
          const photoDate = new Date(photo.metadata.date);
          if (dateRange.start && photoDate < dateRange.start) return false;
          if (dateRange.end && photoDate > dateRange.end) return false;
          return true;
        });
      }

      // File type filter
      if (fileTypes.length > 0) {
        filtered = filtered.filter((photo) => {
          const ext = photo.filename
            .toLowerCase()
            .substring(photo.filename.lastIndexOf('.'));
          return fileTypes.includes(ext);
        });
      }

      // Location filter
      if (locationFilter) {
        filtered = filtered.filter((photo) => {
          if (!photo.metadata?.location) return false;
          const location = `${photo.metadata.location.latitude.toFixed(4)}, ${photo.metadata.location.longitude.toFixed(4)}`;
          return location === locationFilter;
        });
      }

      // Sort
      filtered.sort((a, b) => {
        let comparison = 0;

        switch (sortBy) {
          case 'date':
            const aDate = a.metadata?.date
              ? new Date(a.metadata.date).getTime()
              : 0;
            const bDate = b.metadata?.date
              ? new Date(b.metadata.date).getTime()
              : 0;
            comparison = aDate - bDate;
            break;
          case 'name':
            comparison = a.filename.localeCompare(b.filename);
            break;
          case 'location':
            const aLoc = a.metadata?.location
              ? `${a.metadata.location.latitude},${a.metadata.location.longitude}`
              : '';
            const bLoc = b.metadata?.location
              ? `${b.metadata.location.latitude},${b.metadata.location.longitude}`
              : '';
            comparison = aLoc.localeCompare(bLoc);
            break;
          case 'size':
            // TODO: Get file size from metadata
            comparison = 0;
            break;
        }

        return sortOrder === 'asc' ? comparison : -comparison;
      });

      return filtered;
    },
  };
});
