import exifr from 'exifr';
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
      ifd0: true,
      // Extract all available data
      translateKeys: false,
      translateValues: false,
    });

    if (!exifData) {
      return null;
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

    // Extract date
    if (exifData.DateTimeOriginal || exifData.DateTime || exifData.CreateDate) {
      const dateString =
        exifData.DateTimeOriginal || exifData.DateTime || exifData.CreateDate;
      if (dateString) {
        metadata.date = new Date(dateString);
      }
    }

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

    // Store all EXIF data for reference
    metadata.exif = exifData;

    return metadata;
  } catch (error) {
    // Only log errors for actual photo files, not metadata files
    const filename = basename(photoPath);
    if (!isMacOSMetadataFile(filename)) {
      console.error(`Error extracting metadata from ${photoPath}:`, error);
    }
    return null;
  }
};
