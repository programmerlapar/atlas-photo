/**
 * Thumbnail Cache - LRU (Least Recently Used) cache for generated thumbnails
 * Prevents regenerating thumbnails on every render by caching them separately
 */

interface CacheEntry<T> {
  value: T;
  timestamp: number;
}

class LRUCache<K, V> {
  private maxSize: number;
  private map = new Map<K, CacheEntry<V>>();

  constructor(maxSize = 1000) {
    this.maxSize = maxSize;
  }

  get(key: K): V | undefined {
    const entry = this.map.get(key);
    if (entry) {
      // Move to end (most recently used)
      this.map.delete(key);
      this.map.set(key, entry);
      return entry.value;
    }
    return undefined;
  }

  set(key: K, value: V): void {
    const existing = this.map.get(key);
    if (existing) {
      // Update existing entry
      this.map.delete(key);
    } else {
      // Evict oldest entries if at capacity
      while (this.map.size >= this.maxSize && this.map.size > 0) {
        const firstKey = this.map.keys().next().value;
        this.map.delete(firstKey!);
      }
    }

    this.map.set(key, { value, timestamp: Date.now() });
  }

  clear(): void {
    this.map.clear();
  }

  get size(): number {
    return this.map.size;
  }
}

// Global thumbnail cache (1000 entries max)
const thumbnailCache = new LRUCache<string, string>(1000);

/**
 * Get cached thumbnail or undefined if not in cache
 */
export function getCachedThumbnail(filePath: string): string | undefined {
  return thumbnailCache.get(filePath);
}

/**
 * Cache a generated thumbnail
 */
export function cacheThumbnail(filePath: string, thumbnailData: string): void {
  thumbnailCache.set(filePath, thumbnailData);
}

/**
 * Clear all cached thumbnails (useful for app restart or forced refresh)
 */
export function clearThumbnailCache(): void {
  thumbnailCache.clear();
}

/**
 * Check if a file's thumbnail is in cache
 */
export function hasCachedThumbnail(filePath: string): boolean {
  return thumbnailCache.get(filePath) !== undefined;
}