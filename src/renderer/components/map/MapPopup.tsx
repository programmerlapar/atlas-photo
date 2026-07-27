import { useState } from 'react';
import { MapPin, Calendar, ImageOff } from 'lucide-react';
import { encodeFilePath } from '../../utils/photoId';
import type { Photo } from '../../../shared/types/photo';

export interface MapPopupProps {
  photo: Photo;
  nearbyCount?: number;
  onClick?: () => void;
}

/**
 * Map popup component shown when clicking a marker
 * Displays photo preview and metadata
 */
const MapPopup = ({ photo, nearbyCount = 1, onClick }: MapPopupProps) => {
  const [thumbnailFailed, setThumbnailFailed] = useState(false);
  const formatDate = (date?: Date) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
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

  return (
    <div
      className="rounded-xl border border-[var(--color-neutral-200)] bg-white/95 shadow-[0_14px_35px_rgba(48,48,144,0.16)] p-3 min-w-[200px] space-y-2 cursor-pointer hover:bg-[var(--bg-primary)] transition-smooth"
      onClick={onClick}
    >
      {/* Thumbnail */}
      {photo.thumbnailPath && !thumbnailFailed && (
        <div className="w-full aspect-square rounded-md overflow-hidden mb-2">
          <img
             src={`atlas-photo://${encodeFilePath(photo.thumbnailPath)}`}
            alt={photo.filename}
            className="w-full h-full object-cover"
            onError={() => setThumbnailFailed(true)}
          />
        </div>
      )}
      {(!photo.thumbnailPath || thumbnailFailed) && (
        <div className="w-full aspect-square rounded-md mb-2 bg-gradient-to-br from-[var(--color-primary)]/70 to-[var(--color-secondary)] flex items-center justify-center">
          <ImageOff className="w-8 h-8 text-white/90" />
        </div>
      )}

      {/* Metadata */}
      <div className="space-y-1">
        <p className="text-sm font-semibold text-[var(--text-primary)] truncate">
          {photo.filename}
        </p>
        {photo.metadata?.date && (
          <div className="flex items-center gap-2 text-xs text-[var(--text-tertiary)]">
            <Calendar className="w-3 h-3" />
            <span>{formatDate(photo.metadata.date)}</span>
          </div>
        )}
        {photo.metadata?.location && (
          <div className="flex items-center gap-2 text-xs text-primary">
            <MapPin className="w-3 h-3" />
            <span>{formatLocation(photo.metadata.location)}</span>
          </div>
        )}
        {nearbyCount > 1 && (
          <p className="text-xs font-medium text-[var(--color-primary-mid)]">
            Latest of {nearbyCount} photos in this area
          </p>
        )}
      </div>

      {/* Click hint */}
      <p className="text-xs text-[var(--text-muted)] text-center mt-2">Click to view</p>
    </div>
  );
};

export default MapPopup;
