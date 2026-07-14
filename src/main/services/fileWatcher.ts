import { watch, FSWatcher } from 'fs';
import { join } from 'path';
import { isPhotoFile } from '../../shared/constants/fileTypes';
import type { Photo } from '../../shared/types/photo';
import { stat } from 'fs/promises';

/**
 * Watches a directory for new photo files
 */
export class FileWatcher {
  private watcher: FSWatcher | null = null;
  private watchedPath: string | null = null;
  private onPhotoAdded?: (photo: Photo) => void;
  private onPhotoRemoved?: (photoPath: string) => void;

  /**
   * Starts watching a directory for changes
   * @param directoryPath - Path to watch
   * @param onPhotoAdded - Callback when a new photo is detected
   * @param onPhotoRemoved - Callback when a photo is removed
   */
  startWatching(
    directoryPath: string,
    onPhotoAdded?: (photo: Photo) => void,
    onPhotoRemoved?: (photoPath: string) => void
  ): void {
    this.stopWatching();

    this.watchedPath = directoryPath;
    this.onPhotoAdded = onPhotoAdded;
    this.onPhotoRemoved = onPhotoRemoved;

    this.watcher = watch(
      directoryPath,
      { recursive: true },
      async (eventType, filename) => {
        if (!filename) return;

        const fullPath = join(directoryPath, filename);

        if (eventType === 'rename') {
          // Check if file exists (added) or doesn't exist (removed)
          try {
            const stats = await stat(fullPath);

            if (stats.isFile() && isPhotoFile(filename)) {
              const photo: Photo = {
                id: `${fullPath}-${stats.mtimeMs}`,
                path: fullPath,
                filename: filename,
              };

              if (this.onPhotoAdded) {
                this.onPhotoAdded(photo);
              }
            }
          } catch {
            // File doesn't exist, it was removed
            if (this.onPhotoRemoved) {
              this.onPhotoRemoved(fullPath);
            }
          }
        }
      }
    );
  }

  /**
   * Stops watching the directory
   */
  stopWatching(): void {
    if (this.watcher) {
      this.watcher.close();
      this.watcher = null;
    }

    this.watchedPath = null;
    this.onPhotoAdded = undefined;
    this.onPhotoRemoved = undefined;
  }

  /**
   * Checks if currently watching a directory
   */
  isWatching(): boolean {
    return this.watcher !== null;
  }

  /**
   * Gets the currently watched path
   */
  getWatchedPath(): string | null {
    return this.watchedPath;
  }
}
