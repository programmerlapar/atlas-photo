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
  version: 2;
  directories: Record<string, DirectoryIndexEntry>;
}

interface LegacyPhotoIndexData {
  version: 1;
  directories: Record<string, DirectoryIndexEntry>;
}

/** Persistent, per-directory metadata index used to avoid repeat EXIF work. */
export class PhotoIndex {
  private readonly indexPath: string;
  private data: PhotoIndexData | null = null;
  private writeQueue: Promise<void> = Promise.resolve();
  private persistTimer: ReturnType<typeof setTimeout> | null = null;

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
    entry.updatedAt = Date.now();
    this.schedulePersist();
  }

  async remove(directoryPath: string, photoPath: string): Promise<void> {
    const entry = (await this.load()).directories[directoryPath];
    if (!entry) return;
    entry.photos = entry.photos.filter((photo) => photo.path !== photoPath);
    entry.updatedAt = Date.now();
    this.schedulePersist();
  }

  private async load(): Promise<PhotoIndexData> {
    if (this.data) return this.data;
    try {
      if (existsSync(this.indexPath)) {
        const parsed = JSON.parse(await readFile(this.indexPath, 'utf8')) as PhotoIndexData | LegacyPhotoIndexData;
        if (parsed.version === 1 && parsed.directories) {
          const upgraded: PhotoIndexData = {
            version: 2,
            directories: parsed.directories,
          };
          for (const entry of Object.values(upgraded.directories)) {
            entry.photos = entry.photos.map((photo) => {
              const legacyExif = photo.metadata?.exif;
              const date = parseLegacyExifDate(
                legacyExif?.['36867'],
                legacyExif?.['36868'],
                legacyExif?.['306'],
                legacyExif?.DateTimeOriginal,
                legacyExif?.CreateDate,
                legacyExif?.ModifyDate
              );
              return {
                ...photo,
                metadata: {
                  ...photo.metadata,
                  ...(photo.metadata?.date || !date ? {} : { date }),
                  exif: compactExif(legacyExif),
                },
              };
            });
          }
          this.data = upgraded;
          this.schedulePersist();
          return upgraded;
        }
        if (parsed.version === 2 && parsed.directories) {
          let compacted = false;
          for (const entry of Object.values(parsed.directories)) {
            entry.photos = entry.photos.map((photo) => {
              const compactExifData = compactExif(photo.metadata?.exif);
              if (photo.metadata?.exif && Object.keys(compactExifData).length < Object.keys(photo.metadata.exif).length) {
                compacted = true;
              }
              if (typeof photo.metadata?.date === 'string') {
                return {
                  ...photo,
                  metadata: { ...photo.metadata, date: new Date(photo.metadata.date), exif: compactExifData },
                };
              }
              return photo.metadata?.exif
                ? { ...photo, metadata: { ...photo.metadata, exif: compactExifData } }
                : photo;
            });
          }
          this.data = parsed;
          if (compacted) this.schedulePersist();
          return parsed;
        }
      }
    } catch (error) {
      console.warn('Unable to read the photo index; rebuilding it.', error);
    }
    // No valid index is available; the next directory scan builds v2 data.
    this.data = { version: 2, directories: {} };
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

  /** Coalesce rapid thumbnail updates into a single small amount of disk work. */
  private schedulePersist(): void {
    if (this.persistTimer !== null) return;
    this.persistTimer = setTimeout(() => {
      this.persistTimer = null;
      void this.persist().catch((error) => {
        console.warn('Unable to persist the photo index.', error);
      });
    }, 750);
  }

}

const parseLegacyExifDate = (...values: unknown[]): Date | undefined => {
  for (const value of values) {
    if (value instanceof Date && Number.isFinite(value.getTime())) return value;
    if (typeof value !== 'string') continue;
    const normalized = value.replace(/^(\d{4}):(\d{2}):(\d{2})/, '$1-$2-$3');
    const date = new Date(normalized);
    if (Number.isFinite(date.getTime())) return date;
  }
  return undefined;
};

const compactExif = (exif: Record<string, unknown> | undefined): Record<string, unknown> => {
  if (!exif) return {};
  const retainedKeys = new Set([
    'DateTimeOriginal', 'DateTimeDigitized', 'CreateDate', 'DateTime', 'ModifyDate',
    'Make', 'Model', 'ISO', 'FNumber', 'ExposureTime', 'FocalLength',
    'latitude', 'longitude', 'GPSAltitude',
    // Raw v1 tags retained only long enough to migrate their dates.
    '36867', '36868', '306',
  ]);
  return Object.fromEntries(Object.entries(exif).filter(([key]) => retainedKeys.has(key)));
};
