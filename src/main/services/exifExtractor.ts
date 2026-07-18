import exifr from 'exifr';
import { stat } from 'fs/promises';
import { basename } from 'path';
import { isMacOSMetadataFile } from '../../shared/constants/fileTypes';
import type {
  PhotoMetadata,
  Location,
  CameraInfo,
} from '../../shared/types/photo';

/**
 * Extracts EXIF metadata from a photo file
 * @param photoPath - Path to the photo file
 * @returns Photo metadata including GPS location, camera info, and date
 */
export const extractPhotoMetadata = async (
  photoPath: string
): Promise<PhotoMetadata | null> => {
  try {
    // Skip macOS metadata files
    const filename = basename(photoPath);
    if (isMacOSMetadataFile(filename)) {
      return null;
    }
    const exifData = await exifr.parse(photoPath, {
      // Extract GPS coordinates
      gps: true,
      // Extract camera information
      exif: true,
      // Extract date/time
      ifd0: {},
      // Extract all available data
      translateKeys: true,
      translateValues: false,
      reviveValues: true,
    });

    if (!exifData) {
      return getFilesystemDate(photoPath);
    }

    const metadata: PhotoMetadata = {};

    // Extract GPS location
    if (exifData.latitude && exifData.longitude) {
      const location: Location = {
        latitude: exifData.latitude,
        longitude: exifData.longitude,
      };

      if (exifData.GPSAltitude) {
        location.altitude = exifData.GPSAltitude;
      }

      metadata.location = location;
    }

    // Exifr revives the standard EXIF values to Date instances when keys are
    // translated. Standard EXIF covers the normal camera/HEIC path without
    // paying the cost of parsing the much larger XMP block for every photo.
    const data = exifData as Record<string, unknown>;
    const date = findValidDate(
      data.DateTimeOriginal,
      data.DateTimeDigitized,
      data.CreateDate,
      data.DateTime,
      data.ModifyDate,
      data.MediaCreateDate,
      data.TrackCreateDate,
      data.DateCreated
    );
    metadata.date = date ?? (await getFilesystemDate(photoPath))?.date;

    // Extract camera information
    if (exifData.Make || exifData.Model) {
      const camera: CameraInfo = {};

      if (exifData.Make) {
        camera.make = String(exifData.Make);
      }

      if (exifData.Model) {
        camera.model = String(exifData.Model);
      }

      if (exifData.ISO) {
        camera.iso = Number(exifData.ISO);
      }

      if (exifData.FNumber) {
        camera.aperture = `f/${exifData.FNumber}`;
      }

      if (exifData.ExposureTime) {
        camera.shutterSpeed = `${exifData.ExposureTime}s`;
      }

      if (exifData.FocalLength) {
        camera.focalLength = `${exifData.FocalLength}mm`;
      }

      if (Object.keys(camera).length > 0) {
        metadata.camera = camera;
      }
    }

    // Keep Detail's EXIF reference compact. Persisting the entire raw/XMP
    // payload for hundreds of files made index writes and navigation sluggish.
    metadata.exif = Object.fromEntries(
      Object.entries(data).filter(([key]) => [
        'DateTimeOriginal', 'DateTimeDigitized', 'CreateDate', 'DateTime', 'ModifyDate',
        'Make', 'Model', 'ISO', 'FNumber', 'ExposureTime', 'FocalLength',
        'latitude', 'longitude', 'GPSAltitude',
      ].includes(key))
    );

    return metadata;
  } catch (error) {
    // Only log errors for actual photo files, not metadata files
    const filename = basename(photoPath);
    if (!isMacOSMetadataFile(filename)) {
      console.error(`Error extracting metadata from ${photoPath}:`, error);
    }
    return getFilesystemDate(photoPath);
  }
};

const findValidDate = (...values: unknown[]): Date | undefined => {
  for (const value of values) {
    const date = value instanceof Date ? value : new Date(String(value));
    if (Number.isFinite(date.getTime())) return date;
  }
  return undefined;
};

/** Last-resort grouping date when a source genuinely contains no capture EXIF. */
const getFilesystemDate = async (photoPath: string): Promise<PhotoMetadata | null> => {
  try {
    const fileStats = await stat(photoPath);
    const timestamp = fileStats.birthtimeMs > 0 ? fileStats.birthtimeMs : fileStats.mtimeMs;
    return Number.isFinite(timestamp) ? { date: new Date(timestamp) } : null;
  } catch {
    return null;
  }
};
