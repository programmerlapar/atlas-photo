import { useMemo } from 'react';
import PhotoCard from './PhotoCard';
import type { Photo } from '../../../shared/types/photo';

export interface PhotoGridProps {
  photos: Photo[];
  onPhotoClick?: (photo: Photo) => void;
  onPhotoHover?: (photo: Photo | null) => void;
  selectedPhotoIds?: string[];
  selectionMode?: boolean;
  onToggleSelect?: (photo: Photo) => void;
  groupBy?: 'date' | 'location' | 'none';
}

/**
 * Photo grid component with responsive layout and grouping
 * Follows iOS Photos-style design with adaptive columns
 */
const PhotoGrid = ({
  photos,
  onPhotoClick,
  onPhotoHover,
  selectedPhotoIds = [],
  selectionMode = false,
  onToggleSelect,
  groupBy = 'date',
}: PhotoGridProps) => {
  /**
   * Groups photos by date
   */
  const groupedByDate = useMemo(() => {
    if (groupBy !== 'date') return null;

    const groups = new Map<string, Photo[]>();

    photos.forEach((photo) => {
      const date = photo.metadata?.date
        ? new Date(photo.metadata.date).toDateString()
        : 'Unknown Date';

      if (!groups.has(date)) {
        groups.set(date, []);
      }
      groups.get(date)!.push(photo);
    });

    return Array.from(groups.entries()).sort(([a], [b]) => {
      if (a === 'Unknown Date') return 1;
      if (b === 'Unknown Date') return -1;
      return new Date(b).getTime() - new Date(a).getTime();
    });
  }, [photos, groupBy]);

  /**
   * Groups photos by location
   */
  const groupedByLocation = useMemo(() => {
    if (groupBy !== 'location') return null;

    const groups = new Map<string, Photo[]>();

    photos.forEach((photo) => {
      const location = photo.metadata?.location
        ? `${photo.metadata.location.latitude.toFixed(4)}, ${photo.metadata.location.longitude.toFixed(4)}`
        : 'No Location';

      if (!groups.has(location)) {
        groups.set(location, []);
      }
      groups.get(location)!.push(photo);
    });

    return Array.from(groups.entries());
  }, [photos, groupBy]);

  /**
   * Formats date for group header
   */
  const formatGroupDate = (dateString: string) => {
    if (dateString === 'Unknown Date') return dateString;
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    }
    if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }

    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
    });
  };

  if (groupBy === 'date' && groupedByDate) {
    return (
      <div className="space-y-8">
        {groupedByDate.map(([date, groupPhotos]) => (
          <div key={date} className="space-y-4">
            <h3 className="text-lg font-semibold text-[var(--text-primary)] px-2">
              {formatGroupDate(date)}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {groupPhotos.map((photo) => (
                <PhotoCard
                  key={photo.id}
                  photo={photo}
                  onClick={onPhotoClick}
                  onHover={onPhotoHover}
                  isSelected={selectedPhotoIds.includes(photo.id)}
                  selectionMode={selectionMode}
                  onToggleSelect={onToggleSelect}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (groupBy === 'location' && groupedByLocation) {
    return (
      <div className="space-y-8">
        {groupedByLocation.map(([location, groupPhotos]) => (
          <div key={location} className="space-y-4">
            <h3 className="text-lg font-semibold text-[var(--text-primary)] px-2">
              {location === 'No Location'
                ? 'No Location'
                : `Location: ${location}`}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {groupPhotos.map((photo) => (
                <PhotoCard
                  key={photo.id}
                  photo={photo}
                  onClick={onPhotoClick}
                  onHover={onPhotoHover}
                  isSelected={selectedPhotoIds.includes(photo.id)}
                  selectionMode={selectionMode}
                  onToggleSelect={onToggleSelect}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // No grouping - display all photos in a single grid
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
      {photos.map((photo) => (
        <PhotoCard
          key={photo.id}
          photo={photo}
          onClick={onPhotoClick}
          onHover={onPhotoHover}
          isSelected={selectedPhotoIds.includes(photo.id)}
        />
      ))}
    </div>
  );
};

export default PhotoGrid;
