import type { Photo } from '../../../shared/types/photo';

/**
 * IPC API client for communicating with Electron main process
 */

/**
 * Selects a directory using the native file picker
 */
export const selectDirectory = async (): Promise<string | null> => {
  if (!window.electronAPI) {
    throw new Error('Electron API not available');
  }

  return window.electronAPI.selectDirectory();
};

/**
 * Scans a directory for photos
 */
export const scanDirectory = async (
  path: string
): Promise<{ photos: Photo[]; error: string | null }> => {
  if (!window.electronAPI) {
    throw new Error('Electron API not available');
  }

  return window.electronAPI.scanDirectory(path);
};

/**
 * Gets all photos from the current directory
 */
export const getPhotos = async (): Promise<Photo[]> => {
  if (!window.electronAPI) {
    throw new Error('Electron API not available');
  }

  return window.electronAPI.getPhotos();
};

/**
 * Gets metadata for a specific photo
 */
export const getPhotoMetadata = async (path: string): Promise<unknown> => {
  if (!window.electronAPI) {
    throw new Error('Electron API not available');
  }

  return window.electronAPI.getPhotoMetadata(path);
};

/**
 * Generates a thumbnail for a photo
 */
export const generateThumbnail = async (
  path: string,
  priority: 'visible' | 'prefetch' = 'visible'
): Promise<string | null> => {
  if (!window.electronAPI) {
    throw new Error('Electron API not available');
  }

  return window.electronAPI.generateThumbnail(path, priority);
};

/**
 * Shares a photo using the system share dialog
 */
export const sharePhoto = async (
  path: string
): Promise<{ success: boolean; error: string | null }> => {
  if (!window.electronAPI) {
    throw new Error('Electron API not available');
  }

  return window.electronAPI.sharePhoto(path);
};

/**
 * Shows a photo in the file manager
 */
export const showPhotoInFolder = async (
  path: string
): Promise<{ success: boolean; error: string | null }> => {
  if (!window.electronAPI) {
    throw new Error('Electron API not available');
  }

  return window.electronAPI.showPhotoInFolder(path);
};

/**
 * Copies a photo path to the clipboard
 */
export const copyPhotoPath = async (
  path: string
): Promise<{ success: boolean; error: string | null }> => {
  if (!window.electronAPI) {
    throw new Error('Electron API not available');
  }

  return window.electronAPI.copyPhotoPath(path);
};

/**
 * Batch shares multiple photos
 */
export const batchSharePhotos = async (paths: string[]) => {
  if (!window.electronAPI) {
    throw new Error('Electron API not available');
  }

  return window.electronAPI.batchSharePhotos(paths);
};

/**
 * Batch exports multiple photos to a selected directory
 */
export const batchExportPhotos = async (paths: string[]) => {
  if (!window.electronAPI) {
    throw new Error('Electron API not available');
  }

  return window.electronAPI.batchExportPhotos(paths);
};

/**
 * Batch deletes multiple photos (with confirmation)
 */
export const batchDeletePhotos = async (paths: string[]) => {
  if (!window.electronAPI) {
    throw new Error('Electron API not available');
  }

  return window.electronAPI.batchDeletePhotos(paths);
};

/**
 * Gets album info (photo count and first photo thumbnail)
 */
export const getAlbumInfo = async (directoryPath: string) => {
  if (!window.electronAPI) {
    throw new Error('Electron API not available');
  }

  return window.electronAPI.getAlbumInfo(directoryPath);
};

/**
 * Sets a custom album cover photo
 */
export const setAlbumCover = async (albumPath: string, photoPath: string) => {
  if (!window.electronAPI) {
    throw new Error('Electron API not available');
  }

  return window.electronAPI.setAlbumCover(albumPath, photoPath);
};

/**
 * Gets the custom album cover photo if set
 */
export const getAlbumCover = async (albumPath: string) => {
  if (!window.electronAPI) {
    throw new Error('Electron API not available');
  }

  return window.electronAPI.getAlbumCover(albumPath);
};

/** Removes a folder from PhotoMap Collections without touching its source files. */
export const removeRecentDirectory = async (directoryPath: string) => {
  if (!window.electronAPI) {
    throw new Error('Electron API not available');
  }

  return window.electronAPI.removeRecentDirectory(directoryPath);
};
