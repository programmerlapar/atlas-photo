import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import PeopleView from '../PeopleView';

const { navigate, detectFaces, initializeFaceDetection } = vi.hoisted(() => ({
  navigate: vi.fn(),
  detectFaces: vi.fn(),
  initializeFaceDetection: vi.fn(),
}));

vi.mock('../../hooks/useMotionNavigate', () => ({
  useMotionNavigate: () => navigate,
}));
vi.mock('../../services/faceDetection', () => ({
  detectFaces,
  initializeFaceDetection,
}));

beforeEach(() => {
  vi.clearAllMocks();
  window.electronAPI.getFaceGroupingEnabled = vi.fn(async () => false);
  window.electronAPI.getPeopleGroups = vi.fn(async () => []);
  window.electronAPI.getLibraryPhotos = vi.fn(async () => []);
  window.electronAPI.getPhotoThumbnailData = vi.fn(async () => new Uint8Array([1]));
  window.electronAPI.saveDetectedFaces = vi.fn(async () => []);
  window.electronAPI.renamePerson = vi.fn(async () => []);
  initializeFaceDetection.mockResolvedValue(undefined);
});

describe('PeopleView', () => {
  it('keeps scanning unavailable until face grouping is enabled', async () => {
    render(<PeopleView />);

    expect(await screen.findByText('Face grouping is off')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Open Settings' })).toBeInTheDocument();
    expect(window.electronAPI.getLibraryPhotos).not.toHaveBeenCalled();
  });

  it('scans locally, reports progress, and preserves the safe empty result', async () => {
    window.electronAPI.getFaceGroupingEnabled = vi.fn(async () => true);
    window.electronAPI.getLibraryPhotos = vi.fn(async () => [
      { id: 'photo-1', path: '/library/one.jpg', filename: 'one.jpg' },
    ]);
    detectFaces.mockResolvedValue([]);

    render(<PeopleView />);
    await userEvent.setup().click(
      (await screen.findAllByRole('button', { name: 'Scan library' }))[0]
    );

    expect(await screen.findByText('Checked 1 photos. Similar faces are grouped below.')).toBeInTheDocument();
    expect(initializeFaceDetection).toHaveBeenCalledOnce();
    expect(detectFaces).toHaveBeenCalledWith('/library/one.jpg', new Uint8Array([1]));
    expect(window.electronAPI.saveDetectedFaces).toHaveBeenCalledWith('/library/one.jpg', []);
    expect(screen.getByText('No people found yet')).toBeInTheDocument();
  });

  it('shows an actionable retry when the people index cannot be loaded', async () => {
    window.electronAPI.getFaceGroupingEnabled = vi.fn(async () => {
      throw new Error('storage unavailable');
    });
    render(<PeopleView />);

    expect(await screen.findByRole('alert')).toHaveTextContent('People data could not be loaded');
    expect(screen.getByRole('button', { name: 'Retry loading' })).toBeInTheDocument();
    await waitFor(() => expect(window.electronAPI.getFaceGroupingEnabled).toHaveBeenCalledOnce());
  });
});
