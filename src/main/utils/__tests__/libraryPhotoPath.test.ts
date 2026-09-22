import { describe, expect, it } from 'vitest';
import { isApprovedLibraryPhotoPath } from '../libraryPhotoPath';

describe('isApprovedLibraryPhotoPath', () => {
  const libraryRoot = '/photos/library';
  const approvedPhoto = `${libraryRoot}/vacation/beach.jpg`;

  it('accepts an indexed photo inside a library root', () => {
    expect(
      isApprovedLibraryPhotoPath(approvedPhoto, [libraryRoot], [approvedPhoto])
    ).toBe(true);
  });

  it('rejects an approved path outside every library root', () => {
    const outsidePhoto = '/photos/other/private.jpg';

    expect(
      isApprovedLibraryPhotoPath(outsidePhoto, [libraryRoot], [outsidePhoto])
    ).toBe(false);
  });

  it('rejects a path inside a library root that is not indexed', () => {
    const unindexedPhoto = `${libraryRoot}/private.jpg`;

    expect(
      isApprovedLibraryPhotoPath(unindexedPhoto, [libraryRoot], [approvedPhoto])
    ).toBe(false);
  });

  it('rejects traversal paths that resolve outside the library root', () => {
    const traversalPath = `${libraryRoot}/../private.jpg`;

    expect(
      isApprovedLibraryPhotoPath(traversalPath, [libraryRoot], [traversalPath])
    ).toBe(false);
  });

  it('accepts an indexed photo from another configured library root', () => {
    const secondRoot = '/photos/archive';
    const archivedPhoto = `${secondRoot}/old.jpg`;

    expect(
      isApprovedLibraryPhotoPath(
        archivedPhoto,
        [libraryRoot, secondRoot],
        [archivedPhoto]
      )
    ).toBe(true);
  });
});
