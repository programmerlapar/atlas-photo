import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AppSidebar from '../AppSidebar';
import { removeRecentDirectory } from '../../../services/api';

const albumPath = '/photos/vacation';

describe('AppSidebar', () => {
  it('removes an album immediately after it is removed from collections', async () => {
    let recentDirectories = [albumPath];
    window.electronAPI.getRecentDirectories = vi.fn(async () => [
      ...recentDirectories,
    ]);
    window.electronAPI.removeRecentDirectory = vi.fn(async (path: string) => {
      recentDirectories = recentDirectories.filter(
        (directory) => directory !== path
      );
      return { success: true };
    });

    render(
      <MemoryRouter initialEntries={['/albums']}>
        <AppSidebar />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTitle(albumPath)).toBeTruthy();
    });

    await removeRecentDirectory(albumPath);

    await waitFor(() => {
      expect(screen.queryByTitle(albumPath)).toBeNull();
    });
  });
});
