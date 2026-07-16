// src/main/ipc/cache/types.ts

export interface CacheOptions {
  width: number;
}

export interface ThumbnailCacheEntry {
  data: string; // base64url encoded thumbnail
  timestamp: number;
}

export interface ImageCacheResponse {
  image?: string;
  error?: string;
}

export interface ScanDirectoryResult {
  files: Array<{
    path: string;
    width: number;
    height: number;
    fileSize: number;
    format: string;
    thumbnail?: string; // base64url encoded thumbnail
  }>;
  totalFiles: number;
}