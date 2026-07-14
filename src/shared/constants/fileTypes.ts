/**
 * Supported photo file extensions
 */
export const PHOTO_EXTENSIONS = [
  '.jpg',
  '.jpeg',
  '.png',
  '.gif',
  '.bmp',
  '.webp',
  '.heic',
  '.heif',
  '.tiff',
  '.tif',
  '.raw',
  '.cr2',
  '.nef',
  '.arw',
  '.dng',
] as const;

export type PhotoExtension = (typeof PHOTO_EXTENSIONS)[number];

/**
 * Checks if a filename is a macOS metadata/resource fork file
 * These files start with ._ and are not actual image files
 */
export const isMacOSMetadataFile = (filename: string): boolean => {
  return filename.startsWith('._');
};

/**
 * Check if a file is a HEIC/HEIF file
 * @param filename - The filename to check
 * @returns true if the file is a HEIC or HEIF file
 */
export const isHeicFile = (filename: string): boolean => {
  const lower = filename.toLowerCase();
  return lower.endsWith('.heic') || lower.endsWith('.heif');
};

/**
 * Checks if a file is a valid photo file (not a macOS metadata file)
 */
export const isPhotoFile = (filename: string): boolean => {
  // Skip macOS metadata files
  if (isMacOSMetadataFile(filename)) {
    return false;
  }

  const ext = filename.toLowerCase().substring(filename.lastIndexOf('.'));
  return (PHOTO_EXTENSIONS as readonly string[]).includes(ext);
};
