import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockClose, mockStat, mockWatch } = vi.hoisted(() => ({
  mockClose: vi.fn(),
  mockStat: vi.fn(),
  mockWatch: vi.fn(),
}));

vi.mock('fs', () => ({
  default: { watch: mockWatch },
  watch: mockWatch,
}));
vi.mock('fs/promises', () => ({
  default: { stat: mockStat },
  stat: mockStat,
}));

import { FileWatcher } from '../fileWatcher';

type WatchCallback = (
  eventType: string,
  filename: string
) => void | Promise<void>;

const emitEvent = async (eventType: string, filename: string) => {
  const callback = mockWatch.mock.calls[0]?.[2] as WatchCallback;
  await callback(eventType, filename);
};

beforeEach(() => {
  vi.clearAllMocks();
  mockWatch.mockReturnValue({ close: mockClose });
});

describe('FileWatcher', () => {
  it('notifies for an in-place photo change and refreshes its mtime-derived id', async () => {
    mockStat.mockResolvedValue({
      isFile: () => true,
      mtimeMs: 200,
    });
    const onPhotoAdded = vi.fn();
    const watcher = new FileWatcher();
    watcher.startWatching('/photos', onPhotoAdded);

    await emitEvent('change', 'edited.jpg');

    expect(onPhotoAdded).toHaveBeenCalledWith({
      id: '/photos/edited.jpg-200',
      path: '/photos/edited.jpg',
      filename: 'edited.jpg',
    });
  });

  it('deduplicates repeated events for the same file mtime', async () => {
    mockStat.mockResolvedValue({
      isFile: () => true,
      mtimeMs: 200,
    });
    const onPhotoAdded = vi.fn();
    const watcher = new FileWatcher();
    watcher.startWatching('/photos', onPhotoAdded);

    await emitEvent('change', 'edited.jpg');
    await emitEvent('change', 'edited.jpg');

    expect(onPhotoAdded).toHaveBeenCalledOnce();
  });

  it('processes a newer mtime queued while an update is in flight', async () => {
    mockStat
      .mockResolvedValueOnce({ isFile: () => true, mtimeMs: 200 })
      .mockResolvedValueOnce({ isFile: () => true, mtimeMs: 300 });
    let resolveFirstUpdate!: () => void;
    const firstUpdate = new Promise<void>((resolve) => {
      resolveFirstUpdate = resolve;
    });
    const onPhotoAdded = vi.fn((photo: { id: string }) => {
      if (photo.id.endsWith('-200')) return firstUpdate;
    });
    const watcher = new FileWatcher();
    watcher.startWatching('/photos', onPhotoAdded);

    const firstEvent = emitEvent('change', 'edited.jpg');
    await vi.waitFor(() => expect(onPhotoAdded).toHaveBeenCalledOnce());
    await emitEvent('change', 'edited.jpg');
    expect(onPhotoAdded).toHaveBeenCalledOnce();

    resolveFirstUpdate();
    await firstEvent;

    expect(onPhotoAdded).toHaveBeenCalledTimes(2);
    expect(onPhotoAdded.mock.calls[1]?.[0].id).toBe('/photos/edited.jpg-300');
  });
});
