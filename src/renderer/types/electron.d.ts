import type { Photo } from '../../shared/types/photo';

/**
 * Type definitions for Electron API exposed via preload script
 */
export interface ElectronAPI {
  windowControl: (action: 'minimize' | 'maximize' | 'close') => Promise<boolean>;
  selectDirectory: () => Promise<string | null>;
  scanDirectory: (
    path: string
  ) => Promise<{ photos: Photo[]; error: string | null }>;
  getPhotos: () => Promise<Photo[]>;
  getLibraryPhotos: () => Promise<Photo[]>;
  getPhotoMetadata: (path: string) => Promise<unknown>;
  generateThumbnail: (
    path: string,
    priority?: 'visible' | 'prefetch'
  ) => Promise<string | null>;
  getCurrentDirectory: () => Promise<string | null>;
  getRecentDirectories: () => Promise<string[]>;
  removeRecentDirectory: (path: string) => Promise<{
    success: boolean;
    error?: string;
  }>;
  clearRecentDirectories: () => Promise<{
    success: boolean;
    error?: string;
  }>;
  stopFileWatcher: () => Promise<boolean>;
  onDirectoryScanProgress: (
    callback: (progress: {
      stage: 'scanning' | 'metadata' | 'thumbnails';
      current: number;
      total: number;
      path?: string;
    }) => void
  ) => void;
  onPhotoAdded: (callback: (photo: Photo) => void) => void;
  onPhotoRemoved: (callback: (photoPath: string) => void) => void;
  onThumbnailGenerated: (
    callback: (data: { path: string; thumbnailPath: string }) => void
  ) => void;
  removeAllListeners: (channel: string) => void;
  sharePhoto: (
    path: string
  ) => Promise<{ success: boolean; error: string | null }>;
  showPhotoInFolder: (
    path: string
  ) => Promise<{ success: boolean; error: string | null }>;
  copyPhotoPath: (
    path: string
  ) => Promise<{ success: boolean; error: string | null }>;
  batchSharePhotos: (paths: string[]) => Promise<{
    results: Array<{ path: string; success: boolean; error: string | null }>;
  }>;
  batchExportPhotos: (paths: string[]) => Promise<{
    success: boolean;
    error: string | null;
    results: Array<{ path: string; success: boolean; error: string | null }>;
    successCount: number;
    errorCount: number;
  }>;
  batchDeletePhotos: (paths: string[]) => Promise<{
    success: boolean;
    error: string | null;
    results: Array<{ path: string; success: boolean; error: string | null }>;
    successCount: number;
    errorCount: number;
  }>;
  getAlbumInfo: (directoryPath: string) => Promise<{
    photoCount: number;
    firstPhotoPath: string | null;
    thumbnailPath: string | null;
  }>;
  setAlbumCover: (albumPath: string, photoPath: string) => Promise<{
    success: boolean;
    thumbnailPath?: string | null;
    error?: string;
  }>;
  getAlbumCover: (albumPath: string) => Promise<{
    photoPath: string | null;
    thumbnailPath: string | null;
  }>;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
