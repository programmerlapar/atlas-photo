import sharp from 'sharp';
import { mkdir, stat, readFile, writeFile, unlink, open } from 'fs/promises';
import { join, basename } from 'path';
import { existsSync } from 'fs';
import { app } from 'electron';
import { isMacOSMetadataFile } from '../../shared/constants/fileTypes';
import convert from 'heic-convert';
import * as exifr from 'exifr';

async function readBytes(filePath: string, count: number): Promise<Buffer> {
  const fh = await open(filePath, 'r');
  const buf = Buffer.alloc(count);
  await fh.read(buf, 0, count, 0);
  await fh.close();
  return buf;
}

/**
 * Generates a thumbnail for a photo file
 * @param photoPath - Path to the photo file
 * @param size - Thumbnail size (default: 300px)
 * @returns Path to the generated thumbnail file
 */
export const generateThumbnail = async (
  photoPath: string,
  size: number = 500
): Promise<string | null> => {
  try {
    // Skip macOS metadata files
    const filename = basename(photoPath);
    console.log(`[Thumbnail] Processing: ${filename} (${photoPath})`);
    
    if (isMacOSMetadataFile(filename)) {
      console.log(`[Thumbnail] Skipping macOS metadata file: ${filename}`);
      return null;
    }

    // Get cache directory for thumbnails
    const cacheDir = join(app.getPath('userData'), 'thumbnails');

    // Ensure cache directory exists
    if (!existsSync(cacheDir)) {
      await mkdir(cacheDir, { recursive: true });
    }

    // Generate cache file path based on photo path hash
    const pathHash = Buffer.from(photoPath)
      .toString('base64')
      .replace(/[/+=]/g, '_');
    // Versioned cache key: bump when generation pipeline changes (e.g. EXIF
    // auto-rotation) so stale, incorrectly-oriented thumbnails are regenerated.
    const thumbVersion = 'v2';
    const thumbnailPath = join(cacheDir, `${pathHash}_${size}_${thumbVersion}.jpg`);
    
    // For HEIC files, add a force flag to always regenerate if cache is corrupted
    // This ensures we always have valid thumbnails for HEIC files

    // Check if thumbnail already exists and is recent
    if (existsSync(thumbnailPath)) {
      const thumbnailStats = await stat(thumbnailPath);
      const photoStats = await stat(photoPath);

      // If thumbnail is newer than photo, validate cached version
      if (thumbnailStats.mtimeMs >= photoStats.mtimeMs) {
        // Validate that the cached thumbnail is a valid JPEG
        try {
          const fileBuffer = await readBytes(thumbnailPath, 2);
          const isJPEG = fileBuffer[0] === 0xFF && fileBuffer[1] === 0xD8;
          
          if (isJPEG && thumbnailStats.size > 0) {
            // Verify with sharp that it's readable
            try {
              const metadata = await sharp(thumbnailPath).metadata();
              if (metadata.format && metadata.width && metadata.height) {
                console.log(`[Thumbnail] Using validated cached thumbnail: ${thumbnailPath} (${metadata.width}x${metadata.height})`);
                return thumbnailPath;
              }
            } catch (validateError) {
              console.warn(`[Thumbnail] Cached thumbnail is corrupted, regenerating: ${thumbnailPath}`);
              // Fall through to regenerate
            }
          } else {
            console.warn(`[Thumbnail] Cached thumbnail is invalid (not JPEG or empty), regenerating: ${thumbnailPath}`);
            // Fall through to regenerate
          }
        } catch (readError) {
          console.warn(`[Thumbnail] Could not validate cached thumbnail, regenerating: ${thumbnailPath}`);
          // Fall through to regenerate
        }
      } else {
        console.log(`[Thumbnail] Cached thumbnail outdated, regenerating: ${thumbnailPath}`);
      }
    } else {
      console.log(`[Thumbnail] No cached thumbnail found, generating: ${thumbnailPath}`);
    }

    // Generate thumbnail
    // Sharp supports HEIC/HEIF natively, but may need additional plugins
    // Some HEIC files may have compression formats that require specific plugins
    const isHeic = filename.toLowerCase().endsWith('.heic') || filename.toLowerCase().endsWith('.heif');
    if (isHeic) {
      console.log(`[Thumbnail] Attempting to generate thumbnail for HEIC file: ${filename}`);
    }
    
    try {
      console.log(`[Thumbnail] Starting sharp processing for: ${filename}`);
      
      // For HEIC files, try multiple approaches
      if (isHeic) {
        console.log(`[Thumbnail] HEIC file detected, using optimized conversion strategy`);
      }
      
      // Process with sharp
      await sharp(photoPath, {
        // Enable HEIC support
        failOn: 'none', // Don't fail on unsupported formats, try to process anyway
        limitInputPixels: false, // Allow large images
      })
        .rotate() // Auto-apply EXIF orientation so thumbnails match the browser's from-image rendering
        .resize(size, size, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .jpeg({ 
          quality: 92, // Higher quality for better preview
          mozjpeg: true, // Use mozjpeg for better compatibility
        })
        .toFile(thumbnailPath);

      // Validate the generated thumbnail file
      if (!existsSync(thumbnailPath)) {
        throw new Error(`Thumbnail file was not created: ${thumbnailPath}`);
      }

      // Check file size - should be > 0 bytes
      const thumbnailStats = await stat(thumbnailPath);
      if (thumbnailStats.size === 0) {
        throw new Error(`Thumbnail file is empty: ${thumbnailPath}`);
      }

      // Verify it's a valid JPEG by reading the file header
      const fileBuffer = await readBytes(thumbnailPath, 2);
      const isJPEG = fileBuffer[0] === 0xFF && fileBuffer[1] === 0xD8;
      if (!isJPEG) {
        throw new Error(`Thumbnail file is not a valid JPEG: ${thumbnailPath}`);
      }

      // Verify with sharp metadata that it's a valid image
      try {
        const metadata = await sharp(thumbnailPath).metadata();
        if (!metadata.format || !metadata.width || !metadata.height) {
          throw new Error(`Thumbnail metadata is invalid: ${thumbnailPath}`);
        }
        console.log(`[Thumbnail] Validated thumbnail: ${metadata.width}x${metadata.height} ${metadata.format} (${thumbnailStats.size} bytes)`);
      } catch (validateError) {
        const errorMsg = validateError instanceof Error ? validateError.message : String(validateError);
        throw new Error(`Thumbnail validation failed: ${errorMsg}`);
      }

      console.log(`[Thumbnail] Successfully generated and validated thumbnail: ${thumbnailPath}`);
      return thumbnailPath;
    } catch (sharpError) {
      // If sharp fails with HEIC-specific errors, log but don't throw
      // This allows the app to continue processing other photos
      const errorMessage =
        sharpError instanceof Error ? sharpError.message : String(sharpError);
      
      console.warn(`[Thumbnail] Sharp processing failed for ${filename}:`, {
        error: errorMessage,
        photoPath,
        isHeic,
      });
      
      // Check if it's a HEIC/HEIF decoding error
      // Common HEIC error patterns:
      // - "No decoding plugin installed for this compression format"
      // - "bad seek" errors
      // - "heif" related errors
      // - Format-specific errors
      const isHeicError =
        errorMessage.toLowerCase().includes('heif') ||
        errorMessage.toLowerCase().includes('heic') ||
        errorMessage.includes('No decoding plugin') ||
        errorMessage.includes('bad seek') ||
        errorMessage.includes('compression format') ||
        errorMessage.includes('11.6003') || // Specific HEIC codec error code
        errorMessage.includes('unsupported format');
      
      if (isHeicError || isHeic) {
        const sharpDecoderUnavailable =
          errorMessage.includes('No decoding plugin') ||
          errorMessage.includes('compression format');
        console.warn(
          `[Thumbnail] Sharp could not decode ${filename}; using the HEIC fallback.`
        );
        
        // A missing libheif decoder cannot be fixed by re-running Sharp with
        // different flags. Skip that expensive duplicate attempt and go
        // straight to the converter that supports this codec.
        if (!sharpDecoderUnavailable) {
          try {
            console.log(`[Thumbnail] Attempting alternative HEIC conversion for: ${filename}`);
          
          // Try to extract using different sharp options
          const image = sharp(photoPath, {
            failOn: 'none',
            limitInputPixels: false,
            pages: 1, // Only process first page for HEIC
          });
          
          const metadata = await image.metadata();
          console.log(`[Thumbnail] HEIC metadata extracted: ${metadata.width}x${metadata.height}, format: ${metadata.format}`);
          
          // Generate thumbnail with alternative approach
          await image
            .resize(size, size, {
              fit: 'inside',
              withoutEnlargement: true,
            })
            .jpeg({ 
              quality: 85,
              mozjpeg: true,
            })
            .toFile(thumbnailPath);
          
          // Validate the generated file
          if (existsSync(thumbnailPath)) {
            const thumbStats = await stat(thumbnailPath);
            if (thumbStats.size > 0) {
              const fileBuffer = await readBytes(thumbnailPath, 2);
              const isJPEG = fileBuffer[0] === 0xFF && fileBuffer[1] === 0xD8;
              if (isJPEG) {
                console.log(`[Thumbnail] Alternative HEIC conversion succeeded: ${thumbnailPath}`);
                return thumbnailPath;
              }
            }
          }
          
            console.warn(`[Thumbnail] Alternative HEIC conversion also failed for: ${filename}`);
          } catch (altError) {
            const altErrorMsg = altError instanceof Error ? altError.message : String(altError);
            console.warn(`[Thumbnail] Alternative HEIC conversion failed: ${altErrorMsg}`);
          }
        }
        
        // Try heic-convert library as final fallback
        try {
          console.log(`[Thumbnail] Attempting heic-convert library for: ${filename}`);
          
          // Read HEIC file
          const inputBuffer = await readFile(photoPath);
          
          // Convert HEIC to JPEG using heic-convert
          const outputBuffer = await convert({
            buffer: inputBuffer,
            format: 'JPEG',
            quality: 0.85,
          });
          
          // Write temporary JPEG file
          const tempJpegPath = join(cacheDir, `${pathHash}_temp.jpg`);
          await writeFile(tempJpegPath, outputBuffer);
          
          // Now use Sharp to resize the converted JPEG to thumbnail size
          await sharp(tempJpegPath)
            .resize(size, size, {
              fit: 'inside',
              withoutEnlargement: true,
            })
            .jpeg({ 
              quality: 85,
              mozjpeg: true,
            })
            .toFile(thumbnailPath);
          
          // Clean up temporary file
          try {
            if (existsSync(tempJpegPath)) {
              await unlink(tempJpegPath);
            }
          } catch (cleanupError) {
            // Ignore cleanup errors
          }
          
          // Validate the generated thumbnail
          if (existsSync(thumbnailPath)) {
            const thumbStats = await stat(thumbnailPath);
            if (thumbStats.size > 0) {
              const fileBuffer = await readBytes(thumbnailPath, 2);
              const isJPEG = fileBuffer[0] === 0xFF && fileBuffer[1] === 0xD8;
              if (isJPEG) {
                console.log(`[Thumbnail] heic-convert succeeded: ${thumbnailPath}`);
                return thumbnailPath;
              }
            }
          }
          
          console.warn(`[Thumbnail] heic-convert conversion succeeded but thumbnail validation failed for: ${filename}`);
        } catch (heicConvertError) {
          const heicErrorMsg = heicConvertError instanceof Error ? heicConvertError.message : String(heicConvertError);
          console.error(`[Thumbnail] heic-convert library also failed: ${heicErrorMsg}`);
        }
        
        // Try exifr.thumbnail() as final fallback - extracts embedded JPEG preview
        // from HEIC files without decoding the full image (much more reliable)
        try {
          console.log(`[Thumbnail] Attempting exifr thumbnail extraction for: ${filename}`);

          // Extract the embedded JPEG thumbnail/preview from the HEIC file
          // Note: exifr.thumbnail() takes only a path argument and returns a Buffer directly
          const thumbnailBuffer = await exifr.thumbnail(photoPath);

          if (thumbnailBuffer && thumbnailBuffer.length > 10) {
            // thumbnail() may return Uint8Array; convert to Buffer for sharp compatibility
            let jpegData: Buffer;
            if (thumbnailBuffer instanceof Buffer) {
              jpegData = thumbnailBuffer;
            } else {
              jpegData = Buffer.from(thumbnailBuffer);
            }

            // Try to resize through sharp if needed to match requested size
            await sharp(jpegData)
              .resize(size, size, {
                fit: 'inside',
                withoutEnlargement: true,
              })
              .jpeg({ 
                quality: 85,
                mozjpeg: true,
              })
              .toFile(thumbnailPath);

            // Validate the generated file
            if (existsSync(thumbnailPath)) {
              const thumbStats = await stat(thumbnailPath);
              if (thumbStats.size > 0) {
                console.log(`[Thumbnail] exifr thumbnail extraction succeeded: ${thumbnailPath}`);
                return thumbnailPath;
              }
            }
          }

          console.warn(`[Thumbnail] exifr thumbnail extraction failed for: ${filename}`);
        } catch (exifrError) {
          const exifrErrorMsg = exifrError instanceof Error ? exifrError.message : String(exifrError);
          console.error(`[Thumbnail] exifr thumbnail also failed for ${filename}: ${exifrErrorMsg}`);
        }

        // If all attempts fail, return null
        console.warn(
          `[Thumbnail] All HEIC conversion attempts failed for ${filename}. The file may require additional codecs or plugins. Will use full file path as fallback.`
        );
        return null;
      }
      
      // Re-throw other errors
      console.error(`[Thumbnail] Non-HEIC error, re-throwing:`, errorMessage);
      throw sharpError;
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[Thumbnail] Unexpected error generating thumbnail for ${basename(photoPath)}:`, {
      error: errorMessage,
      photoPath,
      errorStack: error instanceof Error ? error.stack : undefined,
    });
    return null;
  }
};

/**
 * Generates thumbnails for multiple photos in batch
 * @param photoPaths - Array of photo paths
 * @param size - Thumbnail size (default: 300px)
 * @param onProgress - Optional callback for progress updates
 * @returns Map of photo paths to thumbnail paths
 */
export const generateThumbnailsBatch = async (
  photoPaths: string[],
  size: number = 300,
  onProgress?: (progress: { current: number; total: number }) => void
): Promise<Map<string, string | null>> => {
  const thumbnailMap = new Map<string, string | null>();

  for (let i = 0; i < photoPaths.length; i++) {
    const photoPath = photoPaths[i];
    const thumbnailPath = await generateThumbnail(photoPath, size);
    thumbnailMap.set(photoPath, thumbnailPath);

    if (onProgress) {
      onProgress({
        current: i + 1,
        total: photoPaths.length,
      });
    }
  }

  return thumbnailMap;
};
