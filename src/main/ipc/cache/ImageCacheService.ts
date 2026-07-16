// src/main/ipc/cache/ImageCacheService.ts

import { existsSync, readFileSync, statSync, unlinkSync, writeFileSync, readdirSync } from 'fs';
import { join } from 'path';
import type { ImageCacheResponse } from './types.js';

export class ImageCacheService {
  private cacheDir: string;
  private maxEntries = 500; // LRU limit for memory cache
  private _memoryCache?: Map<string, string>;
  private _dimensionsCache?: Map<string, { width: number; height: number }>;

  constructor(cacheDirPath: string) {
    this.cacheDir = join(cacheDirPath, 'cache');
  }

  /**
   * Get cached thumbnail from disk or generate it.
   */
  async getThumbnail(filePath: string, width: number): Promise<ImageCacheResponse> {
    try {
      const cacheKey = this.getCacheKey(filePath);
      const cachedPath = join(this.cacheDir, `${cacheKey}.png`);

      if (this.isCached(cachedPath)) {
        return { image: `file://${cachedPath}` };
      }

      // Generate new thumbnail
      const result = await this.generateThumbnail(filePath, width);
      if (result.error) {
        return result;
      }

      // Save to cache
      writeFileSync(cachedPath, Buffer.from(result.image!, 'base64'));
      this.addToMemoryCache(filePath, cachedPath);

      return { image: `file://${cachedPath}` };
    } catch (error) {
      console.error('ImageCacheService.getThumbnail error:', error);
      return { error: 'Failed to load thumbnail' };
    }
  }

  /**
   * Get original image file path.
   */
  getOriginalImagePath(filePath: string): ImageCacheResponse {
    if (existsSync(filePath)) {
      return { image: `file://${filePath}` };
    }
    return { error: 'Original not found' };
  }

  /**
   * Get original image dimensions.
   */
  async getImageDimensions(filePath: string): Promise<ImageCacheResponse> {
    try {
      const buffer = readFileSync(filePath);
      const metadata = await this.extractMetadata(buffer);

      if (metadata.error) {
        return { error: metadata.error };
      }

      // Update in-memory cache with dimensions
      this.updateDimensionsCache(filePath, metadata.width, metadata.height);

      return { image: `file://${filePath}` };
    } catch (error) {
      console.error('ImageCacheService.getImageDimensions error:', error);
      return { error: 'Failed to get image dimensions' };
    }
  }

  /**
   * Get file size in KB.
   */
  getFileSize(filePath: string): ImageCacheResponse {
    try {
      const stats = statSync(filePath);
      return { image: `${(stats.size / 1024).toFixed(1)} KB` };
    } catch (error) {
      console.error('ImageCacheService.getFileSize error:', error);
      return { error: 'Failed to get file size' };
    }
  }

  /**
   * Get image format.
   */
  getImageFormat(filePath: string): ImageCacheResponse {
    try {
      const ext = filePath.split('.').pop()?.toLowerCase() || '';
      const formatMap: Record<string, string> = {
        jpg: 'JPEG', jpeg: 'JPEG', png: 'PNG', gif: 'GIF',
        webp: 'WEBP', heic: 'HEIC', heif: 'HEIF'
      };

      return { image: formatMap[ext] || 'UNKNOWN' };
    } catch (error) {
      console.error('ImageCacheService.getImageFormat error:', error);
      return { error: 'Failed to determine format' };
    }
  }

  /**
   * Get all cached thumbnails.
   */
  getCachedThumbnails(): ImageCacheResponse[] {
    try {
      const files = readdirSync(this.cacheDir).filter((f) => f.endsWith('.png'));
      return files.map((file) => ({ image: `file://${join(this.cacheDir, file)}` }));
    } catch (error) {
      console.error('ImageCacheService.getCachedThumbnails error:', error);
      return [];
    }
  }

  /**
   * Clear all cached thumbnails.
   */
  async clearCache(): Promise<ImageCacheResponse> {
    try {
      const files = readdirSync(this.cacheDir).filter((f) => f.endsWith('.png'));
      if (files.length > 0) {
        files.forEach((file) => unlinkSync(join(this.cacheDir, file)));
        return { image: 'Cache cleared successfully' };
      }

      return { error: 'No cached thumbnails to clear' };
    } catch (error) {
      console.error('ImageCacheService