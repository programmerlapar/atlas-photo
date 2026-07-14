import { app } from 'electron';
import { readFile, writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

/**
 * Simple storage utility for persisting data
 * Uses JSON files in user data directory
 */
export class Storage {
  private storageDir: string;

  constructor() {
    this.storageDir = join(app.getPath('userData'), 'storage');

    // Ensure storage directory exists
    if (!existsSync(this.storageDir)) {
      mkdir(this.storageDir, { recursive: true }).catch(console.error);
    }
  }

  /**
   * Gets a value from storage
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const filePath = join(this.storageDir, `${key}.json`);

      if (!existsSync(filePath)) {
        return null;
      }

      const data = await readFile(filePath, 'utf-8');
      return JSON.parse(data) as T;
    } catch (error) {
      console.error(`Error reading storage key ${key}:`, error);
      return null;
    }
  }

  /**
   * Sets a value in storage
   */
  async set<T>(key: string, value: T): Promise<void> {
    try {
      const filePath = join(this.storageDir, `${key}.json`);
      await writeFile(filePath, JSON.stringify(value, null, 2), 'utf-8');
    } catch (error) {
      console.error(`Error writing storage key ${key}:`, error);
    }
  }

  /**
   * Removes a value from storage
   */
  async remove(key: string): Promise<void> {
    try {
      const filePath = join(this.storageDir, `${key}.json`);

      if (existsSync(filePath)) {
        const { unlink } = await import('fs/promises');
        await unlink(filePath);
      }
    } catch (error) {
      console.error(`Error removing storage key ${key}:`, error);
    }
  }

  /**
   * Clears all storage
   */
  async clear(): Promise<void> {
    try {
      const { readdir, unlink } = await import('fs/promises');
      const files = await readdir(this.storageDir);

      for (const file of files) {
        if (file.endsWith('.json')) {
          await unlink(join(this.storageDir, file));
        }
      }
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  }
}
