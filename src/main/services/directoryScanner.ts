import { readdir, stat } from 'fs/promises';
import { join } from 'path';
import { isPhotoFile } from '../../shared/constants/fileTypes';
import type { Photo } from '../../shared/types/photo';

/**
 * Scans a directory recursively for photo files
 * @param directoryPath - The path to scan
 * @param onProgress - Optional callback for progress updates
 * @returns Array of photo file paths
 */
export const scanDirectory = async (
  directoryPath: string,
  onProgress?: (progress: {
    current: number;
    total: number;
    path: string;
  }) => void
): Promise<Photo[]> => {
  const photos: Photo[] = [];
  let totalFiles = 0;
  let processedFiles = 0;

  /**
   * Recursively scans a directory for photo files
   */
  const scanRecursive = async (dirPath: string): Promise<void> => {
    try {
      const entries = await readdir(dirPath, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = join(dirPath, entry.name);

        if (entry.isDirectory()) {
          // Recursively scan subdirectories
          await scanRecursive(fullPath);
        } else if (entry.isFile() && isPhotoFile(entry.name)) {
          totalFiles++;
          const stats = await stat(fullPath);

          const photo: Photo = {
            id: `${fullPath}-${stats.mtimeMs}`, // Unique ID based on path and modification time
            path: fullPath,
            filename: entry.name,
          };

          photos.push(photo);
          processedFiles++;

          if (onProgress) {
            onProgress({
              current: processedFiles,
              total: totalFiles,
              path: fullPath,
            });
          }
        }
      }
    } catch (error) {
      // Skip directories that can't be accessed (permissions, etc.)
      console.error(`Error scanning directory ${dirPath}:`, error);
    }
  };

  await scanRecursive(directoryPath);

  return photos;
};
