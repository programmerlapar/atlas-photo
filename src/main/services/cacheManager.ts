import { existsSync, stat, unlink } from 'fs/promises';
import { readdir } from 'fs/promises';
import { join } from 'path';
import { app } from 'electron';

/**
 * Manages thumbnail cache directory
 */
export class CacheManager {
  private cacheDir: string;

  constructor() {
    this.cacheDir = join(app.getPath('userData'), 'thumbnails');
  }

  /**
   * Gets the cache directory path
   */
  getCacheDir(): string {
    return this.cacheDir;
  }

  /**
   * Clears all cached thumbnails
   */
  async clearCache(): Promise<void> {
    try {
      if (!existsSync(this.cacheDir)) {
        return;
      }

      const files = await readdir(this.cacheDir);
      for (const file of files) {
        const filePath = join(this.cacheDir, file);
        await unlink(filePath);
      }
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }

  /**
   * Clears old cached thumbnails (older than specified days)
   * @param daysOld - Number of days old to consider for deletion
   */
  async clearOldCache(daysOld: number = 30): Promise<void> {
    try {
      if (!existsSync(this.cacheDir)) {
        return;
      }

      const files = await readdir(this.cacheDir);
      const now = Date.now();
      const maxAge = daysOld * 24 * 60 * 60 * 1000; // Convert days to milliseconds

      for (const file of files) {
        const filePath = join(this.cacheDir, file);
        const stats = await stat(filePath);

        if (now - stats.mtimeMs > maxAge) {
          await unlink(filePath);
        }
      }
    } catch (error) {
      console.error('Error clearing old cache:', error);
    }
  }

  /**
   * Gets cache size in bytes
   */
  async getCacheSize(): Promise<number> {
    try {
      if (!existsSync(this.cacheDir)) {
        return 0;
      }

      const files = await readdir(this.cacheDir);
      let totalSize = 0;

      for (const file of files) {
        const filePath = join(this.cacheDir, file);
        const stats = await stat(filePath);
        totalSize += stats.size;
      }

      return totalSize;
    } catch (error) {
      console.error('Error getting cache size:', error);
      return 0;
    }
  }
}
