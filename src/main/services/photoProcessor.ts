import { scanDirectory } from './directoryScanner';
import { extractPhotoMetadata } from './exifExtractor';
import type { Photo } from '../../shared/types/photo';

/**
 * Processes photos by scanning directory, extracting metadata, and generating thumbnails
 * @param directoryPath - Path to the directory containing photos
 * @param onProgress - Optional callback for progress updates
 * @returns Array of processed photos with metadata and thumbnails
 */
export const processPhotos = async (
  directoryPath: string,
  onProgress?: (progress: {
    stage: 'scanning' | 'metadata' | 'thumbnails';
    current: number;
    total: number;
    path?: string;
  }) => void
): Promise<Photo[]> => {
  // Stage 1: Scan directory for photos
  if (onProgress) {
    onProgress({ stage: 'scanning', current: 0, total: 0 });
  }

  const photos = await scanDirectory(directoryPath, (progress) => {
    if (onProgress) {
      onProgress({
        stage: 'scanning',
        current: progress.current,
        total: progress.total,
        path: progress.path,
      });
    }
  });

  // Stage 2: Extract metadata for each photo
  if (onProgress) {
    onProgress({ stage: 'metadata', current: 0, total: photos.length });
  }

  for (let i = 0; i < photos.length; i++) {
    const photo = photos[i];
    const metadata = await extractPhotoMetadata(photo.path);

    if (metadata) {
      photo.metadata = metadata;
    }

    if (onProgress) {
      onProgress({
        stage: 'metadata',
        current: i + 1,
        total: photos.length,
        path: photo.path,
      });
    }
  }

  // Stage 3: Skip thumbnail generation - now done lazily when PhotoCard renders
  // This allows gallery to show immediately while thumbnails generate on-demand
  console.log(`[PhotoProcessor] Skipping initial thumbnail generation - will be done lazily on-demand`);

  return photos;
};
