import { isAbsolute, relative, resolve } from 'path';

const isPathInsideRoot = (filePath: string, rootPath: string): boolean => {
  const relativePath = relative(resolve(rootPath), resolve(filePath));
  return (
    relativePath !== '' &&
    !relativePath.startsWith('..') &&
    !isAbsolute(relativePath)
  );
};

/** Checks that a renderer-supplied path is an indexed photo in a configured library. */
export const isApprovedLibraryPhotoPath = (
  photoPath: string,
  libraryRoots: string[],
  approvedPhotoPaths: Iterable<string>
): boolean => {
  if (!isAbsolute(photoPath)) return false;

  const resolvedPhotoPath = resolve(photoPath);
  const isInLibrary = libraryRoots.some((rootPath) =>
    isPathInsideRoot(resolvedPhotoPath, rootPath)
  );
  if (!isInLibrary) return false;

  for (const approvedPhotoPath of approvedPhotoPaths) {
    if (resolve(approvedPhotoPath) === resolvedPhotoPath) return true;
  }

  return false;
};
