import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import GalleryView from '../GalleryView';
import { getPhotos } from '../../services/api';
import { usePhotoStore } from '../../stores/photoStore';

vi.mock('../../services/api', () => ({
  batchDeletePhotos: vi.fn(),
  batchExportPhotos: vi.fn(),
  batchSharePhotos: vi.fn(),
  getLibraryPhotos: vi.fn(),
  getPhotos: vi.fn(),
  scanDirectory: vi.fn(),
  selectDirectory: vi.fn(),
}));

vi.mock('../../hooks/useKeyboard', () => ({
  useKeyboard: vi.fn(),
}));

vi.mock('../../hooks/useMotionNavigate', () => ({
  useMotionNavigate: () => vi.fn(),
}));

vi.mock('../../components/layout', () => ({
  StatusBar: () => null,
  Toolbar: () => null,
}));

vi.mock('../../components/gallery', () => ({
  PhotoGrid: () => null,
}));

vi.mock('../../components/gallery/BatchOperationsBar', () => ({
  default: () => null,
}));

vi.mock('../../components/filters/FilterPanel', () => ({
  default: () => null,
}));

vi.mock('../../components/gallery/MetadataPreview', () => ({
  default: () => null,
}));

const albumPath = '/photos/vacation';
const libraryPhoto = {
  id: 'library-photo',
  path: '/photos/library.jpg',
  filename: 'library.jpg',
};
const albumPhoto = {
  id: 'album-photo',
  path: `${albumPath}/beach.jpg`,
  filename: 'beach.jpg',
};

describe('GalleryView album navigation', () => {
  beforeEach(() => {
    usePhotoStore.setState({
      photos: [libraryPhoto],
      currentDirectory: null,
      isLoading: false,
      loadingProgress: null,
      error: null,
      viewStateCache: {},
    });
    vi.mocked(getPhotos).mockResolvedValue([albumPhoto]);
    window.electronAPI.getCurrentDirectory = vi.fn(async () => albumPath);
  });

  it('loads the album after returning from the non-empty library view', async () => {
    render(
      <MemoryRouter initialEntries={['/gallery']}>
        <GalleryView />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(usePhotoStore.getState().photos).toEqual([albumPhoto]);
    });
    expect(usePhotoStore.getState().currentDirectory).toBe(albumPath);
    expect(getPhotos).toHaveBeenCalledTimes(1);
  });
});
