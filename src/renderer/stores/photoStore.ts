import { create } from 'zustand';
import type { Photo } from '../../../shared/types/photo';

interface PhotoState {
  photos: Photo[];
  currentDirectory: string | null;
  isLoading: boolean;
  loadingProgress: {
    stage: 'scanning' | 'metadata' | 'thumbnails';
    current: number;
    total: number;
    path?: string;
  } | null;
  error: string | null;
  setPhotos: (photos: Photo[]) => void;
  addPhoto: (photo: Photo) => void;
  removePhoto: (photoPath: string) => void;
  updatePhotoThumbnails: (thumbnailPaths: Record<string, string>) => void;
  setCurrentDirectory: (directory: string | null) => void;
  setLoading: (isLoading: boolean) => void;
  setLoadingProgress: (
    progress: {
      stage: 'scanning' | 'metadata' | 'thumbnails';
      current: number;
      total: number;
      path?: string;
    } | null
  ) => void;
  setError: (error: string | null) => void;
  clearPhotos: () => void;
}

/**
 * Zustand store for managing photo state
 */
export const usePhotoStore = create<PhotoState>((set) => ({
  photos: [],
  currentDirectory: null,
  isLoading: false,
  loadingProgress: null,
  error: null,
  setPhotos: (photos) => set({ photos }),
  addPhoto: (photo) =>
    set((state) => ({
      photos: [...state.photos, photo],
    })),
  removePhoto: (photoPath) =>
    set((state) => ({
      photos: state.photos.filter((p) => p.path !== photoPath),
    })),
  updatePhotoThumbnails: (thumbnailPaths) =>
    set((state) => {
      let changed = false;
      const photos = state.photos.map((photo) => {
        const thumbnailPath = thumbnailPaths[photo.path];
        if (!thumbnailPath || photo.thumbnailPath === thumbnailPath) return photo;
        changed = true;
        return { ...photo, thumbnailPath };
      });
      if (!changed) return state;

      return { photos };
    }),
  setCurrentDirectory: (directory) => set({ currentDirectory: directory }),
  setLoading: (isLoading) => set({ isLoading }),
  setLoadingProgress: (progress) => set({ loadingProgress: progress }),
  setError: (error) => set({ error }),
  clearPhotos: () => set({ photos: [], currentDirectory: null }),
}));
