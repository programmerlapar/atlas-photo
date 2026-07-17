import { Calendar, MapPin } from 'lucide-react';
import type { Photo } from '../../../shared/types/photo';

export interface StatusBarProps {
  photos: Photo[];
}

/**
 * Status bar component showing photo statistics
 * Displays photo count, location count, and date range
 */
const StatusBar = ({ photos }: StatusBarProps) => {
  const photosWithLocation = photos.filter(
    (photo) => photo.metadata?.location !== undefined
  ).length;

  const dates = photos
    .map((photo) => photo.metadata?.date)
    .filter((date): date is Date => date !== undefined)
    .sort((a, b) => a.getTime() - b.getTime());

  const dateRange =
    dates.length > 0
      ? `${dates[0].toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })} - ${dates[dates.length - 1].toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })}`
      : null;

  return (
    <footer className="photos-status" aria-label="Photo collection summary">
      <p className="photos-status-primary">
        {photos.length} {photos.length === 1 ? 'photo' : 'photos'}
      </p>
      <div className="photos-status-secondary">
        {photosWithLocation > 0 && (
          <span>
            <MapPin className="h-3.5 w-3.5" />
            {photosWithLocation} with location
          </span>
        )}
        {dateRange && (
          <span>
            <Calendar className="h-3.5 w-3.5" />
            {dateRange}
          </span>
        )}
      </div>
    </footer>
  );
};

export default StatusBar;
