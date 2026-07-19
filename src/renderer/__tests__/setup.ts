import '@testing-library/jest-dom';

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
