import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { existsSync, mkdtempSync, rmSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

const { getUserDataPath } = vi.hoisted(() => ({ getUserDataPath: vi.fn() }));
vi.mock('electron', () => ({ app: { getPath: getUserDataPath } }));

import { PeopleIndex } from '../peopleIndex';

let userDataPath: string;

beforeEach(() => {
  userDataPath = mkdtempSync(join(tmpdir(), 'atlas-people-index-'));
  getUserDataPath.mockReturnValue(userDataPath);
});

afterEach(() => rmSync(userDataPath, { recursive: true, force: true }));

describe('PeopleIndex', () => {
  it('persists face groups and user-assigned names across index instances', async () => {
    const firstIndex = new PeopleIndex();
    const groups = await firstIndex.savePhotoFaces('/library/one.jpg', [
      {
        photoPath: '/library/one.jpg',
        box: [0.1, 0.2, 0.3, 0.4],
        descriptor: Array.from({ length: 64 }, (_, index) =>
          index === 0 ? 1 : 0
        ),
      },
    ]);
    await firstIndex.renamePerson(groups[0].id, 'Alex');

    const restoredGroups = await new PeopleIndex().getGroups();

    expect(restoredGroups).toEqual([
      {
        id: groups[0].id,
        name: 'Alex',
        photoPaths: ['/library/one.jpg'],
        faceCount: 1,
      },
    ]);
  });

  it('deletes persisted face data when cleared', async () => {
    const index = new PeopleIndex();
    await index.savePhotoFaces('/library/one.jpg', [
      {
        photoPath: '/library/one.jpg',
        box: [0.1, 0.2, 0.3, 0.4],
        descriptor: Array.from({ length: 64 }, (_, item) =>
          item === 0 ? 1 : 0
        ),
      },
    ]);
    const temporaryIndex = join(
      userDataPath,
      'storage',
      'people-index-v1.json.tmp'
    );
    writeFileSync(temporaryIndex, 'temporary face data');

    await index.clear();

    expect(
      existsSync(join(userDataPath, 'storage', 'people-index-v1.json'))
    ).toBe(false);
    expect(existsSync(temporaryIndex)).toBe(false);
    expect(await index.getGroups()).toEqual([]);
  });
});
