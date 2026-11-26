import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'fs';
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
  it('migrates existing people data and queues photos without saved scan status', async () => {
    const storageDirectory = join(userDataPath, 'storage');
    mkdirSync(storageDirectory);
    writeFileSync(
      join(storageDirectory, 'people-index-v1.json'),
      JSON.stringify({ version: 1, faces: [], names: {} })
    );
    const photo = {
      id: 'photo-1',
      path: '/library/one.jpg',
      filename: 'one.jpg',
    };

    await expect(new PeopleIndex().getFaceScanQueue([photo])).resolves.toEqual({
      photos: [photo],
      total: 1,
      checked: 0,
      failed: 0,
    });
    expect(
      JSON.parse(
        readFileSync(join(storageDirectory, 'people-index-v1.json'), 'utf8')
      ).version
    ).toBe(3);
  });

  it('moves existing per-photo scan markers from v2 into the compact journal', async () => {
    const storageDirectory = join(userDataPath, 'storage');
    mkdirSync(storageDirectory);
    writeFileSync(
      join(storageDirectory, 'people-index-v1.json'),
      JSON.stringify({
        version: 2,
        faces: [],
        names: {},
        photoScanStates: {
          '/library/one.jpg': { photoId: 'photo-1', status: 'complete' },
        },
      })
    );
    const photo = {
      id: 'photo-1',
      path: '/library/one.jpg',
      filename: 'one.jpg',
    };

    await expect(new PeopleIndex().getFaceScanQueue([photo])).resolves.toEqual({
      photos: [],
      total: 1,
      checked: 1,
      failed: 0,
    });
    expect(
      existsSync(join(storageDirectory, 'people-scan-index-v1.jsonl'))
    ).toBe(true);
    expect(
      JSON.parse(
        readFileSync(join(storageDirectory, 'people-index-v1.json'), 'utf8')
      ).version
    ).toBe(3);
  });

  it('remembers zero-face scans without rewriting the face index', async () => {
    const photo = {
      id: 'photo-1',
      path: '/library/one.jpg',
      filename: 'one.jpg',
    };
    const index = new PeopleIndex();

    await expect(index.savePhotoFaces(photo.path, photo.id, [])).resolves.toBe(
      null
    );

    await expect(new PeopleIndex().getFaceScanQueue([photo])).resolves.toEqual({
      photos: [],
      total: 1,
      checked: 1,
      failed: 0,
    });
    expect(
      existsSync(join(userDataPath, 'storage', 'people-index-v1.json'))
    ).toBe(false);
    expect(
      existsSync(join(userDataPath, 'storage', 'people-scan-index-v1.jsonl'))
    ).toBe(true);
  });

  it('removes old detections when a rescan finds no faces', async () => {
    const photo = {
      id: 'photo-1',
      path: '/library/one.jpg',
      filename: 'one.jpg',
    };
    const index = new PeopleIndex();
    await index.savePhotoFaces(photo.path, photo.id, [
      {
        photoPath: photo.path,
        box: [0.1, 0.2, 0.3, 0.4],
        descriptor: Array.from({ length: 64 }, (_, item) =>
          item === 0 ? 1 : 0
        ),
      },
    ]);

    await expect(
      index.savePhotoFaces(photo.path, photo.id, [])
    ).resolves.toEqual([]);
    await expect(new PeopleIndex().getGroups()).resolves.toEqual([]);
  });

  it('forgets a person group without deleting photos or marking them unscanned', async () => {
    const photoPath = '/library/one.jpg';
    const index = new PeopleIndex();
    const groups = await index.savePhotoFaces(photoPath, 'photo-1', [
      {
        photoPath,
        box: [0.1, 0.2, 0.3, 0.4],
        descriptor: Array.from({ length: 64 }, (_, item) =>
          item === 0 ? 1 : 0
        ),
      },
    ]);
    if (!groups) throw new Error('Expected detected faces to create a group');
    await index.renamePerson(groups[0].id, 'Alex');

    await index.forgetPerson(groups[0].id);

    await expect(new PeopleIndex().getGroups()).resolves.toEqual([]);
    await expect(
      new PeopleIndex().getFaceScanQueue([
        { id: 'photo-1', path: photoPath, filename: 'one.jpg' },
      ])
    ).resolves.toEqual({
      photos: [],
      total: 1,
      checked: 1,
      failed: 0,
    });
  });

  it('queues new and changed photos but keeps unchanged scans out of the queue', async () => {
    const index = new PeopleIndex();
    const unchanged = {
      id: 'photo-1',
      path: '/library/one.jpg',
      filename: 'one.jpg',
    };
    const changed = { ...unchanged, id: 'photo-2' };
    await index.savePhotoFaces(unchanged.path, unchanged.id, []);

    await expect(index.getFaceScanQueue([unchanged, changed])).resolves.toEqual(
      {
        photos: [changed],
        total: 2,
        checked: 1,
        failed: 0,
      }
    );
  });

  it('keeps failed photos out of automatic scans and exposes an explicit retry', async () => {
    const index = new PeopleIndex();
    const photo = {
      id: 'photo-1',
      path: '/library/one.jpg',
      filename: 'one.jpg',
    };
    await index.recordPhotoScanFailure(photo.path, photo.id);

    await expect(index.getFaceScanQueue([photo])).resolves.toEqual({
      photos: [],
      total: 1,
      checked: 0,
      failed: 1,
    });
    await expect(
      index.getFaceScanQueue([photo], 'retry-failed')
    ).resolves.toEqual({
      photos: [photo],
      total: 1,
      checked: 0,
      failed: 1,
    });
    await expect(new PeopleIndex().getFaceScanQueue([photo])).resolves.toEqual({
      photos: [],
      total: 1,
      checked: 0,
      failed: 1,
    });
  });

  it('persists face groups and user-assigned names across index instances', async () => {
    const firstIndex = new PeopleIndex();
    const groups = await firstIndex.savePhotoFaces(
      '/library/one.jpg',
      'photo-1',
      [
        {
          photoPath: '/library/one.jpg',
          box: [0.1, 0.2, 0.3, 0.4],
          descriptor: Array.from({ length: 64 }, (_, index) =>
            index === 0 ? 1 : 0
          ),
        },
      ]
    );
    if (!groups) throw new Error('Expected detected faces to create a group');
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
    await index.savePhotoFaces('/library/one.jpg', 'photo-1', [
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
