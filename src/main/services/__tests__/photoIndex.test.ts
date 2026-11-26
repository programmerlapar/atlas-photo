import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

const mockApp = vi.hoisted(() => ({ userDataPath: '' }));

vi.mock('electron', () => ({
  app: { getPath: () => mockApp.userDataPath },
}));

import { PhotoIndex } from '../photoIndex';

describe('PhotoIndex', () => {
  let workspace: string;
  let libraryRoot: string;

  beforeEach(() => {
    workspace = mkdtempSync(join(tmpdir(), 'atlas-photo-index-'));
    mockApp.userDataPath = join(workspace, 'user-data');
    libraryRoot = join(workspace, 'library');
    mkdirSync(join(libraryRoot, 'nested'), { recursive: true });
  });

  afterEach(() => rmSync(workspace, { recursive: true, force: true }));

  it('invalidates cached results when a nested folder gains a photo', async () => {
    const index = new PhotoIndex();
    await index.save(libraryRoot, []);

    writeFileSync(join(libraryRoot, 'nested', 'new-photo.jpg'), 'photo');

    await expect(index.get(libraryRoot)).resolves.toBeNull();
  });

  it('returns the cached photos while the directory tree is unchanged', async () => {
    const index = new PhotoIndex();
    const photo = {
      id: 'photo-1',
      path: join(libraryRoot, 'nested', 'photo.jpg'),
      filename: 'photo.jpg',
    };
    writeFileSync(photo.path, 'photo');
    await index.save(libraryRoot, [photo]);

    await expect(index.get(libraryRoot)).resolves.toEqual([photo]);
  });
});
