import { ipcMain, BrowserWindow, shell, clipboard } from 'electron';
import { dialog } from 'electron';
import { existsSync } from 'fs';
import { copyFile, unlink } from 'fs/promises';
import { join, basename } from 'path';
import { processPhotos } from '../services/photoProcessor';
import { extractPhotoMetadata } from '../services/exifExtractor';
import { FileWatcher } from '../services/fileWatcher';
import { Storage } from '../utils/storage';
import { PhotoIndex } from '../services/photoIndex';
import { ImageCacheService } from './cache/ImageCacheService';
import { addAllowedLibraryRoot } from '../utils/protocol';
import type { Photo } from '../../shared/types/photo';

// Store photo data in memory for current session
let currentPhotos: Photo[] = [];
let currentDirectory: string | null = null;
const fileWatcher = new FileWatcher();
const storage = new Storage();
const photoIndex = new PhotoIndex();
const imageCache = new ImageCacheService();
let backgroundThumbnailRun = 0;

// Load last directory on startup
(async () => {
  const lastDirectory = await storage.get<string>('lastDirectory');
  if (lastDirectory) {
    currentDirectory = lastDirectory;
  }
})();

/**
 * Sends progress updates to all renderer windows
 */
const sendProgress = (progress: {
  stage: 'scanning' | 'metadata' | 'thumbnails';
  current: number;
  total: number;
  path?: string;
}) => {
  const windows = BrowserWindow.getAllWindows();
  windows.forEach((window) => {
    window.webContents.send('directory-scan-progress', progress);
  });
};

const publishThumbnail = async (path: string, thumbnailPath: string): Promise<void> => {
  const photo = currentPhotos.find((item) => item.path === path);
  // A visible request may join a prefetch already in progress. Only publish
  // once so the renderer is not forced through duplicate list updates.
  if (!photo || photo.thumbnailPath === thumbnailPath) return;

  photo.thumbnailPath = thumbnailPath;
  if (currentDirectory) await photoIndex.upsert(currentDirectory, photo);

  BrowserWindow.getAllWindows().forEach((window) => {
    window.webContents.send('thumbnail-generated', { path, thumbnailPath });
  });
};

const startBackgroundThumbnailPrefetch = (directoryPath: string, photos: Photo[]): void => {
  const run = ++backgroundThumbnailRun;
  const runPrefetch = async () => {
    // One low-priority worker runs only after the UI settles. Foreground work
    // queued by Gallery, Map, or Detail always moves ahead of the next item.
    for (const photo of photos) {
      if (run !== backgroundThumbnailRun || currentDirectory !== directoryPath) return;
      if (photo.thumbnailPath) continue;

      const thumbnailPath = await imageCache.getThumbnail(photo.path, 500, 'prefetch');
      if (run !== backgroundThumbnailRun || currentDirectory !== directoryPath) return;
      if (thumbnailPath) await publishThumbnail(photo.path, thumbnailPath);
    }
  };
  // Let navigation, the first viewport, and user actions win before any
  // optional conversion starts consuming CPU.
  setTimeout(() => {
    void runPrefetch().catch((error) => {
      console.warn('Background thumbnail prefetch stopped.', error);
    });
  }, 1500);
};

/**
 * Sets up all IPC handlers for communication between main and renderer processes
 */
