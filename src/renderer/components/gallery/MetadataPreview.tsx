import { MapPin, Calendar, Camera } from 'lucide-react';
import type { Photo } from '../../../shared/types/photo';

export interface MetadataPreviewProps {
  photo: Photo | null;
}

/**
 * Metadata preview component shown on photo hover
 * Displays date, location, and camera information
 */
const MetadataPreview = ({ photo }: MetadataPreviewProps) => {
  if (!photo || !photo.metadata) return null;

  const formatDate = (date?: Date) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatLocation = (location?: {
    latitude: number;
    longitude: number;
  }) => {
    if (!location) return null;
    return `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`;
  };

  const formatCamera = (camera?: { make?: string; model?: string }) => {
    if (!camera) return null;
    const parts = [camera.make, camera.model].filter(Boolean);
    return parts.length > 0 ? parts.join(' ') : null;
  };

  return (
    <div className="p-4 min-w-[200px] space-y-2">
      <div className="space-y-1">
        {photo.metadata.date && (
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-neutral-400" />
            <span className="text-[var(--text-primary)]">
              {formatDate(photo.metadata.date)}
            </span>
          </div>
        )}
        {photo.metadata.location && (
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="w-4 h-4 text-primary" />
            <span className="text-[var(--text-primary)]">
              {formatLocation(photo.metadata.location)}
            </span>
          </div>
        )}
        {photo.metadata.camera && (
          <div className="flex items-center gap-2 text-sm">
            <Camera className="w-4 h-4 text-neutral-400" />
            <span className="text-[var(--text-primary)]">
              {formatCamera(photo.metadata.camera)}
            </span>
          </div>
        )}
      </div>
      <p className="text-xs text-neutral-400 truncate mt-2">{photo.filename}</p>
    </div>
  );
};

export default MetadataPreview;
