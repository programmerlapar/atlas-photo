import { describe, it, expect, beforeEach } from 'vitest';
import { usePhotoStore } from '../photoStore';

// Reset the store between tests
beforeEach(() => {
  usePhotoStore.setState({
    photos: [],
    currentDirectory: null,
    isLoading: false,
    loadingProgress: null,
    error: null,
    viewStateCache: {},
  });
});

describe('photoStore – viewStateCache', () => {
  it('starts with an empty cache', () => {
    expect(usePhotoStore.getState().viewStateCache).toEqual({});
  });

  it('creates a cache entry on first cacheViewState call', () => {
    usePhotoStore.getState().cacheViewState('library', { scrollTop: 500 });

    const entry = usePhotoStore.getState().viewStateCache['library'];
    expect(entry).toEqual({ scrollTop: 500 });
  });

  it('merges partial updates into an existing entry', () => {
    const { cacheViewState } = usePhotoStore.getState();
    cacheViewState('library', { scrollTop: 500 });
    cacheViewState('library', { visibleCount: 120 });

    const entry = usePhotoStore.getState().viewStateCache['library'];
    expect(entry).toEqual({ scrollTop: 500, visibleCount: 120 });
  });

  it('keeps different view keys independent', () => {
    const { cacheViewState } = usePhotoStore.getState();
    cacheViewState('library', { scrollTop: 1000, visibleCount: 300 });
    cacheViewState('/home/photos/banten', { scrollTop: 200, visibleCount: 50 });

    expect(usePhotoStore.getState().viewStateCache['library']).toEqual({
      scrollTop: 1000,
      visibleCount: 300,
    });
    expect(
      usePhotoStore.getState().viewStateCache['/home/photos/banten']
    ).toEqual({ scrollTop: 200, visibleCount: 50 });
  });

  it('does not share state between view keys', () => {
    const { cacheViewState } = usePhotoStore.getState();
    cacheViewState('library', { scrollTop: 100 });
    cacheViewState('album-a', { scrollTop: 200 });

    // Mutating one should not affect the other
    cacheViewState('library', { scrollTop: 999 });
    expect(
      usePhotoStore.getState().viewStateCache['album-a']!.scrollTop
    ).toBe(200);
  });
});
