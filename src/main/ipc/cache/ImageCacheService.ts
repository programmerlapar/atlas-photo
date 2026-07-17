import { generateThumbnail } from '../../services/thumbnailGenerator';

/** Deduplicates concurrent thumbnail requests; generated files remain cached on disk. */
export type ThumbnailPriority = 'visible' | 'prefetch';

export class ImageCacheService {
  private readonly inFlight = new Map<string, Promise<string | null>>();
  private activeRequests = 0;
  private readonly visibleRequests: Array<() => void> = [];
  private readonly prefetchRequests: Array<() => void> = [];
  // HEIC decoding is CPU and memory intensive. One conversion keeps the UI
  // responsive on modest machines; foreground requests always queue ahead.
  private readonly maxConcurrentRequests = 1;

  getThumbnail(
    filePath: string,
    size = 500,
    priority: ThumbnailPriority = 'visible'
  ): Promise<string | null> {
    const key = `${filePath}:${size}`;
    const existing = this.inFlight.get(key);
    if (existing) return existing;

    const request = this.enqueue(() => generateThumbnail(filePath, size), priority).finally(() =>
      this.inFlight.delete(key)
    );
    this.inFlight.set(key, request);
    return request;
  }

  private enqueue(
    task: () => Promise<string | null>,
    priority: ThumbnailPriority
  ): Promise<string | null> {
    return new Promise((resolve, reject) => {
      const run = () => {
        this.activeRequests++;
        task()
          .then(resolve, reject)
          .finally(() => {
            this.activeRequests--;
            this.runNext();
          });
      };

      if (this.activeRequests < this.maxConcurrentRequests) run();
      else this.getQueue(priority).push(run);
    });
  }

  private getQueue(priority: ThumbnailPriority): Array<() => void> {
    return priority === 'visible' ? this.visibleRequests : this.prefetchRequests;
  }

  private runNext(): void {
    this.visibleRequests.shift()?.() ?? this.prefetchRequests.shift()?.();
  }
}
