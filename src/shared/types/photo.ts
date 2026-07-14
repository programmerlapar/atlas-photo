/**
 * Shared photo type definitions
 */
export interface Photo {
  id: string;
  path: string;
  filename: string;
  thumbnailPath?: string;
  metadata?: PhotoMetadata;
}

export interface PhotoMetadata {
  date?: Date;
  location?: Location;
  camera?: CameraInfo;
  exif?: Record<string, unknown>;
}

export interface Location {
  latitude: number;
  longitude: number;
  altitude?: number;
}

export interface CameraInfo {
  make?: string;
  model?: string;
  iso?: number;
  aperture?: string;
  shutterSpeed?: string;
  focalLength?: string;
}
