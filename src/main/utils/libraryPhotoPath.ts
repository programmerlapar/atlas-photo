import { isAbsolute, relative, resolve } from 'path';
import { existsSync, realpathSync } from 'fs';

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

  if (!existsSync(photoPath)) return false;
  let resolvedPhotoPath: string;
  try {
    resolvedPhotoPath = realpathSync(photoPath);
  } catch {
    return false;
  }
  const isInLibrary = libraryRoots.some((rootPath) => {
    try {
      return isPathInsideRoot(resolvedPhotoPath, realpathSync(rootPath));
    } catch {
      return false;
    }
  });
  if (!isInLibrary) return false;

  for (const approvedPhotoPath of approvedPhotoPaths) {
    try {
      if (realpathSync(approvedPhotoPath) === resolvedPhotoPath) return true;
    } catch {
      continue;
    }
  }

  return false;
};
