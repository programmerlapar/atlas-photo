import { generateThumbnail } from '../../services/thumbnailGenerator';

/** Deduplicates concurrent thumbnail requests; generated files remain cached on disk. */
export class ImageCacheService {
  private readonly inFlight = new Map<string, Promise<string | null>>();
  private activeRequests = 0;
  private readonly pendingRequests: Array<() => void> = [];
  private readonly maxConcurrentRequests = 4;

  getThumbnail(filePath: string, size = 500): Promise<string | null> {
    const key = `${filePath}:${size}`;
    const existing = this.inFlight.get(key);
    if (existing) return existing;

    const request = this.enqueue(() => generateThumbnail(filePath, size)).finally(() =>
      this.inFlight.delete(key)
    );
    this.inFlight.set(key, request);
    return request;
  }

  private enqueue(task: () => Promise<string | null>): Promise<string | null> {
    return new Promise((resolve, reject) => {
      const run = () => {
        this.activeRequests++;
        task()
          .then(resolve, reject)
          .finally(() => {
            this.activeRequests--;
            this.pendingRequests.shift()?.();
          });
      };

      if (this.activeRequests < this.maxConcurrentRequests) run();
      else this.pendingRequests.push(run);
    });
  }
}
