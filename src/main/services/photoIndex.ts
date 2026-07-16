import { mkdir, readFile, rename, stat, writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import { app } from 'electron';
import type { Photo } from '../../shared/types/photo';

interface DirectoryIndexEntry {
  directoryMtimeMs: number;
  photos: Photo[];
  updatedAt: number;
}

interface PhotoIndexData {
  version: 1;
  directories: Record<string, DirectoryIndexEntry>;
}

/** Persistent, per-directory metadata index used to avoid repeat EXIF work. */
export class PhotoIndex {
  private readonly indexPath: string;
  private data: PhotoIndexData | null = null;
  private writeQueue: Promise<void> = Promise.resolve();

  constructor() {
    this.indexPath = join(app.getPath('userData'), 'storage', 'photo-index-v1.json');
  }

  async get(directoryPath: string): Promise<Photo[] | null> {
    const entry = (await this.load()).directories[directoryPath];
    if (!entry) return null;

    try {
      const directoryStats = await stat(directoryPath);
      if (!directoryStats.isDirectory() || directoryStats.mtimeMs !== entry.directoryMtimeMs) return null;
      return entry.photos;
    } catch {
      return null;
    }
  }

  async save(directoryPath: string, photos: Photo[]): Promise<void> {
    const directoryStats = await stat(directoryPath);
    const data = await this.load();
    data.directories[directoryPath] = {
      directoryMtimeMs: directoryStats.mtimeMs,
      photos,
      updatedAt: Date.now(),
    };
    await this.persist();
  }

  async upsert(directoryPath: string, photo: Photo): Promise<void> {
    const entry = (await this.load()).directories[directoryPath];
    if (!entry) return;
    const existing = entry.photos.findIndex((item) => item.path === photo.path);
    if (existing >= 0) entry.photos[existing] = photo;
    else entry.photos.push(photo);
    entry.directoryMtimeMs = await this.getDirectoryMtime(directoryPath, entry.directoryMtimeMs);
    entry.updatedAt = Date.now();
    await this.persist();
  }

  async remove(directoryPath: string, photoPath: string): Promise<void> {
    const entry = (await this.load()).directories[directoryPath];
    if (!entry) return;
    entry.photos = entry.photos.filter((photo) => photo.path !== photoPath);
    entry.directoryMtimeMs = await this.getDirectoryMtime(directoryPath, entry.directoryMtimeMs);
    entry.updatedAt = Date.now();
    await this.persist();
  }

  private async load(): Promise<PhotoIndexData> {
    if (this.data) return this.data;
    try {
      if (existsSync(this.indexPath)) {
        const parsed = JSON.parse(await readFile(this.indexPath, 'utf8')) as PhotoIndexData;
        if (parsed.version === 1 && parsed.directories) {
          for (const entry of Object.values(parsed.directories)) {
            entry.photos = entry.photos.map((photo) => {
              if (typeof photo.metadata?.date === 'string') {
                return { ...photo, metadata: { ...photo.metadata, date: new Date(photo.metadata.date) } };
              }
              return photo;
            });
          }
          this.data = parsed;
          return parsed;
        }
      }
    } catch (error) {
      console.warn('Unable to read the photo index; rebuilding it.', error);
    }
    this.data = { version: 1, directories: {} };
    return this.data;
  }

  private async persist(): Promise<void> {
    const data = await this.load();
    this.writeQueue = this.writeQueue.then(async () => {
      const directory = join(app.getPath('userData'), 'storage');
      await mkdir(directory, { recursive: true });
      const temporaryPath = `${this.indexPath}.tmp`;
      await writeFile(temporaryPath, JSON.stringify(data), 'utf8');
      await rename(temporaryPath, this.indexPath);
    });
    return this.writeQueue;
  }

  private async getDirectoryMtime(directoryPath: string, fallback: number): Promise<number> {
    try {
      return (await stat(directoryPath)).mtimeMs;
    } catch {
      return fallback;
    }
  }
}
