import { MapPin, Calendar } from 'lucide-react';
import { encodeFilePath } from '../../utils/photoId';
import type { Photo } from '../../../shared/types/photo';

export interface MapPopupProps {
  photo: Photo;
  onClick?: () => void;
}

/**
 * Map popup component shown when clicking a marker
 * Displays photo preview and metadata
 */
const MapPopup = ({ photo, onClick }: MapPopupProps) => {
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
      className="glass-surface-2 rounded-md shadow-l2 p-3 min-w-[200px] space-y-2 cursor-pointer hover:bg-white/5 transition-smooth"
      onClick={onClick}
    >
      {/* Thumbnail */}
      {photo.thumbnailPath && (
        <div className="w-full aspect-square rounded-md overflow-hidden mb-2">
          <img
            src={`photomap://${encodeFilePath(photo.thumbnailPath)}`}
            alt={photo.filename}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Metadata */}
      <div className="space-y-1">
        <p className="text-sm font-semibold text-[var(--text-primary)] truncate">
          {photo.filename}
        </p>
        {photo.metadata?.date && (
          <div className="flex items-center gap-2 text-xs text-neutral-400">
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
      </div>

      {/* Click hint */}
      <p className="text-xs text-neutral-400 text-center mt-2">Click to view</p>
    </div>
  );
};

export default MapPopup;
