import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AlbumsView from '../AlbumsView';
import { encodeFilePath } from '../../utils/photoId';

const albumPath = '/photos/vacation';

const coverSrc = (filePath: string) =>
  `atlas-photo://${encodeFilePath(filePath)}`;

/**
 * Stubs the album APIs used by AlbumsView.loadAlbums. The default album info
 * points at the first-photo thumbnail so tests can prove the custom cover
 * wins when it is present.
 */
const mockAlbumApis = ({
  photoPath = null,
  thumbnailPath = null,
}: { photoPath?: string | null; thumbnailPath?: string | null } = {}) => {
  window.electronAPI.getRecentDirectories = vi.fn(
    async (): Promise<string[]> => [albumPath]
  );
  window.electronAPI.getAlbumInfo = vi.fn(async () => ({
    photoCount: 3,
    firstPhotoPath: `${albumPath}/first.jpg`,
    thumbnailPath: '/cache/first-thumb.jpg',
  }));
  window.electronAPI.getAlbumCover = vi.fn(async () => ({
    photoPath,
    thumbnailPath,
  }));
};

const renderAlbums = () =>
  render(
    <MemoryRouter>
      <AlbumsView />
    </MemoryRouter>
  );

describe('AlbumsView – custom album cover selection', () => {
  it('uses the custom cover photo when the cover has no thumbnail', async () => {
    mockAlbumApis({ photoPath: `${albumPath}/cover.jpg`, thumbnailPath: null });
    renderAlbums();

    const img = await screen.findByAltText('vacation');
    expect(img.getAttribute('src')).toBe(coverSrc(`${albumPath}/cover.jpg`));
  });

  it('prefers the custom cover thumbnail when available', async () => {
    mockAlbumApis({
      photoPath: `${albumPath}/cover.jpg`,
      thumbnailPath: '/cache/cover-thumb.jpg',
    });
    renderAlbums();

    const img = await screen.findByAltText('vacation');
    expect(img.getAttribute('src')).toBe(coverSrc('/cache/cover-thumb.jpg'));
  });

  it('falls back to the first-photo thumbnail without a custom cover', async () => {
    mockAlbumApis();
    renderAlbums();

    const img = await screen.findByAltText('vacation');
    expect(img.getAttribute('src')).toBe(coverSrc('/cache/first-thumb.jpg'));
  });
});
