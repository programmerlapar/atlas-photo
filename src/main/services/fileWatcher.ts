import { watch, FSWatcher } from 'fs';
import { join } from 'path';
import { isPhotoFile } from '../../shared/constants/fileTypes';
import type { Photo } from '../../shared/types/photo';
import { stat } from 'fs/promises';

type FileEvent = 'rename' | 'change';

/**
 * Watches a directory for new photo files
 */
export class FileWatcher {
  private watcher: FSWatcher | null = null;
  private watchedPath: string | null = null;
  private readonly notifiedMtimes = new Map<string, number>();
  private readonly processingPaths = new Set<string>();
  private readonly queuedEvents = new Map<string, FileEvent>();
  private onPhotoAdded?: (photo: Photo) => void | Promise<void>;
  private onPhotoRemoved?: (photoPath: string) => void;

  /**
   * Starts watching a directory for changes
   * @param directoryPath - Path to watch
   * @param onPhotoAdded - Callback when a new photo is detected
   * @param onPhotoRemoved - Callback when a photo is removed
   */
  startWatching(
    directoryPath: string,
    onPhotoAdded?: (photo: Photo) => void | Promise<void>,
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

        if (eventType !== 'rename' && eventType !== 'change') return;
        if (this.processingPaths.has(fullPath)) {
          this.queuedEvents.set(fullPath, eventType);
          return;
        }
        this.processingPaths.add(fullPath);

        try {
          let nextEvent: FileEvent | undefined = eventType;
          while (nextEvent) {
            this.queuedEvents.delete(fullPath);
            try {
              await this.processFileEvent(fullPath, filename, nextEvent);
            } catch (error) {
              console.error(`Error processing file event for ${fullPath}:`, error);
            }
            nextEvent = this.queuedEvents.get(fullPath);
          }
        } finally {
          this.processingPaths.delete(fullPath);
          this.queuedEvents.delete(fullPath);
        }
      }
    );
  }

  private async processFileEvent(
    fullPath: string,
    filename: string,
    eventType: FileEvent
  ): Promise<void> {
    let stats: Awaited<ReturnType<typeof stat>>;
    try {
      stats = await stat(fullPath);
    } catch {
      // A failed rename stat indicates that the file was removed. A failed
      // change stat can be a transient write, so leave the current index alone.
      this.notifiedMtimes.delete(fullPath);
      if (eventType === 'rename') {
        this.onPhotoRemoved?.(fullPath);
      }
      return;
    }

    if (!stats.isFile() || !isPhotoFile(filename)) return;
    if (this.notifiedMtimes.get(fullPath) === stats.mtimeMs) return;

    await this.onPhotoAdded?.({
      id: `${fullPath}-${stats.mtimeMs}`,
      path: fullPath,
      filename,
    });
    this.notifiedMtimes.set(fullPath, stats.mtimeMs);
  }

  /**
   * Stops watching the directory
   */
  stopWatching(): void {
    if (this.watcher) {
      this.watcher.close();
      this.watcher = null;
    }

    this.notifiedMtimes.clear();
    this.processingPaths.clear();
    this.queuedEvents.clear();
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
