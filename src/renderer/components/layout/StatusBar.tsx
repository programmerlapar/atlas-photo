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
    <div className="glass-surface-2 border-t border-[var(--border-default)] sticky bottom-0 z-10 shadow-l2">
      <div className="flex items-center justify-between h-12 px-6">
        {/* Left section - Counts */}
        <div className="flex items-center gap-6 text-sm text-[var(--text-tertiary)]">
          <div className="flex items-center gap-2">
            <span>{photos.length}</span>
            <span>{photos.length === 1 ? 'photo' : 'photos'}</span>
          </div>
          {photosWithLocation > 0 && (
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span>{photosWithLocation} with location</span>
            </div>
          )}
        </div>

        {/* Right section - Date range */}
        {dateRange && (
          <div className="flex items-center gap-2 text-sm text-[var(--text-tertiary)]">
            <Calendar className="w-4 h-4" />
            <span>{dateRange}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatusBar;
