import { contextBridge, ipcRenderer } from 'electron';
import type { Photo } from '../shared/types/photo';
import type {
  DetectedFace,
  FaceScanMode,
  FaceScanQueue,
  PersonGroup,
} from '../shared/types/people';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  windowControl: (action: 'minimize' | 'maximize' | 'close') =>
    ipcRenderer.invoke('window-control', action) as Promise<boolean>,
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
  getLibraryPhotos: () =>
    ipcRenderer.invoke('get-library-photos') as Promise<Photo[]>,
  getFaceGroupingEnabled: () =>
    ipcRenderer.invoke('get-face-grouping-enabled') as Promise<boolean>,
  setFaceGroupingEnabled: (enabled: boolean) =>
    ipcRenderer.invoke(
      'set-face-grouping-enabled',
      enabled
    ) as Promise<boolean>,
  getPeopleGroups: () =>
    ipcRenderer.invoke('get-people-groups') as Promise<PersonGroup[]>,
  getFaceScanQueue: (mode: FaceScanMode = 'new') =>
    ipcRenderer.invoke('get-face-scan-queue', mode) as Promise<FaceScanQueue>,
  saveDetectedFaces: (
    photoPath: string,
    photoId: string,
    faces: DetectedFace[]
  ) =>
    ipcRenderer.invoke(
      'save-detected-faces',
      photoPath,
      photoId,
      faces
    ) as Promise<PersonGroup[] | null>,
  recordFaceScanFailure: (photoPath: string, photoId: string) =>
    ipcRenderer.invoke(
      'record-face-scan-failure',
      photoPath,
      photoId
    ) as Promise<void>,
  renamePerson: (personId: string, name: string) =>
    ipcRenderer.invoke('rename-person', personId, name) as Promise<
      PersonGroup[]
    >,
  forgetPerson: (personId: string) =>
    ipcRenderer.invoke('forget-person', personId) as Promise<PersonGroup[]>,
  getPhotoThumbnailData: (photoPath: string) =>
    ipcRenderer.invoke(
      'get-photo-thumbnail-data',
      photoPath
    ) as Promise<Uint8Array | null>,
  getPhotoMetadata: (path: string) =>
    ipcRenderer.invoke('get-photo-metadata', path) as Promise<unknown>,

  // Thumbnail operations
  generateThumbnail: (path: string, priority?: 'visible' | 'prefetch') =>
    ipcRenderer.invoke('generate-thumbnail', path, priority) as Promise<
      string | null
    >,

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

  onThumbnailGenerated: (
    callback: (data: { path: string; thumbnailPath: string }) => void
  ) => {
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
