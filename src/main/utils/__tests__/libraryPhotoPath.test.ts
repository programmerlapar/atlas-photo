import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { mkdirSync, mkdtempSync, symlinkSync, writeFileSync, rmSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { isApprovedLibraryPhotoPath } from '../libraryPhotoPath';

describe('isApprovedLibraryPhotoPath', () => {
  let workspace: string;
  let libraryRoot: string;
  let approvedPhoto: string;

  beforeEach(() => {
    workspace = mkdtempSync(join(tmpdir(), 'atlas-library-path-'));
    libraryRoot = join(workspace, 'library');
    mkdirSync(join(libraryRoot, 'vacation'), { recursive: true });
    approvedPhoto = join(libraryRoot, 'vacation', 'beach.jpg');
    writeFileSync(approvedPhoto, 'photo');
  });

  afterEach(() => rmSync(workspace, { recursive: true, force: true }));

  it('accepts an indexed photo inside a library root', () => {
    expect(
      isApprovedLibraryPhotoPath(approvedPhoto, [libraryRoot], [approvedPhoto])
    ).toBe(true);
  });

  it('rejects an approved path outside every library root', () => {
    const outsidePhoto = join(workspace, 'private.jpg');
    writeFileSync(outsidePhoto, 'private');

    expect(
      isApprovedLibraryPhotoPath(outsidePhoto, [libraryRoot], [outsidePhoto])
    ).toBe(false);
  });

  it('rejects a path inside a library root that is not indexed', () => {
    const unindexedPhoto = join(libraryRoot, 'private.jpg');
    writeFileSync(unindexedPhoto, 'private');

    expect(
      isApprovedLibraryPhotoPath(unindexedPhoto, [libraryRoot], [approvedPhoto])
    ).toBe(false);
  });

  it('rejects traversal paths that resolve outside the library root', () => {
    const outsidePhoto = join(workspace, 'private.jpg');
    writeFileSync(outsidePhoto, 'private');
    const traversalPath = join(libraryRoot, '..', 'private.jpg');

    expect(
      isApprovedLibraryPhotoPath(traversalPath, [libraryRoot], [traversalPath])
    ).toBe(false);
  });

  it('accepts an indexed photo from another configured library root', () => {
    const secondRoot = join(workspace, 'archive');
    const archivedPhoto = join(secondRoot, 'old.jpg');
    mkdirSync(secondRoot);
    writeFileSync(archivedPhoto, 'archive');

    expect(
      isApprovedLibraryPhotoPath(
        archivedPhoto,
        [libraryRoot, secondRoot],
        [archivedPhoto]
      )
    ).toBe(true);
  });

  it('rejects an indexed symlink that resolves outside the library root', () => {
    const outsidePhoto = join(workspace, 'private.jpg');
    const linkedPhoto = join(libraryRoot, 'linked.jpg');
    writeFileSync(outsidePhoto, 'private');
    symlinkSync(outsidePhoto, linkedPhoto);

    expect(
      isApprovedLibraryPhotoPath(linkedPhoto, [libraryRoot], [linkedPhoto])
    ).toBe(false);
  });
});
