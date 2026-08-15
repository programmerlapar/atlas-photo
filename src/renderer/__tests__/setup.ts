import { vi, beforeEach, afterEach } from 'vitest';

// jsdom under Node 26 does not expose localStorage (its experimental global
// shadows the jsdom window property). Stores read it at import time, so a
// minimal in-memory shim keeps the whole renderer graph importable in tests.
const localStorageShim = (() => {
  const data = new Map<string, string>();
  return {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => void data.set(key, String(value)),
    removeItem: (key: string) => void data.delete(key),
    clear: () => data.clear(),
  };
})();

if (typeof localStorage === 'undefined') {
  Object.defineProperty(globalThis, 'localStorage', {
    value: localStorageShim,
    configurable: true,
    writable: true,
  });
}

// Stub electronAPI used throughout the renderer
Object.defineProperty(window, 'electronAPI', {
  value: {
    onDirectoryScanProgress: () => {},
    onPhotoAdded: () => {},
    onPhotoRemoved: () => {},
    onThumbnailGenerated: () => {},
    removeAllListeners: () => {},
    getCurrentDirectory: async () => null,
    getRecentDirectories: async () => [],
  },
  writable: true,
});

// IntersectionObserver mock used by PhotoGrid & PhotoCard
class MockIntersectionObserver {
  callback: IntersectionObserverCallback;
  constructor(cb: IntersectionObserverCallback) {
    this.callback = cb;
  }
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
  // Helper to simulate the sentinel becoming visible
  triggerIntersect(isIntersecting = true) {
    this.callback(
      [{ isIntersecting } as IntersectionObserverEntry],
      this as unknown as IntersectionObserver
    );
  }
}

let lastObserver: MockIntersectionObserver | null = null;

beforeEach(() => {
  lastObserver = null;
  vi.stubGlobal(
    'IntersectionObserver',
    class extends MockIntersectionObserver {
      constructor(cb: IntersectionObserverCallback) {
        super(cb);
        lastObserver = this;
      }
    }
  );
});

afterEach(() => {
  vi.restoreAllMocks();
});

// Expose for tests
export const getLastObserver = () => lastObserver;
