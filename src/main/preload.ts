import { contextBridge, ipcRenderer } from 'electron';
import type { Photo } from '../../shared/types/photo';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Directory operations
  selectDirectory: () =>
    ipcRenderer.invoke('select-directory') as Promise<string | null>,
  scanDirectory: (path: string) =>
    ipcRenderer.invoke('scan-directory', path) as Promise<{
      photos: Photo[];
      error: string | null;
    }>,

  // Photo operations
  getPhotos: () => ipcRenderer.invoke('get-photos') as Promise<Photo[]>,
  getPhotoMetadata: (path: string) =>
    ipcRenderer.invoke('get-photo-metadata', path) as Promise<unknown>,

  // Thumbnail operations
  generateThumbnail: (path: string) =>
    ipcRenderer.invoke('generate-thumbnail', path) as Promise<string | null>,

  // Directory state
  getCurrentDirectory: () =>
    ipcRenderer.invoke('get-current-directory') as Promise<string | null>,

  // Recent directories operations
  getRecentDirectories: () =>
    ipcRenderer.invoke('get-recent-directories') as Promise<string[]>,
  removeRecentDirectory: (path: string) =>
    ipcRenderer.invoke('remove-recent-directory', path) as Promise<{
      success: boolean;
      error?: string;
    }>,
  clearRecentDirectories: () =>
    ipcRenderer.invoke('clear-recent-directories') as Promise<{
      success: boolean;
      error?: string;
    }>,

  // File watcher
  stopFileWatcher: () =>
    ipcRenderer.invoke('stop-file-watcher') as Promise<boolean>,

  // Event listeners
  onDirectoryScanProgress: (
    callback: (progress: {
      stage: 'scanning' | 'metadata' | 'thumbnails';
      current: number;
      total: number;
      path?: string;
    }) => void
  ) => {
    ipcRenderer.on('directory-scan-progress', (_event, progress) =>
      callback(progress)
    );
  },

  onPhotoAdded: (callback: (photo: Photo) => void) => {
    ipcRenderer.on('photo-added', (_event, photo) => callback(photo));
  },

  onPhotoRemoved: (callback: (photoPath: string) => void) => {
    ipcRenderer.on('photo-removed', (_event, photoPath) => callback(photoPath));
  },

  onThumbnailGenerated: (callback: (data: { path: string; thumbnailPath: string }) => void) => {
    ipcRenderer.on('thumbnail-generated', (_event, data) => callback(data));
  },

  removeAllListeners: (channel: string) => {
    ipcRenderer.removeAllListeners(channel);
  },

  // Photo sharing operations
  sharePhoto: (path: string) =>
    ipcRenderer.invoke('share-photo', path) as Promise<{
      success: boolean;
      error: string | null;
    }>,
  showPhotoInFolder: (path: string) =>
    ipcRenderer.invoke('show-photo-in-folder', path) as Promise<{
      success: boolean;
      error: string | null;
    }>,
  copyPhotoPath: (path: string) =>
    ipcRenderer.invoke('copy-photo-path', path) as Promise<{
      success: boolean;
      error: string | null;
    }>,

  // Batch operations
  batchSharePhotos: (paths: string[]) =>
    ipcRenderer.invoke('batch-share-photos', paths) as Promise<{
      results: Array<{ path: string; success: boolean; error: string | null }>;
    }>,
  batchExportPhotos: (paths: string[]) =>
    ipcRenderer.invoke('batch-export-photos', paths) as Promise<{
      success: boolean;
      error: string | null;
      results: Array<{ path: string; success: boolean; error: string | null }>;
      successCount: number;
      errorCount: number;
    }>,
  batchDeletePhotos: (paths: string[]) =>
    ipcRenderer.invoke('batch-delete-photos', paths) as Promise<{
      success: boolean;
      error: string | null;
      results: Array<{ path: string; success: boolean; error: string | null }>;
      successCount: number;
      errorCount: number;
    }>,

  // Album operations
  getAlbumInfo: (directoryPath: string) =>
    ipcRenderer.invoke('get-album-info', directoryPath) as Promise<{
      photoCount: number;
      firstPhotoPath: string | null;
      thumbnailPath: string | null;
    }>,
  setAlbumCover: (albumPath: string, photoPath: string) =>
    ipcRenderer.invoke('set-album-cover', albumPath, photoPath) as Promise<{
      success: boolean;
      thumbnailPath?: string | null;
      error?: string;
    }>,
  getAlbumCover: (albumPath: string) =>
    ipcRenderer.invoke('get-album-cover', albumPath) as Promise<{
      photoPath: string | null;
      thumbnailPath: string | null;
    }>,
});