export const setupIpcHandlers = () => {
  ipcMain.handle('window-control', (event, action: 'minimize' | 'maximize' | 'close') => {
    const window = BrowserWindow.fromWebContents(event.sender);
    if (!window) return false;

    if (action === 'minimize') window.minimize();
    if (action === 'maximize') {
      if (window.isMaximized()) window.unmaximize();
      else window.maximize();
    }
    if (action === 'close') window.close();
    return true;
  });

  // Directory selection handler
  ipcMain.handle('select-directory', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory'],
      title: 'Select Photo Directory',
    });

    if (result.canceled) {
      return null;
    }

    return result.filePaths[0];
  });

  // Directory scanning handler
  ipcMain.handle('scan-directory', async (_event, path: string) => {
    try {
      currentDirectory = path;
      addAllowedLibraryRoot(path);

      // Save directory to storage for persistence
      await storage.set('lastDirectory', path);

      // Add to recent directories list
      const recentDirs = (await storage.get<string[]>('recentDirectories')) || [];
      // Remove if already exists (to move to top)
      const filteredDirs = recentDirs.filter((dir) => dir !== path);
      // Add to beginning (most recent first)
      const updatedDirs = [path, ...filteredDirs].slice(0, 10); // Keep max 10 recent directories
      await storage.set('recentDirectories', updatedDirs);

      const cachedPhotos = await photoIndex.get(path);

      // The watcher keeps an instant index restore current while the app runs.
      fileWatcher.startWatching(
        path,
        async (photo) => {
          // Extract metadata and generate thumbnail for new photo
          const metadata = await extractPhotoMetadata(photo.path);
          if (metadata) {
            photo.metadata = metadata;
          }

          const thumbnailPath = await imageCache.getThumbnail(photo.path);
          if (thumbnailPath) {
            photo.thumbnailPath = thumbnailPath;
          }

          // Add to current photos
          currentPhotos.push(photo);
          await photoIndex.upsert(path, photo);

          // Notify renderer
          const windows = BrowserWindow.getAllWindows();
          windows.forEach((window) => {
            window.webContents.send('photo-added', photo);
          });
        },
        async (photoPath) => {
          // Remove from current photos
          currentPhotos = currentPhotos.filter((p) => p.path !== photoPath);
          await photoIndex.remove(path, photoPath);

          // Notify renderer
          const windows = BrowserWindow.getAllWindows();
          windows.forEach((window) => {
            window.webContents.send('photo-removed', photoPath);
          });
        }
      );

      if (cachedPhotos) {
        currentPhotos = cachedPhotos;
        startBackgroundThumbnailPrefetch(path, cachedPhotos);
        return { photos: cachedPhotos, error: null };
      }

      // Process existing photos
      const photos = await processPhotos(path, sendProgress);

      currentPhotos = photos;
      await photoIndex.save(path, photos);
      startBackgroundThumbnailPrefetch(path, photos);

      return { photos, error: null };
    } catch (error) {
      console.error('Error scanning directory:', error);
      return {
        photos: [],
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  });

  // Get photos handler
  ipcMain.handle('get-photos', async () => {
    return currentPhotos;
  });

  // Library reads the existing per-collection index rather than scanning every
  // saved folder on navigation. Individual album scans keep those indexes fresh.
  ipcMain.handle('get-library-photos', async () => {
    const recentDirs = (await storage.get<string[]>('recentDirectories')) || [];
    const indexedPhotos = await photoIndex.getStoredForDirectories(recentDirs);
    const uniquePhotos = new Map<string, Photo>();

    for (const photo of indexedPhotos) {
      // Collections may overlap because directory scans are recursive.
      // Recent collections are read first, so retain their newer index entry.
      if (!uniquePhotos.has(photo.path)) uniquePhotos.set(photo.path, photo);
    }

    return Array.from(uniquePhotos.values());
  });

  // Get photo metadata handler
  ipcMain.handle('get-photo-metadata', async (_event, path: string) => {
    try {
      const cachedPhoto = currentPhotos.find((photo) => photo.path === path);
      if (cachedPhoto?.metadata) return cachedPhoto.metadata;

      const metadata = await extractPhotoMetadata(path);
      if (cachedPhoto && metadata) {
        cachedPhoto.metadata = metadata;
        if (currentDirectory) await photoIndex.upsert(currentDirectory, cachedPhoto);
      }
      return metadata;
    } catch (error) {
      console.error('Error getting photo metadata:', error);
      return null;
    }
  });

  // Generate thumbnail handler
  // Returns thumbnail path and updates the photo in currentPhotos
  ipcMain.handle(
    'generate-thumbnail',
    async (_event, path: string, priority: 'visible' | 'prefetch' = 'visible') => {
    try {
      const thumbnailPath = await imageCache.getThumbnail(path, 500, priority);
      if (thumbnailPath) await publishThumbnail(path, thumbnailPath);
      return thumbnailPath;
    } catch (error) {
      console.error('Error generating thumbnail:', error);
      return null;
    }
  });

  // Get current directory handler
  ipcMain.handle('get-current-directory', async () => {
    // Try to get from storage if not in memory
    if (!currentDirectory) {
      const lastDirectory = await storage.get<string>('lastDirectory');
      if (lastDirectory) {
        currentDirectory = lastDirectory;
      }
    }
    return currentDirectory;
  });

  // Stop file watcher handler
  ipcMain.handle('stop-file-watcher', async () => {
    fileWatcher.stopWatching();
    return true;
  });

  // Recent directories handlers
  ipcMain.handle('get-recent-directories', async () => {
    const recentDirs = (await storage.get<string[]>('recentDirectories')) || [];
    return recentDirs;
  });

  ipcMain.handle('remove-recent-directory', async (_event, path: string) => {
    try {
      const recentDirs = (await storage.get<string[]>('recentDirectories')) || [];
      const updatedDirs = recentDirs.filter((dir) => dir !== path);
      await storage.set('recentDirectories', updatedDirs);
      return { success: true };
    } catch (error) {
      console.error('Error removing recent directory:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  });

  ipcMain.handle('clear-recent-directories', async () => {
    try {
      await storage.set('recentDirectories', []);
      return { success: true };
    } catch (error) {
      console.error('Error clearing recent directories:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  });

  // Get album info (first photo, count) - lightweight for album thumbnails
  ipcMain.handle('get-album-info', async (_event, directoryPath: string) => {
    try {
      const indexedPhotos = await photoIndex.get(directoryPath);
      if (indexedPhotos) {
        const firstPhoto = indexedPhotos[0];
        // The Collections screen must never block on decoding a full image.
        // A missing cover simply uses its lightweight placeholder until the
        // album is opened and normal thumbnail work begins.
        const thumbnailPath = firstPhoto.thumbnailPath || null;

        return {
          photoCount: indexedPhotos.length,
          firstPhotoPath: firstPhoto.path,
          thumbnailPath,
        };
      }

      // Do not recursively scan every recent directory just to paint the
      // albums screen. The first normal album open creates its full index.
      return {
        photoCount: 0,
        firstPhotoPath: null,
        thumbnailPath: null,
      };
    } catch (error) {
      console.error('Error getting album info:', error);
      return {
        photoCount: 0,
        firstPhotoPath: null,
        thumbnailPath: null,
      };
    }
  });

  // Set custom album cover
  ipcMain.handle('set-album-cover', async (_event, albumPath: string, photoPath: string) => {
    try {
      const albumCovers = (await storage.get<Record<string, string>>('albumCovers')) || {};
      albumCovers[albumPath] = photoPath;
      await storage.set('albumCovers', albumCovers);
      
      // Generate thumbnail for the cover photo
      const thumbnailPath = await imageCache.getThumbnail(photoPath);
      
      return { success: true, thumbnailPath };
    } catch (error) {
      console.error('Error setting album cover:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  });

  // Get custom album cover
  ipcMain.handle('get-album-cover', async (_event, albumPath: string) => {
    try {
      const albumCovers = (await storage.get<Record<string, string>>('albumCovers')) || {};
      const coverPhotoPath = albumCovers[albumPath];
      
      if (!coverPhotoPath) {
        return { photoPath: null, thumbnailPath: null };
      }

      // The cover thumbnail was generated (and cached on disk) when the
      // cover was set, so this is a fast cache read rather than a blocking
      // conversion. The renderer falls back to the cover photo itself when no
      // thumbnail is available.
      const thumbnailPath = await imageCache.getThumbnail(coverPhotoPath);
      return { photoPath: coverPhotoPath, thumbnailPath };
    } catch (error) {
      console.error('Error getting album cover:', error);
      return { photoPath: null, thumbnailPath: null };
    }
  });

  /**
   * Share photo handler
   * Opens the photo with the default application (which may trigger system share dialog)
   * On macOS, this will open the file with the default app
   * On Windows/Linux, this will open with the default application
   */
  ipcMain.handle('share-photo', async (_event, photoPath: string) => {
    try {
      // Verify file exists
      if (!existsSync(photoPath)) {
        return { success: false, error: 'File not found' };
      }

      // Open file with default application
      // On macOS, this can trigger the share menu
      // On Windows/Linux, this opens with the default app
      await shell.openPath(photoPath);

      return { success: true, error: null };
    } catch (error) {
      console.error('Error sharing photo:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  });

  /**
   * Show photo in file manager handler
   * Opens the file manager and highlights the photo file
   */
  ipcMain.handle('show-photo-in-folder', async (_event, photoPath: string) => {
    try {
      if (!existsSync(photoPath)) {
        return { success: false, error: 'File not found' };
      }

      // Show file in folder
      // On macOS, this opens Finder and selects the file
      // On Windows, this opens File Explorer and selects the file
      // On Linux, this opens the file manager and selects the file
      shell.showItemInFolder(photoPath);

      return { success: true, error: null };
    } catch (error) {
      console.error('Error showing photo in folder:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  });

  /**
   * Copy photo path to clipboard handler
   */
  ipcMain.handle('copy-photo-path', async (_event, photoPath: string) => {
    try {
      clipboard.writeText(photoPath);
      return { success: true, error: null };
    } catch (error) {
      console.error('Error copying photo path:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  });

  /**
   * Batch share photos handler
   * Opens each photo with the default application
   */
  ipcMain.handle('batch-share-photos', async (_event, photoPaths: string[]) => {
    try {
      const results = [];
      for (const photoPath of photoPaths) {
        if (existsSync(photoPath)) {
          try {
            await shell.openPath(photoPath);
            results.push({ path: photoPath, success: true, error: null });
          } catch (error) {
            results.push({
              path: photoPath,
              success: false,
              error: error instanceof Error ? error.message : 'Unknown error',
            });
          }
        } else {
          results.push({
            path: photoPath,
            success: false,
            error: 'File not found',
          });
        }
      }
      return { results };
    } catch (error) {
      console.error('Error batch sharing photos:', error);
      return {
        results: [],
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  });

  /**
   * Batch export photos handler
   * Copies selected photos to a destination directory
   */
  ipcMain.handle(
    'batch-export-photos',
    async (_event, photoPaths: string[]) => {
      try {
        // Show directory picker for destination
        const result = await dialog.showOpenDialog({
          properties: ['openDirectory'],
          title: 'Select Destination Folder',
        });

        if (result.canceled || result.filePaths.length === 0) {
          return {
            success: false,
            error: 'No destination selected',
            results: [],
          };
        }

        const destinationDir = result.filePaths[0];
        const results = [];
        let successCount = 0;
        let errorCount = 0;

        for (const photoPath of photoPaths) {
          if (existsSync(photoPath)) {
            try {
              const filename = basename(photoPath);
              const destPath = join(destinationDir, filename);
              await copyFile(photoPath, destPath);
              results.push({ path: photoPath, success: true, error: null });
              successCount++;
            } catch (error) {
              results.push({
                path: photoPath,
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
              });
              errorCount++;
            }
          } else {
            results.push({
              path: photoPath,
              success: false,
              error: 'File not found',
            });
            errorCount++;
          }
        }

        return {
          success: errorCount === 0,
          results,
          successCount,
          errorCount,
        };
      } catch (error) {
        console.error('Error batch exporting photos:', error);
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          results: [],
        };
      }
    }
  );

  /**
   * Batch delete photos handler
   * Deletes selected photos from disk (with confirmation)
   */
  ipcMain.handle(
    'batch-delete-photos',
    async (_event, photoPaths: string[]) => {
      try {
        // Show confirmation dialog
        const result = await dialog.showMessageBox({
          type: 'warning',
          buttons: ['Cancel', 'Delete'],
          defaultId: 0,
          cancelId: 0,
          title: 'Delete Photos',
          message: `Are you sure you want to delete ${photoPaths.length} photo(s)?`,
          detail:
            'This action cannot be undone. The photos will be permanently deleted from your disk.',
        });

        if (result.response === 0) {
          // User cancelled
          return { success: false, error: 'User cancelled', results: [] };
        }

        const results = [];
        let successCount = 0;
        let errorCount = 0;

        for (const photoPath of photoPaths) {
          if (existsSync(photoPath)) {
            try {
              await unlink(photoPath);
              results.push({ path: photoPath, success: true, error: null });
              successCount++;

              // Remove from current photos
              currentPhotos = currentPhotos.filter((p) => p.path !== photoPath);
              if (currentDirectory) await photoIndex.remove(currentDirectory, photoPath);

              // Notify renderer
              const windows = BrowserWindow.getAllWindows();
              windows.forEach((window) => {
                window.webContents.send('photo-removed', photoPath);
              });
            } catch (error) {
              results.push({
                path: photoPath,
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
              });
              errorCount++;
            }
          } else {
            results.push({
              path: photoPath,
              success: false,
              error: 'File not found',
            });
            errorCount++;
          }
        }

        return {
          success: errorCount === 0,
          results,
          successCount,
          errorCount,
        };
      } catch (error) {
        console.error('Error batch deleting photos:', error);
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          results: [],
        };
      }
    }
  );
};
